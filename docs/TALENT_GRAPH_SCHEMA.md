# TALENT_GRAPH_SCHEMA.md

> Status: ARCHITECT-FOR, DO-NOT-BUILD. Defines the target graph so V1 data decisions stay compatible.

## Target graph (V3+)
**Nodes:** Person · ProfileSnapshot (point-in-time) · Organization · Role · Skill/Domain (taxonomy) · Sector (taxonomy) · Credential · School/Program · Transition (reified move).
**Edges:**
- (Person)-[HAS_SNAPSHOT {at}]->(ProfileSnapshot)
- (ProfileSnapshot)-[WORKED_AT {role, start, end, seniority}]->(Organization)
- (ProfileSnapshot)-[HAS_DOMAIN {confidence, evidence_ref}]->(Domain)
- (ProfileSnapshot)-[IN_SECTOR {depth}]->(Sector)
- (ProfileSnapshot)-[HOLDS]->(Credential)
- (ProfileSnapshot)-[SEEKS {target_move, timeline}]->(Sector|Role)
- (ProfileSnapshot)-[SCORED {dimension, score, rubric_version}]->(:Rubric)
- (Person)-[MADE]->(Transition {from_sector, to_sector, via}) ← the rarest, most valuable data in green careers

## Why V1 is already graph-compatible
- Taxonomy slugs (DATA_MODEL.md) are node IDs in waiting; free-text never enters scoring untagged.
- `ExtractedProfile.career_history[]` entries are WORKED_AT edges in waiting (org, role, dates, scope).
- `intent` block = SEEKS edges. `scores` rows = SCORED edges with rubric versioning already present.
- `consent_aggregate` flag legally gates which snapshots may enter aggregate products.

## Graph-era products (sequence)
1. Aggregate insight reports ("State of APAC Green Talent") — content + credibility flywheel.
2. Transition pathways ("people who moved from ESG advisory → green finance typically added X") — powers the career path simulator.
3. Role-fit engine (snapshot ↔ role-requirement matching) → employer-side dashboards, school partnerships.

## Implementation note
Stay on Postgres: `nodes` + `edges` tables with jsonb props serve well past 100k profiles; a dedicated graph DB is a non-decision until matching products exist. Migration = ETL from existing tables; no rewrite, because slugs and snapshots were canonical from day 1.

## Prerequisites before any employer-side product
Explicit re-consent flow (aggregate consent ≠ matching consent), anonymization review, and ≥1,000 quality snapshots. Logged in ROADMAP.md.
