'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { phCapture, phDistinctId } from '@/components/PostHogProvider';
import type { Locale } from '@/lib/constants';
import { INPUT_LIMITS, type InputType, type QuestionId } from '@/lib/constants';

/** Draft autosave key — survives an interrupted commute (mobile audit). */
const DRAFT_KEY = 'gtos_material_draft';
import { labelFor } from '@/lib/taxonomy';
import type {
  ConsentContent,
  ErrorsContent,
  FlowContent,
  QuestionsContent,
  ShareContent,
} from '@/content/schema';
import type { ExtractedProfile, UserEdits } from '@/lib/types';
import { ProgressStages } from './ProgressStages';
import { LineActions } from './LineActions';
import { SaveForLater } from './SaveForLater';
import { QuickRead, mapQuick } from './QuickRead';

type Phase = 'input' | 'extracting' | 'confirm' | 'questions' | 'generating' | 'quick' | 'quick_result';

/** Tab display order — lowest-friction paste first; CV-PDF (biggest drop-off) last. */
const TAB_ORDER: InputType[] = ['notes_paste', 'linkedin_paste', 'cv_pdf', 'voice_transcript'];

/**
 * Material-step chrome that the content contract has no keys for yet.
 *
 * Same rule as `QUICK_UI` in `QuickRead.tsx`: wayfinding and privacy-fact
 * strings live here only until `FlowContent` is next opened. None of them
 * carries a price, a number we do not own, or a promise about what a human
 * does with the material — `privacyAccess` is deliberately a statement about
 * *permissions*, not about reading.
 */
const MATERIAL_UI: Record<
  Locale,
  {
    privacyAccess: string;
    privacyRetention: string;
    privacyMore: string;
    thresholdHint: string;
    countEmpty: string;
    countReady: string;
    dataDetails: string;
  }
> = {
  'zh-TW': {
    privacyAccess: '只有 Michael 本人有權限查看你貼上的內容。',
    privacyRetention: '原始素材 90 天後自動刪除。',
    privacyMore: '完整說明',
    thresholdHint: '兩三句話就夠：你現在做什麼、想去哪裡、卡在哪一步。最少 {min} 字。',
    countEmpty: '0 / {min} 字・大約三到四句話就夠',
    countReady: '・已達門檻，可以送出',
    dataDetails: '你的資料會怎麼被處理',
  },
  en: {
    privacyAccess: 'Only Michael has access to what you paste.',
    privacyRetention: 'Raw material is deleted automatically after 90 days.',
    privacyMore: 'Full details',
    thresholdHint:
      'Two or three sentences is enough: what you do now, where you want to go, and where you are stuck. {min} characters minimum.',
    countEmpty: '0 / {min} characters — about two or three sentences',
    countReady: ' — long enough, you can submit',
    dataDetails: 'How your material is handled',
  },
};

interface QView {
  id: QuestionId;
  label: string;
  type: 'select' | 'text';
  options?: { value: string; label: string }[];
  placeholder?: string;
}

export interface IntakeFlowProps {
  locale: Locale;
  flow: FlowContent;
  consent: ConsentContent;
  questions: QuestionsContent;
  errors: ErrorsContent;
  share: ShareContent;
  privacyHref: string;
  sampleHref: string;
  sampleLabel: string;
}

/**
 * Put the user on the thing that stopped the submit.
 *
 * A failed click used to be almost silent: the page did not move, focus stayed
 * on the button, the button's own appearance did not change, and on the CV tab
 * nothing scrolled at all — the error rendered 441px above the fold on a 375px
 * screen. Every failure path now ends here, so the blocking control is both
 * scrolled into view and focused (keyboard and screen-reader users land on it
 * too, not just the sighted thumb).
 *
 * Order matters and is not obvious: measured in Chrome, a `focus()` that lands
 * *after* `scrollIntoView({behavior:'smooth'})` aborts the animation, even with
 * `preventScroll: true` — the caret moved and the page did not, which is the
 * exact bug this function exists to fix. Focus first (silently), then scroll.
 * The timeout lets React commit the error node, which shifts layout, before we
 * measure against it.
 */
function moveToBlocker(id: string) {
  setTimeout(() => {
    const el = document.getElementById(id);
    if (!(el instanceof HTMLElement)) return;
    el.focus({ preventScroll: true });
    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, 0);
}

function track(name: string, session_token: string | null, props: Record<string, string | number | boolean> = {}) {
  phCapture(name, props); // mirror first-party client events into PostHog (separate sink)
  try {
    void fetch('/api/mri/event', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ name, session_token, props }),
      keepalive: true,
    });
  } catch {
    /* analytics best-effort */
  }
}

