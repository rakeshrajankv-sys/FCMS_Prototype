const db=getDB(),s=currentSession();markActive();
if(s.role!=="admin"){location.href="dashboard.html"}
document.getElementById("page-content").innerHTML=`
${pageTitle("Activity History","Audit trail of member and payment changes across all Pradeshikams.",`<button id="exportActivity" class="btn btn-outline-primary"><i class="bi bi-download me-1"></i>Export History</button>`)}
<div class="panel">
<div class="row g-2 mb-3">
<div class="col-md-5"><input id="search" class="form-control" placeholder="Search member, receipt or action"></div>
<div class="col-md-3"><select id="pr" class="form-select"><option value="">All Pradeshikams</option>${db.pradeshikams.map(p=>`<option value="${p.id}">${escapeHTML(p.name)}</option>`).join("")}</select></div>
<div class="col-md-2"><select id="action" class="form-select"><option value="">All actions</option>${["Member Added","Member Edited","Member Deleted","Payment Added","Payment Edited","Payment Deleted"].map(a=>`<option>${a}</option>`).join("")}</select></div>
<div class="col-md-2"><select id="actor" class="form-select"><option value="">All users</option><option value="admin">Main Committee</option><option value="pradeshikam">Pradeshikam</option></select></div>
</div>
<div id="activityList"></div></div>`;
function prName(id){return db.pradeshikams.find(p=>Number(p.id)===Number(id))?.name||"-"}
function render(){
 const q=document.getElementById("search").value.toLowerCase(),pr=document.getElementById("pr").value,act=document.getElementById("action").value,actor=document.getElementById("actor").value;
 const arr=(db.activities||[]).filter(a=>(!pr||Number(a.pradeshikamId)===Number(pr))&&(!act||a.action===act)&&(!actor||a.actorRole===actor)&&(!q||[a.action,a.actor,a.summary,a.details,prName(a.pradeshikamId)].join(" ").toLowerCase().includes(q)));
 document.getElementById("activityList").innerHTML=!arr.length?`<div class="empty-state"><i class="bi bi-clock-history"></i>No activity recorded yet.</div>`:
 `<div class="table-responsive"><table class="table"><thead><tr><th>Date & Time</th><th>Pradeshikam</th><th>Action</th><th>Details</th><th>Performed By</th></tr></thead><tbody>${arr.map(a=>`<tr><td data-label="Date & Time">${new Date(a.timestamp).toLocaleString("en-IN")}</td><td data-label="Pradeshikam">${escapeHTML(prName(a.pradeshikamId))}</td><td data-label="Action"><span class="status-badge status-${a.action.includes("Deleted")?"red":a.action.includes("Edited")?"yellow":"green"}">${escapeHTML(a.action)}</span></td><td data-label="Details"><b>${escapeHTML(a.summary)}</b><div class="small text-muted">${escapeHTML(a.details)}</div>${a.oldValue&&a.newValue?`<div class="small mt-1"><b>Old:</b> ${escapeHTML(JSON.stringify(a.oldValue))}<br><b>New:</b> ${escapeHTML(JSON.stringify(a.newValue))}</div>`:""}</td><td data-label="Performed By">${escapeHTML(a.actor)}</td></tr>`).join("")}</tbody></table></div>`;
}
["search","pr","action","actor"].forEach(id=>document.getElementById(id).addEventListener(id==="search"?"input":"change",render));
document.getElementById("exportActivity").addEventListener("click",()=>{
 const data=(db.activities||[]).map(a=>({DateTime:new Date(a.timestamp).toLocaleString("en-IN"),Pradeshikam:prName(a.pradeshikamId),Action:a.action,Summary:a.summary,Details:a.details,PerformedBy:a.actor}));
 if(typeof exportCSV==="function")exportCSV(data,"fcms-activity-history.csv");
});
render();


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
