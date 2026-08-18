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
  return localStorage.getItem("fcms_lang") || "ml";
}
function t(key) {
  const lang = fcmsLang();
  return (FCMS_I18N[lang] && FCMS_I18N[lang][key]) || FCMS_I18N.en[key] || key;
}
function setFcmsLang(lang) {
  localStorage.setItem("fcms_lang", lang);
  document.documentElement.setAttribute("lang", lang === "ml" ? "ml" : "en");
  applyFcmsTranslations();
  initFcmsMalayalamObserver();
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


/* ---------- Malayalam UI coverage for dynamically rendered pages ---------- */
const FCMS_ML_TEXT = {
  "Fund Collection": "ഫണ്ട് കളക്ഷൻ", "Fund Collection Management System": "ഫണ്ട് കളക്ഷൻ മാനേജ്‌മെന്റ് സിസ്റ്റം",
  "Main Committee": "മെയിൻ കമ്മിറ്റി", "Sub Committee": "സബ് കമ്മിറ്റി", "Sub Committees": "സബ് കമ്മിറ്റികൾ",
  "Dashboard": "ഡാഷ്ബോർഡ്", "Activity History": "പ്രവർത്തന ചരിത്രം", "Reports": "റിപ്പോർട്ടുകൾ", "Donations": "സംഭാവനകൾ",
  "Members": "അംഗങ്ങൾ", "Collections": "പിരിവുകൾ", "Submissions": "സമർപ്പണങ്ങൾ", "Pradeshikam": "പ്രദേശികം", "Pradeshikams": "പ്രദേശികങ്ങൾ",
  "Expense": "ചെലവ്", "Expenses": "ചെലവുകൾ", "Sub Committee Expenses": "സബ് കമ്മിറ്റി ചെലവുകൾ", "Sub Committee Allocation": "സബ് കമ്മിറ്റി വിഹിതം",
  "Collection": "പിരിവ്", "Submission": "സമർപ്പണം", "Allocation": "വിഹിതം", "Logout": "ലോഗ്ഔട്ട്", "Main": "പ്രധാനം", "System": "സിസ്റ്റം",
  "Add Member": "അംഗത്തെ ചേർക്കുക", "Add Collection": "പിരിവ് ചേർക്കുക", "Add Expense": "ചെലവ് ചേർക്കുക", "Add Donation": "സംഭാവന ചേർക്കുക",
  "Add Payment": "പേയ്മെന്റ് ചേർക്കുക", "Additional Payment": "അധിക പേയ്മെന്റ്", "Save": "സേവ് ചെയ്യുക", "Save Changes": "മാറ്റങ്ങൾ സേവ് ചെയ്യുക",
  "Cancel": "റദ്ദാക്കുക", "Edit": "തിരുത്തുക", "Delete": "ഇല്ലാതാക്കുക", "Confirm": "സ്ഥിരീകരിക്കുക", "Export": "എക്സ്പോർട്ട്",
  "CSV": "CSV", "Excel / CSV": "Excel / CSV", "Search": "തിരയുക", "Summary": "സംഗ്രഹം", "Actions": "നടപടികൾ", "Date": "തീയതി",
  "Amount": "തുക", "Amount *": "തുക *", "Amount Received": "ലഭിച്ച തുക", "Description": "വിവരണം", "Remarks": "കുറിപ്പുകൾ",
  "Source": "ഉറവിടം", "Source *": "ഉറവിടം *", "Name": "പേര്", "Donor": "ദാതാവ്", "Donor Name *": "ദാതാവിന്റെ പേര് *",
  "Place": "സ്ഥലം", "Phone Number": "ഫോൺ നമ്പർ", "Country code": "രാജ്യ കോഡ്", "Receipt Number": "രസീത് നമ്പർ", "Receipt Number *": "രസീത് നമ്പർ *",
  "Payment Mode": "പേയ്മെന്റ് രീതി", "Payment Mode *": "പേയ്മെന്റ് രീതി *", "Cash": "കാഷ്", "UPI": "UPI", "Bank": "ബാങ്ക്", "Cheque": "ചെക്ക്",
  "Status": "നില", "Completed": "പൂർത്തിയായി", "Hold": "താൽക്കാലികമായി നിർത്തിയത്", "All statuses": "എല്ലാ നിലകളും", "All Pradeshikams": "എല്ലാ പ്രദേശികങ്ങളും",
  "Total Collected": "ആകെ പിരിച്ചത്", "Collected by Pradeshikam": "പ്രദേശികം പിരിച്ചത്", "Donations": "സംഭാവനകൾ", "Total Received": "ആകെ ലഭിച്ചത്",
  "Submitted": "സമർപ്പിച്ചത്", "Submitted to Office": "ഓഫീസിൽ സമർപ്പിച്ചത്", "Remaining": "ബാക്കി", "Remaining Balance": "ബാക്കി തുക",
  "Remaining to Submit": "സമർപ്പിക്കാൻ ബാക്കി", "Received from Office": "ഓഫീസിൽ നിന്ന് ലഭിച്ചത്", "Total Spent": "ആകെ ചെലവായത്", "Spent": "ചെലവായത്",
  "Remaining After Expense": "ചെലവിന് ശേഷം ബാക്കി", "Total Expenses": "ആകെ ചെലവുകൾ", "Collection Progress": "പിരിവ് പുരോഗതി",
  "Recent Collections": "സമീപകാല പിരിവുകൾ", "View all": "എല്ലാം കാണുക", "Find Member": "അംഗത്തെ കണ്ടെത്തുക", "Quick Actions": "പെട്ടെന്നുള്ള നടപടികൾ",
  "Expense History": "ചെലവ് ചരിത്രം", "Expense Records": "ചെലവ് രേഖകൾ", "Submission History": "സമർപ്പണ ചരിത്രം", "New Submission": "പുതിയ സമർപ്പണം",
  "New Allocation": "പുതിയ വിഹിതം", "Office Allocation": "ഓഫീസ് വിഹിതം", "Given to Sub Committee": "സബ് കമ്മിറ്റിക്ക് നൽകിയ തുക",
  "Given by Office": "ഓഫീസ് നൽകിയ തുക", "Review Hold Payments": "താൽക്കാലിക പേയ്മെന്റുകൾ പരിശോധിക്കുക",
  "No collections found.": "പിരിവുകൾ ഒന്നും കണ്ടെത്തിയില്ല.", "No collections recorded yet.": "ഇതുവരെ പിരിവുകൾ രേഖപ്പെടുത്തിയിട്ടില്ല.",
  "No submissions recorded yet.": "ഇതുവരെ സമർപ്പണങ്ങൾ രേഖപ്പെടുത്തിയിട്ടില്ല.", "No expenses recorded yet.": "ഇതുവരെ ചെലവുകൾ രേഖപ്പെടുത്തിയിട്ടില്ല.",
  "No expenses recorded.": "ചെലവുകൾ രേഖപ്പെടുത്തിയിട്ടില്ല.", "No transactions recorded yet.": "ഇതുവരെ ഇടപാടുകൾ രേഖപ്പെടുത്തിയിട്ടില്ല.", "No records.": "രേഖകളില്ല.",
  "Please fill in all required fields.": "ആവശ്യമായ എല്ലാ വിവരങ്ങളും പൂരിപ്പിക്കുക.", "Enter a valid amount.": "ശരിയായ തുക നൽകുക.",
  "That receipt number is already in use.": "ഈ രസീത് നമ്പർ ഇതിനകം ഉപയോഗിച്ചിട്ടുണ്ട്.", "This receipt number is already in use.": "ഈ രസീത് നമ്പർ ഇതിനകം ഉപയോഗിച്ചിട്ടുണ്ട്.",
  "Please select a member and fill in all required fields.": "ഒരു അംഗത്തെ തിരഞ്ഞെടുത്ത് ആവശ്യമായ വിവരങ്ങൾ പൂരിപ്പിക്കുക.",
  "Enter an amount to submit.": "സമർപ്പിക്കേണ്ട തുക നൽകുക.", "Select a submission date.": "സമർപ്പണ തീയതി തിരഞ്ഞെടുക്കുക.",
  "Edit Collection": "പിരിവ് തിരുത്തുക", "Edit Submission": "സമർപ്പണം തിരുത്തുക", "Edit Expense": "ചെലവ് തിരുത്തുക", "Edit Donation": "സംഭാവന തിരുത്തുക",
  "Save Collection": "പിരിവ് സേവ് ചെയ്യുക", "Save Expense": "ചെലവ് സേവ് ചെയ്യുക", "Save Payment": "പേയ്മെന്റ് സേവ് ചെയ്യുക",
  "What was this spent on?": "എന്തിനാണ് ഈ തുക ചെലവാക്കിയത്?", "Bill (optional)": "ബിൽ (ഐച്ഛികം)", "Upload Bill": "ബിൽ അപ്‌ലോഡ് ചെയ്യുക",
  "Member": "അംഗം", "Person": "വ്യക്തി", "Shop": "കട", "Organization": "സ്ഥാപനം", "Other": "മറ്റുള്ളവ",
  "Search name, place, receipt": "പേര്, സ്ഥലം, രസീത് എന്നിവ തിരയുക", "Search receipt, member or phone": "രസീത്, അംഗം അല്ലെങ്കിൽ ഫോൺ തിരയുക",
  "Search name, phone or house number": "പേര്, ഫോൺ അല്ലെങ്കിൽ വീട്ടുനമ്പർ തിരയുക", "No matching member": "പൊരുത്തപ്പെടുന്ന അംഗമില്ല",
  "Change": "മാറ്റുക", "Member Status": "അംഗത്തിന്റെ നില", "Total Members": "ആകെ അംഗങ്ങൾ", "Members": "അംഗങ്ങൾ",
  "Collected by Sub Committee": "സബ് കമ്മിറ്റി പിരിച്ചത്", "Total Balance with Committee": "കമ്മിറ്റിയിലുള്ള ആകെ ബാക്കി",
  "Office Amount Remaining After Expenses": "ചെലവുകൾക്ക് ശേഷം ഓഫീസിന്റെ ബാക്കി തുക",
  "Amount Received from Main Office": "മെയിൻ ഓഫീസിൽ നിന്ന് ലഭിച്ച തുക", "Submitted to Main Committee": "മെയിൻ കമ്മിറ്റിക്ക് സമർപ്പിച്ചത്",
  "Who collected this?": "ഇത് ആര് പിരിച്ചു?", "Report": "റിപ്പോർട്ട്", "Members": "അംഗങ്ങൾ", "Collections": "പിരിവുകൾ", "Sub Committee Collections": "സബ് കമ്മിറ്റി പിരിവുകൾ", "Sub Committee Expenses": "സബ് കമ്മിറ്റി ചെലവുകൾ", "Sub Committee Overview": "സബ് കമ്മിറ്റികളുടെ സംഗ്രഹം",
  "Total Collected": "ആകെ പിരിച്ചത്", "Collected": "പിരിച്ചത്", "Received": "ലഭിച്ചത്", "Balance": "ബാക്കി",
  "Are you sure?": "നിങ്ങൾക്ക് ഉറപ്പാണോ?", "This action cannot be undone.": "ഈ പ്രവർത്തനം പഴയപടിയാക്കാൻ കഴിയില്ല.",
  "Invalid username or password.": "യൂസർനെയിമോ പാസ്‌വേഡോ തെറ്റാണ്.", "Language": "ഭാഷ", "Dark Mode": "ഡാർക്ക് മോഡ്"
};
function fcmsTranslateValue(value) {
  let out = String(value ?? "");
  Object.keys(FCMS_ML_TEXT).sort((a,b)=>b.length-a.length).forEach((en)=>{
    out = out.split(en).join(FCMS_ML_TEXT[en]);
  });
  return out;
}
function applyFcmsMalayalamToDom(root=document.body) {
  if (fcmsLang() !== "ml" || !root) return;
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  const nodes=[]; let n;
  while ((n=walker.nextNode())) nodes.push(n);
  nodes.forEach((node)=>{
    if (!node.nodeValue.trim() || node.parentElement?.closest("script,style")) return;
    const translated=fcmsTranslateValue(node.nodeValue);
    if (translated!==node.nodeValue) node.nodeValue=translated;
  });
  root.querySelectorAll("[placeholder],[title],[aria-label]").forEach((el)=>{
    ["placeholder","title","aria-label"].forEach((a)=>{
      if (el.hasAttribute(a)) el.setAttribute(a,fcmsTranslateValue(el.getAttribute(a)));
    });
  });
}
function initFcmsMalayalamObserver() {
  if (fcmsLang() !== "ml" || window.__fcmsMlObserver) return;
  window.__fcmsMlObserver = new MutationObserver((mutations)=>{
    mutations.forEach((m)=>m.addedNodes.forEach((node)=>{
      if (node.nodeType===1) applyFcmsMalayalamToDom(node);
      else if (node.nodeType===3 && node.parentElement) {
        const v=fcmsTranslateValue(node.nodeValue); if(v!==node.nodeValue) node.nodeValue=v;
      }
    }));
  });
  window.__fcmsMlObserver.observe(document.body,{childList:true,subtree:true});
  applyFcmsMalayalamToDom(document.body);
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
  if (localStorage.getItem("fcms_lang_version") !== "ml-v2") {
    localStorage.setItem("fcms_lang", "ml");
    localStorage.setItem("fcms_lang_version", "ml-v2");
  }
  document.documentElement.setAttribute("data-theme", fcmsTheme());
  document.documentElement.setAttribute(
    "lang",
    fcmsLang() === "ml" ? "ml" : "en",
  );
})();
document.addEventListener("DOMContentLoaded", () => initFcmsMalayalamObserver());

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
