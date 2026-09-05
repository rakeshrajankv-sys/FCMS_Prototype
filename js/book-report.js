const db = getDB(), s = currentSession();
if (!s || s.role !== "admin") {
  location.href = "dashboard.html";
  throw new Error("Book Report is available to Main Committee only.");
}
markActive();

const ML = fcmsLang() === "ml";
const L = (en, ml) => ML ? ml : en;

function prNameBR(id) {
  const p = (db.pradeshikams || []).find(x => Number(x.id) === Number(id));
  if (!p) return "-";
  return typeof fcmsPradeshikamLabel === "function" ? fcmsPradeshikamLabel(p.name) : p.name;
}
function scNameBR(id) {
  return (db.subCommittees || []).find(x => Number(x.id) === Number(id))?.name || "-";
}
function bookInfo(value) {
  return typeof fcmsReceiptBookInfo === "function" ? fcmsReceiptBookInfo(value) : null;
}
function receiptValue(value) {
  const n = Number(String(value ?? "").trim());
  return Number.isFinite(n) ? n : null;
}
function addBookRow(target, record, type, owner, person, memberCode = "") {
  const info = bookInfo(record?.receiptNumber);
  if (!info) return;
  target.push({
    book: Number(info.book),
    receipt: receiptValue(record.receiptNumber),
    date: record.paymentDate || record.date || record.createdAt || "",
    type,
    owner,
    person: person || "-",
    memberCode: memberCode || "",
    amount: Number(record.amount || 0),
    mode: record.paymentMode || "",
    transactionId: record.transactionId || record.upiTransactionId || "",
    remarks: record.remarks || ""
  });
}
function allBookRows() {
  const out = [];
  const isAdmin = s.role === "admin";
  const isPr = s.role === "pradeshikam";
  const isSub = s.role === "subcommittee";

  if (!isSub) {
    (db.payments || []).forEach(p => {
      const m = (db.members || []).find(x => Number(x.id) === Number(p.memberId));
      if (!m) return;
      if (isPr && Number(m.pradeshikamId) !== Number(s.pradeshikamId)) return;
      addBookRow(out, p, L("Member Collection","അംഗ ശേഖരണം"), prNameBR(m.pradeshikamId), m.name, m.memberCode);
    });
  }

  return out.sort((a,b) => a.book - b.book || a.receipt - b.receipt || String(a.date).localeCompare(String(b.date)));
}

const rows = allBookRows();

document.getElementById("page-content").innerHTML = `
${pageTitle(L("Book Report","ബുക്ക് റിപ്പോർട്ട്"))}
<div class="panel mb-4">
  <div class="book-report-toolbar">
    <div class="book-report-filter">
      <label class="form-label">${L("Receipt Book","രസീത് ബുക്ക്")}</label>
      <select id="bookFilter" class="form-select">
        <option value="">${L("All Books","എല്ലാ ബുക്കുകളും")}</option>
        ${Array.from({length: FCMS_MAX_RECEIPT_BOOKS || 100}, (_,i) => `<option value="${i+1}">${L("Book","ബുക്ക്")} ${i+1}</option>`).join("")}
      </select>
    </div>
    <button id="downloadBookReport" class="btn btn-primary book-report-download" type="button"
      title="${L("Download Report","റിപ്പോർട്ട് ഡൗൺലോഡ് ചെയ്യുക")}"
      aria-label="${L("Download Report","റിപ്പോർട്ട് ഡൗൺലോഡ് ചെയ്യുക")}">
      <i class="bi bi-download"></i>
    </button>
  </div>
</div>

<div class="panel mb-4">
  <div class="panel-title mb-3">${L("Summary","സംഗ്രഹം")}</div>
  <div id="bookSummary"></div>
</div>

<div class="panel">
  <div class="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-3">
    <div class="panel-title mb-0">${L("Receipt Records","രസീത് രേഖകൾ")}</div>
    <div class="small text-muted" id="recordCount"></div>
  </div>
  <div id="bookRows"></div>
</div>`;

function selectedRows() {
  const book = document.getElementById("bookFilter").value;
  return book ? rows.filter(x => Number(x.book) === Number(book)) : rows;
}

