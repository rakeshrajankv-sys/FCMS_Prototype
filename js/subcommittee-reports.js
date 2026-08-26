const ctx = getCommitteeContext();
if (ctx) {
  const { s, committee } = ctx,
    db = getDB();
  markActive();
  const collections = subCommitteeRows(db, committee.id),
    subs = (db.subCommitteeSubmissions || []).filter(
      (x) => Number(x.subCommitteeId) === Number(committee.id),
    ),
    expenses = (db.subCommitteeExpenses || []).filter(
      (x) => Number(x.subCommitteeId) === Number(committee.id),
    );
  document.getElementById("page-content").innerHTML =
    `${pageTitle(`${escapeHTML(committee.name)} Report`, "", `<button id="export" class="btn btn-primary export-icon-btn" title="Download CSV" aria-label="Download CSV"><i class="bi bi-download" aria-hidden="true"></i></button>`)}<div class="row g-3 mb-4">${card("bi-cash-stack", "Collections", subCommitteeTotal(committee.id, db))}${card("bi-bank", "Submissions", subCommitteeSubmissionTotal(committee.id, db))}${card("bi-receipt", "Expenses", subCommitteeExpenseTotal(committee.id, db))}${card("bi-cash-stack", "Collection Remaining", subCommitteeCollectionRemaining(committee.id, db))}${card("bi-wallet2", "Expense Balance", subCommitteeExpenseBalance(committee.id, db))}</div><div class="panel"><div class="panel-title mb-3">Collections</div>${collections.length ? `<div class="table-responsive"><table class="table"><thead><tr><th>Date</th><th>Name</th><th>Fund Given By</th><th>Place</th><th>Receipt</th><th>Amount</th></tr></thead><tbody>${collections.map((x) => `<tr><td>${x.date}</td><td>${escapeHTML(x.donorName || x.name || "-")}</td><td>${escapeHTML(x.fundGivenBy || "-")}</td><td>${escapeHTML(x.place || "-")}</td><td>${escapeHTML(x.receiptNumber)}</td><td>${money(x.amount)}</td></tr>`).join("")}</tbody></table></div>` : `<div class="empty-state">No records.</div>`}</div>`;
  function card(i, l, v) {
    return `<div class="col-6 col-xl-3"><div class="stat-card"><div class="stat-icon"><i class="bi ${i}"></i></div><div class="stat-label">${l}</div><div class="stat-value">${money(v)}</div></div></div>`;
  }
  document.getElementById("export").onclick = () =>
    exportCSV(
      collections.map((x) => ({
        Date: x.date,
        Committee: committee.name,
        Name: x.donorName || x.name || "",
        FundGivenBy: x.fundGivenBy || "",
        Phone: subCommitteePhoneLabel(x, db),
        Place: x.place,
        Receipt: x.receiptNumber,
        Amount: x.amount,
        PaymentMode: x.paymentMode,
        Remarks: x.remarks || "",
      })),
      `${committee.id}-report.csv`,
    );
}
