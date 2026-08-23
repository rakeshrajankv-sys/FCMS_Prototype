const db = getDB(), s = currentSession();
markActive();

const params = new URLSearchParams(location.search);
const requestedType = params.get("type");
const requestedId = Number(params.get("id") || 0);

function prName(id) {
  return db.pradeshikams.find((p) => Number(p.id) === Number(id))?.name || "Pradeshikam";
}
function committeeName(id) {
  return db.subCommittees.find((c) => Number(c.id) === Number(id))?.name || "Sub Committee";
}
function memberCollected(id) { return memberCollectionTotal(id, db); }
function donations(id) { return donationTotal(id, db); }
function submittedPr(id, type) {
  return (db.submissions || []).filter(x => Number(x.pradeshikamId) === Number(id)).reduce((sum,x)=>sum + Number(type === "member" ? x.memberAmount : type === "donation" ? x.donationAmount : x.amount || 0),0);
}
function prRemaining(id,type) {
  return Math.max(0,(type === "member" ? memberCollected(id) : donations(id)) - submittedPr(id,type));
}
function committeeCollected(id) { return subCommitteeCollectionTotal(id, db); }
function committeeSubmitted(id) { return subCommitteeSubmittedTotal(id, db); }
function committeeRemaining(id) { return Math.max(0, committeeCollected(id) - committeeSubmitted(id)); }

function currentTarget() {
  if (s.role === "pradeshikam") return {type:"pradeshikam", id:Number(s.pradeshikamId)};
  if (s.role === "subcommittee") return {type:"subcommittee", id:Number(s.subCommitteeId)};
  const type = requestedType === "subcommittee" ? "subcommittee" : "pradeshikam";
  const list = type === "subcommittee" ? db.subCommittees : db.pradeshikams;
  const id = list.some(x => Number(x.id) === requestedId) ? requestedId : Number(list[0]?.id);
  return {type,id};
}

let target = currentTarget();

function targetName() { return target.type === "subcommittee" ? committeeName(target.id) : prName(target.id); }
function targetRows() {
  if (target.type === "subcommittee") return [...(db.subCommitteeSubmissions || [])].filter(x => Number(x.subCommitteeId) === Number(target.id)).sort((a,b)=>new Date(b.date||b.createdAt)-new Date(a.date||a.createdAt));
  return [...(db.submissions || [])].filter(x => Number(x.pradeshikamId) === Number(target.id)).sort((a,b)=>new Date(b.date||b.createdAt)-new Date(a.date||a.createdAt));
}

function receiptBlock(existing = "") {
  return `<div class="col-12"><label class="form-label">Receipt / Voucher / രസീത് / വൗച്ചർ <span class="text-danger">*</span></label><div class="d-flex flex-wrap gap-2"><input id="receiptFile" type="file" accept="image/*" capture="environment" class="form-control" style="max-width:420px"><button type="button" id="receiptCameraBtn" class="btn btn-outline-primary"><i class="bi bi-camera me-1"></i>Take Photo</button></div><div id="receiptPreview" class="receipt-box mt-3 ${existing ? "" : "d-none"}">${existing ? `<img src="${existing}" alt="Receipt" style="max-width:240px;max-height:180px;border-radius:12px;object-fit:contain">` : ""}</div><div class="small text-muted mt-2">A receipt/voucher image is required to save the submission.</div></div>`;
}

