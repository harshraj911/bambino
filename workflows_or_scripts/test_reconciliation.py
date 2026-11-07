#!/usr/bin/env python3
"""
Unit and Integration Tests for Bambinos.live Renewal Reconciliation Engine
"""

import unittest
import os
import sys
import csv
import json

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from reconciliation_engine import RenewalReconciliationEngine

class TestRenewalReconciliationEngine(unittest.TestCase):
    def setUp(self):
        self.engine = RenewalReconciliationEngine()
        self.results = self.engine.run_reconciliation()

    def test_total_invoices_audited(self):
        """Verifies all 13 invoices from the official test dataset were evaluated."""
        self.assertEqual(len(self.engine.invoices), 13)
        self.assertEqual(len(self.results['forensic_cases']), 13)

    def test_transposition_typo_repair(self):
        """Verifies teacher transposition typo (84931 -> 84913) was repaired."""
        case = next(c for c in self.results['forensic_cases'] if c['invoice_id'] == '84913')
        self.assertEqual(case['verdict'], 'AUTO_APPROVED')
        self.assertIn('typo_repair_note', case)
        self.assertIn('84931', case['typo_repair_note'])

    def test_duplicate_submission_handling(self):
        """Verifies duplicate forms (3308, 3309) for invoice 84908 were deduplicated."""
        forms_cleaned = self.engine.resolve_transpositions_and_typos()
        _, duplicates = self.engine.deduplicate_forms(forms_cleaned)
        self.assertEqual(len(duplicates), 1)
        self.assertEqual(duplicates[0]['id'], '3309')

    def test_orphaned_invoices_detection(self):
        """Verifies invoices 84906 and 84910 without faculty forms are flagged."""
        orphans = [c for c in self.results['forensic_cases'] if c['reason_code'] == 'ERR_ORPHANED_INVOICE']
        orphan_ids = {c['invoice_id'] for c in orphans}
        self.assertIn('84906', orphan_ids)
        self.assertIn('84910', orphan_ids)

    def test_gateway_failed_flagged(self):
        """Verifies failed invoice 84911 is blocked from class scheduling."""
        case = next(c for c in self.results['forensic_cases'] if c['invoice_id'] == '84911')
        self.assertEqual(case['reason_code'], 'ERR_GATEWAY_FAILED')
        self.assertEqual(case['payment_status'], 'Failed')

    def test_batch_capacity_overflow(self):
        """Verifies oversubscribed batch 9205 (6/6 full) is caught for student 68105."""
        case = next(c for c in self.results['forensic_cases'] if c['invoice_id'] == '84905')
        self.assertEqual(case['reason_code'], 'ERR_BATCH_FULL')

    def test_partial_payment_installment(self):
        """Verifies partial installment (5250 INR) is detected on invoice 84909."""
        case = next(c for c in self.results['forensic_cases'] if c['invoice_id'] == '84909')
        self.assertEqual(case['reason_code'], 'ERR_PARTIAL_PAYMENT')

    def test_phone_mismatch_auto_reconciled(self):
        """Verifies alternate phone number on invoice 84904 was matched via entity resolution."""
        case = next(c for c in self.results['forensic_cases'] if c['invoice_id'] == '84904')
        self.assertEqual(case['verdict'], 'AUTO_APPROVED')
        self.assertIn('entity_resolution_note', case)

    def test_session_generation_integrity(self):
        """Verifies auto-approved class schedules have valid dates and intervals."""
        bookings = self.results['auto_approved_bookings']
        self.assertGreater(len(bookings), 0)
        for b in bookings:
            self.assertEqual(b['booking_type'] in ['Auto_Approved_Zero_Touch', 'Auto_Recovered_Renewal'], True)
            self.assertNotEqual(b['class_date'], '')
            self.assertNotEqual(b['start_time'], '')
            self.assertNotEqual(b['end_time'], '')

if __name__ == '__main__':
    unittest.main()
