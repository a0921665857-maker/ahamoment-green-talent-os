import type { Locale } from '@/lib/constants';

/**
 * JD 翻譯器 (JD Translator) — a free tool. Paste a job description, get a
 * practitioner's read of it. Standalone locale-keyed content (same pattern as
 * greenJobs.ts / salaryReport.ts): nothing here belongs in content/schema.ts.
 *
 * This module also owns the JD-local ID lists and input limits, so the client
 * component, the API route and the prompt all read the same source.
 * PRIVACY: the pasted JD is never persisted — see app/api/jd/translate/route.ts.
 */

/** Input bounds. A real JD is rarely under ~120 chars or over ~15k. */
export const JD_LIMITS = { minChars: 120, maxChars: 15_000 } as const;

export const JD_SENIORITIES = ['junior', 'mid', 'senior', 'lead', 'exec', 'unclear'] as const;
export type JdSeniority = (typeof JD_SENIORITIES)[number];

/** Where a piece of evidence has to land. */
export const JD_EVIDENCE_WHERE = ['cv', 'interview', 'both'] as const;
export type JdEvidenceWhere = (typeof JD_EVIDENCE_WHERE)[number];

/** How much the salary range can be trusted — always shown, never hidden. */
export const JD_CONFIDENCE = ['low', 'medium', 'high'] as const;
export type JdConfidence = (typeof JD_CONFIDENCE)[number];

export interface JdTranslatorCopy {
  meta: { title: string; description: string };
  eyebrow: string;
  title: string;
  intro: string;
  privacyNote: string;
  footNote: string;
  backToMri: string;

  form: {
    label: string;
    placeholder: string;
    charCount: string; // contains {count}
    hint: string;
    submit: string;
    submitting: string;
    reset: string;
  };

  progress: { title: string; stages: string[]; note: string };

  result: {
    roleReadTitle: string;
    seniorityLabel: string;
    laneLabel: string;
    marketLabel: string;
    seniorityNames: Record<JdSeniority, string>;

    skillsTitle: string;
    skillsNote: string;
    mustHave: string;
    niceToHave: string;
    jdSaysLabel: string;

    unspokenTitle: string;
    unspokenNote: string;
    signalLabel: string;
    readingLabel: string;

    evidenceTitle: string;
    evidenceNote: string;
    whereNames: Record<JdEvidenceWhere, string>;

    salaryTitle: string;
    salaryBasisLabel: string;
    salaryConfidenceLabel: string;
    confidenceNames: Record<JdConfidence, string>;
    salaryDisclaimer: string;

    fitTitle: string;
    goodFitLabel: string;
    misfireLabel: string;
    misfireWhyLabel: string;

    greenAngleTitle: string;

    ctaTitle: string;
    ctaBody: string;
    ctaButton: string;
  };

  cta: { title: string; body: string; button: string };

  errors: {
    tooShort: string;
    tooLong: string;
    rateLimited: string;
    notAJd: string;
    generic: string;
  };
}

