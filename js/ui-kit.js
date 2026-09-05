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
    app_name: "NIDHI",
    app_full_name: "NIDHI",
    main_committee: "Main Committee",
    sub_committee: "Sub Committee",
    pradeshikam: "Pradeshikam",
    nav_main: "Main",
    nav_system: "System",
    dashboard: "Dashboard",
    activity_history: "Activity History",
    verified_users: "Verified Users",
    verified_name: "Name",
    verified_phone: "Phone Number",
    verified_role: "Role",
    verified_belongs_to: "Belongs To",
    verified_device: "Device",
    verified_first: "First Verified",
    verified_last: "Last Verified",
    verified_count: "Count",
    verified_actions: "Actions",
    search_verified_users: "Search Verified Users",
    all_roles: "All Roles",
    no_verified_users: "No Verified Users Found",
    verified_view_activity: "View Activity",
    reports: "Reports",
    view_reports: "View Reports",
    pradeshikam_reports: "Pradeshikam Reports",
    subcommittee_reports: "Sub Committee Reports",
    view_activity: "View Activity",
    pradeshikam_activity: "Pradeshikam Activity",
    subcommittee_activity: "Sub Committee Activity",
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
    reset_prototype_title: "Reset Prototype Data",
    reset_prototype_message: "This will permanently delete all prototype members, collections, payments, donations, expenses, submissions, allocations and activity data for every committee. Continue?",
    reset_prototype_button: "Reset Data",
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
    app_name: "നിധി",
    app_full_name: "നിധി",
    main_committee: "മെയിൻ കമ്മിറ്റി",
    sub_committee: "സബ് കമ്മിറ്റി",
    pradeshikam: "പ്രദേശികം",
    nav_main: "പ്രധാനം",
    nav_system: "സിസ്റ്റം",
    dashboard: "ഡാഷ്ബോർഡ്",
    activity_history: "പ്രവർത്തന ചരിത്രം",
    verified_users: "സ്ഥിരീകരിച്ച ഉപയോക്താക്കൾ",
    verified_name: "പേര്",
    verified_phone: "ഫോൺ നമ്പർ",
    verified_role: "പങ്ക്",
    verified_belongs_to: "ബന്ധപ്പെട്ട കമ്മിറ്റി",
    verified_device: "ഉപകരണം",
    verified_first: "ആദ്യ സ്ഥിരീകരണം",
    verified_last: "അവസാന സ്ഥിരീകരണം",
    verified_count: "എണ്ണം",
    verified_actions: "നടപടികൾ",
    search_verified_users: "സ്ഥിരീകരിച്ച ഉപയോക്താക്കളെ തിരയുക",
    all_roles: "എല്ലാ റോളുകളും",
    no_verified_users: "സ്ഥിരീകരിച്ച ഉപയോക്താക്കളെ കണ്ടെത്തിയില്ല",
    verified_view_activity: "പ്രവർത്തനം കാണുക",
    reports: "റിപ്പോർട്ടുകൾ",
    view_reports: "റിപ്പോർട്ടുകൾ കാണുക",
    pradeshikam_reports: "പ്രദേശിക റിപ്പോർട്ടുകൾ",
    subcommittee_reports: "സബ് കമ്മിറ്റി റിപ്പോർട്ടുകൾ",
    view_activity: "പ്രവർത്തനങ്ങൾ കാണുക",
    pradeshikam_activity: "പ്രദേശിക പ്രവർത്തനങ്ങൾ",
    subcommittee_activity: "സബ് കമ്മിറ്റി പ്രവർത്തനങ്ങൾ",
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
    reset_prototype_title: "പ്രോട്ടോടൈപ്പ് ഡാറ്റ റീസെറ്റ് ചെയ്യുക",
    reset_prototype_message: "എല്ലാ കമ്മിറ്റികളുടെയും പ്രോട്ടോടൈപ്പ് അംഗങ്ങൾ, പിരിവുകൾ, പേയ്മെന്റുകൾ, സംഭാവനകൾ, ചെലവുകൾ, സമർപ്പണങ്ങൾ, വിഹിതങ്ങൾ, പ്രവർത്തന ചരിത്രം എന്നിവ സ്ഥിരമായി ഇല്ലാതാകും. തുടരണമോ?",
    reset_prototype_button: "ഡാറ്റ റീസെറ്റ് ചെയ്യുക",
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



/* Browser Back must move exactly one history entry. Draft handling now makes
   it safe to revisit submitted form pages, so the former automatic second
   history.go(-1) is intentionally removed. */

/* ---------- Malayalam UI coverage for dynamically rendered pages ---------- */
const FCMS_PRADESHIKAM_ML = {
  "Ambangad": "അമ്പങ്ങാട്",
  "Bara/Mukkunnoth": "ബാര / മുക്കുന്നോത്ത്",
  "Bedakam": "ബേടകം",
  "Chalingal": "ചാലിങ്കാൽ",
  "Chemmanad": "ചെമ്മനാട്",
  "Kalanad": "കളനാട്",
  "Kuttikkol": "കുറ്റിക്കോൽ",
  "Kolathur/Maruthadukkam": "കൊളത്തൂർ / മരുതടുക്കം",
  "Kaniyamabdi": "കണിയംബാടി",
  "Melbara": "മേൽബാര",
  "Poinachi": "പൊയിനാച്ചി",
  "Pakkam": "പാക്കം",
  "Periya": "പെരിയ",
  "Poochakkad": "പൂച്ചക്കാട്",
  "Thokkanam/Karuvakod": "തോക്കാനം / കരുവാക്കോട്",
  "Thiravakoli": "തിരുവക്കോളി",
  "Udma": "ഉദുമ",
  "Chendalam": "ചെന്തളം"
};
function fcmsPradeshikamLabel(name) {
  const raw = String(name || "");
  return fcmsLang() === "ml" ? (FCMS_PRADESHIKAM_ML[raw] || raw) : raw;
}

