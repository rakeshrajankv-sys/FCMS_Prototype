const db = getDB(),
  s = currentSession();
markActive();
document.getElementById("page-content").innerHTML =
  `${pageTitle("Reports")}<div class="panel mb-4"><div class="row g-2 align-items-end"><div class="col-md-4"><label class="form-label">Pradeshikam</label><select id="pr" class="form-select">${s.role === "admin" ? `<option value="">All Pradeshikams</option>` : ""}${db.pradeshikams
    .filter((p) => s.role === "admin" || p.id === s.pradeshikamId)
    .map(
      (p) =>
        `<option value="${p.id}" ${s.role !== "admin" ? "selected" : ""}>${escapeHTML(p.name)}</option>`,
    )
    .join(
      "",
    )}</select></div><div class="col-md-3"><label class="form-label">Status</label><select id="st" class="form-select"><option value="">All statuses</option><option>Green</option><option>Yellow</option><option>Red</option></select></div><div class="col-md-3"><label class="form-label">Report</label><select id="type" class="form-select"><option value="members">Members</option><option value="payments">Collections</option><option value="donations">Donations</option></select></div><div class="col-md-2"><button id="download" class="btn btn-primary w-100"><i class="bi bi-file-earmark-spreadsheet me-1"></i>Export</button></div></div></div><div class="panel"><div class="panel-title mb-3">Summary</div><div id="summary"></div></div>`;
function selectedPid() {
  return document.getElementById("pr").value;
}
function filteredMembers() {
  return db.members.filter(
    (m) =>
      (s.role === "admin" || m.pradeshikamId === s.pradeshikamId) &&
      (!selectedPid() || m.pradeshikamId == selectedPid()) &&
      (!document.getElementById("st").value ||
        memberStats(m, db).status === document.getElementById("st").value),
  );
}
function visibleDonations() {
  return (db.donations || []).filter(
    (d) =>
      d.status !== "hold" &&
      (s.role === "admin" ||
        Number(d.pradeshikamId) === Number(s.pradeshikamId)) &&
      (!selectedPid() || Number(d.pradeshikamId) === Number(selectedPid())),
  );
}
function visibleDonationsAll() {
  return (db.donations || []).filter(
    (d) =>
      (s.role === "admin" ||
        Number(d.pradeshikamId) === Number(s.pradeshikamId)) &&
      (!selectedPid() || Number(d.pradeshikamId) === Number(selectedPid())),
  );
}
function renderSummary() {
  const ms = filteredMembers(),
    ex = ms.reduce((a, m) => a + Number(m.requiredAmount), 0),
    pd = ms.reduce((a, m) => a + memberStats(m, db).paid, 0),
    ds = visibleDonations().reduce((a, d) => a + Number(d.amount || 0), 0);
  document.getElementById("summary").innerHTML =
    `<div class="row g-3"><div class="col-6 col-lg-3"><div class="stat-card"><div class="stat-label">Members</div><div class="stat-value">${ms.length}</div></div></div><div class="col-6 col-lg-3"><div class="stat-card"><div class="stat-label">Collected by Pradeshikam</div><div class="stat-value">${money(pd)}</div></div></div><div class="col-6 col-lg-3"><div class="stat-card"><div class="stat-label">Donations</div><div class="stat-value">${money(ds)}</div></div></div><div class="col-6 col-lg-3"><div class="stat-card"><div class="stat-label">Total Received</div><div class="stat-value">${money(pd + ds)}</div></div></div></div><div class="small text-muted mt-3">Member required amount: ${money(ex)} · Member balance: ${money(Math.max(0, ex - pd))}</div>`;
}
["pr", "st", "type"].forEach((id) =>
  document.getElementById(id).addEventListener("change", renderSummary),
);
document.getElementById("download").addEventListener("click", () => {
  const type = document.getElementById("type").value;
  if (type === "members") {
    const data = filteredMembers().map((m) => {
      const x = memberStats(m, db),
        p = db.pradeshikams.find((p) => p.id === m.pradeshikamId);
      return {
        MemberID: m.memberCode,
        Name: m.name,
        Gender: m.gender,
        Age: m.age,
        MaritalStatus: m.maritalStatus || "",
        Phone: formatPhone(m.phone || "", m.countryCode || "+91"),
        HouseNumber: m.houseNumber || "",
        Pradeshikam: p?.name || "",
        Required: m.requiredAmount,
        Paid: x.paid,
        Balance: x.balance,
        Status: x.status,
      };
    });
    exportCSV(data, "fcms-members.csv");
  } else if (type === "payments") {
    const ids = new Set(filteredMembers().map((m) => m.id));
    const data = db.payments
      .filter((p) => ids.has(p.memberId))
      .map((p) => {
        const m = db.members.find((x) => x.id === p.memberId),
          pr = db.pradeshikams.find((x) => x.id === m?.pradeshikamId);
        return {
          Receipt: p.receiptNumber,
          MemberID: m?.memberCode || "",
          Name: m?.name || "",
          Pradeshikam: pr?.name || "",
          Amount: p.amount,
          PaymentMode: p.paymentMode,
          Status: p.status === "hold" ? "Hold" : "Completed",
          Date: new Date(p.paymentDate).toLocaleString("en-IN"),
          Remarks: p.remarks || "",
        };
      });
    exportCSV(data, "fcms-collections.csv");
  } else {
    const data = visibleDonationsAll().map((d) => {
      const donor = d.donorMemberId
          ? db.members.find((m) => m.id === d.donorMemberId)
          : null,
        pr = db.pradeshikams.find(
          (p) => Number(p.id) === Number(d.pradeshikamId),
        );
      return {
        Date: new Date(d.date || d.createdAt).toLocaleString("en-IN"),
        Receipt: d.receiptNumber || "",
        Source: d.sourceType || "Member",
        Donor: d.donorName || donor?.name || "",
        House: d.houseNumber || donor?.houseNumber || "",
        Pradeshikam: pr?.name || "",
        Amount: d.amount,
        PaymentMode: d.paymentMode || "",
        Status: d.status === "hold" ? "Hold" : "Completed",
        Remarks: d.remarks || "",
      };
    });
    exportCSV(data, "fcms-donations.csv");
  }
});
renderSummary();
