# Bambinos.live — AI Program Manager (Operations)
## 2–3 Minute Loom Video Walkthrough Script & Presentation Guide

**Target Audience:** Head of Operations & Executive Reviewers  
**Duration:** 2 Minutes 45 Seconds  
**Objective:** High-conviction demonstration of the problem discovery, the Zero-Touch re-engineered architecture, the working Python reconciliation engine, and the morning live operations dashboard.

---

### [0:00 – 0:35] Part 1: The Core Problem — Questioning the Status Quo
- **Screen:** Show the current 4-step diagram (`invoices` → `faculty_form_unapproved` → `booking_requests` → `class_schedule_bookings`).
- **Speaking Script:**
  > *"Hi everyone, I’m Harsh Vardhan. Today, I’m walking you through my solution for re-engineering and automating Bambinos.live’s student renewal pipeline.
  >
  > When analyzing the current 4-table process, the biggest insight wasn't just where students get stuck — it was questioning why this chain exists in the first place. Today, moving a renewing student from payment to classes takes an average of 18.4 hours and multiple manual handoffs. 
  >
  > The teacher is forced to act as a human copy-paste bridge between Razorpay and Ops. Because teachers are focused on teaching, this manual step causes 100% of our orphaned invoices, transpositions, and weekend scheduling delays."*

---

### [0:35 – 1:15] Part 2: The Re-Engineered "Zero-Touch" Fast Track
- **Screen:** Show `Case_Report_Bambinos_Operations_AI_PM.pdf` Page 4 (Architecture & n8n workflow diagram).
- **Speaking Script:**
  > *"Our solution introduces the 'Zero-Touch' Fast-Track. By passing student and batch metadata directly into payment gateway links, Razorpay's webhook carries 100% of the renewal context the instant a parent pays.
  >
  > For clean renewals — where a child continues in the same batch with capacity — the engine instantly creates the booking, generates all 24 class schedule rows, sends a WhatsApp confirmation with a 1-click calendar invite to the parent, and updates the teacher's roster on Slack.
  >
  > Total execution turnaround time drops from 18 hours to under 45 seconds, with zero human touches required."*

---

### [1:15 – 2:05] Part 3: Live Prototype & Edge-Case Demonstration
- **Screen:** Switch to terminal / VS Code. Run `python workflows_or_scripts/reconciliation_engine.py` and `python -m unittest workflows_or_scripts/test_reconciliation.py`.
- **Speaking Script:**
  > *"Here is the working prototype built in Python and tested against the 13 production records in the official dataset:
  >
  > Watch how it handles edge cases that typically break manual ops:
  > 1. **Invoice 84913:** The educator made a transposition typo, entering invoice ID 84931. Our AI Entity Resolution engine matched the student ID and educator history, repaired the typo, and auto-scheduled the renewal.
  > 2. **Invoice 84904:** The mother paid from an alternate phone number. The fuzzy matcher resolved the parent's surname and student record, avoiding manual stall.
  > 3. **Invoice 84905:** The batch was 6/6 full. Instead of failing silently, the engine flagged `ERR_BATCH_FULL` and dispatched automated WhatsApp sister-batch options to the parent.
  > 4. **Invoice 84911:** The teacher thought UPI was processing, but the gateway marked it 'Failed'. The engine blocked class booking and sent a secure 1-click retry link to the parent."*

---

### [2:05 – 2:45] Part 4: The Head of Ops Morning Dashboard & Rollout
- **Screen:** Switch to browser showing `workflows_or_scripts/dashboard/index.html`.
- **Speaking Script:**
  > *"Every morning at 8:00 AM, the Head of Operations sees this command center. 
  >
  > At a glance, you see our Zero-Touch rate, orphaned invoices >12h, and unscheduled bookings like Invoice 84902, which we recovered in 1 click. The exception table organizes tickets by SLA urgency, with pre-drafted WhatsApp and Slack actions.
  >
  > Finally, our 30-60-90 day plan rolls this out smoothly across 200+ teachers. We start with a 30-day shadow mode for zero class disruption, transition Ops into Exception Managers by Day 60, and achieve an 85%+ zero-touch rate by Day 90, saving 140+ hours per month.
  >
  > Thank you, and I look forward to our live case review!"*

