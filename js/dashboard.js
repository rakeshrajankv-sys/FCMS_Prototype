const db=getDB(); const s=currentSession(); markActive();
const members=s.role==="admin"?db.members:db.members.filter(m=>m.pradeshikamId===s.pradeshikamId);
const payments=s.role==="admin"?db.payments:db.payments.filter(p=>members.some(m=>m.id===p.memberId));
const stats=members.reduce((a,m)=>{const x=memberStats(m,db);a.expected+=Number(m.requiredAmount);a.paid+=x.paid;a[x.status.toLowerCase()]++;return a},{expected:0,paid:0,green:0,yellow:0,red:0});
const remaining=Math.max(0,stats.expected-stats.paid);
document.getElementById("page-content").innerHTML=`
${pageTitle("Dashboard",s.role==="admin"?"Overview of all 18 Pradeshikams":"Collection overview for "+escapeHTML(s.name),
`<a href="add-member.html" class="btn btn-primary"><i class="bi bi-plus-lg me-2"></i>New Member</a>`)}
<div class="row g-3 mb-4">
${statCard("bi-people","Total Members",members.length)}
${statCard("bi-cash-stack","Total Collected",money(stats.paid))}
${statCard("bi-check-circle","Fully Paid",stats.green)}
${statCard("bi-clock-history","Pending",stats.yellow+stats.red)}
</div>
<div class="row g-3 mb-4">
<div class="col-lg-8"><div class="panel h-100"><div class="d-flex justify-content-between align-items-start mb-3"><div><div class="panel-title">Collection Progress</div><div class="small text-muted mt-1">Expected Collection: <b>${money(stats.expected)}</b></div></div><span class="small text-muted">${stats.expected?Math.round(stats.paid/stats.expected*100):0}%</span></div>
<div class="progress mb-3" style="height:12px"><div class="progress-bar bg-primary" style="width:${stats.expected?Math.min(100,stats.paid/stats.expected*100):0}%"></div></div>
<div class="row text-center"><div class="col-4"><div class="h5 fw-bold mb-1">${stats.green}</div><span class="status-badge status-green">● Fully Paid</span></div><div class="col-4"><div class="h5 fw-bold mb-1">${stats.yellow}</div><span class="status-badge status-yellow">● 80–99%</span></div><div class="col-4"><div class="h5 fw-bold mb-1">${stats.red}</div><span class="status-badge status-red">● Below 80%</span></div></div></div></div>
<div class="col-lg-4"><div class="panel h-100"><div class="panel-title mb-3">Quick Actions</div><div class="d-grid gap-2">
<a class="quick-action" href="add-member.html"><span class="quick-icon"><i class="bi bi-person-plus"></i></span><span><b class="d-block small">New Member</b><small class="text-muted">Register + first payment</small></span></a>
<a class="quick-action" href="members.html"><span class="quick-icon"><i class="bi bi-search"></i></span><span><b class="d-block small">Find Member</b><small class="text-muted">Search existing members</small></span></a>
<a class="quick-action" href="reports.html"><span class="quick-icon"><i class="bi bi-file-earmark-spreadsheet"></i></span><span><b class="d-block small">Reports</b><small class="text-muted">View and export data</small></span></a>
</div></div></div></div>
${s.role==="admin"?renderPradeshikamOverview(db):""}
<div class="panel"><div class="d-flex justify-content-between align-items-center mb-3"><div class="panel-title">Recent Payments</div><a href="payments.html" class="small text-decoration-none">View all</a></div>${renderRecentPayments(payments,db)}</div>`;
function statCard(icon,label,value){return `<div class="col-6 col-xl-3"><div class="stat-card"><div class="stat-icon"><i class="bi ${icon}"></i></div><div class="stat-label">${label}</div><div class="stat-value">${value}</div></div></div>`}
function renderRecentPayments(list,db){const rows=[...list].sort((a,b)=>new Date(b.paymentDate)-new Date(a.paymentDate)).slice(0,7);if(!rows.length)return `<div class="empty-state"><i class="bi bi-receipt"></i>No payments recorded yet.</div>`;return `<div class="table-responsive"><table class="table"><thead><tr><th>Receipt</th><th>Member</th><th>Pradeshikam</th><th>Amount</th><th>Mode</th><th>Date</th></tr></thead><tbody>${rows.map(p=>{const m=db.members.find(x=>x.id===p.memberId);const pr=db.pradeshikams.find(x=>x.id===m?.pradeshikamId);return `<tr><td><b>${escapeHTML(p.receiptNumber)}</b></td><td>${escapeHTML(m?.name||"-")}</td><td>${escapeHTML(pr?.name||"-")}</td><td class="fw-semibold">${money(p.amount)}</td><td>${escapeHTML(p.paymentMode)}</td><td>${new Date(p.paymentDate).toLocaleDateString("en-IN")}</td></tr>`}).join("")}</tbody></table></div>`}
function renderPradeshikamOverview(db){return `<div class="panel mb-4"><div class="panel-title mb-3">Pradeshikam Collection</div><div class="row g-3">${db.pradeshikams.map(p=>{const ms=db.members.filter(m=>m.pradeshikamId===p.id);const ex=ms.reduce((x,m)=>x+Number(m.requiredAmount),0);const pd=ms.reduce((x,m)=>x+memberStats(m,db).paid,0);const pct=ex?Math.min(100,pd/ex*100):0;return `<div class="col-md-6 col-xl-4"><div class="border rounded-3 p-3"><div class="d-flex justify-content-between"><b>${p.name}</b><span class="small">${Math.round(pct)}%</span></div><div class="progress my-2"><div class="progress-bar" style="width:${pct}%"></div></div><div class="d-flex justify-content-between small text-muted"><span>${money(pd)}</span><span>${money(ex)}</span></div></div></div>`}).join("")}</div></div>`}


// Under-21 payment rule: no collection is required.
// Payment amount may be submitted as ₹0 so the form can be completed.
window.getRequiredCollectionAmount = function(age, gender) {
  const a = Number(age);
  if (!Number.isFinite(a) || a < 21) return 0;
  return String(gender || '').toLowerCase() === 'female' ? 2000 : 8000;
};

window.isUnder21NoCollection = function(age) {
  return Number(age) < 21;
};
