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
    logout_confirm_title: "Confirm Logout",
    logout_confirm_message: "Are you sure you want to log out?",
    logout_confirm_button: "Logout",
    name_english_only: "Name must be entered in English only.",
    welcome_back: "Welcome back",
    sign_in_continue: "Sign in to continue",
    enter_username: "Enter username",
    enter_password: "Enter password",
    login: "Login",
    voucher_receipt_required: "Voucher / Receipt is required before saving this allocation.",
    receipt_bill_required: "Receipt / Bill is required before saving this expense.",
    allocation_exceeds_office_balance: "Allocation cannot exceed the Main Office available balance of {amount}.",
    allocation_below_existing_expenses: "This allocation cannot be reduced below the committee's existing expenses of {amount}.",
    expense_exceeds_available_balance: "Expense cannot exceed the committee's available allocated balance of {amount}.",
    no_allocated_funds_expense: "This Sub Committee has no allocated funds, so an expense cannot be recorded.",
    allocation_delete_blocked: "This allocation cannot be deleted because {amount} has already been spent by this Sub Committee.",
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
    logout_confirm_title: "ലോഗ്ഔട്ട് സ്ഥിരീകരിക്കുക",
    logout_confirm_message: "നിങ്ങൾക്ക് ലോഗ്ഔട്ട് ചെയ്യണമെന്ന് ഉറപ്പാണോ?",
    logout_confirm_button: "ലോഗ്ഔട്ട്",
    name_english_only: "പേര് ഇംഗ്ലീഷിൽ മാത്രം നൽകുക.",
    welcome_back: "തിരികെ സ്വാഗതം",
    sign_in_continue: "തുടരാൻ ലോഗിൻ ചെയ്യുക",
    enter_username: "യൂസർനെയിം നൽകുക",
    enter_password: "പാസ്‌വേഡ് നൽകുക",
    login: "ലോഗിൻ",
    voucher_receipt_required: "വൗച്ചർ / രസീത് അപ്‌ലോഡ് ചെയ്യാതെ വിഹിതം സേവ് ചെയ്യാൻ കഴിയില്ല.",
    receipt_bill_required: "രസീത് / ബിൽ അപ്‌ലോഡ് ചെയ്യാതെ ചെലവ് സേവ് ചെയ്യാൻ കഴിയില്ല.",
    allocation_exceeds_office_balance: "വിഹിതം മെയിൻ ഓഫീസിന്റെ ലഭ്യമായ ബാക്കി തുകയായ {amount} കവിയാൻ കഴിയില്ല.",
    allocation_below_existing_expenses: "ഈ വിഹിതം കമ്മിറ്റി ഇതിനകം ചെലവാക്കിയ {amount}-ൽ താഴെയാക്കാൻ കഴിയില്ല.",
    expense_exceeds_available_balance: "ചെലവ് കമ്മിറ്റിക്ക് ലഭ്യമായ വിഹിത ബാക്കി തുകയായ {amount} കവിയാൻ കഴിയില്ല.",
    no_allocated_funds_expense: "ഈ സബ് കമ്മിറ്റിക്ക് വിഹിതം അനുവദിച്ചിട്ടില്ല. അതിനാൽ ചെലവ് രേഖപ്പെടുത്താൻ കഴിയില്ല.",
    allocation_delete_blocked: "ഈ വിഹിതം ഇല്ലാതാക്കാൻ കഴിയില്ല. ഈ സബ് കമ്മിറ്റി ഇതിനകം {amount} ചെലവഴിച്ചിട്ടുണ്ട്.",
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
  if (document.title) document.title = fcmsTranslateValue(document.title);
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



/* ---------- Prevent submitted forms from returning via browser Back ---------- */
(function () {
  function skipStaleSavedFormOnBack() {
    try {
      const nav = performance.getEntriesByType("navigation")[0];
      if (!nav || nav.type !== "back_forward") return;
      const raw = sessionStorage.getItem("fcms_last_saved_page");
      if (!raw) return;
      const saved = JSON.parse(raw);
      const current = location.pathname + location.search;
      if (saved?.path !== current || Date.now() - Number(saved.at || 0) > 120000) {
        if (Date.now() - Number(saved?.at || 0) > 120000) sessionStorage.removeItem("fcms_last_saved_page");
        return;
      }
      sessionStorage.removeItem("fcms_last_saved_page");
      history.go(-1);
    } catch (_) {}
  }
  window.addEventListener("pageshow", skipStaleSavedFormOnBack);
})();

