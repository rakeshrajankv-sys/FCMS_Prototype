const db=getDB(),s=currentSession();markActive();
const allowedPradeshikams=s.role==="admin"?db.pradeshikams:db.pradeshikams.filter(p=>Number(p.id)===Number(s.pradeshikamId));
let selectedId=s.role==="admin"?(Number(new URLSearchParams(location.search).get("pradeshikam"))||Number(allowedPradeshikams[0]?.id)):Number(s.pradeshikamId);
if(!allowedPradeshikams.some(p=>Number(p.id)===Number(selectedId))) selectedId=Number(allowedPradeshikams[0]?.id);

function prName(id){return db.pradeshikams.find(p=>Number(p.id)===Number(id))?.name||"Pradeshikam"}
function prMembers(id){return db.members.filter(m=>Number(m.pradeshikamId)===Number(id))}
function totalCollected(id){return prMembers(id).reduce((sum,m)=>sum+memberStats(m,db).paid,0)}
function totalSubmitted(id){return (db.submissions||[]).filter(x=>Number(x.pradeshikamId)===Number(id)).reduce((sum,x)=>sum+Number(x.amount||0),0)}
function remaining(id){return Math.max(0,totalCollected(id)-totalSubmitted(id))}
function selectedPradeshikam(){return db.pradeshikams.find(p=>Number(p.id)===Number(selectedId))}

