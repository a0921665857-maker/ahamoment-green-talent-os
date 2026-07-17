'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { phCapture, phDistinctId } from '@/components/PostHogProvider';
import type { Locale, ResultCategory } from '@/lib/constants';
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
import { ShareableTypeCard } from './ShareableTypeCard';

type Phase = 'input' | 'extracting' | 'confirm' | 'questions' | 'generating' | 'quick' | 'quick_result';

/** Deterministic four-answer → category read. Rough by design — the quick read
 * trades precision for zero typing; the full pipeline stays the honest one. */
function mapQuick(a: Record<string, string>): ResultCategory {
  const senior = a.q2 === 'y3' || a.q2 === 'y6';
  if (a.q3 === 'mba_q' || a.q1 === 'mba')
    return senior ? 'ready_for_mba_story_sprint' : 'career_positioning_before_mba';
  if (a.q1 === 'student' || a.q2 === 'y0') return 'profile_building_needed';
  if (a.q1 === 'non_sus')
    return senior ? 'high_potential_low_commercial_clarity' : 'profile_building_needed';
  if (a.q3 === 'interview') return 'interview_ready_positioning_weak';
  if (a.q3 === 'no_reply')
    return a.q2 === 'y6' ? 'cv_strong_narrative_weak' : 'strong_profile_weak_story';
  if (a.q3 === 'abroad') return 'climate_career_builder';
  if (a.q3 === 'value')
    return senior ? 'high_potential_low_commercial_clarity' : 'strong_profile_weak_story';
  return 'strong_profile_weak_story';
}

