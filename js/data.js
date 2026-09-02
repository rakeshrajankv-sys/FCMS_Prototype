const FCMS_KEY = "fcms_prototype_v1";
const SESSION_KEY = "fcms_session";
const FCMS_MEMBER_STATS_CACHE = new WeakMap();

const PRADESHIKAM_NAMES = [
  "Ambangad",
  "Bara/Mukkunnoth",
  "Bedakam",
  "Chalingal",
  "Chemmanad",
  "Kalanad",
  "Kuttikkol",
  "Kolathur/Maruthadukkam",
  "Kaniyamabdi",
  "Melbara",
  "Poinachi",
  "Pakkam",
  "Periya",
  "Poochakkad",
  "Thokkanam/Karuvakod",
  "Thiravakoli",
  "Udma",
  "Chendalam",
];
const DEFAULT_PRADESHIKAMS = PRADESHIKAM_NAMES.map((name, i) => ({
  id: i + 1,
  name,
  username: `p${i + 1}`,
  password: "p123",
}));
const SUBCOMMITTEE_DEFS = [
  { name: "Souvenir Committee", icon: "bi-book" },
  { name: "Publicity Committee", icon: "bi-megaphone" },
  { name: "Audio Video Committee", icon: "bi-camera-video" },
  { name: "Finance Committee", icon: "bi-cash-coin", financeAccess: true },
  { name: "Program Committee", icon: "bi-calendar-event" },
];
const SUBCOMMITTEE_NAMES = SUBCOMMITTEE_DEFS.map((c) => c.name);
const DEFAULT_SUBCOMMITTEES = SUBCOMMITTEE_DEFS.map((c, i) => ({
  id: i + 1,
  name: c.name,
  username: `sc${i + 1}`,
  password: "sc123",
  icon: c.icon,
  financeAccess: !!c.financeAccess,
}));
const DEFAULT_USERS = [
  {
    id: 1,
    role: "admin",
    name: "Main Committee",
    username: "admin",
    password: "admin123",
    pradeshikamId: null,
  },
  ...DEFAULT_PRADESHIKAMS.map((p, i) => ({
    id: i + 2,
    role: "pradeshikam",
    name: p.name,
    username: p.username,
    password: p.password,
    pradeshikamId: p.id,
  })),
  ...DEFAULT_SUBCOMMITTEES.map((c, i) => ({
    id: i + 2 + DEFAULT_PRADESHIKAMS.length,
    role: "subcommittee",
    name: c.name,
    username: c.username,
    password: c.password,
    subCommitteeId: c.id,
  })),
];

