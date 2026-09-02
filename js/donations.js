function fcmsRecordBookMatches(record, selectedBook){
  if(!selectedBook) return true;
  const info=fcmsReceiptBookInfo(record?.receiptNumber);
  return !!info && Number(info.book)===Number(selectedBook);
}
const db = getDB(),
  s = currentSession();
markActive();
const donationsParams = new URLSearchParams(location.search);
const listOnly = donationsParams.get("view") === "list";
const requestedPradeshikam = donationsParams.get("pradeshikam");
const visibleMembers =
  s.role === "admin"
    ? db.members
    : db.members.filter(
        (m) => Number(m.pradeshikamId) === Number(s.pradeshikamId),
      );
document.getElementById("page-content").innerHTML = `
${pageTitle("Donations", "", `<button id="exportDonations" class="btn btn-outline-primary export-icon-btn" title="Download CSV" aria-label="Download CSV"><i class="bi bi-download" aria-hidden="true"></i></button>`)}
<div class="row g-3 mb-4"><div class="col-md-4"><div class="stat-card"><div class="stat-label">Total Donations</div><div class="stat-value" id="donationTotal">₹0</div></div></div><div class="col-md-4"><div class="stat-card"><div class="stat-label">Member Donations</div><div class="stat-value" id="memberDonationTotal">₹0</div></div></div><div class="col-md-4"><div class="stat-card"><div class="stat-label">Other Donations</div><div class="stat-value" id="otherDonationTotal">₹0</div></div></div></div>
<div class="panel mb-4" id="donationAddPanel"><div class="panel-title mb-3">Add Donation</div><form id="donationForm" novalidate><div class="row g-3">
<div class="col-md-4"><label class="form-label">Donation Source / സംഭാവനയുടെ ഉറവിടം *</label><select id="sourceType" class="form-select" required><option value="Member">Member</option><option value="Shop">Shop</option><option value="Organization">Organization</option><option value="Other">Other</option></select></div>
<div class="col-md-4" id="memberField"><label class="form-label">Member / അംഗം *</label><div class="member-picker"><input id="memberSearch" class="form-control" placeholder="Search name, phone or house number" autocomplete="off"><input id="donorMember" type="hidden"><div id="memberResults" class="member-results d-none"></div><div id="selectedMember" class="selected-member d-none"></div></div></div>
<div class="col-md-4" id="nameField"><label class="form-label">Donor / Organization Name / ദാതാവ് / സ്ഥാപനത്തിന്റെ പേര് *</label><input id="donorName" class="form-control"></div>
<div class="col-md-4" id="phoneField"><label class="form-label">Phone Number / ഫോൺ നമ്പർ *</label><div class="phone-field"><select id="donorPhoneCode" class="form-select" aria-label="Country code"><option value="+91">+91</option><option value="+971">+971</option></select><input id="donorPhone" class="form-control" type="tel" inputmode="numeric" maxlength="10" placeholder="10-digit number"></div></div>
<div class="col-md-4" id="donationPradeshikamField"><label class="form-label">Pradeshikam / പ്രദേശികം *</label>${s.role === "admin" ? `<select id="donationPradeshikam" class="form-select" required><option value="">Select Pradeshikam</option>${db.pradeshikams.map((p) => `<option value="${p.id}">${escapeHTML(p.name)}</option>`).join("")}</select>` : `<input id="donationPradeshikam" class="form-control" value="${escapeHTML(db.pradeshikams.find((p) => p.id === s.pradeshikamId)?.name || "")}" disabled>`}</div>
<div class="col-md-4"><label class="form-label">Amount / തുക *</label><input id="donationAmount" type="number" min="1" step="1" class="form-control" required></div><div class="col-md-4"><label class="form-label">Receipt Number / രസീത് നമ്പർ *</label><input id="donationReceipt" class="form-control" required></div>
<div class="col-md-4"><label class="form-label">Payment Mode / പേയ്മെന്റ് രീതി *</label><select id="donationMode" class="form-select" required><option>Cash</option><option>UPI</option><option>Bank</option><option>Cheque</option></select></div><div class="col-md-4"><label class="form-label">Date / തീയതി *</label><input id="donationDate" type="date" class="form-control" required></div><div class="col-md-4"><label class="form-label">Remarks / അഭിപ്രായങ്ങൾ</label><input id="donationRemarks" class="form-control"></div>
</div><div id="donationError" class="alert alert-danger d-none mt-3"></div><div class="d-flex justify-content-end mt-4"><button class="btn btn-primary"><i class="bi bi-gift me-1"></i>Save Donation</button></div></form></div>
<div class="panel"><div class="row g-2 mb-3"><div class="col-md-6"><input id="searchDonation" class="form-control" placeholder="Search donor, house, receipt or Pradeshikam"></div>${s.role === "admin" ? `<div class="col-md-4"><select id="filterPr" class="form-select"><option value="">All Pradeshikams</option>${db.pradeshikams.map((p) => `<option value="${p.id}">${escapeHTML(p.name)}</option>`).join("")}</select></div>` : ""}<div class="col-md-2"><select id="filterSource" class="form-select"><option value="">All sources</option><option>Member</option><option>Shop</option><option>Organization</option><option>Other</option></select></div></div><div id="donationTable"></div></div>`;
function todayValue() {
  const d = new Date();
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 10);
}
function chooseMemberDonationAllocation(member, amount, balance, householdBalance) {
  return new Promise((resolve) => {
    const applied = Math.min(amount, balance), excess = Math.max(0, amount - applied);
    const houseApplied = Math.min(amount, householdBalance), houseExcess = Math.max(0, amount - houseApplied);
    const ml = document.documentElement.lang === "ml";
    const label = (en, mlText) => ml ? mlText : en;
    const overlay = document.createElement("div");
    overlay.className = "fcms-modal-overlay";
    overlay.innerHTML = `<div class="fcms-modal fcms-modal-tone-primary fcms-donation-choice" role="dialog" aria-modal="true" aria-labelledby="donationChoiceTitle">
      <div class="fcms-modal-icon"><i class="bi bi-arrow-left-right"></i></div>
      <div class="fcms-modal-title" id="donationChoiceTitle">${label("How should this amount be recorded?", "ഈ തുക എങ്ങനെ രേഖപ്പെടുത്തണം?")}</div>
      <div class="fcms-modal-body"><b>${escapeHTML(member.name)}</b> ${label(`has ${money(balance)} remaining; the household has ${money(householdBalance)} remaining.`, `അടയ്ക്കാൻ ${money(balance)} ബാക്കിയുണ്ട്; വീട്ടിലെ ആകെ ബാക്കി ${money(householdBalance)} ആണ്.`)}</div>
      <div class="fcms-donation-choice-preview">
        <div><span>${label("Keep as full donation", "മുഴുവൻ സംഭാവനയായി രേഖപ്പെടുത്തുക")}</span><b>${money(amount)} ${label("donation", "സംഭാവന")}</b></div>
        <div><span>${label("Pay selected member first", "തിരഞ്ഞെടുത്ത അംഗത്തിന്റെ തുക ആദ്യം അടയ്ക്കുക")}</span><b>${money(applied)} ${label("payment", "പേയ്മെന്റ്")}${excess ? ` + ${money(excess)} ${label("donation", "സംഭാവന")}` : ""}</b></div>
        <div><span>${label("Pay entire household first", "വീട്ടിലെ എല്ലാ അംഗങ്ങളുടെയും ബാക്കി ആദ്യം അടയ്ക്കുക")}</span><b>${money(houseApplied)} ${label("payment", "പേയ്മെന്റ്")}${houseExcess ? ` + ${money(houseExcess)} ${label("donation", "സംഭാവന")}` : ""}</b></div>
      </div>
      <div class="fcms-modal-actions fcms-donation-choice-actions"><button type="button" class="btn btn-light" data-choice="cancel">${label("Cancel", "റദ്ദാക്കുക")}</button><button type="button" class="btn btn-outline-primary" data-choice="donation">${label("Full Donation", "മുഴുവൻ സംഭാവന")}</button><button type="button" class="btn btn-outline-primary" data-choice="member">${label("Selected Member First", "തിരഞ്ഞെടുത്ത അംഗം ആദ്യം")}</button><button type="button" class="btn btn-primary" data-choice="house">${label("Entire House First", "മുഴുവൻ വീടും ആദ്യം")}</button></div>
    </div>`;
    document.body.appendChild(overlay);
    if (typeof applyFcmsMalayalamToDom === "function") applyFcmsMalayalamToDom(overlay);
    requestAnimationFrame(() => overlay.classList.add("show"));
    let settled = false;
    const onKey = (event) => { if (event.key === "Escape") close(null); };
    const close = (choice) => {
      if (settled) return;
      settled = true;
      document.removeEventListener("keydown", onKey);
      overlay.classList.remove("show");
      setTimeout(() => overlay.remove(), 200);
      resolve(choice);
    };
    document.addEventListener("keydown", onKey);
    overlay.querySelectorAll("[data-choice]").forEach((button) => button.addEventListener("click", () => close(button.dataset.choice === "cancel" ? null : button.dataset.choice)));
  });
}
document.getElementById("donationDate").value = todayValue();
function updateSourceFields() {
  const type = document.getElementById("sourceType").value,
    isMember = type === "Member";
  document.getElementById("memberField").style.display = isMember
    ? "block"
    : "none";
  document.getElementById("nameField").style.display = isMember
    ? "none"
    : "block";
  document.getElementById("phoneField").style.display = isMember
    ? "none"
    : "block";
  document.getElementById("donationPradeshikamField").style.display = isMember
    ? "none"
    : "block";
  document.getElementById("donorMember").required = isMember;
  document.getElementById("donorName").required = !isMember;
  document.getElementById("donorPhone").required = !isMember;
  if (isMember) {
    document.getElementById("donorPhone").value = "";
    document.getElementById("memberSearch").focus();
  } else {
    document.getElementById("memberSearch").value = "";
    document.getElementById("memberResults").classList.add("d-none");
    document.getElementById("selectedMember").classList.add("d-none");
    document.getElementById("donorMember").value = "";
    if (s.role === "admin") document.getElementById("donationPradeshikam").value = "";
  }
}
function allDonations() {
  return (db.donations || []).filter(
    (d) =>
      s.role === "admin" || Number(d.pradeshikamId) === Number(s.pradeshikamId),
  );
}
function donationView(d) {
  const donor = d.donorMemberId
    ? db.members.find((m) => m.id === d.donorMemberId)
    : null;
  const pr = db.pradeshikams.find(
    (p) => Number(p.id) === Number(d.pradeshikamId),
  );
  return {
    d,
    donor,
    pr,
    name: d.donorName || donor?.name || d.sourceLabel || "-",
    house: d.houseNumber || donor?.houseNumber || "-",
  };
}
function renderMemberResults() {
  const q = document.getElementById("memberSearch").value.trim().toLowerCase();
  const box = document.getElementById("memberResults");
  if (!q) {
    box.innerHTML = "";
    box.classList.add("d-none");
    return;
  }
  const arr = visibleMembers
    .filter(
      (m) =>
        [m.name, m.phone, m.houseNumber, m.memberCode, m.countryCode]
          .join(" ")
          .toLowerCase()
          .includes(q),
    )
    .slice(0, window.innerWidth <= 575 ? 5 : 6);
  box.innerHTML = !arr.length
    ? `<div class="member-result-empty">No matching member</div>`
    : arr
        .map(
          (m) =>
            `<button type="button" class="member-result" data-id="${escapeHTML(m.id)}"><span><b>${escapeHTML(m.name || "-")}</b><small>${escapeHTML(formatPhone(m.phone, m.countryCode))} &middot; House ${escapeHTML(m.houseNumber || "-")}</small></span><i class="bi bi-chevron-right"></i></button>`,
        )
        .join("");
  box.classList.remove("d-none");
  box
    .querySelectorAll(".member-result")
    .forEach((btn) =>
      btn.addEventListener("click", () => selectMember(btn.dataset.id)),
    );
}
function selectMember(id) {
  const m = visibleMembers.find((x) => String(x.id) === String(id));
  if (!m) return;
  document.getElementById("donorMember").value = m.id;
  // Keep the canonical donor name synchronized even though the manual-name
  // field is hidden for Member donations. This prevents stale/native required
  // validation from ever treating a selected member as nameless.
  document.getElementById("donorName").value = m.name || "";
  document.getElementById("memberSearch").value = "";
  document.getElementById("memberResults").classList.add("d-none");
  const sel = document.getElementById("selectedMember");
  const pr = db.pradeshikams.find((p) => Number(p.id) === Number(m.pradeshikamId));
  sel.innerHTML = `<span><b>${escapeHTML(m.name || "-")}</b><small>${escapeHTML(formatPhone(m.phone, m.countryCode))} &middot; House ${escapeHTML(m.houseNumber || "-")} &middot; ${escapeHTML(fcmsPradeshikamLabel(pr?.name || "-"))}</small></span><button type="button" class="btn btn-sm btn-light" id="clearMember">Change</button>`;
  sel.classList.remove("d-none");
  if (s.role === "admin")
    document.getElementById("donationPradeshikam").value = m.pradeshikamId;
  document.getElementById("clearMember").addEventListener("click", () => {
    document.getElementById("donorMember").value = "";
    document.getElementById("donorName").value = "";
    sel.classList.add("d-none");
    document.getElementById("memberSearch").focus();
  });
}
function render() {
  const q = (
      document.getElementById("searchDonation").value || ""
    ).toLowerCase(),
    pid = document.getElementById("filterPr")?.value || "",
    src = document.getElementById("filterSource").value;
  const rows = allDonations()
    .map(donationView)
    .filter((x) => !pid || Number(x.d.pradeshikamId) === Number(pid))
    .filter((x) => !src || x.d.sourceType === src)
    .filter((x) => {
      const text = [
        x.name,
        x.house,
        x.d.receiptNumber,
        x.pr?.name,
        x.d.paymentMode,
      ]
        .join(" ")
        .toLowerCase();
      return !q || text.includes(q);
    })
    .sort(
      (a, b) =>
        new Date(b.d.date || b.d.createdAt) -
        new Date(a.d.date || a.d.createdAt),
    );
  const total = rows
      .filter((x) => x.d.status !== "hold")
      .reduce((a, x) => a + Number(x.d.amount || 0), 0),
    memberTotal = rows
      .filter((x) => x.d.sourceType === "Member" && x.d.status !== "hold")
      .reduce((a, x) => a + Number(x.d.amount || 0), 0),
    heldTotal = rows
      .filter((x) => x.d.status === "hold")
      .reduce((a, x) => a + Number(x.d.amount || 0), 0);
  document.getElementById("donationTotal").textContent = money(total);
  document.getElementById("memberDonationTotal").textContent =
    money(memberTotal);
  document.getElementById("otherDonationTotal").textContent = money(
    total - memberTotal,
  );
  document.getElementById("donationTable").innerHTML = !rows.length
    ? `<div class="empty-state"><i class="bi bi-gift"></i>No donations found.</div>`
    : `${heldTotal > 0 ? `<div class="alert alert-primary small mb-3"><i class="bi bi-hourglass-split me-2"></i>${money(heldTotal)} in donations shown below are on Hold and not included in the totals above.</div>` : ""}<div class="table-responsive"><table class="table"><thead><tr><th>Date</th><th>Pradeshikam</th><th>Source</th><th>Donor</th><th>House</th><th>Receipt</th><th>Mode</th><th>Status</th><th>Amount</th><th>Actions</th></tr></thead><tbody>${rows.map((x) => `<tr><td data-label="Date">${new Date(x.d.date || x.d.createdAt).toLocaleDateString("en-IN")}</td><td data-label="Pradeshikam">${escapeHTML(x.pr?.name || "-")}</td><td data-label="Source">${escapeHTML(x.d.sourceType || "Member")}</td><td data-label="Donor">${escapeHTML(x.name)}</td><td data-label="House">${escapeHTML(x.house)}</td><td data-label="Receipt"><b>${escapeHTML(x.d.receiptNumber || x.d.reference || "-")}</b></td><td data-label="Mode">${escapeHTML(x.d.paymentMode || "-")}</td><td data-label="Status">${x.d.status === "hold" ? `<span class="status-badge status-hold">● Hold</span>` : `<span class="status-badge status-green">● Completed</span>`}</td><td data-label="Amount" class="fw-semibold">${money(x.d.amount)}</td><td data-label="Actions"><div class="d-flex gap-1 fcms-inline-actions">${(s.role === "admin" || (s.role === "pradeshikam" && Number(x.d.pradeshikamId) === Number(s.pradeshikamId))) ? `<a class="btn btn-sm btn-light" href="edit-donation.html?id=${encodeURIComponent(x.d.id)}" title="Edit details"><i class="bi bi-pencil"></i></a>` : ""}<button class="btn btn-sm btn-outline-danger delete-donation" data-id="${escapeHTML(x.d.id)}" title="Delete"><i class="bi bi-trash"></i></button></div></td></tr>`).join("")}</tbody></table></div>`;
  document
    .querySelectorAll(".delete-donation")
    .forEach((btn) =>
      btn.addEventListener("click", () => deleteDonation(btn.dataset.id)),
    );
}
async function deleteDonation(id) {
  const d = db.donations.find((x) => String(x.id) === String(id));
  if (!d) return;
  if (s.role !== "admin" && Number(d.pradeshikamId) !== Number(s.pradeshikamId))
    return;
  const ok = await confirmDialog(
    `Delete donation receipt ${d.receiptNumber} for ${money(d.amount)}?`,
  );
  if (!ok) return;
  addActivity(db, {
    action: "Donation Deleted",
    entityType: "donation",
    entityId: d.id,
    memberId: d.donorMemberId || null,
    pradeshikamId: d.pradeshikamId,
    summary: `Donation ${d.receiptNumber} deleted`,
    details: `${money(d.amount)} donation from ${d.donorName || "donor"}.`,
    oldValue: { ...d },
  });
  db.donations = db.donations.filter((x) => String(x.id) !== String(id));
  fcmsClearPageDraft(); saveDB(db);
  toast("Donation deleted.", "success");
  render();
}
if (listOnly)
  document.getElementById("donationAddPanel").classList.add("d-none");
