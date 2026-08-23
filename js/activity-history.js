const db = getDB(), s = currentSession();
markActive();
if (s.role !== "admin") location.href = "dashboard.html";

function prName(id) { return db.pradeshikams.find(p => Number(p.id) === Number(id))?.name || "-"; }
function scIdOf(a) { return a.subCommitteeId ?? a.newValue?.subCommitteeId ?? a.newValue?.committeeId ?? a.oldValue?.subCommitteeId ?? a.oldValue?.committeeId ?? null; }
function scName(id) { if (id === "other") return "Other"; return db.subCommittees.find(c => Number(c.id) === Number(id))?.name || "-"; }
function isSubActivity(a) {
  const type = String(a.entityType || "").toLowerCase();
  return scIdOf(a) != null || type.includes("subcommittee");
}
function entityTypeLabel(type) {
  const map = {
    subCommitteeCollection:"Sub Committee Collection", subCommitteeCollectionPayment:"Additional Payment",
    subCommitteeAllocation:"Sub Committee Allocation", subcommitteeAllocation:"Sub Committee Allocation",
    subCommitteeExpense:"Sub Committee Expense", subcommitteeExpense:"Sub Committee Expense",
    subCommitteeSubmission:"Sub Committee Submission", submission:"Submission",
    member:"Member", payment:"Payment", donation:"Donation"
  };
  return map[type] || type || "-";
}
const allActions=[...new Set([...(db.activities||[]).map(a=>a.action),
  "Member Added","Member Edited","Member Deleted","Payment Added","Payment Edited","Payment Deleted",
  "Donation Added","Donation Edited","Donation Deleted","Submission Added","Submission Edited","Submission Deleted",
  "Sub Committee Collection Added","Sub Committee Collection Edited","Sub Committee Collection Deleted",
  "Sub Committee Collection Payment Added","Sub Committee Collection Payment Edited","Sub Committee Collection Payment Deleted",
  "Sub Committee Allocation Added","Sub Committee Allocation Edited","Sub Committee Allocation Deleted",
  "Sub Committee Expense Added","Sub Committee Expense Edited","Sub Committee Expense Deleted",
  "Sub Committee Submission Added","Sub Committee Submission Edited","Sub Committee Submission Deleted"
])].filter(Boolean).sort();

const content=document.getElementById("page-content");
content.innerHTML=`<div class="activity-page">${pageTitle("Activity History","Complete audit trail for Pradeshikam and Sub Committee activity.",`<button id="exportActivity" class="btn btn-outline-primary activity-export"><i class="bi bi-download me-1"></i><span>Export History</span></button>`)}
<div class="panel activity-filter-panel mb-4"><div class="activity-scope-row"><div class="activity-scope-field"><label class="form-label">View Activity <span aria-hidden="true">*</span></label><select id="activityScope" class="form-select"><option value="pradeshikam">Pradeshikam Activity</option><option value="subcommittee">Sub Committee Activity</option></select></div></div><div id="activityControls" class="activity-controls"></div></div>
<div class="panel activity-list-panel"><div id="activityList"></div></div></div>`;

