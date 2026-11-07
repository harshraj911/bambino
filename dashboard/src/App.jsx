import React, { useState } from 'react';
import { 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  Zap, 
  Users, 
  Send, 
  MessageSquare, 
  Search, 
  RefreshCw, 
  Download, 
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  Calendar,
  Layers,
  Sparkles,
  X
} from 'lucide-react';
import { initialInvoices, initialBatches } from './data/mockData';

export default function App() {
  const [invoices, setInvoices] = useState(initialInvoices);
  const [batches, setBatches] = useState(initialBatches);
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  // KPI Calculations
  const totalInvoices = invoices.length;
  const autoApprovedCount = invoices.filter(i => i.verdict === 'AUTO_APPROVED').length;
  const exceptionCount = invoices.filter(i => i.verdict === 'EXCEPTION').length;
  const criticalCount = invoices.filter(i => i.severity === 'critical').length;
  const highCount = invoices.filter(i => i.severity === 'high').length;
  const mediumCount = invoices.filter(i => i.severity === 'medium').length;
  const zeroTouchPct = Math.round((autoApprovedCount / (totalInvoices - 1)) * 100);

  // Trigger Toast
  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Filter Logic
  const filteredInvoices = invoices.filter(item => {
    const matchesSearch = 
      item.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.studentId.includes(searchQuery) ||
      item.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.educatorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.reasonCode.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (activeFilter === 'all') return item.verdict === 'EXCEPTION';
    if (activeFilter === 'critical') return item.severity === 'critical';
    if (activeFilter === 'high') return item.severity === 'high';
    if (activeFilter === 'medium') return item.severity === 'medium';
    if (activeFilter === 'approved') return item.verdict === 'AUTO_APPROVED';
    return true;
  });

  // Handle Action Execution from Modal
  const handleExecuteRemediation = (ticket) => {
    setInvoices(prev => prev.map(inv => {
      if (inv.id === ticket.id) {
        return {
          ...inv,
          verdict: 'AUTO_APPROVED',
          statusType: 'approved',
          reasonCode: `RESOLVED_BY_ACTION (${ticket.actionLabel})`,
          remediation: `Remediated via ${ticket.channel} dispatch to ${ticket.recipient}`,
          severity: 'none',
          sla: 'Fulfill',
          agingHours: 'Resolved'
        };
      }
      return inv;
    }));

    // If it was dropped booking #84902, increment scheduled sessions
    if (ticket.id === '84902') {
      showToast('🎉 24 Sessions Auto-Scheduled in class_schedule_bookings for Batch 9202!');
    } else {
      showToast(`⚡ Dispatched automated ${ticket.channel} to ${ticket.recipient}!`);
    }

    setSelectedTicket(null);
  };

  // Simulate Incoming Webhook Event
  const simulateIncomingWebhook = () => {
    const newId = (84914 + Math.floor(Math.random() * 50)).toString();
    const newInv = {
      id: newId,
      invoiceNumber: `BMB-INV-2026-${newId}`,
      studentId: "68114",
      studentName: "Sa***a Pa***l",
      parentName: "Vi***k Pa***l",
      mobile: "+91-9877XXXX99",
      email: "vi***k.p***@gmail.com",
      educatorId: "1102",
      educatorName: "Ms. Rhea B***",
      category: "English",
      batchId: "9201",
      batchName: "YC-G4-Batch-A",
      amount: 12000,
      netAmount: 12000,
      currency: "INR",
      gateway: "Razorpay",
      status: "Paid",
      paidAt: new Date().toLocaleTimeString(),
      isRenewal: "Yes",
      verdict: "AUTO_APPROVED",
      reasonCode: "ZERO_TOUCH_FAST_TRACK",
      severity: "none",
      agingHours: "<30s",
      sla: "Fulfill",
      remediation: "Metadata payment link detected. Clean same-batch renewal auto-approved!",
      sessionsScheduled: 24,
      statusType: "approved"
    };

    setInvoices(prev => [newInv, ...prev]);
    showToast(`🔔 Live Webhook Received: Invoice #${newId} (₹12,000) Auto-Scheduled in 28 seconds!`);
  };

  // Export CSV
  const handleExportCSV = () => {
    const headers = "Invoice ID,Student,Educator,Amount,Status,Reason Code,Verdict,Remediation\n";
    const rows = invoices.map(i => 
      `"${i.id}","${i.studentName}","${i.educatorName}","${i.netAmount}","${i.status}","${i.reasonCode}","${i.verdict}","${i.remediation}"`
    ).join("\n");
    
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bambinos_operations_audit_${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
    showToast('📥 Reconciliation audit report downloaded successfully.');
  };

  return (
    <div className="dashboard-wrapper">
      {/* Toast Notification */}
      {toastMessage && (
        <div style={{
          position: 'fixed',
          top: '24px',
          right: '24px',
          background: 'linear-gradient(135deg, #1e40af, #2563eb)',
          color: '#ffffff',
          padding: '12px 20px',
          borderRadius: '10px',
          boxShadow: '0 10px 25px rgba(0,0,0,0.4)',
          fontWeight: '600',
          fontSize: '13.5px',
          zIndex: 999,
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          border: '1px solid rgba(255,255,255,0.2)'
        }}>
          <Sparkles size={18} />
          {toastMessage}
        </div>
      )}

      {/* Header Bar */}
      <header className="header-bar">
        <div className="brand-section">
          <div className="brand-badge">BAMBINOS.LIVE</div>
          <div>
            <div className="brand-title">Operations Renewal & Class Scheduling Engine</div>
            <div className="brand-subtitle">AI & No-Code Real-Time Re-Engineering Command Center</div>
          </div>
        </div>

        <div className="actions-section">
          <div className="live-pill">
            <span className="pulse-dot"></span>
            LIVE WEBHOOK ACTIVE
          </div>
          <button className="btn-secondary" onClick={simulateIncomingWebhook}>
            <Zap size={15} color="#fbbf24" />
            Simulate Webhook
          </button>
          <button className="btn-primary" onClick={handleExportCSV}>
            <Download size={15} />
            Export Audit CSV
          </button>
        </div>
      </header>

      {/* KPI Row */}
      <div className="kpi-row">
        <div className="kpi-box">
          <div className="kpi-box-top">
            <span className="kpi-label">Total Invoices</span>
            <div className="kpi-icon-wrap" style={{ background: 'rgba(59, 130, 246, 0.15)', color: '#60a5fa' }}>
              <Layers size={18} />
            </div>
          </div>
          <div className="kpi-val">{totalInvoices}</div>
          <div className="kpi-foot" style={{ color: '#94a3b8' }}>
            <span>₹1,54,850 Total Volume</span>
          </div>
        </div>

        <div className="kpi-box">
          <div className="kpi-box-top">
            <span className="kpi-label">Zero-Touch Velocity</span>
            <div className="kpi-icon-wrap" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#34d399' }}>
              <Zap size={18} />
            </div>
          </div>
          <div className="kpi-val" style={{ color: '#34d399' }}>{zeroTouchPct}%</div>
          <div className="kpi-foot" style={{ color: '#34d399' }}>
            <CheckCircle2 size={13} />
            <span>&lt;45s Avg Schedule TAT</span>
          </div>
        </div>

        <div className="kpi-box">
          <div className="kpi-box-top">
            <span className="kpi-label">Critical Exceptions</span>
            <div className="kpi-icon-wrap" style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#f87171' }}>
              <AlertTriangle size={18} />
            </div>
          </div>
          <div className="kpi-val" style={{ color: '#f87171' }}>{criticalCount}</div>
          <div className="kpi-foot" style={{ color: '#f87171' }}>
            <span>Orphaned Invoices (&gt;4h)</span>
          </div>
        </div>

        <div className="kpi-box">
          <div className="kpi-box-top">
            <span className="kpi-label">Open Triage Queue</span>
            <div className="kpi-icon-wrap" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24' }}>
              <Clock size={18} />
            </div>
          </div>
          <div className="kpi-val" style={{ color: '#fbbf24' }}>{exceptionCount}</div>
          <div className="kpi-foot" style={{ color: '#fbbf24' }}>
            <span>Requires Action / Triage</span>
          </div>
        </div>

        <div className="kpi-box">
          <div className="kpi-box-top">
            <span className="kpi-label">Ops Hours Saved</span>
            <div className="kpi-icon-wrap" style={{ background: 'rgba(139, 92, 246, 0.15)', color: '#c084fc' }}>
              <ShieldCheck size={18} />
            </div>
          </div>
          <div className="kpi-val" style={{ color: '#c084fc' }}>{(autoApprovedCount * 0.35).toFixed(1)}h</div>
          <div className="kpi-foot" style={{ color: '#c084fc' }}>
            <span>140+ hrs/mo projected</span>
          </div>
        </div>
      </div>

      {/* Main Grid Layout */}
      <div className="main-layout">
        {/* Left Column: Exceptions & Renewals Table */}
        <div className="card-panel">
          <div className="panel-header">
            <div>
              <div className="panel-title">
                <Clock size={18} color="#60a5fa" />
                Live Exceptions & Renewal Triage
              </div>
              <p style={{ fontSize: '12px', color: '#94a3b8', marginTop: '4px' }}>
                Deterministic Error Codes • Multi-Channel Dispatch • SLA Prioritization
              </p>
            </div>

            <div className="filter-pills">
              <button 
                className={`filter-pill ${activeFilter === 'all' ? 'active' : ''}`}
                onClick={() => setActiveFilter('all')}
              >
                Exceptions ({exceptionCount})
              </button>
              <button 
                className={`filter-pill ${activeFilter === 'critical' ? 'active' : ''}`}
                onClick={() => setActiveFilter('critical')}
              >
                Critical ({criticalCount})
              </button>
              <button 
                className={`filter-pill ${activeFilter === 'high' ? 'active' : ''}`}
                onClick={() => setActiveFilter('high')}
              >
                High ({highCount})
              </button>
              <button 
                className={`filter-pill ${activeFilter === 'medium' ? 'active' : ''}`}
                onClick={() => setActiveFilter('medium')}
              >
                Medium ({mediumCount})
              </button>
              <button 
                className={`filter-pill ${activeFilter === 'approved' ? 'active' : ''}`}
                onClick={() => setActiveFilter('approved')}
              >
                Auto-Approved ({autoApprovedCount})
              </button>
            </div>
          </div>

          {/* Search Box */}
          <div style={{ position: 'relative', marginBottom: '16px' }}>
            <Search size={15} style={{ position: 'absolute', left: '12px', top: '10px', color: '#64748b' }} />
            <input 
              type="text" 
              placeholder="Search by student, educator, invoice #, reason code..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                background: '#101726',
                border: '1px solid #26334d',
                borderRadius: '8px',
                padding: '8px 12px 8px 36px',
                color: '#fff',
                fontSize: '13px',
                outline: 'none'
              }}
            />
          </div>

          {/* Table */}
          <div className="table-scroll">
            <table className="ops-table">
              <thead>
                <tr>
                  <th>Invoice ID</th>
                  <th>Student & Batch</th>
                  <th>Educator</th>
                  <th>Amount</th>
                  <th>Reason Code</th>
                  <th>Aging / SLA</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredInvoices.map(row => (
                  <tr key={row.id}>
                    <td>
                      <span className="mono" style={{ fontWeight: '700', color: '#60a5fa' }}>#{row.id}</span>
                      <div style={{ fontSize: '11px', color: '#64748b' }}>{row.gateway}</div>
                    </td>
                    <td>
                      <div style={{ fontWeight: '600' }}>{row.studentName}</div>
                      <div style={{ fontSize: '11px', color: '#94a3b8' }}>
                        ID: {row.studentId} • {row.batchName}
                      </div>
                    </td>
                    <td>
                      <div>{row.educatorName}</div>
                      <div style={{ fontSize: '11px', color: '#64748b' }}>{row.category}</div>
                    </td>
                    <td>
                      <div style={{ fontWeight: '700' }}>₹{row.netAmount.toLocaleString()}</div>
                      <div style={{ fontSize: '11px', color: row.status === 'Paid' ? '#34d399' : '#f87171' }}>
                        {row.status}
                      </div>
                    </td>
                    <td>
                      <span className={`badge-tag ${
                        row.severity === 'critical' ? 'critical' :
                        row.severity === 'high' ? 'high' :
                        row.severity === 'medium' ? 'medium' : 'approved'
                      }`}>
                        {row.reasonCode}
                      </span>
                      <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '3px', maxWidth: '240px' }}>
                        {row.remediation}
                      </div>
                    </td>
                    <td>
                      <div style={{ fontSize: '12px', color: '#e2e8f0' }}>{row.agingHours}</div>
                      <div style={{ 
                        fontSize: '11px', 
                        fontWeight: '700', 
                        color: row.sla.includes('Overdue') ? '#f87171' : row.sla === 'Fulfill' ? '#34d399' : '#fbbf24' 
                      }}>
                        {row.sla}
                      </div>
                    </td>
                    <td>
                      {row.verdict === 'EXCEPTION' ? (
                        <button 
                          className="action-cta-btn"
                          onClick={() => setSelectedTicket(row)}
                        >
                          <Zap size={13} />
                          {row.actionLabel || 'Remediate'}
                        </button>
                      ) : (
                        <span style={{ fontSize: '12px', color: '#34d399', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <CheckCircle2 size={14} />
                          Booked
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column: Capacity & Notifications */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Batch Capacity Tracker */}
          <div className="card-panel">
            <div className="panel-header">
              <div className="panel-title">
                <Users size={17} color="#34d399" />
                Live Batch Capacity Radar
              </div>
            </div>

            <div>
              {batches.map(b => {
                const pct = Math.round((b.count / b.max) * 100);
                const isFull = b.count >= b.max;
                const isNear = b.count === b.max - 1;
                return (
                  <div key={b.id} className="capacity-row">
                    <div>
                      <div style={{ fontWeight: '600', fontSize: '13px' }}>{b.name}</div>
                      <div style={{ fontSize: '11px', color: '#94a3b8' }}>
                        {b.educator} • {b.days} {b.time}
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <div className="capacity-progress-bg">
                        <div 
                          className="capacity-progress-fill"
                          style={{
                            width: `${pct}%`,
                            background: isFull ? '#ef4444' : isNear ? '#f59e0b' : '#10b981'
                          }}
                        />
                      </div>
                      <span className={`badge-tag ${isFull ? 'critical' : isNear ? 'high' : 'approved'}`}>
                        {b.count}/{b.max}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Architecture Callout */}
          <div className="card-panel" style={{ borderLeft: '4px solid #3b82f6' }}>
            <div style={{ fontWeight: '700', fontSize: '14px', color: '#60a5fa', marginBottom: '4px' }}>
              ⚡ Re-Engineered Zero-Touch Fast Track
            </div>
            <p style={{ fontSize: '12.5px', color: '#94a3b8', lineHeight: '1.5' }}>
              Razorpay/Stripe webhooks carry <code>student_id</code> & <code>classbatch_id</code> metadata. 
              Clean renewals bypass teacher Google Forms and manual Ops checks, scheduling 24 sessions in &lt;45 seconds.
            </p>
          </div>
        </div>
      </div>

      {/* Interactive Remediation Modal */}
      {selectedTicket && (
        <div className="modal-overlay">
          <div className="modal-box">
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="mono" style={{ fontWeight: '800', color: '#60a5fa' }}>#{selectedTicket.id}</span>
                <span style={{ fontWeight: '700', fontSize: '15px' }}>Remediation Dispatcher</span>
              </div>
              <button 
                onClick={() => setSelectedTicket(null)}
                style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>

            <div className="modal-body">
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px', fontSize: '12.5px', marginBottom: '14px' }}>
                <div>
                  <span style={{ color: '#64748b', display: 'block' }}>Student:</span>
                  <strong>{selectedTicket.studentName} ({selectedTicket.studentId})</strong>
                </div>
                <div>
                  <span style={{ color: '#64748b', display: 'block' }}>Educator:</span>
                  <strong>{selectedTicket.educatorName}</strong>
                </div>
                <div>
                  <span style={{ color: '#64748b', display: 'block' }}>Reason Code:</span>
                  <span className="badge-tag high">{selectedTicket.reasonCode}</span>
                </div>
                <div>
                  <span style={{ color: '#64748b', display: 'block' }}>Dispatch Channel:</span>
                  <strong style={{ color: '#34d399' }}>{selectedTicket.channel} API</strong>
                </div>
              </div>

              <div style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '6px' }}>
                Recipient: <strong>{selectedTicket.recipient}</strong>
              </div>

              {/* Message Simulator Bubble */}
              <div className="message-bubble">
                <div style={{ fontSize: '11px', color: '#a7f3d0', fontWeight: '700', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <MessageSquare size={13} />
                  {selectedTicket.channel} Interactive Template
                </div>
                {selectedTicket.messagePreview}
              </div>
            </div>

            <div className="modal-footer">
              <button 
                className="btn-secondary" 
                onClick={() => setSelectedTicket(null)}
              >
                Cancel
              </button>
              <button 
                className="btn-primary"
                onClick={() => handleExecuteRemediation(selectedTicket)}
              >
                <Send size={14} />
                Confirm & Dispatch {selectedTicket.channel}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

