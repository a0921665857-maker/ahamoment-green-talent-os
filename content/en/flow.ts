import type { FlowContent } from '../schema';

export const flow: FlowContent = {
  stepIndicator: { input: 'Your material', confirm: 'Confirm', questions: 'A few questions' },
  intro: {
    title: 'Start with what you already have',
    body: 'Pick whichever is easiest. The MRI works from your real materials — the more substance, the sharper the read.',
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
    },
  },
  confirmation: {
    title: 'Here is how we read you',
    intro: 'Check this before anything gets judged. Edit anything that is off — your corrections are used, not the raw guess.',
    identityLabel: 'Current position',
    careerLabel: 'Career so far',
    sectorsLabel: 'Green-economy sectors',
    domainsLabel: 'Domain expertise',
    intentLabel: 'What you seem to be aiming for',
    editHint: 'Tap any field to edit it.',
    notDetected: 'Not detected — feel free to add it',
    confirmCta: 'Looks right — continue',
  },
  result: { viewCta: 'View your report' },
};
