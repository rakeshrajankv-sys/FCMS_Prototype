const FCMS_KEY = "fcms_prototype_v1";
const SESSION_KEY = "fcms_session";

const PRADESHIKAM_NAMES = [
  "Ambangad",
  "Bara/Mukkunnoth",
  "Bedakam",
  "Chalingal",
  "Chemmanad",
  "Kalanad",
  "kuttikkol",
  "Kolathur/Maruthadukkam",
  "Kaniyamabdi",
  "Melbara",
  "Poinachi",
  "pakkam",
  "Periya",
  "Poochakkad",
  "Thokkanam/karuvakod",
  "Thiravakoli",
  "Udma",
  "chendalam",
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
  localStorage.setItem(FCMS_KEY, JSON.stringify(db));
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
  // The ₹8,000 / ₹2,000 contribution applies only when the member is
  // 21+ and has been marked as collectable.
  if (Number(age) < 21 || !collectable) return 0;
  return gender === "Male" ? 8000 : gender === "Female" ? 2000 : 0;
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
  const paid = db.payments
    .filter((p) => p.memberId === member.id && p.status !== "hold")
    .reduce((s, p) => s + Number(p.amount || 0), 0);
  const held = db.payments
    .filter((p) => p.memberId === member.id && p.status === "hold")
    .reduce((s, p) => s + Number(p.amount || 0), 0);
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
  return pradeshikamSubmissions + subCommitteeSubmissions;
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
  return s ? (s.role === "admin" ? "Main Committee" : s.name) : "System";
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
  });
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
    status: d.status || "completed",
    date: d.date || d.createdAt,
    remarks: d.remarks || "",
  };
}
function resetPrototype() {
  localStorage.removeItem(FCMS_KEY);
  location.href = "index.html";
}
