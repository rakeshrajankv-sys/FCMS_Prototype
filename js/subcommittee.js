const ctx = getCommitteeContext();
if (ctx) {
  const { s, committee } = ctx,
    db = getDB();
  markActive();
  const allocated = subCommitteeAllocationTotal(committee.id, db),
    collected = subCommitteeTotal(committee.id, db),
    submitted = subCommitteeSubmissionTotal(committee.id, db),
    expenses = subCommitteeExpenseTotal(committee.id, db),
    balance = subCommitteeBalance(committee.id, db);
  document.getElementById("page-content").innerHTML =
    `${pageTitle(escapeHTML(committee.name), "", `<a href="subcommittee-collections.html?committee=${encodeURIComponent(committee.id)}&add=1" class="btn btn-primary"><i class="bi bi-plus-circle me-2"></i>Add Collection</a>`)}<div class="row g-3 mb-4">${statCard("bi-wallet2", "Amount Received from Main Office", money(allocated))}${statCard("bi-cash-stack", "Collected by Committee", money(collected))}${statCard("bi-bank", "Submitted to Main Committee", money(submitted))}${statCard("bi-receipt", "Expenses", money(expenses))}${statCard("bi-wallet2", "Office Amount Remaining After Expenses", money(Math.max(0, allocated - expenses)))}${statCard("bi-hourglass-split", "Total Balance with Committee", money(balance))}</div><div class="row g-3 mb-4"><div class="col-lg-8"><div class="panel h-100"><div class="panel-title mb-3">Collection Overview</div><div class="row g-3"><div class="col-6"><div class="summary-metric"><span>Total Collected</span><b>${money(collected)}</b></div></div><div class="col-6"><div class="summary-metric"><span>Available After Expenses/Submissions</span><b>${money(balance)}</b></div></div></div></div></div><div class="col-lg-4"><div class="panel h-100"><div class="panel-title mb-3">Quick Actions</div><div class="d-grid gap-2"><a class="quick-action" href="subcommittee-collections.html?committee=${encodeURIComponent(committee.id)}&add=1"><span class="quick-icon"><i class="bi bi-cash-stack"></i></span><span><b class="d-block small">Add Collection</b></span></a><a class="quick-action" href="subcommittee-submissions.html?committee=${encodeURIComponent(committee.id)}"><span class="quick-icon"><i class="bi bi-bank"></i></span><span><b class="d-block small">Submit to Main Committee</b></span></a><a class="quick-action" href="subcommittee-expenses.html?committee=${encodeURIComponent(committee.id)}"><span class="quick-icon"><i class="bi bi-receipt"></i></span><span><b class="d-block small">Add Expense</b></span></a></div></div></div></div><div class="panel"><div class="d-flex justify-content-between align-items-center mb-3"><div class="panel-title">Recent Collections</div><a href="subcommittee-collections.html?committee=${encodeURIComponent(committee.id)}&add=1" class="small">View all</a></div>${renderRecent()}</div>`;
  function statCard(icon, label, value) {
    return `<div class="col-6 col-xl-3"><div class="stat-card"><div class="stat-icon"><i class="bi ${icon}"></i></div><div class="stat-label">${label}</div><div class="stat-value">${value}</div></div></div>`;
  }
  function renderRecent() {
    const rows = subCommitteeRows(db, committee.id)
      .sort(
        (a, b) =>
          new Date(b.date || b.createdAt) - new Date(a.date || a.createdAt),
      )
      .slice(0, 8);
    if (!rows.length)
      return `<div class="empty-state"><i class="bi bi-cash-stack"></i>No collections recorded yet.</div>`;
    return `<div class="table-responsive"><table class="table"><thead><tr><th>Source</th><th>Donor</th><th>Place</th><th>Receipt</th><th>Amount</th><th>Date</th></tr></thead><tbody>${rows.map((x) => `<tr><td>${escapeHTML(x.sourceType)}</td><td>${escapeHTML(subCommitteeDonorLabel(x, db))}</td><td>${escapeHTML(x.place || "-")}</td><td>${escapeHTML(x.receiptNumber)}</td><td class="fw-semibold">${money(x.amount)}</td><td>${new Date(x.date || x.createdAt).toLocaleDateString("en-IN")}</td></tr>`).join("")}</tbody></table></div>`;
  }
}
