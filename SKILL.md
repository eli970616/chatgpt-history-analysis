---
name: chatgpt-history-analysis
description: >-
  Run a deep longitudinal self-analysis on a ChatGPT data export (conversations-*.json).
  Produces a corpus of time-ordered user messages, per-period field notes, and five
  Chinese Markdown reports: 8-question growth analysis, the single most important
  insight, recent capability growth vs self-perception, core growth engine, and a
  6-month roadmap. Use when the user provides a ChatGPT export folder and asks to
  analyze their chat history, growth trajectory, patterns, or wants a "what would
  another AI say" second opinion.
disable-model-invocation: true
---

# ChatGPT History Deep Analysis

Turns a raw ChatGPT data export into evidence-based longitudinal self-analysis reports (all reports in Chinese, quoting the user's own dated messages as evidence).

## Inputs

1. **Export dir**: folder containing `conversations-*.json` (a ChatGPT data export).
2. **Output dir**: ask the user, or default to a folder in the workspace **named after the model running the analysis** (e.g. `fable-5/`), so runs by different AIs can be compared side by side.

## Pipeline (map-reduce)

The user-message corpus is typically ~1M tokens and cannot be read at once.

```
extract.py → corpus/part-XX.txt (11-ish chunks) → N parallel subagents → notes/notes-part-XX.md → main agent synthesizes 5 reports
```

### Step 1 — Extract corpus

```bash
python3 scripts/extract.py <export_dir> <output_dir>/corpus
```

Writes time-ordered user messages into `part-XX.txt` chunks (~80k tokens each, long pastes truncated) plus `index.md` (time range, message count, top conversation titles per chunk).

### Step 2 — Map: parallel field notes

Launch one `generalPurpose` subagent **per chunk, all in parallel, in background**. Each subagent reads its `part-XX.txt` fully and writes `<output_dir>/notes/notes-part-XX.md` following the exact template in [field-note-template.md](references/field-note-template.md). Key rules for subagents:

- Evidence only: every claim grounded in the text; section 10 quotes original sentences verbatim with dates.
- Neutral researcher tone, no coaching, no comfort.
- Do not read other chunks; each covers only its own time slice.

### Step 3 — Reduce: synthesize five reports

After all notes complete, the **main agent** reads all notes (not the raw corpus) and writes these reports to `<output_dir>/`, answering the verbatim prompts in [prompts.md](references/prompts.md):

| File | Prompt section | Core question |
|---|---|---|
| `分析报告.md` | Prompt 1 | 8 questions: growth trajectory, repeating patterns, energy sources, hidden talents, limiting factors, life themes, 10-year forecast A/B, 3 most important things |
| `最重要的一件事.md` | Prompt 2 | The single most important thing the user hasn't understood + 5-year fork |
| `近半年能力增长与自我认知.md` | Prompt 3 | Fastest-growing abilities, self-rating vs facts, expired self-stories, compounding |
| `核心增长引擎.md` | Prompt 4 | If only one ability could keep growing for 10 years, which one (capability inventory + causal graph + counterfactuals) |
| `未来六个月成长路线图.md` | Prompt 5 | 6-month month-by-month roadmap, leverage matrix, risks, weekly time budget, predictions |

Report style requirements (apply to all):
- 中文;深度分析,不是总结;不安慰、不鸡汤、不政治正确;可以指出残酷但重要的事实。
- 引用带日期的原句作为证据;区分【事实】/【推断】/【结论】。
- Markdown 标题层级、表格、适合处用 Mermaid;长报告附 Executive Summary。

### Step 4 — Index

Write `<output_dir>/README.md`: table of reports with one-line takeaways, data stats (conversations / user messages / time span), and pointers to corpus + notes.

## Notes

- Raw export stays untouched; all outputs go to `<output_dir>`.
- Everything is processed locally; never upload the corpus anywhere.
