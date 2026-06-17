import type { ErrorsContent } from '../schema';

export const errors: ErrorsContent = {
  tooShort: "That's a little too short to read you properly. Add a bit more — a few lines about your roles, projects, or what you're weighing up. 150 characters is enough.",
  tooLong: 'That input is over the 40,000-character limit. Trim it to the most relevant parts — recent roles and the decision you are facing.',
  fileTooLarge: 'That PDF is over 10MB. Export a lighter version (text-based, no scans) and try again.',
  fileType: 'Only PDF files are supported here. For anything else, paste the text into one of the other tabs.',
  consentRequired: 'Please confirm the processing consent above before submitting.',
  emailInvalid: 'That email address does not look right. Please check it.',
  extractionFailed: 'We could not read your material this time. Nothing was lost — your input is saved. Please try once more, or try a paste instead of a PDF.',
  reportDegraded: 'Parts of this report used fallback wording because generation was interrupted. The bands and category are still based on your material.',
  rateLimited: 'You have reached the hourly limit for new submissions from this connection. Please try again in a little while.',
  dailyCapReached: "Today's MRI slots are full — we cap volume on purpose to keep quality high. Come back tomorrow, or watch for our next opening.",
  notFound: 'We could not find that report. Check the link, or run a new MRI.',
  generic: 'Something went wrong on our side. Your input is saved — please try again.',
  retry: 'Try again',
};