function renderSelector() {
  if (s.role !== "admin") return `<div class="panel mb-4"><div class="d-flex align-items-center justify-content-between gap-3"><div><div class="form-label mb-1">${target.type === "subcommittee" ? "Sub Committee / ഉപസമിതി" : "Pradeshikam / പ്രദേശികം"}</div><div class="fw-bold fs-5">${escapeHTML(targetName())}</div></div><span class="badge rounded-pill text-bg-light"><i class="bi bi-lock-fill me-1"></i>View only</span></div></div>`;
  const prOptions = db.pradeshikams.map(x=>`<option value="${x.id}" ${target.type==="pradeshikam"&&Number(x.id)===target.id?"selected":""}>${escapeHTML(x.name)}</option>`).join("");
  const scOptions = db.subCommittees.map(x=>`<option value="${x.id}" ${target.type==="subcommittee"&&Number(x.id)===target.id?"selected":""}>${escapeHTML(x.name)}</option>`).join("");
  return `<div class="panel mb-4"><div class="row g-3 align-items-end"><div class="col-md-4"><label class="form-label">Submission For / സമർപ്പണം</label><select id="targetType" class="form-select"><option value="pradeshikam" ${target.type==="pradeshikam"?"selected":""}>Pradeshikam</option><option value="subcommittee" ${target.type==="subcommittee"?"selected":""}>Sub Committee</option></select></div><div class="col-md-8"><label class="form-label">Select ${target.type==="subcommittee"?"Sub Committee":"Pradeshikam"}</label><select id="targetId" class="form-select">${target.type==="subcommittee"?scOptions:prOptions}</select></div></div></div>`;
}

function renderPrStats() {
  const mc=memberCollected(target.id), dc=donations(target.id), ms=submittedPr(target.id,"member"), ds=submittedPr(target.id,"donation"), mr=Math.max(0,mc-ms), dr=Math.max(0,dc-ds);
  return `<div class="row g-3 mb-4"><div class="col-md-3"><div class="stat-card"><div class="stat-label">Collected by Pradeshikam</div><div class="stat-value">${money(mc)}</div></div></div><div class="col-md-3"><div class="stat-card"><div class="stat-label">Donations</div><div class="stat-value">${money(dc)}</div></div></div><div class="col-md-3"><div class="stat-card"><div class="stat-label">Submitted</div><div class="stat-value">${money(ms+ds)}</div></div></div><div class="col-md-3"><div class="stat-card"><div class="stat-label">Remaining</div><div class="stat-value">${money(mr+dr)}</div></div></div></div><div class="panel mb-4"><div class="panel-title mb-3">Amount Available</div><div class="row g-3"><div class="col-md-6"><div class="d-flex justify-content-between"><span>Collected by Pradeshikam remaining</span><b>${money(mr)}</b></div></div><div class="col-md-6"><div class="d-flex justify-content-between"><span>Donation remaining</span><b>${money(dr)}</b></div></div></div></div>`;
}
function renderScStats() {
  const collected=committeeCollected(target.id), submitted=committeeSubmitted(target.id), remaining=committeeRemaining(target.id);
  return `<div class="row g-3 mb-4"><div class="col-md-4"><div class="stat-card"><div class="stat-label">Total Collected</div><div class="stat-value">${money(collected)}</div></div></div><div class="col-md-4"><div class="stat-card"><div class="stat-label">Submitted to Main Office</div><div class="stat-value">${money(submitted)}</div></div></div><div class="col-md-4"><div class="stat-card"><div class="stat-label">Remaining</div><div class="stat-value">${money(remaining)}</div></div></div></div>`;
}

