const db = getDB(),
  s = currentSession();
markActive();
if (s.role === "subcommittee") {
  renderSubCommitteeDashboard(db, s);
} else {
  renderMainDashboard(db, s);
}
function statCard(icon, label, value, color = "blue") {
  return `<div class="col-6 col-xl-3"><div class="stat-card"><div class="stat-icon stat-icon-${color}"><i class="bi ${icon}"></i></div><div class="stat-label">${label}</div><div class="stat-value">${value}</div></div></div>`;
}
function statDualCard(icon, primaryLabel, primaryValue, secondaryLabel, secondaryValue, color = "blue") {
  return `<div class="col-6 col-xl-3"><div class="stat-card stat-card-dual"><div class="stat-icon stat-icon-${color}"><i class="bi ${icon}"></i></div><div class="stat-dual-metric"><div class="stat-label">${primaryLabel}</div><div class="stat-value">${primaryValue}</div></div><div class="stat-dual-divider"></div><div class="stat-dual-metric"><div class="stat-label">${secondaryLabel}</div><div class="stat-value">${secondaryValue}</div></div></div></div>`;
}
function radialProgress(pct, label = "") {
  const r = 48,
    c = 2 * Math.PI * r,
    clamped = Math.max(0, Math.min(100, pct)),
    offset = c - (clamped / 100) * c;
  return `<div class="radial-progress"><svg viewBox="0 0 116 116"><circle class="ring-bg" cx="58" cy="58" r="${r}"></circle><circle class="ring-fg" cx="58" cy="58" r="${r}" stroke-dasharray="${c}" stroke-dashoffset="${offset}"></circle></svg><div class="ring-label"><b>${clamped}%</b>${label ? `<span>${label}</span>` : ""}</div></div>`;
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
    submitted = subCommitteeOfficeSubmittedTotal(c.id, db),
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
${pageTitle(`${escapeHTML(c.name)} Dashboard`, "", `<div class="d-flex gap-2 flex-wrap">${c.financeAccess ? `<a href="add-member.html" class="btn btn-primary"><i class="bi bi-person-plus me-2"></i>${t("add_member")}</a>
` : ""}<a href="subcommittee-collections.html" class="btn ${c.financeAccess ? "btn-outline-primary" : "btn-primary"}"><i class="bi ${committeeIcon} me-2"></i>${t("add_collection")}</a></div>`)}
<div class="row g-3 mb-4">
${statCard("bi-cash-stack", t("total_collected"), money(collected), "green")}
${statCard("bi-bank", t("submitted_to_office"), money(submitted), "blue")}
${statCard("bi-hourglass-split", t("remaining_to_submit"), money(remainingToSubmit), "amber")}
${statCard("bi-cash-coin", t("received_from_office"), money(received), "purple")}
${statCard("bi-receipt-cutoff", t("total_expenses"), money(spent), "red")}
${statCard("bi-wallet2", t("remaining_after_expense"), money(remainingAfterExpense), "blue")}
</div>
<div class="row g-3 mb-4">
<div class="col-lg-8"><div class="panel h-100"><div class="d-flex justify-content-between align-items-start mb-3 flex-wrap gap-3"><div class="d-flex align-items-center gap-3">${radialProgress(submittedPct)}<div><div class="panel-title">${t("collection_progress")}</div><div class="small text-muted mt-1">${t("total_collected")}: <b>${money(collected)}</b><br>${t("submitted_to_office")}: <b>${money(submitted)}</b><br>${t("remaining_to_submit")}: <b>${money(remainingToSubmit)}</b></div></div></div></div><div class="row g-2 text-center">${
    bySource
      .filter((x) => x.count > 0)
      .map(
        (x) =>
          `<div class="col-6 col-md-4"><div class="h5 fw-bold mb-1">${x.count}</div><span class="status-badge status-green">${escapeHTML(x.type)} · ${money(x.amount)}</span></div>`,
      )
      .join("") ||
    `<div class="col-12 text-muted small py-2">No collections recorded yet.</div>`
  }</div></div></div>
<div class="col-lg-4"><div class="panel h-100"><div class="panel-title mb-3">${t("quick_actions")}</div><div class="d-grid gap-2"><a class="quick-action" href="subcommittee-collections.html"><span class="quick-icon"><i class="bi ${committeeIcon}"></i></span><span><b class="d-block small">${t("add_collection")}</b></span></a><a class="quick-action" href="submissions.html"><span class="quick-icon"><i class="bi bi-bank"></i></span><span><b class="d-block small">Submit to Office</b></span></a><a class="quick-action" href="subcommittee-expense.html"><span class="quick-icon"><i class="bi bi-receipt-cutoff"></i></span><span><b class="d-block small">${t("add_expense")}</b></span></a><a class="quick-action" href="reports.html"><span class="quick-icon"><i class="bi bi-file-earmark-spreadsheet"></i></span><span><b class="d-block small">${t("reports")}</b></span></a>
${c.financeAccess ? `<a class="quick-action" href="members.html"><span class="quick-icon"><i class="bi bi-people"></i></span><span><b class="d-block small">${t("members")}</b></span></a><a class="quick-action" href="add-member.html"><span class="quick-icon"><i class="bi bi-person-plus"></i></span><span><b class="d-block small">${t("add_member")}</b></span></a>` : ""}</div></div></div>
</div>
<div class="panel"><div class="d-flex justify-content-between align-items-center mb-3"><div class="panel-title">${t("recent_collections")}</div><a href="subcommittee-collections.html" class="small text-decoration-none">${t("view_all")}</a></div>${renderSubCommitteeRecent(db, c.id, committeeIcon)}</div>`;
}
function renderSubCommitteeRecent(
  db,
  committeeId,
  committeeIcon = "bi-cash-coin",
) {
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
  const submitted = pid == null
    ? mainOfficeReceivedTotal(db)
    : pradeshikamOfficeSubmittedTotal(pid, db);
  const remainingBalance = Math.max(0, total - submitted);
  const remaining = Math.max(0, stats.expected - stats.paid);
  const subCommitteeCollected =
    s.role === "admin" ? subCommitteeCollectionTotal(null, db) : 0;
  const subCommitteeAllocated =
    s.role === "admin" ? subCommitteeAllocationTotal(null, db) : 0;
  document.getElementById("page-content").innerHTML = `
${pageTitle("Dashboard", "", `<div class="fcms-main-header-actions">
${s.role === "admin" ? `<button type="button"
  id="openReceiptBookLimit"
  class="fcms-main-book-limit-icon"
  title="${fcmsLang()==="ml" ? "രസീത് ബുക്ക് പരിധി" : "Receipt Book Limit"}"
  aria-label="${fcmsLang()==="ml" ? "രസീത് ബുക്ക് പരിധി" : "Receipt Book Limit"}">
  <i class="bi bi-journal-bookmark"></i>
</button><button type="button" id="openReceiptBookAllocation" class="fcms-main-book-limit-icon" title="${fcmsLang()==="ml"?"രസീത് ബുക്ക് അനുവദിക്കൽ":"Receipt Book Allocation"}" aria-label="${fcmsLang()==="ml"?"രസീത് ബുക്ക് അനുവദിക്കൽ":"Receipt Book Allocation"}"><i class="bi bi-journals"></i></button>` : ""}
<a href="add-member.html" class="btn btn-primary"><i class="bi bi-person-plus me-2"></i>${t("add_member")}</a>
</div>`)}
<div class="row g-3 mb-4">
${statCard("bi-cash-stack", "Total Collected", money(total + (s.role === "admin" ? subCommitteeCollected : 0)), "green")}
${statCard("bi-people", "Collected by Pradeshikam", money(memberCollected), "blue")}
${statCard("bi-gift", "Received from Donations", money(donations), "purple")}
${s.role === "admin" ? statCard("bi-bank2", "Collected by Sub Committee", money(subCommitteeCollected), "blue") : statCard("bi-person-check", "Total Members", members.length, "purple")}
${statDualCard("bi-wallet2", "Submitted to Office", money(submitted), "Remaining Balance", money(remainingBalance), "green")}
${s.role === "admin" ? statCard("bi-cash-coin", "Given to Sub Committee", money(subCommitteeAllocated), "amber") : ""}
${s.role === "admin" ? statCard("bi-person-check", "Total Members", members.length, "purple") : ""}
</div>
${heldTotal > 0 ? `<div class="alert alert-primary d-flex justify-content-between align-items-center flex-wrap gap-2 mb-4"><span><i class="bi bi-hourglass-split me-2"></i>${money(heldTotal)} on hold — receipts issued, payment pending confirmation.</span><a href="payments.html" class="btn btn-sm btn-primary">Review Hold Payments</a></div>` : ""}
<div class="row g-3 mb-4">
<div class="col-lg-8"><div class="panel h-100"><div class="d-flex justify-content-between align-items-start mb-3 flex-wrap gap-3"><div class="d-flex align-items-center gap-3">${radialProgress(stats.expected ? Math.round((stats.paid / stats.expected) * 100) : 0)}<div><div class="panel-title">Pradeshikam Collection Progress</div><div class="small text-muted mt-1">Required: <b>${money(stats.expected)}</b><br>Remaining: <b>${money(remaining)}</b></div></div></div></div><div class="row text-center"><div class="col-4"><div class="h5 fw-bold mb-1">${stats.green}</div><span class="status-badge status-green">● Fully Paid</span></div><div class="col-4"><div class="h5 fw-bold mb-1">${stats.yellow}</div><span class="status-badge status-yellow">● Mostly Paid</span></div><div class="col-4"><div class="h5 fw-bold mb-1">${stats.red}</div><span class="status-badge status-red">● Less Paid</span></div></div></div></div>
<div class="col-lg-4"><div class="panel h-100"><div class="panel-title mb-3">${t("quick_actions")}</div><div class="d-grid gap-2"><a class="quick-action" href="add-member.html"><span class="quick-icon"><i class="bi bi-person-plus"></i></span><span><b class="d-block small">${t("add_member")}</b></span></a><a class="quick-action" href="donations.html"><span class="quick-icon"><i class="bi bi-gift"></i></span><span><b class="d-block small">${t("add_donation")}</b></span></a><a class="quick-action" href="members.html"><span class="quick-icon"><i class="bi bi-search"></i></span><span><b class="d-block small">${t("find_member")}</b></span></a><a class="quick-action" href="reports.html"><span class="quick-icon"><i class="bi bi-file-earmark-spreadsheet"></i></span><span><b class="d-block small">${t("reports")}</b></span></a></div></div></div></div>
${s.role === "admin" ? renderPradeshikamOverview(db) : ""}
${s.role === "admin" ? renderSubCommitteeOverview(db) : ""}
<div class="panel"><div class="d-flex justify-content-between align-items-center mb-3"><div class="panel-title">Recent Collections & Donations</div><div class="d-flex gap-3"><a href="payments.html" class="small text-decoration-none">Collections</a><a href="donations.html?view=list" class="small text-decoration-none">Donations</a></div></div>${renderRecentTransactions(db, pid)}</div>`;
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
          submitted = pradeshikamOfficeSubmittedTotal(p.id, db),
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
        return `<div class="col-md-6 col-xl-4"><div class="pradeshikam-overview-card h-100"><div class="pradeshikam-card-head"><b class="pradeshikam-card-name">${escapeHTML(p.name)}</b><span class="pradeshikam-member-count"><i class="bi bi-people" aria-hidden="true"></i><strong>${ms.length}</strong><span>members</span></span></div><div class="row g-3 small pradeshikam-card-metrics"><div class="col-6"><span class="text-muted d-block">Collected by Pradeshikam</span><b>${money(memberTotal)}</b></div><div class="col-6"><span class="text-muted d-block">Donations</span><b>${money(donTotal)}</b></div><div class="col-6"><span class="text-muted d-block">Total Collected</span><b>${money(all)}</b></div><div class="col-6"><span class="text-muted d-block">Submitted to Office</span><b>${money(submitted)}</b></div><div class="col-12"><span class="text-muted d-block">Remaining Balance</span><b>${money(balance)}</b></div></div><div class="pradeshikam-card-statuses"><span class="status-badge status-green">● ${green}</span><span class="status-badge status-yellow">● ${yellow}</span><span class="status-badge status-red">● ${red}</span></div></div></div>`;
      })
      .join("")}</div></div>`;
  }
  function renderSubCommitteeOverview(db) {
    return `<div class="panel mb-4"><div class="d-flex justify-content-between align-items-center mb-3"><div class="panel-title">Sub Committee Collection</div><span class="small text-muted">${db.subCommittees.map((c) => escapeHTML(c.name.replace(" Committee", ""))).join(" · ")}</span></div><div class="row g-3">${db.subCommittees
      .map((c) => {
        const collected = subCommitteeCollectionTotal(c.id, db),
          submitted = subCommitteeOfficeSubmittedTotal(c.id, db),
          balance = Math.max(0, collected - submitted),
          allocated = subCommitteeAllocationTotal(c.id, db),
          spent = subCommitteeExpenseTotal(c.id, db);
        return `<div class="col-md-6 col-xl-4"><div class="border rounded-3 p-3 h-100"><div class="d-flex justify-content-between align-items-center mb-2"><b><i class="bi ${c.icon || "bi-mic"} me-2"></i>${escapeHTML(c.name)}</b></div><div class="row g-2 small"><div class="col-6"><span class="text-muted d-block">Collected</span><b>${money(collected)}</b></div><div class="col-6"><span class="text-muted d-block">Submitted</span><b>${money(submitted)}</b></div><div class="col-6 mt-2"><span class="text-muted d-block">Remaining</span><b>${money(balance)}</b></div><div class="col-6 mt-2"><span class="text-muted d-block">Given by Office</span><b>${money(allocated)}</b></div><div class="col-12 mt-2"><span class="text-muted d-block">Spent</span><b>${money(spent)}</b></div></div><div class="d-flex gap-2 flex-wrap mt-3"><a href="subcommittee-collections.html?committee=${c.id}" class="btn btn-sm btn-light">Collections</a><a href="submissions.html?committee=${c.id}" class="btn btn-sm btn-light">Submissions</a><a href="subcommittee-expense.html?committee=${c.id}" class="btn btn-sm btn-light">Expenses</a></div></div></div>`;
      })
      .join("")}</div></div>`;
  }
}