function seedDemoData() {
  let db = JSON.parse(localStorage.getItem(FCMS_KEY) || "null");
  if (!db)
    db = {
      pradeshikams: DEFAULT_PRADESHIKAMS,
      users: DEFAULT_USERS,
      members: [],
      payments: [],
      donations: [],
      activities: [],
      submissions: [],
      subCommittees: DEFAULT_SUBCOMMITTEES,
      subCommitteeCollections: [],
      subCommitteeCollectionPayments: [],
      subCommitteeSubmissions: [],
      subCommitteeAllocations: [],
      subCommitteeExpenses: [],
      verifiedUsers: [],
    };
  db.pradeshikams ||= DEFAULT_PRADESHIKAMS;
  db.pradeshikams.forEach((p, i) => {
    if (PRADESHIKAM_NAMES[i]) p.name = PRADESHIKAM_NAMES[i];
  });
  db.subCommittees ||= DEFAULT_SUBCOMMITTEES;
  // Add any sub committees introduced after this browser's data was first created
  // (e.g. Finance Committee) without disturbing existing committees' data.
  DEFAULT_SUBCOMMITTEES.forEach((def) => {
    if (!db.subCommittees.some((c) => Number(c.id) === Number(def.id))) {
      db.subCommittees.push({ ...def });
    }
  });
  db.subCommittees.forEach((c) => {
    const def = DEFAULT_SUBCOMMITTEES.find(
      (d) => Number(d.id) === Number(c.id),
    );
    if (def) {
      c.name = def.name;
      c.icon ||= def.icon;
      c.financeAccess = def.financeAccess || !!c.financeAccess;
    }
  });
  db.users ||= DEFAULT_USERS;
  db.users.forEach((u) => {
    if (
      u.role === "pradeshikam" &&
      u.pradeshikamId &&
      PRADESHIKAM_NAMES[u.pradeshikamId - 1]
    )
      u.name = PRADESHIKAM_NAMES[u.pradeshikamId - 1];
    if (
      u.role === "subcommittee" &&
      u.subCommitteeId &&
      SUBCOMMITTEE_NAMES[u.subCommitteeId - 1]
    )
      u.name = SUBCOMMITTEE_NAMES[u.subCommitteeId - 1];
  });
  // Ensure every sub committee (including newly added ones) has a login account.
  const scUserCommitteeIds = new Set(
    db.users
      .filter((u) => u.role === "subcommittee")
      .map((u) => Number(u.subCommitteeId)),
  );
  let nextUserId = Math.max(0, ...db.users.map((u) => Number(u.id) || 0)) + 1;
  db.subCommittees.forEach((c) => {
    if (!scUserCommitteeIds.has(Number(c.id))) {
      db.users.push({
        id: nextUserId++,
        role: "subcommittee",
        name: c.name,
        username: c.username,
        password: c.password,
        subCommitteeId: c.id,
      });
    }
  });
  db.members ||= [];
  db.payments ||= [];
  db.donations ||= [];
  db.activities ||= [];
  db.submissions ||= [];
  db.subCommitteeCollections ||= [];
  db.subCommitteeCollectionPayments ||= [];
  db.subCommitteeSubmissions ||= [];
  db.subCommitteeAllocations ||= [];
  db.subCommitteeExpenses ||= [];
  db.verifiedUsers ||= [];
  db.members.forEach((m) => {
    m.countryCode ||= "+91";
    m.maritalStatus ||= "Single";
    // Preserve existing records while giving the new collectability setting
    // a safe default for older data.
    if (m.collectable == null) m.collectable = Number(m.requiredAmount || 0) > 0;
  });
  db.donations.forEach((d) => {
    d.sourceType ||= "Member";
    d.paymentMode ||= "Cash";
    d.status ||= "completed";
  });
  db.payments.forEach((p) => {
    p.status ||= "completed";
  });
  db.submissions.forEach((x) => {
    if (x.memberAmount == null && x.donationAmount == null) {
      x.memberAmount = Number(x.amount || 0);
      x.donationAmount = 0;
    }
    x.memberAmount = Number(x.memberAmount || 0);
    x.donationAmount = Number(x.donationAmount || 0);
    x.amount = x.memberAmount + x.donationAmount;
  });
  db.subCommitteeCollections.forEach((c) => {
    c.sourceType ||= "Person";
    c.paymentMode ||= "Cash";
  });
  db.subCommitteeExpenses.forEach((x) => {
    x.billName ||= "";
    x.billDataUrl ||= "";
  });
  localStorage.setItem(FCMS_KEY, JSON.stringify(db));
  return db;
}
function getDB() {
  return seedDemoData();
}
function saveDB(db) {
  FCMS_MEMBER_STATS_CACHE.delete(db);
  localStorage.setItem(FCMS_KEY, JSON.stringify(db));
  // Provide a shared success notification for CRUD pages that do not have a
  // page-specific toast. The UI layer suppresses this fallback when a clearer
  // notification is displayed by the page itself.
  if (typeof fcmsScheduleSavedActivityToast === "function") {
    fcmsScheduleSavedActivityToast(db.activities?.[0]);
  }
  // Remember that the current page has just successfully persisted data.
  // On a browser Back navigation, the submitted form page is skipped so
  // stale values are never restored. Normal reloads clear this marker.
  try {
    sessionStorage.setItem(
      "fcms_last_saved_page",
      JSON.stringify({ path: location.pathname + location.search, at: Date.now() }),
    );
  } catch (_) {}
}
function uid(prefix = "id") {
  return (
    prefix +
    "_" +
    Date.now().toString(36) +
    "_" +
    Math.random().toString(36).slice(2, 7)
  );
}
function money(n) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(n) || 0);
}
function escapeHTML(v) {
  return String(v ?? "").replace(
    /[&<>"']/g,
    (m) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;",
      })[m],
  );
}
function normalizePhone(v) {
  return String(v ?? "").replace(/\D/g, "");
}
function formatPhone(v, countryCode = "+91") {
  const digits = normalizePhone(v);
  return digits ? `${countryCode || "+91"} ${digits}` : "";
}
function requiredAmount(gender, age, collectable = true) {
  // Required contribution is calculated from the current form values.
  // Normalize inputs so typing/pasting an age or gender in a slightly
  // different format cannot make the amount intermittently disappear.
  const normalizedAge = Number.parseInt(String(age ?? "").trim(), 10);
  const normalizedGender = String(gender ?? "").trim().toLowerCase();
  if (!Number.isFinite(normalizedAge) || normalizedAge < 21 || collectable === false) return 0;
  if (normalizedGender === "male") return 8000;
  if (normalizedGender === "female") return 2000;
  return 0;
}
function statusFor(required, paid) {
  required = Number(required) || 0;
  paid = Number(paid) || 0;
  if (required <= 0) return "Green";
  const pct = (paid / required) * 100;
  if (pct >= 100) return "Green";
  if (pct >= 80) return "Yellow";
  return "Red";
}
function percent(required, paid) {
  return Math.min(100, required > 0 ? (paid / required) * 100 : 100);
}
function memberStats(member, db = getDB()) {
  let index = FCMS_MEMBER_STATS_CACHE.get(db);
  if (!index) {
    index = new Map();
    (db.payments || []).forEach((payment) => {
      const current = index.get(payment.memberId) || { paid:0, held:0 };
      if (payment.status === "hold") current.held += Number(payment.amount || 0);
      else current.paid += Number(payment.amount || 0);
      index.set(payment.memberId, current);
    });
    FCMS_MEMBER_STATS_CACHE.set(db, index);
  }
  const totals = index.get(member.id) || { paid:0, held:0 };
  const paid = totals.paid;
  const held = totals.held;
  const req = Number(member.requiredAmount) || 0;
  return {
    paid,
    held,
    balance: Math.max(0, req - paid),
    status: statusFor(req, paid),
    percent: percent(req, paid),
  };
}
function makeMemberCode(pradeshikamId, db = getDB()) {
  const prefix = `P${String(pradeshikamId).padStart(2, "0")}-`;
  const nums = db.members
    .filter((m) => m.pradeshikamId === Number(pradeshikamId))
    .map((m) => Number(String(m.memberCode || "").split("-")[1]))
    .filter(Boolean);
  const next = (nums.length ? Math.max(...nums) : 0) + 1;
  return prefix + String(next).padStart(4, "0");
}
function houseKey(v) {
  return String(v || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
}
function houseMembersFor(member, db = getDB()) {
  if (!member) return [];
  const key = houseKey(member.houseNumber);
  return db.members.filter(
    (m) =>
      m.pradeshikamId === member.pradeshikamId &&
      houseKey(m.houseNumber) === key,
  );
}
function donationTotal(pradeshikamId = null, db = getDB()) {
  return (db.donations || [])
    .filter(
      (d) =>
        d.status !== "hold" &&
        (pradeshikamId == null ||
          Number(d.pradeshikamId) === Number(pradeshikamId)),
    )
    .reduce((a, d) => a + Number(d.amount || 0), 0);
}
function memberCollectionTotal(pradeshikamId = null, db = getDB()) {
  return (db.payments || [])
    .filter((p) => {
      const m = db.members.find((x) => x.id === p.memberId);
      return (
        !!m &&
        p.status !== "hold" &&
        (pradeshikamId == null ||
          Number(m.pradeshikamId) === Number(pradeshikamId))
      );
    })
    .reduce((a, p) => a + Number(p.amount || 0), 0);
}
function totalReceived(pradeshikamId = null, db = getDB()) {
  return (
    memberCollectionTotal(pradeshikamId, db) + donationTotal(pradeshikamId, db)
  );
}
function subCommitteeCollectionPaymentTotal(subCommitteeCollectionId = null, db = getDB()) {
  return (db.subCommitteeCollectionPayments || [])
    .filter((p) => subCommitteeCollectionId == null || p.collectionId === subCommitteeCollectionId)
    .reduce((a, p) => a + Number(p.amount || 0), 0);
}
function subCommitteeCollectionTotal(subCommitteeId = null, db = getDB()) {
  const base = (db.subCommitteeCollections || [])
    .filter(
      (c) =>
        subCommitteeId == null ||
        Number(c.subCommitteeId) === Number(subCommitteeId),
    )
    .reduce((a, c) => a + Number(c.amount || 0), 0);
  const ids = new Set((db.subCommitteeCollections || []).filter((c) => subCommitteeId == null || Number(c.subCommitteeId) === Number(subCommitteeId)).map((c) => c.id));
  return base + (db.subCommitteeCollectionPayments || []).filter((p) => ids.has(p.collectionId)).reduce((a, p) => a + Number(p.amount || 0), 0);
}
function subCommitteeSubmittedTotal(subCommitteeId = null, db = getDB()) {
  return (db.subCommitteeSubmissions || [])
    .filter(
      (x) =>
        subCommitteeId == null ||
        Number(x.subCommitteeId) === Number(subCommitteeId),
    )
    .reduce((a, x) => a + Number(x.amount || 0), 0);
}

// Money already received by the Main Office consists of manually submitted cash
// plus electronic payments that the office has verified in its own account.
function pradeshikamOfficeSubmittedTotal(pradeshikamId = null, db = getDB()) {
  const cash = (db.submissions || [])
    .filter((x) => pradeshikamId == null || Number(x.pradeshikamId) === Number(pradeshikamId))
    .reduce(
      (sum, x) => sum + Number(x.amount || Number(x.memberAmount || 0) + Number(x.donationAmount || 0)),
      0,
    );
  return cash + fcmsVerifiedElectronicTotalForPradeshikam(pradeshikamId, "all", db);
}

function subCommitteeOfficeSubmittedTotal(subCommitteeId = null, db = getDB()) {
  return (
    subCommitteeSubmittedTotal(subCommitteeId, db) +
    fcmsVerifiedElectronicTotalForSubCommittee(subCommitteeId, db)
  );
}
function subCommitteeAllocationTotal(subCommitteeId = null, db = getDB()) {
  return (db.subCommitteeAllocations || [])
    .filter((x) => {
      if (subCommitteeId == null) return true;
      const id = x.subCommitteeId ?? x.committeeId;
      return id !== "other" && Number(id) === Number(subCommitteeId);
    })
    .reduce((a, x) => a + Number(x.amount || 0), 0);
}
function subCommitteeExpenseTotal(subCommitteeId = null, db = getDB()) {
  return (db.subCommitteeExpenses || [])
    .filter(
      (x) =>
        subCommitteeId == null ||
        Number(x.subCommitteeId) === Number(subCommitteeId),
    )
    .reduce((a, x) => a + Number(x.amount || 0), 0);
}

// Stable aliases used by the sub-committee dashboard/report pages.
function subCommitteeTotal(subCommitteeId = null, db = getDB()) {
  return subCommitteeCollectionTotal(subCommitteeId, db);
}
function subCommitteeSubmissionTotal(subCommitteeId = null, db = getDB()) {
  return subCommitteeSubmittedTotal(subCommitteeId, db);
}
function subCommitteeCollectionRemaining(subCommitteeId = null, db = getDB()) {
  return Math.max(0, subCommitteeCollectionTotal(subCommitteeId, db) - subCommitteeSubmittedTotal(subCommitteeId, db));
}
function subCommitteeExpenseBalance(subCommitteeId = null, db = getDB()) {
  return Math.max(0, subCommitteeAllocationTotal(subCommitteeId, db) - subCommitteeExpenseTotal(subCommitteeId, db));
}
function subCommitteeBalance(subCommitteeId = null, db = getDB()) {
  // Backward-compatible total view: collection cash remaining plus the separate expense budget remaining.
  return subCommitteeCollectionRemaining(subCommitteeId, db) + subCommitteeExpenseBalance(subCommitteeId, db);
}
function mainOfficeNetBalance(
  db = getDB(),
  excludeAllocationId = null,
  excludeMainExpenseId = null,
  excludeSubmissionId = null,
  excludeSubmissionType = null,
) {
  const allocated = (db.subCommitteeAllocations || [])
    .filter((x) => x.id !== excludeAllocationId)
    .reduce((a, x) => a + Number(x.amount || 0), 0);
  const mainExpenses = (db.mainExpenses || [])
    .filter((x) => x.id !== excludeMainExpenseId)
    .reduce((a, x) => a + Number(x.amount || 0), 0);
  const otherExpenses = (db.subCommitteeExpenses || [])
    .filter((x) => String(x.subCommitteeId) === "other" && x.id !== excludeMainExpenseId)
    .reduce((a, x) => a + Number(x.amount || 0), 0);
  const received = mainOfficeReceivedTotal(db, excludeSubmissionId, excludeSubmissionType);
  return received - mainExpenses - otherExpenses - allocated;
}
function mainOfficeReceivedTotal(db = getDB(), excludeSubmissionId = null, excludeSubmissionType = null) {
  const pradeshikamSubmissions = (db.submissions || []).reduce(
    (a, x) => a + ((excludeSubmissionType === "pradeshikam" && x.id === excludeSubmissionId) ? 0 : Number(x.amount || Number(x.memberAmount || 0) + Number(x.donationAmount || 0))),
    0,
  );
  const subCommitteeSubmissions = (db.subCommitteeSubmissions || []).reduce(
    (a, x) => a + ((excludeSubmissionType === "subcommittee" && x.id === excludeSubmissionId) ? 0 : Number(x.amount || 0)),
    0,
  );
  const verifiedElectronic = fcmsVerifiedElectronicTotal(
    fcmsElectronicRecords(db).map((x) => x.record),
  );
  return pradeshikamSubmissions + subCommitteeSubmissions + verifiedElectronic;
}
function mainOfficeExpenseTotal(db = getDB()) {
  return (db.mainExpenses || []).reduce((a, x) => a + Number(x.amount || 0), 0);
}
function mainOfficeAvailableBalance(
  db = getDB(),
  excludeAllocationId = null,
  excludeMainExpenseId = null,
  excludeSubmissionId = null,
  excludeSubmissionType = null,
) {
  return Math.max(0, mainOfficeNetBalance(db, excludeAllocationId, excludeMainExpenseId, excludeSubmissionId, excludeSubmissionType));
}
function mainOfficeDeficit(db = getDB()) {
  return Math.max(0, -mainOfficeNetBalance(db));
}
function subCommitteeCollectionSnapshot(c) {
  if (!c) return null;
  return {
    receiptNumber: c.receiptNumber,
    amount: Number(c.amount),
    sourceType: c.sourceType || "Person",
    donorName: c.donorName || "",
    memberId: c.memberId || null,
    place: c.place || "",
    subCommitteeId: c.subCommitteeId,
    paymentMode: c.paymentMode || "",
    transactionId: c.transactionId || "",
    date: c.date || c.createdAt,
    remarks: c.remarks || "",
  };
}
function subCommitteeExpenseSnapshot(x) {
  if (!x) return null;
  return {
    amount: Number(x.amount),
    description: x.description || "",
    expensePurpose: x.expensePurpose || "",
    subCommitteeId: x.subCommitteeId,
    date: x.date || x.createdAt,
    remarks: x.remarks || "",
    billName: x.billName || "",
  };
}
function currentSession() {
  return JSON.parse(sessionStorage.getItem(SESSION_KEY) || "null");
}
function setSession(user) {
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(user));
}
function clearSession() {
  sessionStorage.removeItem(SESSION_KEY);
}
function actorLabel() {
  const s = currentSession();
  return s ? (s.name || (s.role === "admin" ? "Main Committee" : "User")) : "System";
}
function actorContext(db) {
  const s = currentSession();
  if (!s) return { actorUserId:null, actorPhone:null, actorPradeshikamId:null, actorSubCommitteeId:null, actorBelongsTo:"System" };
  const pr = db?.pradeshikams?.find(p => Number(p.id) === Number(s.pradeshikamId));
  const sc = db?.subCommittees?.find(c => Number(c.id) === Number(s.subCommitteeId));
  return {
    actorUserId: s.id || null,
    actorPhone: s.verifiedPhone || null,
    actorPradeshikamId: s.role === "pradeshikam" ? (s.pradeshikamId || null) : null,
    actorSubCommitteeId: s.role === "subcommittee" ? (s.subCommitteeId || null) : null,
    actorBelongsTo: s.role === "admin" ? "Main Committee" : s.role === "pradeshikam" ? (pr?.name || s.name || "Pradeshikam") : s.role === "subcommittee" ? (sc?.name || s.name || "Sub Committee") : "System",
  };
}
function addActivity(
  db,
  {
    action,
    entityType,
    entityId,
    memberId,
    pradeshikamId,
    subCommitteeId = null,
    summary,
    details,
    oldValue = null,
    newValue = null,
  },
) {
  db.activities ||= [];
  const actorMeta = actorContext(db);
  db.activities.unshift({
    id: uid("act"),
    timestamp: new Date().toISOString(),
    actor: actorLabel(),
    actorRole: currentSession()?.role || "system",
    action,
    entityType,
    entityId,
    memberId: memberId || null,
    pradeshikamId: pradeshikamId || null,
    subCommitteeId: subCommitteeId || newValue?.subCommitteeId || newValue?.committeeId || oldValue?.subCommitteeId || oldValue?.committeeId || null,
    summary,
    details: details || "",
    oldValue: oldValue === undefined ? null : oldValue,
    newValue: newValue === undefined ? null : newValue,
    actorPhone: actorMeta.actorPhone,
    actorUserId: actorMeta.actorUserId,
    actorPradeshikamId: actorMeta.actorPradeshikamId,
    actorSubCommitteeId: actorMeta.actorSubCommitteeId,
    actorBelongsTo: actorMeta.actorBelongsTo,
  });
}

