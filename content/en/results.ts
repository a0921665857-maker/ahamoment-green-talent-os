import type { ResultsContent } from '../schema';

/**
 * 2026-08-08 UX audit fix: all eight offerLines used to name the One-School MBA
 * Story Sprint (mba_story_sprint), the 90-Minute Story Teardown (teardown_90) and
 * the Climate Career Positioning Sprint (climate_positioning_sprint) — every one of
 * them sits in ARCHIVED_OFFER_IDS in lib/services.ts and cannot be bought. This copy
 * is also fed into the report-generation prompt (lib/prompts/mri_report.ts), so every
 * report was recommending a product that no longer exists. It now names no product at
 * all and points at the one door open to everyone: the free 30-minute positioning call.
 */

export const results: ResultsContent = {
  ready_for_mba_story_sprint: {
    name: 'Ready for the MBA story sprint',
    explanation:
      'Your raw material is there: real experience, credible progression, and an MBA goal that makes sense on paper. What separates you from an offer is not more achievement — it is shaping what you already have into one coherent application story.',
    whyItMatters:
      'Adcoms do not admit lists of accomplishments; they admit narratives they can place. A strong profile told flat reads as average.',
    mainRisk:
      'Spending the next three months polishing bullet points while the actual story — why you, why this, why now — stays unwritten.',
    nextMove:
      'Lock one target school and build the full story arc for it before touching another application.',
    offerLine:
      'If you want to test whether that arc holds before you start writing, book a 30-minute positioning call. I ask three questions and then say plainly which part of the story to write first.',
    cta: 'Book a 30-minute positioning call',
  },
  strong_profile_weak_story: {
    name: 'Strong profile, weak story',
    explanation:
      'The substance is real — the roles, the scope, the results are all there. But the way it is currently told, a reader has to do the work of figuring out why it adds up. Right now, your story is buried inside your CV.',
    whyItMatters:
      'In hiring and admissions alike, the candidate who explains their own through-line beats the candidate who makes the reader find it.',
    mainRisk:
      'Being consistently shortlisted and consistently passed over, without ever hearing the real reason.',
    nextMove:
      'Before changing anything on paper, articulate the one-sentence version of your trajectory — out loud, to someone who will push back.',
    offerLine:
      'If you want someone to hear it once and tell you what a reader actually hears, book a 30-minute positioning call. I will say out loud what your through-line currently reads as.',
    cta: 'Book a 30-minute positioning call',
  },
  climate_career_builder: {
    name: 'Climate career first, MBA later',
    explanation:
      'Your fit with the green economy is stronger than your case for an MBA right now. The most valuable thing you can do in the next year is deepen your climate positioning — which, incidentally, is also what would transform a future application.',
    whyItMatters:
      'An MBA amplifies a clear trajectory; it does not create one. Going now means paying full price for half the return.',
    mainRisk:
      'Treating the MBA as the decision, when the real decision is which climate lane you are building toward.',
    nextMove:
      'Choose your target lane in the green economy and make one visible move toward it within the next quarter.',
    offerLine:
      'If you are not sure which climate lane to build toward, book a 30-minute positioning call. We put the options side by side and see which one your existing evidence actually reaches.',
    cta: 'Book a 30-minute positioning call',
  },
  career_positioning_before_mba: {
    name: 'Positioning before MBA',
    explanation:
      'An MBA is plausibly right for you — but applying from your current positioning would undersell you. The gap is not your experience; it is that your direction and your story have not yet been settled, and an application written in that state shows it.',
    whyItMatters:
      'The same profile, positioned six months earlier or later, can land in a different tier of school and scholarship.',
    mainRisk:
      'Writing essays to discover your direction — the most expensive possible place to do that thinking.',
    nextMove:
      'Settle the direction question first, on paper, before any application work begins.',
    offerLine:
      'Direction is worth saying out loud before it goes on paper. A 30-minute positioning call is enough to start: three questions, and you will know whether you are stuck on direction or on narrative.',
    cta: 'Book a 30-minute positioning call',
  },
  profile_building_needed: {
    name: 'Profile building needed',
    explanation:
      'Honest read: what you shared does not yet contain enough evidence for the moves you are weighing. That is not a verdict on your potential — it usually means the proof points have not been built, or have not been captured anywhere readable.',
    whyItMatters:
      'No amount of storytelling fixes an evidence gap. The next six to twelve months of deliberate building will do more than any coaching could right now.',
    mainRisk:
      'Paying for positioning help before there is enough material to position — we would rather tell you that now.',
    nextMove:
      'Pick one project, one number, or one visible responsibility you can own in the next two quarters, and document it as you go.',
    offerLine:
      'If you want a second pair of eyes on which proof points to build first, a 30-minute positioning call can set that list — but building comes before polishing, and the free report above is honestly most of what you need today.',
    cta: 'Book an optional 30-minute call',
  },
  high_potential_low_commercial_clarity: {
    name: 'High potential, low commercial clarity',
    explanation:
      'Your expertise is real and your trajectory is strong — but your impact is framed in compliance and project language, not commercial language. Readers can see that you are good; they cannot see what you are worth.',
    whyItMatters:
      'The green economy is commercializing fast. The professionals who can speak in revenue, cost, and risk terms are being promoted past equally skilled peers who cannot.',
    mainRisk:
      'Being permanently slotted as the technical expert in the room while commercially fluent colleagues take the roles you want.',
    nextMove:
      'Take your three best projects and restate each outcome in money, risk, or scale terms — even approximately.',
    offerLine:
      'That translation goes faster spoken than written. Book a 30-minute positioning call and we will rewrite one of your projects into commercial language on the spot, so you can see the difference.',
    cta: 'Book a 30-minute positioning call',
  },
  interview_ready_positioning_weak: {
    name: 'Interview-ready, positioning weak',
    explanation:
      'You perform well in the room — your stories are crisp and you think on your feet. The weakness is upstream: what you are positioning yourself for is fuzzy, so your strong delivery is being spent on a blurry target.',
    whyItMatters:
      'Great interviewing for the wrong roles produces offers you do not want, and near-misses on the ones you do.',
    mainRisk:
      'Optimizing performance while the targeting problem quietly caps your ceiling.',
    nextMove:
      'Write the one-line positioning statement you want every interviewer to repeat after you leave the room — then test whether your materials deliver it.',
    offerLine:
      'The fastest test of a positioning line is saying it to someone who pushes back. Book a 30-minute positioning call and I will pressure-test it against your actual evidence and tell you where it bends.',
    cta: 'Book a 30-minute positioning call',
  },
  cv_strong_narrative_weak: {
    name: 'Polished CV, missing through-line',
    explanation:
      'Your documents are well-made — structured, quantified, scannable. What they do not yet do is argue anything. Each role reads well alone; together they do not tell a reader where you are inevitably heading.',
    whyItMatters:
      'A polished CV without a through-line gets respectful rejections. The polish makes the missing argument more visible, not less.',
    mainRisk:
      'Iterating on formatting and word choice when the missing piece is the argument, not the artifact.',
    nextMove:
      'Write the through-line first — one paragraph connecting your past to one specific future — then re-cut the CV to serve it.',
    offerLine:
      'A through-line is easier to say than to write. Book a 30-minute positioning call, settle it there, then re-cut the CV to serve it.',
    cta: 'Book a 30-minute positioning call',
  },
};
