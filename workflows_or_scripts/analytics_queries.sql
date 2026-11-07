-- =====================================================================
-- Bambinos.live — Operations Analytics & Metabase Query Pack
-- Re-Engineering Student Renewal -> Class Scheduling Pipeline
-- =====================================================================

-- ---------------------------------------------------------------------
-- QUERY 1: Morning Executive Alert — Stuck & Orphaned Invoices (>12 Hours)
-- Used by Head of Operations every morning at 08:00 AM
-- ---------------------------------------------------------------------
SELECT 
    i.id AS invoice_id,
    i.invoice_number,
    i.student_id,
    r.student_name_masked,
    i.educator_id,
    r.educator_name,
    i.net_amount,
    i.currency,
    i.payment_gateway,
    i.paid_at,
    TIMESTAMPDIFF(HOUR, i.paid_at, NOW()) AS aging_hours,
    CASE 
        WHEN f.id IS NULL THEN 'ERR_ORPHANED_INVOICE (Missing Form)'
        WHEN f.approval_status = 'Pending' THEN 'ERR_OPS_QUEUE_STALL (Unapproved Form)'
        WHEN b.id IS NOT NULL AND b.batch_allocated = 'No' THEN 'ERR_OPS_EXECUTION_DROPPED (Unscheduled Booking)'
        ELSE 'OTHER_INSPECTION_NEEDED'
    END AS failure_reason,
    CASE 
        WHEN TIMESTAMPDIFF(HOUR, i.paid_at, NOW()) >= 24 THEN 'P0_CRITICAL'
        WHEN TIMESTAMPDIFF(HOUR, i.paid_at, NOW()) >= 12 THEN 'P1_HIGH'
        ELSE 'P2_MEDIUM'
    END AS sla_urgency_tier
FROM invoices i
LEFT JOIN reference_active_batches_and_students r ON i.student_id = r.student_id
LEFT JOIN faculty_form_unapproved f ON i.id = f.invoice_id
LEFT JOIN booking_requests b ON i.id = b.invoice_id
LEFT JOIN class_schedule_bookings c ON i.id = c.invoice_id
WHERE i.payment_status = 'Paid'
  AND i.is_renewal = 'Yes'
  AND (c.id IS NULL OR b.batch_allocated = 'No' OR f.id IS NULL)
  AND TIMESTAMPDIFF(HOUR, i.paid_at, NOW()) >= 12
ORDER BY aging_hours DESC;


-- ---------------------------------------------------------------------
-- QUERY 2: Batch Capacity Utilization & Overbooking Warning Radar
-- Identifies batches near or at maximum capacity (e.g. 5/6 or 6/6)
-- ---------------------------------------------------------------------
SELECT 
    cb.current_classbatch_id AS batch_id,
    cb.classbatch_name,
    cb.category_name,
    cb.educator_name,
    cb.batch_days,
    cb.batch_start_time,
    cb.active_students_count,
    cb.max_batch_size,
    ROUND((cb.active_students_count / cb.max_batch_size) * 100, 1) AS capacity_utilization_pct,
    CASE 
        WHEN cb.active_students_count >= cb.max_batch_size THEN 'RED_ALERT_FULL'
        WHEN cb.active_students_count = cb.max_batch_size - 1 THEN 'AMBER_ALERT_NEAR_CAPACITY'
        ELSE 'GREEN_CAPACITY_OK'
    END AS capacity_status,
    (cb.max_batch_size - cb.active_students_count) AS seats_remaining
FROM reference_active_batches_and_students cb
GROUP BY cb.current_classbatch_id
ORDER BY capacity_utilization_pct DESC, cb.active_students_count DESC;


-- ---------------------------------------------------------------------
-- QUERY 3: Payment-to-Schedule Turnaround Time (TAT) & Velocity Analysis
-- Measures P50, P90, and Average TAT in minutes/hours
-- ---------------------------------------------------------------------
SELECT 
    DATE(i.paid_at) AS renewal_date,
    COUNT(DISTINCT i.id) AS total_renewals_paid,
    COUNT(DISTINCT c.invoice_id) AS successfully_scheduled,
    ROUND(
        COUNT(DISTINCT c.invoice_id) / COUNT(DISTINCT i.id) * 100, 1
    ) AS fulfillment_rate_pct,
    ROUND(
        AVG(TIMESTAMPDIFF(MINUTE, i.paid_at, c.created_at)), 1
    ) AS avg_turnaround_minutes,
    ROUND(
        AVG(TIMESTAMPDIFF(HOUR, i.paid_at, c.created_at)), 1
    ) AS avg_turnaround_hours,
    ROUND(
        SUM(CASE WHEN TIMESTAMPDIFF(MINUTE, i.paid_at, c.created_at) <= 5 THEN 1 ELSE 0 END) / COUNT(DISTINCT i.id) * 100, 1
    ) AS zero_touch_rate_pct
FROM invoices i
JOIN class_schedule_bookings c ON i.id = c.invoice_id
WHERE i.payment_status = 'Paid'
  AND i.is_renewal = 'Yes'
GROUP BY DATE(i.paid_at)
ORDER BY renewal_date DESC;


-- ---------------------------------------------------------------------
-- QUERY 4: Educator Renewal Compliance & Delay Scorecard
-- Measures how quickly educators submit renewal forms after parent payment
-- ---------------------------------------------------------------------
SELECT 
    f.educator_id,
    f.educator_name,
    COUNT(DISTINCT i.id) AS total_renewals_pitched,
    COUNT(DISTINCT f.id) AS forms_submitted,
    COUNT(DISTINCT i.id) - COUNT(DISTINCT f.id) AS orphaned_invoices_count,
    ROUND(
        AVG(TIMESTAMPDIFF(MINUTE, i.paid_at, f.created_at)), 1
    ) AS avg_educator_submission_delay_min,
    SUM(CASE WHEN TIMESTAMPDIFF(HOUR, i.paid_at, f.created_at) > 4 THEN 1 ELSE 0 END) AS delays_exceeding_4h
FROM invoices i
LEFT JOIN faculty_form_unapproved f ON i.id = f.invoice_id
WHERE i.payment_status = 'Paid'
  AND i.is_renewal = 'Yes'
GROUP BY f.educator_id, f.educator_name
ORDER BY orphaned_invoices_count DESC, avg_educator_submission_delay_min DESC;


-- ---------------------------------------------------------------------
-- QUERY 5: Revenue at Risk & Scheduling Gap Churn Predictor
-- Identifies paid students who missed their recurring class day due to Ops lag
-- ---------------------------------------------------------------------
SELECT 
    i.id AS invoice_id,
    i.student_id,
    r.student_name_masked,
    r.classbatch_name,
    r.batch_days,
    i.net_amount AS revenue_at_risk_inr,
    i.paid_at,
    NOW() AS current_check_time,
    TIMESTAMPDIFF(HOUR, i.paid_at, NOW()) AS hours_elapsed_without_scheduling
FROM invoices i
JOIN reference_active_batches_and_students r ON i.student_id = r.student_id
LEFT JOIN class_schedule_bookings c ON i.id = c.invoice_id
WHERE i.payment_status = 'Paid'
  AND i.is_renewal = 'Yes'
  AND c.id IS NULL
  AND TIMESTAMPDIFF(HOUR, i.paid_at, NOW()) >= 24;