const FCMS_ML_TEXT = {
  // User-provided Pradeshikam names
  ...FCMS_PRADESHIKAM_ML,
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
  "Souvenir Committee": "സ്മരണിക കമ്മിറ്റി",
  "Publicity Committee": "പ്രചാരണ കമ്മിറ്റി",
  "Audio Video Committee": "ഓഡിയോ വീഡിയോ കമ്മിറ്റി",
  "Finance Committee": "ഫിനാൻസ് കമ്മിറ്റി",
  "Program Committee": "പ്രോഗ്രാം കമ്മിറ്റി",

  "NIDHI": "നിധി", "Fund Collection": "നിധി", "Fund Collection Management System": "നിധി",
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
  "Apply Payment To *": "പേയ്മെന്റ് ആർക്കുവേണ്ടി നൽകണം *", "Payer only": "പണം നൽകുന്ന അംഗത്തിന് മാത്രം", "Selected household members": "തിരഞ്ഞെടുത്ത വീട്ടംഗങ്ങൾക്ക്", "Entire household": "മുഴുവൻ വീട്ടംഗങ്ങൾക്കും",
  "Select Members *": "അംഗങ്ങളെ തിരഞ്ഞെടുക്കുക *", "Selected Required Balance": "തിരഞ്ഞെടുത്തവരുടെ ബാക്കി തുക", "Excess Donation": "അധിക സംഭാവന", "Fully paid": "പൂർണ്ണമായി അടച്ചു", "remaining": "ബാക്കി",
  "Select at least one household member for this payment.": "ഈ പേയ്മെന്റിനായി കുറഞ്ഞത് ഒരു വീട്ടംഗത്തെയെങ്കിലും തിരഞ്ഞെടുക്കുക.",
  "Cheque Number *": "ചെക്ക് നമ്പർ *", "Enter cheque number": "ചെക്ക് നമ്പർ നൽകുക",
  "Enter the cheque number before saving.": "സേവ് ചെയ്യുന്നതിന് മുമ്പ് ചെക്ക് നമ്പർ നൽകുക.",
  "UPI Transaction ID": "UPI ട്രാൻസാക്ഷൻ ഐഡി", "UPI Transaction ID *": "UPI ട്രാൻസാക്ഷൻ ഐഡി *", "Enter transaction ID": "ട്രാൻസാക്ഷൻ ഐഡി നൽകുക",
  "Enter the UPI transaction ID before saving.": "സേവ് ചെയ്യുന്നതിന് മുമ്പ് UPI ട്രാൻസാക്ഷൻ ഐഡി നൽകുക.",
  "Receipt Setup": "രസീത് ക്രമീകരണം", "Receipt Setup *": "രസീത് ക്രമീകരണം *", "One receipt": "ഒരു രസീത്", "Receipt to each member": "ഓരോ അംഗത്തിനും രസീത്",
  "Households": "കുടുംബങ്ങൾ", "House Number": "വീടിന്റെ നമ്പർ", "House Number:": "വീടിന്റെ നമ്പർ:", "House": "വീട്", "Member List": "അംഗങ്ങളുടെ പട്ടിക", "Add Payment": "പേയ്മെന്റ് ചേർക്കുക", "House Payment": "പേയ്മെന്റ്", "Payment": "പേയ്മെന്റ്", "Paid By": "പണം നൽകിയ അംഗം", "Payment Amount": "പേയ്മെന്റ് തുക", "House Balance": "കുടുംബ ബാക്കി", "Excess Donation": "അധിക സംഭാവന", "Save Payment": "പേയ്മെന്റ് സേവ് ചെയ്യുക", "Complete": "പൂർത്തിയായി", "Balance": "ബാക്കി", "Required": "ആവശ്യമായത്", "Paid": "ലഭിച്ചത്", "View": "കാണുക", "History": "ചരിത്രം", "View History": "ചരിത്രം കാണുക", "House History": "കുടുംബ ചരിത്രം", "Total": "ആകെ", "Total Paid": "ആകെ ലഭിച്ചത്", "Members": "അംഗങ്ങൾ", "Payments": "പേയ്മെന്റുകൾ", "Donations": "സംഭാവനകൾ", "Activity History": "പ്രവർത്തന ചരിത്രം", "Remaining": "ബാക്കി", "Receipt": "രസീത്", "Mode": "രീതി", "Status": "നില", "Date": "തീയതി", "Amount": "തുക", "Member": "അംഗം", "No payments recorded.": "പേയ്മെന്റുകൾ രേഖപ്പെടുത്തിയിട്ടില്ല.", "No donations recorded.": "സംഭാവനകൾ രേഖപ്പെടുത്തിയിട്ടില്ല.", "No activity recorded.": "പ്രവർത്തനങ്ങൾ രേഖപ്പെടുത്തിയിട്ടില്ല.",
  "Household Details": "കുടുംബ വിവരങ്ങൾ", "Number of Members": "അംഗങ്ങളുടെ എണ്ണം", "Number of Members *": "അംഗങ്ങളുടെ എണ്ണം *", "Payment / Donation": "പേയ്മെന്റ് / സംഭാവന",
  "Amount Received": "ലഭിച്ച തുക", "Amount Received *": "ലഭിച്ച തുക *", "Received From": "ലഭിച്ചത് ആരിൽ നിന്ന്", "Received From *": "ലഭിച്ചത് ആരിൽ നിന്ന് *",
  "Member Receipt": "അംഗത്തിന്റെ രസീത്", "Member Receipt *": "അംഗത്തിന്റെ രസീത് *", "Marital Status": "വൈവാഹിക നില", "Marital Status *": "വൈവാഹിക നില *",
  "Select Pradeshikam": "പ്രദേശികം തിരഞ്ഞെടുക്കുക", "Select": "തിരഞ്ഞെടുക്കുക", "Single": "അവിവാഹിതൻ / അവിവാഹിത", "Married": "വിവാഹിതൻ / വിവാഹിത", "Widower": "വിധവൻ",
  "Save Member & Hold": "അംഗത്തെ സേവ് ചെയ്ത് ഹോൾഡ് ചെയ്യുക", "Save Members": "അംഗങ്ങളെ സേവ് ചെയ്യുക", "Enter amount received": "ലഭിച്ച തുക നൽകുക",
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
  "Fund Collection Management System": "നിധി",
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

// Exact translations for short controls and complete headings. Keeping these
// separate prevents a short word such as "All" from changing longer words.
const FCMS_ML_EXACT_TEXT = {
  "Report view and date range": "റിപ്പോർട്ട് കാഴ്ചയും തീയതി പരിധിയും",
  "Dates are optional": "തീയതികൾ നിർബന്ധമല്ല",
  "View Reports *": "റിപ്പോർട്ടുകൾ കാണുക *",
  "View Reports": "റിപ്പോർട്ടുകൾ കാണുക",
  "All": "എല്ലാം",
  "Today": "ഇന്ന്",
  "Yesterday": "ഇന്നലെ",
  "Last 7 Days": "കഴിഞ്ഞ 7 ദിവസം",
  "Last Month": "കഴിഞ്ഞ മാസം",
  "Last Year": "കഴിഞ്ഞ വർഷം",
  "From Date": "ആരംഭ തീയതി",
  "To Date": "അവസാന തീയതി",
  "View financial and operational reports.": "സാമ്പത്തികവും പ്രവർത്തനപരവുമായ റിപ്പോർട്ടുകൾ കാണുക.",
  "All payment modes": "എല്ലാ പേയ്മെന്റ് രീതികളും",
  "All Books": "എല്ലാ ബുക്കുകളും",
  "All Pradeshikams": "എല്ലാ പ്രദേശികങ്ങളും",
  "All statuses": "എല്ലാ നിലകളും",
  "Collection History": "പിരിവ് ചരിത്രം",
  "Every saved receipt and installment": "സേവ് ചെയ്ത എല്ലാ രസീതുകളും തവണകളും",
  "No collections found.": "പിരിവുകളൊന്നും കണ്ടെത്തിയില്ല.",
  "Every installment is stored as a separate receipt.": "ഓരോ തവണയും പ്രത്യേകം രസീതായി സൂക്ഷിക്കുന്നു.",
  "All sources": "എല്ലാ ഉറവിടങ്ങളും",
  "Records": "രേഖകൾ",
  "Total": "ആകെ"
};
Object.assign(FCMS_ML_EXACT_TEXT, {
  "Records in Period": "\u0d15\u0d3e\u0d32\u0d2f\u0d33\u0d35\u0d3f\u0d32\u0d46 \u0d30\u0d47\u0d16\u0d15\u0d7e",
  "Collected in Period": "\u0d15\u0d3e\u0d32\u0d2f\u0d33\u0d35\u0d3f\u0d7d \u0d2a\u0d3f\u0d30\u0d3f\u0d1a\u0d4d\u0d1a\u0d24\u0d4d",
  "Donations in Period": "\u0d15\u0d3e\u0d32\u0d2f\u0d33\u0d35\u0d3f\u0d32\u0d46 \u0d38\u0d02\u0d2d\u0d3e\u0d35\u0d28\u0d15\u0d7e",
  "Total in Period": "\u0d15\u0d3e\u0d32\u0d2f\u0d33\u0d35\u0d3f\u0d32\u0d46 \u0d06\u0d15\u0d46",
  "Search name, phone, house number or member ID": "\u0d2a\u0d47\u0d30\u0d4d, \u0d2b\u0d4b\u0d7a, \u0d35\u0d40\u0d1f\u0d4d\u0d1f\u0d41\u0d28\u0d2e\u0d4d\u0d2a\u0d7c \u0d05\u0d32\u0d4d\u0d32\u0d46\u0d19\u0d4d\u0d15\u0d3f\u0d7d \u0d05\u0d02\u0d17 \u0d10\u0d21\u0d3f \u0d24\u0d3f\u0d30\u0d2f\u0d41\u0d15",
  "Search house number, member, phone or Pradeshikam": "\u0d35\u0d40\u0d1f\u0d4d\u0d1f\u0d41\u0d28\u0d2e\u0d4d\u0d2a\u0d7c, \u0d05\u0d02\u0d17\u0d02, \u0d2b\u0d4b\u0d7a \u0d05\u0d32\u0d4d\u0d32\u0d46\u0d19\u0d4d\u0d15\u0d3f\u0d7d \u0d2a\u0d4d\u0d30\u0d26\u0d47\u0d36\u0d3f\u0d15\u0d02 \u0d24\u0d3f\u0d30\u0d2f\u0d41\u0d15",
  "Search members": "\u0d05\u0d02\u0d17\u0d19\u0d4d\u0d19\u0d33\u0d46 \u0d24\u0d3f\u0d30\u0d2f\u0d41\u0d15",
  "Search households": "\u0d35\u0d40\u0d1f\u0d41\u0d15\u0d33\u0d46 \u0d24\u0d3f\u0d30\u0d2f\u0d41\u0d15"
  ,"Previous": "\u0d2e\u0d41\u0d7b\u0d2a\u0d24\u0d4d\u0d24\u0d46"
  ,"Next": "\u0d05\u0d1f\u0d41\u0d24\u0d4d\u0d24\u0d24\u0d4d"
  ,"First page": "\u0d06\u0d26\u0d4d\u0d2f \u0d2a\u0d47\u0d1c\u0d4d"
  ,"Last page": "\u0d05\u0d35\u0d38\u0d3e\u0d28 \u0d2a\u0d47\u0d1c\u0d4d"
  ,"Records per page": "\u0d13\u0d30\u0d4b \u0d2a\u0d47\u0d1c\u0d3f\u0d32\u0d41\u0d2e\u0d41\u0d33\u0d4d\u0d33 \u0d30\u0d47\u0d16\u0d15\u0d7e"
  ,"Houses per page": "\u0d13\u0d30\u0d4b \u0d2a\u0d47\u0d1c\u0d3f\u0d32\u0d41\u0d2e\u0d41\u0d2e\u0d41\u0d33\u0d4d\u0d33 \u0d35\u0d40\u0d1f\u0d41\u0d15\u0d7e"
});
Object.assign(FCMS_ML_EXACT_TEXT, {
  "How should this amount be recorded?": "ഈ തുക എങ്ങനെ രേഖപ്പെടുത്തണം?",
  "Keep as full donation": "മുഴുവൻ സംഭാവനയായി രേഖപ്പെടുത്തുക",
  "Keep Full Donation": "മുഴുവൻ സംഭാവനയായി രേഖപ്പെടുത്തുക",
  "Apply requirement first": "ആദ്യം ആവശ്യമായ തുകയിൽ ചേർക്കുക",
  "Apply Requirement First": "ആദ്യം ആവശ്യമായ തുകയിൽ ചേർക്കുക"
});
Object.assign(FCMS_ML_EXACT_TEXT, {
  "Donation Source / സംഭാവനയുടെ ഉറവിടം *": "സംഭാവനയുടെ ഉറവിടം *",
  "Donation Source": "സംഭാവനയുടെ ഉറവിടം",
  "Save Donation": "സംഭാവന സേവ് ചെയ്യുക",
  "No donations found.": "സംഭാവനകളൊന്നും കണ്ടെത്തിയില്ല.",
  "Submission For / സമർപ്പണം": "സമർപ്പിക്കേണ്ടത്",
  "Submission For": "സമർപ്പിക്കേണ്ടത്",
  "Cash to Submit": "സമർപ്പിക്കാനുള്ള പണം",
  "Amount Type / തുകയുടെ തരം *": "തുകയുടെ തരം *",
  "Amount Type": "തുകയുടെ തരം",
  "Donation Amount / സംഭാവന തുക *": "സംഭാവന തുക *",
  "Donation Amount": "സംഭാവന തുക",
  "Receipt / Voucher / രസീത് / വൗച്ചർ *": "രസീത് / വൗച്ചർ *",
  "Receipt / Voucher / രസീത് / വൗച്ചർ": "രസീത് / വൗച്ചർ",
  "Receipt / Voucher": "രസീത് / വൗച്ചർ",
  "New Submission": "പുതിയ സമർപ്പണം",
  "Save Submission": "സമർപ്പണം സേവ് ചെയ്യുക",
  "No submission history recorded yet.": "ഇതുവരെ സമർപ്പണ ചരിത്രമൊന്നും രേഖപ്പെടുത്തിയിട്ടില്ല.",
  "A receipt/voucher image is required to save the submission.": "സമർപ്പണം സേവ് ചെയ്യാൻ രസീത് / വൗച്ചർ ചിത്രം ആവശ്യമാണ്.",
  "Take Photo": "ഫോട്ടോ എടുക്കുക",
  "members": "അംഗങ്ങൾ"
});
function fcmsTranslateValue(value) {
  let out = String(value ?? "");

  // Dynamic messages: translate the stable English sentence structure while
  // preserving names, receipt numbers, committee names and amounts.
  if (fcmsLang() === "ml") {
    const exactText = out.trim();
    if (Object.prototype.hasOwnProperty.call(FCMS_ML_EXACT_TEXT, exactText)) {
      const leadingSpace = out.match(/^\s*/)?.[0] || "";
      const trailingSpace = out.match(/\s*$/)?.[0] || "";
      return `${leadingSpace}${FCMS_ML_EXACT_TEXT[exactText]}${trailingSpace}`;
    }
    out = out.replace(/\b(\d+)\s+members?\b/gi, (_, n) => `${n} അംഗ${Number(n) === 1 ? "ം" : "ങ്ങൾ"}`);
    out = out.replace(/\bMember\s+(\d+)\b/gi, (_, n) => `അംഗം ${n}`);
    out = out.replace(/\bin this house\b/gi, "ഈ വീട്ടിൽ");
    out = out.replace(/\bNo members found\.?/gi, "അംഗങ്ങളെ കണ്ടെത്തിയില്ല.");
    out = out.replace(/\bNo payments yet\.?/gi, "ഇതുവരെ പേയ്മെന്റുകളില്ല.");
  }

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
  // Malayalam translations must only run while Malayalam is selected.
  // Previously these replacements also ran in English mode, which caused
  // English labels/messages to be translated back to Malayalam on every load.
  if (fcmsLang() === "ml") {
    for (const [re, replacement] of dynamic) {
      if (re.test(out)) return out.replace(re, replacement);
    }
    // If no dynamic template matched, apply the normal phrase dictionary.
    Object.keys(FCMS_ML_TEXT).sort((a,b)=>b.length-a.length).forEach((en)=>{
      out = out.split(en).join(FCMS_ML_TEXT[en]);
    });
  }
  // Keep field controls single-language: English mode shows only English,
  // Malayalam mode shows only Malayalam. This removes the old bilingual
  // "English / Malayalam" presentation without changing any underlying values.
  if (fcmsLang() === "ml") {
    out = out.replace(/^[A-Za-z][A-Za-z0-9 .+&()?-]*\s*\/\s*(?=[\u0D00-\u0D7F])/u, "");
    out = out.replace(/^[A-Za-z][A-Za-z0-9 .+&()?-]*\s*\/\s*[A-Za-z][A-Za-z0-9 .+&()?-]*\s*\/\s*(?=[\u0D00-\u0D7F])/u, "");
    out = out.replace(/^[A-Za-z][A-Za-z0-9 .+&()?-]*\s*\/\s*(?=[\u0D00-\u0D7F])/u, "");
    out = out.replace(/([\u0D00-\u0D7F][^\n]*?)\s*\/\s*[A-Za-z][A-Za-z0-9 .+&()?-]*$/u, "$1");
  } else {
    // English: remove the Malayalam portion from labels such as
    // "Pradeshikam / പ്രദേശികം" and "Receipt / Bill / രസീത് / ബിൽ".
    out = out.replace(/\s*\/\s*[\u0D00-\u0D7F][\u0D00-\u0D7F\s\/]*(\s*\*)?$/u, (m, star) => star ? " *" : "");
  }
  out = out.replace(/\s*\/\s*([\u0D00-\u0D7F]+)\s*\/\s*\1(?=\s*(?:\*|$))/gu, " / $1");
  out = out.replace(/\s*\/\s*$/g, "");
  return out;
}
function applyFcmsMalayalamToDom(root=document.body) {
  if (!root || document.body?.classList.contains("login-page")) return;
  // Keep the underlying values of native select options stable while their
  // visible labels are translated. Many calculations/business rules depend
  // on canonical values such as Male, Female, Cash, Green, etc.
  // Without an explicit value attribute, translating the option text also
  // changes option.value and breaks those rules in Malayalam mode.
  if (root.querySelectorAll) {
    if (root.matches?.("option:not([value])")) {
      root.setAttribute("value", root.textContent.trim());
    }
    root.querySelectorAll("option:not([value])").forEach((option) => {
      option.setAttribute("value", option.textContent.trim());
    });
  }
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
  // Never translate input/select values. They are application data used by
  // calculations and permission checks; only labels and text nodes are visual.
}
function initFcmsMalayalamObserver() {
  if (window.__fcmsMlObserver || document.body?.classList.contains("login-page")) return;
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

/* ---------- Digits-only phone fields ---------- */
(function initFcmsDigitsOnlyPhoneFields() {
  const selector = [
    'input[type="tel"]',
    'input[id*="phone" i]',
    'input[name*="phone" i]',
    'input[id*="mobile" i]',
    'input[name*="mobile" i]'
  ].join(",");
  const isPhoneField = (element) => element instanceof HTMLInputElement && element.matches(selector);
  const cleanPhoneValue = (field) => {
    const original = String(field.value || "");
    const clean = original.replace(/[^0-9]/g, "");
    if (clean === original) return;
    const oldPosition = field.selectionStart;
    const removedBeforeCaret = oldPosition == null ? 0 : original.slice(0, oldPosition).replace(/[0-9]/g, "").length;
    field.value = clean;
    if (oldPosition != null && document.activeElement === field) {
      const nextPosition = Math.max(0, oldPosition - removedBeforeCaret);
      field.setSelectionRange(nextPosition, nextPosition);
    }
  };
  const enhancePhoneFields = (root = document) => {
    const fields = root.matches?.(selector) ? [root] : Array.from(root.querySelectorAll?.(selector) || []);
    fields.forEach((field) => {
      field.inputMode = "numeric";
      field.setAttribute("pattern", "[0-9]*");
      field.setAttribute("autocomplete", "tel-national");
      cleanPhoneValue(field);
    });
  };

  document.addEventListener("beforeinput", (event) => {
    if (!isPhoneField(event.target) || event.isComposing || !event.data) return;
    if (/[^0-9]/.test(event.data)) event.preventDefault();
  }, true);
  document.addEventListener("input", (event) => {
    if (isPhoneField(event.target)) cleanPhoneValue(event.target);
  }, true);
  document.addEventListener("paste", (event) => {
    if (!isPhoneField(event.target)) return;
    const digits = (event.clipboardData?.getData("text") || "").replace(/[^0-9]/g, "");
    event.preventDefault();
    const field = event.target;
    const start = field.selectionStart ?? field.value.length;
    const end = field.selectionEnd ?? start;
    field.setRangeText(digits, start, end, "end");
    field.dispatchEvent(new Event("input", { bubbles: true }));
  }, true);

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => enhancePhoneFields(), { once: true });
  } else {
    enhancePhoneFields();
  }
  new MutationObserver((mutations) => {
    mutations.forEach((mutation) => mutation.addedNodes.forEach((node) => {
      if (node.nodeType === Node.ELEMENT_NODE) enhancePhoneFields(node);
    }));
  }).observe(document.documentElement, { childList: true, subtree: true });
})();

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
  type = type === "danger" ? "error" : type;
  try { sessionStorage.removeItem("fcms_pending_activity_toast"); } catch (_) {}
  const signature = `${type}:${String(message)}`;
  const duplicate = Array.from(host.children).find((item) => item.dataset.toastSignature === signature);
  if (duplicate) return duplicate;
  const icons = {
    success: "bi-check-circle-fill",
    error: "bi-x-circle-fill",
    info: "bi-info-circle-fill",
    warning: "bi-exclamation-triangle-fill",
  };
  const el = document.createElement("div");
  el.className = `fcms-toast fcms-toast-${type}`;
  el.dataset.toastSignature = signature;
  el.innerHTML = `<i class="bi ${icons[type] || icons.info}"></i><span>${String(
    message,
  ).replace(/</g, "&lt;")}</span>`;
  host.appendChild(el);
  requestAnimationFrame(() => el.classList.add("show"));
  setTimeout(() => {
    el.classList.remove("show");
    setTimeout(() => el.remove(), 250);
  }, duration);
  return el;
}