function restoreDeletedActivity(db, activityId) {
  const a = (db.activities || []).find(x => x.id === activityId);
  if (!a || !String(a.action || "").includes("Deleted") || !a.oldValue) return { ok:false, message:"This activity cannot be restored." };
  const map = {
    member:"members", payment:"payments", donation:"donations", submission:"submissions",
    subCommitteeCollection:"subCommitteeCollections", subCommitteeCollectionPayment:"subCommitteeCollectionPayments",
    subCommitteeAllocation:"subCommitteeAllocations", subcommitteeAllocation:"subCommitteeAllocations",
    subCommitteeExpense:"subCommitteeExpenses", subcommitteeExpense:"subCommitteeExpenses",
    subCommitteeSubmission:"subCommitteeSubmissions"
  };
  const key = map[a.entityType];
  if (!key) return { ok:false, message:"Restore is not supported for this record type." };
  db[key] ||= [];
  if (db[key].some(x => String(x.id) === String(a.entityId))) return { ok:false, message:"This record is already present." };
  const restored = { ...a.oldValue, id:a.entityId };
  const relatedPayments = Array.isArray(restored.relatedPayments) ? restored.relatedPayments.map(x => ({...x})) : [];
  delete restored.relatedPayments;
  if (a.entityType === "payment" && !restored.memberId) restored.memberId = a.memberId || null;
  if (a.entityType === "member" && restored.pradeshikamId == null) restored.pradeshikamId = a.pradeshikamId || null;
  if (String(a.entityType).toLowerCase().includes("subcommittee") && restored.subCommitteeId == null) restored.subCommitteeId = a.subCommitteeId || null;
  restored.restoredAt = new Date().toISOString();
  restored.restoredBy = actorLabel();
  db[key].push(restored);
  if (a.entityType === "subCommitteeCollection" && relatedPayments.length) {
    db.subCommitteeCollectionPayments ||= [];
    relatedPayments.forEach(p => { if (!db.subCommitteeCollectionPayments.some(x => String(x.id) === String(p.id))) db.subCommitteeCollectionPayments.push(p); });
  }
  addActivity(db,{
    action:`${entityTypeRestoreLabel(a.entityType)} Restored`, entityType:a.entityType, entityId:a.entityId,
    memberId:a.memberId, pradeshikamId:a.pradeshikamId, subCommitteeId:a.subCommitteeId,
    summary:`Restored deleted record: ${a.summary || a.entityType}`, details:`Restored from Activity History after confirmation.`, newValue:restored
  });
  return { ok:true, restored };
}
function entityTypeRestoreLabel(type) {
  const map={member:"Member",payment:"Payment",donation:"Donation",submission:"Submission",subCommitteeCollection:"Sub Committee Collection",subCommitteeCollectionPayment:"Sub Committee Collection Payment",subCommitteeAllocation:"Sub Committee Allocation",subcommitteeAllocation:"Sub Committee Allocation",subCommitteeExpense:"Sub Committee Expense",subcommitteeExpense:"Sub Committee Expense",subCommitteeSubmission:"Sub Committee Submission"};
  return map[type] || "Record";
}
function memberSnapshot(m) {
  if (!m) return null;
  return {
    memberCode: m.memberCode,
    name: m.name,
    gender: m.gender,
    age: m.age,
    phone: m.phone || "",
    countryCode: m.countryCode || "+91",
    maritalStatus: m.maritalStatus || "Single",
    houseNumber: m.houseNumber || "",
    pradeshikamId: m.pradeshikamId,
    requiredAmount: m.requiredAmount,
    collectable: m.collectable !== false,
    receiptNumber: m.receiptNumber || "",
  };
}
function paymentSnapshot(p) {
  if (!p) return null;
  return {
    receiptNumber: p.receiptNumber,
    masterReceiptNumber: p.masterReceiptNumber || null,
    amount: Number(p.amount),
    paymentMode: p.paymentMode,
    transactionId: p.transactionId || "",
    status: p.status || "completed",
    remarks: p.remarks || "",
    paymentDate: p.paymentDate,
  };
}
function donationSnapshot(d) {
  if (!d) return null;
  return {
    receiptNumber: d.receiptNumber,
    amount: Number(d.amount),
    sourceType: d.sourceType || "Member",
    donorName: d.donorName || "",
    pradeshikamId: d.pradeshikamId,
    paymentMode: d.paymentMode || "",
    transactionId: d.transactionId || "",
    status: d.status || "completed",
    date: d.date || d.createdAt,
    remarks: d.remarks || "",
  };
}
function resetPrototype() {
  localStorage.removeItem(FCMS_KEY);
  localStorage.removeItem("fcms_verified_devices_v1");
  localStorage.removeItem("fcms_verified_devices_v2");
  location.href = "index.html";
}


