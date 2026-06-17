# KNOWN_LIMITATIONS.md

1. **Founder legal structure (highest priority, outside the codebase).** Michael holds a Singapore Employment Pass; EP holders generally cannot run a side business or earn outside income without authorization (MOM Letter of Consent or equivalent), and the Sylvera contract may contain moonlighting/IP clauses. **Resolve before taking the first payment** (options to explore with a professional: employer consent + MOM LOC, deferring monetization, or compliant entity structuring). The product can launch free-tier-only in the meantime. Not legal advice.
2. **Report links are bearer tokens.** Anyone with the URL sees the report. Acceptable V1 tradeoff for no-login; revisit with accounts in V2.
3. **No payment processing.** Stripe links are placeholders; payment confirmation is manual (`followup_status=paid`). Real links in V1.1.
4. **Emails are manual.** Drafts auto-generated; Michael sends. Automation (Resend) in V1.1.
5. **Scoring cold start.** Rubric anchors and thresholds are v0.1 priors; expect calibration after ~30 real sessions (procedure in SCORING_MODEL.md). The deterministic classifier makes this tunable without prompt surgery.
6. **zh-TW generation quality is unproven until Phase 4.** Gate: Michael approves all zh seed outputs before beta.
7. **Vercel function duration.** Long Sonnet calls need `maxDuration` headroom; verify plan limits at deploy; mitigation = upgrade or stream.
8. **Single admin, password auth.** Fine for one founder; upgrade path documented.
9. **Extraction can misread.** Mitigated (not eliminated) by the confirmation/edit page and no-invention prompt rule.
10. **Capacity ceiling.** ~4–6 client-hours/week caps service revenue near US$2–5k/month; the answer is pricing and productization (V2), not lead volume.
11. **Purge is manual** until pg_cron (V1.1); calendar reminder required.
12. **No third-party analytics** — by design; the events table must therefore actually be queried (weekly routine).