/* WORKING BOOK LIMIT */
window.fcmsBookLimitConfirm = function({ oldLimit, newLimit, ml }){
  return new Promise((resolve)=>{
    document.querySelector(".fcms-book-limit-confirm-overlay")?.remove();
    const confirmOverlay=document.createElement("div");
    confirmOverlay.className="fcms-book-limit-confirm-overlay";
    confirmOverlay.innerHTML=`
      <div class="fcms-book-limit-confirm-card" role="dialog" aria-modal="true" aria-labelledby="fcmsBookLimitConfirmTitle">
        <div class="fcms-book-limit-confirm-icon"><i class="bi bi-journal-check"></i></div>
        <h3 id="fcmsBookLimitConfirmTitle">${ml ? "രസീത് ബുക്ക് പരിധി സ്ഥിരീകരിക്കുക" : "Confirm Receipt Book Limit"}</h3>
        <p>${ml ? "പുതിയ പരിധി സേവ് ചെയ്യണമെന്ന് സ്ഥിരീകരിക്കുക." : "Confirm that you want to save the new published book limit."}</p>
        <div class="fcms-book-limit-confirm-summary">
          <div><span>${ml ? "നിലവിലുള്ളത്" : "Current"}</span><strong>${ml ? "ബുക്ക്" : "Book"} ${oldLimit}</strong></div>
          <i class="bi bi-arrow-right"></i>
          <div><span>${ml ? "പുതിയത്" : "New"}</span><strong>${ml ? "ബുക്ക്" : "Book"} ${newLimit}</strong></div>
        </div>
        <div class="fcms-book-limit-confirm-actions">
          <button type="button" class="btn btn-light fcms-book-limit-confirm-cancel">${ml ? "റദ്ദാക്കുക" : "Cancel"}</button>
          <button type="button" class="btn btn-primary fcms-book-limit-confirm-save">${ml ? "പരിധി സേവ് ചെയ്യുക" : "Save Limit"}</button>
        </div>
      </div>`;
    document.body.appendChild(confirmOverlay);
    let settled=false;
    const finish=(result)=>{
      if(settled) return;
      settled=true;
      document.removeEventListener("keydown",onKeydown);
      confirmOverlay.remove();
      resolve(result);
    };
    const onKeydown=(event)=>{ if(event.key==="Escape") finish(false); };
    confirmOverlay.querySelector(".fcms-book-limit-confirm-save").addEventListener("click",()=>finish(true));
    confirmOverlay.querySelector(".fcms-book-limit-confirm-cancel").addEventListener("click",()=>finish(false));
    confirmOverlay.addEventListener("click",(event)=>{ if(event.target===confirmOverlay) finish(false); });
    document.addEventListener("keydown",onKeydown);
    confirmOverlay.querySelector(".fcms-book-limit-confirm-save").focus();
  });
};