export function MriIntakeFlow(props: IntakeFlowProps) {
  const { locale, flow, consent, questions, errors } = props;
  const router = useRouter();

  const [phase, setPhase] = useState<Phase>('input');
  const [inputType, setInputType] = useState<InputType>('notes_paste');
  const [text, setText] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [consentProcessing, setConsentProcessing] = useState(false);
  const [consentAggregate, setConsentAggregate] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const [token, setToken] = useState<string | null>(null);
  const [profile, setProfile] = useState<ExtractedProfile | null>(null);
  const [edits, setEdits] = useState<UserEdits>({});
  const [qs, setQs] = useState<QView[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [quickAnswers, setQuickAnswers] = useState<Record<string, string>>({});

  const minChars = locale === 'zh-TW' ? INPUT_LIMITS.minCharsZh : INPUT_LIMITS.minCharsEn;
  const textOk = text.trim().length >= minChars;
  const inputReady =
    consentProcessing && (inputType === 'cv_pdf' ? Boolean(file) : textOk);

  /**
   * `mri_started` fires on the first real interaction, not on mount.
   *
   * It used to fire in an effect at mount, which made it a synonym for "the
   * /mri URL was opened" — so every conversion rate computed against it was
   * wrong, and the 2026-07 audit had to throw the number out. One person can
   * only start once per mount; `startedRef` guards React StrictMode's double
   * invoke and any re-render.
   */
  const startedRef = useRef(false);
  const markStarted = useCallback(
    (trigger: 'tab' | 'typing' | 'file' | 'quick' | 'consent') => {
      if (startedRef.current) return;
      startedRef.current = true;
      phCapture('mri_started', { locale, trigger });
    },
    [locale],
  );

  // Restore an interrupted draft once on mount (mobile audit: reload used to wipe it).
  useEffect(() => {
    try {
      const saved = localStorage.getItem(DRAFT_KEY);
      if (saved) setText((cur) => (cur ? cur : saved));
    } catch {
      /* storage unavailable — no-op */
    }
  }, []);

  // Autosave the material draft as the user types.
  useEffect(() => {
    try {
      if (text.trim()) localStorage.setItem(DRAFT_KEY, text);
    } catch {
      /* no-op */
    }
  }, [text]);

  /* ------------------------------- submit ------------------------------- */
  async function handleSubmit() {
    setError(null);
    if (!inputReady) {
      // Walkthrough F3: the button used to be disabled in this state, so these
      // errors were unreachable and a not-ready click gave zero feedback (the
      // /mri rageclick hotspot). The click now names the blocker and moves you to it.
      //
      // Order follows the page, not the old code: the material field is the
      // first control on the step, the consent tick sits under it. When both
      // are unmet we send you to the first one, never past it.
      const materialMissing = inputType === 'cv_pdf' ? !file : !textOk;
      if (materialMissing) {
        setError(inputType === 'cv_pdf' ? errors.fileMissing : errors.tooShort);
        moveToBlocker(inputType === 'cv_pdf' ? 'cv-picker' : 'material-input');
      } else {
        setError(errors.consentRequired);
        moveToBlocker('consent-processing');
      }
      return;
    }
    setBusy(true);
    setPhase('extracting');
    phCapture('material_submitted', { input_type: inputType, locale });
    try {
      let res: Response;
      if (inputType === 'cv_pdf' && file) {
        const fd = new FormData();
        fd.set('locale', locale);
        fd.set('inputType', inputType);
        fd.set('consentProcessing', 'true');
        fd.set('consentAggregate', String(consentAggregate));
        fd.set('file', file);
        res = await fetch('/api/mri/submit', { method: 'POST', body: fd });
      } else {
        res = await fetch('/api/mri/submit', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({
            locale,
            inputType,
            rawText: text.trim(),
            consentProcessing: true,
            consentAggregate,
          }),
        });
      }
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setError(body.detail ?? errors.extractionFailed);
        setPhase('input');
        moveToBlocker('input-error');
        return;
      }
      const data = (await res.json()) as { session_token: string; profile: ExtractedProfile };
      setToken(data.session_token);
      setProfile(data.profile);
      try {
        localStorage.setItem('gtos_report_token', data.session_token);
        localStorage.removeItem(DRAFT_KEY); // submitted — draft no longer needed
      } catch {
        /* ignore */
      }
      setEdits({
        current_role: data.profile.identity.current_role ?? undefined,
        current_org: data.profile.identity.current_org ?? undefined,
      });
      setPhase('confirm');
    } catch {
      setError(errors.generic);
      setPhase('input');
      moveToBlocker('input-error');
    } finally {
      setBusy(false);
    }
  }

  /* ------------------------------- confirm ------------------------------ */
  async function handleConfirm() {
    if (!token) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch('/api/mri/confirm', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ session_token: token, edits: cleanEdits(edits) }),
      });
      if (!res.ok) {
        setError(errors.generic);
        return;
      }
      const data = (await res.json()) as { questions: QView[] };
      setQs(data.questions);
      setPhase('questions');
      phCapture('profile_confirmed', { locale });
    } catch {
      setError(errors.generic);
    } finally {
      setBusy(false);
    }
  }

  /* ------------------------------- answers ------------------------------ */
  const emailValid = /.+@.+\..+/.test(email);
  async function handleAnswers() {
    if (!token) return;
    if (!emailValid) {
      setError(errors.emailInvalid);
      return;
    }
    setBusy(true);
    setError(null);
    setPhase('generating');
    try {
      const payload = {
        session_token: token,
        email: email.trim(),
        name: name.trim() || undefined,
        answers: qs
          .filter((q) => (answers[q.id] ?? '').trim())
          .map((q) => ({ question_id: q.id, answer: answers[q.id].trim() })),
      };
      const res = await fetch('/api/mri/answers', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ ...payload, distinct_id: phDistinctId() || undefined }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setError(body.detail ?? errors.generic);
        setPhase('questions');
        return;
      }
      phCapture('questions_submitted', { locale });
      router.push(`/${locale}/result/${token}`);
    } catch {
      setError(errors.generic);
      setPhase('questions');
    } finally {
      setBusy(false);
    }
  }

  /* -------------------------------- views ------------------------------- */
  if (phase === 'extracting')
    return <ProgressStages title={flow.progress.extraction.title} stages={flow.progress.extraction.stages} />;
  if (phase === 'generating')
    return (
      <div>
        <ProgressStages
          title={flow.progress.report.title}
          stages={flow.progress.report.stages}
          note={flow.progress.report.note}
        />
        {/* Safe exit for the commute audience: the result URL is already known
            here and generation finishes server-side even if the page dies. */}
        {token && (
          <LineActions
            title={flow.line.generatingHint}
            saveLabel={flow.line.saveCta}
            shareText={flow.line.shareTextReport}
            sharePath={`/${locale}/result/${token}?utm_source=line_self&utm_medium=save`}
            context="generating"
          />
        )}
      </div>
    );

  if (phase === 'quick' || phase === 'quick_result')
    return (
      <QuickRead
        locale={locale}
        flow={flow}
        share={props.share}
        answers={quickAnswers}
        setAnswers={setQuickAnswers}
        showResult={phase === 'quick_result'}
        onShowResult={() => {
          const category = mapQuick(quickAnswers);
          phCapture('quick_completed', {
            locale,
            category,
            market: quickAnswers.q4 ?? '',
            sector: quickAnswers.q5 ?? '',
          });
          setPhase('quick_result');
        }}
        onFull={() => {
          phCapture('quick_to_full_clicked', { locale });
          setPhase('input');
        }}
        // Wayfinding only — no tracking, no reset. `quickAnswers` lives up here
        // and is never cleared, so leaving the quick read and coming back (or
        // stepping off the result to change one tap) keeps every answer.
        onBack={() => setPhase('input')}
        onEditAnswers={() => setPhase('quick')}
      />
    );

  return (
    <div>
      <StepIndicator flow={flow} phase={phase} />
      {/* The same error string used to render twice on the input step — here and
          again beside the submit button, roughly 2,050px apart. Worse, the copy
          is written from the button's vantage point ("tick the processing
          consent ABOVE"), which is true down there and backwards up here, where
          the consent box is two screens BELOW. The input step owns its own error
          slot; this banner now only covers confirm/questions, which have none. */}
      {error && phase !== 'input' && (
        <p
          role="alert"
          className="mt-4 max-w-[37rem] rounded-xl border border-line bg-mist px-4 py-3 text-sm text-ink"
        >
          {error}
        </p>
      )}

      {phase === 'input' && (
        <InputStep
          flow={flow}
          consent={consent}
          errors={errors}
          error={error}
          locale={locale}
          privacyHref={props.privacyHref}
          sampleHref={props.sampleHref}
          inputType={inputType}
          setInputType={(t) => {
            markStarted('tab');
            setInputType(t);
            track('input_method_selected', token, { input_type: t });
          }}
          text={text}
          setText={(v: string) => {
            if (v.trim().length > 0) markStarted('typing');
            setText(v);
          }}
          file={file}
          setFile={(f: File | null) => {
            if (f) markStarted('file');
            setFile(f);
          }}
          consentProcessing={consentProcessing}
          setConsentProcessing={(v: boolean) => {
            if (v) markStarted('consent');
            setConsentProcessing(v);
          }}
          consentAggregate={consentAggregate}
          setConsentAggregate={setConsentAggregate}
          inputReady={inputReady}
          busy={busy}
          onSubmit={handleSubmit}
          onQuick={() => {
            markStarted('quick');
            phCapture('quick_started', { locale });
            setPhase('quick');
          }}
        />
      )}

      {phase === 'confirm' && profile && (
        <ConfirmStep
          flow={flow}
          locale={locale}
          profile={profile}
          edits={edits}
          setEdits={setEdits}
          busy={busy}
          onConfirm={handleConfirm}
        />
      )}

      {phase === 'questions' && (
        <QuestionsStep
          questions={questions}
          qs={qs}
          answers={answers}
          setAnswers={setAnswers}
          email={email}
          setEmail={setEmail}
          name={name}
          setName={setName}
          emailValid={emailValid}
          busy={busy}
          onSubmit={handleAnswers}
          sampleHref={props.sampleHref}
          sampleLabel={props.sampleLabel}
        />
      )}
    </div>
  );
}