/** Tab display order — lowest-friction paste first; CV-PDF (biggest drop-off) last. */
const TAB_ORDER: InputType[] = ['notes_paste', 'linkedin_paste', 'cv_pdf', 'voice_transcript'];

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

  useEffect(() => {
    phCapture('mri_started', { locale });
  }, [locale]);

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
      if (!consentProcessing) setError(errors.consentRequired);
      else if (inputType !== 'cv_pdf' && !textOk) setError(errors.tooShort);
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
          phCapture('quick_completed', { locale, category, market: quickAnswers.q4 ?? '' });
          setPhase('quick_result');
        }}
        onFull={() => {
          phCapture('quick_to_full_clicked', { locale });
          setPhase('input');
        }}
      />
    );

  return (
    <div>
      <StepIndicator flow={flow} phase={phase} />
      {error && (
        <p className="mt-4 rounded border border-line bg-mist px-4 py-3 text-sm text-ink">{error}</p>
      )}

      {phase === 'input' && (
        <InputStep
          flow={flow}
          consent={consent}
          errors={errors}
          locale={locale}
          privacyHref={props.privacyHref}
          sampleHref={props.sampleHref}
          inputType={inputType}
          setInputType={(t) => {
            setInputType(t);
            track('input_method_selected', token, { input_type: t });
          }}
          text={text}
          setText={setText}
          file={file}
          setFile={setFile}
          consentProcessing={consentProcessing}
          setConsentProcessing={setConsentProcessing}
          consentAggregate={consentAggregate}
          setConsentAggregate={setConsentAggregate}
          inputReady={inputReady}
          busy={busy}
          onSubmit={handleSubmit}
          onQuick={() => {
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
                : 'flex h-6 w-6 items-center justify-center rounded-full border border-line text-line text-xs'
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
  return (
    <div className="mt-8">
      <h1 className="text-2xl font-semibold">{p.flow.intro.title}</h1>
      <p className="mt-2 text-ink-soft">{p.flow.intro.body}</p>
      <p className="mt-3 text-sm text-ink-soft">{p.flow.intro.reassure}</p>
      <a
        href={p.sampleHref}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-2 inline-block text-sm font-medium text-pine underline-offset-2 hover:underline"
      >
        {p.flow.intro.sampleCta}
      </a>

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

      <p className="mt-3 text-sm text-ink-soft">{tab.hint}</p>

      {p.inputType === 'cv_pdf' ? (
        <div className="mt-4 rounded-lg border border-dashed border-line bg-mist/40 px-5 py-8 text-center">
          {p.file ? (
            <div className="flex items-center justify-center gap-3 text-sm">
              <span>
                {p.flow.pdf.selected} {p.file.name}
              </span>
              <button type="button" className="text-pine hover:underline" onClick={() => p.setFile(null)}>
                {p.flow.pdf.remove}
              </button>
            </div>
          ) : (
            <label className="cursor-pointer text-sm text-ink-soft">
              {p.flow.pdf.dropLabel}{' '}
              <span className="text-pine underline">{p.flow.pdf.chooseFile}</span>
              <input
                type="file"
                accept="application/pdf"
                className="sr-only"
                onChange={(e) => p.setFile(e.target.files?.[0] ?? null)}
              />
            </label>
          )}
        </div>
      ) : (
        <div className="mt-4">
          <textarea
            value={p.text}
            onChange={(e) => p.setText(e.target.value)}
            placeholder={tab.placeholder}
            rows={10}
            className="w-full resize-y rounded-lg border border-line bg-paper px-4 py-3 text-ink outline-none focus:border-pine"
          />
          <p className="mt-1 text-right text-xs text-ink-soft">
            {p.flow.charCount.replace('{count}', String(p.text.trim().length))}
          </p>
        </div>
      )}

      {/* zero-typing side door — value before any paste for the commute audience */}
      <button
        type="button"
        onClick={p.onQuick}
        className="mt-5 block text-left text-sm font-medium text-pine underline-offset-2 hover:underline"
      >
        {p.flow.quick.entryCta}
      </button>

      {/* no-CV escape hatch — the 78% material-step drop is mostly "wrong moment",
          not "no intent"; give the commuter a way to come back or hand over via LINE */}
      <LineActions
        title={p.flow.line.noCvTitle}
        body={p.flow.line.noCvBody}
        saveLabel={p.flow.line.saveCta}
        addLabel={p.flow.line.addCta}
        shareText={p.flow.line.shareTextMri}
        sharePath={`/${p.locale}/mri?utm_source=line_self&utm_medium=save`}
        context="material_step"
      />

      {/* email capture out — the reachable-lead version of the escape hatch */}
      <SaveForLater locale={p.locale} copy={p.flow.saveLater} />

      {/* consent — inline, required before submit */}
      <div className="mt-6 rounded-lg border border-line bg-mist/30 px-5 py-4">
        <p className="text-sm text-ink-soft">{p.consent.redactHint}</p>
        <p className="mt-1 text-sm text-ink-soft">
          {p.consent.retentionSummary}{' '}
          <a href={p.privacyHref} className="text-pine hover:underline">
            {p.consent.privacyLinkLabel}
          </a>
        </p>
        <label className="mt-4 flex items-start gap-3 text-sm">
          <input
            type="checkbox"
            checked={p.consentProcessing}
            onChange={(e) => p.setConsentProcessing(e.target.checked)}
            className="mt-0.5 h-5 w-5 shrink-0 accent-pine"
          />
          <span>{p.consent.processing.label}</span>
        </label>
        <p className="ml-7 mt-1 text-xs text-ink-soft">{p.consent.processing.detail}</p>
        <label className="mt-3 flex items-start gap-3 text-sm">
          <input
            type="checkbox"
            checked={p.consentAggregate}
            onChange={(e) => p.setConsentAggregate(e.target.checked)}
            className="mt-0.5 h-5 w-5 shrink-0 accent-pine"
          />
          <span>{p.consent.aggregate.label}</span>
        </label>
        <p className="ml-7 mt-2 text-xs text-ink-soft">{p.consent.noAccessNote}</p>
      </div>

      <button
        type="button"
        disabled={!p.inputReady || p.busy}
        onClick={p.onSubmit}
        className="mt-6 rounded-lg bg-pine px-6 py-3 text-paper transition-opacity disabled:opacity-40"
      >
        {p.flow.submit}
      </button>
      {!p.inputReady && <p className="mt-2 text-xs text-ink-soft">{p.flow.submitHint}</p>}
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
      <h1 className="text-2xl font-semibold">{c.title}</h1>
      <p className="mt-2 text-ink-soft">{c.intro}</p>

      <div className="mt-6 space-y-5">
        <Field label={c.identityLabel}>
          <div className="grid gap-2 sm:grid-cols-2">
            <input
              className="rounded border border-line bg-paper px-3 py-2 text-sm focus:border-pine outline-none"
              value={p.edits.current_role ?? ''}
              placeholder={c.notDetected}
              onChange={(e) => set({ current_role: e.target.value })}
            />
            <input
              className="rounded border border-line bg-paper px-3 py-2 text-sm focus:border-pine outline-none"
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
            className="mt-2 w-full rounded border border-line bg-paper px-3 py-2 text-sm focus:border-pine outline-none"
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
            className="mt-2 w-full rounded border border-line bg-paper px-3 py-2 text-sm focus:border-pine outline-none"
            value={p.edits.sectors_note ?? ''}
            placeholder={c.sectorsEditPlaceholder}
            onChange={(e) => set({ sectors_note: e.target.value })}
          />
        </Field>

        <Field label={c.intentLabel}>
          <textarea
            rows={2}
            className="w-full rounded border border-line bg-paper px-3 py-2 text-sm focus:border-pine outline-none"
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
  return (
    <div className="mt-8">
      <h1 className="text-2xl font-semibold">{p.questions.intro.title}</h1>
      <p className="mt-2 text-ink-soft">{p.questions.intro.body}</p>

      <div className="mt-6 space-y-6">
        {p.qs.map((q) => (
          <div key={q.id}>
            <label className="block text-sm font-medium">{q.label}</label>
            {q.type === 'select' && q.options ? (
              <div className="mt-2 flex flex-wrap gap-2">
                {q.options.map((o) => (
                  <button
                    key={o.value}
                    type="button"
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
                value={p.answers[q.id] ?? ''}
                placeholder={q.placeholder}
                onChange={(e) => setA(q.id, e.target.value)}
                className="mt-2 w-full rounded border border-line bg-paper px-3 py-2 text-sm focus:border-pine outline-none"
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
      <div className="mt-3 rounded-lg border border-line bg-mist/30 px-5 py-5">
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
              className="mt-1 w-full rounded border border-line bg-paper px-3 py-2 text-sm focus:border-pine outline-none"
            />
          </div>
          <div>
            <label className="block text-sm">{p.questions.emailGate.nameLabel}</label>
            <input
              value={p.name}
              placeholder={p.questions.emailGate.namePlaceholder}
              onChange={(e) => p.setName(e.target.value)}
              className="mt-1 w-full rounded border border-line bg-paper px-3 py-2 text-sm focus:border-pine outline-none"
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

function QuickRead(p: {
  locale: Locale;
  flow: FlowContent;
  share: ShareContent;
  answers: Record<string, string>;
  setAnswers: (a: Record<string, string>) => void;
  showResult: boolean;
  onShowResult: () => void;
  onFull: () => void;
}) {
  const q = p.flow.quick;
  const qs = [
    { id: 'q1', ...q.q1 },
    { id: 'q2', ...q.q2 },
    { id: 'q3', ...q.q3 },
    { id: 'q4', ...q.q4 },
  ];
  const allAnswered = qs.every((x) => p.answers[x.id]);

  if (p.showResult) {
    const category = mapQuick(p.answers);
    const type = p.share.types[category];
    return (
      <div className="mt-8">
        <p className="text-xs uppercase tracking-eyebrow text-pine">{q.resultEyebrow}</p>
        <h1 className="mt-2 text-3xl font-semibold">{type.label}</h1>
        <p className="mt-3 text-ink-soft">{type.shareLine}</p>
        <p className="mt-5 rounded-lg border border-line bg-mist/30 px-5 py-4 text-sm text-ink-soft">
          {q.resultNote}
        </p>
        <div className="mt-6 flex flex-wrap items-center gap-4">
          <button
            type="button"
            onClick={p.onFull}
            className="rounded-lg bg-pine px-6 py-3 text-paper"
          >
            {q.fullCta}
          </button>
          <a
            href={`/${p.locale}/types/${category}?utm_source=quick_read`}
            className="text-sm font-medium text-pine underline-offset-2 hover:underline"
          >
            {q.typeDetailCta} →
          </a>
        </div>
        {/* email unlock — capture the quick-read taker as a reachable lead */}
        <SaveForLater locale={p.locale} copy={p.flow.saveLater} />
        <LineActions
          title={p.flow.line.endTitle}
          body={p.flow.line.endBody}
          addLabel={p.flow.line.addCta}
          context="quick_result"
        />
        {/* viral loop — the quick result is itself shareable back to Threads */}
        <ShareableTypeCard
          locale={p.locale}
          category={category}
          content={p.share}
          shareUrl={`${process.env.NEXT_PUBLIC_SITE_URL ?? ''}/${p.locale}/types/${category}`}
        />
      </div>
    );
  }

  return (
    <div className="mt-8">
      <h1 className="text-2xl font-semibold">{q.title}</h1>
      <p className="mt-2 text-ink-soft">{q.intro}</p>
      <div className="mt-6 space-y-6">
        {qs.map((x) => (
          <div key={x.id}>
            <label className="block text-sm font-medium">{x.label}</label>
            <div className="mt-2 flex flex-wrap gap-2">
              {x.options.map((o) => (
                <button
                  key={o.value}
                  type="button"
                  aria-pressed={p.answers[x.id] === o.value}
                  onClick={() => p.setAnswers({ ...p.answers, [x.id]: o.value })}
                  className={
                    p.answers[x.id] === o.value
                      ? 'inline-flex min-h-[44px] items-center rounded-full bg-pine px-4 py-2.5 text-sm text-paper'
                      : 'inline-flex min-h-[44px] items-center rounded-full border border-line px-4 py-2.5 text-sm text-ink-soft hover:border-pine'
                  }
                >
                  {o.label}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
      <button
        type="button"
        disabled={!allAnswered}
        onClick={p.onShowResult}
        className="mt-8 rounded-lg bg-pine px-6 py-3 text-paper disabled:opacity-40"
      >
        {q.showResult}
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
