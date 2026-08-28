const db = getDB(), s = currentSession();
markActive();
if (!s || s.role !== "admin") location.href = "dashboard.html";

db.verifiedUsers ||= [];
const activityParams = new URLSearchParams(location.search);
const verifiedFilterId = activityParams.get("verified");
const verifiedFilterUser = verifiedFilterId ? db.verifiedUsers.find(v => String(v.id) === String(verifiedFilterId)) : null;
function prName(id) { return db.pradeshikams.find(p => Number(p.id) === Number(id))?.name || "-"; }
function scIdOf(a) { return a.subCommitteeId ?? a.newValue?.subCommitteeId ?? a.newValue?.committeeId ?? a.oldValue?.subCommitteeId ?? a.oldValue?.committeeId ?? null; }
function scName(id) { if (id === "other") return "Other"; return db.subCommittees.find(c => Number(c.id) === Number(id))?.name || "-"; }
function isSubActivity(a) { const type=String(a.entityType||"").toLowerCase(); return scIdOf(a)!=null || type.includes("subcommittee"); }
function entityTypeLabel(type) {
  const map={subCommitteeCollection:"Sub Committee Collection",subCommitteeCollectionPayment:"Additional Payment",subCommitteeAllocation:"Sub Committee Allocation",subcommitteeAllocation:"Sub Committee Allocation",subCommitteeExpense:"Sub Committee Expense",subcommitteeExpense:"Sub Committee Expense",subCommitteeSubmission:"Sub Committee Submission",submission:"Submission",member:"Member",payment:"Payment",donation:"Donation"};
  return map[type] || (type ? String(type).replace(/([a-z])([A-Z])/g,"$1 $2").replace(/^./,m=>m.toUpperCase()) : "-");
}
function actorCommittee(a) {
  if (a.actorBelongsTo && a.actorBelongsTo !== "System") return a.actorBelongsTo;
  if (a.actorRole === "admin") return "Main Committee";
  if (a.actorRole === "pradeshikam") return prName(a.actorPradeshikamId || a.pradeshikamId);
  if (a.actorRole === "subcommittee") return scName(a.actorSubCommitteeId || scIdOf(a));
  return "-";
}
function verifiedActor(a) {
  const list=db.verifiedUsers||[];
  let v=null;
  if (a.actorUserId != null) v=list.filter(x=>String(x.userId)===String(a.actorUserId)).sort((x,y)=>new Date(y.lastVerifiedAt||0)-new Date(x.lastVerifiedAt||0))[0];
  if (!v && a.actorPhone) v=list.find(x=>String(x.phone||"").replace(/\D/g,"")===String(a.actorPhone||"").replace(/\D/g,""));
  if (!v && a.actor) v=list.find(x=>String(x.username||"").toLowerCase()===String(a.actor||"").toLowerCase());
  if (!v && a.actorRole) {
    const sameRole=list.filter(x=>x.role===a.actorRole);
    if (sameRole.length===1) v=sameRole[0];
  }
  return { name:v?.name || a.actor || "-", phone:v?.phone || a.actorPhone || "", role:v?.role || a.actorRole || "", belongs:v ? (v.role==="admin"?"Main Committee":v.role==="pradeshikam"?(v.pradeshikamName||actorCommittee(a)):(v.subCommitteeName||actorCommittee(a))) : actorCommittee(a) };
}

function matchesVerifiedFilter(a) {
  if (!verifiedFilterUser) return true;
  const va = verifiedActor(a);
  if (verifiedFilterUser.userId != null && a.actorUserId != null && String(verifiedFilterUser.userId) === String(a.actorUserId)) return true;
  const vPhone = String(verifiedFilterUser.phone || "").replace(/\D/g, "");
  const aPhone = String(va.phone || a.actorPhone || "").replace(/\D/g, "");
  if (vPhone && aPhone && vPhone === aPhone) return true;
  return String(verifiedFilterUser.username || "").toLowerCase() === String(a.actor || "").toLowerCase();
}
function actionTone(action) { const x=String(action||""); return x.includes("Deleted")?"red":x.includes("Edited")?"blue":"green"; }
function actionWord(action) { const x=String(action||""); if(x.includes("Deleted"))return "Deleted"; if(x.includes("Edited"))return "Edited"; if(x.includes("Added"))return "Added"; if(x.includes("Restored"))return "Restored"; return x || "-"; }
function recordDetails(a) {
  const summary=escapeHTML(a.summary||entityTypeLabel(a.entityType));
  const details=escapeHTML(a.details||"");
  return `<b>${summary}</b>${details?`<small>${details}</small>`:""}`;
}
function canRestore(a) { return String(a.action||"").includes("Deleted") && !!a.oldValue; }
async function restoreActivity(id) {
  const a=(db.activities||[]).find(x=>x.id===id); if(!a||!canRestore(a)) return;
  const ok=await confirmDialog(`Restore the deleted ${entityTypeLabel(a.entityType)} record?`,{title:"Confirm Restore",confirmLabel:"Restore Data",cancelLabel:t("cancel")});
  if(!ok) return;
  const result=restoreDeletedActivity(db,id);
  if(!result.ok){toast(result.message||"Unable to restore this record.","warning");return;}
  fcmsClearPageDraft(); saveDB(db); toast("Deleted data restored successfully.","success"); render();
}
window.restoreActivity=restoreActivity;

