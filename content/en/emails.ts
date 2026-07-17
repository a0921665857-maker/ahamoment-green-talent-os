import type { EmailsContent } from '../schema';

/**
 * Follow-up templates (manual send in V1). Placeholders the personalizer fills:
 * {{name}} {{report_url}} {{personal_line}} {{category_note}}
 * The LLM may only write the variable lines, never the skeleton (PROMPT_LIBRARY rule).
 */
export const emails: EmailsContent = {
  d0: {
    subject: 'Your Green Career MRI report is ready',
    body: `Hi {{name}},

Your report is written. {{personal_line}}

Read it here: {{report_url}}

The link is yours and it stays; your raw uploads auto-delete after 90 days.

I read these one at a time myself, not from a template. If any part feels off, just reply and tell me. Honest disagreement is what makes the diagnosis better.

Michael`,
  },
  d2: {
    subject: 'One more thing I want to add',
    body: `Hi {{name}},

I looked at your report again, and there is one observation I did not put in:

{{personal_line}}

If you want to think this through for your own situation, just reply and say so; I answer in person. If you would rather go deeper, I do a one-to-one written read too, but that is later. First see whether this lands.

Report is here: {{report_url}}

Michael`,
  },
  d6: {
    subject: 'Closing the loop on your MRI',
    body: `Hi {{name}},

Last note from me, no sequence after this.

{{category_note}}

If the timing is right, the report is here: {{report_url}}. If it is not yet, the diagnosis does not expire; come back when it does. And if something is on your mind, this reply reaches me.

Michael`,
  },
};