/* FCMS UPI settlement helpers */
function fcmsIsUPI(record){ return String(record?.paymentMode || "").toUpperCase() === "UPI"; }
function fcmsUpiStatus(record){
  if(!fcmsIsUPI(record)) return "";
  return record.upiVerificationStatus || "pending";
}
function fcmsMarkNewUpiPending(record){
  if(fcmsIsUPI(record)){
    let session = null;
    try { session = typeof currentSession === "function" ? currentSession() : null; } catch (_) {}
    if(session && session.role === "admin"){
      record.upiVerificationStatus = "verified";
      record.upiVerifiedAt = new Date().toISOString();
      record.upiVerifiedByUserId = session.id || null;
      try { record.upiVerifiedBy = typeof actorLabel === "function" ? actorLabel() : (session.name || "Main Committee"); }
      catch (_) { record.upiVerifiedBy = session.name || "Main Committee"; }
      record.upiRejectionReason = "";
      record.upiAutoVerified = true;
    } else {
      record.upiVerificationStatus = "pending";
      record.upiVerifiedAt = null;
      record.upiVerifiedByUserId = null;
      record.upiVerifiedBy = "";
      record.upiRejectionReason = "";
      record.upiAutoVerified = false;
    }
  }
  return record;
}
function fcmsAllMoneyRecords(db=getDB()){
  const out=[];
  (db.payments||[]).forEach(r=>out.push({kind:"Member Payment",collection:"payment",record:r,pradeshikamId:db.members.find(m=>m.id===r.memberId)?.pradeshikamId||null,subCommitteeId:null,payer:db.members.find(m=>m.id===r.memberId)?.name||"Member",date:r.paymentDate||r.createdAt}));
  (db.donations||[]).forEach(r=>out.push({kind:"Donation",collection:"donation",record:r,pradeshikamId:r.pradeshikamId||null,subCommitteeId:null,payer:r.donorName||"Donor",date:r.date||r.createdAt}));
  (db.subCommitteeCollections||[]).forEach(r=>out.push({kind:"Sub Committee Collection",collection:"subCommitteeCollection",record:r,pradeshikamId:null,subCommitteeId:r.subCommitteeId||null,payer:r.donorName||"Payer",date:r.date||r.createdAt}));
  (db.subCommitteeCollectionPayments||[]).forEach(r=>{const c=(db.subCommitteeCollections||[]).find(x=>x.id===r.collectionId);out.push({kind:"Sub Committee Payment",collection:"subCommitteeCollectionPayment",record:r,pradeshikamId:null,subCommitteeId:r.subCommitteeId||c?.subCommitteeId||null,payer:c?.donorName||"Payer",date:r.date||r.createdAt});});
  return out;
}
function fcmsUpiRecords(db=getDB()){ return fcmsAllMoneyRecords(db).filter(x=>fcmsIsUPI(x.record)); }
function fcmsVerifiedUpiTotalForPradeshikam(pradeshikamId, kind="all", db=getDB()){
  return fcmsUpiRecords(db).filter(x=>Number(x.pradeshikamId)===Number(pradeshikamId)&&fcmsUpiStatus(x.record)==="verified"&&(kind==="all"||(kind==="member"&&x.collection==="payment")||(kind==="donation"&&x.collection==="donation"))).reduce((a,x)=>a+Number(x.record.amount||0),0);
}
function fcmsVerifiedUpiTotalForSubCommittee(subCommitteeId, db=getDB()){
  return fcmsUpiRecords(db).filter(x=>Number(x.subCommitteeId)===Number(subCommitteeId)&&fcmsUpiStatus(x.record)==="verified").reduce((a,x)=>a+Number(x.record.amount||0),0);
}
function fcmsVerifiedElectronicTotalForPradeshikam(pradeshikamId=null, kind="all", db=getDB()){
  return fcmsElectronicRecords(db)
    .filter(x=>x.pradeshikamId!=null&&(pradeshikamId==null||Number(x.pradeshikamId)===Number(pradeshikamId))&&x.status==="verified"&&(kind==="all"||(kind==="member"&&x.collection==="payment")||(kind==="donation"&&x.collection==="donation")))
    .reduce((sum,x)=>sum+Number(x.record.amount||0),0);
}
function fcmsVerifiedElectronicTotalForSubCommittee(subCommitteeId=null, db=getDB()){
  return fcmsElectronicRecords(db)
    .filter(x=>x.subCommitteeId!=null&&(subCommitteeId==null||Number(x.subCommitteeId)===Number(subCommitteeId))&&x.status==="verified")
    .reduce((sum,x)=>sum+Number(x.record.amount||0),0);
}
function fcmsCashCollectedForPradeshikam(pradeshikamId, kind="all", db=getDB()){
  return fcmsAllMoneyRecords(db).filter(x=>Number(x.pradeshikamId)===Number(pradeshikamId)&&!fcmsIsUPI(x.record)&&(kind==="all"||(kind==="member"&&x.collection==="payment")||(kind==="donation"&&x.collection==="donation"))&&x.record.status!=="hold").reduce((a,x)=>a+Number(x.record.amount||0),0);
}
function fcmsCashCollectedForSubCommittee(subCommitteeId, db=getDB()){
  return fcmsAllMoneyRecords(db).filter(x=>Number(x.subCommitteeId)===Number(subCommitteeId)&&!fcmsIsUPI(x.record)).reduce((a,x)=>a+Number(x.record.amount||0),0);
}