function fcmsQueueToast(message, type = "success") {
  try {
    sessionStorage.setItem("fcms_queued_toast", JSON.stringify({ message, type, at: Date.now() }));
  } catch (_) {}
}

function fcmsScheduleSavedActivityToast(activity) {
  const action = String(activity?.action || "").trim();
  if (!activity?.id || !/(added|saved|edited|updated|deleted|confirmed|restored)/i.test(action)) return;
  const item = {
    id: String(activity.id),
    message: `${action} successfully.`,
    type: "success",
    at: Date.now(),
  };
  try { sessionStorage.setItem("fcms_pending_activity_toast", JSON.stringify(item)); } catch (_) {}
  window.setTimeout(() => {
    let pending = null;
    try { pending = JSON.parse(sessionStorage.getItem("fcms_pending_activity_toast") || "null"); } catch (_) {}
    if (pending?.id !== item.id) return;
    try { sessionStorage.removeItem("fcms_pending_activity_toast"); } catch (_) {}
    toast(item.message, item.type);
  }, 120);
}

(function initFcmsGlobalFormNotifications() {
  const showQueuedToast = () => {
    let queued = null;
    try {
      queued = JSON.parse(sessionStorage.getItem("fcms_queued_toast") || "null");
      sessionStorage.removeItem("fcms_queued_toast");
    } catch (_) {}
    if (queued?.message && Date.now() - Number(queued.at || 0) < 15000) {
      toast(queued.message, queued.type || "success");
      return;
    }
    let pending = null;
    try {
      pending = JSON.parse(sessionStorage.getItem("fcms_pending_activity_toast") || "null");
      sessionStorage.removeItem("fcms_pending_activity_toast");
    } catch (_) {}
    if (pending?.message && Date.now() - Number(pending.at || 0) < 15000) {
      toast(pending.message, pending.type || "success");
    }
  };
  const notifyVisibleError = (element) => {
    const alert = element?.matches?.(".alert-danger") ? element : element?.closest?.(".alert-danger");
    if (!alert || alert.classList.contains("d-none") || alert.hidden) return;
    const message = String(alert.textContent || "").replace(/\s+/g, " ").trim();
    if (message) toast(message, "error");
  };
  const start = () => {
    showQueuedToast();
    document.querySelectorAll(".alert-danger:not(.d-none)").forEach(notifyVisibleError);
    new MutationObserver((mutations) => mutations.forEach((mutation) => {
      notifyVisibleError(mutation.target.nodeType === Node.ELEMENT_NODE ? mutation.target : mutation.target.parentElement);
      mutation.addedNodes.forEach((node) => {
        if (node.nodeType !== Node.ELEMENT_NODE) return;
        notifyVisibleError(node);
        node.querySelectorAll?.(".alert-danger:not(.d-none)").forEach(notifyVisibleError);
      });
    })).observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ["class", "hidden"] });
  };
  document.addEventListener("invalid", (event) => {
    const field = event.target;
    const label = field.id ? document.querySelector(`label[for="${CSS.escape(field.id)}"]`)?.textContent : "";
    const fieldName = String(label || field.getAttribute("aria-label") || field.placeholder || "required field")
      .replace(/\s*\*\s*$/, "").trim();
    toast(`Please check ${fieldName}.`, "error");
  }, true);
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start, { once: true });
  else start();
})();

