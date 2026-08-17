---
name: log-analysis
description: Walks step-by-step with a mandatory human review checkpoint, produces the Task 3 flow chart/trade-offs, and exports the git commit log.
---

# Log Analysis Skill

Executes the final steps of the **AI-First performance testing procedure** (Analyze -> Tune -> Wrap-up), acting as Step 5, 6, and 7. After each step, pause and wait for the user to review and confirm before continuing.

---

## Global rules

**On confirmation, "write to files" and "git commit" are a single atomic action:**
1. Write the step's output into `Report.md` (or the relevant appendix file).
2. Immediately run the corresponding `git add` + `git commit` command.
3. Output the confirmation prompt for the next step.

**Correction handling protocol (mandatory).** When the user corrects an AI-produced value (e.g., a misread p95), do not just apply the fix. First append an entry to `## Task 2: AI Analysis & Misinterpretation Hunt` in `Report.md` with:
- The AI's original (wrong) claim.
- The correct value, **quoted directly from the raw `.jtl` file** (ask the user to paste/point to the exact row if not already provided).
- A one-line explanation of the error.
Only then apply the correction and proceed.

---

## Workflow

### Step 1 — Analyze

**What to do:**
- Analyze the 3 `.jtl` files provided by the user (Load, Stress, Spike).
- Report **only** on p95, p99, median (p50), throughput, and error rates. Banish the "mean".
- Correlate latency spikes with the resource monitor data provided by the user.
- Suggest performance thresholds/SLOs based on the observed data.
- **CRITICAL:** You must append this exact block at the end of your analysis:

> ⚠️ **HUMAN REVIEW REQUIRED (Task 2: Misinterpretation Hunt)**:
> My analysis is an AI generation. You must:
> 1. Verify the p95 and error rates against your raw `.jtl` file. If I misread a value, document my error in your report (see Correction handling protocol).
> 2. Determine if my proposed architectural bottlenecks make sense.

**Where it goes:** `Report.md` under `## Task 2: AI Analysis & Misinterpretation Hunt`.

**Git commit after user accepts:**
`docs(perf): Step 5 - analyze metrics and correlate resources`

---

### Step 2 — Tune (Judge the AI's recommendations)

**What to do:**
- **Judge the AI's recommendations:** Propose a comprehensive list of structural optimizations that are highly feasible and strictly suitable for the system context.
- Wait for the user to classify each proposal as **feasible** or **hallucinated**, with their reasoning, and record it verbatim in `Report.md`.
- Propose a **Continuous Performance Testing** model (Task 3, Bloom-AI G9.6) matching their setup (e.g., PR smoke test, nightly soak, commit-triggered p95 regression gate). This must include:
  - A **flow chart** (produce it as a Mermaid diagram in `Report.md`) showing: commit event -> decision on whether to run perf tests -> test execution -> p95 comparison against baseline -> pass/flag regression.
  - An explicit **trade-offs discussion**: cost (compute time, CI minutes, developer wait time) vs. false-alarm risk (flaky thresholds, noisy p95 on small samples), and how the design mitigates each.

**Where it goes:** `Report.md` under `## Task 3: Optimization & Continuous Testing Proposal`.

**Git commit after user accepts:**
`docs(perf): Step 6 - propose tuning and continuous perf pipeline`