/* FCMS Receipt Book helpers: 50 receipts per book, Books 1-100 (1-5000). */
const FCMS_RECEIPTS_PER_BOOK = 50;
const FCMS_MAX_RECEIPT_BOOKS = 200;
function fcmsReceiptNumberValue(value){
  const raw=String(value??"").trim();
  if(!/^\d+$/.test(raw)) return null;
  const n=Number(raw);
  return Number.isInteger(n)&&n>0?n:null;
}
function fcmsReceiptBookInfo(value){
  const receipt=fcmsReceiptNumberValue(value);
  if(!receipt) return null;
  const book=Math.ceil(receipt/FCMS_RECEIPTS_PER_BOOK);
  if(book<1||book>FCMS_MAX_RECEIPT_BOOKS) return {receipt,book,outOfRange:true,start:(book-1)*FCMS_RECEIPTS_PER_BOOK+1,end:book*FCMS_RECEIPTS_PER_BOOK};
  return {receipt,book,outOfRange:false,start:(book-1)*FCMS_RECEIPTS_PER_BOOK+1,end:book*FCMS_RECEIPTS_PER_BOOK};
}


/* FCMS RECEIPT BOOK LIMIT */
const FCMS_DEFAULT_RECEIPT_BOOK_LIMIT = 100;

