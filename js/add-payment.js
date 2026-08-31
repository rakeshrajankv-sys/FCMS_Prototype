const db = getDB(),
  s = currentSession();
markActive();
const id = new URLSearchParams(location.search).get("id"),
  member = db.members.find((m) => m.id === id);
const myCommittee = s.role === "subcommittee" ? db.subCommittees.find((c) => Number(c.id) === Number(s.subCommitteeId)) : null;
if (
  !member ||
  (s.role === "pradeshikam" && member.pradeshikamId !== s.pradeshikamId) ||
  (s.role === "subcommittee" && !myCommittee?.financeAccess)
) {
  location.href = "members.html";
} else {
  const x = memberStats(member, db);
  document.getElementById("page-content").innerHTML = `
${pageTitle("Add Collection")}
<div class="row g-3"><div class="col-lg-4"><div class="panel"><div class="panel-title mb-3">Member</div><h5 class="fw-bold">${escapeHTML(member.name)}</h5><div class="small text-muted">${member.memberCode}</div><hr><div class="d-flex justify-content-between small"><span>Required</span><b>${money(member.requiredAmount)}</b></div><div class="d-flex justify-content-between small mt-2"><span>Paid</span><b>${money(x.paid)}</b></div><div class="d-flex justify-content-between small mt-2"><span>Balance</span><b>${money(x.balance)}</b></div><div class="mt-3">${badge(x.status)}</div></div></div>
<div class="col-lg-8"><div class="panel form-card"><form id="paymentForm"><div class="row g-3"><div class="col-md-6"><label class="form-label">Receipt Number / രസീത് നമ്പർ *</label><input id="receipt" class="form-control" required inputmode="numeric"><div id="newPaymentReceiptBook" class="fcms-new-payment-book" hidden></div></div><div class="col-md-6"><label class="form-label">Amount / തുക *</label><input id="amount" type="number" min="0" step="1" max="${x.balance}" class="form-control" required></div><div class="col-md-6"><label class="form-label">Payment Mode / പേയ്മെന്റ് രീതി *</label><select id="mode" class="form-select" required><option>Cash</option><option>UPI</option><option>Bank</option><option>Cheque</option></select></div><div class="col-12"><label class="form-label">Remarks / അഭിപ്രായങ്ങൾ</label><textarea id="remarks" class="form-control" rows="3"></textarea></div></div><div id="formError" class="alert alert-danger d-none mt-3"></div><div class="d-flex justify-content-end gap-2 mt-4"><a href="member-details.html?id=${encodeURIComponent(member.id)}" class="btn btn-light">Cancel</a><button class="btn btn-primary" ${x.balance <= 0 ? "disabled" : ""}>Save Payment</button></div></form></div></div></div>`;
  const receiptInput = document.getElementById("receipt");
  const receiptBook = document.getElementById("newPaymentReceiptBook");

  function refreshNewPaymentBook(){
    if(!receiptInput || !receiptBook) return;
    const raw = String(receiptInput.value || "").trim();
    receiptBook.hidden = true;
    receiptBook.textContent = "";
    receiptBook.classList.remove("is-error");

    if(!raw) {
      receiptInput.setCustomValidity("");
      return;
    }

    const info = typeof fcmsPublishedBookInfo === "function"
      ? fcmsPublishedBookInfo(raw, db)
      : (typeof fcmsReceiptBookInfo === "function" ? fcmsReceiptBookInfo(raw) : null);

    if(!info || !Number.isFinite(Number(info.book))) {
      receiptInput.setCustomValidity("");
      return;
    }

    if(info.published === false){
      const limit = Number(info.publishedLimit || (typeof fcmsReceiptBookLimit === "function" ? fcmsReceiptBookLimit(db) : 0));
      const msg = `Book ${info.book} has not been published yet. Current published limit is Book ${limit}.`;
      receiptBook.textContent = msg;
      receiptBook.classList.add("is-error");
      receiptBook.hidden = false;
      receiptInput.setCustomValidity(msg);
      return;
    }

    receiptBook.textContent = `${typeof fcmsLang === "function" && fcmsLang() === "ml" ? "ബുക്ക്" : "Book"} ${info.book}`;
    receiptBook.hidden = false;
    receiptInput.setCustomValidity("");
  }

  ["input","change","blur"].forEach(evt => receiptInput?.addEventListener(evt, refreshNewPaymentBook));
  refreshNewPaymentBook();

  document.getElementById("paymentForm").addEventListener("submit", (e) => {
    e.preventDefault();
    refreshNewPaymentBook();
    const receipt = document.getElementById("receipt").value.trim(),
      amount = Number(document.getElementById("amount").value),
      err = document.getElementById("formError");
    if (typeof fcmsReceiptAllowed === "function" && !fcmsReceiptAllowed(receipt, db)) {
      const info = typeof fcmsPublishedBookInfo === "function" ? fcmsPublishedBookInfo(receipt, db) : null;
      const book = Number(info?.book || 0);
      const limit = Number(info?.publishedLimit || (typeof fcmsReceiptBookLimit === "function" ? fcmsReceiptBookLimit(db) : 0));
      err.textContent = book
        ? `Book ${book} has not been published yet. Current published limit is Book ${limit}.`
        : "Enter a valid receipt number.";
      err.classList.remove("d-none");
      receiptInput?.focus();
      return;
    }
    if (db.payments.some((p) => String(p.receiptNumber).toLowerCase() === String(receipt).toLowerCase())) {
      err.textContent = "This receipt number has already been used.";
      err.classList.remove("d-none");
      return;
    }
    if (amount < 0 || isNaN(amount)) {
      err.textContent = "Enter a valid payment amount.";
      err.classList.remove("d-none");
      return;
    }
    const current = memberStats(member, db);
    if (amount > current.balance) {
      err.textContent = `Amount exceeds the remaining balance of ${money(current.balance)}.`;
      err.classList.remove("d-none");
      return;
    }
    const payment = {
      id: uid("pay"),
      memberId: member.id,
      receiptNumber: receipt,
      amount,
      paymentMode: document.getElementById("mode").value,
      transactionId: fcmsGetUpiTransactionId("mode"),
      status: "completed",
      remarks: document.getElementById("remarks").value.trim(),
      paymentDate: new Date().toISOString(),
    };
    fcmsMarkNewUpiPending(payment); db.payments.push(payment);
    addActivity(db, {
      action: "Payment Added",
      entityType: "payment",
      entityId: payment.id,
      memberId: member.id,
      pradeshikamId: member.pradeshikamId,
      summary: `Receipt ${receipt} added`,
      details: `${money(amount)} via ${payment.paymentMode}.`,
      newValue: paymentSnapshot(payment),
    });
    fcmsClearPageDraft(); saveDB(db);
    location.href = "member-details.html?id=" + encodeURIComponent(member.id);
  });
}
function badge(s) {
  return `<span class="status-badge status-${s.toLowerCase()}">● ${s}</span>`;
}
