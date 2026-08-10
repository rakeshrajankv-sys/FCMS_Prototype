const db=getDB(),s=currentSession();markActive();
const requestedPradeshikam=new URLSearchParams(location.search).get("pradeshikam");
let members=s.role==="admin"?db.members:db.members.filter(m=>m.pradeshikamId===s.pradeshikamId);
if(s.role==="admin"&&requestedPradeshikam)members=members.filter(m=>Number(m.pradeshikamId)===Number(requestedPradeshikam));
const titleSub=s.role==="admin"&&requestedPradeshikam?`Members in ${escapeHTML(db.pradeshikams.find(p=>Number(p.id)===Number(requestedPradeshikam))?.name||"Pradeshikam")}`:"All registered members and their collection status.";
document.getElementById("page-content").innerHTML=`
${pageTitle("Members",titleSub,`<a href="add-member.html" class="btn btn-primary"><i class="bi bi-person-plus me-2"></i>New Member</a>`)}
<div class="panel">
<div class="row g-2 mb-3"><div class="col-md-7"><input id="search" class="form-control" placeholder="Search name, phone, house number or member ID"></div><div class="col-md-3"><select id="statusFilter" class="form-select"><option value="">All statuses</option><option>Green</option><option>Yellow</option><option>Red</option></select></div><div class="col-md-2"><select id="genderFilter" class="form-select"><option value="">All genders</option><option>Male</option><option>Female</option></select></div></div>
<div id="memberTable"></div></div>`;
function render(){
 const q=document.getElementById("search").value.toLowerCase(),sf=document.getElementById("statusFilter").value,gf=document.getElementById("genderFilter").value;
 const arr=members.filter(m=>{const x=memberStats(m,db);return (!q||[m.memberCode,m.name,m.phone,m.houseNumber].join(" ").toLowerCase().includes(q))&&(!sf||x.status===sf)&&(!gf||m.gender===gf)});
 document.getElementById("memberTable").innerHTML=!arr.length?`<div class="empty-state"><i class="bi bi-people"></i>No members found.</div>`:`<div class="table-responsive"><table class="table"><thead><tr><th>Member</th><th>Gender/Age</th><th>Phone</th><th>Pradeshikam</th><th>Required</th><th>Paid</th><th>Balance</th><th>Status</th><th></th></tr></thead><tbody>${arr.map(m=>{const x=memberStats(m,db);return `<tr><td data-label="Member"><b>${escapeHTML(m.name)}</b><div class="small text-muted">${m.memberCode}</div></td><td data-label="Gender/Age">${m.gender}, ${m.age}</td><td data-label="Phone">${escapeHTML(formatPhone(m.phone)||"-")}</td><td data-label="Pradeshikam">${escapeHTML(db.pradeshikams.find(p=>p.id===m.pradeshikamId)?.name||"-")}</td><td data-label="Required">${money(m.requiredAmount)}</td><td data-label="Paid" class="fw-semibold">${money(x.paid)}</td><td data-label="Balance">${money(x.balance)}</td><td data-label="Status">${badge(x.status)}</td><td data-label="Actions"><a class="btn btn-sm btn-light" href="member-details.html?id=${encodeURIComponent(m.id)}"><i class="bi bi-eye"></i></a></td></tr>`}).join("")}</tbody></table></div>`;
}
function badge(s){return `<span class="status-badge status-${s.toLowerCase()}">● ${s}</span>`}
document.getElementById("search").addEventListener("input",render);document.getElementById("statusFilter").addEventListener("change",render);document.getElementById("genderFilter").addEventListener("change",render);render();