function render(){
  const p=selectedPradeshikam();
  if(!p){document.getElementById("page-content").innerHTML=`${pageTitle("Submissions","Record amounts handed over to the Main Committee.")}<div class="panel"><div class="empty-state"><i class="bi bi-bank"></i>No Pradeshikam available.</div></div>`;return}
  const collected=totalCollected(p.id),submitted=totalSubmitted(p.id),left=remaining(p.id);
  const rows=[...(db.submissions||[])].filter(x=>Number(x.pradeshikamId)===Number(p.id)).sort((a,b)=>new Date(b.date||b.createdAt)-new Date(a.date||a.createdAt));
  const selector=s.role==="admin"?`<div class="panel mb-4"><div class="row g-2 align-items-end"><div class="col-md-7"><label class="form-label">Pradeshikam *</label><select id="pradeshikamSelect" class="form-select">${db.pradeshikams.map(x=>`<option value="${x.id}" ${Number(x.id)===Number(p.id)?"selected":""}>${escapeHTML(x.name)}</option>`).join("")}</select></div><div class="col-md-5"><div class="small text-muted">Main Committee can view the submission details for every Pradeshikam.</div></div></div></div>`:"";
  const form=s.role==="pradeshikam"?`<div class="panel form-card mb-4">
<div class="panel-title mb-3">New Submission</div>
<form id="submissionForm" novalidate>
<div class="row g-3">
<div class="col-md-6"><label class="form-label">Amount Submitted *</label><input id="submissionAmount" type="number" min="1" step="1" max="${left||1}" class="form-control" required><div class="invalid-feedback">Enter a valid submission amount.</div></div>
<div class="col-md-6"><label class="form-label">Submission Date *</label><input id="submissionDate" type="date" class="form-control" value="${new Date().toISOString().slice(0,10)}" required><div class="invalid-feedback">Select the submission date.</div></div>
<div class="col-12"><label class="form-label">Remarks</label><textarea id="submissionRemarks" class="form-control" rows="3" placeholder="Optional"></textarea></div>
</div>
<div id="submissionError" class="alert alert-danger d-none mt-3"></div>
<div class="d-flex justify-content-end gap-2 mt-4"><button type="button" id="clearSubmission" class="btn btn-light">Clear</button><button type="submit" class="btn btn-primary" ${left<=0?"disabled":""}><i class="bi bi-check2 me-1"></i>Save Submission</button></div>
</form></div>`:"";
  document.getElementById("page-content").innerHTML=`
${pageTitle("Submissions",`${escapeHTML(p.name)} → Main Committee`,s.role==="admin"?"View submission details and handover history.":`Record each amount handed over to the Main Committee.`)}
${selector}
<div class="row g-3 mb-4">
<div class="col-md-4"><div class="stat-card"><div class="stat-label">Total Collected</div><div class="stat-value">${money(collected)}</div></div></div>
<div class="col-md-4"><div class="stat-card"><div class="stat-label">Submitted to Main Committee</div><div class="stat-value">${money(submitted)}</div></div></div>
<div class="col-md-4"><div class="stat-card"><div class="stat-label">Remaining with Pradeshikam</div><div class="stat-value">${money(left)}</div></div></div>
</div>
${form}
<div class="panel"><div class="d-flex justify-content-between align-items-center mb-3"><div class="panel-title">Submission History</div><span class="small text-muted">${rows.length} submission(s)</span></div>${!rows.length?`<div class="empty-state"><i class="bi bi-bank"></i>No submissions recorded yet.</div>`:`<div class="table-responsive"><table class="table"><thead><tr><th>Date</th><th>Amount</th><th>Total Submitted</th><th>Remaining</th><th>Remarks</th><th>Recorded By</th></tr></thead><tbody>${renderRows(rows,p.id)}</tbody></table></div>`}</div>`;
  if(s.role==="pradeshikam"){
    document.getElementById("submissionForm").addEventListener("submit",saveSubmission);
    document.getElementById("clearSubmission").addEventListener("click",()=>{const f=document.getElementById("submissionForm");f.reset();document.getElementById("submissionDate").value=new Date().toISOString().slice(0,10);clearInvalid(f);document.getElementById("submissionError").classList.add("d-none")});
    document.getElementById("submissionAmount").addEventListener("input",()=>document.getElementById("submissionAmount").classList.remove("is-invalid"));
    document.getElementById("submissionDate").addEventListener("change",()=>document.getElementById("submissionDate").classList.remove("is-invalid"));
  }
  if(s.role==="admin") document.getElementById("pradeshikamSelect").addEventListener("change",e=>{selectedId=Number(e.target.value);history.replaceState(null,"",`submissions.html?pradeshikam=${selectedId}`);render()});
}
function renderRows(rows,pid){let running=0;const chronological=[...rows].sort((a,b)=>new Date(a.date||a.createdAt)-new Date(b.date||b.createdAt));const totals=new Map();chronological.forEach(x=>{running+=Number(x.amount||0);totals.set(x.id,{running,remaining:Math.max(0,totalCollected(pid)-running)})});return rows.map(x=>{const t=totals.get(x.id)||{running:Number(x.amount||0),remaining:remaining(pid)};return `<tr><td data-label="Date">${escapeHTML(new Date((x.date||x.createdAt)+((x.date&&!String(x.date).includes("T"))?"T00:00:00":"")).toLocaleDateString("en-IN"))}</td><td data-label="Amount" class="fw-semibold">${money(x.amount)}</td><td data-label="Total Submitted">${money(t.running)}</td><td data-label="Remaining">${money(t.remaining)}</td><td data-label="Remarks">${escapeHTML(x.remarks||"-")}</td><td data-label="Recorded By">${escapeHTML(x.recordedBy||"-")}</td></tr>`}).join("")}
function clearInvalid(form){form.querySelectorAll(".is-invalid").forEach(el=>el.classList.remove("is-invalid"))}
function validateRequired(form){let ok=true;form.querySelectorAll("[required]").forEach(el=>{const empty=!String(el.value||"").trim();el.classList.toggle("is-invalid",empty);if(empty)ok=false});return ok}
function saveSubmission(e){
  e.preventDefault();
  const form=e.currentTarget,err=document.getElementById("submissionError");err.classList.add("d-none");
  if(!validateRequired(form)){err.textContent="Please fill in all required fields highlighted in red.";err.classList.remove("d-none");return}
  const amount=Number(document.getElementById("submissionAmount").value),date=document.getElementById("submissionDate").value,remarks=document.getElementById("submissionRemarks").value.trim(),left=remaining(selectedId);
  if(!Number.isFinite(amount)||amount<=0){document.getElementById("submissionAmount").classList.add("is-invalid");err.textContent="Enter a valid submission amount.";err.classList.remove("d-none");return}
  if(amount>left){document.getElementById("submissionAmount").classList.add("is-invalid");err.textContent=`Submission cannot exceed the remaining amount of ${money(left)}.`;err.classList.remove("d-none");return}
  const submission={id:uid("sub"),pradeshikamId:Number(selectedId),amount,date,remarks,createdAt:new Date().toISOString(),recordedBy:actorLabel()};
  db.submissions ||= [];db.submissions.push(submission);
  addActivity(db,{action:"Submission Added",entityType:"submission",entityId:submission.id,pradeshikamId:Number(selectedId),summary:`${prName(selectedId)} submitted ${money(amount)}`,details:`Amount handed over to Main Committee on ${new Date(date+"T00:00:00").toLocaleDateString("en-IN")}.${remarks?" Remarks: "+remarks:""}`,newValue:{amount,date,remarks}});
  saveDB(db);render();
}
render();
