const db = getDB(),
  s = currentSession();
markActive();
if (s.role !== "admin") {
  location.href = "donations.html";
}
const id = new URLSearchParams(location.search).get("id"),
  donation = db.donations.find((d) => d.id === id);
if (!donation) {
  location.href = "donations.html";
} else {
  const donor = donation.donorMemberId
    ? db.members.find((m) => m.id === donation.donorMemberId)
    : null;
  document.getElementById("page-content").innerHTML =
    `${pageTitle("Edit Donation")}<div class="panel form-card"><form id="editDonationForm"><div class="row g-3"><div class="col-md-4"><label class="form-label">Source / ഉറവിടം *</label><select id="source" class="form-select" required>${["Member", "Shop", "Organization", "Other"].map((x) => `<option ${donation.sourceType === x ? "selected" : ""}>${x}</option>`).join("")}</select></div><div class="col-md-4"><label class="form-label">Donor Name / ദാതാവിന്റെ പേര് *</label><input id="name" class="form-control" required value="${escapeHTML(donation.donorName || donor?.name || "")}"></div><div class="col-md-4" id="phoneField"><label class="form-label">Phone Number / ഫോൺ നമ്പർ *</label><div class="phone-field"><select id="phoneCode" class="form-select" aria-label="Country code"><option value="+91" ${(donation.donorPhoneCode || donor?.countryCode || "+91") === "+91" ? "selected" : ""}>+91</option><option value="+971" ${(donation.donorPhoneCode || donor?.countryCode || "+91") === "+971" ? "selected" : ""}>+971</option></select><input id="phone" class="form-control" type="tel" inputmode="numeric" maxlength="10" value="${escapeHTML(donation.donorPhone || donor?.phone || "")}"></div></div><div class="col-md-4"><label class="form-label">Pradeshikam / പ്രദേശികം *</label><select id="pradeshikam" class="form-select" required>${db.pradeshikams.map((p) => `<option value="${p.id}" ${Number(donation.pradeshikamId) === Number(p.id) ? "selected" : ""}>${escapeHTML(p.name)}</option>`).join("")}</select></div><div class="col-md-4"><label class="form-label">Amount / തുക *</label><input id="amount" type="number" min="1" class="form-control" required value="${Number(donation.amount)}"></div><div class="col-md-4"><label class="form-label">Receipt Number / രസീത് നമ്പർ *</label><input id="receipt" class="form-control" required value="${escapeHTML(donation.receiptNumber || "")}"></div><div class="col-md-4"><label class="form-label">Payment Mode / പേയ്മെന്റ് രീതി *</label><select id="mode" class="form-select" required>${["Cash", "UPI", "Bank", "Cheque"].map((x) => `<option ${donation.paymentMode === x ? "selected" : ""}>${x}</option>`).join("")}</select></div><div class="col-md-4"><label class="form-label">Status / നില *</label><select id="status" class="form-select" required><option value="completed" ${(donation.status || "completed") === "completed" ? "selected" : ""}>Completed</option><option value="hold" ${donation.status === "hold" ? "selected" : ""}>Hold (payment not yet received)</option></select></div><div class="col-md-6"><label class="form-label">Date / തീയതി *</label><input id="date" type="date" class="form-control" required value="${new Date(donation.date || donation.createdAt).toISOString().slice(0, 10)}"></div><div class="col-md-6"><label class="form-label">Remarks / അഭിപ്രായങ്ങൾ</label><input id="remarks" class="form-control" value="${escapeHTML(donation.remarks || "")}"></div></div><div id="formError" class="alert alert-danger d-none mt-3"></div><div class="d-flex justify-content-end gap-2 mt-4"><a href="donations.html" class="btn btn-light">Cancel</a><button class="btn btn-primary">Save Changes</button></div></form></div>`;
  function updateEditDonationSource() {
    const isMember = document.getElementById("source").value === "Member";
    document.getElementById("phoneField").style.display = isMember
      ? "none"
      : "block";
    document.getElementById("phone").required = !isMember;
    document.getElementById("name").required = !isMember;
    document.getElementById("name").parentElement.style.display = isMember
      ? "none"
      : "block";
  }
  document
    .getElementById("source")
    .addEventListener("change", updateEditDonationSource);
  document
    .getElementById("phone")
    .addEventListener(
      "input",
      (e) => (e.target.value = e.target.value.replace(/\D/g, "").slice(0, 10)),
    );
  updateEditDonationSource();
  document
    .getElementById("editDonationForm")
    .addEventListener("submit", (e) => {
      e.preventDefault();
      const receipt = document.getElementById("receipt").value.trim(),
        amount = Number(document.getElementById("amount").value),
        err = document.getElementById("formError"),
        dup = (db.donations || []).find(
          (x) =>
            x !== donation &&
            String(x.receiptNumber || "").toLowerCase() ===
              receipt.toLowerCase(),
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
      if (document.getElementById("source").value !== "Member") {
        const pc = document.getElementById("phoneCode").value,
          ph = normalizePhone(document.getElementById("phone").value || "");
        if (
          (pc === "+91" && ph.length !== 10) ||
          (pc === "+971" && (ph.length < 9 || ph.length > 10))
        ) {
          err.textContent =
            "+91 numbers require 10 digits. +971 numbers require 9 or 10 digits.";
          err.classList.remove("d-none");
          return;
        }
      }
      const old = donationSnapshot(donation);
      const wasHold = donation.status === "hold";
      const newStatus = document.getElementById("status").value;
      Object.assign(donation, {
        sourceType: document.getElementById("source").value,
        donorName: document.getElementById("name").value.trim(),
        pradeshikamId: Number(document.getElementById("pradeshikam").value),
        amount,
        receiptNumber: receipt,
        paymentMode: document.getElementById("mode").value,
        status: newStatus,
        date: new Date(
          document.getElementById("date").value + "T12:00:00",
        ).toISOString(),
        remarks: document.getElementById("remarks").value.trim(),
        donorPhone:
          document.getElementById("source").value === "Member"
            ? donor?.phone || ""
            : normalizePhone(document.getElementById("phone").value || ""),
        donorPhoneCode:
          document.getElementById("source").value === "Member"
            ? donor?.countryCode || "+91"
            : document.getElementById("phoneCode").value,
      });
      addActivity(db, {
        action:
          wasHold && newStatus !== "hold"
            ? "Donation Confirmed"
            : "Donation Edited",
        entityType: "donation",
        entityId: donation.id,
        memberId: donation.donorMemberId || null,
        pradeshikamId: donation.pradeshikamId,
        summary:
          wasHold && newStatus !== "hold"
            ? `Donation ${receipt} confirmed`
            : `Donation ${receipt} edited`,
        details:
          wasHold && newStatus !== "hold"
            ? "Held donation confirmed as received by Main Committee."
            : "Donation details edited by Main Committee.",
        oldValue: old,
        newValue: donationSnapshot(donation),
      });
      saveDB(db);
      location.href = "donations.html";
    });
}