/* ---------- Confirm dialog (Promise-based, glass-styled) ---------- */
function confirmDialog(message, opts = {}) {
  return new Promise((resolve) => {
    const confirmTone = ["primary", "success", "warning", "danger"].includes(opts.tone)
      ? opts.tone
      : "danger";
    const overlay = document.createElement("div");
    overlay.className = "fcms-modal-overlay";
    overlay.innerHTML = `
      <div class="fcms-modal fcms-modal-tone-${confirmTone}" role="dialog" aria-modal="true">
        <div class="fcms-modal-icon"><i class="bi bi-exclamation-triangle-fill"></i></div>
        <div class="fcms-modal-title">${opts.title ? String(opts.title).replace(/</g, "&lt;") : t("are_you_sure")}</div>
        <div class="fcms-modal-body">${String(message).replace(/</g, "&lt;")}</div>
        <div class="fcms-modal-actions">
          <button type="button" class="btn btn-light" id="fcmsModalCancel">${opts.cancelLabel || t("cancel")}</button>
          <button type="button" class="btn btn-${confirmTone}" id="fcmsModalConfirm">${opts.confirmLabel || t("delete")}</button>
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
      if (e.target === overlay && opts.dismissible !== false) close(false);
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


/* ---------- Shared payment-mode validation ---------- */
function fcmsNormalizePaymentMode(v) {
  return String(v || "").trim().toUpperCase();
}
function fcmsGetUpiTransactionId(selectId) {
  const select = document.getElementById(selectId);
  if (!select || fcmsNormalizePaymentMode(select.value) !== "UPI") return "";
  const input = document.getElementById(`${selectId}TransactionId`);
  return String(input?.value || "").trim();
}
function fcmsGetChequeNumber(selectId) {
  const select = document.getElementById(selectId);
  if (!select || fcmsNormalizePaymentMode(select.value) !== "CHEQUE") return "";
  const input = document.getElementById(`${selectId}ChequeNumber`);
  return String(input?.value || "").trim();
}
function fcmsAttachUpiTransactionFields(root = document) {
  root.querySelectorAll?.("form select").forEach((select) => {
    if (!select.id || select.dataset.fcmsUpiReady === "1") return;
    const hasUpi = Array.from(select.options || []).some((o) => fcmsNormalizePaymentMode(o.value || o.textContent) === "UPI");
    if (!hasUpi) return;
    // Ignore reporting/filter controls: transaction IDs are only relevant to data-entry forms.
    if (select.closest(".collection-filter-row") || select.id === "modeFilter" || select.id === "filterMode") return;
    select.dataset.fcmsUpiReady = "1";
    const host = select.closest("[class*='col-']") || select.parentElement;
    if (!host || !host.parentElement) return;
    const wrap = document.createElement("div");
    const widthClass = Array.from(host.classList).filter((c)=>c.startsWith("col-")).join(" ") || "col-md-4";
    wrap.className = `${widthClass} fcms-upi-transaction-field d-none`;
    wrap.innerHTML = `<label class="form-label">UPI Transaction ID *</label><input id="${select.id}TransactionId" class="form-control" autocomplete="off" inputmode="text" placeholder="Enter transaction ID" maxlength="80">`;
    host.insertAdjacentElement("afterend", wrap);
    const input = wrap.querySelector("input");
    if (select.dataset.transactionId) input.value = select.dataset.transactionId;
    if (select.disabled || select.dataset.paymentLocked === "1") {
      input.readOnly = true;
      wrap.classList.add("fcms-upi-locked");
    }
    const chequeWrap = document.createElement("div");
    chequeWrap.className = `${widthClass} fcms-cheque-number-field d-none`;
    chequeWrap.innerHTML = `<label class="form-label">Cheque Number *</label><input id="${select.id}ChequeNumber" class="form-control" autocomplete="off" inputmode="numeric" pattern="[0-9]+" placeholder="Enter cheque number" maxlength="30">`;
    wrap.insertAdjacentElement("afterend", chequeWrap);
    const chequeInput = chequeWrap.querySelector("input");
    chequeInput.addEventListener("input", () => {
      chequeInput.value = chequeInput.value.replace(/\D/g, "");
    });
    if (select.dataset.chequeNumber) chequeInput.value = select.dataset.chequeNumber;
    if (select.disabled || select.dataset.paymentLocked === "1") chequeInput.readOnly = true;
    const sync = () => {
      const show = fcmsNormalizePaymentMode(select.value) === "UPI";
      wrap.classList.toggle("d-none", !show);
      input.required = show && !input.readOnly;
      if (!show && !input.readOnly) input.classList.remove("is-invalid");
      const showCheque = fcmsNormalizePaymentMode(select.value) === "CHEQUE";
      chequeWrap.classList.toggle("d-none", !showCheque);
      chequeInput.required = showCheque && !chequeInput.readOnly;
      if (!showCheque && !chequeInput.readOnly) chequeInput.classList.remove("is-invalid");
    };
    select.addEventListener("change", sync);
    sync();
    const form = select.closest("form");
    if (form && form.dataset.fcmsUpiValidation !== "1") {
      form.dataset.fcmsUpiValidation = "1";
      form.addEventListener("submit", (event) => {
        let firstInvalid = null;
        form.querySelectorAll("select[data-fcms-upi-ready='1']").forEach((modeSelect) => {
          if (fcmsNormalizePaymentMode(modeSelect.value) !== "UPI") return;
          const txn = document.getElementById(`${modeSelect.id}TransactionId`);
          if (txn && !txn.readOnly && !String(txn.value || "").trim()) {
            txn.classList.add("is-invalid");
            firstInvalid ||= txn;
          } else txn?.classList.remove("is-invalid");
        });
        form.querySelectorAll("select[data-fcms-upi-ready='1']").forEach((modeSelect) => {
          if (fcmsNormalizePaymentMode(modeSelect.value) !== "CHEQUE") return;
          const cheque = document.getElementById(`${modeSelect.id}ChequeNumber`);
          if (cheque && !cheque.readOnly && !String(cheque.value || "").trim()) {
            cheque.classList.add("is-invalid");
            firstInvalid ||= cheque;
          } else cheque?.classList.remove("is-invalid");
        });
        if (firstInvalid) {
          event.preventDefault();
          event.stopImmediatePropagation();
          firstInvalid.focus();
          const message = firstInvalid.id.endsWith("ChequeNumber")
            ? "Enter the cheque number before saving."
            : "Enter the UPI transaction ID before saving.";
          toast?.(message, "danger");
        }
      }, true);
    }
  });
}
/* ---------- Automatic local drafts for data-entry forms ---------- */
function fcmsDraftUserKey() {
  try {
    const s = typeof currentSession === "function" ? currentSession() : null;
    return String(s?.id || s?.username || s?.role || "guest");
  } catch (_) { return "guest"; }
}
function fcmsDraftKey(form) {
  return `fcms_form_draft_v1:${fcmsDraftUserKey()}:${location.pathname}:${form.id || "form"}:${form.dataset.fcmsDraftScope || "default"}`;
}
function fcmsSerializeFormDraft(form) {
  const data = {};
  form.querySelectorAll("input,select,textarea").forEach((el) => {
    if (!el.id && !el.name) return;
    if (["password","file","submit","button","reset","hidden"].includes((el.type || "").toLowerCase())) return;
    const key = el.id || el.name;
    if (el.type === "radio") {
      if (el.checked) data[key] = { type: "radio", value: el.value, name: el.name };
    } else if (el.type === "checkbox") data[key] = { type: "checkbox", value: !!el.checked };
    else data[key] = { type: "value", value: el.value };
  });
  return data;
}
function fcmsApplyFormDraft(form, data) {
  if (!data || typeof data !== "object") return false;
  let applied = false;
  Object.entries(data).forEach(([key, item]) => {
    let el = document.getElementById(key) || form.elements?.namedItem?.(key);
    if (item?.type === "radio") {
      const radio = Array.from(form.querySelectorAll("input[type=\"radio\"]")).find(r => r.name === (item.name || key) && r.value === item.value);
      if (radio) { radio.checked = true; applied = true; }
      return;
    }
    if (!el || el instanceof RadioNodeList) return;
    if (item?.type === "checkbox") el.checked = !!item.value;
    else if (item?.type === "value" && item.value != null) el.value = item.value;
    else return;
    applied = true;
  });
  return applied;
}
function fcmsSaveFormDraft(form) {
  if (!form || form.dataset.fcmsDraftDisabled === "1") return;
  try {
    const data = fcmsSerializeFormDraft(form);
    localStorage.setItem(fcmsDraftKey(form), JSON.stringify({ at: Date.now(), data }));
  } catch (_) {}
}
function fcmsClearFormDraft(form) {
  if (!form) return;
  if (form.__fcmsDraftTimer) {
    clearTimeout(form.__fcmsDraftTimer);
    form.__fcmsDraftTimer = null;
  }
  try { localStorage.removeItem(fcmsDraftKey(form)); } catch (_) {}
}
function fcmsClearPageDraft() {
  document.querySelectorAll("form[data-fcms-draft-ready='1']").forEach(fcmsClearFormDraft);
  window.__fcmsUnsavedFormChanges = false;
}
function fcmsHasUnsavedChanges() {
  return window.__fcmsUnsavedFormChanges === true;
}
function fcmsDiscardUnsavedWarning() {
  window.__fcmsUnsavedFormChanges = false;
}
function fcmsFormNeedsLeaveGuard(form) {
  if (!form || form.dataset.fcmsLeaveGuard === "off") return false;
  if (form.closest(".login-page") || form.id === "verificationForm") return false;
  return !!form.querySelector('button[type="submit"],input[type="submit"],button:not([type])');
}
function fcmsAttachDraftSaving(root = document) {
  root.querySelectorAll?.("form").forEach((form) => {
    if (form.dataset.fcmsDraftReady === "1" || form.closest(".login-page") || form.id === "verificationForm") return;
    const controls = form.querySelectorAll("input:not([type='hidden']):not([type='password']):not([type='file']),select,textarea");
    if (!controls.length) return;
    form.dataset.fcmsDraftReady = "1";
    let saved = null;
    try { saved = JSON.parse(localStorage.getItem(fcmsDraftKey(form)) || "null"); } catch (_) {}
    // Ignore a stale draft recreated by an old debounce timer immediately
    // after this same page successfully saved and navigated away.
    if (saved?.data) {
      try {
        const lastSave = JSON.parse(sessionStorage.getItem("fcms_last_saved_page") || "null");
        const samePage = lastSave?.path === location.pathname + location.search;
        if (samePage && Number(saved.at || 0) <= Number(lastSave.at || 0) + 3000) {
          fcmsClearFormDraft(form);
          saved = null;
        }
      } catch (_) {}
    }
    if (saved?.data) {
      // Let the user decide whether to continue unfinished work or start with
      // the page's clean defaults. Drafts must never be restored silently.
      window.setTimeout(async () => {
        const isMl = fcmsLang() === "ml";
        const restore = await confirmDialog(
          isMl
            ? "ഈ പേജിൽ പൂർത്തിയാക്കാത്ത വിവരങ്ങൾ കണ്ടെത്തി. മുമ്പത്തെ ഡ്രാഫ്റ്റ് തുടരണമോ?"
            : "Unfinished details were found for this page. Would you like to continue the saved draft?",
          {
            title: isMl ? "സേവ് ചെയ്ത ഡ്രാഫ്റ്റ്" : "Saved Draft Found",
            confirmLabel: isMl ? "ഡ്രാഫ്റ്റ് പുനഃസ്ഥാപിക്കുക" : "Restore Draft",
            cancelLabel: isMl ? "പുതിയത് ആരംഭിക്കുക" : "Start New",
            tone: "primary",
            dismissible: false,
          },
        );
        if (!restore) {
          fcmsClearFormDraft(form);
          window.__fcmsUnsavedFormChanges = false;
          if (typeof toast === "function") toast(isMl ? "പുതിയ ഫോം ആരംഭിച്ചു." : "Started a new form.", "info", 2000);
          return;
        }
        // First restore structural controls such as member count / receipt mode.
        fcmsApplyFormDraft(form, saved.data);
        form.querySelectorAll("select").forEach(el => el.dispatchEvent(new Event("change", { bubbles: true })));
        // Dynamic rows can be rebuilt by change handlers, so restore again.
        window.setTimeout(() => {
          if (fcmsApplyFormDraft(form, saved.data)) {
            form.querySelectorAll("input,select,textarea").forEach(el => el.dispatchEvent(new Event("input", { bubbles: true })));
            window.__fcmsUnsavedFormChanges = true;
            if (typeof toast === "function") toast(isMl ? "സേവ് ചെയ്ത ഡ്രാഫ്റ്റ് പുനഃസ്ഥാപിച്ചു." : "Saved draft restored.", "info", 2200);
          }
        }, 80);
      }, 0);
    }
    let timer;
    const saveSoon = (event) => {
      // Initialization scripts dispatch synthetic input/change events while
      // building dynamic forms. Only genuine user interaction creates a draft.
      if (event && event.isTrusted === false) return;
      if (fcmsFormNeedsLeaveGuard(form)) window.__fcmsUnsavedFormChanges = true;
      clearTimeout(timer);
      timer = setTimeout(() => {
        form.__fcmsDraftTimer = null;
        fcmsSaveFormDraft(form);
      }, 180);
      form.__fcmsDraftTimer = timer;
    };
    form.addEventListener("input", saveSoon);
    form.addEventListener("change", saveSoon);
    form.addEventListener("reset", () => setTimeout(() => {
      fcmsClearFormDraft(form);
      window.__fcmsUnsavedFormChanges = false;
    }, 0));
  });
}

// Browsers intentionally show their own standard confirmation text here.
// This protects refresh, tab close, address changes and the browser Back button.
window.addEventListener("beforeunload", (event) => {
  if (!fcmsHasUnsavedChanges()) return;
  event.preventDefault();
  event.returnValue = "";
});

(function initFcmsSharedFormEnhancements(){
  const run=()=>{ fcmsAttachUpiTransactionFields(document); fcmsAttachDraftSaving(document); };
  if(document.readyState==="loading") document.addEventListener("DOMContentLoaded",run,{once:true}); else run();
  const observer=new MutationObserver(()=>run());
  observer.observe(document.documentElement,{subtree:true,childList:true});
  try {
    const lowCpu = Number(navigator.hardwareConcurrency || 8) <= 4;
    const lowMem = "deviceMemory" in navigator && Number(navigator.deviceMemory || 8) <= 4;
    const saveData = !!(navigator.connection && navigator.connection.saveData);
    if (lowCpu || lowMem || saveData) document.documentElement.classList.add("fcms-low-power");
  } catch (_) {}
})();


/* FCMS document language sync */
(function(){
  function syncFcmsDocumentLanguage(){
    try{
      var lang = localStorage.getItem('fcms_lang') || 'en';
      var isMl = lang === 'ml' || lang === 'malayalam';
      document.documentElement.lang = isMl ? 'ml' : 'en';
      if(document.body){
        document.body.classList.toggle('lang-ml', isMl);
      }
    }catch(e){}
  }
  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', syncFcmsDocumentLanguage);
  }else{
    syncFcmsDocumentLanguage();
  }
  window.addEventListener('storage', function(e){
    if(e.key === 'fcms_lang') syncFcmsDocumentLanguage();
  });
  window.syncFcmsDocumentLanguage = syncFcmsDocumentLanguage;
})();


/* FCMS automatic Receipt Book indicator */
/* Legacy indicator disabled to prevent duplicate Book badges. */
(function(){
  window.fcmsRefreshReceiptBookIndicators = function(){
    if(typeof window.fcmsRefreshPublishedReceiptBooks === "function") window.fcmsRefreshPublishedReceiptBooks();
    if(typeof window.fcmsRefreshSeparateBookIndicators === "function") window.fcmsRefreshSeparateBookIndicators();
  };
})();


/* FCMS receipt/submission terminology additions for Malayalam mode */
(function(){
 const pairs={
   "UPI Verified":"UPI സ്ഥിരീകരിച്ചു",
   "Cash Submission":"പണം സമർപ്പിച്ചത്",
   "Received directly by Main Office":"പ്രധാന ഓഫീസിൽ നേരിട്ട് ലഭിച്ചു",
   "Receipt / UPI":"രസീത് / UPI",
   "Recorded / Verified By":"രേഖപ്പെടുത്തിയത് / സ്ഥിരീകരിച്ചത്",
   "Type":"തരം"
 };
 function apply(){
   let ml=false;try{ml=localStorage.getItem("fcms_lang")==="ml";}catch(_){}
   if(!ml)return;
   document.querySelectorAll("th,.badge,.verified-upi-history-row .small").forEach(el=>{
     const t=el.textContent.trim();
     if(pairs[t]) el.textContent=pairs[t];
   });
 }
 document.addEventListener("DOMContentLoaded",()=>setTimeout(apply,50));
 const o=new MutationObserver(()=>setTimeout(apply,0));
 document.addEventListener("DOMContentLoaded",()=>o.observe(document.body,{childList:true,subtree:true}));
})();


/* FCMS dynamic member receipt reinforcement */
(function(){
  function candidate(el){
    if(!el || el.tagName !== "INPUT") return false;
    const fcmsPath=(location.pathname||"").toLowerCase();
    if(fcmsPath.endsWith("donations.html") ||
       fcmsPath.endsWith("edit-donation.html") ||
       fcmsPath.endsWith("subcommittee-collections.html") ||
       fcmsPath.endsWith("edit-subcommittee-collection.html") ||
       fcmsPath.endsWith("subcommittee-add-payment.html")) return false;

    const type=String(el.type||"").toLowerCase();
    if(["file","hidden","checkbox","radio","date"].includes(type)) return false;
    const labelText=(()=>{
      try{
        const label=el.id?document.querySelector(`label[for="${CSS.escape(el.id)}"]`):null;
        return label?.textContent||"";
      }catch(_){return "";}
    })();
    const all=((el.id||"")+" "+(el.name||"")+" "+(el.placeholder||"")+" "+labelText).toLowerCase();
    return all.includes("receipt") || all.includes("രസീത്");
  }
  function refreshReceiptFields(scope=document){
    const inputs=scope.querySelectorAll?scope.querySelectorAll("input"):[];
    inputs.forEach(el=>{
      if(!candidate(el)) return;
      // Trigger the shared indicator without changing the field value.
      el.dispatchEvent(new Event("input",{bubbles:true}));
    });
  }

  if(document.readyState==="loading"){
    document.addEventListener("DOMContentLoaded",()=>refreshReceiptFields());
  }else{
    refreshReceiptFields();
  }

  // Member receipt rows are created/removed dynamically when receipt mode changes.
  const observer=new MutationObserver(mutations=>{
    let needsRefresh=false;
    for(const m of mutations){
      if(m.type==="childList" && m.addedNodes.length){ needsRefresh=true; break; }
    }
    if(needsRefresh) requestAnimationFrame(()=>refreshReceiptFields());
  });

  document.addEventListener("DOMContentLoaded",()=>{
    observer.observe(document.body,{childList:true,subtree:true});
  });

  // Explicitly re-check after receipt setup/select changes.
  document.addEventListener("change",e=>{
    const el=e.target;
    if(!el) return;
    const key=((el.id||"")+" "+(el.name||"")).toLowerCase();
    if(key.includes("receipt") || key.includes("setup")){
      setTimeout(()=>refreshReceiptFields(),0);
      setTimeout(()=>refreshReceiptFields(),120);
    }
  });

  window.fcmsRefreshDynamicReceiptBooks=refreshReceiptFields;
})();


/* FCMS GLOBAL RECEIPT LIMIT VALIDATION */
(function(){
  function isReceiptInput(el){
    if(!el || el.tagName !== "INPUT") return false;
    if(el.closest?.(".fcms-book-limit-overlay, .fcms-book-limit-confirm-overlay") ||
       String(el.id || "").toLowerCase().includes("receiptbooklimit")) return false;
    const fcmsPath=(location.pathname||"").toLowerCase();
    if(fcmsPath.endsWith("donations.html") ||
       fcmsPath.endsWith("edit-donation.html") ||
       fcmsPath.endsWith("subcommittee-collections.html") ||
       fcmsPath.endsWith("edit-subcommittee-collection.html") ||
       fcmsPath.endsWith("subcommittee-add-payment.html")) return false;

    const type = String(el.type || "").toLowerCase();
    if(["file","hidden","checkbox","radio","date"].includes(type)) return false;

    let label = "";
    try{
      const lab = el.id ? document.querySelector(`label[for="${CSS.escape(el.id)}"]`) : null;
      label = lab?.textContent || "";
    }catch(_){}

    const key = ((el.id||"")+" "+(el.name||"")+" "+(el.placeholder||"")+" "+label).toLowerCase();
    return key.includes("receipt") || key.includes("രസീത്");
  }

  function receiptLimitMessage(){
    const db = typeof getDB === "function" ? getDB() : {};
    const limit = typeof fcmsReceiptBookLimit === "function" ? fcmsReceiptBookLimit(db) : 100;
    const max = limit * (typeof FCMS_RECEIPTS_PER_BOOK !== "undefined" ? FCMS_RECEIPTS_PER_BOOK : 50);

    return fcmsLang() === "ml"
      ? `നിലവിലെ രസീത് ബുക്ക് പരിധി ബുക്ക് ${limit} ആണ്. ${max} ന് മുകളിലുള്ള രസീത് നമ്പർ നൽകാൻ കഴിയില്ല.`
      : `The current receipt book limit is Book ${limit}. Receipt numbers above ${max} are not allowed.`;
  }

  function validateReceiptLimit(el, report){
    if(!isReceiptInput(el)) return true;

    const value = String(el.value || "").trim();
    if(!value || !/^\d+$/.test(value)){
      if(el.dataset.fcmsReceiptLimitInvalid === "1"){
        el.setCustomValidity("");
        delete el.dataset.fcmsReceiptLimitInvalid;
      }
      return true;
    }

    const ok = typeof fcmsReceiptAllowed === "function" ? fcmsReceiptAllowed(value) : true;
    if(!ok){
      el.dataset.fcmsReceiptLimitInvalid = "1";
      el.setCustomValidity(receiptLimitMessage());
      if(report) el.reportValidity();
      return false;
    }

    if(el.dataset.fcmsReceiptLimitInvalid === "1"){
      el.setCustomValidity("");
      delete el.dataset.fcmsReceiptLimitInvalid;
    }
    return true;
  }

  document.addEventListener("input", e => {
    if(isReceiptInput(e.target)) validateReceiptLimit(e.target, false);
  }, true);

  document.addEventListener("change", e => {
    if(isReceiptInput(e.target)) validateReceiptLimit(e.target, true);
  }, true);

  document.addEventListener("submit", e => {
    if(!(e.target instanceof HTMLFormElement)) return;
    const bad = [...e.target.querySelectorAll("input")].find(el => isReceiptInput(el) && !validateReceiptLimit(el, false));
    if(!bad) return;

    e.preventDefault();
    e.stopImmediatePropagation();
    bad.focus();
    bad.reportValidity();
  }, true);

  window.fcmsValidateReceiptLimit = validateReceiptLimit;
})();


/* FCMS mutation observer debounce */
(function(){
  let timer = 0;
  const original = window.fcmsRefreshDynamicReceiptBooks;
  if(typeof original === "function"){
    window.fcmsRefreshDynamicReceiptBooks = function(){
      clearTimeout(timer);
      timer = setTimeout(() => {
        try{ original(); }catch(_){}
      }, 40);
    };
  }
})();


/* DEFINITIVE BOOK LIMIT VALIDATION */
(function(){
  const excluded=["donations.html","edit-donation.html","subcommittee-collections.html","edit-subcommittee-collection.html","subcommittee-add-payment.html"];
  function excludedPage(){
    const p=(location.pathname||"").toLowerCase();
    return excluded.some(x=>p.endsWith(x));
  }
  function isReceipt(el){
    if(excludedPage()||!el||el.tagName!=="INPUT") return false;
    if(el.closest?.(".fcms-book-limit-overlay, .fcms-book-limit-confirm-overlay") ||
       String(el.id || "").toLowerCase().includes("receiptbooklimit")) return false;
    let lab="";
    try{lab=el.id?(document.querySelector(`label[for="${CSS.escape(el.id)}"]`)?.textContent||""):"";}catch(_){}
    const key=((el.id||"")+" "+(el.name||"")+" "+(el.placeholder||"")+" "+lab).toLowerCase();
    return key.includes("receipt")||key.includes("രസീത്");
  }
  function validate(el,report){
    if(!isReceipt(el)) return true;
    const v=String(el.value||"").trim();
    if(!v||!/^\d+$/.test(v)) return true;
    const limit=fcmsReceiptBookLimit(getDB());
    const max=fcmsMaxAllowedReceiptNumber(getDB());
    if(Number(v)>max){
      el.setCustomValidity(fcmsLang()==="ml"
        ?`രസീത് ബുക്ക് പരിധി ബുക്ക് ${limit} ആണ്. ${max} ന് മുകളിലുള്ള രസീത് അനുവദനീയമല്ല.`
        :`Receipt book limit is Book ${limit}. Receipt numbers above ${max} are not allowed.`);
      if(report) el.reportValidity();
      return false;
    }
    el.setCustomValidity("");
    return true;
  }
  document.addEventListener("input",e=>{if(isReceipt(e.target))validate(e.target,false);},true);
  document.addEventListener("change",e=>{if(isReceipt(e.target))validate(e.target,true);},true);
  document.addEventListener("submit",e=>{
    if(!(e.target instanceof HTMLFormElement))return;
    const bad=[...e.target.querySelectorAll("input")].find(x=>isReceipt(x)&&!validate(x,false));
    if(!bad)return;
    e.preventDefault();
    e.stopImmediatePropagation();
    bad.focus();
    bad.reportValidity();
  },true);
})();


/* PUBLISHED BOOK ENFORCEMENT */
(function(){
  const excludedPages = [
    "donations.html",
    "edit-donation.html",
    "subcommittee-collections.html",
    "edit-subcommittee-collection.html",
    "subcommittee-add-payment.html"
  ];

  function isExcludedPage(){
    const path=(location.pathname||"").toLowerCase();
    return excludedPages.some(page=>path.endsWith(page));
  }

  function isReceiptInput(el){
    if(isExcludedPage() || !el || el.tagName!=="INPUT") return false;
    if(el.closest?.(".fcms-book-limit-overlay, .fcms-book-limit-confirm-overlay") ||
       String(el.id || "").toLowerCase().includes("receiptbooklimit")) return false;

    const type=String(el.type||"").toLowerCase();
    if(["file","hidden","checkbox","radio","date"].includes(type)) return false;

    let label="";
    try{
      if(el.id){
        label=document.querySelector(`label[for="${CSS.escape(el.id)}"]`)?.textContent || "";
      }
    }catch(_){}

    const key=((el.id||"")+" "+(el.name||"")+" "+(el.placeholder||"")+" "+label).toLowerCase();
    return key.includes("receipt") || key.includes("രസീത്");
  }

  function cleanupIndicators(el, keep=null){
    const parent=el.parentElement;
    if(!parent) return;
    const classes=["fcms-receipt-book-note","fcms-receipt-book-indicator","fcms-separate-book-indicator"];
    [...parent.children].forEach(node=>{
      if(node===el || node===keep) return;
      if(classes.some(cls=>node.classList?.contains(cls))){
        node.remove();
        return;
      }
      const text=(node.textContent||"").trim();
      if((/^book\s+\d+$/i.test(text) || /^ബുക്ക്\s+\d+$/.test(text) || /outside the current.*book/i.test(text))
         && !node.querySelector?.("input,select,textarea,button")){
        node.remove();
      }
    });
  }

  function getIndicator(el){
    const parent=el.parentElement;
    let indicator=parent?.querySelector(':scope > [data-fcms-receipt-book-indicator="1"]') || null;
    if(!indicator){
      indicator=document.createElement("div");
      indicator.dataset.fcmsReceiptBookIndicator="1";
      indicator.className="fcms-receipt-book-indicator";
      el.insertAdjacentElement("afterend",indicator);
    }else if(indicator.previousElementSibling!==el){
      el.insertAdjacentElement("afterend",indicator);
    }
    cleanupIndicators(el,indicator);
    return indicator;
  }

  function update(el, reportError=false){
    if(!isReceiptInput(el)) return true;

    const indicator=getIndicator(el);
    cleanupIndicators(el, indicator);

    const raw=String(el.value||"").trim();

    if(!raw){
      indicator.textContent="";
      indicator.className="fcms-receipt-book-indicator";
      indicator.hidden=true;
      el.setCustomValidity("");
      el.classList.remove("fcms-receipt-unpublished");
      return true;
    }

    if(!/^\d+$/.test(raw)){
      return true; // let existing numeric/required validation handle it
    }

    const info=typeof fcmsPublishedBookInfo==="function"
      ? fcmsPublishedBookInfo(raw,getDB())
      : null;

    if(!info){
      indicator.textContent="";
      indicator.hidden=true;
      return true;
    }

    indicator.hidden=false;

    if(!info.published){
      const ml=typeof fcmsLang==="function" && fcmsLang()==="ml";
      const message=ml
        ? `ബുക്ക് ${info.book} ഇതുവരെ പ്രസിദ്ധീകരിച്ചിട്ടില്ല. നിലവിൽ പ്രസിദ്ധീകരിച്ച പരിധി ബുക്ക് ${info.publishedLimit} ആണ്.`
        : `Book ${info.book} has not been published yet. Current published limit is Book ${info.publishedLimit}.`;

      indicator.className="fcms-receipt-book-indicator fcms-receipt-book-error";
      indicator.innerHTML=`<i class="bi bi-exclamation-circle"></i><span>${message}</span>`;

      el.classList.add("fcms-receipt-unpublished");
      el.setCustomValidity(message);

      if(reportError) el.reportValidity();
      return false;
    }

    el.classList.remove("fcms-receipt-unpublished");
    el.setCustomValidity("");
    indicator.className="fcms-receipt-book-indicator fcms-receipt-book-ok";
    indicator.innerHTML=`<i class="bi bi-journal-bookmark"></i><span>${typeof fcmsLang==="function" && fcmsLang()==="ml" ? "ബുക്ക്" : "Book"} ${info.book}</span>`;
    return true;
  }

  // Live validation as soon as receipt is typed.
  document.addEventListener("input",e=>{
    if(isReceiptInput(e.target)) update(e.target,false);
  },true);

  document.addEventListener("change",e=>{
    if(isReceiptInput(e.target)) update(e.target,true);
  },true);

  document.addEventListener("blur",e=>{
    if(isReceiptInput(e.target)) update(e.target,true);
  },true);

  // Hard stop on any form submit.
  document.addEventListener("submit",e=>{
    if(!(e.target instanceof HTMLFormElement) || isExcludedPage()) return;

    const receiptInputs=[...e.target.querySelectorAll("input")].filter(isReceiptInput);
    const invalid=receiptInputs.find(el=>!update(el,false));

    if(invalid){
      e.preventDefault();
      e.stopImmediatePropagation();
      invalid.focus();
      invalid.reportValidity();
    }
  },true);

  // Dynamic "Receipt for each member" rows.
  function refresh(){
    document.querySelectorAll("input").forEach(el=>{
      if(isReceiptInput(el) && String(el.value||"").trim()) update(el,false);
    });
  }

  if(document.readyState==="loading"){
    document.addEventListener("DOMContentLoaded",()=>setTimeout(refresh,80));
  }else{
    setTimeout(refresh,80);
  }

  let timer;
  new MutationObserver(()=>{
    clearTimeout(timer);
    timer=setTimeout(refresh,40);
  }).observe(document.body,{childList:true,subtree:true});

  window.fcmsRefreshPublishedReceiptBooks=refresh;
})();


/* SEPARATE RECEIPT BOOK INDICATOR */
/* Pradeshikam Donations and Sub Committee Collections also issue physical receipts.
   Show Book N using the same 50-receipts-per-book calculation.
   These receipt series remain separate from the Main Committee published-book limit. */
(function(){
  const separatePages = [
    "donations.html",
    "edit-donation.html",
    "subcommittee-collections.html",
    "edit-subcommittee-collection.html",
    "subcommittee-add-payment.html"
  ];

  function isSeparateReceiptPage(){
    const path=(location.pathname||"").toLowerCase();
    return separatePages.some(page=>path.endsWith(page));
  }

  function isReceiptInput(el){
    if(!isSeparateReceiptPage() || !el || el.tagName!=="INPUT") return false;

    const type=String(el.type||"").toLowerCase();
    if(["file","hidden","checkbox","radio","date"].includes(type)) return false;

    let label="";
    try{
      if(el.id){
        label=document.querySelector(`label[for="${CSS.escape(el.id)}"]`)?.textContent||"";
      }
    }catch(_){}

    const key=((el.id||"")+" "+(el.name||"")+" "+(el.placeholder||"")+" "+label).toLowerCase();
    return key.includes("receipt") || key.includes("രസീത്");
  }

  function cleanupIndicators(el, keep=null){
    const parent=el.parentElement;
    if(!parent) return;
    const classes=["fcms-receipt-book-note","fcms-receipt-book-indicator","fcms-separate-book-indicator"];
    [...parent.children].forEach(node=>{
      if(node===el || node===keep) return;
      if(classes.some(cls=>node.classList?.contains(cls))){
        node.remove();
        return;
      }
      const text=(node.textContent||"").trim();
      if((/^book\s+\d+$/i.test(text) || /^ബുക്ക്\s+\d+$/.test(text))
         && !node.querySelector?.("input,select,textarea,button")){
        node.remove();
      }
    });
  }

  function indicatorFor(el){
    const parent=el.parentElement;
    let indicator=parent?.querySelector(':scope > [data-fcms-separate-book-indicator="1"]') || null;
    if(!indicator){
      indicator=document.createElement("div");
      indicator.dataset.fcmsSeparateBookIndicator="1";
      indicator.className="fcms-separate-book-indicator";
      el.insertAdjacentElement("afterend",indicator);
    }else if(indicator.previousElementSibling!==el){
      el.insertAdjacentElement("afterend",indicator);
    }
    cleanupIndicators(el,indicator);
    return indicator;
  }

  function update(el){
    if(!isReceiptInput(el)) return;

    const indicator=indicatorFor(el);
    const raw=String(el.value||"").trim();

    if(!raw || !/^\d+$/.test(raw)){
      indicator.hidden=true;
      indicator.textContent="";
      return;
    }

    const n=Number(raw);
    if(!Number.isFinite(n) || n<1){
      indicator.hidden=true;
      indicator.textContent="";
      return;
    }

    const perBook = typeof FCMS_RECEIPTS_PER_BOOK!=="undefined"
      ? FCMS_RECEIPTS_PER_BOOK
      : 50;

    const book=Math.floor((n-1)/perBook)+1;

    indicator.hidden=false;
    indicator.innerHTML=`<i class="bi bi-journal-bookmark"></i><span>${typeof fcmsLang==="function" && fcmsLang()==="ml" ? "ബുക്ക്" : "Book"} ${book}</span>`;
  }

  document.addEventListener("input",e=>{
    if(isReceiptInput(e.target)) update(e.target);
  },true);

  document.addEventListener("change",e=>{
    if(isReceiptInput(e.target)) update(e.target);
  },true);

  function refresh(){
    if(!isSeparateReceiptPage()) return;
    document.querySelectorAll("input").forEach(el=>{
      if(isReceiptInput(el)) update(el);
    });
  }

  if(document.readyState==="loading"){
    document.addEventListener("DOMContentLoaded",()=>setTimeout(refresh,60));
  }else{
    setTimeout(refresh,60);
  }

  let timer;
  new MutationObserver(()=>{
    clearTimeout(timer);
    timer=setTimeout(refresh,50);
  }).observe(document.body,{childList:true,subtree:true});

window.fcmsRefreshSeparateBookIndicators=refresh;
})();

/* Receipt books allocated to a Pradeshikam/Sub Committee are exclusive. */
(function(){
  function owner(el){
    const s=typeof currentSession==="function"?currentSession():null;
    if(s?.role==="pradeshikam") return {type:"pradeshikam",id:s.pradeshikamId};
    if(s?.role==="subcommittee") return {type:"subcommittee",id:s.subCommitteeId};
    if(s?.role==="admin"){
      const db=typeof getDB==="function"?getDB():{};
      const prSelect=document.getElementById("pradeshikam")||document.getElementById("donationPradeshikam");
      if(prSelect?.value&&/^\d+$/.test(prSelect.value)) return {type:"pradeshikam",id:Number(prSelect.value)};
      const memberId=document.getElementById("donorMember")?.value||document.getElementById("housePaymentMember")?.value;
      const picked=(db.members||[]).find(m=>String(m.id)===String(memberId));
      if(picked?.pradeshikamId) return {type:"pradeshikam",id:picked.pradeshikamId};
      const params=new URLSearchParams(location.search), path=(location.pathname||"").toLowerCase();
      if(path.endsWith("add-payment.html")){
        const member=(db.members||[]).find(m=>String(m.id)===String(params.get("id")));
        if(member?.pradeshikamId)return {type:"pradeshikam",id:member.pradeshikamId};
      }
      if(path.endsWith("edit-payment.html")){
        const payment=(db.payments||[]).find(p=>String(p.id)===String(params.get("id")));
        const member=(db.members||[]).find(m=>String(m.id)===String(payment?.memberId));
        if(member?.pradeshikamId)return {type:"pradeshikam",id:member.pradeshikamId};
      }
      if(path.endsWith("edit-donation.html")){
        const donation=(db.donations||[]).find(d=>String(d.id)===String(params.get("id")));
        if(donation?.pradeshikamId)return {type:"pradeshikam",id:donation.pradeshikamId};
      }
      const committeeId=document.getElementById("committeeSelect")?.value||params.get("committee");
      if(committeeId&&/^\d+$/.test(committeeId))return {type:"subcommittee",id:Number(committeeId)};
      if(path.includes("subcommittee")){
        const recordId=params.get("id");
        const record=[...(db.subCommitteeCollections||[]),...(db.subCommitteeCollectionPayments||[])].find(x=>String(x.id)===String(recordId));
        if(record?.subCommitteeId)return {type:"subcommittee",id:record.subCommitteeId};
      }
    }
    return null;
  }
  function isReceiptInput(el){
    if(!owner(el)||!el||el.tagName!=="INPUT") return false;
    if(el.closest?.(".fcms-book-limit-overlay, .fcms-book-allocation-overlay")) return false;
    const key=((el.id||"")+" "+(el.name||"")+" "+(el.placeholder||"")).toLowerCase();
    return key.includes("receipt");
  }
  function validate(el,report){
    if(!isReceiptInput(el)) return true;
    const raw=String(el.value||"").trim();
    if(!raw||raw==="0"||!/^[0-9]+$/.test(raw)) return true;
    const o=owner(el), db=getDB(), info=fcmsReceiptBookInfo(raw);
    if(!info||fcmsReceiptAllowedForCommittee(raw,o.type,o.id,db)){
      el.setCustomValidity(""); delete el.dataset.fcmsAllocationInvalid; return true;
    }
    const books=fcmsAllocatedReceiptBooks(o.type,o.id,db);
    const message=fcmsLang()==="ml"
      ? `രസീത് ബുക്ക് ${info.book} ഈ കമ്മിറ്റിക്ക് അനുവദിച്ചിട്ടില്ല. മെയിൻ കമ്മിറ്റി അഡ്മിൻ അനുവദിച്ച ബുക്കിൽ നിന്നുള്ള രസീത് നമ്പർ നൽകുക. അനുവദിച്ച ബുക്കുകൾ: ${books.join(", ")||"ഒന്നുമില്ല"}.`
      : `Receipt Book ${info.book} is not allocated to this committee. Please enter a receipt number from a book allocated by the Main Committee admin. Allocated books: ${books.join(", ")||"None"}.`;
    el.dataset.fcmsAllocationInvalid="1"; el.setCustomValidity(message);
    if(report) el.reportValidity(); return false;
  }
  document.addEventListener("input",e=>{if(isReceiptInput(e.target))validate(e.target,false);},true);
  document.addEventListener("change",e=>{if(isReceiptInput(e.target))validate(e.target,true);},true);
  document.addEventListener("submit",e=>{
    if(!(e.target instanceof HTMLFormElement)) return;
    const bad=[...e.target.querySelectorAll("input")].find(el=>isReceiptInput(el)&&!validate(el,false));
    if(!bad)return;
    e.preventDefault(); e.stopImmediatePropagation(); bad.focus(); bad.reportValidity();
    if(typeof toast==="function") toast(bad.validationMessage,"danger");
  },true);
})();



/* FCMS direct Reports navigation for Pradeshikam/Sub Committee */
(function(){
  function role(){
    try{
      const x = typeof currentSession === "function" ? currentSession() : null;
      return String(x?.role || "").toLowerCase();
    }catch(_){ return ""; }
  }
  function isDirectRole(){
    const r=role();
    return r==="pradeshikam" || r==="subcommittee" || r.includes("pradesh") || r.includes("sub");
  }
  function apply(){
    if(!isDirectRole()) return;
    document.querySelectorAll(".sidebar a,.sidebar button,aside a,aside button").forEach(el=>{
      const text=String(el.textContent||"").replace(/\s+/g," ").trim().toLowerCase();
      if(text!=="reports" && text!=="റിപ്പോർട്ടുകൾ") return;
      if(el.tagName==="A"){
        el.href="reports.html";
        el.removeAttribute("aria-expanded");
      }else{
        el.onclick=e=>{e.preventDefault();e.stopPropagation();location.href="reports.html";};
        el.removeAttribute("aria-expanded");
      }
      el.classList.remove("dropdown-toggle","has-submenu");
      const group=el.closest("li,.nav-item,.nav-group,.sidebar-group,.sidebar-dropdown,.nav-dropdown");
      if(group){
        group.querySelectorAll(".submenu,.nav-submenu,.sidebar-submenu,.dropdown-menu").forEach(x=>x.style.display="none");
        group.querySelectorAll(".dropdown-arrow,.chevron,.submenu-arrow,.menu-arrow").forEach(x=>x.style.display="none");
      }
    });
  }
  if(document.readyState==="loading") document.addEventListener("DOMContentLoaded",apply);
  else apply();
  new MutationObserver(apply).observe(document.documentElement,{childList:true,subtree:true});
})();

/* FCMS mobile sidebar close fix */
(function(){
  const MOBILE_MAX = 991;

  function sidebar(){
    return document.querySelector(
      ".sidebar, #sidebar, .app-sidebar, aside.sidebar, .fcms-sidebar"
    );
  }

  function backdrop(){
    return document.querySelector(
      ".sidebar-backdrop, .mobile-sidebar-backdrop, .sidebar-overlay, .menu-overlay, .fcms-sidebar-backdrop"
    );
  }

  function isMobile(){
    return window.innerWidth <= MOBILE_MAX;
  }

  function closeMobileSidebar(){
    if(!isMobile()) return;

    const sb = sidebar();
    if(!sb) return;

    [
      "open","show","active","is-open","sidebar-open","mobile-open","opened"
    ].forEach(c=>sb.classList.remove(c));

    document.documentElement.classList.remove(
      "sidebar-open","menu-open","mobile-menu-open","nav-open"
    );
    document.body.classList.remove(
      "sidebar-open","menu-open","mobile-menu-open","nav-open","overflow-hidden"
    );

    const bd = backdrop();
    if(bd){
      bd.classList.remove("show","active","open","is-open");
      bd.setAttribute("aria-hidden","true");
      if(bd.style) bd.style.display = "none";
    }

    document.querySelectorAll(
      "[aria-controls='sidebar'], .sidebar-toggle, .mobile-menu-toggle, .menu-toggle, [data-sidebar-toggle]"
    ).forEach(btn=>{
      btn.setAttribute("aria-expanded","false");
    });
  }

  function openStateLikely(){
    const sb = sidebar();
    if(!sb) return false;
    const c = sb.classList;
    return ["open","show","active","is-open","sidebar-open","mobile-open","opened"].some(x=>c.contains(x))
      || document.body.classList.contains("sidebar-open")
      || document.documentElement.classList.contains("sidebar-open");
  }

  document.addEventListener("click", function(e){
    if(!isMobile()) return;

    const sb = sidebar();
    if(!sb) return;

    const closeBtn = e.target.closest(
      ".sidebar-close, .mobile-sidebar-close, [data-sidebar-close], .btn-close"
    );
    if(closeBtn && sb.contains(closeBtn)){
      e.preventDefault();
      e.stopPropagation();
      closeMobileSidebar();
      return;
    }

    const bd = e.target.closest(
      ".sidebar-backdrop, .mobile-sidebar-backdrop, .sidebar-overlay, .menu-overlay, .fcms-sidebar-backdrop"
    );
    if(bd){
      closeMobileSidebar();
      return;
    }

    const navLink = e.target.closest(
      ".sidebar a[href], #sidebar a[href], .app-sidebar a[href], aside.sidebar a[href], .fcms-sidebar a[href]"
    );
    if(navLink && sb.contains(navLink)){
      const href = String(navLink.getAttribute("href") || "").trim();
      // Do not close when a parent dropdown toggle is clicked.
      const isToggle =
        navLink.classList.contains("dropdown-toggle") ||
        navLink.classList.contains("has-submenu") ||
        navLink.hasAttribute("data-bs-toggle") ||
        navLink.hasAttribute("data-toggle") ||
        navLink.getAttribute("aria-haspopup") === "true";

      if(href && href !== "#" && !isToggle){
        setTimeout(closeMobileSidebar, 0);
      }
      return;
    }

    // Click outside open sidebar closes it.
    if(openStateLikely() && !sb.contains(e.target)){
      const toggle = e.target.closest(
        ".sidebar-toggle, .mobile-menu-toggle, .menu-toggle, [data-sidebar-toggle], [aria-controls='sidebar']"
      );
      if(!toggle) closeMobileSidebar();
    }
  }, true);

  document.addEventListener("keydown", function(e){
    if(e.key === "Escape") closeMobileSidebar();
  });

  window.addEventListener("resize", function(){
    if(!isMobile()){
      document.body.classList.remove("overflow-hidden");
    }
  });

  // Expose for any existing page-specific toggle code.
window.fcmsCloseMobileSidebar = closeMobileSidebar;
})();

/* Large-data rendering: keep complete datasets available while limiting the
   number of live table/card nodes that older browsers must lay out at once. */
(function () {
  const processed = new WeakSet();
  const lowPower = document.documentElement.classList.contains("fcms-low-power");
  const defaultSize = lowPower ? 25 : 50;

  window.fcmsDebounce = function (fn, delay) {
    let timer;
    return function () {
      const context = this, args = arguments;
      clearTimeout(timer);
      timer = setTimeout(function () { fn.apply(context, args); }, delay || 180);
    };
  };

  function paginate(container, items, anchor) {
    if (!container || items.length <= defaultSize || processed.has(container)) return;
    processed.add(container);
    let page = 0, size = defaultSize;
    const nav = document.createElement("div");
    nav.className = "fcms-pagination";
    nav.innerHTML = '<button type="button" class="btn btn-sm btn-light" data-page="first" aria-label="First page">&laquo;</button><button type="button" class="btn btn-sm btn-light" data-page="previous">Previous</button><span class="fcms-pagination-status" aria-live="polite"></span><button type="button" class="btn btn-sm btn-light" data-page="next">Next</button><button type="button" class="btn btn-sm btn-light" data-page="last" aria-label="Last page">&raquo;</button><select class="form-select form-select-sm fcms-page-size" aria-label="Records per page"><option>25</option><option>50</option><option>100</option></select>';
    nav.querySelector(".fcms-page-size").value = String(size);
    anchor.parentNode.insertBefore(nav, anchor.nextSibling);

    const render = function () {
      const pages = Math.max(1, Math.ceil(items.length / size));
      page = Math.max(0, Math.min(page, pages - 1));
      const start = page * size, end = Math.min(items.length, start + size);
      const fragment = document.createDocumentFragment();
      for (let i = start; i < end; i++) fragment.appendChild(items[i]);
      while (container.firstChild) container.removeChild(container.firstChild);
      container.appendChild(fragment);
      nav.querySelector(".fcms-pagination-status").textContent = `${start + 1}\u2013${end} of ${items.length}`;
      nav.querySelector('[data-page="first"]').disabled = page === 0;
      nav.querySelector('[data-page="previous"]').disabled = page === 0;
      nav.querySelector('[data-page="next"]').disabled = page >= pages - 1;
      nav.querySelector('[data-page="last"]').disabled = page >= pages - 1;
    };
    nav.addEventListener("click", function (event) {
      const button = event.target.closest("button[data-page]");
      if (!button) return;
      const pages = Math.max(1, Math.ceil(items.length / size));
      if (button.dataset.page === "first") page = 0;
      if (button.dataset.page === "previous") page--;
      if (button.dataset.page === "next") page++;
      if (button.dataset.page === "last") page = pages - 1;
      render();
    });
    nav.querySelector(".fcms-page-size").addEventListener("change", function (event) {
      size = Number(event.target.value) || defaultSize;
      page = 0;
      render();
    });
    render();
  }

  function scan(root) {
    const scope = root && root.querySelectorAll ? root : document;
    scope.querySelectorAll("table tbody").forEach(function (tbody) {
      if (processed.has(tbody)) return;
      const rows = Array.prototype.slice.call(tbody.children);
      if (rows.length > defaultSize) paginate(tbody, rows, tbody.closest(".table-responsive") || tbody.parentNode);
      else processed.add(tbody);
    });
  }

  let scanTimer;
  function scheduleScan() {
    clearTimeout(scanTimer);
    scanTimer = setTimeout(function () { scan(document); }, 0);
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", scheduleScan, { once:true });
  else scheduleScan();
  new MutationObserver(scheduleScan).observe(document.documentElement, { childList:true, subtree:true });
})();
