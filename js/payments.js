const db=getDB(),s=currentSession();markActive();
const allowedMembers=s.role==="admin"?db.members:db.members.filter(m=>m.pradeshikamId===s.pradeshikamId);
const ids=new Set(allowedMembers.map(m=>m.id));
let rows=db.payments.filter(p=>ids.has(p.memberId)).sort((a,b)=>new Date(b.paymentDate)-new Date(a.paymentDate));
document.getElementById("page-content").innerHTML=`
${pageTitle("Collections","Every installment is stored as a separate receipt.")}
<div class="panel"><div class="row g-2 mb-3"><div class="col-md-7"><input id="search" class="form-control" placeholder="Search receipt, member or phone"></div><div class="col-md-3"><select id="mode" class="form-select"><option value="">All payment modes</option><option>Cash</option><option>UPI</option><option>Bank</option></select></div><div class="col-md-2"><button id="exportBtn" class="btn btn-outline-primary w-100"><i class="bi bi-download me-1"></i>CSV</button></div></div><div id="paymentTable"></div></div>`;
function render(){
 const q=document.getElementById("search").value.toLowerCase(),mode=document.getElementById("mode").value;
 const arr=rows.filter(p=>{const m=db.members.find(x=>x.id===p.memberId);return(!q||[p.receiptNumber,m?.name,m?.phone].join(" ").toLowerCase().includes(q))&&(!mode||p.paymentMode===mode)});
 document.getElementById("paymentTable").innerHTML=!arr.length?`<div class="empty-state"><i class="bi bi-receipt"></i>No collections found.</div>`:
 `<div class="table-responsive"><table class="table"><thead><tr><th>Receipt</th><th>Member</th><th>Pradeshikam</th><th>Amount</th><th>Mode</th><th>Date</th><th>Remarks</th>${s.role==="admin"?`<th>Actions</th>`:""}</tr></thead><tbody>${arr.map(p=>{const m=db.members.find(x=>x.id===p.memberId),pr=db.pradeshikams.find(x=>x.id===m?.pradeshikamId);return `<tr><td data-label="Receipt"><b>${escapeHTML(p.receiptNumber)}</b></td><td data-label="Member"><a class="text-decoration-none" href="member-details.html?id=${encodeURIComponent(m.id)}">${escapeHTML(m.name)}</a><div class="small text-muted">${m.memberCode}</div></td><td data-label="Pradeshikam">${escapeHTML(pr?.name||"-")}</td><td data-label="Amount" class="fw-semibold">${money(p.amount)}</td><td data-label="Mode">${escapeHTML(p.paymentMode)}</td><td data-label="Date">${new Date(p.paymentDate).toLocaleDateString("en-IN")}</td><td data-label="Remarks">${escapeHTML(p.remarks||"-")}</td>${s.role==="admin"?`<td data-label="Actions"><div class="d-flex gap-1"><a class="btn btn-sm btn-light" href="edit-payment.html?id=${encodeURIComponent(p.id)}" title="Edit"><i class="bi bi-pencil"></i></a><button class="btn btn-sm btn-outline-danger delete-payment" data-id="${escapeHTML(p.id)}" title="Delete"><i class="bi bi-trash"></i></button></div></td>`:""}</tr>`}).join("")}</tbody></table></div>`;
 document.querySelectorAll(".delete-payment").forEach(btn=>btn.addEventListener("click",()=>{
   const pid=btn.dataset.id,p=db.payments.find(x=>x.id===pid);if(!p)return;
   const m=db.members.find(x=>x.id===p.memberId);if(!confirm(`Delete receipt ${p.receiptNumber} for ${money(p.amount)}?`))return;
   addActivity(db,{action:"Payment Deleted",entityType:"payment",entityId:p.id,memberId:p.memberId,pradeshikamId:m?.pradeshikamId,summary:`Receipt ${p.receiptNumber} deleted`,details:`Payment deleted by Main Committee.`,oldValue:paymentSnapshot(p)});
   db.payments=db.payments.filter(x=>x.id!==pid);saveDB(db);rows=rows.filter(x=>x.id!==pid);render();
 }));
}
document.getElementById("search").addEventListener("input",render);
document.getElementById("mode").addEventListener("change",render);
document.getElementById("exportBtn").addEventListener("click",()=>exportCSV(rows.map(p=>{const m=db.members.find(x=>x.id===p.memberId),pr=db.pradeshikams.find(x=>x.id===m?.pradeshikamId);return {Receipt:p.receiptNumber,Member:m?.name||"",MemberID:m?.memberCode||"",Pradeshikam:pr?.name||"",Amount:p.amount,Mode:p.paymentMode,Date:new Date(p.paymentDate).toLocaleString("en-IN"),Remarks:p.remarks||""}}),"fcms-payments.csv"));
render();
