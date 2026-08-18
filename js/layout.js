const session = requireAuth();
if (session) {
  const isAdminRole = session.role === "admin";
  const isSub = session.role === "subcommittee";
  const db = getDB();
  const myCommittee = isSub
    ? db.subCommittees.find(
        (c) => Number(c.id) === Number(session.subCommitteeId),
      )
    : null;
  const pradeshikamNavPages = [
    "members.html",
    "payments.html",
    "submissions.html",
    "pradeshikams.html",
  ];
  const subCommitteePages = [
    "subcommittee-collections.html",
    "subcommittee-submissions.html",
  ];
  const currentPage = location.pathname.split("/").pop();
  document.getElementById("app").innerHTML = `
<div class="app-shell">
<aside class="sidebar" id="sidebar">
  <div class="sidebar-brand"><img src="logo.png" alt="Logo"><span>Fund Collection</span></div>
  <div class="px-3 small sidebar-role">${escapeHTML(isAdminRole ? "Main Committee" : session.name)}</div>
  <nav class="sidebar-nav">
    <div class="nav-section">Main</div>
    <a href="dashboard.html"><i class="bi bi-grid-1x2"></i>Dashboard</a>
    ${isAdminRole ? `<a href="activity-history.html"><i class="bi bi-clock-history"></i>Activity History</a>` : ""}
    <a href="reports.html"><i class="bi bi-bar-chart"></i>Reports</a>
    ${!isSub ? `<a href="donations.html"><i class="bi bi-gift"></i>Donations</a>` : ""}
    ${
      !isSub
        ? `<div class="nav-dropdown ${pradeshikamNavPages.includes(currentPage) ? "open" : ""}">
      <button type="button" class="nav-dropdown-toggle" onclick="this.parentElement.classList.toggle('open')"><span><i class="bi bi-diagram-3"></i>Pradeshikam</span><i class="bi bi-chevron-down nav-chevron"></i></button>
      <div class="nav-dropdown-menu">
        <a href="members.html"><i class="bi bi-people"></i>Members</a>
        <a href="payments.html"><i class="bi bi-receipt"></i>Collections</a>
        <a href="submissions.html"><i class="bi bi-bank"></i>Submissions</a>
        ${isAdminRole ? `<a href="pradeshikams.html"><i class="bi bi-diagram-3"></i>Pradeshikams</a>` : ""}
      </div>
    </div>`
        : ""
    }
    ${
      isAdminRole
        ? `<div class="nav-dropdown ${subCommitteePages.includes(currentPage) ? "open" : ""}" id="subCommitteeNav">
      <button type="button" class="nav-dropdown-toggle" onclick="this.parentElement.classList.toggle('open')"><span><i class="bi bi-people"></i>Sub Committees</span><i class="bi bi-chevron-down nav-chevron"></i></button>
      <div class="nav-dropdown-menu"></div>
    </div>
    <a href="subcommittee-expense.html"><i class="bi bi-receipt-cutoff"></i>Sub Committee Expenses</a>
    <a href="subcommittee-allocation.html"><i class="bi bi-cash-stack"></i>Sub Committee Allocation</a>`
        : ""
    }
    ${
      isSub
        ? `<a href="subcommittee-collections.html"><i class="bi ${myCommittee?.icon || "bi-cash-coin"}"></i>Collection</a>
    <a href="subcommittee-submissions.html"><i class="bi bi-bank"></i>Submission</a>
    <a href="subcommittee-expense.html"><i class="bi bi-receipt-cutoff"></i>Expense</a>
    ${myCommittee?.financeAccess ? `<a href="members.html"><i class="bi bi-people"></i>Members</a>` : ""}`
        : ""
    }
    <div class="nav-section">System</div>
    <a href="#" onclick="logout();return false"><i class="bi bi-box-arrow-right"></i>Logout</a>
  </nav>
  ${isAdminRole ? `<div class="sidebar-footer"><button class="btn btn-sm btn-outline-light w-100" onclick="resetPrototype()">Reset Prototype Data</button></div>` : ""}
</aside>
<div class="sidebar-overlay" id="sidebarOverlay" onclick="closeSidebar()"></div>
<main class="main"><header class="topbar"><button class="btn btn-light mobile-menu" onclick="toggleSidebar()"><i class="bi bi-list"></i></button><div class="d-none d-md-block small text-muted">Fund Collection Management System</div><div class="user-pill"><div class="text-end d-none d-sm-block"><div class="fw-semibold small">${escapeHTML(session.name)}</div><div class="text-muted" style="font-size:11px">${isAdminRole ? "Main Committee" : isSub ? "Sub Committee" : "Pradeshikam"}</div></div><div class="avatar">${escapeHTML(session.name.charAt(0))}</div></div></header><div class="page-content" id="page-content"></div></main></div>`;
  if (isAdminRole) {
    document.querySelector("#subCommitteeNav .nav-dropdown-menu").innerHTML =
      db.subCommittees
        .map(
          (c) =>
            `<a href="subcommittee-collections.html?committee=${c.id}"><i class="bi ${c.icon || "bi-mic"}"></i>${escapeHTML(c.name)}</a>`,
        )
        .join("");
  }
}
function toggleSidebar() {
  document.getElementById("sidebar")?.classList.toggle("open");
  document.getElementById("sidebarOverlay")?.classList.toggle("open");
}
function closeSidebar() {
  document.getElementById("sidebar")?.classList.remove("open");
  document.getElementById("sidebarOverlay")?.classList.remove("open");
}
function markActive() {
  const page = location.pathname.split("/").pop() || "dashboard.html";
  const fullPage = page + location.search;
  document.querySelectorAll(".sidebar a").forEach((a) => {
    const href = a.getAttribute("href") || "";
    const inDropdownMenu = a.closest(".nav-dropdown-menu") !== null;
    const isMatch = inDropdownMenu
      ? href === fullPage
      : href.split("?")[0] === page;
    a.classList.toggle("active", isMatch);
  });
  const current = document.querySelector(".nav-dropdown-menu a.active");
  if (current) {
    current.closest(".nav-dropdown")?.classList.add("open");
  }
}
function logout() {
  clearSession();
  location.href = "index.html";
}
function pageTitle(title, sub = "", button = "") {
  return `<div class="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4"><div class="page-title"><h1>${title}</h1></div>${button}</div>`;
}