window.openReceiptBookLimitModal = function(){
  const session=currentSession();
  if(!session || session.role!=="admin") return;

  const current=fcmsReceiptBookLimit(getDB());
  const ml=fcmsLang()==="ml";
  document.getElementById("fcmsReceiptBookLimitOverlay")?.remove();

  const overlay=document.createElement("div");
  overlay.id="fcmsReceiptBookLimitOverlay";
  overlay.className="fcms-book-limit-overlay";

  const options=Array.from({length:FCMS_MAX_RECEIPT_BOOKS},(_,i)=>{
    const n=i+1;
    return `<option value="${n}" ${n===current?"selected":""}>${ml?"ബുക്ക്":"Book"} ${n}</option>`;
  }).join("");

  overlay.innerHTML=`
    <div class="fcms-book-limit-modal">
      <div class="fcms-book-limit-modal-head">
        <div>
          <h3>${ml?"രസീത് ബുക്ക് പരിധി":"Receipt Book Limit"}</h3>
          
        </div>
        <button type="button" class="fcms-book-limit-close"><i class="bi bi-x-lg"></i></button>
      </div>
      <div class="fcms-book-limit-modal-body">
        <label>${ml?"പരമാവധി ബുക്ക്":"Maximum Book"}</label>
        <select id="fcmsReceiptBookLimitSelect" class="form-select">${options}</select>
        <div class="fcms-book-limit-manual-wrap">
          <label for="fcmsReceiptBookLimitManual">${ml ? "ബുക്ക് നമ്പർ നൽകുക" : "Enter Book Number"}</label>
          <input type="number" id="fcmsReceiptBookLimitManual" class="form-control"
                 min="1" max="${FCMS_MAX_RECEIPT_BOOKS}" step="1" inputmode="numeric"
                 value="${current}" placeholder="1 - ${FCMS_MAX_RECEIPT_BOOKS}">
        </div>
        <div class="fcms-book-limit-info">
          <span>${ml?"പരമാവധി രസീത് നമ്പർ":"Maximum receipt number"}</span>
          <strong id="fcmsReceiptBookLimitMax">${current*FCMS_RECEIPTS_PER_BOOK}</strong>
        </div>
      </div>
      <div class="fcms-book-limit-modal-actions">
        <button type="button" class="btn btn-light fcms-book-limit-cancel">${ml?"റദ്ദാക്കുക":"Cancel"}</button>
        <button type="button" class="btn btn-primary fcms-book-limit-save">${ml?"സേവ് ചെയ്യുക":"Save Limit"}</button>
      </div>
    </div>`;

  document.body.appendChild(overlay);

  const sel=overlay.querySelector("#fcmsReceiptBookLimitSelect");
  const maxEl=overlay.querySelector("#fcmsReceiptBookLimitMax");
  sel.addEventListener("change",()=>{maxEl.textContent=Number(sel.value)*FCMS_RECEIPTS_PER_BOOK;});

  const close=()=>overlay.remove();

    /* BOOK LIMIT SELECT AND TYPE SYNC */
    const fcmsBookLimitSelect = document.getElementById("fcmsReceiptBookLimitSelect");
    const fcmsBookLimitManual = document.getElementById("fcmsReceiptBookLimitManual");
    const fcmsBookLimitMaxDisplay = document.getElementById("fcmsReceiptBookLimitMax");

    function fcmsApplyBookLimitValue(raw, source){
      const n = Number(raw);
      const valid = Number.isInteger(n) && n >= 1 && n <= FCMS_MAX_RECEIPT_BOOKS;

      if(!valid){
        if(fcmsBookLimitManual){
          fcmsBookLimitManual.setCustomValidity(
            ml
              ? `ബുക്ക് നമ്പർ 1 മുതൽ ${FCMS_MAX_RECEIPT_BOOKS} വരെ ആയിരിക്കണം.`
              : `Book number must be between 1 and ${FCMS_MAX_RECEIPT_BOOKS}.`
          );
        }
        return false;
      }

      if(fcmsBookLimitManual){
        fcmsBookLimitManual.setCustomValidity("");
        if(source !== "manual") fcmsBookLimitManual.value = String(n);
      }
      if(fcmsBookLimitSelect && source !== "select"){
        fcmsBookLimitSelect.value = String(n);
      }

      if(fcmsBookLimitMaxDisplay){
        fcmsBookLimitMaxDisplay.textContent = String(n * FCMS_RECEIPTS_PER_BOOK);
      }
      return true;
    }

    fcmsBookLimitSelect?.addEventListener("change", function(){
      fcmsApplyBookLimitValue(this.value, "select");
    });

    fcmsBookLimitManual?.addEventListener("input", function(){
      if(fcmsApplyBookLimitValue(Number(this.value), "manual")){
        fcmsBookLimitSelect.value = String(Number(this.value));
      }
    });

    fcmsBookLimitManual?.addEventListener("blur", function(){
      if(!fcmsApplyBookLimitValue(Number(this.value), "manual")) this.reportValidity();
    });

    fcmsApplyBookLimitValue(current, "select");
  overlay.querySelector(".fcms-book-limit-close").addEventListener("click",close);
  overlay.querySelector(".fcms-book-limit-cancel").addEventListener("click",close);
  overlay.addEventListener("click",e=>{if(e.target===overlay) close();});

  overlay.querySelector(".fcms-book-limit-save").addEventListener("click",async ()=>{
    const next = Number(document.getElementById("fcmsReceiptBookLimitManual")?.value || sel.value);
      if(!Number.isInteger(next) || next < 1 || next > FCMS_MAX_RECEIPT_BOOKS){
        const manual = document.getElementById("fcmsReceiptBookLimitManual");
        if(manual){
          manual.setCustomValidity(ml ? `ബുക്ക് നമ്പർ 1 മുതൽ ${FCMS_MAX_RECEIPT_BOOKS} വരെ ആയിരിക്കണം.` : `Book number must be between 1 and ${FCMS_MAX_RECEIPT_BOOKS}.`);
          manual.reportValidity();
          manual.focus();
        }
        return;
      }
    const old=fcmsReceiptBookLimit(getDB());
    if(next===old){close();return;}
    const confirmMessage = ml
      ? `രസീത് ബുക്ക് പരിധി ബുക്ക് ${old} ൽ നിന്ന് ബുക്ക് ${next} ആയി മാറ്റണോ? പരമാവധി രസീത് നമ്പർ ${next * FCMS_RECEIPTS_PER_BOOK} ആയിരിക്കും.`
      : `Change the receipt book limit from Book ${old} to Book ${next}? The maximum receipt number will be ${next * FCMS_RECEIPTS_PER_BOOK}.`;
    const confirmed = typeof window.fcmsBookLimitConfirm === "function"
      ? await window.fcmsBookLimitConfirm({ oldLimit: old, newLimit: next, ml })
      : await confirmDialog(confirmMessage, {
          title: ml ? "രസീത് ബുക്ക് പരിധി സ്ഥിരീകരിക്കുക" : "Confirm Receipt Book Limit",
          confirmLabel: ml ? "പരിധി സേവ് ചെയ്യുക" : "Save Limit",
          cancelLabel: ml ? "റദ്ദാക്കുക" : "Cancel",
          tone: "primary"
        });
    if(!confirmed) return;

    const saveButton = overlay.querySelector(".fcms-book-limit-save");
    if(saveButton) saveButton.disabled = true;
    try {
      fcmsSetReceiptBookLimit(next);
      close();
      toast(
        ml ? `രസീത് ബുക്ക് പരിധി ബുക്ക് ${next} ആയി സേവ് ചെയ്തു.` : `Receipt book limit saved as Book ${next}.`,
        "success"
      );
    } catch (error) {
      if(saveButton) saveButton.disabled = false;
      toast(error?.message || (ml ? "പരിധി സേവ് ചെയ്യാനായില്ല." : "Unable to save the receipt book limit."), "danger");
    }
  });
};