function fcmsReceiptBookLimit(dbArg){
  const source = dbArg || (typeof getDB === "function" ? getDB() : {});
  const raw = Number(source?.settings?.receiptBookLimit);
  if(Number.isInteger(raw) && raw >= 1 && raw <= FCMS_MAX_RECEIPT_BOOKS) return raw;
  return FCMS_DEFAULT_RECEIPT_BOOK_LIMIT;
}

function fcmsMaxAllowedReceiptNumber(dbArg){
  return fcmsReceiptBookLimit(dbArg) * FCMS_RECEIPTS_PER_BOOK;
}

function fcmsReceiptAllowed(value, dbArg){
  const n = fcmsReceiptNumberValue(value);
  if(!n) return true;
  return n <= fcmsMaxAllowedReceiptNumber(dbArg);
}

function fcmsSetReceiptBookLimit(limit){
  const n = Number(limit);
  if(!Number.isInteger(n) || n < 1 || n > FCMS_MAX_RECEIPT_BOOKS){
    throw new Error(`Receipt book limit must be between 1 and ${FCMS_MAX_RECEIPT_BOOKS}.`);
  }

  const db = getDB();
  db.settings = db.settings || {};
  const oldLimit = fcmsReceiptBookLimit(db);
  db.settings.receiptBookLimit = n;

  if(typeof addActivity === "function"){
    addActivity(db, {
      action: "RECEIPT_BOOK_LIMIT_CHANGED",
      entityType: "settings",
      entityId: "receiptBookLimit",
      summary: `Receipt book limit changed from Book ${oldLimit} to Book ${n}`,
      details: `Maximum allowed receipt number changed from ${oldLimit * FCMS_RECEIPTS_PER_BOOK} to ${n * FCMS_RECEIPTS_PER_BOOK}.`,
      oldValue: {
        receiptBookLimit: oldLimit,
        maxReceiptNumber: oldLimit * FCMS_RECEIPTS_PER_BOOK
      },
      newValue: {
        receiptBookLimit: n,
        maxReceiptNumber: n * FCMS_RECEIPTS_PER_BOOK
      }
    });
  }

  saveDB(db);
  return { oldLimit, newLimit: n };
}


