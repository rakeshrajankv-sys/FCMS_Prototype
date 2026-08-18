/* ===================================================================
   FCMS UI Kit — shared, framework-free utilities loaded on every page:
   - i18n (English / Malayalam) with a persisted language switch
   - Toast notifications (replaces alert())
   - Glass-styled confirm dialog (replaces confirm())
   - Dark mode toggle (persisted)
   Safe to load before data.js/layout.js — has no dependency on them.
   =================================================================== */

/* ---------- i18n ---------- */
const FCMS_I18N = {
  en: {
    app_name: "Fund Collection",
    app_full_name: "Fund Collection Management System",
    main_committee: "Main Committee",
    sub_committee: "Sub Committee",
    pradeshikam: "Pradeshikam",
    nav_main: "Main",
    nav_system: "System",
    dashboard: "Dashboard",
    activity_history: "Activity History",
    reports: "Reports",
    donations: "Donations",
    members: "Members",
    collections: "Collections",
    submissions: "Submissions",
    pradeshikams: "Pradeshikams",
    sub_committees: "Sub Committees",
    sub_committee_expenses: "Sub Committee Expenses",
    sub_committee_allocation: "Sub Committee Allocation",
    collection: "Collection",
    submission: "Submission",
    expense: "Expense",
    logout: "Logout",
    reset_prototype_data: "Reset Prototype Data",
    add_member: "Add Member",
    add_collection: "Add Collection",
    add_expense: "Add Expense",
    add_donation: "Add Donation",
    quick_actions: "Quick Actions",
    total_collected: "Total Collected",
    submitted_to_office: "Submitted to Office",
    remaining_to_submit: "Remaining to Submit",
    received_from_office: "Received from Office",
    total_expenses: "Total Expenses",
    remaining_after_expense: "Remaining After Expense",
    collection_progress: "Collection Progress",
    recent_collections: "Recent Collections",
    view_all: "View all",
    find_member: "Find Member",
    save: "Save",
    cancel: "Cancel",
    edit: "Edit",
    delete: "Delete",
    confirm: "Confirm",
    are_you_sure: "Are you sure?",
    this_cannot_be_undone: "This action cannot be undone.",
    dark_mode: "Dark Mode",
    language: "Language",
  },
  ml: {
    app_name: "ഫണ്ട് കളക്ഷൻ",
    app_full_name: "ഫണ്ട് കളക്ഷൻ മാനേജ്‌മെന്റ് സിസ്റ്റം",
    main_committee: "മെയിൻ കമ്മിറ്റി",
    sub_committee: "സബ് കമ്മിറ്റി",
    pradeshikam: "പ്രദേശികം",
    nav_main: "പ്രധാനം",
    nav_system: "സിസ്റ്റം",
    dashboard: "ഡാഷ്ബോർഡ്",
    activity_history: "പ്രവർത്തന ചരിത്രം",
    reports: "റിപ്പോർട്ടുകൾ",
    donations: "സംഭാവനകൾ",
    members: "അംഗങ്ങൾ",
    collections: "പിരിവുകൾ",
    submissions: "സമർപ്പണങ്ങൾ",
    pradeshikams: "പ്രദേശികങ്ങൾ",
    sub_committees: "സബ് കമ്മിറ്റികൾ",
    sub_committee_expenses: "സബ് കമ്മിറ്റി ചെലവുകൾ",
    sub_committee_allocation: "സബ് കമ്മിറ്റി വിഹിതം",
    collection: "പിരിവ്",
    submission: "സമർപ്പണം",
    expense: "ചെലവ്",
    logout: "ലോഗ്ഔട്ട്",
    reset_prototype_data: "പ്രോട്ടോടൈപ്പ് ഡാറ്റ റീസെറ്റ് ചെയ്യുക",
    add_member: "അംഗത്തെ ചേർക്കുക",
    add_collection: "പിരിവ് ചേർക്കുക",
    add_expense: "ചെലവ് ചേർക്കുക",
    add_donation: "സംഭാവന ചേർക്കുക",
    quick_actions: "പെട്ടെന്നുള്ള നടപടികൾ",
    total_collected: "ആകെ പിരിച്ചത്",
    submitted_to_office: "ഓഫീസിൽ സമർപ്പിച്ചത്",
    remaining_to_submit: "സമർപ്പിക്കാൻ ബാക്കിയുള്ളത്",
    received_from_office: "ഓഫീസിൽ നിന്ന് ലഭിച്ചത്",
    total_expenses: "ആകെ ചെലവ്",
    remaining_after_expense: "ചെലവിന് ശേഷം ബാക്കി",
    collection_progress: "പിരിവ് പുരോഗതി",
    recent_collections: "സമീപകാല പിരിവുകൾ",
    view_all: "എല്ലാം കാണുക",
    find_member: "അംഗത്തെ കണ്ടെത്തുക",
    save: "സേവ് ചെയ്യുക",
    cancel: "റദ്ദാക്കുക",
    edit: "തിരുത്തുക",
    delete: "ഇല്ലാതാക്കുക",
    confirm: "സ്ഥിരീകരിക്കുക",
    are_you_sure: "നിങ്ങൾക്ക് ഉറപ്പാണോ?",
    this_cannot_be_undone: "ഈ പ്രവർത്തനം പഴയപടിയാക്കാൻ കഴിയില്ല.",
    dark_mode: "ഡാർക്ക് മോഡ്",
    language: "ഭാഷ",
  },
};
function fcmsLang() {
  return localStorage.getItem("fcms_lang") || "en";
}
function t(key) {
  const lang = fcmsLang();
  return (FCMS_I18N[lang] && FCMS_I18N[lang][key]) || FCMS_I18N.en[key] || key;
}
function setFcmsLang(lang) {
  localStorage.setItem("fcms_lang", lang);
  document.documentElement.setAttribute("lang", lang === "ml" ? "ml" : "en");
  applyFcmsTranslations();
}
function applyFcmsTranslations() {
  document.querySelectorAll("[data-i18n]").forEach((el) => {
    el.textContent = t(el.getAttribute("data-i18n"));
  });
  document.querySelectorAll("[data-i18n-placeholder]").forEach((el) => {
    el.setAttribute("placeholder", t(el.getAttribute("data-i18n-placeholder")));
  });
}
function toggleFcmsLang() {
  const next = fcmsLang() === "ml" ? "en" : "ml";
  document.documentElement.classList.add("fcms-lang-fade");
  setTimeout(() => {
    localStorage.setItem("fcms_lang", next);
    location.reload();
  }, 160);
}