/* ------------------------------- sub-views -------------------------------- */

function StepIndicator({ flow, phase }: { flow: FlowContent; phase: Phase }) {
  const steps = [
    { key: 'input', label: flow.stepIndicator.input },
    { key: 'confirm', label: flow.stepIndicator.confirm },
    { key: 'questions', label: flow.stepIndicator.questions },
  ];
  const activeIdx = phase === 'input' ? 0 : phase === 'confirm' ? 1 : 2;
  return (
    <ol className="flex gap-6 text-sm">
      {steps.map((s, i) => (
        <li key={s.key} className="flex items-center gap-2">
          <span
            className={
              i <= activeIdx
                ? 'flex h-6 w-6 items-center justify-center rounded-full bg-pine text-paper text-xs'
                : // was text-line/border-line: 1.26:1, so on the funnel's first screen
                  // the "there are two more steps" signal was invisible.
                  'flex h-6 w-6 items-center justify-center rounded-full border border-ink-soft/40 text-ink-soft text-xs'
            }
          >
            {i + 1}
          </span>
          <span className={i <= activeIdx ? 'text-ink' : 'text-ink-soft'}>{s.label}</span>
        </li>
      ))}
    </ol>
  );
}

function InputStep(p: {
  flow: FlowContent;
  consent: ConsentContent;
  errors: ErrorsContent;
  error: string | null;
  locale: Locale;
  privacyHref: string;
  sampleHref: string;
  inputType: InputType;
  setInputType: (t: InputType) => void;
  text: string;
  setText: (v: string) => void;
  file: File | null;
  setFile: (f: File | null) => void;
  consentProcessing: boolean;
  setConsentProcessing: (v: boolean) => void;
  consentAggregate: boolean;
  setConsentAggregate: (v: boolean) => void;
  inputReady: boolean;
  busy: boolean;
  onSubmit: () => void;
  onQuick: () => void;
}) {
  const tab = p.flow.inputTabs[p.inputType];
  const ui = MATERIAL_UI[p.locale];
  const min = p.locale === 'zh-TW' ? INPUT_LIMITS.minCharsZh : INPUT_LIMITS.minCharsEn;
  const len = p.text.trim().length;
  const isPdf = p.inputType === 'cv_pdf';
  /**
   * `SaveForLater` posts an email address and nothing else — not the draft, not
   * the file. Rendering it beside a textarea someone has already filled in is a
   * lie by placement: it answers "sent, you can close this page" while their
   * 83 pasted characters go nowhere. It belongs to the empty state only, where
   * it is exactly what it claims: a way out for people with nothing on hand.
   */
  const nothingEntered = len === 0 && !p.file;
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  return (
    <div className="mt-8">
      <h1 className="text-3xl font-semibold leading-tight text-balance sm:text-4xl">{p.flow.intro.title}</h1>
      <p className="mt-2 text-ink-soft">{p.flow.intro.body}</p>
      <p className="mt-3 max-w-[35rem] text-sm text-ink-soft">{p.flow.intro.reassure}</p>
      <a
        href={p.sampleHref}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-2 inline-block text-sm font-medium text-pine underline-offset-2 hover:underline"
      >
        {p.flow.intro.sampleCta}
      </a>

      {/* Zero-typing front door (walkthrough F2): 9/123 found the below-fold text
          link; all 9 finished and 5 took the full MRI. Promoted above the paste
          wall so the "wrong moment" majority gets an action inside screen one. */}
      <div className="mt-6 rounded-xl border border-sage bg-sage-soft/30 px-5 py-4">
        <p className="font-medium">{p.flow.quick.entryTitle}</p>
        <p className="mt-1 max-w-[35rem] text-sm text-ink-soft">{p.flow.quick.entryBody}</p>
        <button
          type="button"
          onClick={p.onQuick}
          className="mt-3 inline-flex min-h-[44px] items-center rounded-lg bg-pine px-5 py-2.5 text-sm text-paper"
        >
          {p.flow.quick.entryButton}
        </button>
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        {TAB_ORDER.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => p.setInputType(t)}
            className={
              t === p.inputType
                ? 'inline-flex min-h-[44px] items-center rounded-full bg-pine px-4 py-2.5 text-sm text-paper'
                : 'inline-flex min-h-[44px] items-center rounded-full border border-line px-4 py-2.5 text-sm text-ink-soft hover:border-pine'
            }
          >
            {p.flow.inputTabs[t].tab}
          </button>
        ))}
      </div>

      <p className="mt-3 max-w-[35rem] text-sm text-ink-soft">{tab.hint}</p>

      {/* The 80-character floor is the single most reassuring fact on the page —
          two or three sentences clears it — and it used to exist only inside a
          failure message. It is now stated before anyone types, outside the
          field: a placeholder would vanish on the first keystroke, exactly when
          the person is still deciding whether they have enough to say. */}
      {!isPdf && (
        <p className="mt-2 max-w-[35rem] text-sm text-ink-soft">
          {ui.thresholdHint.replace('{min}', String(min))}
        </p>
      )}

      {/* Pre-upload privacy, permanently visible and never inside the fold-away
          block below: who has access, and how long the raw material lives.
          Both are statements of fact about permission and retention — not a
          claim about what any human reads. */}
      <div className="mt-4 max-w-[35rem] space-y-1 text-sm text-ink-soft">
        <p>{ui.privacyAccess}</p>
        <p>
          {ui.privacyRetention}{' '}
          <a
            href={p.privacyHref}
            className="text-pine underline underline-offset-2 hover:text-pine-deep"
          >
            {ui.privacyMore}
          </a>
        </p>
      </div>

      {isPdf ? (
        <div className="mt-3">
          <input
            ref={fileInputRef}
            type="file"
            accept="application/pdf"
            className="hidden"
            onChange={(e) => p.setFile(e.target.files?.[0] ?? null)}
          />
          {p.file ? (
            <div className="rounded-xl border border-dashed border-line bg-mist/40 px-5 py-6 text-center">
              <p className="text-sm">
                {p.flow.pdf.selected} {p.file.name}
              </p>
              <div className="mt-3 flex flex-wrap justify-center gap-3">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex min-h-[44px] items-center rounded-lg border border-pine px-4 py-2 text-sm text-pine"
                >
                  {p.flow.pdf.chooseFile}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    p.setFile(null);
                    if (fileInputRef.current) fileInputRef.current.value = '';
                  }}
                  className="inline-flex min-h-[44px] items-center rounded-lg border border-line px-4 py-2 text-sm text-ink-soft hover:border-pine"
                >
                  {p.flow.pdf.remove}
                </button>
              </div>
            </div>
          ) : (
            /* The dashed box was a plain <div>. The only clickable thing inside
               it was a 229x19px run of grey text, the same colour as body copy,
               no underline, nothing button-shaped — and phones cannot drag, so
               the entire CV path hung off those 19 vertical pixels. The box
               itself is now the control, with a real button inside it, and the
               drop target is real too: the old copy promised drag-and-drop that
               no handler implemented, so a dropped file navigated the browser
               away from the page. "Drop it here" is hidden on narrow screens
               where it can never be true. */
            <button
              type="button"
              id="cv-picker"
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => {
                e.preventDefault();
                setDragging(true);
              }}
              // dragleave bubbles, so crossing from the box onto the button
              // inside it would otherwise strobe the highlight off and on
              onDragLeave={(e) => {
                if (e.currentTarget.contains(e.relatedTarget as Node | null)) return;
                setDragging(false);
              }}
              onDrop={(e) => {
                e.preventDefault();
                setDragging(false);
                const dropped = e.dataTransfer.files?.[0];
                if (dropped) p.setFile(dropped);
              }}
              className={
                dragging
                  ? 'flex w-full cursor-pointer flex-col items-center gap-3 rounded-xl border border-dashed border-pine bg-sage-soft/40 px-5 py-8 text-center transition-colors'
                  : 'flex w-full cursor-pointer flex-col items-center gap-3 rounded-xl border border-dashed border-line bg-mist/40 px-5 py-8 text-center transition-colors hover:border-pine hover:bg-mist/60'
              }
            >
              <span className="hidden text-sm text-ink-soft sm:block">{p.flow.pdf.dropLabel}</span>
              <span className="inline-flex min-h-[44px] items-center rounded-lg bg-pine px-5 py-2.5 text-sm text-paper">
                {p.flow.pdf.chooseFile}
              </span>
            </button>
          )}
        </div>
      ) : (
        <div className="mt-3">
          <textarea
            id="material-input"
            // the only name this field had was its placeholder, which disappears
            // the moment anything is typed into it
            aria-label={tab.tab}
            aria-describedby="material-count"
            value={p.text}
            onChange={(e) => p.setText(e.target.value)}
            placeholder={tab.placeholder}
            // was 10: on a 375px screen those extra rows pushed the submit
            // button off the bottom of a second screen. 7 still shows a pasted
            // CV back to the person who pasted it.
            rows={7}
            className="w-full resize-y rounded-lg border border-line bg-paper px-4 py-3 text-ink outline-none focus:border-pine"
          />
          {/* Described-by, not a live region: the counter's text changes on
              every keystroke, so announcing it politely would narrate each
              character typed. The threshold is read once when the field takes
              focus; only crossing it announces, from the quiet status below. */}
          <p
            id="material-count"
            className={
              len === 0
                ? 'mt-1 text-right text-xs text-ink-soft'
                : 'mt-1 text-right text-xs font-medium text-pine'
            }
          >
            {len === 0
              ? ui.countEmpty.replace('{min}', String(min))
              : len < min
                ? p.flow.charCountNeed
                    .replace('{count}', String(len))
                    .replace('{need}', String(min - len))
                : `${p.flow.charCount.replace('{count}', String(len))}${ui.countReady}`}
          </p>
          <span role="status" className="sr-only">
            {len >= min ? ui.countReady : ''}
          </span>
        </div>
      )}

      {/* The one required tick, directly under the field it applies to.
          Everything it used to sit inside — the detail line, the optional
          aggregate opt-in, the retention, access and redaction notes, plus the
          LINE and email escape hatches — is intact one block down, behind a
          summary. Nothing was cut. The commit path simply stopped running
          through 1,100px of ways to leave.

          leading-relaxed: globals.css only gives zh-Hant 1.85 line-height to
          p/li/dd/blockquote, so this sentence (a <span> in a <label>) was set
          TIGHTER than the small print that used to follow it. */}
      <label
        htmlFor="consent-processing"
        className="-ml-2.5 mt-3 flex max-w-[37rem] cursor-pointer items-start gap-1 text-sm leading-relaxed"
      >
        {/* 20x20 was under half the 44px minimum target. The box stays visually
            calm at 24px; the 44x44 wrapper inside the label is the thing a
            thumb actually has to hit. */}
        <span className="flex h-11 w-11 shrink-0 items-center justify-center">
          <input
            id="consent-processing"
            type="checkbox"
            checked={p.consentProcessing}
            onChange={(e) => p.setConsentProcessing(e.target.checked)}
            className="h-6 w-6 shrink-0 cursor-pointer accent-pine"
          />
        </span>
        <span className="py-[11px]">{p.consent.processing.label}</span>
      </label>

      {/* The blocker, named at the point of action — the top-of-page error is two
          screens away from this button (walkthrough F3). tabIndex lets
          moveToBlocker() park focus here when a request fails server-side. */}
      {p.error && (
        <p
          id="input-error"
          role="alert"
          tabIndex={-1}
          className="mt-4 max-w-[37rem] rounded-xl border border-line bg-mist px-4 py-3 text-sm text-ink outline-none"
        >
          {p.error}
        </p>
      )}
      <button
        type="button"
        disabled={p.busy}
        onClick={p.onSubmit}
        className="mt-4 rounded-lg bg-pine px-6 py-3 text-paper transition-opacity disabled:opacity-40"
      >
        {p.flow.submit}
      </button>
      {!p.inputReady && <p className="mt-2 text-xs text-ink-soft">{p.flow.submitHint}</p>}

      {/* Everything that used to stand between the field and this button. Same
          words, same order, one fold down — reachable for the person who wants
          it, out of the way of the person who has already decided. */}
      <details className="mt-8 max-w-[37rem] rounded-xl border border-line bg-mist/30">
        <summary className="cursor-pointer px-5 py-3.5 text-sm font-medium">
          {ui.dataDetails}
        </summary>
        <div className="border-t border-line px-5 py-4">
          <p className="max-w-[35rem] text-sm text-ink-soft">{p.consent.redactHint}</p>
          <p className="mt-2 max-w-[35rem] text-sm text-ink-soft">
            {p.consent.retentionSummary}{' '}
            <a href={p.privacyHref} className="text-pine hover:underline">
              {p.consent.privacyLinkLabel}
            </a>
          </p>
          <p className="mt-2 max-w-[30rem] text-xs text-ink-soft">{p.consent.processing.detail}</p>
          <label
            htmlFor="consent-aggregate"
            className="-ml-2.5 mt-3 flex max-w-[37rem] cursor-pointer items-start gap-1 text-sm leading-relaxed"
          >
            <span className="flex h-11 w-11 shrink-0 items-center justify-center">
              <input
                id="consent-aggregate"
                type="checkbox"
                checked={p.consentAggregate}
                onChange={(e) => p.setConsentAggregate(e.target.checked)}
                className="h-6 w-6 shrink-0 cursor-pointer accent-pine"
              />
            </span>
            <span className="py-[11px]">{p.consent.aggregate.label}</span>
          </label>
          <p className="mt-2 max-w-[30rem] text-xs text-ink-soft">{p.consent.whoSeesIt}</p>
          <p className="mt-2 max-w-[30rem] text-xs text-ink-soft">{p.consent.noAccessNote}</p>

          {/* no-CV escape hatch — the 78% material-step drop is mostly "wrong
              moment", not "no intent"; give the commuter a way to come back or
              hand over via LINE */}
          <LineActions
            title={p.flow.line.noCvTitle}
            body={p.flow.line.noCvBody}
            saveLabel={p.flow.line.saveCta}
            addLabel={p.flow.line.addCta}
            shareText={p.flow.line.shareTextMri}
            sharePath={`/${p.locale}/mri?utm_source=line_self&utm_medium=save`}
            context="material_step"
          />

          {/* email capture out — the reachable-lead version of the escape hatch,
              and only while there is nothing to lose by taking it */}
          {nothingEntered && <SaveForLater locale={p.locale} copy={p.flow.saveLater} />}
        </div>
      </details>
    </div>
  );
}