function render() {
  const book = document.getElementById("bookFilter").value;
  const data = selectedRows();
  const amount = data.reduce((sum,x) => sum + Number(x.amount || 0), 0);
  const receiptsUsed = new Set(data.map(x => x.receipt)).size;

  document.getElementById("bookSummary").innerHTML = `
  <div class="row g-3 g-xl-4 book-summary-grid">
    <div class="col-12 col-sm-6 col-xl-3">
      <div class="stat-card book-summary-card">
        <div class="stat-label">${L("Selected","തിരഞ്ഞെടുത്തത്")}</div>
        <div class="stat-value stat-value-text book-summary-selected">${book ? `${L("Book","ബുക്ക്")} ${book}` : L("All Books","എല്ലാ ബുക്കുകളും")}</div>
      </div>
    </div>
    <div class="col-12 col-sm-6 col-xl-3">
      <div class="stat-card book-summary-card">
        <div class="stat-label">${L("Records","രേഖകൾ")}</div>
        <div class="stat-value">${data.length}</div>
      </div>
    </div>
    <div class="col-12 col-sm-6 col-xl-3">
      <div class="stat-card book-summary-card">
        <div class="stat-label">${L("Receipts Used","ഉപയോഗിച്ച രസീതുകൾ")}</div>
        <div class="stat-value">${receiptsUsed}</div>
      </div>
    </div>
    <div class="col-12 col-sm-6 col-xl-3">
      <div class="stat-card book-summary-card">
        <div class="stat-label">${L("Total Amount","ആകെ തുക")}</div>
        <div class="stat-value">${money(amount)}</div>
      </div>
    </div>
  </div>`;

  document.getElementById("recordCount").textContent = `${data.length} ${L("record(s)","രേഖകൾ")}`;

  if (!data.length) {
    document.getElementById("bookRows").innerHTML = `<div class="empty-state">${L("No receipt records found for this book.","ഈ ബുക്കിൽ രസീത് രേഖകൾ കണ്ടെത്തിയില്ല.")}</div>`;
    return;
  }

  document.getElementById("bookRows").innerHTML = `<div class="table-responsive"><table class="table book-report-table">
    <thead><tr>
      <th>${L("Book","ബുക്ക്")}</th>
      <th>${L("Receipt No.","രസീത് നമ്പർ")}</th>
      <th>${L("Date","തീയതി")}</th>
      <th>${L("Type","തരം")}</th>
      <th>${L("Pradeshikam / Committee","പ്രദേശികം / കമ്മിറ്റി")}</th>
      <th>${L("Name","പേര്")}</th>
      <th>${L("Member ID","അംഗ ഐഡി")}</th>
      <th>${L("Amount","തുക")}</th>
      <th>${L("Mode","രീതി")}</th>
      <th>${L("UPI Transaction ID","UPI ട്രാൻസാക്ഷൻ ഐഡി")}</th>
      <th>${L("Remarks","കുറിപ്പുകൾ")}</th>
    </tr></thead>
    <tbody>${data.map(x => `<tr>
      <td><span class="nidhi-book-chip">${L("Book","ബുക്ക്")} ${x.book}</span></td>
      <td><strong>${escapeHTML(String(x.receipt))}</strong></td>
      <td>${x.date ? escapeHTML(new Date(x.date).toLocaleString("en-IN")) : "-"}</td>
      <td>${escapeHTML(x.type)}</td>
      <td>${escapeHTML(x.owner)}</td>
      <td>${escapeHTML(x.person)}</td>
      <td>${escapeHTML(x.memberCode || "-")}</td>
      <td>${money(x.amount)}</td>
      <td>${escapeHTML(x.mode || "-")}</td>
      <td>${escapeHTML(x.transactionId || "-")}</td>
      <td>${escapeHTML(x.remarks || "-")}</td>
    </tr>`).join("")}</tbody>
  </table></div>`;
}

document.getElementById("bookFilter").addEventListener("change", render);

document.getElementById("downloadBookReport").addEventListener("click", () => {
  const book = document.getElementById("bookFilter").value;
  const data = selectedRows().map(x => ({
    Book: `${L("Book","ബുക്ക്")} ${x.book}`,
    ReceiptNumber: x.receipt,
    Date: x.date ? new Date(x.date).toLocaleString("en-IN") : "",
    Type: x.type,
    PradeshikamOrCommittee: x.owner,
    Name: x.person,
    MemberID: x.memberCode,
    Amount: x.amount,
    PaymentMode: x.mode,
    UPITransactionID: x.transactionId,
    Remarks: x.remarks
  }));
  exportCSV(data, book ? `nidhi-book-${book}-report.csv` : "nidhi-all-books-report.csv");
});

render();
