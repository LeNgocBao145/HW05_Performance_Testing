---
name: performance-testing
description: Walks step-by-step with a mandatory human review checkpoint, flexibly picks JMeter or k6 based on the SUT's stack, and tracks evidence (raw logs, HTML reports, hardware report, endurance threshold).
---

# Performance Testing Skill

Executes the first 4 steps of the **AI-First performance testing procedure** (Model -> Script -> Baseline -> Run), one step at a time. After each step, pause and wait for the user to review and confirm before continuing.

---

## Global rules

**Ask, don't assume.** If SUT specifics (endpoints, ports, StudentID, hostname) are missing, **stop and ask the user**.

**On confirmation, "write to files" and "git commit" are a single atomic action — never do one without the other, in this order:**
1. Write the step's output into the appropriate file (e.g., `Report.md`, `.jmx` script, `.csv` data).
2. Immediately run the corresponding `git add` + `git commit` command for that step (commit message given per-step below).
3. Only after both 1 and 2 are done, output the "Step N complete... type `continue`" prompt for the *next* step.
If step 2 is skipped, the step is **not** considered complete.

**Correction handling protocol (mandatory).** If, instead of `continue`, the user replies with a correction/fix to what the AI produced, do NOT just silently apply it. Before writing the fix, ask the user (or record their answer if already given) two things and append them to a `## Human Review Notes` section in `Report.md`:
1. What exactly was wrong or missing (quote the AI's original value/output vs. the corrected one).
2. Why the AI likely missed it — classify as **Prompt quality**, **Model limitation**, or **Endpoint characteristic**, with a one-line justification.
Only after this note is written do you apply the fix, then proceed with the normal write+commit step. This satisfies HW05's "review and fix + explain why it missed" grading criterion — do not skip it even if the user seems in a hurry.

---

## Tool selection (flexible — HW05 does not mandate a specific tool)

Before Step 1, if the tool hasn't been chosen yet, ask the user (or infer from the repo) what stack the SUT backend is written in, then recommend accordingly — but always let the user override:
- **Backend in JavaScript/TypeScript (Node.js, etc.)** → lean towards **k6** (JS-native scripting, lighter footprint, fits the stack).
- **Backend in Java/Kotlin (Spring, etc.)** → lean towards **JMeter** (JVM-native, matches tooling/ecosystem, GUI listeners map directly to course terminology).
- Other stacks → ask the user which they're more comfortable with; either is acceptable per HW05 §8.
Record the chosen tool and the one-line reason in `Report.md` under `## Task 1: Tool Selection`. If the user picks k6, treat every JMeter-specific instruction below (`.jmx`, listeners, `.jtl`) as its k6 equivalent (JS test script, k6 output summary/handleSummary report types, `.json`/`.csv` result output) — don't force JMeter terminology on a k6 workflow.

---

## Workflow

### Step 1 — Model (workload & SLOs)

**What to do:**
- Identify the three mandatory endpoint groups: **Auth-heavy**, **Read-heavy**, and **Transactional**.
- Define the end-to-end user journey that covers all three (e.g., login -> browse/search -> add to cart -> checkout).
- Define the Data-Driven strategy (what CSV parameters are needed: credentials, product IDs, order payloads, etc.).
- Establish the Load Shapes and target metrics (SLOs) for **Load**, **Stress**, and **Spike** scenarios (threads/VUs, ramp-up, think-time, duration), and briefly justify how the chosen workflow exercises each endpoint group.

**Where it goes in Report.md:** Under `## Task 1: Test Design (Model)`

**Git commit after user accepts:**
`test(perf): Step 1 - model workload and SLOs for 3 endpoint groups`

---

### Step 2 — Script (scenarios + data)

**What to do:**
- Generate the actual performance scripts (JMeter XML or k6 JS) for Load, Stress, and Spike.
- Ensure each script includes CSV data reading logic.
- Ensure the **three test plans use three different report listener/view types** — assign one distinct type per scenario (e.g., Load -> Summary Report, Stress -> Aggregate Report, Spike -> View Results Tree) and never repeat a type across the three plans. State explicitly in `Report.md` which listener belongs to which scenario.
- Enforce the naming convention: `{StudentID}_{ScenarioType}_{YYYYMMDD}` for every test plan file.
- Add a specific note reminding the user how to reset the "Account Lockout" behavior (FR-02, 3-fail lockout) between Stress/Spike runs.

**Where it goes:** Generates the raw script files in the workspace. Mention them in `Report.md` under `## Task 1: Script Generation`.

**Git commit after user accepts:**
`test(perf): Step 2 - generate JMeter/k6 scripts and CSV templates`

---

### Step 3 — Baseline (first run = ref)

**What to do:**
- Instruct the user to run a very short, low-VU run to establish a baseline.
- Ask the user to paste the output summary or provide the `.jtl` file of this baseline.
- Analyze the baseline to ensure there are no fundamental script errors before the massive runs.

**Where it goes:** Add a baseline reference table in `Report.md`.

**Git commit after user accepts:**
`test(perf): Step 3 - establish performance baseline`

---

### Step 4 — Run (execution, evidence & threshold)

**What to do — this step covers the parts of execution that feed the report/analysis. Video recording and GitHub Issues logging are handled by the user directly outside this skill; just remind once, don't checklist-enforce them.**

1. **Execute all three scenarios** (Load, Stress, Spike) against the SUT.
2. **Per-scenario evidence**, for each of the 3 runs — collect and reference in `Report.md`:
   - Screenshot of the testing tool together with the backend process's resource usage (htop / Task Manager / Activity Monitor) in the same frame.
   - The raw result log kept in full (`.jtl` for JMeter, or the k6 output/JSON/CSV export) — not only a summary.
   - The generated HTML report (JMeter) or equivalent k6 summary report for that run.
3. **Hardware report** (once, reused across runs): a dxdiag/screenfetch screenshot and a spec table (CPU, RAM, OS). Note: hostname must match previous homework deployments (anti-cheat check) — just flag this to the user, they'll capture it themselves.
4. **Account lockout handling**: whenever a Stress/Spike run triggers the 3-fail login lockout, ask the user to note the reset steps they took (command/UI action + timestamp); record it in `Report.md`.
5. **Endurance / soak test**: instruct the user to run a sustained-load test for **10–15 minutes**, then report concrete numbers: maximum stable RPS, memory ceiling, and the point where errors start climbing. Push for numbers, not a qualitative answer.
6. Quick reminder only (user handles directly): demo video (≥6 min, unlisted YouTube, tool+monitor same frame, own Vietnamese narration) and GitHub Issues bug reports — no need to draft or checklist these further.
7. Tell them to use the `log-analysis` skill for Steps 5 & 6 after all of the above is done.

**Where it goes:** `Report.md` under `## Task 1: Execution & Hardware Threshold`, with subsections `### Evidence Checklist` and `### Endurance Threshold`.

**Git commit after user accepts:**
`docs(perf): Step 4 - document execution artifacts and threshold`