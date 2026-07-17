import type { FlowContent } from '../schema';

export const flow: FlowContent = {
  stepIndicator: { input: 'Your material', confirm: 'Confirm', questions: 'A few questions' },
  intro: {
    title: 'Start with what you already have',
    body: 'Pick whichever is easiest. The MRI works from your real materials — the more substance, the sharper the read.',
    reassure: 'About 3 minutes · Free · No signup. Your raw input is deleted after 90 days and never used to train AI.',
    sampleCta: 'Not sure yet? See a full sample first →',
  },
  inputTabs: {
    cv_pdf: {
      tab: 'CV (PDF)',
      hint: 'A text-based PDF works best. Scans of paper CVs cannot be read.',
    },
    linkedin_paste: {
      tab: 'LinkedIn paste',
      hint: 'Open your profile, select all the text (About, Experience, Education), and paste it here. Truncated "…see more" sections are fine.',
      placeholder: 'Paste your LinkedIn profile text here…',
    },
    notes_paste: {
      tab: 'Notes or AI chat',
      hint: 'Career notes, a self-introduction, or a conversation you had with ChatGPT or Claude about your career. We read your situation, not the AI\u2019s advice.',
      placeholder: 'Paste your notes or chat transcript here…',
    },
    voice_transcript: {
      tab: 'Voice transcript',
      hint: 'Record yourself talking through your background on any app, then paste the transcript. Spoken, unpolished language is genuinely useful here.',
      placeholder: 'Paste your voice transcript here…',
    },
  },
  pdf: {
    dropLabel: 'Drop your CV here, or',
    chooseFile: 'choose a PDF',
    selected: 'Selected:',
    remove: 'Remove',
  },
  submit: 'Run the MRI',
  submitHint: 'Paste a little content and tick the processing consent below to start.',
  charCount: '{count} characters',
  progress: {
    extraction: {
      title: 'Reading your material',
      stages: [
        'Reading what you shared…',
        'Mapping roles, sectors, and evidence…',
        'Noting what is missing…',
      ],
    },
    report: {
      title: 'Writing your report',
      stages: [
        'Scoring fourteen dimensions against your evidence…',
        'Determining your result category…',
        'Writing your twelve sections…',
      ],
      note: 'This usually takes three to five minutes — we are writing twelve sections properly, not filling a template. The report is generated in the cloud, so closing this page will not interrupt it; if you keep it open, it appears automatically.',
    },
  },
  line: {
    noCvTitle: 'No CV on hand? That is normal — most people open this on a commute.',
    noCvBody: 'Send this page to your LINE and finish later on a computer, or add Michael on LINE and drop him your CV directly. He replies in person.',
    saveCta: 'Save to my LINE',
    addCta: 'Add Michael on LINE',
    shareTextMri: 'Green-career MRI, free assessment. Start here later:',
    shareTextReport: 'My green-career MRI report, view it here:',
    generatingHint: 'Worried about interruptions? Send the report link to your LINE first, then open it when it is ready.',
    resultTitle: 'Save this report to your LINE',
    resultBody: 'The link never expires. Send it to yourself, or add Michael on LINE to talk through your next step. He replies in person.',
    landingTitle: 'Not sure about the assessment yet?',
    landingBody: 'Add Michael on LINE and ask anything directly. He replies in person, not a bot.',
    endTitle: 'Not ready to book a slot? That is fine.',
    endBody: 'Add Michael on LINE, let the report sit for a few days, and reach out whenever you are ready.',
  },
  quick: {
    entryCta: 'Or try the 60-second quick read: four tap-only questions, nothing to paste →',
    title: '60-second quick read',
    intro: 'Four questions, all taps. See roughly which type you are first; the full read can wait.',
    q1: {
      label: 'Where are you now?',
      options: [
        { value: 'sus_work', label: 'Working in sustainability' },
        { value: 'non_sus', label: 'Outside sustainability, want in' },
        { value: 'student', label: 'Student or fresh graduate' },
        { value: 'mba', label: 'In or seriously considering an MBA' },
      ],
    },
    q2: {
      label: 'Years of experience',
      options: [
        { value: 'y0', label: 'Under 1 year' },
        { value: 'y1', label: '1 to 3 years' },
        { value: 'y3', label: '3 to 6 years' },
        { value: 'y6', label: '6+ years' },
      ],
    },
    q3: {
      label: 'What blocks you most right now?',
      options: [
        { value: 'value', label: 'No idea what I am worth' },
        { value: 'no_reply', label: 'CV goes out, nothing comes back' },
        { value: 'interview', label: 'I get interviews, not offers' },
        { value: 'abroad', label: 'Want to go abroad, unsure how' },
        { value: 'mba_q', label: 'Should I do an MBA?' },
      ],
    },
    q4: {
      label: 'Target market',
      options: [
        { value: 'tw', label: 'Taiwan' },
        { value: 'sg', label: 'Singapore or overseas' },
        { value: 'explore', label: 'Still exploring' },
      ],
    },
    showResult: 'Show my quick read',
    resultEyebrow: 'Quick-read result',
    resultNote: 'This is a rough four-question read. The full version reads your real background and returns a 12-section personal diagnosis: strengths, gaps, market value, and next moves.',
    fullCta: 'Do the full version (about 3 minutes)',
    typeDetailCta: 'Read more about this type',
  },
  confirmation: {
    title: 'Here is how we read you',
    intro: 'Check this before anything gets judged. Edit anything that is off — your corrections are used, not the raw guess.',
    identityLabel: 'Current position',
    careerLabel: 'Career so far',
    sectorsLabel: 'Green-economy sectors',
    domainsLabel: 'Domain expertise',
    intentLabel: 'What you seem to be aiming for',
    careerEditPlaceholder: 'Did we misread or miss anything? Add the one achievement or number that matters most (optional)',
    sectorsEditPlaceholder: 'Wrong green lane? Correct your real sector in one line (optional)',
    editHint: 'Tap any field to edit it.',
    notDetected: 'Not detected — feel free to add it',
    confirmCta: 'Looks right — continue',
  },
  result: { viewCta: 'View your report' },
};
