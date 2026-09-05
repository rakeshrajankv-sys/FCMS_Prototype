
/* FCMS report date range */
const fcmsReportDateRange = { from:"", to:"", preset:"all" };

function fcmsParseReportDate(value){
  if(!value) return null;
  const s=String(value).trim();
  let m=s.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if(m) return new Date(+m[1],+m[2]-1,+m[3],12);
  m=s.match(/^(\d{1,2})[-\/](\d{1,2})[-\/](\d{4})$/);
  if(m) return new Date(+m[3],+m[2]-1,+m[1],12);
  const d=new Date(value);
  return isNaN(d) ? null : new Date(d.getFullYear(),d.getMonth(),d.getDate(),12);
}
function fcmsReportRecordDate(x){
  if(!x) return null;
  return fcmsParseReportDate(
    x.date || x.paymentDate || x.donationDate || x.submissionDate ||
    x.expenseDate || x.createdAt || x.updatedAt || x.timestamp
  );
}
function fcmsReportInDateRange(x){
  if(!fcmsReportDateRange.from && !fcmsReportDateRange.to) return true;
  const d=fcmsReportRecordDate(x);
  if(!d) return false;
  const from=fcmsParseReportDate(fcmsReportDateRange.from);
  const to=fcmsParseReportDate(fcmsReportDateRange.to);
  if(from && d < from) return false;
  if(to && d > to) return false;
  return true;
}
function fcmsFilterReportDate(rows){
  return (rows||[]).filter(fcmsReportInDateRange);
}
function fcmsDateYMD(d){
  const p=n=>String(n).padStart(2,"0");
  return `${d.getFullYear()}-${p(d.getMonth()+1)}-${p(d.getDate())}`;
}
function fcmsDatePreset(key){
  const now=new Date(), today=new Date(now.getFullYear(),now.getMonth(),now.getDate(),12);
  let from="",to="";
  if(key==="today"){
    from=to=fcmsDateYMD(today);
  }else if(key==="yesterday"){
    const d=new Date(today); d.setDate(d.getDate()-1); from=to=fcmsDateYMD(d);
  }else if(key==="last7"){
    const d=new Date(today); d.setDate(d.getDate()-6); from=fcmsDateYMD(d); to=fcmsDateYMD(today);
  }else if(key==="lastmonth"){
    from=fcmsDateYMD(new Date(today.getFullYear(),today.getMonth()-1,1,12));
    to=fcmsDateYMD(new Date(today.getFullYear(),today.getMonth(),0,12));
  }else if(key==="lastyear"){
    from=fcmsDateYMD(new Date(today.getFullYear()-1,0,1,12));
    to=fcmsDateYMD(new Date(today.getFullYear()-1,11,31,12));
  }
  return {from,to};
}
function fcmsReportDateFilterFieldsHTML(){
  return `
    <div class="fcms-report-date-presets">
      <button type="button" class="fcms-report-date-chip active" data-range="all">All</button>
      <button type="button" class="fcms-report-date-chip" data-range="today">Today</button>
      <button type="button" class="fcms-report-date-chip" data-range="yesterday">Yesterday</button>
      <button type="button" class="fcms-report-date-chip" data-range="last7">Last 7 Days</button>
      <button type="button" class="fcms-report-date-chip" data-range="lastmonth">Last Month</button>
      <button type="button" class="fcms-report-date-chip" data-range="lastyear">Last Year</button>
    </div>
    <label class="fcms-report-date-field"><span>From Date</span><input type="date" class="form-control" data-date-from></label>
    <label class="fcms-report-date-field"><span>To Date</span><input type="date" class="form-control" data-date-to></label>`;
}
function fcmsReportDateFilterHTML(prefix){
  return `<div class="fcms-report-secondary-row fcms-report-secondary-row-no-view" data-date-filter="${prefix}">
    ${fcmsReportDateFilterFieldsHTML()}
  </div>`;
}
function fcmsBindReportDateFilter(root,onChange){
  if(!root) return;
  const from=root.querySelector("[data-date-from]"), to=root.querySelector("[data-date-to]");
  const chips=[...root.querySelectorAll(".fcms-report-date-chip")];
  const sync=()=>{
    fcmsReportDateRange.from=from?.value||"";
    fcmsReportDateRange.to=to?.value||"";
    if(fcmsReportDateRange.from && fcmsReportDateRange.to && fcmsReportDateRange.from>fcmsReportDateRange.to){
      to.value=fcmsReportDateRange.from;
      fcmsReportDateRange.to=to.value;
    }
    if(typeof onChange==="function") onChange();
  };
  chips.forEach(btn=>btn.onclick=()=>{
    const k=btn.dataset.range, r=fcmsDatePreset(k);
    fcmsReportDateRange.preset=k;
    from.value=r.from; to.value=r.to;
    chips.forEach(x=>x.classList.toggle("active",x===btn));
    sync();
  });
  from.onchange=()=>{fcmsReportDateRange.preset="custom";chips.forEach(x=>x.classList.remove("active"));sync();};
  to.onchange=()=>{fcmsReportDateRange.preset="custom";chips.forEach(x=>x.classList.remove("active"));sync();};
}