function renderForm() {
  if (s.role !== "admin") return "";
  if (target.type === "subcommittee") {
    const remaining=committeeRemaining(target.id);
    return `<div class="panel form-card mb-4"><div class="panel-title mb-3">New Submission</div><form id="submissionForm"><div class="row g-3"><div class="col-md-4"><label class="form-label">Sub Committee / ഉപസമിതി</label><input class="form-control" value="${escapeHTML(targetName())}" disabled></div><div class="col-md-4"><label class="form-label">Amount / തുക *</label><input id="amount" type="number" min="0" max="${remaining}" class="form-control" required value="0"></div><div class="col-md-4"><label class="form-label">Submission Date / സമർപ്പിച്ച തീയതി *</label><input id="submissionDate" type="date" class="form-control" value="${new Date().toISOString().slice(0,10)}" required></div><div class="col-12"><label class="form-label">Remarks / അഭിപ്രായങ്ങൾ</label><textarea id="remarks" class="form-control" rows="2"></textarea></div>${receiptBlock()}</div><div id="submissionError" class="alert alert-danger d-none mt-3"></div><div class="d-flex justify-content-end mt-4"><button class="btn btn-primary" ${remaining<=0?"disabled":""}>Save Submission</button></div></form></div>`;
  }
  const mr=prRemaining(target.id,"member"), dr=prRemaining(target.id,"donation");
  return `<div class="panel form-card mb-4"><div class="panel-title mb-3">New Submission</div><form id="submissionForm"><div class="row g-3"><div class="col-md-4"><label class="form-label">Pradeshikam / പ്രദേശികം</label><input class="form-control" value="${escapeHTML(targetName())}" disabled></div><div class="col-md-4"><label class="form-label">Amount Type / തുകയുടെ തരം *</label><select id="amountType" class="form-select"><option value="member">Collected by Pradeshikam</option><option value="donation">Donation</option><option value="both">Both</option></select></div><div class="col-md-4"><label class="form-label">Submission Date / സമർപ്പിച്ച തീയതി *</label><input id="submissionDate" type="date" class="form-control" value="${new Date().toISOString().slice(0,10)}" required></div><div class="col-md-6" id="memberAmountWrap"><label class="form-label">Amount / തുക *</label><input id="memberAmount" type="number" min="0" max="${mr}" class="form-control" value="0"></div><div class="col-md-6" id="donationAmountWrap"><label class="form-label">Donation Amount / സംഭാവന തുക *</label><input id="donationAmount" type="number" min="0" max="${dr}" class="form-control" value="0"></div><div class="col-12"><label class="form-label">Remarks / അഭിപ്രായങ്ങൾ</label><textarea id="remarks" class="form-control" rows="2"></textarea></div>${receiptBlock()}</div><div id="submissionPreview" class="receipt-box mt-3"></div><div id="submissionError" class="alert alert-danger d-none mt-3"></div><div class="d-flex justify-content-end mt-4"><button class="btn btn-primary" ${mr+dr<=0?"disabled":""}>Save Submission</button></div></form></div>`;
}

function renderHistory(rows) {
  if (!rows.length) return `<div class="empty-state"><i class="bi bi-bank"></i>No submissions recorded yet.</div>`;
  return `<div class="table-responsive"><table class="table"><thead><tr><th>Date</th><th>Amount</th><th>Recorded By</th><th>Receipt</th><th>Remarks</th><th>Actions</th></tr></thead><tbody>${rows.map(x=>{
    const amount=Number(x.amount||0), receipt=x.receiptDataUrl||x.receiptUrl||x.receiptImage||"";
    return `<tr><td data-label="Date">${new Date(x.date||x.createdAt).toLocaleDateString("en-IN")}</td><td data-label="Amount" class="fw-semibold">${money(amount)}</td><td data-label="Recorded By">${escapeHTML(x.recordedBy||"-")}</td><td data-label="Receipt">${receipt?`<a href="${receipt}" target="_blank" class="btn btn-sm btn-light"><i class="bi bi-image me-1"></i>View</a>`:"-"}</td><td data-label="Remarks">${escapeHTML(x.remarks||"-")}</td><td data-label="Actions">${s.role==="admin"?`<button class="btn btn-sm btn-outline-danger delete-submission" data-id="${escapeHTML(x.id)}"><i class="bi bi-trash"></i></button>`:"<span class=\"text-muted small\">View only</span>"}</td></tr>`;
  }).join("")}</tbody></table></div>`;
}

