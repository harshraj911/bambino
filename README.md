# Bambinos.live — AI Program Manager (Operations) Take-Home Assignment
## Re-Engineering & Automating the Student Renewal → Class Scheduling Pipeline

![Status: Production Ready](https://img.shields.io/badge/Status-Production%20Ready-brightgreen.svg)
![Track: Operations](https://img.shields.io/badge/Track-Operations%20AI%20PM-blue.svg)
![Dataset Coverage: 100%](https://img.shields.io/badge/Dataset%20Coverage-13%2F13%20Invoices%20Reconciled-blueviolet.svg)
![Zero-Touch TAT: <45s](https://img.shields.io/badge/Zero--Touch%20TAT-%3C45s-orange.svg)
![Tests: 9/9 Passing](https://img.shields.io/badge/Tests-9%2F9%20Passing-success.svg)

---

## 📌 Executive Summary

Bambinos.live runs thousands of live small-group online classes every week for children aged 4–16 across India, GCC, and US/UK. Student renewals represent a massive driver of company retention and Lifetime Value (LTV).

Moving a renewing student from **Payment Completed** to **Classes Scheduled** historically required **4 database tables** and multiple manual handoffs across Teachers, Operations, and Parents. At hundreds of renewals per week, this legacy flow created an average turnaround time (TAT) of **18.4 hours**, high rates of orphaned invoices (23.1%), and parent friction.

This repository presents the end-to-end operational re-engineering solution:
1. **Root-Cause Leakage Audit (Deliverable A):** Deep forensic breakdown of all 13 production records in `./ops/data/`, identifying real-world failure modes and defining 6 previously invisible operational metrics and SLAs.
2. **"Zero-Touch" AI Re-Engineered Architecture (Deliverable B):** Eliminating the teacher form bottleneck via metadata-enriched payment webhooks, instantly auto-approving clean renewals (<45s TAT), and deploying specialized AI agents for fuzzy identity resolution and exception triaging.
3. **Working Reconciliation & Auto-Approval Engine (Deliverable C):** A deterministic, fully tested Python reconciliation engine (`workflows_or_scripts/reconciliation_engine.py`) that auto-schedules 144 live class sessions, standardizes exceptions with SLA codes, and auto-drafts multi-channel communications.
4. **Ops Head Daily Dashboard, SOP & 30-60-90 Day Plan (Deliverable D):** An interactive daily morning command center (`workflows_or_scripts/dashboard/index.html`), an Ops Exception Triage Playbook, and a phased change-management roadmap across 200+ teachers.

---

## 📂 Repository Architecture

```
Bambino/
├── README.md                                    # Master project documentation & presentation guide
├── Case_Report_Bambinos_Operations_AI_PM.pdf    # Compulsory PDF Deck / Case Report
├── Case_Report_Bambinos_Operations_AI_PM.html   # Source HTML for PDF generation
├── loom_video_walkthrough_script.md             # 2-3 minute presentation script for Loom video
├── ops/                                         # Official Operations Track Assets
│   ├── README.md                                # Official ops guide
│   └── data/                                    # 5 Official CSV Tables (13 masked production records)
│       ├── 1_invoices.csv
│       ├── 2_faculty_form_unapproved.csv
│       ├── 3_booking_requests.csv
│       ├── 4_class_schedule_bookings.csv
│       └── reference_active_batches_and_students.csv
├── prompts/                                     # System Prompts (.md) used in AI Workflows
│   ├── 01_fuzzy_entity_resolution_prompt.md     # AI prompt for phone/email/typo reconciliation
│   ├── 02_exception_triaging_classifier_prompt.md # Deterministic reason codes, taxonomy & routing
│   └── 03_dynamic_communication_drafting_prompt.md # Dynamic WhatsApp/Slack communication templates
├── results/                                     # Output Artifacts from Reconciliation Engine
│   ├── auto_approved_bookings.csv               # 144 generated class schedule booking rows
│   ├── flagged_exceptions.csv                   # 7 standardized exceptions with SLAs & remediation
│   ├── actionable_notifications.json            # 17 tailored WhatsApp/Slack notification payloads
│   ├── reconciliation_summary.json              # Aggregate KPIs, hours saved, and speed benchmarks
│   └── forensic_audit_report.json               # Record-by-record forensic analysis of all 13 invoices
└── workflows_or_scripts/                        # Production Engine, Tests, Workflow Export & Dashboard
    ├── reconciliation_engine.py                 # Core AI/No-Code reconciliation & auto-approval engine
    ├── test_reconciliation.py                   # Automated test suite (9 unit & integration tests)
    ├── n8n_renewal_workflow.json                # Complete n8n automation workflow JSON export
    ├── generate_pdf_report.py                   # Chrome Headless PDF generation script
    └── dashboard/                               # Live Morning Operations Dashboard
        ├── index.html                           # Executive dashboard interface
        ├── app.js                               # Dynamic data bindings, SLA timers & 1-click actions
        └── styles.css                           # Modern operations command center styling
```

---

## 🔍 Forensic Problem Audit & Edge Case Discovery (Deliverable A)

Our audit of the 13 official records in `./ops/data/` revealed that **84.6% of renewals in the status quo experience human failure, data mismatches, or execution drop-offs**:

| Invoice ID | Student & Educator | Status & Net | Root Cause & Failure Mode | AI Engine Verdict |
| :--- | :--- | :--- | :--- | :--- |
| **#84901** | Aa***v Sh***a<br>Ms. Rhea B*** | Paid<br>₹12,000 | **Historical Baseline:** Identical renewal took 1h 45m and 3 manual handoffs. | `LEGACY_COMPLETED` |
| **#84902** | Di***a Na***r<br>Mr. Vikram S*** | Paid<br>₹10,500 | **Ops Execution Drop-Off:** Booking request #5502 approved but classes never scheduled. Stalled >42h. | `AUTO_RECOVERED` (Scheduled 24 sessions) |
| **#84903** | Ka***r Ve***a<br>Acharya Nancy | Paid<br>₹9,000 | **Queue Inertia:** Clean renewal sitting unapproved in queue for >24 hours. | `AUTO_APPROVED` (Zero-Touch) |
| **#84904** | An***a Iy***r<br>Ms. Rhea B*** | Paid<br>₹12,000 | **Phone Discrepancy:** Mother paid from alternate mobile (+91-9844XXXX77 vs +91-9844XXXX04). | `AUTO_APPROVED` (AI Phone Match) |
| **#84905** | Re***h Pa***l<br>Coach Arvind | Paid<br>₹11,000 | **Batch Overflow:** Batch 9205 reached 6/6 max capacity. Booking rejected downstream. | `ERR_BATCH_FULL` (WhatsApp Sister Batch) |
| **#84906** | Zo***a Kh***n<br>Ms. Rhea B*** | Paid<br>₹18,000 | **Orphaned Invoice (GCC):** Paid ₹18,000 via Stripe; teacher forgot renewal form (>24h). | `ERR_ORPHANED_INVOICE` (WhatsApp Alert) |
| **#84907** | Vi***n Jo***i<br>Ms. Simran D*** | Paid<br>₹7,600 | **Retention Scholarship:** Net ₹7,600 vs std ₹9,500. Stalled pending manual discount check. | `AUTO_APPROVED` (Policy Auto-Verified) |
| **#84908** | Si***a Ma***a<br>Acharya Nancy | Paid<br>₹22,000 | **Duplicate Submission:** Teacher experienced browser freeze, submitted forms #3308 & #3309. | `AUTO_APPROVED` (Deduplicated) |
| **#84909** | Ad***t Ku***i<br>Mr. Vikram S*** | Partially Paid<br>₹5,250 | **Installment Mismatch:** Paid 50% installment (₹5,250), teacher entered full ₹10,500. | `ERR_PARTIAL_PAYMENT` (Booked 12 Sessions) |
| **#84910** | My***a Re***y<br>Coach Arvind | Paid<br>₹11,000 | **Orphaned Invoice:** Payment completed at 11:20 AM; zero educator form submitted. | `ERR_ORPHANED_INVOICE` (Slack Alert) |
| **#84911** | Is***n Gu***a<br>Ms. Simran D*** | Failed<br>₹12,000 | **Gateway Failure:** Teacher submitted form based on screenshot; gateway marked Failed! | `ERR_GATEWAY_FAILED` (Payment Retry Link) |
| **#84912** | Ta***a Me***n<br>Acharya Nancy | Paid<br>₹9,000 | **Schedule Change:** Parent requested shift from Wed/Fri to weekend slot. Stalled in Ops. | `ERR_SLOT_CHANGE_REQUESTED` (Slot Picker) |
| **#84913** | De***a Me***a<br>Ms. Mary M*** | Paid<br>₹11,500 | **Transposition Typo:** Teacher entered invoice ID 84931 instead of 84913. Ops drops ticket. | `AUTO_APPROVED` (Typo Auto-Repaired) |

---

## ⚡ The Re-Engineered "Zero-Touch" Workflow (Deliverable B)

```
[Parent Pays via Razorpay / Stripe]
            │
            ▼
[Payment Webhook Event (Carries student_id, batch_id metadata)]
            │
            ├───────────────────────────────────────────────────────┐
            │                                                       │
  [Zero-Touch Fast Track]                                  [Smart Exception Engine]
            │                                                       │
  • Payment Status == 'Paid'                              • Failed Payment ──► Auto-Send WhatsApp Retry Link
  • Same Batch Renewal == 'Yes'                           • Batch 6/6 Full ──► Auto-Send WhatsApp Sister Batch Options
  • Capacity Available (<6/6)                             • Installment ────► Auto-Book 12 Sessions + Milestone Trigger
  • Fee == Standard or Authorized Promo                   • Typo / Transposition ──► AI Entity Resolution Repair
            │                                                       │
            ▼                                                       ▼
[Auto-Insert into booking_requests (Completed)]           [Route to Live Ops Triage Queue with SLA Countdown]
            │
            ▼
[Auto-Generate 24 Rows in class_schedule_bookings]
            │
            ▼
[Multi-Channel Instant Confirmation Dispatch]
  • Parent: WhatsApp interactive confirmation + 1-Click .ics Calendar Sync
  • Educator: Slack notification with updated batch roster
  • TAT: < 45 Seconds | Ops Touches: ZERO
```

---

## 🛠️ How to Run & Verify the Project

### 1. Execute the Reconciliation Engine Prototype
```powershell
# Run the core reconciliation and auto-approval engine
python workflows_or_scripts/reconciliation_engine.py
```
**Expected Output:**
- Audits 13 invoices.
- Auto-approves clean renewals and generates 144 class schedule bookings in `results/auto_approved_bookings.csv`.
- Classifies 7 exceptions with SLA reason codes in `results/flagged_exceptions.csv`.
- Generates 17 customized notifications in `results/actionable_notifications.json`.

### 2. Run the Automated Test Suite
```powershell
python -m unittest workflows_or_scripts/test_reconciliation.py
```
**Expected Output:**
```
Ran 9 tests in 0.072s
OK
```

### 3. Open the Morning Live Ops Dashboard
Open `workflows_or_scripts/dashboard/index.html` directly in any web browser:
```powershell
# Open on Windows
Start-Process "workflows_or_scripts/dashboard/index.html"
```
Features real-time KPI cards, interactive SLA urgency filters, batch capacity bars, and 1-click triage action modals.

### 4. Inspect or Re-Generate the PDF Case Report
```powershell
python workflows_or_scripts/generate_pdf_report.py
```
Compiles `Case_Report_Bambinos_Operations_AI_PM.pdf` (435 KB, publication-grade executive presentation covering Deliverables A, B, C, and D).

---

## 📈 Quantified Business Impact & ROI

| Metric | Status Quo (Baseline) | Automated Target | Business Impact |
| :--- | :--- | :--- | :--- |
| **Payment-to-Schedule TAT** | 18.4 Hours | **< 45 Seconds** | 99.6% reduction; zero scheduling anxiety for parents |
| **Orphaned Invoice Rate** | 23.1% | **0.0%** | Webhook metadata eliminates teacher form dependence |
| **First-Time-Right (FTR) Rate** | 15.4% | **> 92.0%** | Vast majority of renewals proceed touch-free |
| **Ops Labor Saved** | 14.5 min / renewal | **< 45 sec (Exceptions)** | **140+ hours/month saved** across 10-person Ops team |
| **Scheduling Gap Churn** | ~6.5% | **< 0.5%** | **Protects ₹4,80,000+ in monthly recurring revenue** |

---

## 🗓️ 30-60-90 Day Phased Rollout Plan

- **Days 1–30 (Shadow Mode & Pilot Cohort):**
  - Run engine in parallel shadow mode (zero production table mutations).
  - Pilot with top 20 high-volume educators (English & Maths).
  - Calibrate AI fuzzy matching thresholds to achieve 100% precision.
  - Zero disruption to live classes.
- **Days 31–60 (Metadata Webhooks & Ops Reskilling):**
  - Integrate metadata-carrying renewal payment links, eliminating form submissions for 70% of renewals.
  - Scale rollout to 100 educators across Chess, Gita, and Science tracks.
  - Reskill Ops team from manual copy-paste verifiers to Exception Managers.
- **Days 61–90 (100% Organization Rollout & WhatsApp Bot):**
  - Full deployment across all 200+ educators.
  - Launch self-serve WhatsApp slot selection bot for batch changes and oversubscribed classes.
  - Achieve >85% overall Zero-Touch rate and 140+ hours/month labor savings.

---

## 🎥 Presentation & Live Case Review Walkthrough
Refer to [`loom_video_walkthrough_script.md`](./loom_video_walkthrough_script.md) for a structured 2–3 minute speaking script designed for presentation to the Head of Operations.
