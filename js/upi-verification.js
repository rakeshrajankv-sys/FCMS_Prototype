
function setElectronicVerificationStatus(record, status, actor){
  const now = new Date().toISOString();
  if(fcmsIsUPI(record)){
    record.upiVerificationStatus = status;
    if(status === "verified"){
      record.upiVerifiedAt = now;
      record.upiVerifiedByUserId = actor?.verifiedUserId || actor?.userId || null;
      record.upiVerifiedBy = actor?.name || "Main Committee";
    }else if(status === "rejected"){
      record.upiRejectedAt = now;
      record.upiRejectedByUserId = actor?.verifiedUserId || actor?.userId || null;
      record.upiRejectedBy = actor?.name || "Main Committee";
    }
  }else if(fcmsIsBank(record)){
    record.bankVerificationStatus = status;
    if(status === "verified"){
      record.bankVerifiedAt = now;
      record.bankVerifiedByUserId = actor?.verifiedUserId || actor?.userId || null;
      record.bankVerifiedBy = actor?.name || "Main Committee";
    }else if(status === "rejected"){
      record.bankRejectedAt = now;
      record.bankRejectedByUserId = actor?.verifiedUserId || actor?.userId || null;
      record.bankRejectedBy = actor?.name || "Main Committee";
    }
  }
}

