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

If you want to think this through for your own situation, just reply and say so; I answer in person. If you would rather go deeper, we can take 30 minutes and talk it through, but that is later. First see whether this lands.

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
  outcomeD30: {
    subject: 'That thing we talked about a month ago, did you move on it?',
    body: `Hi {{name}},

A month ago we talked about the one thing worth fixing first: {{focus_area}}. I said I would come back and ask, so this email is just three questions, a line or two each is fine, just reply:

1. Did you move on it? (which part, or not yet)
2. If you are stuck, where?
3. Any new movement at all? (applications, interviews, an offer, a raise, tell me if there is, and it is fine if there is not)

Does not need to read well, fragments are fine. I actually read these.

Michael

If you would rather not get this series, just reply and say so, or click here: {{unsubscribe_url}}`,
  },
  outcomeD90: {
    subject: 'Three months on, how are things going',
    body: `Hi {{name}},

Three months ago we talked about {{focus_area}}. This one has two questions, same deal, just reply:

1. What is the biggest change in your career this quarter?
2. Looking back, was the original read on you right?

If something good happened in that time (an interview, an offer, a raise), I would also like to know: can I quote this story anonymously? I would rewrite it so no one could recognize you.

Michael

If you would rather not get this series, just reply and say so, or click here: {{unsubscribe_url}}`,
  },
  /**
   * Added 2026-08-08 after the conversion audit: the "how the money works" note.
   *
   * This template is DELIBERATELY UNWIRED — no scheduler, no API route, no code
   * path references it. It is a draft on disk. Who receives it and when is
   * Michael's call alone. See docs/mechanics-email-2026-08-08.md.
   *
   * Placeholders: {{name}} {{report_url}} {{booking_url}}
   */
  mechanics: {
    subject: 'About money — before you book anything',
    body: `Hi {{name}},

There is one thing I never spelled out on the site, so here it is.

The website does not take money. No checkout, no subscription, no paywall hidden behind a step. The report is free, the tools are free, and leaving your email does not put you into a sequence designed to sell you something.

So where does money come in? On the call.

The shape is fixed: you book 30 minutes online. For the first 10 minutes you talk and I listen. For the middle 15 I tell you plainly how the market currently reads you, and which line is causing it. In the last 5 minutes I say the price and the scope out loud — if I think one of the paid services would genuinely help you, I tell you what it costs, what is included, and what is not.

I will not ask you to decide on that call. You go away and think about it. If you decide to do it, you pay then. If you decide not to, the 30 minutes were still yours and you owe nothing.

I am writing this down because I have been on the receiving end of "let's just have a chat" emails that turned out to be a funnel, and I did not like it. You are entitled to know when money changes hands before you book anything.

Your report: {{report_url}}
To book: {{booking_url}}

If now is not the time, there is nothing to reply to. Come back when you actually have a decision in front of you.

Michael`,
  },
};
