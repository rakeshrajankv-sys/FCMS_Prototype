function fcmsRecordBookMatches(record, selectedBook) {
  if (!selectedBook) return true;
  const info = fcmsReceiptBookInfo(record?.receiptNumber);
  return !!info && Number(info.book) === Number(selectedBook);
}

const db = getDB(), s = currentSession();
markActive();
const params = new URLSearchParams(location.search);
const requestedPradeshikam = params.get("pradeshikam");
const allowedMembers = s.role === "admin"
  ? db.members
  : db.members.filter(m => Number(m.pradeshikamId) === Number(s.pradeshikamId));
const allowedIds = new Set(allowedMembers.map(m => m.id));
let rows = db.payments
  .filter(payment => allowedIds.has(payment.memberId))
  .sort((a, b) => new Date(b.paymentDate) - new Date(a.paymentDate));

const adminFilters = s.role === "admin" ? `
  <div><select id="receiptBookFilter" class="form-select"><option value="">All Books</option>${Array.from({length:FCMS_MAX_RECEIPT_BOOKS},(_,i)=>`<option value="${i+1}">Book ${i+1}</option>`).join("")}</select></div>
  <div><select id="prFilter" class="form-select"><option value="">All Pradeshikams</option>${db.pradeshikams.map(p=>`<option value="${p.id}">${escapeHTML(p.name)}</option>`).join("")}</select></div>` : "";

document.getElementById("page-content").innerHTML = `
${pageTitle("Collections", "Every installment is stored as a separate receipt.")}
<div class="panel mb-4 collection-filter-panel">
  <div class="collection-filter-row ${s.role === "admin" ? "is-admin" : "is-pradeshikam"}">
    <div class="filter-search"><input id="search" class="form-control" placeholder="Search receipt, member or phone"></div>
    ${adminFilters}
    <div><select id="mode" class="form-select"><option value="">All payment modes</option><option>Cash</option><option>UPI</option><option>Bank</option><option>Cheque</option></select></div>
    <div><select id="statusFilter" class="form-select"><option value="">All statuses</option><option value="completed">Completed</option><option value="hold">Hold</option></select></div>
    <div class="filter-export"><button id="exportBtn" class="btn btn-outline-primary export-icon-btn" title="Download CSV" aria-label="Download CSV"><i class="bi bi-download" aria-hidden="true"></i></button></div>
  </div>
</div>
<div class="panel collection-history-panel">
  <div class="collection-history-heading">
    <div><div class="panel-title">Collection History</div><div class="small text-muted">Every saved receipt and installment</div></div>
    <div class="collection-history-totals"><span><b id="historyCount">0</b> records</span><span><b id="historyAmount">${money(0)}</b> total</span></div>
  </div>
  <div id="paymentTable"></div>
</div>`;

function filteredPayments() {
  const q = document.getElementById("search").value.toLowerCase();
  const mode = document.getElementById("mode").value;
  const status = document.getElementById("statusFilter").value;
  const pradeshikam = document.getElementById("prFilter")?.value || "";
  const book = document.getElementById("receiptBookFilter")?.value || "";
  return rows.filter(payment => {
    const member = db.members.find(x => x.id === payment.memberId);
    return (!q || [payment.receiptNumber, member?.name, member?.phone].join(" ").toLowerCase().includes(q)) &&
      (!mode || payment.paymentMode === mode) &&
      (!status || (payment.status || "completed") === status) &&
      (!pradeshikam || Number(member?.pradeshikamId) === Number(pradeshikam)) &&
      fcmsRecordBookMatches(payment, book);
  });
}