const s=currentSession(); if(!s){location.href="index.html";} else if(s.role!=="admin"){location.href="dashboard.html";}
let db=getDB();
const lang=()=>localStorage.getItem("fcms_lang")==="ml"?"ml":"en";
const L=(en,ml)=>lang()==="ml"?ml:en;
function prName2(id){return db.pradeshikams.find(x=>Number(x.id)===Number(id))?.name||"-";}
function scName2(id){return db.subCommittees.find(x=>Number(x.id)===Number(id))?.name||"-";}
function statusBadge(st){
 const map={pending:["Pending","പരിശോധന ബാക്കി","warning"],verified:["Verified","സ്ഥിരീകരിച്ചു","success"],rejected:["Rejected","നിരസിച്ചു","danger"]};
 const x=map[st]||map.pending; return `<span class="badge rounded-pill text-bg-${x[2]}">${L(x[0],x[1])}</span>`;
}
function scopeName(x){
  if(x.pradeshikamId) return x.pradeshikamName || prName2(x.pradeshikamId);
  if(x.subCommitteeId) return x.subCommitteeName || scName2(x.subCommitteeId);
  return L("Main Committee","പ്രധാന കമ്മിറ്റി");
}
function render(){
 db=getDB(); const rows=fcmsElectronicRecords(db).sort((a,b)=>new Date(b.date||0)-new Date(a.date||0));
 const pending=rows.filter(x=>fcmsVerificationStatus(x.record)==="pending"), verified=rows.filter(x=>fcmsVerificationStatus(x.record)==="verified");
 const rejected=rows.filter(x=>fcmsVerificationStatus(x.record)==="rejected");
 document.getElementById("page-content").innerHTML=`
 ${pageTitle(L("UPI / Bank Verification","UPI / ബാങ്ക് സ്ഥിരീകരണം"))}
 <div class="upi-summary-grid">
  <div class="stat-card"><div class="stat-label">${L("Pending Verification","പരിശോധന ബാക്കി")}</div><div class="stat-value">${money(pending.reduce((a,x)=>a+Number(x.record.amount||0),0))}</div></div>
  <div class="stat-card"><div class="stat-label">${L("Verified by Office","ഓഫീസ് സ്ഥിരീകരിച്ചത്")}</div><div class="stat-value">${money(verified.reduce((a,x)=>a+Number(x.record.amount||0),0))}</div></div>
  <div class="stat-card"><div class="stat-label">${L("Rejected","നിരസിച്ചത്")}</div><div class="stat-value">${money(rejected.reduce((a,x)=>a+Number(x.record.amount||0),0))}</div></div>
 </div>
 <div class="panel upi-verify-panel">
  <div class="upi-toolbar">
    <div class="upi-filter-grid upi-filter-grid-only">
      <div class="upi-filter-field">
        <label class="form-label">${L("Status","നില")}</label>
        <select id="upiStatusFilter" class="form-select">
          <option value="pending">${L("Pending","പരിശോധന ബാക്കി")}</option>
          <option value="all">${L("All","എല്ലാം")}</option>
          <option value="verified">${L("Verified","സ്ഥിരീകരിച്ചത്")}</option>
          <option value="rejected">${L("Rejected","നിരസിച്ചത്")}</option>
        </select>
      </div>
      <div class="upi-filter-field">
        <label class="form-label">${L("Committee Type","കമ്മിറ്റി തരം")}</label>
        <select id="upiScopeFilter" class="form-select">
          <option value="all">${L("All Committees","എല്ലാ കമ്മിറ്റികളും")}</option>
          <option value="pradeshikam">${L("Pradeshikam","പ്രദേശികം")}</option>
          <option value="subcommittee">${L("Sub Committee","ഉപസമിതി")}</option>
        </select>
      </div>
      <div class="upi-filter-field">
        <label class="form-label">${L("Committee","കമ്മിറ്റി")}</label>
        <select id="upiCommitteeFilter" class="form-select">
          <option value="all">${L("All","എല്ലാം")}</option>
        </select>
      </div>
    </div>
  </div>
  <div id="upiRows"></div>
 </div>`;
 const statusFilter=document.getElementById("upiStatusFilter");
 const scopeFilter=document.getElementById("upiScopeFilter");
 const committeeFilter=document.getElementById("upiCommitteeFilter");
 function populateCommitteeFilter(){
   const scope=scopeFilter.value;
   committeeFilter.innerHTML=`<option value="all">${L("All","എല്ലാം")}</option>`;
   if(scope==="pradeshikam"){
     committeeFilter.innerHTML += (db.pradeshikams||[]).map(x=>`<option value="p:${x.id}">${escapeHTML(x.name)}</option>`).join("");
   }else if(scope==="subcommittee"){
     committeeFilter.innerHTML += (db.subCommittees||[]).map(x=>`<option value="s:${x.id}">${escapeHTML(x.name)}</option>`).join("");
   }
 }
 function applyFilters(){ drawRows(rows,statusFilter.value,scopeFilter.value,committeeFilter.value); }
 statusFilter.addEventListener("change",applyFilters);
 scopeFilter.addEventListener("change",()=>{populateCommitteeFilter();applyFilters();});
 committeeFilter.addEventListener("change",applyFilters);
 populateCommitteeFilter();
 drawRows(rows,"pending","all","all");
}
function drawRows(rows,filter,scope="all",committee="all"){
 const arr=rows.filter(x=>filter==="all"||fcmsVerificationStatus(x.record)===filter).filter(x=>{
   const isPr=!!x.pradeshikamId, isSc=!!x.subCommitteeId, isMain=!isPr&&!isSc;
   if(scope==="pradeshikam"&&!isPr) return false;
   if(scope==="subcommittee"&&!isSc) return false;
   if(committee==="all") return true;
   if(committee.startsWith("p:")) return Number(x.pradeshikamId)===Number(committee.slice(2));
   if(committee.startsWith("s:")) return Number(x.subCommitteeId)===Number(committee.slice(2));
   return true;
 });
 document.getElementById("upiRows").innerHTML=arr.length?`<div class="upi-card-list">${arr.map(x=>{
   const r=x.record, st=fcmsVerificationStatus(r);
   return `<article class="upi-transaction-card">
    <div class="upi-card-head"><div><div class="upi-payer">${escapeHTML(x.payer)}</div><div class="upi-scope">${escapeHTML(scopeName(x))} · ${escapeHTML(x.kind)}</div></div>${statusBadge(st)}</div>
    <div class="upi-details">
      <div><span>${L("Amount","തുക")}</span><b>${money(r.amount)}</b></div>
      <div><span>${L("Transaction ID","ട്രാൻസാക്ഷൻ ഐഡി")}</span><b>${escapeHTML(r.transactionId||"-")}</b></div>
      <div><span>${L("Receipt","രസീത്")}</span><b>${escapeHTML(r.receiptNumber||"-")}</b></div>
      <div><span>${L("Date","തീയതി")}</span><b>${new Date(x.date||Date.now()).toLocaleDateString("en-IN")}</b></div>
    </div>
    ${st==="pending"?`<div class="upi-actions"><button class="btn btn-success verify-upi" data-c="${x.collection}" data-id="${r.id}"><i class="bi bi-check2-circle me-1"></i>${L("Verify","സ്ഥിരീകരിക്കുക")}</button><button class="btn btn-outline-danger reject-upi" data-c="${x.collection}" data-id="${r.id}"><i class="bi bi-x-circle me-1"></i>${L("Reject","നിരസിക്കുക")}</button></div>`:""}
    ${st==="verified"?`<div class="upi-audit-note">${L("Verified by","സ്ഥിരീകരിച്ചത്")}: ${escapeHTML(r.upiVerifiedBy||r.bankVerifiedBy||"-")}</div>`:""}
   </article>`}).join("")}</div>`:`<div class="empty-state">${L("No UPI / Bank transactions in this status.","ഈ നിലയിൽ UPI ഇടപാടുകളില്ല.")}</div>`;
 document.querySelectorAll(".verify-upi").forEach(b=>b.onclick=()=>setStatus(b.dataset.c,b.dataset.id,"verified"));
 document.querySelectorAll(".reject-upi").forEach(b=>b.onclick=()=>setStatus(b.dataset.c,b.dataset.id,"rejected"));
}
function locate(c,id){
  const map={
    payment:"payments",
    donation:"donations",
    subCommitteeCollection:"subCommitteeCollections",
    subcommitteeCollection:"subCommitteeCollections",
    sub_committee_collection:"subCommitteeCollections",
    subCommitteeCollectionPayment:"subCommitteeCollectionPayments",
    subcommitteeCollectionPayment:"subCommitteeCollectionPayments",
    sub_committee_payment:"subCommitteeCollectionPayments"
  };
  const key=map[c];
  if(!key) return null;
  return (db[key]||[]).find(x=>String(x.id)===String(id)) || null;
}
async function setStatus(c,id,status){
  db=getDB();
  const r=locate(c,id);

  if(!r){
    toast(L("Transaction record could not be found. Please refresh and try again.","ഇടപാട് രേഖ കണ്ടെത്താനായില്ല. പേജ് പുതുക്കി വീണ്ടും ശ്രമിക്കുക."),"danger");
    return;
  }

  const mode = fcmsIsBank(r) ? "Bank" : "UPI";
  const isVerify = status === "verified";

  const ok = await confirmDialog(
    isVerify
      ? L(`Verify this ${mode} payment?`,`${mode} പേയ്മെന്റ് സ്ഥിരീകരിക്കണോ?`)
      : L(`Reject this ${mode} payment?`,`${mode} പേയ്മെന്റ് നിരസിക്കണോ?`),
    {
      title: isVerify
        ? L(`${mode} Payment Verification`,`${mode} പേയ്മെന്റ് സ്ഥിരീകരണം`)
        : L(`${mode} Payment Rejection`,`${mode} പേയ്മെന്റ് നിരസിക്കൽ`),
      confirmLabel: isVerify ? L("Verify","സ്ഥിരീകരിക്കുക") : L("Reject","നിരസിക്കുക"),
      cancelLabel: L("Cancel","റദ്ദാക്കുക"),
      tone: isVerify ? "success" : "danger"
    }
  );
  if(!ok) return;

  const before = {
    upiVerificationStatus:r.upiVerificationStatus,
    bankVerificationStatus:r.bankVerificationStatus
  };

  setElectronicVerificationStatus(r,status,s);

  addActivity(db,{
    action:isVerify ? "PAYMENT_VERIFIED" : "PAYMENT_REJECTED",
    entityType:c,
    entityId:r.id,
    pradeshikamId:r.pradeshikamId || null,
    subCommitteeId:r.subCommitteeId || r.subcommitteeId || r.committeeId || null,
    summary:`${mode} payment ${status}: ${money(r.amount)}${r.transactionId?` · ${r.transactionId}`:""}`,
    details:`${actorLabel()} ${status} ${mode} payment${r.receiptNumber?` for receipt ${r.receiptNumber}`:""}.`,
    oldValue:before,
    newValue:{
      paymentMode:r.paymentMode || r.mode || mode,
      amount:Number(r.amount||0),
      transactionId:r.transactionId||"",
      receiptNumber:r.receiptNumber||"",
      verificationStatus:fcmsVerificationStatus(r)
    }
  });

  saveDB(db);

  toast(
    isVerify
      ? L(`${mode} payment verified.`,`${mode} പേയ്മെന്റ് സ്ഥിരീകരിച്ചു.`)
      : L(`${mode} payment rejected.`,`${mode} പേയ്മെന്റ് നിരസിച്ചു.`),
    isVerify ? "success" : "danger"
  );
  render();
}
render();
