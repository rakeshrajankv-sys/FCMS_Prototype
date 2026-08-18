const db = getDB(),
  s = currentSession();
markActive();
const id = new URLSearchParams(location.search).get("id"),
  item = (db.subCommitteeCollections || []).find((x) => x.id === id);
if (!item || s.role !== "admin") {
  location.href = "subcommittee-collections.html";
} else {
  document.getElementById("page-content").innerHTML =
    `${pageTitle("Edit Collection")}<div class="panel form-card"><form id="editForm"><div class="row g-3">
<div class="col-md-4"><label class="form-label">Source *</label><select id="source" class="form-select" required>${["Member", "Person", "Shop", "Organization", "Other"].map((x) => `<option ${item.sourceType === x ? "selected" : ""}>${x}</option>`).join("")}</select></div>
<div class="col-md-4"><label class="form-label">Name *</label><input id="name" class="form-control" required value="${escapeHTML(item.donorName || "")}"></div>
<div class="col-md-4"><label class="form-label">Place *</label><input id="place" class="form-control" required value="${escapeHTML(item.place || "")}"></div>
<div class="col-md-4"><label class="form-label">Phone Number</label><div class="phone-field"><select id="phoneCode" class="form-select"><option value="+91" ${(item.donorPhoneCode || "+91") === "+91" ? "selected" : ""}>+91</option><option value="+971" ${item.donorPhoneCode === "+971" ? "selected" : ""}>+971</option></select><input id="phone" class="form-control" type="tel" inputmode="numeric" maxlength="10" value="${escapeHTML(item.donorPhone || "")}"></div></div>
<div class="col-md-4"><label class="form-label">Amount *</label><input id="amount" type="number" min="1" class="form-control" required value="${Number(item.amount)}"></div>
<div class="col-md-4"><label class="form-label">Receipt Number *</label><input id="receipt" class="form-control" required value="${escapeHTML(item.receiptNumber || "")}"></div>
<div class="col-md-4"><label class="form-label">Payment Mode *</label><select id="mode" class="form-select" required>${["Cash", "UPI", "Bank", "Cheque"].map((x) => `<option ${item.paymentMode === x ? "selected" : ""}>${x}</option>`).join("")}</select></div>
<div class="col-md-6"><label class="form-label">Date *</label><input id="date" type="date" class="form-control" required value="${new Date(item.date || item.createdAt).toISOString().slice(0, 10)}"></div>
<div class="col-md-6"><label class="form-label">Remarks</label><input id="remarks" class="form-control" value="${escapeHTML(item.remarks || "")}"></div>
</div><div id="formError" class="alert alert-danger d-none mt-3"></div><div class="d-flex justify-content-end gap-2 mt-4"><a href="subcommittee-collections.html?committee=${item.subCommitteeId}" class="btn btn-light">Cancel</a><button class="btn btn-primary">Save Changes</button></div></form></div>`;
  document.getElementById("editForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const receipt = document.getElementById("receipt").value.trim(),
      amount = Number(document.getElementById("amount").value),
      err = document.getElementById("formError");
    const dup = (db.subCommitteeCollections || []).find(
      (x) =>
        x.id !== item.id &&
        String(x.receiptNumber || "").toLowerCase() === receipt.toLowerCase(),
    );
    if (dup) {
      err.textContent = "That receipt number is already in use.";
      err.classList.remove("d-none");
      return;
    }
    if (amount <= 0) {
      err.textContent = "Enter a valid amount.";
      err.classList.remove("d-none");
      return;
    }
    const old = subCommitteeCollectionSnapshot(item);
    Object.assign(item, {
      sourceType: document.getElementById("source").value,
      donorName: document.getElementById("name").value.trim(),
      place: document.getElementById("place").value.trim(),
      donorPhone: normalizePhone(document.getElementById("phone").value || ""),
      donorPhoneCode: document.getElementById("phoneCode").value,
      amount,
      receiptNumber: receipt,
      paymentMode: document.getElementById("mode").value,
      date: new Date(
        document.getElementById("date").value + "T12:00:00",
      ).toISOString(),
      remarks: document.getElementById("remarks").value.trim(),
    });
    addActivity(db, {
      action: "Sub Committee Collection Edited",
      entityType: "subCommitteeCollection",
      entityId: item.id,
      summary: `Collection ${receipt} edited`,
      details: "Sub committee collection details edited.",
      oldValue: old,
      newValue: subCommitteeCollectionSnapshot(item),
    });
    saveDB(db);
    location.href =
      "subcommittee-collections.html?committee=" + item.subCommitteeId;
  });
}