function render() {
  const visible = filteredPayments();
  document.getElementById("historyCount").textContent = String(visible.length);
  document.getElementById("historyAmount").textContent = money(visible.reduce((sum,p)=>sum+Number(p.amount||0),0));
  document.getElementById("paymentTable").innerHTML = !visible.length
    ? `<div class="empty-state"><i class="bi bi-receipt"></i>No collections found.</div>`
    : `<div class="table-responsive"><table class="table"><thead><tr><th>Receipt</th><th>Member</th><th>Pradeshikam</th><th>Amount</th><th>Mode</th><th>Status</th><th>Date</th><th>Remarks</th>${s.role === "admin" ? "<th>Actions</th>" : ""}</tr></thead><tbody>${visible.map(payment=>{
        const member=db.members.find(x=>x.id===payment.memberId);
        const pr=db.pradeshikams.find(x=>Number(x.id)===Number(member?.pradeshikamId));
        return `<tr><td data-label="Receipt"><b>${escapeHTML(payment.receiptNumber||"-")}</b></td><td data-label="Member">${member?`<a class="text-decoration-none" href="member-details.html?id=${encodeURIComponent(member.id)}">${escapeHTML(member.name)}</a><div class="small text-muted">${escapeHTML(member.memberCode||"")}</div>`:"-"}</td><td data-label="Pradeshikam">${escapeHTML(pr?.name||"-")}</td><td data-label="Amount" class="fw-semibold">${money(payment.amount)}</td><td data-label="Mode">${escapeHTML(payment.paymentMode||"-")}</td><td data-label="Status">${payment.status==="hold"?'<span class="status-badge status-hold">Hold</span>':'<span class="status-badge status-green">Completed</span>'}</td><td data-label="Date">${new Date(payment.paymentDate).toLocaleDateString("en-IN")}</td><td data-label="Remarks">${escapeHTML(payment.remarks||"-")}</td>${s.role==="admin"?`<td data-label="Actions"><div class="d-flex gap-1"><a class="btn btn-sm btn-light" href="edit-payment.html?id=${encodeURIComponent(payment.id)}" title="Edit"><i class="bi bi-pencil"></i></a><button class="btn btn-sm btn-outline-danger delete-payment" data-id="${escapeHTML(payment.id)}" title="Delete"><i class="bi bi-trash"></i></button></div></td>`:""}</tr>`;
      }).join("")}</tbody></table></div>`;
  document.querySelectorAll(".delete-payment").forEach(btn=>btn.addEventListener("click",()=>deletePayment(btn.dataset.id)));
}

async function deletePayment(id) {
  const payment=db.payments.find(x=>x.id===id); if(!payment) return;
  const member=db.members.find(x=>x.id===payment.memberId);
  if(!await confirmDialog(`Delete receipt ${payment.receiptNumber} for ${money(payment.amount)}?`)) return;
  addActivity(db,{action:"Payment Deleted",entityType:"payment",entityId:payment.id,memberId:payment.memberId,pradeshikamId:member?.pradeshikamId,summary:`Receipt ${payment.receiptNumber} deleted`,details:"Payment deleted by Main Committee.",oldValue:{...payment}});
  db.payments=db.payments.filter(x=>x.id!==id); rows=rows.filter(x=>x.id!==id);
  fcmsClearPageDraft(); saveDB(db); toast("Payment deleted.","success"); render();
}

function exportVisiblePayments() {
  exportCSV(filteredPayments().map(payment=>{
    const member=db.members.find(x=>x.id===payment.memberId);
    const pr=db.pradeshikams.find(x=>Number(x.id)===Number(member?.pradeshikamId));
    return {Receipt:payment.receiptNumber,Member:member?.name||"",MemberID:member?.memberCode||"",Pradeshikam:pr?.name||"",Amount:payment.amount,Mode:payment.paymentMode,TransactionID:payment.transactionId||"",Status:payment.status==="hold"?"Hold":"Completed",Date:new Date(payment.paymentDate).toLocaleString("en-IN"),Remarks:payment.remarks||""};
  }),"fcms-payments.csv");
}

["search","mode","statusFilter","prFilter","receiptBookFilter"].forEach(id=>{
  const el=document.getElementById(id); if(el) el.addEventListener(id==="search"?"input":"change",render);
});
if(s.role==="admin"&&requestedPradeshikam){const el=document.getElementById("prFilter");if(el)el.value=requestedPradeshikam;}
document.getElementById("exportBtn").addEventListener("click",exportVisiblePayments);
render();
