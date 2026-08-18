const db = getDB(),
  s = currentSession();
markActive();
if (s.role === "subcommittee") {
  renderSubCommitteeDashboard(db, s);
} else {
  renderMainDashboard(db, s);
}
function statCard(icon, label, value) {
  return `<div class="col-6 col-xl-3"><div class="stat-card"><div class="stat-icon"><i class="bi ${icon}"></i></div><div class="stat-label">${label}</div><div class="stat-value">${value}</div></div></div>`;
}
function renderSubCommitteeDashboard(db, s) {
  const c = db.subCommittees.find(
    (x) => Number(x.id) === Number(s.subCommitteeId),
  );
  if (!c) {
    document.getElementById("page-content").innerHTML = pageTitle(
      "Sub Committee Dashboard",
    );
    return;
  }
  const committeeIcon = c.icon || "bi-cash-coin";
  const rows = (db.subCommitteeCollections || []).filter(
    (x) => Number(x.subCommitteeId) === Number(c.id),
  );
  const collected = subCommitteeCollectionTotal(c.id, db),
    submitted = subCommitteeSubmittedTotal(c.id, db),
    received = subCommitteeAllocationTotal(c.id, db),
    spent = subCommitteeExpenseTotal(c.id, db),
    remainingAfterExpense = Math.max(0, received - spent),
    remainingToSubmit = Math.max(0, collected - submitted),
    submittedPct = collected
      ? Math.min(100, Math.round((submitted / collected) * 100))
      : 0;
  const sourceOrder = ["Member", "Person", "Shop", "Organization", "Other"];
  const bySource = sourceOrder.map((type) => ({
    type,
    count: rows.filter((x) => (x.sourceType || "Person") === type).length,
    amount: rows
      .filter((x) => (x.sourceType || "Person") === type)
      .reduce((a, x) => a + Number(x.amount || 0), 0),
  }));
  document.getElementById("page-content").innerHTML = `
${pageTitle(`${escapeHTML(c.name)} Dashboard`, "", `<a href="subcommittee-collections.html" class="btn btn-primary"><i class="bi ${committeeIcon} me-2"></i>Add Collection</a>`)}
<div class="row g-3 mb-4">
${statCard("bi-cash-stack", "Total Collected", money(collected))}
${statCard("bi-bank", "Submitted to Office", money(submitted))}
${statCard("bi-hourglass-split", "Remaining to Submit", money(remainingToSubmit))}
${statCard("bi-cash-coin", "Received from Office", money(received))}
${statCard("bi-receipt-cutoff", "Total Expenses", money(spent))}
${statCard("bi-wallet2", "Remaining After Expense", money(remainingAfterExpense))}
</div>
<div class="row g-3 mb-4">
<div class="col-lg-8"><div class="panel h-100"><div class="d-flex justify-content-between align-items-start mb-3"><div><div class="panel-title">Collection Progress</div><div class="small text-muted mt-1">Collected: <b>${money(collected)}</b> · Submitted: <b>${money(submitted)}</b> · Remaining to Submit: <b>${money(remainingToSubmit)}</b></div></div><span class="small text-muted">${submittedPct}%</span></div><div class="progress mb-3" style="height:12px"><div class="progress-bar bg-primary" style="width:${submittedPct}%"></div></div><div class="row g-2 text-center">${bySource
    .filter((x) => x.count > 0)
    .map(
      (x) =>
        `<div class="col-6 col-md-4"><div class="h5 fw-bold mb-1">${x.count}</div><span class="status-badge status-green">${escapeHTML(x.type)} · ${money(x.amount)}</span></div>`,
    )
    .join("") || `<div class="col-12 text-muted small py-2">No collections recorded yet.</div>`}</div></div></div>
<div class="col-lg-4"><div class="panel h-100"><div class="panel-title mb-3">Quick Actions</div><div class="d-grid gap-2"><a class="quick-action" href="subcommittee-collections.html"><span class="quick-icon"><i class="bi ${committeeIcon}"></i></span><span><b class="d-block small">Add Collection</b></span></a><a class="quick-action" href="subcommittee-submissions.html"><span class="quick-icon"><i class="bi bi-bank"></i></span><span><b class="d-block small">Submit to Office</b></span></a><a class="quick-action" href="subcommittee-expense.html"><span class="quick-icon"><i class="bi bi-receipt-cutoff"></i></span><span><b class="d-block small">Add Expense</b></span></a><a class="quick-action" href="reports.html"><span class="quick-icon"><i class="bi bi-file-earmark-spreadsheet"></i></span><span><b class="d-block small">Reports</b></span></a>${c.financeAccess ? `<a class="quick-action" href="members.html"><span class="quick-icon"><i class="bi bi-people"></i></span><span><b class="d-block small">Members</b></span></a><a class="quick-action" href="add-member.html"><span class="quick-icon"><i class="bi bi-person-plus"></i></span><span><b class="d-block small">Add Member</b></span></a>` : ""}</div></div></div>
</div>
<div class="panel"><div class="d-flex justify-content-between align-items-center mb-3"><div class="panel-title">Recent Collections</div><a href="subcommittee-collections.html" class="small text-decoration-none">View all</a></div>${renderSubCommitteeRecent(db, c.id, committeeIcon)}</div>`;
}
function renderSubCommitteeRecent(db, committeeId, committeeIcon = "bi-cash-coin") {
  const rows = (db.subCommitteeCollections || [])
    .filter((x) => Number(x.subCommitteeId) === Number(committeeId))
    .sort(
      (a, b) =>
        new Date(b.date || b.createdAt) - new Date(a.date || a.createdAt),
    )
    .slice(0, 6);
  if (!rows.length)
    return `<div class="empty-state"><i class="bi ${committeeIcon}"></i>No collections recorded yet.</div>`;
  return `<div class="table-responsive"><table class="table"><thead><tr><th>Date</th><th>Name</th><th>Place</th><th>Amount</th></tr></thead><tbody>${rows
    .map(
      (x) =>
        `<tr><td data-label="Date">${new Date(x.date || x.createdAt).toLocaleDateString("en-IN")}</td><td data-label="Name">${escapeHTML(x.donorName || "-")}</td><td data-label="Place">${escapeHTML(x.place || "-")}</td><td data-label="Amount" class="fw-semibold">${money(x.amount)}</td></tr>`,
    )
    .join("")}</tbody></table></div>`;
}
function renderMainDashboard(db, s) {
  const pid = s.role === "admin" ? null : Number(s.pradeshikamId);
  const members =
    pid == null
      ? db.members
      : db.members.filter((m) => Number(m.pradeshikamId) === pid);
  const memberCollected = memberCollectionTotal(pid, db),
    donations = donationTotal(pid, db),
    total = memberCollected + donations;
  const heldTotal =
    db.payments
      .filter(
        (p) =>
          p.status === "hold" &&
          (pid == null ||
            Number(
              db.members.find((m) => m.id === p.memberId)?.pradeshikamId,
            ) === pid),
      )
      .reduce((a, p) => a + Number(p.amount || 0), 0) +
    (db.donations || [])
      .filter(
        (d) =>
          d.status === "hold" &&
          (pid == null || Number(d.pradeshikamId) === pid),
      )
      .reduce((a, d) => a + Number(d.amount || 0), 0);
  const stats = members.reduce(
    (a, m) => {
      const x = memberStats(m, db);
      a.expected += Number(m.requiredAmount);
      a.paid += x.paid;
      a[x.status.toLowerCase()]++;
      return a;
    },
    { expected: 0, paid: 0, green: 0, yellow: 0, red: 0 },
  );
  const submitted = (db.submissions || [])
    .filter((x) => pid == null || Number(x.pradeshikamId) === pid)
    .reduce(
      (a, x) =>
        a +
        Number(
          x.amount ||
            Number(x.memberAmount || 0) + Number(x.donationAmount || 0),
        ),
      0,
    );
  const remainingBalance = Math.max(0, total - submitted);
  const remaining = Math.max(0, stats.expected - stats.paid);
  const subCommitteeCollected =
    s.role === "admin" ? subCommitteeCollectionTotal(null, db) : 0;
  const subCommitteeAllocated =
    s.role === "admin" ? subCommitteeAllocationTotal(null, db) : 0;
  document.getElementById("page-content").innerHTML = `
${pageTitle("Dashboard", "", `<a href="add-member.html" class="btn btn-primary"><i class="bi bi-person-plus me-2"></i>Add Member</a>`)}
<div class="row g-3 mb-4">
${statCard("bi-cash-stack", "Total Collected", money(total + (s.role === "admin" ? subCommitteeCollected : 0)))}
${statCard("bi-people", "Collected by Pradeshikam", money(memberCollected))}
${statCard("bi-gift", "Received from Donations", money(donations))}
${s.role === "admin" ? statCard("bi-mic", "Collected by Sub Committee", money(subCommitteeCollected)) : statCard("bi-person-check", "Total Members", members.length)}
${statCard("bi-wallet2", "Submitted to Office", money(submitted))}
${statCard("bi-hourglass-split", "Remaining Balance", money(remainingBalance))}
${s.role === "admin" ? statCard("bi-cash-coin", "Given to Sub Committee", money(subCommitteeAllocated)) : ""}
${s.role === "admin" ? statCard("bi-person-check", "Total Members", members.length) : ""}
</div>
${heldTotal > 0 ? `<div class="alert alert-primary d-flex justify-content-between align-items-center flex-wrap gap-2 mb-4"><span><i class="bi bi-hourglass-split me-2"></i>${money(heldTotal)} on hold — receipts issued, payment pending confirmation.</span><a href="payments.html" class="btn btn-sm btn-primary">Review Hold Payments</a></div>` : ""}
<div class="row g-3 mb-4">
<div class="col-lg-8"><div class="panel h-100"><div class="d-flex justify-content-between align-items-start mb-3"><div><div class="panel-title">Pradeshikam Collection Progress</div><div class="small text-muted mt-1">Required: <b>${money(stats.expected)}</b> · Remaining: <b>${money(remaining)}</b></div></div><span class="small text-muted">${stats.expected ? Math.round((stats.paid / stats.expected) * 100) : 0}%</span></div><div class="progress mb-3" style="height:12px"><div class="progress-bar bg-primary" style="width:${stats.expected ? Math.min(100, (stats.paid / stats.expected) * 100) : 0}%"></div></div><div class="row text-center"><div class="col-4"><div class="h5 fw-bold mb-1">${stats.green}</div><span class="status-badge status-green">● Fully Paid</span></div><div class="col-4"><div class="h5 fw-bold mb-1">${stats.yellow}</div><span class="status-badge status-yellow">● Mostly Paid</span></div><div class="col-4"><div class="h5 fw-bold mb-1">${stats.red}</div><span class="status-badge status-red">● Less Paid</span></div></div></div></div>
<div class="col-lg-4"><div class="panel h-100"><div class="panel-title mb-3">Quick Actions</div><div class="d-grid gap-2"><a class="quick-action" href="add-member.html"><span class="quick-icon"><i class="bi bi-person-plus"></i></span><span><b class="d-block small">Add Member</b></span></a><a class="quick-action" href="donations.html"><span class="quick-icon"><i class="bi bi-gift"></i></span><span><b class="d-block small">Donation</b></span></a><a class="quick-action" href="members.html"><span class="quick-icon"><i class="bi bi-search"></i></span><span><b class="d-block small">Find Member</b></span></a><a class="quick-action" href="reports.html"><span class="quick-icon"><i class="bi bi-file-earmark-spreadsheet"></i></span><span><b class="d-block small">Reports</b></span></a></div></div></div></div>
${s.role === "admin" ? renderPradeshikamOverview(db) : ""}
${s.role === "admin" ? renderSubCommitteeOverview(db) : ""}
<div class="panel"><div class="d-flex justify-content-between align-items-center mb-3"><div class="panel-title">Recent Collections & Donations</div><div class="d-flex gap-3"><a href="payments.html" class="small text-decoration-none">Collections</a><a href="donations.html?view=list" class="small text-decoration-none">Donations</a></div></div>${renderRecentTransactions(db, pid)}</div>`;
  function statCard(icon, label, value) {
    return `<div class="col-6 col-xl-3"><div class="stat-card"><div class="stat-icon"><i class="bi ${icon}"></i></div><div class="stat-label">${label}</div><div class="stat-value">${value}</div></div></div>`;
  }
  function renderRecentTransactions(db, pid) {
    const rows = [];
    db.payments.forEach((p) => {
      if (p.status === "hold") return;
      const m = db.members.find((x) => x.id === p.memberId);
      if (!m || (pid != null && Number(m.pradeshikamId) !== pid)) return;
      rows.push({
        date: p.paymentDate,
        type: "Pradeshikam Collection",
        receipt: p.receiptNumber,
        name: m.name,
        pr:
          db.pradeshikams.find((x) => Number(x.id) === Number(m.pradeshikamId))
            ?.name || "",
        amount: p.amount,
        mode: p.paymentMode,
      });
    });
    (db.donations || []).forEach((d) => {
      if (d.status === "hold") return;
      if (pid != null && Number(d.pradeshikamId) !== pid) return;
      rows.push({
        date: d.date || d.createdAt,
        type: "Donation",
        receipt: d.receiptNumber,
        name: d.donorName || "Donor",
        pr:
          db.pradeshikams.find((x) => Number(x.id) === Number(d.pradeshikamId))
            ?.name || "",
        amount: d.amount,
        mode: d.paymentMode,
      });
    });
    rows.sort((a, b) => new Date(b.date) - new Date(a.date));
    if (!rows.length)
      return `<div class="empty-state"><i class="bi bi-receipt"></i>No transactions recorded yet.</div>`;
    return `<div class="table-responsive"><table class="table"><thead><tr><th>Type</th><th>Receipt</th><th>Name</th><th>Pradeshikam</th><th>Amount</th><th>Mode</th><th>Date</th></tr></thead><tbody>${rows
      .slice(0, 8)
      .map(
        (r) =>
          `<tr><td data-label="Type">${escapeHTML(r.type)}</td><td data-label="Receipt"><b>${escapeHTML(r.receipt || "-")}</b></td><td data-label="Name">${escapeHTML(r.name)}</td><td data-label="Pradeshikam">${escapeHTML(r.pr)}</td><td data-label="Amount" class="fw-semibold">${money(r.amount)}</td><td data-label="Mode">${escapeHTML(r.mode || "-")}</td><td data-label="Date">${new Date(r.date).toLocaleDateString("en-IN")}</td></tr>`,
      )
      .join("")}</tbody></table></div>`;
  }
  function renderPradeshikamOverview(db) {
    return `<div class="panel mb-4"><div class="d-flex justify-content-between align-items-center mb-3"><div class="panel-title">Pradeshikam Collection</div><span class="small text-muted">All Pradeshikams</span></div><div class="row g-3">${db.pradeshikams
      .map((p) => {
        const memberTotal = memberCollectionTotal(p.id, db),
          donTotal = donationTotal(p.id, db),
          all = memberTotal + donTotal,
          submitted = (db.submissions || [])
            .filter((x) => Number(x.pradeshikamId) === Number(p.id))
            .reduce((a, x) => a + Number(x.amount || 0), 0),
          balance = Math.max(0, all - submitted),
          ms = db.members.filter(
            (m) => Number(m.pradeshikamId) === Number(p.id),
          ),
          green = ms.filter(
            (m) => memberStats(m, db).status === "Green",
          ).length,
          yellow = ms.filter(
            (m) => memberStats(m, db).status === "Yellow",
          ).length,
          red = ms.filter((m) => memberStats(m, db).status === "Red").length;
        return `<div class="col-md-6 col-xl-4"><div class="border rounded-3 p-3 h-100"><div class="d-flex justify-content-between align-items-center mb-2"><b>${escapeHTML(p.name)}</b><span class="small text-muted">${ms.length} members</span></div><div class="row g-2 small"><div class="col-6"><span class="text-muted d-block">Collected by Pradeshikam</span><b>${money(memberTotal)}</b></div><div class="col-6"><span class="text-muted d-block">Donations</span><b>${money(donTotal)}</b></div><div class="col-6 mt-2"><span class="text-muted d-block">Total Collected</span><b>${money(all)}</b></div><div class="col-6 mt-2"><span class="text-muted d-block">Submitted to Office</span><b>${money(submitted)}</b></div><div class="col-12 mt-2"><span class="text-muted d-block">Remaining Balance</span><b>${money(balance)}</b></div></div><div class="d-flex gap-2 flex-wrap mt-3"><span class="status-badge status-green">● ${green}</span><span class="status-badge status-yellow">● ${yellow}</span><span class="status-badge status-red">● ${red}</span></div></div></div>`;
      })
      .join("")}</div></div>`;
  }
  function renderSubCommitteeOverview(db) {
    return `<div class="panel mb-4"><div class="d-flex justify-content-between align-items-center mb-3"><div class="panel-title">Sub Committee Collection</div><span class="small text-muted">${db.subCommittees.map((c) => escapeHTML(c.name.replace(" Committee", ""))).join(" · ")}</span></div><div class="row g-3">${db.subCommittees
      .map((c) => {
        const collected = subCommitteeCollectionTotal(c.id, db),
          submitted = subCommitteeSubmittedTotal(c.id, db),
          balance = Math.max(0, collected - submitted),
          allocated = subCommitteeAllocationTotal(c.id, db),
          spent = subCommitteeExpenseTotal(c.id, db);
        return `<div class="col-md-6 col-xl-4"><div class="border rounded-3 p-3 h-100"><div class="d-flex justify-content-between align-items-center mb-2"><b><i class="bi ${c.icon || 'bi-mic'} me-2"></i>${escapeHTML(c.name)}</b></div><div class="row g-2 small"><div class="col-6"><span class="text-muted d-block">Collected</span><b>${money(collected)}</b></div><div class="col-6"><span class="text-muted d-block">Submitted</span><b>${money(submitted)}</b></div><div class="col-6 mt-2"><span class="text-muted d-block">Remaining</span><b>${money(balance)}</b></div><div class="col-6 mt-2"><span class="text-muted d-block">Given by Office</span><b>${money(allocated)}</b></div><div class="col-12 mt-2"><span class="text-muted d-block">Spent</span><b>${money(spent)}</b></div></div><div class="d-flex gap-2 flex-wrap mt-3"><a href="subcommittee-collections.html?committee=${c.id}" class="btn btn-sm btn-light">Collections</a><a href="subcommittee-submissions.html?committee=${c.id}" class="btn btn-sm btn-light">Submissions</a><a href="subcommittee-expense.html?committee=${c.id}" class="btn btn-sm btn-light">Expenses</a></div></div></div>`;
      })
      .join("")}</div></div>`;
  }
}