/* FCMS UPI / BANK VERIFICATION */
function fcmsIsBank(record){
  const mode = String(record?.mode || record?.paymentMode || record?.method || "").trim().toLowerCase();
  return mode === "bank" || mode === "bank transfer" || mode === "banktransfer" || mode === "transfer";
}

function fcmsNeedsOfficeVerification(record){
  return fcmsIsUPI(record) || fcmsIsBank(record);
}

function fcmsVerificationStatus(record){
  if(fcmsIsUPI(record)) return fcmsUpiStatus(record);
  if(fcmsIsBank(record)) return String(record?.bankVerificationStatus || record?.verificationStatus || "pending").toLowerCase();
  return "not_required";
}

function fcmsMarkNewElectronicPending(record){
  if(!record || !fcmsNeedsOfficeVerification(record)) return record;

  const s = typeof currentSession === "function" ? currentSession() : null;
  const isAdmin = s?.role === "admin";

  if(fcmsIsUPI(record)){
    if(typeof fcmsMarkNewUpiPending === "function") return fcmsMarkNewUpiPending(record);
  }

  if(fcmsIsBank(record)){
    if(isAdmin){
      record.bankVerificationStatus = "verified";
      record.bankVerifiedAt = new Date().toISOString();
      record.bankVerifiedByUserId = s?.verifiedUserId || s?.userId || null;
      record.bankVerifiedBy = s?.name || "Main Committee";
      record.bankAutoVerified = true;
    }else{
      record.bankVerificationStatus = "pending";
      record.bankAutoVerified = false;
    }
  }
  return record;
}