/* ---------- Dark mode ---------- */
function fcmsTheme() {
  return localStorage.getItem("fcms_theme") || "light";
}
function setFcmsTheme(theme) {
  localStorage.setItem("fcms_theme", theme);
  document.documentElement.setAttribute("data-theme", theme);
}
function toggleFcmsTheme() {
  setFcmsTheme(fcmsTheme() === "dark" ? "light" : "dark");
}
(function initFcmsTheme() {
  document.documentElement.setAttribute("data-theme", fcmsTheme());
  document.documentElement.setAttribute(
    "lang",
    fcmsLang() === "ml" ? "ml" : "en",
  );
})();

/* ---------- Toast notifications ---------- */
function fcmsToastHost() {
  let host = document.getElementById("fcmsToastHost");
  if (!host) {
    host = document.createElement("div");
    host.id = "fcmsToastHost";
    host.className = "fcms-toast-host";
    document.body.appendChild(host);
  }
  return host;
}
function toast(message, type = "success", duration = 3200) {
  const host = fcmsToastHost();
  const icons = {
    success: "bi-check-circle-fill",
    error: "bi-x-circle-fill",
    info: "bi-info-circle-fill",
    warning: "bi-exclamation-triangle-fill",
  };
  const el = document.createElement("div");
  el.className = `fcms-toast fcms-toast-${type}`;
  el.innerHTML = `<i class="bi ${icons[type] || icons.info}"></i><span>${String(
    message,
  ).replace(/</g, "&lt;")}</span>`;
  host.appendChild(el);
  requestAnimationFrame(() => el.classList.add("show"));
  setTimeout(() => {
    el.classList.remove("show");
    setTimeout(() => el.remove(), 250);
  }, duration);
}

/* ---------- Confirm dialog (Promise-based, glass-styled) ---------- */
function confirmDialog(message, opts = {}) {
  return new Promise((resolve) => {
    const overlay = document.createElement("div");
    overlay.className = "fcms-modal-overlay";
    overlay.innerHTML = `
      <div class="fcms-modal" role="dialog" aria-modal="true">
        <div class="fcms-modal-icon"><i class="bi bi-exclamation-triangle-fill"></i></div>
        <div class="fcms-modal-title">${opts.title ? String(opts.title).replace(/</g, "&lt;") : t("are_you_sure")}</div>
        <div class="fcms-modal-body">${String(message).replace(/</g, "&lt;")}</div>
        <div class="fcms-modal-actions">
          <button type="button" class="btn btn-light" id="fcmsModalCancel">${t("cancel")}</button>
          <button type="button" class="btn btn-danger" id="fcmsModalConfirm">${opts.confirmLabel || t("delete")}</button>
        </div>
      </div>`;
    document.body.appendChild(overlay);
    requestAnimationFrame(() => overlay.classList.add("show"));
    function close(result) {
      overlay.classList.remove("show");
      setTimeout(() => overlay.remove(), 200);
      resolve(result);
    }
    overlay
      .querySelector("#fcmsModalConfirm")
      .addEventListener("click", () => close(true));
    overlay
      .querySelector("#fcmsModalCancel")
      .addEventListener("click", () => close(false));
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) close(false);
    });
    document.addEventListener(
      "keydown",
      function esc(e) {
        if (e.key === "Escape") {
          document.removeEventListener("keydown", esc);
          close(false);
        }
      },
      { once: true },
    );
  });
}
