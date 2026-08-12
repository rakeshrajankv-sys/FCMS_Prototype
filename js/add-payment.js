const db=getDB(),s=currentSession();markActive();
const id=new URLSearchParams(location.search).get("id"),member=db.members.find(m=>m.id===id);
if(!member||(s.role==="pradeshikam"&&member.pradeshikamId!==s.pradeshikamId)){location.href="members.html"}
else{
const x=memberStats(member,db);
document.getElementById("page-content").innerHTML=`
${pageTitle("Add Collection")}
<div class="row g-3"><div class="col-lg-4"><div class="panel"><div class="panel-title mb-3">Member</div><h5 class="fw-bold">${escapeHTML(member.name)}</h5><div class="small text-muted">${member.memberCode}</div><hr><div class="d-flex justify-content-between small"><span>Required</span><b>${money(member.requiredAmount)}</b></div><div class="d-flex justify-content-between small mt-2"><span>Paid</span><b>${money(x.paid)}</b></div><div class="d-flex justify-content-between small mt-2"><span>Balance</span><b>${money(x.balance)}</b></div><div class="mt-3">${badge(x.status)}</div></div></div>
<div class="col-lg-8"><div class="panel form-card"><form id="paymentForm"><div class="row g-3"><div class="col-md-6"><label class="form-label">Receipt Number *</label><input id="receipt" class="form-control" required></div><div class="col-md-6"><label class="form-label">Amount *</label><input id="amount" type="number" min="1" step="1" max="${x.balance||1}" class="form-control" required></div><div class="col-md-6"><label class="form-label">Payment Mode *</label><select id="mode" class="form-select" required><option>Cash</option><option>UPI</option><option>Bank</option><option>Check</option></select></div><div class="col-12"><label class="form-label">Remarks</label><textarea id="remarks" class="form-control" rows="3"></textarea></div></div><div id="formError" class="alert alert-danger d-none mt-3"></div><div class="d-flex justify-content-end gap-2 mt-4"><a href="member-details.html?id=${encodeURIComponent(member.id)}" class="btn btn-light">Cancel</a><button class="btn btn-primary" ${x.balance<=0?"disabled":""}>Save Payment</button></div></form></div></div></div>`;
document.getElementById("paymentForm").addEventListener("submit",e=>{
 e.preventDefault();const receipt=document.getElementById("receipt").value.trim(),amount=Number(document.getElementById("amount").value),err=document.getElementById("formError");
 if(db.payments.some(p=>p.receiptNumber===receipt)){err.textContent="This receipt number has already been used.";err.classList.remove("d-none");return}
 if(!amount||amount<=0){err.textContent="Enter a valid payment amount.";err.classList.remove("d-none");return}
 const current=memberStats(member,db);
 if(amount>current.balance){err.textContent=`Amount exceeds the remaining balance of ${money(current.balance)}.`;err.classList.remove("d-none");return}
 const payment={id:uid("pay"),memberId:member.id,receiptNumber:receipt,amount,paymentMode:document.getElementById("mode").value,remarks:document.getElementById("remarks").value.trim(),paymentDate:new Date().toISOString()};
 db.payments.push(payment);
 addActivity(db,{action:"Payment Added",entityType:"payment",entityId:payment.id,memberId:member.id,pradeshikamId:member.pradeshikamId,summary:`Receipt ${receipt} added`,details:`${money(amount)} via ${payment.paymentMode}.`,newValue:paymentSnapshot(payment)});
 saveDB(db);location.href="member-details.html?id="+encodeURIComponent(member.id);
})}
function badge(s){return `<span class="status-badge status-${s.toLowerCase()}">● ${s}</span>`}