const allActions=[...new Set((db.activities||[]).map(a=>a.action).filter(Boolean))].sort();
const modules=[...new Set((db.activities||[]).map(a=>entityTypeLabel(a.entityType)).filter(Boolean))].sort();
const content=document.getElementById("page-content");
content.innerHTML=`${pageTitle(verifiedFilterUser ? `Activity History — ${escapeHTML(verifiedFilterUser.name || verifiedFilterUser.username || "User")}` : "Activity History","",`<button id="exportActivity" class="btn btn-outline-primary export-icon-btn" title="Download CSV" aria-label="Download CSV"><i class="bi bi-download"></i></button>`)}
<div class="panel activity-history-panel">
  <div class="activity-filter-grid">
    <div class="activity-search-wrap"><i class="bi bi-search"></i><input id="search" class="form-control" placeholder="Search Activity"></div>
    <select id="scope" class="form-select" aria-label="Committee Type"><option value="">All Committees</option><option value="pradeshikam">Pradeshikam</option><option value="subcommittee">Sub Committee</option></select>
    <select id="module" class="form-select" aria-label="Module"><option value="">All Modules</option>${modules.map(x=>`<option>${escapeHTML(x)}</option>`).join("")}</select>
    <select id="action" class="form-select" aria-label="Action"><option value="">All Actions</option>${allActions.map(x=>`<option>${escapeHTML(x)}</option>`).join("")}</select>
    <select id="actor" class="form-select" aria-label="User"><option value="">All Users</option><option value="admin">Main Committee</option><option value="pradeshikam">Pradeshikam</option><option value="subcommittee">Sub Committee</option></select>
  </div>
  <div id="activityList"></div>
</div>`;

function render() {
  const q=(document.getElementById("search").value||"").toLowerCase().trim(), scope=document.getElementById("scope").value, module=document.getElementById("module").value, action=document.getElementById("action").value, actor=document.getElementById("actor").value;
  const arr=(db.activities||[]).filter(a=>{
    const va=verifiedActor(a), isSub=isSubActivity(a), mod=entityTypeLabel(a.entityType);
    if(!matchesVerifiedFilter(a)) return false;
    if(scope==="subcommittee"&&!isSub) return false;
    if(scope==="pradeshikam"&&isSub) return false;
    if(module&&mod!==module) return false;
    if(action&&a.action!==action) return false;
    if(actor&&a.actorRole!==actor) return false;
    if(q&&![a.action,a.summary,a.details,mod,va.name,va.phone,va.belongs,prName(a.pradeshikamId),scName(scIdOf(a))].join(" ").toLowerCase().includes(q)) return false;
    return true;
  });
  document.getElementById("activityList").innerHTML=!arr.length?`<div class="empty-state py-5"><i class="bi bi-clock-history"></i>No Activity Recorded</div>`:`<div class="table-responsive activity-table-wrap"><table class="table align-middle activity-table"><thead><tr><th>Sl No</th><th>Date & Time</th><th>Performed By</th><th>Committee</th><th>Action</th><th>Module</th><th>Details / Record</th><th>Recovery</th></tr></thead><tbody>${arr.map((a,i)=>{const va=verifiedActor(a),tone=actionTone(a.action);return `<tr>
    <td data-label="Sl No"><span class="serial-pill">${i+1}</span></td>
    <td data-label="Date & Time">${escapeHTML(new Date(a.timestamp).toLocaleString("en-IN",{dateStyle:"medium",timeStyle:"short"}))}</td>
    <td data-label="Performed By"><div class="audit-person"><b>${escapeHTML(va.name)}</b>${va.phone?`<small><i class="bi bi-telephone"></i>${escapeHTML(va.phone)}</small>`:""}</div></td>
    <td data-label="Committee"><b>${escapeHTML(va.belongs)}</b><small class="audit-role">${escapeHTML(va.role==="admin"?"Main Committee":va.role==="pradeshikam"?"Pradeshikam":va.role==="subcommittee"?"Sub Committee":"")}</small></td>
    <td data-label="Action"><span class="audit-action audit-${tone}">${escapeHTML(actionWord(a.action))}</span></td>
    <td data-label="Module">${escapeHTML(entityTypeLabel(a.entityType))}</td>
    <td data-label="Details / Record"><div class="audit-record">${recordDetails(a)}</div></td>
    <td data-label="Recovery">${canRestore(a)?`<button class="btn btn-sm btn-outline-success audit-restore" onclick="restoreActivity('${escapeHTML(a.id)}')"><i class="bi bi-arrow-counterclockwise"></i><span>Restore</span></button>`:`<span class="text-muted">—</span>`}</td>
  </tr>`}).join("")}</tbody></table></div>`;
}
["search","scope","module","action","actor"].forEach(id=>document.getElementById(id).addEventListener(id==="search"?"input":"change",render));
document.getElementById("exportActivity").addEventListener("click",()=>{
  const data=(db.activities||[]).map(a=>{const va=verifiedActor(a);return {DateTime:new Date(a.timestamp).toLocaleString("en-IN"),PerformedBy:va.name,Mobile:va.phone,Role:va.role,Committee:va.belongs,Action:a.action,Module:entityTypeLabel(a.entityType),Summary:a.summary||"",Details:a.details||""};});
  exportCSV(data,"fcms-activity-history.csv");
});
render();