document.addEventListener("click",function(e){
  const b=e.target.closest?e.target.closest("#openReceiptBookLimit"):null;
  if(!b) return;
  e.preventDefault();
  e.stopPropagation();
  window.openReceiptBookLimitModal();
});

window.openReceiptBookAllocationModal=function(){
  const s=currentSession(); if(!s||s.role!=="admin")return;
  const db=getDB(), ml=fcmsLang()==="ml", allocations=fcmsReceiptBookAllocations(db);
  document.querySelector(".fcms-book-allocation-overlay")?.remove();
  const overlay=document.createElement("div"); overlay.className="fcms-book-limit-overlay fcms-book-allocation-overlay";
  const committeeOptions=(type)=>{
    const rows=type==="pradeshikam"?db.pradeshikams:db.subCommittees;
    return rows.map(x=>`<option value="${x.id}">${escapeHTML(typeof fcmsPradeshikamLabel==="function"&&type==="pradeshikam"?fcmsPradeshikamLabel(x.name):x.name)}</option>`).join("");
  };
  const ownerLabel=(key)=>{const [ownerType,ownerId]=String(key).split(":"),list=ownerType==="pradeshikam"?db.pradeshikams:db.subCommittees;return list.find(x=>Number(x.id)===Number(ownerId))?.name||key;};
  const allocationRows=()=>Object.entries(allocations).map(([key,books])=>{
    const [type,id]=key.split(":"), list=type==="pradeshikam"?db.pradeshikams:db.subCommittees;
    const item=list.find(x=>Number(x.id)===Number(id)); if(!item)return "";
    const name=type==="pradeshikam"&&typeof fcmsPradeshikamLabel==="function"?fcmsPradeshikamLabel(item.name):item.name;
    return `<div class="fcms-book-allocation-row"><div><strong>${escapeHTML(name)}</strong><span>${ml?"ബുക്കുകൾ":"Books"} ${(books||[]).join(", ")||"-"}</span></div><div class="fcms-book-allocation-row-actions"><button type="button" class="btn btn-sm btn-light" data-book-edit="${type}:${id}" title="${ml?"തിരുത്തുക":"Edit"}"><i class="bi bi-pencil"></i><span>${ml?"തിരുത്തുക":"Edit"}</span></button><button type="button" class="btn btn-sm btn-outline-danger" data-book-delete="${type}:${id}" title="${ml?"നീക്കം ചെയ്യുക":"Remove"}"><i class="bi bi-trash"></i><span>${ml?"നീക്കം ചെയ്യുക":"Remove"}</span></button></div></div>`;
  }).join("");
  overlay.innerHTML=`<div class="fcms-book-limit-modal fcms-book-allocation-modal" role="dialog" aria-modal="true">
    <div class="fcms-book-limit-modal-head"><div><h3>${ml?"രസീത് ബുക്ക് അനുവദിക്കൽ":"Receipt Book Allocation"}</h3><p class="text-muted mb-0">${ml?"ഒരു ബുക്ക് ഒരു കമ്മിറ്റിക്ക് മാത്രം അനുവദിക്കാം.":"A receipt book can belong to only one committee."}</p></div><button type="button" class="fcms-book-limit-close"><i class="bi bi-x-lg"></i></button></div>
    <div class="fcms-book-limit-modal-body">
      <label class="form-label">${ml?"കമ്മിറ്റി തരം":"Committee Type"}</label><select id="bookOwnerType" class="form-select mb-3"><option value="pradeshikam">${ml?"പ്രാദേശികം":"Pradeshikam"}</option><option value="subcommittee">${ml?"ഉപസമിതി":"Sub Committee"}</option></select>
      <label class="form-label">${ml?"കമ്മിറ്റി":"Committee"}</label><select id="bookOwnerId" class="form-select mb-3">${committeeOptions("pradeshikam")}</select>
      <label class="form-label">${ml?"ബുക്ക് നമ്പറുകൾ":"Book Numbers"}</label><input id="allocatedBooks" class="form-control" inputmode="numeric" placeholder="Example: 4, 5, 6"><div class="form-text">${ml?"കോമ ഉപയോഗിച്ച് ബുക്ക് നമ്പറുകൾ നൽകുക.":"Enter book numbers separated by commas."}</div>
      <div class="fcms-book-allocation-list"><h6>${ml?"നിലവിലെ അനുവദിക്കലുകൾ":"Current Allocations"}</h6><div>${allocationRows()}</div></div>
    </div><div class="fcms-book-limit-modal-actions"><button class="btn btn-light fcms-book-limit-cancel">${ml?"റദ്ദാക്കുക":"Cancel"}</button><button class="btn btn-primary fcms-book-allocation-save">${ml?"അനുവദിക്കൽ സേവ് ചെയ്യുക":"Save Allocation"}</button></div></div>`;
  document.body.appendChild(overlay);
  const type=overlay.querySelector("#bookOwnerType"), id=overlay.querySelector("#bookOwnerId"), input=overlay.querySelector("#allocatedBooks"), saveButton=overlay.querySelector(".fcms-book-allocation-save");
  let editMode=false;
  const sync=()=>{id.innerHTML=committeeOptions(type.value); load(false);};
  const load=(editing=false)=>{editMode=editing;input.value=editing?fcmsAllocatedReceiptBooks(type.value,id.value,getDB()).join(", "):"";saveButton.textContent=editing?(ml?"മാറ്റങ്ങൾ സേവ് ചെയ്യുക":"Save Changes"):(ml?"ബുക്കുകൾ ചേർക്കുക":"Add Books");};
  type.addEventListener("change",sync); id.addEventListener("change",()=>load(false)); load(false);
  const close=()=>overlay.remove(); overlay.querySelector(".fcms-book-limit-close").onclick=close; overlay.querySelector(".fcms-book-limit-cancel").onclick=close; overlay.addEventListener("click",e=>{if(e.target===overlay)close();});
  overlay.querySelectorAll("[data-book-edit]").forEach(button=>button.onclick=()=>{
    const [nextType,nextId]=button.dataset.bookEdit.split(":"); type.value=nextType; id.innerHTML=committeeOptions(nextType); id.value=nextId; load(true); input.focus(); input.scrollIntoView({block:"center",behavior:"smooth"});
  });
  overlay.querySelectorAll("[data-book-delete]").forEach(button=>button.onclick=async()=>{
    const [removeType,removeId]=button.dataset.bookDelete.split(":"), list=removeType==="pradeshikam"?db.pradeshikams:db.subCommittees, item=list.find(x=>Number(x.id)===Number(removeId));
    const confirmed=await confirmDialog(ml?`${item?.name||"ഈ കമ്മിറ്റിയുടെ"} എല്ലാ രസീത് ബുക്ക് അനുവദിക്കലുകളും നീക്കം ചെയ്യണോ?`:`Remove all receipt-book allocations from ${item?.name||"this committee"}?`,{title:ml?"അനുവദിക്കൽ നീക്കം ചെയ്യുക":"Remove Allocation",confirmLabel:ml?"നീക്കം ചെയ്യുക":"Remove",cancelLabel:ml?"റദ്ദാക്കുക":"Cancel",tone:"danger"});
    if(!confirmed)return;
    try{fcmsSetReceiptBookAllocation(removeType,removeId,[]);close();toast(ml?"അനുവദിക്കൽ നീക്കം ചെയ്തു.":"Receipt-book allocation removed.","success");window.openReceiptBookAllocationModal();}catch(error){toast(error.message||"Unable to remove allocation.","danger");}
  });
  overlay.querySelector(".fcms-book-allocation-save").onclick=async()=>{
    const raw=input.value.trim();
    if(raw&&!/^\s*\d+\s*(,\s*\d+\s*)*$/.test(raw)){toast(ml?"ബുക്ക് നമ്പറുകൾ കോമ ഉപയോഗിച്ച് ശരിയായി നൽകുക.":"Enter valid book numbers separated by commas.","danger");input.focus();return;}
    const enteredBooks=raw?raw.split(",").map(x=>Number(x.trim())):[], existing=fcmsAllocatedReceiptBooks(type.value,id.value,getDB()), books=editMode?enteredBooks:[...new Set([...existing,...enteredBooks])].sort((a,b)=>a-b), selected=id.options[id.selectedIndex]?.textContent||"committee";
    if(!editMode&&!enteredBooks.length){toast(ml?"ചേർക്കാൻ കുറഞ്ഞത് ഒരു ബുക്ക് നമ്പർ നൽകുക.":"Enter at least one book number to add.","danger");input.focus();return;}
    const confirmed=await confirmDialog(ml?`${selected} എന്ന കമ്മിറ്റിക്ക് ${editMode?"ബുക്ക് അനുവദിക്കൽ മാറ്റി":"നിലവിലുള്ളവയോടൊപ്പം ബുക്കുകൾ ചേർത്ത്"} ${books.join(", ")||"ഒന്നുമില്ല"} ആയി സേവ് ചെയ്യണോ?`:`${editMode?"Replace the allocation":"Add to the existing allocation"} for ${selected} and save Books ${books.join(", ")||"None"}?`,{title:ml?"രസീത് ബുക്ക് അനുവദിക്കൽ സ്ഥിരീകരിക്കുക":"Confirm Book Allocation",confirmLabel:ml?"സ്ഥിരീകരിച്ച് സേവ് ചെയ്യുക":"Confirm & Save",cancelLabel:ml?"റദ്ദാക്കുക":"Cancel",tone:"primary"});
    if(!confirmed)return;
    try{fcmsSetReceiptBookAllocation(type.value,id.value,books);toast(ml?"രസീത് ബുക്കുകൾ അനുവദിച്ചു.":"Receipt books allocated successfully.","success");close();}
    catch(error){
      if(error?.code!=="RECEIPT_BOOK_CONFLICT"){toast(error.message||"Unable to save allocation.","danger");return;}
      const details=(error.conflicts||[]).map(c=>`${ml?"ബുക്ക്":"Book"} ${c.books.join(", ")} — ${ownerLabel(c.ownerKey)}`).join("\n");
      const overwrite=await confirmDialog(ml?`ഈ ബുക്കുകൾ ഇതിനകം അനുവദിച്ചിട്ടുണ്ട്:\n${details}\n\nനിലവിലെ കമ്മിറ്റിയിൽ നിന്ന് മാറ്റി ${selected} എന്ന കമ്മിറ്റിക്ക് അനുവദിക്കണോ?`:`These books are already allocated:\n${details}\n\nDo you want to remove them from the current committee and allocate them to ${selected}?`,{title:ml?"ബുക്ക് ഇതിനകം അനുവദിച്ചിട്ടുണ്ട്":"Book Already Allocated",confirmLabel:ml?"മാറ്റി അനുവദിക്കുക":"Overwrite Allocation",cancelLabel:ml?"വേണ്ട":"No, Keep Existing",tone:"danger"});
      if(!overwrite)return;
      try{fcmsSetReceiptBookAllocation(type.value,id.value,books,{overwrite:true});toast(ml?"ബുക്ക് അനുവദിക്കൽ മാറ്റി സേവ് ചെയ്തു.":"Book allocation overwritten successfully.","success");close();}catch(overwriteError){toast(overwriteError.message||"Unable to overwrite allocation.","danger");}
    }
  };
};
document.addEventListener("click",e=>{const b=e.target.closest?.("#openReceiptBookAllocation");if(!b)return;e.preventDefault();window.openReceiptBookAllocationModal();});