export const jdTranslatorCopy: Record<Locale, JdTranslatorCopy> = {
  'zh-TW': {
    meta: {
      title: 'JD 翻譯器：把永續職缺的 JD 翻回實話',
      description:
        '貼上一份職缺描述，我幫你拆開：它真正要的硬技能、它沒說出口的訊號、你該端出的證據、薪資帶推估，還有誰投了會白費時間。免費，而且不留你貼的內容。',
    },
    eyebrow: 'JD 翻譯器',
    title: '把一份 JD，翻回它真正在找的人。',
    intro:
      '一份永續職缺的 JD，有一半是廢話。stakeholder management、fast-paced environment、drive the sustainability agenda，讀完你還是不知道它到底要什麼、你夠不夠格、開多少錢。把整份貼進來，我幫你翻一次。',
    privacyNote: '你貼的 JD 不會被存下來。它只在這次分析裡跑一趟，資料庫裡沒有它，我也讀不到。',
    footNote:
      '我只讀你貼的這一份 JD，沒有這家公司的內部消息。所有判讀都是從 JD 的字面反推的經驗值，不是內線。',
    backToMri: '← 回到免費 MRI',

    form: {
      label: '職缺描述（JD）',
      placeholder:
        '把整份 JD 貼進來：職稱、職責、資格條件、地點、團隊。有多少貼多少，貼得越完整，翻得越準。',
      charCount: '{count} 字',
      hint: '至少 120 字。把「職責」和「資格條件」那幾段一起貼進來。',
      submit: '翻譯這份 JD',
      submitting: '讀取中…',
      reset: '換一份 JD',
    },

    progress: {
      title: 'JD 翻譯中',
      stages: [
        '讀完整份 JD，先找出它真正要人做的事',
        '撥開 buzzword，還原可以被驗證的門檻',
        '從用詞、地點、匯報對象，反推它沒說出口的',
        '對照職級與市場，推估薪資帶',
      ],
      note: '大約 20 到 40 秒，這頁先別關。',
    },

    result: {
      roleReadTitle: '這個缺，白話講是什麼',
      seniorityLabel: '層級',
      laneLabel: '它其實是哪一類工作',
      marketLabel: '市場',
      seniorityNames: {
        junior: '入門',
        mid: '中階',
        senior: '資深',
        lead: '帶人／主管',
        exec: '高階',
        unclear: '看不出來',
      },

      skillsTitle: '它真正要的硬技能',
      skillsNote: '照「最容易把你刷掉」的順序排。',
      mustHave: '硬門檻',
      niceToHave: '加分',
      jdSaysLabel: 'JD 原話',

      unspokenTitle: '它沒說出口的',
      unspokenNote: '每一條都指得出 JD 裡的原始線索，沒有一條是憑空猜的。',
      signalLabel: '線索',
      readingLabel: '我的判讀',

      evidenceTitle: '你該端出的證據',
      evidenceNote: '履歷和面試上，這些東西比形容詞有用得多。',
      whereNames: { cv: '履歷', interview: '面試', both: '履歷和面試' },

      salaryTitle: '薪資帶（推估）',
      salaryBasisLabel: '怎麼推的',
      salaryConfidenceLabel: '把握度',
      confidenceNames: { low: '低', medium: '中', high: '高' },
      salaryDisclaimer:
        '這是推估，不是這家公司的報價。JD 給的資訊越少，區間就越寬。談薪之前，自己再查一次。',

      fitTitle: '誰適合，誰最容易投錯',
      goodFitLabel: '適合的人',
      misfireLabel: '最容易投錯的人',
      misfireWhyLabel: '為什麼會投錯',

      greenAngleTitle: '這個缺在綠領地圖上的位置',

      ctaTitle: 'JD 讀懂了，那你自己呢？',
      ctaBody:
        '這個工具讀的是職缺。綠領 MRI 讀的是你：把你的經歷對到市場缺口，告訴你哪一類職缺打得動、現在最缺哪一塊。三分鐘，免費。',
      ctaButton: '做一次綠領 MRI（免費）→',
    },

    cta: {
      title: '還沒想清楚要投哪一種？',
      body: '綠領 MRI 免費讀你的經歷，三分鐘告訴你哪一類綠領職缺打得動，還有你現在缺的是哪一塊。',
      button: '做一次綠領 MRI（免費）→',
    },

    errors: {
      tooShort: '這段太短了，看起來不像一份完整的 JD。把職責和資格條件那幾段一起貼進來。',
      tooLong: '太長了，一次翻一個職缺就好。',
      rateLimited: '你這小時內跑太多次了，先等一下。要不要先去做一次綠領 MRI？',
      notAJd: '這段看起來不是職缺描述。貼一份完整的 JD 給我，最好包含職責和資格條件。',
      generic: '分析失敗了，再試一次。如果一直失敗，可能是格式太亂，把 JD 的主要段落挑出來重貼。',
    },
  },

  en: {
    meta: {
      title: 'JD Translator — what a green job ad is actually asking for',
      description:
        'Paste a job description and get a practitioner’s read: the hard skills it really wants, what it isn’t saying out loud, the evidence to bring, an estimated salary band, and who wastes their time applying. Free, and we never store what you paste.',
    },
    eyebrow: 'JD Translator',
    title: 'Translate a JD back into the person it is actually looking for.',
    intro:
      'Half of any sustainability job ad is filler. Stakeholder management, fast-paced environment, drive the sustainability agenda — you finish reading and still don’t know what the job is, whether you’d survive the screen, or what it pays. Paste the whole thing and I’ll translate it.',
    privacyNote:
      'The JD you paste is never stored. It runs through the analysis once and is gone — no database row, and I can’t read it.',
    footNote:
      'I only read the JD you paste; I have no inside line to the company. Every read here is inferred from the posting’s own words, not from a source in the building.',
    backToMri: '← Back to the free MRI',

    form: {
      label: 'Job description',
      placeholder:
        'Paste the whole JD: title, responsibilities, requirements, location, team. The more complete it is, the sharper the read.',
      charCount: '{count} characters',
      hint: 'At least 120 characters. Include the responsibilities and requirements sections.',
      submit: 'Translate this JD',
      submitting: 'Reading…',
      reset: 'Try another JD',
    },

    progress: {
      title: 'Translating',
      stages: [
        'Reading the whole posting for the job it actually is',
        'Stripping the buzzwords down to a bar someone can verify',
        'Reading the signals in the wording, location and reporting line',
        'Reasoning a salary band from level, market and function',
      ],
      note: 'About 20–40 seconds. Keep this page open.',
    },

    result: {
      roleReadTitle: 'What this role actually is',
      seniorityLabel: 'Level',
      laneLabel: 'The lane it really sits in',
      marketLabel: 'Market',
      seniorityNames: {
        junior: 'Junior',
        mid: 'Mid',
        senior: 'Senior',
        lead: 'Lead / manager',
        exec: 'Executive',
        unclear: 'Unclear',
      },

      skillsTitle: 'The hard skills it actually wants',
      skillsNote: 'Ordered by how likely each one is to screen you out.',
      mustHave: 'Hard bar',
      niceToHave: 'Bonus',
      jdSaysLabel: 'The JD says',

      unspokenTitle: 'What it isn’t saying out loud',
      unspokenNote: 'Every read below points at a real phrase in the posting. None of it is invented.',
      signalLabel: 'Signal',
      readingLabel: 'My read',

      evidenceTitle: 'The evidence you need to bring',
      evidenceNote: 'On a CV and in an interview, these beat adjectives every time.',
      whereNames: { cv: 'CV', interview: 'Interview', both: 'CV and interview' },

      salaryTitle: 'Salary band (estimated)',
      salaryBasisLabel: 'How it was reasoned',
      salaryConfidenceLabel: 'Confidence',
      confidenceNames: { low: 'Low', medium: 'Medium', high: 'High' },
      salaryDisclaimer:
        'This is an estimate, not the company’s offer. The less the JD gives away, the wider the range. Check it yourself before you negotiate.',

      fitTitle: 'Who fits, and who wastes their time',
      goodFitLabel: 'Fits',
      misfireLabel: 'Most likely to misfire',
      misfireWhyLabel: 'Why they misfire',

      greenAngleTitle: 'Where this sits on the green-collar map',

      ctaTitle: 'You’ve read the JD. Now who’s reading you?',
      ctaBody:
        'This tool reads the job. The green-collar MRI reads you — it maps your experience against the market gap and tells you which roles you can actually win, and what’s missing right now. Three minutes, free.',
      ctaButton: 'Take the green-collar MRI (free) →',
    },

    cta: {
      title: 'Not sure which kind of role to go for?',
      body: 'The green-collar MRI reads your experience for free and tells you, in three minutes, which green roles you can win and what you’re missing.',
      button: 'Take the green-collar MRI (free) →',
    },

    errors: {
      tooShort:
        'That’s too short to be a full JD. Paste the responsibilities and requirements sections too.',
      tooLong: 'That’s too long — translate one posting at a time.',
      rateLimited:
        'You’ve run this a lot in the past hour. Give it a moment — or go take the green-collar MRI in the meantime.',
      notAJd:
        'That doesn’t look like a job description. Paste a full JD, ideally including responsibilities and requirements.',
      generic:
        'The analysis failed. Try again — and if it keeps failing, the formatting may be too messy, so paste just the main sections.',
    },
  },
};