function ConfirmStep(p: {
  flow: FlowContent;
  locale: Locale;
  profile: ExtractedProfile;
  edits: UserEdits;
  setEdits: (e: UserEdits) => void;
  busy: boolean;
  onConfirm: () => void;
}) {
  const c = p.flow.confirmation;
  const prof = p.profile;
  const set = (patch: Partial<UserEdits>) => p.setEdits({ ...p.edits, ...patch });

  const achievements = prof.career_history.flatMap((r) => r.achievements).slice(0, 3);
  const sectors = prof.green_economy.sectors;
  const domains = prof.green_economy.domains;

  return (
    <div className="mt-8">
      <h1 className="text-3xl font-semibold leading-tight text-balance sm:text-4xl">{c.title}</h1>
      <p className="mt-2 text-ink-soft">{c.intro}</p>

      <div className="mt-6 space-y-5">
        <Field label={c.identityLabel}>
          <div className="grid gap-2 sm:grid-cols-2">
            <input
              className="rounded-lg border border-line bg-paper px-4 py-3 text-sm focus:border-pine outline-none"
              value={p.edits.current_role ?? ''}
              placeholder={c.notDetected}
              onChange={(e) => set({ current_role: e.target.value })}
            />
            <input
              className="rounded-lg border border-line bg-paper px-4 py-3 text-sm focus:border-pine outline-none"
              value={p.edits.current_org ?? ''}
              placeholder={c.notDetected}
              onChange={(e) => set({ current_org: e.target.value })}
            />
          </div>
        </Field>

        <Field label={c.careerLabel}>
          {achievements.length > 0 && (
            <ul className="list-disc space-y-1 pl-5 text-sm text-ink-soft">
              {achievements.map((a, i) => (
                <li key={i}>{a}</li>
              ))}
            </ul>
          )}
          <textarea
            rows={2}
            className="mt-2 w-full rounded-lg border border-line bg-paper px-4 py-3 text-sm focus:border-pine outline-none"
            value={p.edits.career_summary ?? ''}
            placeholder={c.careerEditPlaceholder}
            onChange={(e) => set({ career_summary: e.target.value })}
          />
        </Field>

        <Field label={c.sectorsLabel}>
          {(sectors.length > 0 || domains.length > 0) && (
            <div className="flex flex-wrap gap-2">
              {sectors.map((s) => (
                <Chip key={s}>{labelFor('sectors', s, p.locale)}</Chip>
              ))}
              {domains.map((d) => (
                <Chip key={d}>{labelFor('domains', d, p.locale)}</Chip>
              ))}
            </div>
          )}
          <textarea
            rows={2}
            className="mt-2 w-full rounded-lg border border-line bg-paper px-4 py-3 text-sm focus:border-pine outline-none"
            value={p.edits.sectors_note ?? ''}
            placeholder={c.sectorsEditPlaceholder}
            onChange={(e) => set({ sectors_note: e.target.value })}
          />
        </Field>

        <Field label={c.intentLabel}>
          <textarea
            rows={2}
            className="w-full rounded-lg border border-line bg-paper px-4 py-3 text-sm focus:border-pine outline-none"
            value={p.edits.intent_note ?? prof.intent.target_move ?? ''}
            placeholder={c.notDetected}
            onChange={(e) => set({ intent_note: e.target.value })}
          />
        </Field>
      </div>

      <p className="mt-3 text-xs text-ink-soft">{c.editHint}</p>
      <button
        type="button"
        disabled={p.busy}
        onClick={p.onConfirm}
        className="mt-6 rounded-lg bg-pine px-6 py-3 text-paper disabled:opacity-40"
      >
        {c.confirmCta}
      </button>
    </div>
  );
}