function bindReceipt() {
  let receiptData="";
  const file=document.getElementById("receiptFile"), preview=document.getElementById("receiptPreview"), camera=document.getElementById("receiptCameraBtn");
  const show=(result)=>{ if(!result)return; if(result.error){toast(result.error,"danger");return;} receiptData=result.dataUrl||""; preview.innerHTML=`<img src="${receiptData}" alt="Receipt preview" style="max-width:240px;max-height:180px;border-radius:12px;object-fit:contain">`; preview.classList.remove("d-none"); };
  file?.addEventListener("change",async()=>show(await FCMSReceiptCamera.processFile(file.files?.[0])));
  camera?.addEventListener("click",()=>FCMSReceiptCamera.open(show));
  return ()=>receiptData;
}

function bindForm() {
  if(s.role!=="admin") return;
  const getReceipt=bindReceipt();
  if(target.type==="subcommittee"){
    document.getElementById("submissionForm").addEventListener("submit",e=>{
      e.preventDefault();
      const amount=Number(document.getElementById("amount").value)||0, remaining=committeeRemaining(target.id), err=document.getElementById("submissionError"), receipt=getReceipt();
      if(amount<=0){err.textContent="Enter an amount to submit.";err.classList.remove("d-none");return;}
      if(amount>remaining){err.textContent=`Amount cannot exceed remaining balance of ${money(remaining)}.`;err.classList.remove("d-none");return;}
      if(!receipt){err.textContent="Receipt / Voucher is required before saving this submission.";err.classList.remove("d-none");return;}
      const date=document.getElementById("submissionDate").value;if(!date){err.textContent="Select a submission date.";err.classList.remove("d-none");return;}
      const sub={id:uid("scsub"),subCommitteeId:target.id,amount,date,remarks:document.getElementById("remarks").value.trim(),receiptDataUrl:receipt,createdAt:new Date().toISOString(),recordedBy:actorLabel(),recordedByUserId:s.id,recordedByRole:s.role};
      db.subCommitteeSubmissions.push(sub); addActivity(db,{action:"Sub Committee Submission Added",entityType:"subCommitteeSubmission",entityId:sub.id,summary:`${committeeName(target.id)} submitted ${money(amount)}`,details:"Submitted to Main Office.",newValue:sub}); saveDB(db); render();
    });
    return;
  }
  const type=document.getElementById("amountType"), ma=document.getElementById("memberAmount"), da=document.getElementById("donationAmount"), preview=document.getElementById("submissionPreview");
  function update(){const t=type.value,mr=prRemaining(target.id,"member"),dr=prRemaining(target.id,"donation");document.getElementById("memberAmountWrap").style.display=t==="donation"?"none":"block";document.getElementById("donationAmountWrap").style.display=t==="member"?"none":"block";ma.max=mr;da.max=dr;if(t==="member")da.value=0;if(t==="donation")ma.value=0;preview.innerHTML=`<div class="d-flex justify-content-between"><span>Pradeshikam amount</span><b>${money(Number(ma.value)||0)}</b></div><div class="d-flex justify-content-between"><span>Donation amount</span><b>${money(Number(da.value)||0)}</b></div><div class="d-flex justify-content-between"><span>Total submission</span><b>${money((Number(ma.value)||0)+(Number(da.value)||0))}</b></div><div class="small text-muted mt-2">Remaining: ${money(mr)} pradeshikam · ${money(dr)} donation</div>`;}
  type.addEventListener("change",update);[ma,da].forEach(el=>el.addEventListener("input",update));update();
  document.getElementById("submissionForm").addEventListener("submit",e=>{e.preventDefault();const mr=prRemaining(target.id,"member"),dr=prRemaining(target.id,"donation"),memberAmount=Number(ma.value)||0,donationAmount=Number(da.value)||0,total=memberAmount+donationAmount,err=document.getElementById("submissionError"),receipt=getReceipt();if(type.value==="member"&&memberAmount>mr){err.textContent=`Pradeshikam amount cannot exceed ${money(mr)}.`;err.classList.remove("d-none");return;}if(type.value==="donation"&&donationAmount>dr){err.textContent=`Donation amount cannot exceed ${money(dr)}.`;err.classList.remove("d-none");return;}if(type.value==="both"&&(memberAmount>mr||donationAmount>dr)){err.textContent="One or both amounts exceed the remaining amount.";err.classList.remove("d-none");return;}if(total<=0){err.textContent="Enter an amount to submit.";err.classList.remove("d-none");return;}if(!receipt){err.textContent="Receipt / Voucher is required before saving this submission.";err.classList.remove("d-none");return;}const date=document.getElementById("submissionDate").value;if(!date){err.textContent="Select a submission date.";err.classList.remove("d-none");return;}const sub={id:uid("sub"),pradeshikamId:target.id,memberAmount,donationAmount,amount:total,date,remarks:document.getElementById("remarks").value.trim(),receiptDataUrl:receipt,createdAt:new Date().toISOString(),recordedBy:actorLabel(),recordedByUserId:s.id,recordedByRole:s.role,type:type.value};db.submissions.push(sub);addActivity(db,{action:"Submission Added",entityType:"submission",entityId:sub.id,pradeshikamId:target.id,summary:`${prName(target.id)} submitted ${money(total)}`,details:`Member ${money(memberAmount)} · Donation ${money(donationAmount)}.`,newValue:sub});saveDB(db);render();});
}

