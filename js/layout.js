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
  <div class="sidebar-brand"><img src="logo.png?v=20260821logo2" alt="Logo"><span>${t("app_name")}</span></div>
  <div class="px-3 small sidebar-role">${escapeHTML(isAdminRole ? t("main_committee") : session.name)}</div>
  <nav class="sidebar-nav">
    <div class="nav-section">${t("nav_main")}</div>
    <a href="dashboard.html"><i class="bi bi-grid-1x2"></i>${t("dashboard")}</a>
    ${isAdminRole ? `<a href="activity-history.html"><i class="bi bi-clock-history"></i>${t("activity_history")}</a>` : ""}
    <a href="reports.html"><i class="bi bi-bar-chart"></i>${t("reports")}</a>
    ${!isSub ? `<a href="donations.html"><i class="bi bi-gift"></i>${t("donations")}</a>` : ""}
    ${
      !isSub
        ? `<div class="nav-dropdown ${pradeshikamNavPages.includes(currentPage) ? "open" : ""}">
      <button type="button" class="nav-dropdown-toggle" onclick="this.parentElement.classList.toggle('open')"><span><i class="bi bi-diagram-3"></i>${t("pradeshikam")}</span><i class="bi bi-chevron-down nav-chevron"></i></button>
      <div class="nav-dropdown-menu">
        <a href="members.html"><i class="bi bi-people"></i>${t("members")}</a>
        <a href="payments.html"><i class="bi bi-receipt"></i>${t("collections")}</a>
        <a href="submissions.html"><i class="bi bi-bank"></i>${t("submissions")}</a>
        ${isAdminRole ? `<a href="pradeshikams.html"><i class="bi bi-diagram-3"></i>${t("pradeshikams")}</a>` : ""}
      </div>
    </div>`
        : ""
    }
    ${
      isAdminRole
        ? `<div class="nav-dropdown ${subCommitteePages.includes(currentPage) ? "open" : ""}" id="subCommitteeNav">
      <button type="button" class="nav-dropdown-toggle" onclick="this.parentElement.classList.toggle('open')"><span><i class="bi bi-people"></i>${t("sub_committees")}</span><i class="bi bi-chevron-down nav-chevron"></i></button>
      <div class="nav-dropdown-menu"></div>
    </div>
    <a href="subcommittee-expense.html"><i class="bi bi-receipt-cutoff"></i>${t("sub_committee_expenses")}</a>
    <a href="subcommittee-allocation.html"><i class="bi bi-cash-stack"></i>${t("sub_committee_allocation")}</a>`
        : ""
    }
    ${
      isSub
        ? `<a href="subcommittee-collections.html"><i class="bi ${myCommittee?.icon || "bi-cash-coin"}"></i>${t("collection")}</a>
    <a href="subcommittee-submissions.html"><i class="bi bi-bank"></i>${t("submission")}</a>
    <a href="subcommittee-expense.html"><i class="bi bi-receipt-cutoff"></i>${t("expense")}</a>
    ${myCommittee?.financeAccess ? `<a href="members.html"><i class="bi bi-people"></i>${t("members")}</a><a href="add-member.html"><i class="bi bi-person-plus"></i>${t("add_member")}</a>` : ""}`
        : ""
    }
    <div class="nav-section">${t("nav_system")}</div>
    <a href="#" onclick="logout();return false"><i class="bi bi-box-arrow-right"></i>${t("logout")}</a>
  </nav>
  ${isAdminRole ? `<div class="sidebar-footer"><button class="btn btn-sm btn-outline-light w-100" onclick="resetPrototype()">${t("reset_prototype_data")}</button></div>` : ""}
</aside>
<div class="sidebar-overlay" id="sidebarOverlay" onclick="closeSidebar()"></div>
<main class="main"><header class="topbar"><button class="btn btn-light mobile-menu" onclick="toggleSidebar()"><i class="bi bi-list"></i></button><div class="d-none d-md-block small text-muted">${t("app_full_name")}</div><div class="topbar-tools"><button type="button" class="topbar-tool lang-tool" onclick="toggleFcmsLang()" title="${t("language")}" aria-label="${t("language")}"><i class="bi bi-translate"></i><span>${fcmsLang() === "ml" ? "ML" : "EN"}</span></button><button type="button" class="topbar-tool theme-tool" id="themeToggleBtn" title="${t("dark_mode")}" aria-label="${t("dark_mode")}"><i class="bi ${fcmsTheme() === "dark" ? "bi-sun" : "bi-moon-stars"}"></i></button></div><div class="user-pill"><div class="text-end d-none d-sm-block"><div class="fw-semibold small">${escapeHTML(session.name)}</div><div class="text-muted" style="font-size:11px">${isAdminRole ? t("main_committee") : isSub ? t("sub_committee") : t("pradeshikam")}</div></div><div class="avatar">${escapeHTML(session.name.charAt(0))}</div></div></header><div class="page-content" id="page-content"></div></main></div>`;
  document.getElementById("themeToggleBtn").addEventListener("click", () => {
    toggleFcmsTheme();
    document.querySelector("#themeToggleBtn i").className =
      "bi " + (fcmsTheme() === "dark" ? "bi-sun" : "bi-moon-stars");
  });
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
async function logout() {
  const confirmed = await confirmDialog(
    t("logout_confirm_message"),
    {
      title: t("logout_confirm_title"),
      confirmLabel: t("logout_confirm_button"),
      cancelLabel: t("cancel"),
    },
  );
  if (!confirmed) return;
  clearSession();
  document.body.classList.add("fcms-page-exit");
  const reducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
  window.setTimeout(() => { location.href = "index.html"; }, reducedMotion ? 0 : (window.innerWidth <= 900 ? 400 : 500));
}

// Smooth visual transition for normal in-app navigation. This only delays navigation;
// it does not replace, alter, or remove any existing link/function behavior.
document.addEventListener("click", (event) => {
  const link = event.target.closest?.("a[href]");
  if (!link || event.defaultPrevented || link.target === "_blank" || link.hasAttribute("download")) return;
  const href = link.getAttribute("href");
  if (!href || href.startsWith("#") || href.startsWith("javascript:") || link.hasAttribute("data-no-transition")) return;
  let url;
  try { url = new URL(href, location.href); } catch (_) { return; }
  if (url.origin !== location.origin || url.pathname === location.pathname && url.search === location.search) return;
  event.preventDefault();
  document.body.classList.add("fcms-page-exit");
  const reducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
  window.setTimeout(() => { location.href = url.href; }, reducedMotion ? 0 : (window.innerWidth <= 900 ? 400 : 500));
}, true);
function pageTitle(title, sub = "", button = "") {
  return `<div class="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4"><div class="page-title"><h1>${title}</h1></div>${button}</div>`;
}
