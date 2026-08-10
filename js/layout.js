const session=requireAuth();
if(session){
document.getElementById("app").innerHTML=`
<div class="app-shell">
<aside class="sidebar" id="sidebar">
  <div class="sidebar-brand"><img src="logo.png" alt="Logo"><span>Fund Collection</span></div>
  <div class="px-3 small text-secondary">${escapeHTML(session.role==="admin"?"Main Committee":session.name)}</div>
  <nav class="sidebar-nav">
    <div class="nav-section">Main</div>
    <a href="dashboard.html"><i class="bi bi-grid-1x2"></i>Dashboard</a>
    <a href="members.html"><i class="bi bi-people"></i>Members</a>
    <a href="payments.html"><i class="bi bi-receipt"></i>Payments</a>
    <a href="submissions.html"><i class="bi bi-bank"></i>Submissions</a>
    ${session.role==="admin"?`<a href="pradeshikams.html"><i class="bi bi-diagram-3"></i>Pradeshikams</a><a href="activity-history.html"><i class="bi bi-clock-history"></i>Activity History</a>`:""}
    <a href="reports.html"><i class="bi bi-bar-chart"></i>Reports</a>
    <div class="nav-section">System</div>
    <a href="#" onclick="logout();return false"><i class="bi bi-box-arrow-right"></i>Logout</a>
  </nav>
  ${session.role==="admin"?`<div class="sidebar-footer"><button class="btn btn-sm btn-outline-light w-100" onclick="resetPrototype()">Reset Prototype Data</button></div>`:""}
</aside>
<main class="main">
<header class="topbar">
  <button class="btn btn-light mobile-menu" onclick="document.getElementById('sidebar').classList.toggle('open')"><i class="bi bi-list"></i></button>
  <div class="d-none d-md-block small text-muted">Fund Collection Management System</div>
  <div class="user-pill"><div class="text-end d-none d-sm-block"><div class="fw-semibold small">${escapeHTML(session.name)}</div><div class="text-muted" style="font-size:11px">${session.role==="admin"?"Main Committee":"Pradeshikam"}</div></div><div class="avatar">${escapeHTML(session.name.charAt(0))}</div></div>
</header>
<div class="page-content" id="page-content"></div>
</main></div>`;
}
function markActive(){
  const page=location.pathname.split("/").pop()||"dashboard.html";
  document.querySelectorAll(".sidebar a").forEach(a=>{if(a.getAttribute("href")===page)a.classList.add("active")});
}
function logout(){clearSession();location.href="index.html"}
function pageTitle(title,sub,button=""){
return `<div class="d-flex flex-wrap justify-content-between align-items-end gap-3 mb-4"><div class="page-title"><h1>${title}</h1><p>${sub}</p></div>${button}</div>`;
}