const db = getDB(), s = currentSession();
markActive();
if (s.role === "subcommittee") renderSubCommitteeReport();
else renderMainReport();

function scName(id) { return db.subCommittees.find((c) => Number(c.id) === Number(id))?.name || "Other"; }
function prName(id) { return db.pradeshikams.find((p) => Number(p.id) === Number(id))?.name || "-"; }
function scFilterRows(id) {
  return Number(id) ? {
    collections:fcmsFilterReportDate((db.subCommitteeCollections||[]).filter(x=>Number(x.subCommitteeId)===Number(id))),
    payments:fcmsFilterReportDate((db.subCommitteeCollectionPayments||[]).filter(x=>Number(x.subCommitteeId)===Number(id))),
    allocations:fcmsFilterReportDate((db.subCommitteeAllocations||[]).filter(x=>Number(x.subCommitteeId??x.committeeId)===Number(id))),
    expenses:fcmsFilterReportDate((db.subCommitteeExpenses||[]).filter(x=>Number(x.subCommitteeId)===Number(id))),
    submissions:fcmsFilterReportDate((db.subCommitteeSubmissions||[]).filter(x=>Number(x.subCommitteeId)===Number(id)))
  } : {collections:[],payments:[],allocations:[],expenses:[],submissions:[]};
}
function documentRows(id) {
  const r=scFilterRows(id), out=[];
  r.allocations.forEach(x=>{ if(x.voucherDataUrl) out.push({Date:x.date,Type:"Voucher / Receipt",Record:"Allocation",Amount:x.amount,File:x.voucherName||"Voucher",Url:x.voucherDataUrl}); });
  r.expenses.forEach(x=>{ if(x.billDataUrl) out.push({Date:x.date||x.createdAt,Type:"Receipt / Bill",Record:"Expense",Amount:x.amount,File:x.billName||"Receipt / Bill",Url:x.billDataUrl}); });
  r.submissions.forEach(x=>{ if(x.receiptDataUrl||x.receiptUrl||x.receiptImage) out.push({Date:x.date||x.createdAt,Type:"Receipt / Voucher",Record:"Submission",Amount:x.amount,File:"Submission receipt / voucher",Url:x.receiptDataUrl||x.receiptUrl||x.receiptImage}); });
  return out;
}
function escDocUrl(url){ return String(url||"").replace(/&/g,"&amp;").replace(/"/g,"&quot;").replace(/</g,"&lt;").replace(/>/g,"&gt;"); }
function exportFullSubcommitteeHTML(id) {
  const c=db.subCommittees.find(x=>Number(x.id)===Number(id)); if(!c) return;
  const r=scFilterRows(id), docs=documentRows(id);
  const rows=(title,headers,data)=>`<h2>${title}</h2><table><thead><tr>${headers.map(h=>`<th>${h}</th>`).join("")}</tr></thead><tbody>${data.map(row=>`<tr>${row.map(v=>`<td>${String(v??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;")}</td>`).join("")}</tr>`).join("")}</tbody></table>`;
  const html=`<!doctype html><html><head><meta charset="utf-8"><title>${c.name} - NIDHI Full Report</title><style>body{font-family:Arial,sans-serif;padding:28px;color:#172033}h1{margin-bottom:4px}h2{margin-top:28px}table{border-collapse:collapse;width:100%;margin-top:8px}th,td{border:1px solid #d8dee8;padding:7px;text-align:left;font-size:12px}th{background:#eef3f9}.cards{display:flex;gap:12px;flex-wrap:wrap}.card{padding:12px;border:1px solid #d8dee8;border-radius:8px;min-width:150px}.doc a{word-break:break-all}</style></head><body><h1>${String(c.name).replace(/</g,"&lt;")}</h1><div>NIDHI Full Sub Committee Report · Generated ${new Date().toLocaleString("en-IN")}</div><div class="cards"><div class="card">Collected<br><b>${money(subCommitteeCollectionTotal(id,db))}</b></div><div class="card">Submitted<br><b>${money(subCommitteeSubmittedTotal(id,db))}</b></div><div class="card">Received from Office<br><b>${money(subCommitteeAllocationTotal(id,db))}</b></div><div class="card">Spent<br><b>${money(subCommitteeExpenseTotal(id,db))}</b></div></div>
${rows("Collections",["Date","Name","Receipt","Amount","Mode","Remarks"],r.collections.map(x=>[new Date(x.date||x.createdAt).toLocaleString("en-IN"),x.donorName||x.name||"",x.receiptNumber||"",money(x.amount),x.paymentMode||"",x.remarks||""]))}
${rows("Additional Payments",["Date","Original Collection","Receipt","Amount","Mode","Remarks"],r.payments.map(x=>[new Date(x.date||x.createdAt).toLocaleString("en-IN"),x.collectionId||"",x.receiptNumber||"",money(x.amount),x.paymentMode||"",x.remarks||""]))}
${rows("Allocations",["Date","Amount","Purpose","Collected By","Voucher"],r.allocations.map(x=>[x.date||"",money(x.amount),x.allocationPurpose||x.purpose||"",x.collectedByName||x.collectedBy||"",x.voucherName||"Not attached"]))}
${rows("Expenses",["Date","Description/Purpose","Amount","Receipt/Bill"],r.expenses.map(x=>[x.date||"",x.expensePurpose||x.description||"",money(x.amount),x.billName||"Not attached"]))}
${rows("Submissions",["Date","Amount","Receipt/Voucher","Remarks"],r.submissions.map(x=>[x.date||"",money(x.amount),x.receiptName||"Attached",x.remarks||""]))}
<h2>Attached Documents</h2><table class="doc"><thead><tr><th>Date</th><th>Type</th><th>Record</th><th>Amount</th><th>File</th><th>Open</th></tr></thead><tbody>${docs.length?docs.map(x=>`<tr><td>${x.Date||""}</td><td>${x.Type}</td><td>${x.Record}</td><td>${money(x.Amount)}</td><td>${String(x.File).replace(/</g,"&lt;")}</td><td><a href="${escDocUrl(x.Url)}" target="_blank" rel="noopener">Open document</a></td></tr>`).join(""):"<tr><td colspan=6>No attached documents.</td></tr>"}</tbody></table></body></html>`;
  const blob=new Blob([html],{type:"text/html"}), a=document.createElement("a"); a.href=URL.createObjectURL(blob); a.download=`nidhi-${c.name.replace(/[^a-z0-9]+/gi,"-").toLowerCase()}-full-report.html`; a.click(); setTimeout(()=>URL.revokeObjectURL(a.href),1000);
}

function renderSubCommitteeReport() {
  const c=db.subCommittees.find(x=>Number(x.id)===Number(s.subCommitteeId));
  document.getElementById("page-content").innerHTML=`${pageTitle(`${escapeHTML(c?.name||"Sub Committee")} Reports`,"Complete collection, allocation, expense and submission report.",`<button id="scFull" class="btn btn-outline-primary"><i class="bi bi-file-earmark-text me-1"></i>Full Report</button>`)}<div class="panel mb-4 fcms-reports-filter-panel"><div class="fcms-reports-primary-row fcms-subcommittee-primary-row"><div class="col-md-4"><label class="form-label">Report / റിപ്പോർട്ട്</label><select id="scType" class="form-select"><option value="collections">Collections</option><option value="expenses">Expenses</option><option value="allocations">Allocations</option><option value="submissions">Submissions</option><option value="documents">Documents</option></select></div><div class="col-md-2"><button id="scDownload" class="btn btn-primary w-100 export-icon-btn" title="Download CSV" aria-label="Download CSV"><i class="bi bi-download" aria-hidden="true"></i></button></div></div>${fcmsReportDateFilterHTML("subcommittee")}</div><div class="panel mb-4"><div class="panel-title mb-3">Summary</div><div id="scSummary"></div></div><div class="panel"><div id="scRows"></div></div>`;
  const id=c?.id;
  const render=()=>{ const r=scFilterRows(id), docs=documentRows(id), collected=r.collections.reduce((a,x)=>a+Number(x.amount||0),0)+r.payments.reduce((a,x)=>a+Number(x.amount||0),0), submitted=r.submissions.reduce((a,x)=>a+Number(x.amount||0),0), received=r.allocations.reduce((a,x)=>a+Number(x.amount||0),0), spent=r.expenses.reduce((a,x)=>a+Number(x.amount||0),0); document.getElementById("scSummary").innerHTML=`<div class="row g-3"><div class="col-6 col-lg-3"><div class="stat-card"><div class="stat-label">Collected</div><div class="stat-value">${money(collected)}</div></div></div><div class="col-6 col-lg-3"><div class="stat-card"><div class="stat-label">Submitted</div><div class="stat-value">${money(submitted)}</div></div></div><div class="col-6 col-lg-3"><div class="stat-card"><div class="stat-label">Received from Office</div><div class="stat-value">${money(received)}</div></div></div><div class="col-6 col-lg-3"><div class="stat-card"><div class="stat-label">Spent</div><div class="stat-value">${money(spent)}</div></div></div></div>`;
    const type=document.getElementById("scType").value; let html="";
    if(type==="collections") html=`<div class="panel-title mb-3">Collections</div>${r.collections.length?`<div class="table-responsive"><table class="table"><thead><tr><th>Date</th><th>Name</th><th>Receipt</th><th>Amount</th><th>Mode</th><th>Remarks</th></tr></thead><tbody>${r.collections.map(x=>`<tr><td>${new Date(x.date||x.createdAt).toLocaleString("en-IN")}</td><td>${escapeHTML(x.donorName||x.name||"-")}</td><td>${escapeHTML(x.receiptNumber||"")}</td><td>${money(x.amount)}</td><td>${escapeHTML(x.paymentMode||"")}</td><td>${escapeHTML(x.remarks||"")}</td></tr>`).join("")}</tbody></table></div>`:`<div class="empty-state">No records.</div>`}`;
    if(type==="expenses") html=`<div class="panel-title mb-3">Expenses</div><div class="table-responsive"><table class="table"><thead><tr><th>Date</th><th>Purpose</th><th>Amount</th><th>Receipt/Bill</th><th>Remarks</th></tr></thead><tbody>${r.expenses.map(x=>`<tr><td>${x.date||""}</td><td>${escapeHTML(x.expensePurpose||x.description||"-")}</td><td>${money(x.amount)}</td><td>${x.billDataUrl?`<a href="${escDocUrl(x.billDataUrl)}" target="_blank" class="btn btn-sm btn-light">View</a>`:"-"}</td><td>${escapeHTML(x.remarks||"")}</td></tr>`).join("")||`<tr><td colspan=5>No records.</td></tr>`}</tbody></table></div>`;
    if(type==="allocations") html=`<div class="panel-title mb-3">Allocations</div><div class="table-responsive"><table class="table"><thead><tr><th>Date</th><th>Amount</th><th>Purpose</th><th>Collected By</th><th>Voucher/Receipt</th></tr></thead><tbody>${r.allocations.map(x=>`<tr><td>${x.date||""}</td><td>${money(x.amount)}</td><td>${escapeHTML(x.allocationPurpose||x.purpose||"-")}</td><td>${escapeHTML(x.collectedByName||x.collectedBy||"-")}</td><td>${x.voucherDataUrl?`<a href="${escDocUrl(x.voucherDataUrl)}" target="_blank" class="btn btn-sm btn-light">View</a>`:"-"}</td></tr>`).join("")||`<tr><td colspan=5>No records.</td></tr>`}</tbody></table></div>`;
    if(type==="submissions") html=`<div class="panel-title mb-3">Submissions</div><div class="table-responsive"><table class="table"><thead><tr><th>Date</th><th>Amount</th><th>Receipt/Voucher</th><th>Remarks</th></tr></thead><tbody>${r.submissions.map(x=>`<tr><td>${x.date||""}</td><td>${money(x.amount)}</td><td>${x.receiptDataUrl?`<a href="${escDocUrl(x.receiptDataUrl)}" target="_blank" class="btn btn-sm btn-light">View</a>`:"-"}</td><td>${escapeHTML(x.remarks||"")}</td></tr>`).join("")||`<tr><td colspan=4>No records.</td></tr>`}</tbody></table></div>`;
    if(type==="documents") html=`<div class="panel-title mb-3">Attached Documents</div><div class="table-responsive"><table class="table"><thead><tr><th>Date</th><th>Type</th><th>Record</th><th>Amount</th><th>File</th><th>Open</th></tr></thead><tbody>${docs.map(x=>`<tr><td>${x.Date||""}</td><td>${x.Type}</td><td>${x.Record}</td><td>${money(x.Amount)}</td><td>${escapeHTML(x.File)}</td><td><a href="${escDocUrl(x.Url)}" target="_blank" class="btn btn-sm btn-light">View</a></td></tr>`).join("")||`<tr><td colspan=6>No attached documents.</td></tr>`}</tbody></table></div>`;
    document.getElementById("scRows").innerHTML=html;
  };
  fcmsBindReportDateFilter(document.querySelector('[data-date-filter="subcommittee"]'), render);
  document.getElementById("scType").addEventListener("change",render); document.getElementById("scDownload").addEventListener("click",()=>{ const type=document.getElementById("scType").value,r=scFilterRows(id),docs=documentRows(id); let data=[]; if(type==="collections") data=r.collections.map(x=>({Date:x.date||x.createdAt,SubCommittee:c.name,Receipt:x.receiptNumber||"",Name:x.donorName||x.name||"",Amount:x.amount,Mode:x.paymentMode||"",Remarks:x.remarks||""})); else if(type==="expenses") data=r.expenses.map(x=>({Date:x.date||x.createdAt,SubCommittee:c.name,Purpose:x.expensePurpose||x.description||"",Amount:x.amount,ReceiptBill:x.billName||"Not attached",Remarks:x.remarks||""})); else if(type==="allocations") data=r.allocations.map(x=>({Date:x.date||x.createdAt,SubCommittee:c.name,Amount:x.amount,Purpose:x.allocationPurpose||x.purpose||"",CollectedBy:x.collectedByName||x.collectedBy||"",Voucher:x.voucherName||"Not attached"})); else if(type==="submissions") data=r.submissions.map(x=>({Date:x.date||x.createdAt,SubCommittee:c.name,Amount:x.amount,ReceiptVoucher:x.receiptName||"Attached",Remarks:x.remarks||""})); else data=docs.map(x=>({Date:x.Date,SubCommittee:c.name,Type:x.Type,Record:x.Record,Amount:x.Amount,File:x.File,DocumentAttached:"Yes"})); exportCSV(data,`nidhi-${c.name.replace(/[^a-z0-9]+/gi,"-").toLowerCase()}-${type}.csv`);});
  document.getElementById("scFull").addEventListener("click",()=>exportFullSubcommitteeHTML(id)); render();
}

function renderMainReport(){
  const isAdmin = s.role === "admin";
  const fixedPradeshikam = s.role === "pradeshikam" ? s.pradeshikamId : "";

  document.getElementById("page-content").innerHTML = `${pageTitle("Reports","View financial and operational reports.")}
  <div class="panel mb-4 fcms-reports-filter-panel">
    <div id="reportControls"></div>
    <div class="fcms-report-section-heading"><span>Report view and date range</span><small>Dates are optional</small></div>
    <div class="fcms-report-secondary-row" data-date-filter="main">
      <div class="fcms-report-view-field">
        <label class="form-label">View Reports / റിപ്പോർട്ടുകൾ കാണുക *</label>
        <select id="reportScope" class="form-select">
          <option value="pradeshikam">${t("pradeshikam_reports")}</option>
          ${isAdmin ? `<option value="subcommittee">${t("subcommittee_reports")}</option>` : ''}
        </select>
      </div>
      ${fcmsReportDateFilterFieldsHTML()}
    </div>
  </div>
  <div class="panel"><div class="panel-title mb-3">Summary</div><div id="summary"></div></div>`;

  const scopeEl = document.getElementById("reportScope");
  const controlsEl = document.getElementById("reportControls");

  function renderControls(){
    const scope = scopeEl.value;
    if(scope === "subcommittee" && isAdmin){
      controlsEl.innerHTML = `<div class="fcms-reports-primary-row">
        <div class="col-md-5"><label class="form-label">Sub Committee / ഉപസമിതി</label><select id="sc" class="form-select"><option value="">All Sub Committees</option>${db.subCommittees.map(c=>`<option value="${c.id}">${escapeHTML(c.name)}</option>`).join("")}<option value="other">Other</option></select></div>
        <div class="col-md-5"><label class="form-label">Report / റിപ്പോർട്ട്</label><select id="type" class="form-select">
          <option value="subcommitteeOverview">Sub Committee Overview</option><option value="subcommittee">Collections</option><option value="subcommitteePayments">Additional Payments</option><option value="subcommitteeAllocations">Allocations</option><option value="subcommitteeExpenses">Expenses</option><option value="subcommitteeSubmissions">Submissions</option><option value="subcommitteeDocuments">Documents</option><option value="subcommitteeFull">Full Report</option>
        </select></div>
        <div class="col-md-2"><button id="download" class="btn btn-primary w-100 export-icon-btn" title="Download CSV" aria-label="Download CSV"><i class="bi bi-download" aria-hidden="true"></i><span>Export CSV</span></button></div>
      </div>`;
    } else {
      controlsEl.innerHTML = `<div class="fcms-reports-primary-row">
        <div class="col-md-4"><label class="form-label">Pradeshikam / പ്രദേശികം</label><select id="pr" class="form-select" ${!isAdmin?'disabled':''}>${isAdmin?'<option value="">All Pradeshikams</option>':''}${db.pradeshikams.filter(p=>isAdmin||Number(p.id)===Number(fixedPradeshikam)).map(p=>`<option value="${p.id}" ${!isAdmin?'selected':''}>${escapeHTML(p.name)}</option>`).join("")}</select></div>
        <div class="col-md-2"><label class="form-label">Status / നില</label><select id="st" class="form-select"><option value="">All statuses</option><option>Green</option><option>Yellow</option><option>Red</option></select></div>
        <div class="col-md-4"><label class="form-label">Report / റിപ്പോർട്ട്</label><select id="type" class="form-select"><option value="members">Members</option><option value="payments">Collections</option><option value="donations">Donations</option></select></div>
        <div class="col-md-2"><button id="download" class="btn btn-primary w-100 export-icon-btn" title="Download CSV" aria-label="Download CSV"><i class="bi bi-download" aria-hidden="true"></i><span>Export CSV</span></button></div>
      </div>`;
    }
    bindControls();
    fcmsBindReportDateFilter(document.querySelector('[data-date-filter="main"]'), renderSummary);
    renderSummary();
  }

  const selectedPid=()=>document.getElementById("pr")?.value || "";
  const selectedSc=()=>document.getElementById("sc")?.value || "";
  function filteredMembers(){
    const pid = selectedPid();
    const st = document.getElementById("st")?.value || "";
    return db.members.filter(m => (isAdmin || Number(m.pradeshikamId)===Number(fixedPradeshikam)) && (!pid || Number(m.pradeshikamId)===Number(pid)) && (!st || memberStats(m,db).status===st) && fcmsReportInDateRange(m));
  }
  function reportEligibleMembers(){
    const pid = selectedPid();
    const st = document.getElementById("st")?.value || "";
    return db.members.filter(m =>
      (isAdmin || Number(m.pradeshikamId)===Number(fixedPradeshikam)) &&
      (!pid || Number(m.pradeshikamId)===Number(pid)) &&
      (!st || memberStats(m,db).status===st)
    );
  }
  function visibleDonations(){
    const pid=selectedPid();
    return (db.donations||[]).filter(d=>d.status!=="hold" && (isAdmin || Number(d.pradeshikamId)===Number(fixedPradeshikam)) && (!pid || Number(d.pradeshikamId)===Number(pid)) && fcmsReportInDateRange(d));
  }
  function scRows(){
    const id=selectedSc();
    if(id) return scFilterRows(id);
    return {
      collections:fcmsFilterReportDate(db.subCommitteeCollections||[]),
      payments:fcmsFilterReportDate(db.subCommitteeCollectionPayments||[]),
      allocations:fcmsFilterReportDate(db.subCommitteeAllocations||[]),
      expenses:fcmsFilterReportDate(db.subCommitteeExpenses||[]),
      submissions:fcmsFilterReportDate(db.subCommitteeSubmissions||[])
    };
  }
  function renderSummary(){
    const scope=scopeEl.value, type=document.getElementById("type")?.value;
    if(scope === "subcommittee" && isAdmin){
      const id=selectedSc();
      const rows=id ? scRows() : {collections:[],payments:[],allocations:[],expenses:[],submissions:[]};
      if(type === "subcommitteeFull" && id){
        document.getElementById("summary").innerHTML=`<div class="d-flex justify-content-between align-items-center flex-wrap gap-3"><div><h3 class="mb-1">${escapeHTML(scName(id))}</h3><div class="text-muted">Complete report including collections, additional payments, allocations, expenses, submissions and attached documents.</div></div><button class="btn btn-outline-primary" id="fullInline"><i class="bi bi-file-earmark-text me-1"></i>Generate Full Report</button></div>`;
        document.getElementById("fullInline").onclick=()=>exportFullSubcommitteeHTML(id);
        return;
      }
      const cards = id ? (()=>{const collected=rows.collections.reduce((a,x)=>a+Number(x.amount||0),0)+rows.payments.reduce((a,x)=>a+Number(x.amount||0),0),submitted=rows.submissions.reduce((a,x)=>a+Number(x.amount||0),0),received=rows.allocations.reduce((a,x)=>a+Number(x.amount||0),0),spent=rows.expenses.reduce((a,x)=>a+Number(x.amount||0),0);return `<div class="row g-3"><div class="col-6 col-lg-3"><div class="stat-card"><div class="stat-label">Collected</div><div class="stat-value">${money(collected)}</div></div></div><div class="col-6 col-lg-3"><div class="stat-card"><div class="stat-label">Submitted</div><div class="stat-value">${money(submitted)}</div></div></div><div class="col-6 col-lg-3"><div class="stat-card"><div class="stat-label">Received from Office</div><div class="stat-value">${money(received)}</div></div></div><div class="col-6 col-lg-3"><div class="stat-card"><div class="stat-label">Expense Balance</div><div class="stat-value">${money(Math.max(0,received-spent))}</div></div></div></div>`;})() : `<div class="alert alert-info mb-0">Select a Sub Committee to view its report details.</div>`;
      const overview=id?"":`<div class="table-responsive mt-4"><table class="table"><thead><tr><th>Sub Committee</th><th>Collected</th><th>Submitted</th><th>Collection Remaining</th><th>Received from Office</th><th>Spent</th><th>Expense Balance</th></tr></thead><tbody>${db.subCommittees.map(c=>{const rr=scFilterRows(c.id),collected=rr.collections.reduce((a,x)=>a+Number(x.amount||0),0)+rr.payments.reduce((a,x)=>a+Number(x.amount||0),0),submitted=rr.submissions.reduce((a,x)=>a+Number(x.amount||0),0),received=rr.allocations.reduce((a,x)=>a+Number(x.amount||0),0),spent=rr.expenses.reduce((a,x)=>a+Number(x.amount||0),0);return `<tr><td><b>${escapeHTML(c.name)}</b></td><td>${money(collected)}</td><td>${money(submitted)}</td><td>${money(Math.max(0,collected-submitted))}</td><td>${money(received)}</td><td>${money(spent)}</td><td>${money(Math.max(0,received-spent))}</td></tr>`;}).join("")}</tbody></table></div>`;
      document.getElementById("summary").innerHTML=cards+overview;
      return;
    }

    const eligible=reportEligibleMembers(), ids=new Set(eligible.map(m=>m.id));
    const ms=eligible.filter(fcmsReportInDateRange);
    const periodPayments=fcmsFilterReportDate((db.payments||[]).filter(p=>ids.has(p.memberId) && p.status!=="hold"));
    const pd=periodPayments.reduce((a,p)=>a+Number(p.amount||0),0), ds=visibleDonations().reduce((a,d)=>a+Number(d.amount||0),0);
    const recordCount=type==="payments"?periodPayments.length:type==="donations"?visibleDonations().length:ms.length;
    document.getElementById("summary").innerHTML=`<div class="row g-3"><div class="col-6 col-lg-3"><div class="stat-card"><div class="stat-label">Records in Period</div><div class="stat-value">${recordCount}</div></div></div><div class="col-6 col-lg-3"><div class="stat-card"><div class="stat-label">Collected in Period</div><div class="stat-value">${money(pd)}</div></div></div><div class="col-6 col-lg-3"><div class="stat-card"><div class="stat-label">Donations in Period</div><div class="stat-value">${money(ds)}</div></div></div><div class="col-6 col-lg-3"><div class="stat-card"><div class="stat-label">Total in Period</div><div class="stat-value">${money(pd+ds)}</div></div></div></div>`;
  }
  function bindControls(){
    ["pr","st","type","sc"].forEach(id=>document.getElementById(id)?.addEventListener("change",renderSummary));
    document.getElementById("download")?.addEventListener("click",()=>{
      const scope=scopeEl.value,type=document.getElementById("type").value,id=selectedSc(),r=scRows();
      if(scope === "subcommittee" && type === "subcommitteeFull"){ if(id) exportFullSubcommitteeHTML(id); else toast("Select a Sub Committee for the full report.","warning"); return; }
      let data=[];
      if(scope === "subcommittee") {
        if(type==="subcommitteeOverview") data=db.subCommittees.map(c=>{const collected=subCommitteeCollectionTotal(c.id,db),submitted=subCommitteeSubmittedTotal(c.id,db),received=subCommitteeAllocationTotal(c.id,db),spent=subCommitteeExpenseTotal(c.id,db);return{SubCommittee:c.name,Collected:collected,Submitted:submitted,CollectionRemaining:Math.max(0,collected-submitted),ReceivedFromOffice:received,Spent:spent,ExpenseBalance:Math.max(0,received-spent)};});
        else if(type==="subcommittee") data=r.collections.map(x=>({Date:x.date||x.createdAt,SubCommittee:scName(x.subCommitteeId),Receipt:x.receiptNumber||"",Name:x.donorName||x.name||"",Amount:x.amount,Mode:x.paymentMode||"",Remarks:x.remarks||""}));
        else if(type==="subcommitteePayments") data=r.payments.map(x=>({Date:x.date||x.createdAt,SubCommittee:scName(x.subCommitteeId),Receipt:x.receiptNumber||"",Amount:x.amount,Mode:x.paymentMode||"",OriginalCollection:x.collectionId||"",Remarks:x.remarks||""}));
        else if(type==="subcommitteeAllocations") data=r.allocations.map(x=>({Date:x.date||x.createdAt,SubCommittee:scName(x.subCommitteeId??x.committeeId),Amount:x.amount,Purpose:x.allocationPurpose||x.purpose||"",CollectedBy:x.collectedByName||x.collectedBy||"",Voucher:x.voucherName||"Not attached",Remarks:x.remarks||""}));
        else if(type==="subcommitteeExpenses") data=r.expenses.map(x=>({Date:x.date||x.createdAt,SubCommittee:scName(x.subCommitteeId),Purpose:x.expensePurpose||x.description||"",Amount:x.amount,ReceiptBill:x.billName||"Not attached",Remarks:x.remarks||""}));
        else if(type==="subcommitteeSubmissions") data=r.submissions.map(x=>({Date:x.date||x.createdAt,SubCommittee:scName(x.subCommitteeId),Amount:x.amount,ReceiptVoucher:x.receiptName||"Attached",Remarks:x.remarks||""}));
        else if(type==="subcommitteeDocuments") data=(id?documentRows(id):[].concat(...db.subCommittees.map(c=>documentRows(c.id)))).map(x=>({Date:x.Date,SubCommittee:id?scName(id):"All",Type:x.Type,Record:x.Record,Amount:x.Amount,File:x.File,DocumentAttached:"Yes"}));
        exportCSV(data,`nidhi-${type}.csv`); return;
      }
      if(type==="members") data=filteredMembers().map(m=>{const x=memberStats(m,db),p=db.pradeshikams.find(p=>p.id===m.pradeshikamId);return{MemberID:m.memberCode,Name:m.name,Gender:m.gender,Age:m.age,Phone:formatPhone(m.phone||"",m.countryCode||"+91"),Pradeshikam:p?.name||"",Required:m.requiredAmount,Paid:x.paid,Balance:x.balance,Status:x.status};});
      else if(type==="payments"){const ids=new Set(reportEligibleMembers().map(m=>m.id));data=fcmsFilterReportDate(db.payments.filter(p=>ids.has(p.memberId))).map(p=>{const m=db.members.find(x=>x.id===p.memberId),pr=db.pradeshikams.find(x=>x.id===m?.pradeshikamId);return{Receipt:p.receiptNumber,MemberID:m?.memberCode||"",Name:m?.name||"",Pradeshikam:pr?.name||"",Amount:p.amount,PaymentMode:p.paymentMode,Status:p.status==="hold"?"Hold":"Completed",Date:new Date(p.paymentDate).toLocaleString("en-IN"),Remarks:p.remarks||""};});}
      else if(type==="donations") data=visibleDonations().map(d=>({Date:new Date(d.date||d.createdAt).toLocaleString("en-IN"),Receipt:d.receiptNumber||"",Donor:d.donorName||"",Pradeshikam:prName(d.pradeshikamId),Amount:d.amount,PaymentMode:d.paymentMode||"",Status:d.status==="hold"?"Hold":"Completed",Remarks:d.remarks||""}));
      exportCSV(data,`nidhi-${type}.csv`);
    });
  }
  scopeEl.addEventListener("change",renderControls);
  renderControls();
}