function QuestionsStep(p: {
  questions: QuestionsContent;
  qs: QView[];
  answers: Record<string, string>;
  setAnswers: (a: Record<string, string>) => void;
  email: string;
  setEmail: (v: string) => void;
  name: string;
  setName: (v: string) => void;
  emailValid: boolean;
  busy: boolean;
  onSubmit: () => void;
  sampleHref: string;
  sampleLabel: string;
}) {
  const setA = (id: string, v: string) => p.setAnswers({ ...p.answers, [id]: v });
  // Walkthrough F4: rich material can yield zero follow-ups; promising "three to
  // five questions" over a bare email gate reads as an email harvest.
  const intro = p.qs.length === 0 ? p.questions.introComplete : p.questions.intro;
  return (
    <div className="mt-8">
      <h1 className="text-3xl font-semibold leading-tight text-balance sm:text-4xl">{intro.title}</h1>
      <p className="mt-2 text-ink-soft">{intro.body}</p>

      <div className="mt-6 space-y-6">
        {p.qs.map((q) => (
          <div key={q.id}>
            {/* a <p>, not a <label>: a select question's control is a group of
                buttons, which a <label> cannot be associated with. The group
                below points back at it with aria-labelledby instead. */}
            <p id={`q-${q.id}-label`} className="block text-sm font-medium">
              {q.label}
            </p>
            {q.type === 'select' && q.options ? (
              <div
                role="group"
                aria-labelledby={`q-${q.id}-label`}
                className="mt-2 flex flex-wrap gap-2"
              >
                {q.options.map((o) => (
                  <button
                    key={o.value}
                    type="button"
                    // aria-pressed to match the identical pills in the quick read —
                    // the same control was announced two different ways
                    aria-pressed={p.answers[q.id] === o.value}
                    onClick={() => setA(q.id, o.value)}
                    className={
                      p.answers[q.id] === o.value
                        ? 'inline-flex min-h-[44px] items-center rounded-full bg-pine px-4 py-2.5 text-sm text-paper'
                        : 'inline-flex min-h-[44px] items-center rounded-full border border-line px-4 py-2.5 text-sm text-ink-soft hover:border-pine'
                    }
                  >
                    {o.label}
                  </button>
                ))}
              </div>
            ) : (
              <textarea
                rows={2}
                aria-labelledby={`q-${q.id}-label`}
                value={p.answers[q.id] ?? ''}
                placeholder={q.placeholder}
                onChange={(e) => setA(q.id, e.target.value)}
                className="mt-2 w-full rounded-lg border border-line bg-paper px-4 py-3 text-sm focus:border-pine outline-none"
              />
            )}
          </div>
        ))}
      </div>

      {/* sample report as proof, immediately before the email gate */}
      <a
        href={p.sampleHref}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-8 block text-sm text-pine hover:underline"
      >
        {p.sampleLabel} →
      </a>

      {/* email gate — framed as report delivery (binding O1 copy) */}
      <div className="mt-3 rounded-xl border border-line bg-mist/30 px-5 py-5">
        <h2 className="text-lg font-semibold">{p.questions.emailGate.title}</h2>
        <p className="mt-1 text-sm text-ink-soft">{p.questions.emailGate.body}</p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <div>
            <label className="block text-sm">{p.questions.emailGate.emailLabel}</label>
            <input
              type="email"
              inputMode="email"
              autoComplete="email"
              value={p.email}
              placeholder={p.questions.emailGate.emailPlaceholder}
              onChange={(e) => p.setEmail(e.target.value)}
              className="mt-1 w-full rounded-lg border border-line bg-paper px-4 py-3 text-sm focus:border-pine outline-none"
            />
          </div>
          <div>
            <label className="block text-sm">{p.questions.emailGate.nameLabel}</label>
            <input
              value={p.name}
              placeholder={p.questions.emailGate.namePlaceholder}
              onChange={(e) => p.setName(e.target.value)}
              className="mt-1 w-full rounded-lg border border-line bg-paper px-4 py-3 text-sm focus:border-pine outline-none"
            />
          </div>
        </div>
      </div>

      <button
        type="button"
        disabled={!p.emailValid || p.busy}
        onClick={p.onSubmit}
        className="mt-6 rounded-lg bg-pine px-6 py-3 text-paper disabled:opacity-40"
      >
        {p.questions.submit}
      </button>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-eyebrow text-ink-soft">{label}</p>
      <div className="mt-2">{children}</div>
    </div>
  );
}

function Chip({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full border border-sage bg-sage-soft px-3 py-1 text-sm text-pine-deep">
      {children}
    </span>
  );
}

function cleanEdits(edits: UserEdits): UserEdits | null {
  const out: UserEdits = {};
  for (const [k, v] of Object.entries(edits)) {
    if (typeof v === 'string' && v.trim()) (out as Record<string, string>)[k] = v.trim();
  }
  return Object.keys(out).length ? out : null;
}
