import type { EmailsContent } from '../schema';

/**
 * Follow-up templates (manual send in V1). Placeholders the personalizer fills:
 * {{name}} {{report_url}} {{personal_line}} {{category_note}}
 * The LLM may only write the variable lines, never the skeleton (PROMPT_LIBRARY rule).
 */
export const emails: EmailsContent = {
  d0: {
    subject: 'Your Green Career MRI report',
    body: `Hi {{name}},

Your report is ready: {{report_url}}

{{personal_line}}

The link is yours to keep — the report stays available, and your raw uploads auto-delete after 90 days. If anything in the read feels off, reply and tell me; honest disagreement makes the diagnosis better.

Michael
AhaMoment`,
  },
  d2: {
    subject: 'One more thing your material shows',
    body: `Hi {{name}},

One observation that did not make it into the report:

{{personal_line}}

If you want to work through what that means in practice, the teardown session is built for exactly that — and the fee credits fully toward anything bigger within 30 days.

{{report_url}}

Michael`,
  },
  d6: {
    subject: 'Closing the loop on your MRI',
    body: `Hi {{name}},

Last note from me — no sequence after this.

{{category_note}}

If the timing is right, you know where the report is: {{report_url}}. If it is not, the diagnosis stays true; come back to it when it is.

Michael`,
  },
};
