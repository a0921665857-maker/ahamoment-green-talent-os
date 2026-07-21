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
  charCountNeed: '{count} characters — {need} more to start',
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
      note: 'This usually takes three to five minutes — we are writing twelve sections properly, not filling a template. You can close this page: the report is generated in the cloud and lands in the email you just gave, with a link that never expires.',
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
  saveLater: {
    title: 'Not a good moment? I will email you the link',
    body: 'Leave an email and I will send the assessment link so you can finish later on a computer. No spam.',
    placeholder: 'your email',
    cta: 'Email me the link',
    done: 'Sent. Open the link from your inbox to continue. You can close this page.',
    invalid: 'That email looks off — mind checking it?',
  },
  quick: {
    entryTitle: 'Nothing to paste on hand? Take the 60-second quick read',
    entryBody: 'Five tap-only questions, nothing to paste: your type, how the market misreads you, and the real salary band for your experience.',
    entryButton: 'Start the 60-second read',
    title: '60-second quick read',
    intro: 'Five questions, all taps. Walk away with your quick-read card: your type, how the market misreads you, and the real salary band for your experience.',
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
        { value: 'y6', label: '6 to 8 years' },
        { value: 'y8', label: '8+ years' },
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
    q5: {
      label: 'Closest to your track',
      options: [
        { value: 'finance', label: 'Sustainable finance or investing' },
        { value: 'carbon', label: 'Carbon markets' },
        { value: 'consulting', label: 'ESG consulting' },
        { value: 'corporate', label: 'Corporate sustainability or supply chain' },
        { value: 'other', label: 'Other / not decided yet' },
      ],
    },
    showResult: 'Get my quick-read card',
    resultEyebrow: 'Green career quick-read card',
    resultNote:
      'This is a zero-typing rough read. The full version reads your real background and returns a 12-section personal diagnosis: strengths, gaps, a salary band calibrated to your actual years and track, and next moves.',
    fullCta: 'Do the full version (about 3 minutes)',
    typeDetailCta: 'Read more about this type',
    card: {
      misreadLabel: 'The market most often misreads you as',
      verdictLabel: 'One honest sentence for you',
      stuckLabel: 'About the thing blocking you',
      salaryLabel: 'The real market rate at your experience level',
      salaryLabelSg: 'Singapore',
      salaryLabelMultiple: 'Nominal gap',
      salaryDisposableSuffix: '; roughly ', // followed by the disposable multiple
      salarySource: 'Data: 2026 APAC green-collar salary report (1 SGD ≈ 25 TWD)',
      brandFooter: 'AhaMoment Green Career MRI · 60-second quick read',
    },
    misread: {
      ready_for_mba_story_sprint:
        '"A strong applicant with an average story." The raw material is all there, but the narrative has not been pulled together, so the committee reads you as average.',
      strong_profile_weak_story:
        '"Good, but can\'t say why it has to be you." Your through-line is buried in your CV, and readers will not assemble it for you.',
      climate_career_builder:
        '"An explorer who has not decided what they want." What you lack is not direction; it is one visible move that deepens a single track.',
      career_positioning_before_mba:
        '"Someone using an MBA to dodge a positioning problem." Applying before your direction is set sells the same file one school tier short.',
      profile_building_needed:
        '"Potential, but no verifiable evidence." It is not that you fall short; your proof points are not yet recorded anywhere a reader can find.',
      high_potential_low_commercial_clarity:
        '"The technical expert in the room." People see you are strong but not what you are worth, because your impact is written in project language.',
      interview_ready_positioning_weak:
        '"Great in the room, fuzzy on the target." Excellent live performance is being spent on an unfocused goal.',
      cv_strong_narrative_weak:
        '"The polished safe choice." Every section is fine; together they make no argument, and that earns polite rejections.',
    },
    verdict: {
      ready_for_mba_story_sprint:
        'Another six months polishing bullet points costs you a full intake. What you lack is the decision to compress the story, not new achievements.',
      strong_profile_weak_story:
        'You will keep making shortlists and keep getting cut, and never hear the real reason.',
      climate_career_builder:
        'Doing an MBA now means paying full tuition for half the return.',
      career_positioning_before_mba:
        'Using essay-writing to find your direction is the most expensive thinking venue in the world.',
      profile_building_needed:
        'Paying for positioning services at this stage would be wasted. Go own one number worth recording, then come back in two quarters.',
      high_potential_low_commercial_clarity:
        'Colleagues fluent in commercial language are taking the seats you want.',
      interview_ready_positioning_weak:
        'Brilliant interviewing aimed at the wrong roles wins offers you do not want.',
      cv_strong_narrative_weak:
        'More polish only makes the missing argument more visible, not less.',
    },
    stuck: {
      value:
        'This is usually not an information problem. You have not yet translated your experience into language the market prices. The rate card was public all along.',
      no_reply:
        'Silence is rarely about not being good enough. In a six-second scan, no through-line is visible. What gets cut is the narrative, not you.',
      interview:
        'Getting interviews means your documents are fine. Not landing offers means "why you" still has no answer an interviewer could repeat.',
      abroad:
        'Going abroad is not about sending more CVs; it is about making one market understand your value first. The multiple has always been there. The barrier is translation.',
      mba_q:
        'Whether to do an MBA depends on your positioning before you enroll, not on school rankings. An MBA amplifies a trajectory; it does not create one.',
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
    careerEditPlaceholder: 'Did we misread or miss anything? Add the one achievement or number that matters most (optional)',
    sectorsEditPlaceholder: 'Wrong green lane? Correct your real sector in one line (optional)',
    editHint: 'Tap any field to edit it.',
    notDetected: 'Not detected — feel free to add it',
    confirmCta: 'Looks right — continue',
  },
  result: { viewCta: 'View your report' },
};
