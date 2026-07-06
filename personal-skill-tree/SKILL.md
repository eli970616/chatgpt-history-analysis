---
name: personal-skill-tree
description: >-
  Build a reusable, evidence-grounded personal skill tree from a longitudinal
  self-record (ChatGPT-history field notes and/or capability reports, or any
  corpus of the person's own dated messages). Extracts level-1 domains and
  level-2 skills, tags each with a four-tier proficiency, and outputs both a
  Markdown tree (ASCII overview + per-skill detail + causal graph) and an
  interactive .canvas.tsx. Use when the user asks to turn their records / chat
  history / capability analysis into a "skill tree", "skill map", "Xxx OS",
  or a reusable inventory of skills they can pull from repeatedly.
disable-model-invocation: true
---

# Personal Skill Tree

Turns a person's longitudinal record into a reusable **skill tree**: level-1 domains, level-2 skills, each with a definition, dated-quote evidence, a "when to reuse" trigger, and a proficiency tier. Delivered as a Markdown tree + an interactive canvas so the person can pull skills from it repeatedly.

## Inputs (in priority order)

Use whatever is available; prefer the richest evidence source:

1. **Capability reports** (best) — if the person already ran `chatgpt-history-analysis`, read its `核心增长引擎.md` (capability inventory table + causal graph + root/derived/constraint layering) and `近半年能力增长与自我认知.md` (fastest-growing abilities). These already separate root vs derived vs bottleneck — reuse that structure.
2. **Field notes** — `notes/notes-part-*.md` from the analysis pipeline (dated verbatim quotes per time slice).
3. **Raw corpus / chat export** — if none of the above exist, first run `chatgpt-history-analysis` (or at least its extract + field-note steps) to get dated evidence, then come back here.

**Output dir**: ask, or default to a folder named after the model running the analysis (e.g. `gpt-5.5/`), matching the `chatgpt-history-analysis` convention so runs are comparable.

## Method

### Step 1 — Gather capability evidence
Read the input sources above. Collect every observable ability plus a dated verbatim quote / event for each. Note which abilities the evidence marks as **root** (drive other abilities), **derived** (results of other abilities), and **constraint / bottleneck** (throttle everything).

### Step 2 — Cluster into level-1 domains
Let the data decide the domains; do **not** force a fixed count. Typically 5-8 domains emerge (e.g. metacognition, learning, engineering/execution, building/creating, health, life strategy). Always add one final domain **Growing Edges** to hold the constraint/bottleneck skills as first-class citizens — never hide them.

### Step 3 — Extract level-2 skills
Under each domain, name 3-4 concrete, reusable skills. For every skill fill four fields:

- **Definition** — one sentence: what this ability actually is.
- **Evidence** — 1-2 dated verbatim quotes / events from the record (never invent; quote what exists).
- **When to reuse** — the concrete situation in which the person should deliberately invoke this skill next time. This is the field that makes the tree *reusable* rather than descriptive.
- **Proficiency** — one of the four tiers below.

### Step 4 — Assign proficiency (four tiers)

| Mark | Tier | Assign when |
|---|---|---|
| ◆ | **Core** | Root node AND still growing fast AND powers other skills. Reserve for the 1-3 abilities whose removal would break the main loop. |
| ● | **Strong** | Recently surged / new fast-rising curve; reliably callable now. |
| ○ | **Solid** | Long-standing stable curve, high but flat growth. |
| ▲ | **Training** | Bottleneck / constraint node. A muscle to build. All Growing-Edges skills are ▲. |

Be honest and stingy with ◆ — most skills are ● or ○; bottlenecks are ▲ and must not be dressed up as strengths.

### Step 5 — Write the Markdown tree
Write `<output_dir>/personal-skill-tree.md` following [skill-tree-template.md](references/skill-tree-template.md): a title `<Name> OS v1.0` (ask the person for the name, or reuse their preferred handle), an ASCII overview tree with proficiency marks, a legend table, per-domain expansion of the four fields, and a closing causal Mermaid graph (root ◆ → derived ●/○, with ▲ edges shown as inhibitors).

### Step 6 — Write the interactive canvas
Write `<output_dir>/skill-tree.canvas.tsx` from [canvas-template.tsx](references/canvas-template.tsx). Fill the `DOMAINS` data array with the extracted domains/skills; the component code (clickable cards, four-tier coloring, expand/collapse, stats) stays as-is. Keep the canvas SDK conventions: colors only from `useHostTheme()` tokens, and when mapping arrays put the `key` on a wrapping `<div>`.

## Report style
- Match the person's language (the analysis reports are Chinese; mirror that).
- Evidence = the person's own dated quotes. Do not fabricate quotes or dates.
- Neutral, honest tone. Bottlenecks stay labeled ▲; do not comfort-wash them.

## Notes
- Composes with `chatgpt-history-analysis`: that skill produces the field notes + capability reports this skill consumes.
- All outputs go to `<output_dir>`; raw records stay untouched and are never uploaded.
