const db = getDB(),
  s = currentSession();
markActive();
if (s.role !== "admin") {
  location.href = "payments.html";
}
const id = new URLSearchParams(location.search).get("id"),
  payment = db.payments.find((p) => p.id === id),
  member = payment && db.members.find((m) => m.id === payment.memberId);
if (!payment || !member) {
  location.href = "payments.html";
} else {
  document.getElementById("page-content").innerHTML = `
${pageTitle("Edit Collection")}
<div class="panel form-card"><div class="receipt-box mb-4"><div class="d-flex justify-content-between"><span>Member</span><b>${escapeHTML(member.name)}</b></div><div class="d-flex justify-content-between mt-2"><span>Receipt</span><b>${escapeHTML(payment.receiptNumber)}</b></div></div>
<form id="editPaymentForm"><div class="row g-3">
<div class="col-md-4"><label class="form-label">Receipt Number *</label><input id="receipt" class="form-control" required value="${escapeHTML(payment.receiptNumber)}"></div>
<div class="col-md-4"><label class="form-label">Amount *</label><input id="amount" type="number" min="0" step="1" class="form-control" required value="${Number(payment.amount)}"></div>
<div class="col-md-4"><label class="form-label">Payment Mode *</label><select id="mode" class="form-select" required><option ${payment.paymentMode === "Cash" ? "selected" : ""}>Cash</option><option ${payment.paymentMode === "UPI" ? "selected" : ""}>UPI</option><option ${payment.paymentMode === "Bank" ? "selected" : ""}>Bank</option><option ${payment.paymentMode === "Cheque" ? "selected" : ""}>Cheque</option></select></div>
<div class="col-md-4"><label class="form-label">Status *</label><select id="status" class="form-select" required><option value="completed" ${(payment.status || "completed") === "completed" ? "selected" : ""}>Completed</option><option value="hold" ${payment.status === "hold" ? "selected" : ""}>Hold (payment not yet received)</option></select></div>
<div class="col-12"><label class="form-label">Remarks</label><textarea id="remarks" class="form-control" rows="3">${escapeHTML(payment.remarks || "")}</textarea></div>
</div><div id="formError" class="alert alert-danger d-none mt-3"></div>
<div class="d-flex justify-content-end gap-2 mt-4"><a href="member-details.html?id=${encodeURIComponent(member.id)}" class="btn btn-light">Cancel</a><button class="btn btn-primary">Save Changes</button></div>
</form></div>`;
  document.getElementById("editPaymentForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const receipt = document.getElementById("receipt").value.trim(),
      amount = Number(document.getElementById("amount").value),
      status = document.getElementById("status").value,
      err = document.getElementById("formError");
    const dup = db.payments.find(
      (p) => p.id !== payment.id && p.receiptNumber === receipt,
    );
    if (dup) {
      err.textContent = "That receipt number is already in use.";
      err.classList.remove("d-none");
      return;
    }
    if (amount < 0) {
      err.textContent = "Enter a valid amount.";
      err.classList.remove("d-none");
      return;
    }
    const old = paymentSnapshot(payment);
    const otherPaid = db.payments
      .filter(
        (p) =>
          p.memberId === member.id &&
          p.id !== payment.id &&
          p.status !== "hold",
      )
      .reduce((a, p) => a + Number(p.amount), 0);
    if (
      status !== "hold" &&
      member.requiredAmount > 0 &&
      otherPaid + amount > member.requiredAmount
    ) {
      err.textContent = `This change would exceed the member's required amount of ${money(member.requiredAmount)}.`;
      err.classList.remove("d-none");
      return;
    }
    const wasHold = payment.status === "hold";
    payment.receiptNumber = receipt;
    payment.amount = amount;
    payment.paymentMode = document.getElementById("mode").value;
    payment.status = status;
    payment.remarks = document.getElementById("remarks").value.trim();
    addActivity(db, {
      action:
        wasHold && status !== "hold" ? "Payment Confirmed" : "Payment Edited",
      entityType: "payment",
      entityId: payment.id,
      memberId: member.id,
      pradeshikamId: member.pradeshikamId,
      summary:
        wasHold && status !== "hold"
          ? `Receipt ${receipt} payment confirmed`
          : `Receipt ${receipt} edited`,
      details:
        wasHold && status !== "hold"
          ? "Held payment confirmed as received by Main Committee."
          : "Payment edited by Main Committee.",
      oldValue: old,
      newValue: paymentSnapshot(payment),
    });
    saveDB(db);
    location.href = "member-details.html?id=" + encodeURIComponent(member.id);
  });
}