const scopeEl=document.getElementById("activityScope"), controlsEl=document.getElementById("activityControls");
function renderControls(){
  const scope=scopeEl.value;
  if(scope==="subcommittee") controlsEl.innerHTML=`<div class="activity-filter-grid activity-filter-grid--four"><div class="activity-filter-field"><label class="form-label">Sub Committee</label><select id="sc" class="form-select"><option value="">All Sub Committees</option>${db.subCommittees.map(c=>`<option value="${c.id}">${escapeHTML(c.name)}</option>`).join("")}<option value="other">Other</option></select></div><div class="activity-filter-field"><label class="form-label">Pradeshikam</label><select id="pr" class="form-select"><option value="">All Pradeshikams</option>${db.pradeshikams.map(p=>`<option value="${p.id}">${escapeHTML(p.name)}</option>`).join("")}</select></div><div class="activity-filter-field"><label class="form-label">Action</label><select id="action" class="form-select"><option value="">All actions</option>${allActions.map(a=>`<option>${escapeHTML(a)}</option>`).join("")}</select></div><div class="activity-filter-field"><label class="form-label">User</label><select id="actor" class="form-select"><option value="">All users</option><option value="admin">Main Committee</option><option value="pradeshikam">Pradeshikam</option><option value="subcommittee">Sub Committees</option></select></div></div><div class="activity-search-row"><input id="search" class="form-control" placeholder="Search Sub Committee, Pradeshikam, action or details"></div>`;
  else controlsEl.innerHTML=`<div class="activity-filter-grid activity-filter-grid--three"><div class="activity-filter-field"><label class="form-label">Pradeshikam</label><select id="pr" class="form-select"><option value="">All Pradeshikams</option>${db.pradeshikams.map(p=>`<option value="${p.id}">${escapeHTML(p.name)}</option>`).join("")}</select></div><div class="activity-filter-field"><label class="form-label">Action</label><select id="action" class="form-select"><option value="">All actions</option>${allActions.filter(a=>!a.toLowerCase().includes("sub committee")).map(a=>`<option>${escapeHTML(a)}</option>`).join("")}</select></div><div class="activity-filter-field"><label class="form-label">User</label><select id="actor" class="form-select"><option value="">All users</option><option value="admin">Main Committee</option><option value="pradeshikam">Pradeshikam</option></select></div></div><div class="activity-search-row"><input id="search" class="form-control" placeholder="Search Pradeshikam, action or details"></div>`;
  ["search","pr","sc","action","actor"].forEach(id=>document.getElementById(id)?.addEventListener(id==="search"?"input":"change",render));
}
function render(){
  const scope=scopeEl.value, q=(document.getElementById("search")?.value||"").toLowerCase().trim(), pr=document.getElementById("pr")?.value||"", sc=document.getElementById("sc")?.value||"", act=document.getElementById("action")?.value||"", actor=document.getElementById("actor")?.value||"";
  const arr=(db.activities||[]).filter(a=>{
    const sub=isSubActivity(a), aid=scIdOf(a);
    if(scope==="subcommittee" && !sub) return false;
    if(scope==="pradeshikam" && sub) return false;
    return (!pr||Number(a.pradeshikamId)===Number(pr)) && (!sc||String(aid)===String(sc)) && (!act||a.action===act) && (!actor||a.actorRole===actor) && (!q||[a.action,a.actor,a.summary,a.details,prName(a.pradeshikamId),scName(aid),entityTypeLabel(a.entityType)].join(" ").toLowerCase().includes(q));
  });
  document.getElementById("activityList").innerHTML=!arr.length?`<div class="empty-state"><i class="bi bi-clock-history"></i>No activity recorded yet.</div>`:`<div class="table-responsive"><table class="table"><thead><tr><th>Date & Time</th><th>Pradeshikam</th><th>Sub Committee</th><th>Action</th><th>Details</th><th>Performed By</th></tr></thead><tbody>${arr.map(a=>{const aid=scIdOf(a),tone=a.action.includes("Deleted")?"red":a.action.includes("Edited")?"yellow":"green";return `<tr><td data-label="Date & Time">${new Date(a.timestamp).toLocaleString("en-IN")}</td><td data-label="Pradeshikam">${escapeHTML(prName(a.pradeshikamId))}</td><td data-label="Sub Committee">${escapeHTML(scName(aid))}</td><td data-label="Action"><span class="status-badge status-${tone}">${escapeHTML(a.action)}</span><div class="small text-muted mt-1">${escapeHTML(entityTypeLabel(a.entityType))}</div></td><td data-label="Details"><b>${escapeHTML(a.summary||"")}</b><div class="small text-muted">${escapeHTML(a.details||"")}</div>${a.oldValue&&a.newValue?`<div class="small mt-1"><b>Old:</b> ${escapeHTML(JSON.stringify(a.oldValue))}<br><b>New:</b> ${escapeHTML(JSON.stringify(a.newValue))}</div>`:""}</td><td data-label="Performed By">${escapeHTML(a.actor||"-")}<div class="small text-muted">${escapeHTML(a.actorRole||"")}</div></td></tr>`;}).join("")}</tbody></table></div>`;
}
scopeEl.addEventListener("change",()=>{renderControls();render();});
document.getElementById("exportActivity").addEventListener("click",()=>{
  const scope=scopeEl.value, data=(db.activities||[]).filter(a=>scope==="subcommittee"?isSubActivity(a):!isSubActivity(a)).map(a=>({DateTime:new Date(a.timestamp).toLocaleString("en-IN"),Pradeshikam:prName(a.pradeshikamId),SubCommittee:scName(scIdOf(a)),Action:a.action,Entity:entityTypeLabel(a.entityType),Summary:a.summary,Details:a.details,PerformedBy:a.actor,Role:a.actorRole}));
  exportCSV(data,scope==="subcommittee"?"fcms-subcommittee-activity-history.csv":"fcms-pradeshikam-activity-history.csv");
});
renderControls();
render();