if (s.role === "admin" && requestedPradeshikam) {
  const prSelect = document.getElementById("filterPr");
  if (prSelect) prSelect.value = requestedPradeshikam;
}
document.getElementById("donorPhone").addEventListener("input", (e) => {
  e.target.value = e.target.value.replace(/\D/g, "").slice(0, 10);
});
document
  .getElementById("sourceType")
  .addEventListener("change", updateSourceFields);
document
  .getElementById("memberSearch")
  .addEventListener("input", renderMemberResults);
document
  .getElementById("memberSearch")
  .addEventListener("focus", renderMemberResults);
document.getElementById("searchDonation").addEventListener("input", fcmsDebounce(render,180));
document.getElementById("filterSource").addEventListener("change", render);
document.getElementById("filterPr")?.addEventListener("change", render);
document.addEventListener("click", (e) => {
  if (!e.target.closest(".member-picker"))
    document.getElementById("memberResults")?.classList.add("d-none");
});
document.getElementById("donationForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const form = e.currentTarget,
    err = document.getElementById("donationError");
  err.classList.add("d-none");
  const failDonationSave = (message, focusEl = null) => {
    err.textContent = message;
    err.classList.remove("d-none");
    if (focusEl) {
      focusEl.classList.add("is-invalid");
      focusEl.focus?.();
    }
    if (typeof toast === "function") toast(message, "error");
    return false;
  };

  form.querySelectorAll(".is-invalid").forEach((el) => el.classList.remove("is-invalid"));

  const type = document.getElementById("sourceType").value,
    memberId = document.getElementById("donorMember").value,
    name = document.getElementById("donorName").value.trim(),
    donorPhoneCode = document.getElementById("donorPhoneCode").value,
    donorPhone = normalizePhone(
      document.getElementById("donorPhone").value || "",
    ),
    amount = Number(document.getElementById("donationAmount").value),
    receipt = document.getElementById("donationReceipt").value.trim(),
    mode = document.getElementById("donationMode").value,
    date = document.getElementById("donationDate").value,
    remarks = document.getElementById("donationRemarks").value.trim(),
    donor = memberId ? db.members.find((m) => String(m.id) === String(memberId)) : null,
    pradeshikamId = donor
      ? donor.pradeshikamId
      : s.role === "admin"
        ? Number(document.getElementById("donationPradeshikam").value || 0)
        : Number(s.pradeshikamId);

  // Validate only fields that apply to the selected donation source.
  // For Member donations, the selected member supplies the donor name/phone,
  // so the hidden non-member donor-name field must never block saving.
  const amountEl = document.getElementById("donationAmount");
  const receiptEl = document.getElementById("donationReceipt");
  const modeEl = document.getElementById("donationMode");
  const dateEl = document.getElementById("donationDate");
  const memberSearchEl = document.getElementById("memberSearch");
  const donorNameEl = document.getElementById("donorName");

  if (type === "Member" && !donor) {
    failDonationSave("Select a member from the search results.", memberSearchEl);
    return;
  }
  if (type !== "Member" && !name) {
    failDonationSave("Enter the donor / organization name.", donorNameEl);
    return;
  }
  if (!amount || amount <= 0) {
    failDonationSave("Enter a valid donation amount.", amountEl);
    return;
  }
  if (!receipt) {
    failDonationSave("Enter the receipt number.", receiptEl);
    return;
  }
  if (!mode) {
    failDonationSave("Select a payment mode.", modeEl);
    return;
  }
  if (!date) {
    failDonationSave("Select the donation date.", dateEl);
    return;
  }
  if (
    type !== "Member" &&
    ((donorPhoneCode === "+91" && donorPhone.length !== 10) ||
      (donorPhoneCode === "+971" &&
        (donorPhone.length < 9 || donorPhone.length > 10)))
  ) {
    failDonationSave(
      "+91 numbers require 10 digits. +971 numbers require 9 or 10 digits.",
      document.getElementById("donorPhone")
    );
    return;
  }
  if (!pradeshikamId) {
    failDonationSave("Select a Pradeshikam.", document.getElementById("donationPradeshikam"));
    return;
  }
  const receiptUsed = (db.donations || []).some(
    (x) =>
      Number(x.pradeshikamId) === Number(pradeshikamId) &&
      String(x.receiptNumber || "").toLowerCase() === receipt.toLowerCase(),
  );
  if (receiptUsed) {
    failDonationSave("This receipt number is already in use.", receiptEl);
    return;
  }
  const transactionId = mode === "UPI" ? fcmsGetUpiTransactionId("donationMode") : "";
  const memberBalance = donor ? memberStats(donor, db).balance : 0;
  const householdMembers = donor
    ? (String(donor.houseNumber || "").trim() ? houseMembersFor(donor, db) : [donor])
    : [];
  const householdBalance = householdMembers.reduce((sum, member) => sum + memberStats(member, db).balance, 0);
  let allocationChoice = "donation";
  if (donor && householdBalance > 0) {
    if (form.dataset.allocationChoiceOpen === "true") return;
    form.dataset.allocationChoiceOpen = "true";
    allocationChoice = await chooseMemberDonationAllocation(donor, amount, memberBalance, householdBalance);
    delete form.dataset.allocationChoiceOpen;
    if (!allocationChoice) return;
  }
  let paymentRemaining = amount;
  const paymentTargets = allocationChoice === "house"
    ? [donor, ...householdMembers.filter((member) => member.id !== donor.id)]
    : allocationChoice === "member" ? [donor] : [];
  const paymentParts = [];
  paymentTargets.forEach((member) => {
    if (paymentRemaining <= 0) return;
    const applied = Math.min(paymentRemaining, memberStats(member, db).balance);
    if (applied > 0) {
      paymentParts.push({ member, amount: applied });
      paymentRemaining -= applied;
    }
  });
  const paymentAmount = paymentParts.reduce((sum, part) => sum + part.amount, 0);
  const donationAmount = amount - paymentAmount;
  const commonDate = new Date(date + "T12:00:00").toISOString();
  const splitId = paymentAmount && donationAmount ? uid("split") : null;
  const donation = donationAmount > 0 ? {
    id: uid("don"),
    donorMemberId: donor?.id || null,
    donorName: donor?.name || name,
    pradeshikamId,
    houseNumber: donor?.houseNumber || "",
    amount: donationAmount,
    receiptNumber: receipt,
    sourceType: type,
    sourceLabel: type,
    donorPhone: type === "Member" ? donor?.phone || "" : donorPhone,
    donorPhoneCode:
      type === "Member" ? donor?.countryCode || "+91" : donorPhoneCode,
    paymentMode: mode,
    transactionId,
    status: "completed",
    date: commonDate,
    remarks,
    createdAt: new Date().toISOString(),
    splitPaymentId: splitId,
  } : null;
  const payments = paymentParts.map((part) => ({
    id: uid("pay"), memberId: part.member.id, receiptNumber: receipt,
    amount: part.amount, paymentMode: mode, transactionId,
    status: "completed", remarks, paymentDate: commonDate,
    paidByMemberId: donor.id, splitDonationId: splitId,
    householdDonationAllocation: allocationChoice === "house",
    createdAt: new Date().toISOString(),
  }));
  const activityStart = (db.activities || []).length;
  try {
    payments.forEach((payment) => {
      const paidMember = paymentParts.find((part) => part.member.id === payment.memberId)?.member;
      fcmsMarkNewElectronicPending(payment);
      db.payments.push(payment);
      addActivity(db, {
        action: "Payment Added", entityType: "payment", entityId: payment.id,
        memberId: payment.memberId, pradeshikamId,
        summary: `${money(payment.amount)} applied to required amount`,
        details: `${paidMember?.name || donor.name}'s required balance was paid from receipt ${receipt}, paid by ${donor.name}.`,
        newValue: paymentSnapshot(payment),
      });
    });
    if (donation) {
      fcmsMarkNewElectronicPending(donation);
      db.donations.push(donation);
      addActivity(db, {
        action: "Donation Added", entityType: "donation", entityId: donation.id,
        memberId: donor?.id || null, pradeshikamId,
        summary: `${money(donationAmount)} donation recorded`,
        details: `${type} donation from ${donation.donorName} with receipt ${receipt}.${paymentAmount ? ` ${money(paymentAmount)} was applied to the member's required amount first.` : ""}`,
        newValue: donationSnapshot(donation),
      });
    }

    saveDB(db);
    fcmsClearPageDraft();

    form.reset();
    document.getElementById("donationDate").value = todayValue();
    updateSourceFields();
    render();

    if (typeof toast === "function") {
      const ml = document.documentElement.lang === "ml";
      const paymentTarget = allocationChoice === "house"
        ? (ml ? `വീട് ${donor.houseNumber}` : `house ${donor.houseNumber}`)
        : donor?.name;
      const successMessage = payments.length && donation
        ? (ml ? `${paymentTarget}: ${money(paymentAmount)} പേയ്മെന്റും ${money(donationAmount)} സംഭാവനയും സേവ് ചെയ്തു.` : `Saved — ${money(paymentAmount)} payment for ${paymentTarget} and ${money(donationAmount)} donation.`)
        : payments.length
          ? (ml ? `${paymentTarget}: ${money(paymentAmount)} ആവശ്യമായ തുകയിലേക്ക് ചേർത്തു.` : `Saved — ${money(paymentAmount)} applied to the required amount for ${paymentTarget}.`)
          : (ml ? `${donation.donorName}: ${money(donationAmount)} സംഭാവന സേവ് ചെയ്തു · രസീത് ${receipt}.` : `Donation saved successfully — ${donation.donorName} · ${money(donationAmount)} · Receipt ${receipt}.`);
      toast(
        successMessage,
        "success"
      );
    }
  } catch (saveError) {
    // Roll back the in-memory record if persistence fails.
    if (donation) db.donations = (db.donations || []).filter((x) => String(x.id) !== String(donation.id));
    if (payments.length) {
      const paymentIds = new Set(payments.map((payment) => String(payment.id)));
      db.payments = (db.payments || []).filter((x) => !paymentIds.has(String(x.id)));
    }
    if (db.activities && db.activities.length > activityStart) db.activities.splice(0, db.activities.length - activityStart);
    failDonationSave("Donation was not saved. Please try again.");
    console.error("Donation save failed:", saveError);
    return;
  }
});
updateSourceFields();
document.getElementById("exportDonations").addEventListener("click", () => {
  const rows = allDonations().map((d) => {
    const donor = d.donorMemberId
        ? db.members.find((m) => m.id === d.donorMemberId)
        : null,
      pr = db.pradeshikams.find(
        (p) => Number(p.id) === Number(d.pradeshikamId),
      );
    return {
      Date: new Date(d.date || d.createdAt).toLocaleString("en-IN"),
      Pradeshikam: pr?.name || "",
      Source: d.sourceType || "Member",
      Donor: d.donorName || donor?.name || "",
      House: d.houseNumber || donor?.houseNumber || "",
      Receipt: d.receiptNumber || "",
      Amount: d.amount,
      PaymentMode: d.paymentMode || "",
      TransactionID: d.transactionId || "",
      Remarks: d.remarks || "",
    };
  });
  exportCSV(rows, "fcms-donations.csv");
});
render();
