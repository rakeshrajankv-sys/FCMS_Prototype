const db = getDB(),
  s = currentSession();
markActive();
const id = new URLSearchParams(location.search).get("id");
const member = db.members.find((m) => m.id === id);
if (!member) {
  location.href = "members.html";
} else {
  if (s.role === "pradeshikam" && member.pradeshikamId !== s.pradeshikamId) {
    location.href = "members.html";
  }
  const pr = db.pradeshikams.find((p) => p.id === member.pradeshikamId),
    x = memberStats(member, db),
    household = houseMembersFor(member, db),
    payments = db.payments
      .filter((p) => p.memberId === member.id)
      .sort((a, b) => new Date(b.paymentDate) - new Date(a.paymentDate));
  const myCommittee = s.role === "subcommittee" ? db.subCommittees.find((c) => Number(c.id) === Number(s.subCommitteeId)) : null;
  const canEditMember = s.role === "admin" || (s.role === "pradeshikam" && Number(member.pradeshikamId) === Number(s.pradeshikamId)) || (s.role === "subcommittee");
  const adminActions = canEditMember
      ? `<a href="edit-member.html?id=${encodeURIComponent(member.id)}" class="btn btn-outline-primary"><i class="bi bi-pencil me-1"></i>Edit Member</a>`
      : "";
  document.getElementById("page-content").innerHTML = `
  <div class="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
    <a href="members.html" class="text-decoration-none small"><i class="bi bi-arrow-left me-1"></i>Back to Members</a>
    <div class="action-buttons">
      ${adminActions}
      ${(s.role === "admin" || s.role === "pradeshikam" || myCommittee?.financeAccess) ? `<button id="deleteMemberBtn" class="btn btn-outline-danger"><i class="bi bi-trash me-1"></i>Delete Member</button>` : ""}
      ${(s.role === "admin" || s.role === "pradeshikam" || myCommittee?.financeAccess) ? `<a href="add-payment.html?id=${encodeURIComponent(member.id)}" class="btn btn-primary"><i class="bi bi-plus-lg me-2"></i>Add Payment</a>` : ""}
    </div>
  </div>
  <div class="member-hero mb-4"><div class="d-flex justify-content-between flex-wrap gap-3"><div><div class="small muted">${escapeHTML(member.memberCode)}</div><h2 class="fw-bold mb-1">${escapeHTML(member.name)}</h2><div class="muted">${escapeHTML(pr?.name || "")} · ${member.gender} · Age ${member.age}</div></div><div class="text-end"><div class="small muted">Current Status</div><div class="mt-1">${badge(x.status)}</div></div></div></div>
  <div class="row g-3 mb-4"><div class="col-6 col-lg-3"><div class="stat-card"><div class="stat-label">Required</div><div class="stat-value">${money(member.requiredAmount)}</div></div></div><div class="col-6 col-lg-3"><div class="stat-card"><div class="stat-label">Total Paid</div><div class="stat-value">${money(x.paid)}</div>${x.held > 0 ? `<div class="small text-muted mt-1">+ ${money(x.held)} on hold</div>` : ""}</div></div><div class="col-6 col-lg-3"><div class="stat-card"><div class="stat-label">Balance</div><div class="stat-value">${money(x.balance)}</div></div></div><div class="col-6 col-lg-3"><div class="stat-card"><div class="stat-label">Progress</div><div class="stat-value">${Math.round(x.percent)}%</div></div></div></div>
  <div class="row g-3 mb-3"><div class="col-12"><div class="panel"><div class="d-flex justify-content-between align-items-center mb-3"><div><div class="panel-title">Household Cluster · ${escapeHTML(member.houseNumber || "-")}</div><div class="small text-muted">${household.length} member${household.length === 1 ? "" : "s"} in this house</div></div><a class="btn btn-sm btn-outline-primary" href="members.html?house=${encodeURIComponent(member.houseNumber || "")}">View House</a></div><div class="row g-2">${household
    .map((h) => {
      const hs = memberStats(h, db);
      return `<div class="col-md-6 col-xl-4"><div class="border rounded-3 p-2 d-flex justify-content-between align-items-center"><div><a class="text-decoration-none fw-semibold" href="member-details.html?id=${encodeURIComponent(h.id)}">${escapeHTML(h.name)}</a><div class="small text-muted">${h.gender}, ${h.age}</div></div><div class="text-end"><div class="small">${money(hs.paid)} / ${money(h.requiredAmount)}</div>${badge(hs.status)}</div></div></div>`;
    })
    .join("")}</div></div></div></div>
  <div class="row g-3"><div class="col-lg-4"><div class="panel h-100"><div class="panel-title mb-3">Member Information</div>${info("Phone", formatPhone(member.phone || "", member.countryCode || "+91") || "-")}${info("Marital Status", member.maritalStatus || "-")}${info("Receipt Number", member.receiptNumber || "-")}${info("House Number", member.houseNumber || "-")}${info("Pradeshikam", pr?.name || "-")}${info("Required Amount", money(member.requiredAmount))}</div></div>
  <div class="col-lg-8"><div class="panel"><div class="d-flex justify-content-between mb-3"><div class="panel-title">Payment History</div><span class="small text-muted">${payments.length} receipt(s)</span></div>
  ${payments.length ? `<div class="table-responsive"><table class="table"><thead><tr><th>Receipt</th><th>Amount</th><th>Mode</th><th>Status</th><th>Date</th><th>Remarks</th>${s.role === "admin" ? `<th>Actions</th>` : ""}</tr></thead><tbody>${payments.map((p) => `<tr><td data-label="Receipt"><b>${escapeHTML(p.receiptNumber)}</b></td><td data-label="Amount" class="fw-semibold">${money(p.amount)}</td><td data-label="Mode">${escapeHTML(p.paymentMode)}</td><td data-label="Status">${p.status === "hold" ? `<span class="status-badge status-hold">● Hold</span>` : `<span class="status-badge status-green">● Completed</span>`}</td><td data-label="Date">${new Date(p.paymentDate).toLocaleDateString("en-IN")}</td><td data-label="Remarks">${escapeHTML(p.remarks || "-")}</td>${s.role === "admin" ? `<td data-label="Actions"><div class="d-flex gap-1"><a class="btn btn-sm btn-light" href="edit-payment.html?id=${encodeURIComponent(p.id)}" title="Edit"><i class="bi bi-pencil"></i></a><button class="btn btn-sm btn-outline-danger delete-payment" data-id="${escapeHTML(p.id)}" title="Delete"><i class="bi bi-trash"></i></button></div></td>` : ""}</tr>`).join("")}</tbody></table></div>` : `<div class="empty-state"><i class="bi bi-receipt"></i>No payments yet.</div>`}
  </div></div></div>`;
  document
    .getElementById("deleteMemberBtn")
    ?.addEventListener("click", async () => {
      const ok = await confirmDialog(
        `Delete ${member.name}? This removes the member and active receipts, but keeps a record in Activity History.`,
      );
      if (!ok) return;
      const memberPayments = db.payments.filter(
        (p) => p.memberId === member.id,
      );
      memberPayments.forEach((p) =>
        addActivity(db, {
          action: "Payment Deleted",
          entityType: "payment",
          entityId: p.id,
          memberId: member.id,
          pradeshikamId: member.pradeshikamId,
          summary: `Receipt ${p.receiptNumber} removed with member`,
          details: `Receipt ${p.receiptNumber} for ${money(p.amount)} was removed because member ${member.name} was deleted.`,
          oldValue: { ...p },
        }),
      );
      addActivity(db, {
        action: "Member Deleted",
        entityType: "member",
        entityId: member.id,
        memberId: member.id,
        pradeshikamId: member.pradeshikamId,
        summary: `${member.name} deleted`,
        details: `Member ${member.memberCode} and ${memberPayments.length} active receipt(s) deleted.`,
        oldValue: { ...member },
      });
      db.payments = db.payments.filter((p) => p.memberId !== member.id);
      db.members = db.members.filter((m) => m.id !== member.id);
      fcmsClearPageDraft(); saveDB(db);
      toast(`${member.name} deleted.`, "success");
      location.href = "members.html";
    });
  document.querySelectorAll(".delete-payment").forEach((btn) =>
    btn.addEventListener("click", async () => {
      const pid = btn.dataset.id,
        p = db.payments.find((x) => x.id === pid);
      if (!p || s.role !== "admin") return;
      const ok = await confirmDialog(
        `Delete receipt ${p.receiptNumber} for ${money(p.amount)}?`,
      );
      if (!ok) return;
      addActivity(db, {
        action: "Payment Deleted",
        entityType: "payment",
        entityId: p.id,
        memberId: member.id,
        pradeshikamId: member.pradeshikamId,
        summary: `Receipt ${p.receiptNumber} deleted`,
        details: `Payment deleted by Main Committee.`,
        oldValue: { ...p },
      });
      db.payments = db.payments.filter((x) => x.id !== pid);
      fcmsClearPageDraft(); saveDB(db);
      location.reload();
    }),
  );
}
function badge(s) {
  return `<span class="status-badge status-${s.toLowerCase()}">● ${s}</span>`;
}
function info(l, v) {
  return `<div class="mb-3"><div class="info-label">${l}</div><div class="info-value">${escapeHTML(v)}</div></div>`;
}