function fcmsElectronicRecords(dbArg){
  const db = dbArg || getDB();

  return fcmsAllMoneyRecords(db)
    .filter(x => fcmsNeedsOfficeVerification(x.record))
    .map(x => {
      const r = x.record || {};

      const pradeshikamId =
        x.pradeshikamId ??
        r.pradeshikamId ??
        r.pradeshikamID ??
        null;

      const subCommitteeId =
        x.subCommitteeId ??
        r.subCommitteeId ??
        r.subcommitteeId ??
        r.committeeId ??
        null;

      const pradeshikamName =
        x.pradeshikamName ||
        r.pradeshikamName ||
        (pradeshikamId
          ? (db.pradeshikams || []).find(p => String(p.id) === String(pradeshikamId))?.name
          : "") ||
        "";

      const subCommitteeName =
        x.subCommitteeName ||
        r.subCommitteeName ||
        r.subcommitteeName ||
        r.committeeName ||
        (subCommitteeId
          ? (db.subCommittees || []).find(c => String(c.id) === String(subCommitteeId))?.name
          : "") ||
        "";

      return {
        ...x,
        pradeshikamId,
        subCommitteeId,
        pradeshikamName,
        subCommitteeName,
        committeeType: pradeshikamId ? "pradeshikam" : subCommitteeId ? "subcommittee" : "main",
        committeeId: pradeshikamId || subCommitteeId || null,
        committeeName: pradeshikamId
          ? pradeshikamName
          : subCommitteeId
            ? subCommitteeName
            : "Main Committee",
        mode: fcmsIsUPI(r) ? "UPI" : "Bank",
        status: fcmsVerificationStatus(r)
      };
    });
}


/* verified electronic payments compatibility */
function fcmsVerifiedElectronicTotal(records){
  return (records || []).reduce((sum, r) => {
    if(!fcmsNeedsOfficeVerification(r)) return sum;
    return fcmsVerificationStatus(r) === "verified" ? sum + Number(r.amount || 0) : sum;
  }, 0);
}


/* Published receipt-book helpers */
function fcmsPublishedBookInfo(value, dbArg){
  const info = fcmsReceiptBookInfo(value);
  if(!info) return null;

  const limit = fcmsReceiptBookLimit(dbArg || getDB());
  return {
    ...info,
    published: Number(info.book) <= Number(limit),
    publishedLimit: Number(limit),
    maxPublishedReceipt: Number(limit) * FCMS_RECEIPTS_PER_BOOK
  };
}

function fcmsReceiptBookPublished(value, dbArg){
  const info = fcmsPublishedBookInfo(value, dbArg);
  return !info || info.published;
}
