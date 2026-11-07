// Bambinos.live Operations Live Command Dashboard

const exceptionData = [
  {
    invoiceId: "84906",
    student: "Zo***a Kh***n (68106)",
    educator: "Ms. Rhea B***",
    amount: "₹18,000",
    reasonCode: "ERR_ORPHANED_INVOICE",
    severity: "critical",
    sla: "1h 12m left",
    aging: "24h 45m",
    action: "Send WhatsApp Ping to Rhea"
  },
  {
    invoiceId: "84910",
    student: "My***a Re***y (68110)",
    educator: "Coach Arvind K***",
    amount: "₹11,000",
    reasonCode: "ERR_ORPHANED_INVOICE",
    severity: "critical",
    sla: "1h 40m left",
    aging: "5h 25m",
    action: "Send WhatsApp Ping to Arvind"
  },
  {
    invoiceId: "84911",
    student: "Is***n Gu***a (68111)",
    educator: "Ms. Simran D***",
    amount: "₹12,000",
    reasonCode: "ERR_GATEWAY_FAILED",
    severity: "high",
    sla: "3h 15m left",
    aging: "4h 00m",
    action: "Send Payment Retry Link"
  },
  {
    invoiceId: "84905",
    student: "Re***h Pa***l (68105)",
    educator: "Coach Arvind K***",
    amount: "₹11,000",
    reasonCode: "ERR_BATCH_FULL",
    severity: "high",
    sla: "5h 20m left",
    aging: "26h 45m",
    action: "Offer Sibling Batch D2"
  },
  {
    invoiceId: "84902",
    student: "Di***a Na***r (68102)",
    educator: "Mr. Vikram S***",
    amount: "₹10,500",
    reasonCode: "ERR_OPS_EXECUTION_DROPPED",
    severity: "high",
    sla: "Overdue (42h)",
    aging: "42h 10m",
    action: "Auto-Generate 24 Sessions"
  },
  {
    invoiceId: "84909",
    student: "Ad***t Ku***i (68109)",
    educator: "Mr. Vikram S***",
    amount: "₹5,250",
    reasonCode: "ERR_PARTIAL_PAYMENT",
    severity: "medium",
    sla: "6h 40m left",
    aging: "6h 15m",
    action: "Book 12 Sessions + Reminder"
  },
  {
    invoiceId: "84912",
    student: "Ta***a Me***n (68112)",
    educator: "Acharya Nancy S***",
    amount: "₹9,000",
    reasonCode: "ERR_SLOT_CHANGE_REQUESTED",
    severity: "medium",
    sla: "7h 10m left",
    aging: "0h 45m",
    action: "Send Weekend Slot Picker"
  }
];

const batchCapacities = [
  { name: "YC-G4-Batch-A (English)", count: 4, max: 6, status: "ok" },
  { name: "BM-G5-Batch-C (Maths)", count: 5, max: 6, status: "warning" },
  { name: "LY-G3-Batch-B (Gita)", count: 3, max: 6, status: "ok" },
  { name: "CM-G4-Batch-D (Chess)", count: 6, max: 6, status: "full" },
  { name: "YC-GCC-Batch-E (English)", count: 5, max: 6, status: "warning" },
  { name: "PH-G1-Batch-F (Phonics)", count: 4, max: 6, status: "ok" },
  { name: "SC-G4-Batch-K (Science)", count: 4, max: 6, status: "ok" }
];

function renderTable(filter = 'all') {
  const tbody = document.getElementById('exception-tbody');
  tbody.innerHTML = '';

  const filtered = filter === 'all' 
    ? exceptionData 
    : exceptionData.filter(item => item.severity === filter);

  filtered.forEach(row => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><strong>#${row.invoiceId}</strong></td>
      <td>${row.student}</td>
      <td>${row.educator}</td>
      <td>${row.amount}</td>
      <td><span class="tag ${row.severity}">${row.reasonCode}</span></td>
      <td>${row.aging}</td>
      <td><strong style="color: ${row.sla.includes('Overdue') ? '#f87171' : '#fbbf24'}">${row.sla}</strong></td>
      <td>
        <button class="action-btn" onclick="executeTriageAction('${row.invoiceId}', '${row.action}')">
          ${row.action}
        </button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

function renderBatchCapacity() {
  const container = document.getElementById('batch-capacity-list');
  container.innerHTML = '';

  batchCapacities.forEach(b => {
    const pct = Math.round((b.count / b.max) * 100);
    const div = document.createElement('div');
    div.className = 'capacity-item';
    div.innerHTML = `
      <div>
        <div style="font-weight: 600;">${b.name}</div>
        <div style="font-size: 11px; color: var(--text-muted);">${b.count} of ${b.max} Enrolled (${pct}%)</div>
      </div>
      <div style="display: flex; align-items: center;">
        <div class="capacity-bar-container">
          <div class="capacity-bar-fill ${b.status}" style="width: ${pct}%;"></div>
        </div>
        <span class="tag ${b.status === 'full' ? 'critical' : b.status === 'warning' ? 'high' : 'resolved'}">
          ${b.status.toUpperCase()}
        </span>
      </div>
    `;
    container.appendChild(div);
  });
}

function executeTriageAction(invId, actionName) {
  alert(`⚡ Action Triggered for Invoice #${invId}:\n[${actionName}]\n\nWorkflow status: Dispatched API request via n8n webhook. Notification enqueued.`);
}

document.addEventListener('DOMContentLoaded', () => {
  renderTable();
  renderBatchCapacity();

  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      e.target.classList.add('active');
      renderTable(e.target.dataset.filter);
    });
  });
});

