# PROFILE_EXTRACTION_MODEL.md

## Purpose
One canonical `ExtractedProfile` regardless of input type (CV PDF / LinkedIn paste / notes or AI-chat paste / voice transcript). Everything downstream (questions, scoring, report, graph) consumes only this.

## Schema (TypeScript shape; zod twin in `lib/types.ts`)
```ts
interface ExtractedProfile {
  identity: { current_role?: string; current_org?: string; years_experience?: number;
              location?: string; languages?: string[]; seniority?: 'junior'|'mid'|'senior'|'lead'|'exec' }
  career_history: Array<{ org: string; role: string; start?: string; end?: string;
              scope?: string; achievements: string[] }>
  education: Array<{ school: string; program: string; year?: string }>
  green_economy: { sectors: string[]; functions: string[]; domains: string[];   // taxonomy slugs
                   free_text: string[]; depth: 'core'|'adjacent'|'aspiring' }
  credentials: string[]                                                          // taxonomy slugs
  evidence_assets: Array<{ quote: string; source_hint: string;                   // ≤25-word excerpts
                   theme: 'leadership'|'impact'|'commercial'|'technical'|'international'|'transition' }>
  commercial_signals: { revenue_or_budget_ownership: boolean|null; client_facing: boolean|null;
                   quantified_results: string[] }
  intent: { mba_intent: 'active'|'considering'|'later'|'no'|'unknown';
            target_move?: string; timeline?: '<6m'|'6-12m'|'12m+'|'unknown'; geography?: string }
  story_signals: { differentiators: string[]; risks: string[] }
  confidence: { identity: number; career_history: number; green_economy: number;
                commercial: number; intent: number; overall: number }            // 0–1
  missing_fields: string[]                                                       // maps to question bank IDs
}
```

## Rules (enforced in the extraction prompt + zod)
1. **No invention.** Absent ⇒ omit/null + lower group confidence + add to `missing_fields`. Hallucinated facts on the confirmation page destroy trust permanently.
2. **PII minimization.** Never copy phone, street address, or personal email into the profile (raw retains them until purge).
3. **Evidence assets are near-verbatim** (≤25 words), each tagged with a theme — these feed the report's specificity contract. Target 5–10 per profile.
4. **Taxonomy first**: map to slugs; unmapped terms go to `free_text` (never dropped — they grow the taxonomy).
5. Output is JSON-only, validated by zod; one repair retry on failure; second failure ⇒ session status `failed` + friendly retry UI + admin flag.

## Input-type nuances
| Input | Strength | Watch-out |
|---|---|---|
| CV PDF | history, achievements | sent as document block to the API (no parser lib); strip header PII |
| LinkedIn paste | role narrative | duplicated headlines, truncated "…see more" |
| Notes / AI-chat paste | intent, story_signals, risks (richest source for `intent` + `core_story_gap`) | separate USER's situation from the AI's prior advice — extract the person, not the previous chatbot |
| Voice transcript | motivation, self-narrative clarity | disfluencies; don't quote filler into evidence_assets |

## Thresholds
- Min input: 150 chars (EN) / 80 chars (zh) or a PDF; max 40k chars / 10MB.
- Group confidence < 0.5 ⇒ that group's fields become question candidates.
- Overall confidence < 0.5 after questions ⇒ limited-data report mode (FREE_REPORT_STRATEGY.md).

## Missing-question selection (deterministic — no LLM)
`missingInfoDetector.ts` ranks question-bank IDs: (1) always include `q_target_move` and `q_timeline` if not confidently extracted (qualification doubles as product input); (2) include `q_mba_intent` if intent unknown; (3) fill remaining slots by lowest-confidence group priority: intent > commercial > green_economy > career_history. Ask 3 normally, up to 5 when overall confidence < 0.5. Bank lives in `content/{locale}/questions.ts` with stable IDs and option values shared across locales.

## Confirmation page mapping
Shows: identity line, 3-bullet career summary, sectors/domains chips (localized labels), intent line. Inline edits write to `user_edits` and patch the working profile before scoring. Confirmation is the hallucination safety valve.
