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
<div class="col-md-4"><label class="form-label">Receipt Number / രസീത് നമ്പർ *</label><input id="receipt" class="form-control" required value="${escapeHTML(payment.receiptNumber)}"></div>
<div class="col-md-4"><label class="form-label">${payment.status === "hold" ? "Actual Amount Received / യഥാർത്ഥത്തിൽ ലഭിച്ച തുക" : "Amount / തുക"} *</label><input id="amount" type="number" min="0" step="1" class="form-control" required value="${Number(payment.amount)}">${payment.status === "hold" ? '<div class="form-text">The required balance is taken first; any excess becomes this member\'s donation.</div>' : ""}</div>
<div class="col-md-4"><label class="form-label">Payment Mode / പേയ്മെന്റ് രീതി *</label><select id="mode" class="form-select" data-transaction-id="${escapeHTML(payment.transactionId || "")}" required><option ${payment.paymentMode === "Cash" ? "selected" : ""}>Cash</option><option ${payment.paymentMode === "UPI" ? "selected" : ""}>UPI</option><option ${payment.paymentMode === "Bank" ? "selected" : ""}>Bank</option><option ${payment.paymentMode === "Cheque" ? "selected" : ""}>Cheque</option></select></div>
<div class="col-md-4"><label class="form-label">Status / നില *</label><select id="status" class="form-select" required><option value="completed" ${(payment.status || "completed") === "completed" ? "selected" : ""}>Completed</option><option value="hold" ${payment.status === "hold" ? "selected" : ""}>Hold (payment not yet received)</option></select></div>
<div class="col-12"><label class="form-label">Remarks / അഭിപ്രായങ്ങൾ</label><textarea id="remarks" class="form-control" rows="3">${escapeHTML(payment.remarks || "")}</textarea></div>
</div><div id="formError" class="alert alert-danger d-none mt-3"></div>
<div class="d-flex justify-content-end gap-2 mt-4"><a href="member-details.html?id=${encodeURIComponent(member.id)}" class="btn btn-light">Cancel</a><button class="btn btn-primary">Save Changes</button></div>
</form></div>`;
  document.getElementById("editPaymentForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const receipt = document.getElementById("receipt").value.trim(),
      amount = Number(document.getElementById("amount").value),
      status = document.getElementById("status").value,
      err = document.getElementById("formError");
    const temporaryHoldReceipt = status === "hold" && receipt === "0";
    const dup = db.payments.find(
      (p) => !temporaryHoldReceipt && p.id !== payment.id && p.receiptNumber === receipt,
    );
    if (dup) {
      err.textContent = "That receipt number is already in use.";
      err.classList.remove("d-none");
      return;
    }
    if (status !== "hold" && receipt === "0") {
      err.textContent = "Replace temporary receipt 0 with the actual receipt number before confirming payment.";
      err.classList.remove("d-none");
      document.getElementById("receipt").focus();
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
    const wasHold = payment.status === "hold";
    const isConfirmingHold = wasHold && status !== "hold";
    const contributionDue = Math.max(0, Number(member.requiredAmount || 0) - otherPaid);
    const contributionAmount = isConfirmingHold ? Math.min(amount, contributionDue) : amount;
    const donationAmount = isConfirmingHold ? Math.max(0, amount - contributionAmount) : 0;
    if (isConfirmingHold) {
      const confirmed = await confirmDialog(
        donationAmount > 0
          ? `${money(contributionAmount)} will be recorded as the member contribution and ${money(donationAmount)} as a donation for ${member.name}.`
          : `${money(contributionAmount)} will be recorded as the member contribution for ${member.name}.`,
        {
          title: "Confirm Held Amount",
          confirmLabel: "Confirm and Save",
          cancelLabel: "Cancel",
          tone: "success",
        },
      );
      if (!confirmed) return;
    }
    payment.receiptNumber = receipt;
    payment.amount = contributionAmount;
    payment.paymentMode = document.getElementById("mode").value;
    payment.transactionId = fcmsGetUpiTransactionId("mode");
    payment.status = status;
    payment.remarks = document.getElementById("remarks").value.trim();
    payment.confirmedTotalAmount = isConfirmingHold ? amount : payment.confirmedTotalAmount;
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
    if (donationAmount > 0) {
      const donation = {
        id: uid("don"),
        donorMemberId: member.id,
        donorName: member.name,
        pradeshikamId: member.pradeshikamId,
        houseNumber: member.houseNumber || "",
        amount: donationAmount,
        receiptNumber: receipt,
        masterReceiptNumber: payment.masterReceiptNumber || null,
        sourceType: "Member",
        sourceLabel: "Member",
        donorPhone: member.phone || "",
        donorPhoneCode: member.countryCode || "+91",
        paymentMode: payment.paymentMode,
        transactionId: payment.transactionId || "",
        status: "completed",
        date: payment.paymentDate || new Date().toISOString(),
        remarks: payment.remarks
          ? `${payment.remarks} · Excess from confirmed Hold`
          : "Excess from confirmed Hold",
        createdAt: new Date().toISOString(),
        holdPaymentId: payment.id,
      };
      db.donations.push(donation);
      addActivity(db, {
        action: "Donation Added",
        entityType: "donation",
        entityId: donation.id,
        memberId: member.id,
        pradeshikamId: member.pradeshikamId,
        summary: `${money(donationAmount)} excess recorded as donation`,
        details: `Created while confirming held receipt ${receipt} for ${member.name}.`,
        newValue: donationSnapshot(donation),
      });
    }
    fcmsClearPageDraft(); saveDB(db);
    if (typeof fcmsQueueToast === "function" && isConfirmingHold) {
      fcmsQueueToast(
        donationAmount > 0
          ? `Hold confirmed: ${money(contributionAmount)} contribution and ${money(donationAmount)} donation.`
          : `Hold confirmed: ${money(contributionAmount)} contribution.`,
        "success",
      );
    }
    location.href = "member-details.html?id=" + encodeURIComponent(member.id);
  });
}