/* ---------- Malayalam UI coverage for dynamically rendered pages ---------- */
const FCMS_ML_TEXT = {
  // User-provided Pradeshikam names
  "All Pradeshikams": "എല്ലാ പ്രദേശങ്ങളും",
  "Selected": "തിരഞ്ഞെടുത്തത്",
  "Choose Image": "ചിത്രം തിരഞ്ഞെടുക്കുക",
  "No image selected": "ചിത്രം തിരഞ്ഞെടുത്തിട്ടില്ല",
  "Receipt / bill attached to this expense": "ഈ ചെലവിനോടൊപ്പം രസീത് / ബിൽ ചേർത്തിട്ടുണ്ട്",
  "Voucher / receipt attached to this allocation": "ഈ വിഹിതത്തിനോടൊപ്പം വൗച്ചർ / രസീത് ചേർത്തിട്ടുണ്ട്",
  "Search name, phone or house number": "പേര്, ഫോൺ നമ്പർ അല്ലെങ്കിൽ വീട് നമ്പർ തിരയുക",
  "Search name, place, receipt": "പേര്, സ്ഥലം അല്ലെങ്കിൽ രസീത് തിരയുക",
  "Search receipt, member or phone": "രസീത്, അംഗം അല്ലെങ്കിൽ ഫോൺ തിരയുക",
  "Search donor, house, receipt or Pradeshikam": "ദാതാവ്, വീട്, രസീത് അല്ലെങ്കിൽ പ്രദേശികം തിരയുക",
  "Search member, receipt or action": "അംഗം, രസീത് അല്ലെങ്കിൽ പ്രവർത്തനം തിരയുക",
  "Search donor, house, receipt": "ദാതാവ്, വീട് അല്ലെങ്കിൽ രസീത് തിരയുക",
  "Search name, phone, house number or member ID": "പേര്, ഫോൺ നമ്പർ, വീട് നമ്പർ അല്ലെങ്കിൽ അംഗ ഐഡി തിരയുക",
  "Take Photo": "ഫോട്ടോ എടുക്കുക",
  "Choose File": "ഫയൽ തിരഞ്ഞെടുക്കുക",
  "Upload": "അപ്‌ലോഡ് ചെയ്യുക",
  "Upload Bill": "ബിൽ അപ്‌ലോഡ് ചെയ്യുക",
  "Upload Voucher / Receipt": "വൗച്ചർ / രസീത് അപ്‌ലോഡ് ചെയ്യുക",
  "View / Download Receipt / Bill": "രസീത് / ബിൽ കാണുക / ഡൗൺലോഡ് ചെയ്യുക",
  "View voucher": "വൗച്ചർ കാണുക",
  "Starting camera…": "ക്യാമറ ആരംഭിക്കുന്നു…",
  "Camera is not available in this browser. Use Choose File instead.": "ഈ ബ്രൗസറിൽ ക്യാമറ ലഭ്യമല്ല. പകരം ഫയൽ തിരഞ്ഞെടുക്കുക.",
  "Position the receipt inside the frame.": "രസീത് ഫ്രെയിമിനുള്ളിൽ ശരിയായി വയ്ക്കുക.",
  "Camera access was blocked. Allow camera permission or use Choose File instead.": "ക്യാമറ ആക്സസ് തടഞ്ഞിരിക്കുന്നു. ക്യാമറ അനുമതി നൽകുക അല്ലെങ്കിൽ പകരം ഫയൽ തിരഞ്ഞെടുക്കുക.",
  "Please choose an image (JPG, PNG, or WebP).": "ദയവായി ഒരു ചിത്രം തിരഞ്ഞെടുക്കുക (JPG, PNG, അല്ലെങ്കിൽ WebP).",
  "Image must be under 8MB.": "ചിത്രത്തിന്റെ വലുപ്പം 8MB-ൽ താഴെയായിരിക്കണം.",
  "Could not read that image. Please try again.": "ആ ചിത്രം വായിക്കാൻ കഴിഞ്ഞില്ല. ദയവായി വീണ്ടും ശ്രമിക്കുക.",
  "Sub Committee / ഉപസമിതി": "ഉപസമിതി",
  "Member / അംഗം": "അംഗം",
  "Place / സ്ഥലം": "സ്ഥലം",
  "Amount / തുക": "തുക",
  "Source / ഉറവിടം": "ഉറവിടം",
  "Payment Mode / പേയ്മെന്റ് രീതി": "പേയ്മെന്റ് രീതി",
  "Status / നില": "നില",
  "Phone Number / ഫോൺ നമ്പർ": "ഫോൺ നമ്പർ",
  "Receipt Number / രസീത് നമ്പർ": "രസീത് നമ്പർ",
  "Remarks / അഭിപ്രായങ്ങൾ": "അഭിപ്രായങ്ങൾ",
  "Description / വിവരണം": "വിവരണം",
  "Purpose / ഉദ്ദേശ്യം": "ഉദ്ദേശ്യം",
  "Collected By / ശേഖരിച്ചത്": "ശേഖരിച്ചത്",
  "Date / തീയതി": "തീയതി",
  "Source / ഉറവിടം *": "ഉറവിടം *",
  "Ambangad": "അമ്പങ്ങാട്",
  "Bara/Mukkunnoth": "ബാര / മുക്കുന്നോത്ത്",
  "Bedakam": "ബേഡകം",
  "Chalingal": "ചാലിങ്കാൽ",
  "Chemmanad": "ചെമ്മനാട്",
  "Kalanad": "കളനാട്",
  "kuttikkol": "കുട്ടിക്കോൽ",
  "Kolathur/Maruthadukkam": "കോളത്തൂർ / മരുതടുക്കം",
  "Kaniyamabdi": "കണിയാമ്പാടി",
  "Melbara": "മേൽബാര",
  "Poinachi": "പൊയിനാച്ചി",
  "pakkam": "പക്കം",
  "Periya": "പെരിയ",
  "Poochakkad": "പൂച്ചക്കാട്",
  "Thokkanam/karuvakod": "തോക്കാനം / കരുവാക്കോട്",
  "Thiravakoli": "തിറവക്കോലി",
  "Udma": "ഉദുമ",
  "chendalam": "ചെണ്ടയാട് / ചെന്തളം",
  "Souvenir Committee": "സ്മരണിക കമ്മിറ്റി",
  "Publicity Committee": "പ്രചാരണ കമ്മിറ്റി",
  "Audio Video Committee": "ഓഡിയോ വീഡിയോ കമ്മിറ്റി",
  "Finance Committee": "ഫിനാൻസ് കമ്മിറ്റി",
  "Program Committee": "പ്രോഗ്രാം കമ്മിറ്റി",

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
  "Status": "നില", "Completed": "പൂർത്തിയായി", "Hold": "താൽക്കാലികമായി നിർത്തിയത്", "All statuses": "എല്ലാ നിലകളും",
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
  "Invalid username or password.": "യൂസർനെയിമോ പാസ്‌വേഡോ തെറ്റാണ്.", "Language": "ഭാഷ", "Dark Mode": "ഡാർക്ക് മോഡ്",
  "Confirm Logout / ലോഗ്ഔട്ട് സ്ഥിരീകരിക്കുക": "ലോഗ്ഔട്ട് സ്ഥിരീകരിക്കുക",
  "Are you sure you want to log out? / നിങ്ങൾക്ക് ലോഗ്ഔട്ട് ചെയ്യണമെന്ന് ഉറപ്പാണോ?": "നിങ്ങൾക്ക് ലോഗ്ഔട്ട് ചെയ്യണമെന്ന് ഉറപ്പാണോ?",
  "Logout / ലോഗ്ഔട്ട്": "ലോഗ്ഔട്ട്",
  "Collectable? / പിരിവ് വേണോ?": "പിരിവ് വേണോ?",
  "Yes / വേണം": "വേണം",
  "No / വേണ്ട": "വേണ്ട",
  "For members 21+ / 21 വയസും അതിൽ കൂടുതലുമുള്ളവർക്ക് മാത്രം": "21 വയസും അതിൽ കൂടുതലുമുള്ളവർക്ക് മാത്രം",
  "Select Pradeshikam": "പ്രദേശികം തിരഞ്ഞെടുക്കുക",
  "Select": "തിരഞ്ഞെടുക്കുക",
  "All sources": "എല്ലാ ഉറവിടങ്ങളും",
  "All actions": "എല്ലാ പ്രവർത്തനങ്ങളും",
  "All users": "എല്ലാ ഉപയോക്താക്കളും",
  "All payment modes": "എല്ലാ പേയ്മെന്റ് രീതികളും",
  "All statuses": "എല്ലാ നിലകളും",
  "Date & Time": "തീയതിയും സമയവും",
  "Performed By": "നടത്തിയത്",
  "Details": "വിശദാംശങ്ങൾ",
  "Search member, receipt or action": "അംഗം, രസീത് അല്ലെങ്കിൽ പ്രവർത്തനം തിരയുക",
  "Search donor, house, receipt or Pradeshikam": "ദാതാവ്, വീട്, രസീത് അല്ലെങ്കിൽ പ്രദേശം തിരയുക",
  "Search receipt, member or phone": "രസീത്, അംഗം അല്ലെങ്കിൽ ഫോൺ തിരയുക",
  "Search name, phone or house number": "പേര്, ഫോൺ അല്ലെങ്കിൽ വീട്ടുനമ്പർ തിരയുക",
  "10-digit number": "10 അക്ക നമ്പർ",
  "Member Information": "അംഗ വിവരങ്ങൾ",
  "Current Status": "നിലവിലെ സ്ഥിതി",
  "Required Amount": "ആവശ്യമായ തുക",
  "Member Status": "അംഗത്തിന്റെ നില",
  "Payment Summary": "പേയ്മെന്റ് സംഗ്രഹം",
  "Required": "ആവശ്യമായത്",
  "Payment": "പേയ്മെന്റ്",
  "Total received": "ആകെ ലഭിച്ചത്",
  "No activity recorded yet.": "ഇതുവരെ പ്രവർത്തനങ്ങളൊന്നും രേഖപ്പെടുത്തിയിട്ടില്ല.",
  "No matching member": "പൊരുത്തപ്പെടുന്ന അംഗമില്ല",
  "Male": "പുരുഷൻ",
  "Female": "സ്ത്രീ",
  "Single": "അവിവാഹിതൻ / അവിവാഹിത",
  "Married": "വിവാഹിതൻ / വിവാഹിത",
  "Widower": "വിധവൻ / വിധവ",
  "House Number": "വീട്ടുനമ്പർ",
  "Phone": "ഫോൺ",
  "Gender": "ലിംഗം",
  "Age": "പ്രായം",
  "Marital Status": "വൈവാഹിക നില",
  "Member Receipt": "അംഗത്തിന്റെ രസീത്",
  "Save Changes": "മാറ്റങ്ങൾ സേവ് ചെയ്യുക",
  "Back": "തിരികെ",
  "Close": "അടയ്ക്കുക",
  "Yes": "വേണം",
  "No": "വേണ്ട",

  // Complete UI coverage for pages that render labels/messages dynamically.
  "The page you are looking for may have moved or does not exist.": "നിങ്ങൾ അന്വേഷിക്കുന്ന പേജ് മാറ്റിയിരിക്കാം അല്ലെങ്കിൽ നിലവിലില്ല.",
  "Fund Collection Management System": "ഫണ്ട് കളക്ഷൻ മാനേജ്‌മെന്റ് സിസ്റ്റം",
  "Welcome back": "തിരികെ സ്വാഗതം",
  "Sign in to continue": "തുടരാൻ ലോഗിൻ ചെയ്യുക",
  "Switch to bright mode": "ബ്രൈറ്റ് മോഡിലേക്ക് മാറ്റുക",
  "Switch to dark mode": "ഡാർക്ക് മോഡിലേക്ക് മാറ്റുക",
  "Bright mode": "ബ്രൈറ്റ് മോഡ്",
  "Dark mode": "ഡാർക്ക് മോഡ്",
  "Dark": "ഡാർക്ക്",
  "Bright": "ബ്രൈറ്റ്",
  "Appearance controls": "രൂപഭാവ നിയന്ത്രണങ്ങൾ",
  "Toggle dark mode": "ഡാർക്ക് മോഡ് മാറ്റുക",
  "Login": "ലോഗിൻ",
  "Username": "ഉപയോക്തൃനാമം",
  "Password": "പാസ്‌വേഡ്",
  "Invalid username or password.": "യൂസർനെയിമോ പാസ്‌വേഡോ തെറ്റാണ്.",

  "Sub Committee Allocation": "സബ് കമ്മിറ്റി വിഹിതം",
  "Funds given from the office to each sub committee.": "ഓഫീസിൽ നിന്ന് ഓരോ സബ് കമ്മിറ്റിക്കും നൽകിയ തുക.",
  "Who collected this?": "ഇത് ആര് പിരിച്ചു?",
  "New Allocation": "പുതിയ വിഹിതം",
  "Allocation History": "വിഹിത ചരിത്രം",
  "Save Allocation": "വിഹിതം സേവ് ചെയ്യുക",
  "Edit Allocation": "വിഹിതം തിരുത്തുക",
  "Delete this allocation?": "ഈ വിഹിതം ഇല്ലാതാക്കണോ?",
  "Allocation deleted.": "വിഹിതം ഇല്ലാതാക്കി.",
  "Regular Allocation": "സാധാരണ വിഹിതം",
  "View voucher": "വൗച്ചർ കാണുക",
  "Please enter the purpose for the Other allocation.": "മറ്റുള്ളവ തിരഞ്ഞെടുത്താൽ ഉദ്ദേശ്യം നൽകണം.",
  "Sub Committee Allocation Edited": "സബ് കമ്മിറ്റി വിഹിതം തിരുത്തി",
  "Sub Committee Allocation Added": "സബ് കമ്മിറ്റി വിഹിതം ചേർത്തു",
  "Allocation to ": "ഇവർക്കുള്ള വിഹിതം: ",
  " allocated to ": " എന്നതിന് വിഹിതമായി നൽകി ",

  "Record and manage expenses by committee": "കമ്മിറ്റി അടിസ്ഥാനത്തിൽ ചെലവുകൾ രേഖപ്പെടുത്തി നിയന്ത്രിക്കുക",
  "Total Expenses": "ആകെ ചെലവുകൾ",
  "Sub Committee Expenses": "സബ് കമ്മിറ്റി ചെലവുകൾ",
  "Other Expenses": "മറ്റുള്ള ചെലവുകൾ",
  "All Expense Records": "എല്ലാ ചെലവ് രേഖകളും",
  "What was the expense for?": "ഈ ചെലവ് എന്തിനായിരുന്നു?",
  "What was this spent on?": "ഈ തുക എന്തിനാണ് ചെലവാക്കിയത്?",
  "Delete this expense?": "ഈ ചെലവ് ഇല്ലാതാക്കണോ?",
  "Expense exceeds the Main Office available balance of ": "ചെലവ് മെയിൻ ഓഫീസിന്റെ ലഭ്യമായ ബാക്കി തുകയായ ",
  "Main Expense Edited": "മെയിൻ കമ്മിറ്റി ചെലവ് തിരുത്തി",
  "Main Expense Added": "മെയിൻ കമ്മിറ്റി ചെലവ് ചേർത്തു",
  "Main Expense Deleted": "മെയിൻ കമ്മിറ്റി ചെലവ് ഇല്ലാതാക്കി",
  "Sub Committee Expense Edited": "സബ് കമ്മിറ്റി ചെലവ് തിരുത്തി",
  "Sub Committee Expense Added": "സബ് കമ്മിറ്റി ചെലവ് ചേർത്തു",
  "Sub Committee Expense Deleted": "സബ് കമ്മിറ്റി ചെലവ് ഇല്ലാതാക്കി",
  "Expense deleted.": "ചെലവ് ഇല്ലാതാക്കി.",
  "Please enter the purpose for the Other expense.": "മറ്റുള്ളവ തിരഞ്ഞെടുത്താൽ ഉദ്ദേശ്യം നൽകണം.",
  "Add Expense": "ചെലവ് ചേർക്കുക",
  "Edit Expense": "ചെലവ് തിരുത്തുക",
  "Save Expense": "ചെലവ് സേവ് ചെയ്യുക",

  "Sub Committee Dashboard": "സബ് കമ്മിറ്റി ഡാഷ്ബോർഡ്",
  "Dashboard": "ഡാഷ്ബോർഡ്",
  "Amount Received from Main Office": "മെയിൻ ഓഫീസിൽ നിന്ന് ലഭിച്ച തുക",
  "Collected by Committee": "കമ്മിറ്റി പിരിച്ചത്",
  "Submitted to Main Committee": "മെയിൻ കമ്മിറ്റിക്ക് സമർപ്പിച്ചത്",
  "Office Amount Remaining After Expenses": "ചെലവുകൾക്ക് ശേഷം ഓഫീസിന്റെ ബാക്കി തുക",
  "Total Balance with Committee": "കമ്മിറ്റിയിലുള്ള ആകെ ബാക്കി",
  "Given to Sub Committee": "സബ് കമ്മിറ്റിക്ക് നൽകിയ തുക",

  "Sub Committee Collections": "സബ് കമ്മിറ്റി പിരിവുകൾ",
  "Sub Committee Overview": "സബ് കമ്മിറ്റികളുടെ സംഗ്രഹം",
  "Select a member to enter a collection.": "പിരിവ് രേഖപ്പെടുത്താൻ ഒരു അംഗത്തെ തിരഞ്ഞെടുക്കുക.",
  "Select a member below to continue to the collection form.": "പിരിവ് ഫോമിലേക്ക് തുടരാൻ താഴെയുള്ള അംഗത്തെ തിരഞ്ഞെടുക്കുക.",
  "Collection deleted.": "പിരിവ് ഇല്ലാതാക്കി.",
  "Collection Deleted": "പിരിവ് ഇല്ലാതാക്കി",
  "Collection Edited": "പിരിവ് തിരുത്തി",
  "Collection Added": "പിരിവ് ചേർത്തു",
  "Sub Committee Collection Edited": "സബ് കമ്മിറ്റി പിരിവ് തിരുത്തി",
  "Sub committee collection details edited.": "സബ് കമ്മിറ്റി പിരിവിന്റെ വിവരങ്ങൾ തിരുത്തി.",

  "Submission History": "സമർപ്പണ ചരിത്രം",
  "New Submission": "പുതിയ സമർപ്പണം",
  "Edit Submission": "സമർപ്പണം തിരുത്തുക",
  "Save Submission": "സമർപ്പണം സേവ് ചെയ്യുക",
  "Delete this submission": "ഈ സമർപ്പണം ഇല്ലാതാക്കുക",
  "Submission Added": "സമർപ്പണം ചേർത്തു",
  "Submission Deleted": "സമർപ്പണം ഇല്ലാതാക്കി",
  "Submission Edited": "സമർപ്പണം തിരുത്തി",
  "Submission deleted.": "സമർപ്പണം ഇല്ലാതാക്കി.",
  "Sub Committee Submission Added": "സബ് കമ്മിറ്റി സമർപ്പണം ചേർത്തു",
  "Sub Committee Submission Deleted": "സബ് കമ്മിറ്റി സമർപ്പണം ഇല്ലാതാക്കി",
  "Amount cannot exceed remaining balance of ": "തുക ബാക്കി തുകയായ ",
  "Pradeshikam amount cannot exceed ": "പ്രദേശികത്തിന്റെ തുക കവിയാൻ കഴിയില്ല: ",
  "Donation amount cannot exceed ": "സംഭാവന തുക കവിയാൻ കഴിയില്ല: ",
  "One or both amounts exceed the remaining amount.": "ഒന്നോ രണ്ടോ തുകകൾ ബാക്കി തുകയെ കവിയുന്നു.",
  "The amounts must match the selected type.": "തിരഞ്ഞെടുത്ത തരത്തിനനുസരിച്ച് തുകകൾ പൊരുത്തപ്പെടണം.",
  "Enter an amount to submit.": "സമർപ്പിക്കേണ്ട തുക നൽകുക.",
  "Enter a valid submission amount.": "ശരിയായ സമർപ്പണ തുക നൽകുക.",
  "Select a submission date.": "സമർപ്പണ തീയതി തിരഞ്ഞെടുക്കുക.",
  "Submitted to Main Committee.": "മെയിൻ കമ്മിറ്റിക്ക് സമർപ്പിച്ചു.",

  "Sub Committee": "സബ് കമ്മിറ്റി",
  "Sub Committee Submissions": "സബ് കമ്മിറ്റി സമർപ്പണങ്ങൾ",
  "Recorded By": "രേഖപ്പെടുത്തിയത്",
  "Report": "റിപ്പോർട്ട്",
  "Audit trail of member and payment changes across all Pradeshikams.": "എല്ലാ പ്രദേശികങ്ങളിലെയും അംഗ, പേയ്മെന്റ് മാറ്റങ്ങളുടെ ഓഡിറ്റ് ചരിത്രം.",
  "All actions": "എല്ലാ പ്രവർത്തനങ്ങളും",
  "All users": "എല്ലാ ഉപയോക്താക്കളും",
  "Date & Time": "തീയതിയും സമയവും",
  "Performed By": "നടത്തിയത്",
  "Details": "വിശദാംശങ്ങൾ",
  "Search member, receipt or action": "അംഗം, രസീത് അല്ലെങ്കിൽ പ്രവർത്തനം തിരയുക",
  "No activity recorded yet.": "ഇതുവരെ പ്രവർത്തനങ്ങളൊന്നും രേഖപ്പെടുത്തിയിട്ടില്ല.",
  "No data to export.": "എക്സ്പോർട്ട് ചെയ്യാൻ ഡാറ്റയില്ല.",

  "Every installment is stored as a separate receipt.": "ഓരോ തവണയും പ്രത്യേകം രസീതായി സൂക്ഷിക്കുന്നു.",
  "Additional Payment": "അധിക പേയ്മെന്റ്",
  "Original Receipt": "യഥാർത്ഥ രസീത്",
  "Initial Amount": "ആദ്യ തുക",
  "Total Received": "ആകെ ലഭിച്ചത്",
  "Payment Added": "പേയ്മെന്റ് ചേർത്തു",
  "Payment Added (Hold)": "പേയ്മെന്റ് ചേർത്തു (ഹോൾഡ്)",
  "Payment Confirmed": "പേയ്മെന്റ് സ്ഥിരീകരിച്ചു",
  "Payment Edited": "പേയ്മെന്റ് തിരുത്തി",
  "Payment Deleted": "പേയ്മെന്റ് ഇല്ലാതാക്കി",
  "Payment deleted.": "പേയ്മെന്റ് ഇല്ലാതാക്കി.",
  "Receipt deleted": "രസീത് ഇല്ലാതാക്കി",
  "Delete receipt ": "രസീത് ഇല്ലാതാക്കുക: ",
  "Receipt ": "രസീത് ",
  "payment confirmed": "പേയ്മെന്റ് സ്ഥിരീകരിച്ചു",
  "edited": "തിരുത്തി",
  "Payment edited by Main Committee.": "മെയിൻ കമ്മിറ്റി പേയ്മെന്റ് തിരുത്തി.",
  "Payment deleted by Main Committee.": "മെയിൻ കമ്മിറ്റി പേയ്മെന്റ് ഇല്ലാതാക്കി.",
  "Held payment confirmed as received by Main Committee.": "ഹോൾഡ് പേയ്മെന്റ് മെയിൻ കമ്മിറ്റി ലഭിച്ചതായി സ്ഥിരീകരിച്ചു.",
  "Held donation confirmed as received by Main Committee.": "ഹോൾഡ് സംഭാവന മെയിൻ കമ്മിറ്റി ലഭിച്ചതായി സ്ഥിരീകരിച്ചു.",
  "Donation Confirmed": "സംഭാവന സ്ഥിരീകരിച്ചു",
  "Donation Edited": "സംഭാവന തിരുത്തി",
  "Donation Added": "സംഭാവന ചേർത്തു",
  "Donation Added (Hold)": "സംഭാവന ചേർത്തു (ഹോൾഡ്)",
  "Donation deleted": "സംഭാവന ഇല്ലാതാക്കി",
  "Delete donation receipt ": "സംഭാവന രസീത് ഇല്ലാതാക്കുക: ",

  "Please fill in all required fields.": "ആവശ്യമായ എല്ലാ വിവരങ്ങളും പൂരിപ്പിക്കുക.",
  "Please select a member and fill in all required fields.": "ഒരു അംഗത്തെ തിരഞ്ഞെടുത്ത് ആവശ്യമായ വിവരങ്ങൾ പൂരിപ്പിക്കുക.",
  "Select a member from the search results.": "തിരയൽ ഫലങ്ങളിൽ നിന്ന് ഒരു അംഗത്തെ തിരഞ്ഞെടുക്കുക.",
  "Select a Pradeshikam.": "ഒരു പ്രദേശികം തിരഞ്ഞെടുക്കുക.",
  "Enter a valid amount.": "ശരിയായ തുക നൽകുക.",
  "Enter a valid amount received.": "ലഭിച്ച ശരിയായ തുക നൽകുക.",
  "Enter a valid donation amount.": "ശരിയായ സംഭാവന തുക നൽകുക.",
  "Enter a valid payment amount.": "ശരിയായ പേയ്മെന്റ് തുക നൽകുക.",
  "Enter a valid submission amount.": "ശരിയായ സമർപ്പണ തുക നൽകുക.",
  "That receipt number is already in use.": "ഈ രസീത് നമ്പർ ഇതിനകം ഉപയോഗിച്ചിട്ടുണ്ട്.",
  "This receipt number is already in use.": "ഈ രസീത് നമ്പർ ഇതിനകം ഉപയോഗിച്ചിട്ടുണ്ട്.",
  "This receipt number has already been used.": "ഈ രസീത് നമ്പർ ഇതിനകം ഉപയോഗിച്ചിട്ടുണ്ട്.",
  "Receipt number is mandatory.": "രസീത് നമ്പർ നിർബന്ധമാണ്.",
  "Enter a receipt number for every member.": "ഓരോ അംഗത്തിനും രസീത് നമ്പർ നൽകണം.",
  "Receipt numbers must be unique.": "രസീത് നമ്പറുകൾ വ്യത്യസ്തമായിരിക്കണം.",
  "One or more receipt numbers are already in use.": "ഒന്നോ അതിലധികമോ രസീത് നമ്പറുകൾ ഇതിനകം ഉപയോഗത്തിലാണ്.",
  "Age must be between 1 and 100.": "പ്രായം 1 മുതൽ 100 വരെ ആയിരിക്കണം.",
  "Another member already uses this phone number and house number.": "ഈ ഫോൺ നമ്പറും വീട്ടുനമ്പറും മറ്റൊരു അംഗം ഇതിനകം ഉപയോഗിക്കുന്നു.",
  "Required amount cannot be below the current paid total of ": "ആവശ്യമായ തുക നിലവിൽ ലഭിച്ച ആകെ തുകയായ ",
  "This member already has ": "ഈ അംഗത്തിന് ഇതിനകം ",
  " collected. They cannot be marked as not collectable.": " ലഭിച്ചിട്ടുണ്ട്. അതിനാൽ പിരിവ് വേണ്ടെന്ന് അടയാളപ്പെടുത്താൻ കഴിയില്ല.",
  "Name must be entered in English only.": "പേര് ഇംഗ്ലീഷിൽ മാത്രം നൽകുക.",

  "Search name, phone, house number or member ID": "പേര്, ഫോൺ, വീട്ടുനമ്പർ അല്ലെങ്കിൽ അംഗ ഐഡി തിരയുക",
  "All genders": "എല്ലാ ലിംഗങ്ങളും",
  "All statuses": "എല്ലാ നിലകളും",
  "Required": "ആവശ്യമായത്",
  "Balance": "ബാക്കി",
  "Progress": "പുരോഗതി",
  "Current Status": "നിലവിലെ സ്ഥിതി",
  "Member Information": "അംഗ വിവരങ്ങൾ",
  "Payment Summary": "പേയ്മെന്റ് സംഗ്രഹം",
  "Member Receipt": "അംഗത്തിന്റെ രസീത്",
  "House Number": "വീട്ടുനമ്പർ",
  "Phone": "ഫോൺ",
  "Gender": "ലിംഗം",
  "Age": "പ്രായം",
  "Marital Status": "വൈവാഹിക നില",
  "Male": "പുരുഷൻ",
  "Female": "സ്ത്രീ",
  "Single": "അവിവാഹിതൻ / അവിവാഹിത",
  "Married": "വിവാഹിതൻ / വിവാഹിത",
  "Widower": "വിധവൻ / വിധവ",
  "View members": "അംഗങ്ങളെ കാണുക",
  "View donations": "സംഭാവനകൾ കാണുക",
  "View collections": "പിരിവുകൾ കാണുക",
  "Household": "കുടുംബം",
  "member": "അംഗം",
  "members": "അംഗങ്ങൾ",
  "in this house": "ഈ വീട്ടിൽ",
  "Required": "ആവശ്യമായത്",

  "Starting camera…": "ക്യാമറ ആരംഭിക്കുന്നു…",
  "Camera is not available in this browser. Use Choose File instead.": "ഈ ബ്രൗസറിൽ ക്യാമറ ലഭ്യമല്ല. പകരം ഫയൽ തിരഞ്ഞെടുക്കുക.",
  "Position the receipt inside the frame.": "രസീത് ഫ്രെയിമിനുള്ളിൽ വയ്ക്കുക.",
  "Camera access was blocked. Allow camera permission or use Choose File instead.": "ക്യാമറ അനുമതി തടഞ്ഞിരിക്കുന്നു. ക്യാമറ അനുമതി നൽകുക അല്ലെങ്കിൽ ഫയൽ തിരഞ്ഞെടുക്കുക.",
  "Please choose an image (JPG, PNG, or WebP).": "ഒരു ചിത്രം തിരഞ്ഞെടുക്കുക (JPG, PNG, അല്ലെങ്കിൽ WebP).",
  "Image must be under 8MB.": "ചിത്രത്തിന്റെ വലുപ്പം 8MB-ൽ താഴെയായിരിക്കണം.",
  "Could not read that image. Please try again.": "ആ ചിത്രം വായിക്കാൻ കഴിഞ്ഞില്ല. വീണ്ടും ശ്രമിക്കുക.",
  "Choose File": "ഫയൽ തിരഞ്ഞെടുക്കുക",
  "Take Photo": "ഫോട്ടോ എടുക്കുക",
  "Upload": "അപ്‌ലോഡ് ചെയ്യുക",
  "Upload Bill": "ബിൽ അപ്‌ലോഡ് ചെയ്യുക",
  "Upload Voucher / Receipt": "വൗച്ചർ / രസീത് അപ്‌ലോഡ് ചെയ്യുക",
  "View / Download Receipt / Bill": "രസീത് / ബിൽ കാണുക / ഡൗൺലോഡ് ചെയ്യുക",

  "Search donor, house, receipt or Pradeshikam": "ദാതാവ്, വീട്, രസീത് അല്ലെങ്കിൽ പ്രദേശികം തിരയുക",
  "Search name, phone or house number": "പേര്, ഫോൺ അല്ലെങ്കിൽ വീട്ടുനമ്പർ തിരയുക",
  "Search receipt, member or phone": "രസീത്, അംഗം അല്ലെങ്കിൽ ഫോൺ തിരയുക",
  "Search name, place, receipt": "പേര്, സ്ഥലം, രസീത് എന്നിവ തിരയുക",
  "No matching member": "പൊരുത്തപ്പെടുന്ന അംഗമില്ല",
  "No collections found.": "പിരിവുകൾ ഒന്നും കണ്ടെത്തിയില്ല.",
  "No collections recorded yet.": "ഇതുവരെ പിരിവുകൾ രേഖപ്പെടുത്തിയിട്ടില്ല.",
  "No submissions recorded yet.": "ഇതുവരെ സമർപ്പണങ്ങൾ രേഖപ്പെടുത്തിയിട്ടില്ല.",
  "No expenses recorded yet.": "ഇതുവരെ ചെലവുകൾ രേഖപ്പെടുത്തിയിട്ടില്ല.",
  "No expenses recorded.": "ചെലവുകൾ രേഖപ്പെടുത്തിയിട്ടില്ല.",
  "No transactions recorded yet.": "ഇതുവരെ ഇടപാടുകൾ രേഖപ്പെടുത്തിയിട്ടില്ല.",
  "No records.": "രേഖകളില്ല.",

  "Select": "തിരഞ്ഞെടുക്കുക",
  "Other": "മറ്റുള്ളവ",
  "Cash": "കാഷ്",
  "Bank": "ബാങ്ക്",
  "Cheque": "ചെക്ക്",
  "Completed": "പൂർത്തിയായി",
  "Hold": "താൽക്കാലികമായി നിർത്തിയത്",
  "Hold (payment not yet received)": "ഹോൾഡ് (പേയ്മെന്റ് ഇതുവരെ ലഭിച്ചിട്ടില്ല)",
  "Payment Mode": "പേയ്മെന്റ് രീതി",
  "Payment Mode *": "പേയ്മെന്റ് രീതി *",
  "Source": "ഉറവിടം",
  "Place": "സ്ഥലം",
  "Phone Number": "ഫോൺ നമ്പർ",
  "Country code": "രാജ്യ കോഡ്",
  "Receipt Number": "രസീത് നമ്പർ",
  "Receipt Number *": "രസീത് നമ്പർ *",
  "Remarks": "കുറിപ്പുകൾ",
  "Description": "വിവരണം",
  "Purpose": "ഉദ്ദേശ്യം",
  "Collected By": "ശേഖരിച്ചത്",
  "Collected by Pradeshikam": "പ്രദേശികം പിരിച്ചത്",
  "Collected by Sub Committee": "സബ് കമ്മിറ്റി പിരിച്ചത്",
  "Given by Office": "ഓഫീസ് നൽകിയ തുക",
  "Given to Sub Committee": "സബ് കമ്മിറ്റിക്ക് നൽകിയ തുക",
  "Amount": "തുക",
  "Amount *": "തുക *",
  "Amount Received": "ലഭിച്ച തുക",
  "Date": "തീയതി",
  "Date / തീയതി *": "തീയതി *",
  "Source *": "ഉറവിടം *",
  "Donor": "ദാതാവ്",
  "Donor Name *": "ദാതാവിന്റെ പേര് *",
  "Payment": "പേയ്മെന്റ്",
  "Status": "നില",
  "Actions": "നടപടികൾ",
  "CSV": "CSV",
  "Excel / CSV": "Excel / CSV",
  "Export": "എക്സ്പോർട്ട്",
  "Search": "തിരയുക",
  "Summary": "സംഗ്രഹം",
  "Back": "തിരികെ",
  "Close": "അടയ്ക്കുക",
  "Cancel": "റദ്ദാക്കുക",
  "Confirm": "സ്ഥിരീകരിക്കുക",
  "Save": "സേവ് ചെയ്യുക",
  "Save Changes": "മാറ്റങ്ങൾ സേവ് ചെയ്യുക",
  "Edit": "തിരുത്തുക",
  "Delete": "ഇല്ലാതാക്കുക",
  "Add Member": "അംഗത്തെ ചേർക്കുക",
  "Add Collection": "പിരിവ് ചേർക്കുക",
  "Add Donation": "സംഭാവന ചേർക്കുക",
  "Add Payment": "പേയ്മെന്റ് ചേർക്കുക",
  "View all": "എല്ലാം കാണുക",
  "Quick Actions": "പെട്ടെന്നുള്ള നടപടികൾ",
  "Total Members": "ആകെ അംഗങ്ങൾ",
  "Total Collected": "ആകെ പിരിച്ചത്",
  "Received from Donations": "സംഭാവനകളിൽ നിന്ന് ലഭിച്ചത്",
  "Submitted to Office": "ഓഫീസിൽ സമർപ്പിച്ചത്",
  "Remaining Balance": "ബാക്കി തുക",
  "Remaining to Submit": "സമർപ്പിക്കാൻ ബാക്കി",
  "Received from Office": "ഓഫീസിൽ നിന്ന് ലഭിച്ചത്",
  "Total Spent": "ആകെ ചെലവായത്",
  "Spent": "ചെലവായത്",
  "Collection Progress": "പിരിവ് പുരോഗതി",
  "Recent Collections": "സമീപകാല പിരിവുകൾ",
  "Expense History": "ചെലവ് ചരിത്രം",
  "Expense Records": "ചെലവ് രേഖകൾ",
  "Office Allocation": "ഓഫീസ് വിഹിതം",
  "Given to Sub Committee": "സബ് കമ്മിറ്റിക്ക് നൽകിയ തുക",
  "Review Hold Payments": "ഹോൾഡ് പേയ്മെന്റുകൾ പരിശോധിക്കുക",
  "Bill (optional)": "ബിൽ (ഐച്ഛികം)",
  "Upload Bill": "ബിൽ അപ്‌ലോഡ് ചെയ്യുക",

  "Member Added": "അംഗത്തെ ചേർത്തു",
  "Member Edited": "അംഗത്തെ തിരുത്തി",
  "Member Deleted": "അംഗത്തെ ഇല്ലാതാക്കി",
  "Member information updated by Main Committee.": "അംഗ വിവരങ്ങൾ മെയിൻ കമ്മിറ്റി അപ്‌ഡേറ്റ് ചെയ്തു.",
  "Member information updated.": "അംഗ വിവരങ്ങൾ അപ്‌ഡേറ്റ് ചെയ്തു.",
  "Delete this member?": "ഈ അംഗത്തെ ഇല്ലാതാക്കണോ?",
  "This action cannot be undone.": "ഈ പ്രവർത്തനം പഴയപടിയാക്കാൻ കഴിയില്ല.",
  "Are you sure?": "നിങ്ങൾക്ക് ഉറപ്പാണോ?",

  "Payment deleted by Main Committee.": "മെയിൻ കമ്മിറ്റി പേയ്മെന്റ് ഇല്ലാതാക്കി.",
  "Donation details edited by Main Committee.": "മെയിൻ കമ്മിറ്റി സംഭാവന വിവരങ്ങൾ തിരുത്തി.",
  "Held donation confirmed as received by Main Committee.": "ഹോൾഡ് സംഭാവന മെയിൻ കമ്മിറ്റി ലഭിച്ചതായി സ്ഥിരീകരിച്ചു.",
  "Sub Committee Expense": "സബ് കമ്മിറ്റി ചെലവ്",
  "Sub Committee Reports": "സബ് കമ്മിറ്റി റിപ്പോർട്ടുകൾ",
  "Sub Committee Collections": "സബ് കമ്മിറ്റി പിരിവുകൾ",
  "Sub Committee Submissions": "സബ് കമ്മിറ്റി സമർപ്പണങ്ങൾ",
  "Edit Collection": "പിരിവ് തിരുത്തുക",
  "Edit Payment": "പേയ്മെന്റ് തിരുത്തുക",
  "Edit Donation": "സംഭാവന തിരുത്തുക",
  "Save Collection": "പിരിവ് സേവ് ചെയ്യുക",
  "Save Payment": "പേയ്മെന്റ് സേവ് ചെയ്യുക",

  "Household ": "കുടുംബം ",
  ". Receipt reserved with ₹0 recorded.": ". ₹0 ആയി രസീത് റിസർവ് ചെയ്തു.",
  "Marked Hold — receipt issued, payment to be collected and confirmed later.": "ഹോൾഡ് ആയി അടയാളപ്പെടുത്തി — രസീത് നൽകി, പേയ്മെന്റ് പിന്നീട് പിരിച്ച് സ്ഥിരീകരിക്കണം.",
  "No data to export.": "എക്സ്പോർട്ട് ചെയ്യാൻ ഡാറ്റയില്ല.",
  "Pradeshikam Collection": "പ്രദേശികം പിരിവ്",
  "Other Allocation": "മറ്റുള്ള വിഹിതം",
  "Other Expense": "മറ്റുള്ള ചെലവ്"
};
function fcmsTranslateValue(value) {
  let out = String(value ?? "");

  // Dynamic messages: translate the stable English sentence structure while
  // preserving names, receipt numbers, committee names and amounts.
  const dynamic = [
    [/^Additional payment (.+) deleted$/i, "അധിക പേയ്മെന്റ് $1 ഇല്ലാതാക്കി"],
    [/^Additional payment (.+) edited$/i, "അധിക പേയ്മെന്റ് $1 തിരുത്തി"],
    [/^Donation (.+) confirmed$/i, "സംഭാവന $1 സ്ഥിരീകരിച്ചു"],
    [/^Donation (.+) edited$/i, "സംഭാവന $1 തിരുത്തി"],
    [/^Donation (.+) deleted$/i, "സംഭാവന $1 ഇല്ലാതാക്കി"],
    [/^Donation (.+) payment confirmed$/i, "സംഭാവന $1 പേയ്മെന്റ് സ്ഥിരീകരിച്ചു"],
    [/^Submission of (.+) deleted\.?$/i, " $1 എന്ന സമർപ്പണം ഇല്ലാതാക്കി."],
    [/^Allocation to (.+) edited$/i, "$1 എന്നതിനുള്ള വിഹിതം തിരുത്തി"],
    [/^(.+): collection (.+) deleted$/i, "$1: പിരിവ് $2 ഇല്ലാതാക്കി"],
    [/^(.+): expense of (.+) deleted$/i, "$1: $2 തുകയുടെ ചെലവ് ഇല്ലാതാക്കി"],
    [/^(.+): expense (.+) deleted$/i, "$1: ചെലവ് $2 ഇല്ലാതാക്കി"],
    [/^(.+): (.+) expense edited$/i, "$1: $2 ചെലവ് തിരുത്തി"],
    [/^(.+) submitted (.+)$/i, "$1 $2 സമർപ്പിച്ചു"],
    [/^(.+): (.+) collected from (.+)$/i, "$1: $2 തുക $3-ൽ നിന്ന് പിരിച്ചു"],
    [/^(.+) added to house (.+)$/i, "$1 എന്ന അംഗത്തെ വീട് $2-ലേക്ക് ചേർത്തു"],
    [/^(.+) edited$/i, "$1 തിരുത്തി"],
    [/^(.+) deleted\.?$/i, "$1 ഇല്ലാതാക്കി."],
    [/^Receipt (.+) deleted$/i, "രസീത് $1 ഇല്ലാതാക്കി"],
    [/^Receipt (.+) added$/i, "രസീത് $1 ചേർത്തു"],
    [/^Receipt (.+) payment confirmed$/i, "രസീത് $1 പേയ്മെന്റ് സ്ഥിരീകരിച്ചു"],
    [/^Receipt (.+) edited$/i, "രസീത് $1 തിരുത്തി"],
    [/^(.+) donation recorded$/i, "$1 സംഭാവന രേഖപ്പെടുത്തി"],
    [/^(.+) via (.+)\.$/i, "$1 വഴി $2."],
    [/^(.+) with receipt (.+)\.$/i, "$1 എന്നതിനുള്ള രസീത് $2."],
    [/^Household (.+)\. Receipt (.+)\.(.*)$/i, "കുടുംബം $1. രസീത് $2.$3"],
    [/^Receipt (.+) held for (.+)$/i, "രസീത് $1 $2-നായി ഹോൾഡ് ചെയ്തു"],
    [/^Amount exceeds the remaining balance of (.+)\.$/i, "തുക ബാക്കി തുകയായ $1 കവിയുന്നു."],
    [/^Pradeshikam amount cannot exceed (.+)\.$/i, "പ്രദേശികത്തിന്റെ തുക $1 കവിയാൻ കഴിയില്ല."],
    [/^Donation amount cannot exceed (.+)\.$/i, "സംഭാവന തുക $1 കവിയാൻ കഴിയില്ല."],
    [/^Amount cannot exceed remaining balance of (.+)\.$/i, "തുക ബാക്കി തുകയായ $1 കവിയാൻ കഴിയില്ല."],
    [/^Allocation cannot exceed the Main Office available balance of (.+)\.$/i, "വിഹിതം മെയിൻ ഓഫീസിന്റെ ലഭ്യമായ ബാക്കി തുകയായ $1 കവിയാൻ കഴിയില്ല."],
    [/^Expense exceeds the Main Office available balance of (.+)\.$/i, "ചെലവ് മെയിൻ ഓഫീസിന്റെ ലഭ്യമായ ബാക്കി തുകയായ $1 കവിയുന്നു."],
    [/^Required amount cannot be below the current paid total of (.+)\.$/i, "ആവശ്യമായ തുക നിലവിലെ ലഭിച്ച ആകെ തുകയായ $1-ൽ താഴെയാകാൻ കഴിയില്ല."],
    [/^This member already has (.+) collected\. They cannot be marked as not collectable\.$/i, "ഈ അംഗത്തിന് ഇതിനകം $1 ലഭിച്ചിട്ടുണ്ട്. അതിനാൽ പിരിവ് വേണ്ടെന്ന് അടയാളപ്പെടുത്താൻ കഴിയില്ല."],
  ];
  for (const [re, replacement] of dynamic) {
    if (re.test(out)) return out.replace(re, replacement);
  }
  // If no dynamic template matched, apply the normal phrase dictionary.
  Object.keys(FCMS_ML_TEXT).sort((a,b)=>b.length-a.length).forEach((en)=>{
    out = out.split(en).join(FCMS_ML_TEXT[en]);
  });
  // Field labels are bilingual in English mode (e.g. "Name / പേര് *").
  // In Malayalam mode, display only the Malayalam half of bilingual labels.
  // This also handles multi-part labels such as "Voucher / Receipt / വൗച്ചർ / രസീത്".
  if (fcmsLang() === "ml") {
    out = out.replace(/^[A-Za-z][A-Za-z0-9 .+&()-]*\s*\/\s*(?=[\u0D00-\u0D7F])/u, "");
    out = out.replace(/^[A-Za-z][A-Za-z0-9 .+&()-]*\s*\/\s*[A-Za-z][A-Za-z0-9 .+&()-]*\s*\/\s*(?=[\u0D00-\u0D7F])/u, "");
    out = out.replace(/^[A-Za-z][A-Za-z0-9 .+&()-]*\s*\/\s*(?=[\u0D00-\u0D7F])/u, "");
    out = out.replace(/([\u0D00-\u0D7F][^\n]*?)\s*\/\s*([A-Za-z][A-Za-z0-9 .+&()-]*)$/u, "$1");
  }
  out = out.replace(/([^\n/]+)\s*\/\s*\1(?=\s*(?:\*|$))/g, "$1");
  return out;
}
function applyFcmsMalayalamToDom(root=document.body) {
  if (fcmsLang() !== "ml" || !root || document.body?.classList.contains("login-page")) return;
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
  if (fcmsLang() !== "ml" || window.__fcmsMlObserver || document.body?.classList.contains("login-page")) return;
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

/* ---------- English-only name validation ---------- */
function isEnglishName(value) {
  return /^[A-Za-z][A-Za-z .\'-]*$/.test(String(value || '').trim());
}
function englishNameError(value) {
  return isEnglishName(value) ? '' : 'Name must be entered in English only. / പേര് ഇംഗ്ലീഷിൽ മാത്രം നൽകുക.';
}

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