async function deleteSubmission(id){
  if(s.role!=="admin") return;
  const list=target.type==="subcommittee"?db.subCommitteeSubmissions:db.submissions, sub=list.find(x=>x.id===id);if(!sub)return;
  const beforeDeleteNet = mainOfficeNetBalance(db, null, null, sub.id, target.type);
  if (beforeDeleteNet < 0) {
    await confirmDialog(`This submission cannot be deleted because removing it would leave the Main Office over-committed by ${money(Math.abs(beforeDeleteNet))}. Clear the related commitments first.`);
    return;
  }
  const ok=await confirmDialog(`Delete this submission of ${money(sub.amount||0)}?`);if(!ok)return;
  addActivity(db,{action:target.type==="subcommittee"?"Sub Committee Submission Deleted":"Submission Deleted",entityType:target.type==="subcommittee"?"subCommitteeSubmission":"submission",entityId:id,summary:`${targetName()}: submission of ${money(sub.amount||0)} deleted`,oldValue:sub});
  if(target.type==="subcommittee")db.subCommitteeSubmissions=db.subCommitteeSubmissions.filter(x=>x.id!==id);else db.submissions=db.submissions.filter(x=>x.id!==id);saveDB(db);toast("Submission deleted.","success");render();
}

function render(){
  const rows=targetRows();
  const stats=target.type==="subcommittee"?renderScStats():renderPrStats();
  document.getElementById("page-content").innerHTML=`${pageTitle(`${escapeHTML(targetName())} — Submissions`)}${renderSelector()}${stats}${renderForm()}<div class="panel"><div class="d-flex justify-content-between align-items-center mb-3"><div class="panel-title">Submission History</div><span class="small text-muted">${rows.length} submission(s)</span></div>${renderHistory(rows)}</div>`;
  if(s.role==="admin"){
    const tt=document.getElementById("targetType"), ti=document.getElementById("targetId");
    const populate=()=>{const type=tt.value;const list=type==="subcommittee"?db.subCommittees:db.pradeshikams;ti.innerHTML=list.map(x=>`<option value="${x.id}">${escapeHTML(x.name)}</option>`).join("");if(list.some(x=>Number(x.id)===target.id))ti.value=String(target.id);else target.id=Number(list[0]?.id);target.type=type;history.replaceState(null,"",`submissions.html?type=${type}&id=${target.id}`);render();};
    tt.addEventListener("change",populate);ti.addEventListener("change",()=>{target.type=tt.value;target.id=Number(ti.value);history.replaceState(null,"",`submissions.html?type=${target.type}&id=${target.id}`);render();});
    bindForm();
  }
  document.querySelectorAll(".delete-submission").forEach(btn=>btn.addEventListener("click",()=>deleteSubmission(btn.dataset.id)));
}
render();
