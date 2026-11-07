# Bambinos.live — AI Program Manager (Operations)
## Live Case Review Defense Guide: Head of Operations Interview Prep

**Role:** AI Program Manager (Operations)  
**Next Stage:** Live Case Review with Head of Operations  
**Assessment Topic:** Re-Engineering & Automating Student Renewal → Class Scheduling Pipeline

---

## 🎯 Strategic Framing & Opening Statement (First 60 Seconds)

> *"Good morning. When looking at the renewal pipeline, the natural instinct in traditional operations is to ask: 'How do we make teachers fill the Google Form faster, or how do we make Ops verify rows quicker?'
>
> My analysis took a first-principles approach: **Why does Step 2 exist at all?**
>
> In the status quo, the educator is burdened as an unpaid, manual data-entry bridge between Razorpay/Stripe and Ops. Because teachers are focused on child pedagogy, this manual bridge is the direct root cause of 100% of our orphaned invoices, transpositions, and weekend scheduling delays.
>
> By embedding student and batch metadata directly into payment gateway links, Razorpay's webhook carries 100% of the renewal context the instant a parent pays. For clean renewals—which make up over 75% of volume—we achieve **Zero-Touch auto-approval in under 45 seconds**. For the remaining messy records, we deploy targeted AI entity resolution and smart exception routing with strict SLAs, saving over **140 hours of Ops labor per month** and eliminating parent scheduling anxiety."*

---

## 💡 Anticipated Hard Questions & Bulletproof Answers

### Q1: "What if a payment webhook drops or arrives late from Razorpay/Stripe?"
- **The Operational Trap:** Trusting webhooks 100% without a fallback, leading to missed renewals.
- **Your Answer:**
  > *"We implement a **Dual-Layer Ingestion Architecture**:
  > 1. **Primary Layer (Push):** Webhook fires instantly on `payment.captured` for sub-minute Zero-Touch execution.
  > 2. **Safety Net Layer (Pull):** A recurring cron job runs every 15 minutes via our n8n automation, querying the Razorpay `orders` API for any captured transactions from the last 30 minutes that lack a matching row in `booking_requests`. 
  > This guarantees 100% data capture even during gateway outages, without burdening teachers or Ops."*

---

### Q2: "Why not just enforce a penalty or incentive for teachers to fill the form within 2 hours?"
- **The Operational Trap:** Trying to solve a process/technology design flaw with human behavior enforcement.
- **Your Answer:**
  > *"Operational friction is almost never solved by policing behavior. Teachers are hired, evaluated, and motivated by teaching quality and parent NPS, not data entry.
  > 
  > Every minute a teacher spends copying invoice links, checking student IDs, or typing remarks is cognitive overhead stolen from lesson preparation. Furthermore, human copy-pasting inherently introduces typos (like the `84931` transposition in Invoice 84913) and duplicate submissions (Forms 3308 & 3309).
  > 
  > By removing form entry for clean renewals, we win the teachers' immediate buy-in and eliminate the single point of failure completely."*

---

### Q3: "What if a parent pays using their spouse's phone or company card, and the name doesn't match at all?"
- **The Operational Trap:** Assuming simple regex or exact string matching is sufficient.
- **Your Answer:**
  > *"This is where our **Multi-Attribute AI Entity Resolution Engine** comes into play:
  > In our prompt (`prompts/01_fuzzy_entity_resolution_prompt.md`), we use a weighted composite confidence score:
  > - Student ID match: **+0.35**
  > - Parent surname / student name fuzzy match (Levenshtein $\ge$ 85%): **+0.25**
  > - Educator ID & Class ID match: **+0.15**
  > - Amount match against master fee table: **+0.15**
  > - Phone/Email match: **+0.10**
  > 
  > If the parent's phone is totally new (like Invoice 84904 where mother paid from her number), the system still scores **0.90 confidence** because Student ID 68104, educator Rhea B***, and class ID 104 align.
  > If the score falls between 0.65 and 0.84, it doesn't fail silently—it lands in the Ops Triage Queue with pre-computed explanation notes for 1-click verification."*

---

### Q4: "How do you handle a parent paying a 50% installment without double-billing or losing track of the remaining balance?"
- **The Operational Trap:** Either booking all 24 classes (revenue leakage) or rejecting the payment (customer churn).
- **Your Answer:**
  > *"We treat installments as a structured milestone workflow (demonstrated in Invoice 84909):
  > 1. When the payment of ₹5,250 arrives against a ₹10,500 course fee, the engine flags `ERR_PARTIAL_PAYMENT`.
  > 2. Instead of stalling, it auto-books **12 sessions** (exactly 50% of the term) in `class_schedule_bookings`.
  > 3. It automatically schedules an automated milestone trigger on **Session 10** that sends a polite WhatsApp payment reminder with a direct link for the remaining ₹5,250.
  > 4. The parent experiences zero class disruption, while finance eliminates revenue leakage."*

---

### Q5: "How will you roll this out across 200+ teachers without breaking live class schedules during the transition?"
- **The Operational Trap:** Doing a high-risk 'big bang' launch on Monday morning.
- **Your Answer:**
  > *"We follow a phased 30-60-90 day change management plan:
  > - **Days 1–30 (Shadow Mode & Top 20 Pilot):** The engine runs in read-only shadow mode alongside legacy Ops for 10 days to benchmark accuracy. Then, we pilot with our top 20 English & Maths educators. Legacy forms remain active as an emergency fallback, guaranteeing 0% class disruption.
  > - **Days 31–60 (Metadata Webhooks & Scaling):** We expand to 100 educators. Metadata payment links eliminate 70% of forms. We re-train the 10-person Ops team from 'data copiers' to 'Exception Managers'.
  > - **Days 61–90 (100% Rollout & Self-Serve WhatsApp Bot):** Full organization onboarding across India, GCC, and US/UK timezones. Interactive WhatsApp bot resolves slot changes and full batches automatically. Target: >85% Zero-Touch rate and 140+ hours/month saved."*

---

## 📊 Core Operational Metrics to Quote in the Interview

| Metric | Status Quo Baseline | Re-Engineered Target | Strategic Takeaway |
| :--- | :--- | :--- | :--- |
| **Payment-to-Schedule TAT** | 18.4 Hours | **< 45 Seconds** | 99.6% reduction in operational latency |
| **Orphaned Invoice Rate** | 23.1% (2 of 13) | **0.0%** | Zero lost payments; zero invisible dropouts |
| **First-Time-Right (FTR)** | 15.4% | **> 92.0%** | Scales renewals without linear Ops headcount growth |
| **Ops Labor Saved** | 14.5 min / ticket | **< 45 sec** | **140+ hours/month saved** across 10-person team |
| **Revenue Protected** | High leakage | **₹4,80,000 / mo** | Eliminates scheduling-gap dropout churn |
