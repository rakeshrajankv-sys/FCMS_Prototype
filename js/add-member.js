const db = getDB(),
  s = currentSession();
markActive();
const myCommittee =
  s.role === "subcommittee"
    ? db.subCommittees.find((c) => Number(c.id) === Number(s.subCommitteeId))
    : null;
const isAdminLike = s.role === "admin" || !!myCommittee?.financeAccess;
if (s.role === "subcommittee" && !myCommittee?.financeAccess) {
  location.href = "dashboard.html";
}
const allowedPradeshikams = isAdminLike
  ? db.pradeshikams
  : [db.pradeshikams.find((p) => p.id === s.pradeshikamId)];
const lockedPr = allowedPradeshikams[0];

document.getElementById("page-content").innerHTML = `
${pageTitle("Add Member", "", "")}
<div class="panel form-card">
<form id="householdForm" novalidate>
<h6 class="fw-bold mb-3">Household Details</h6>
<div class="row g-3">
<div class="col-md-4"><label class="form-label">House Number / വീടിന്റെ നമ്പർ *</label><input id="house" class="form-control" type="text" inputmode="text" autocomplete="off" required placeholder="e.g. PP001"></div>
<div class="col-md-4"><label class="form-label">Number of Members / അംഗങ്ങളുടെ എണ്ണം *</label><select id="memberCount" class="form-select" required>${Array.from({ length: 20 }, (_, i) => `<option value="${i + 1}">${i + 1} member${i ? "s" : ""}</option>`).join("")}</select></div>
<div class="col-md-4"><label class="form-label">Pradeshikam / പ്രദേശികം *</label>${isAdminLike ? `<select id="pradeshikam" class="form-select" required><option value="">Select Pradeshikam</option>${db.pradeshikams.map((p) => `<option value="${p.id}">${escapeHTML(p.name)}</option>`).join("")}</select>` : `<input id="pradeshikam" class="form-control" value="${escapeHTML(lockedPr?.name || "")}" disabled>`}</div>
<div class="col-md-4"><label class="form-label">Receipt Setup / രസീത് ക്രമീകരണം *</label><select id="receiptMode" class="form-select"><option value="one">One receipt</option><option value="each">Receipt to each member</option></select></div>
</div>
<div id="memberRows" class="mt-4"></div>
<hr class="my-4">
<h6 class="fw-bold mb-3">Payment / Donation</h6>
<div class="row g-3">
<div class="col-md-4"><label class="form-label">Amount Received / ലഭിച്ച തുക *</label><input id="totalAmount" type="number" min="0" step="1" class="form-control" required placeholder="Enter amount received"></div>
<div class="col-md-4" id="houseReceiptField"><label class="form-label">Receipt Number / രസീത് നമ്പർ *</label><input id="receipt" class="form-control" required></div>
<div class="col-md-4"><label class="form-label">Received From / ലഭിച്ചത് ആരിൽ നിന്ന് *</label><select id="payerIndex" class="form-select" required></select></div>
<div class="col-md-4"><label class="form-label">Payment Mode / പേയ്മെന്റ് രീതി *</label><select id="mode" class="form-select" required><option>Cash</option><option>UPI</option><option>Bank</option><option>Cheque</option></select></div>
<div class="col-md-4"><label class="form-label">Date / തീയതി *</label><input id="transactionDate" type="date" class="form-control" required></div>
<div class="col-12"><label class="form-label">Remarks / അഭിപ്രായങ്ങൾ</label><textarea id="remarks" class="form-control" rows="2"></textarea></div>
</div>
<div id="allocationPreview" class="d-none"></div>
<div id="formError" class="alert alert-danger d-none mt-3"></div>
<div class="d-flex justify-content-end gap-2 mt-4"><a href="members.html" class="btn btn-light">Cancel</a><button type="button" id="saveHoldBtn" class="btn btn-outline-primary"><i class="bi bi-hourglass-split me-1"></i>Save Member &amp; Hold</button><button type="submit" class="btn btn-primary"><i class="bi bi-person-plus me-1"></i>Save Members</button></div>
</form></div>`;

function selectedPradeshikamId() {
  return isAdminLike
    ? Number(document.getElementById("pradeshikam").value)
    : Number(s.pradeshikamId);
}
function todayValue() {
  const d = new Date();
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 10);
}
document.getElementById("transactionDate").value = todayValue();
function memberRow(i) {
  return `<div class="panel mb-3 household-member-row"><div class="d-flex justify-content-between align-items-center mb-3"><div class="fw-bold">Member ${i + 1}</div><span class="small text-muted" id="req-${i}">Required: ₹0</span></div><div class="row g-3"><div class="col-md-4"><label class="form-label">Name / പേര് *</label><input id="name-${i}" class="form-control member-name" data-i="${i}" required></div><div class="col-md-2"><label class="form-label">Gender / ലിംഗം *</label><select id="gender-${i}" class="form-select member-gender" data-i="${i}" required><option value="">Select</option><option>Male</option><option>Female</option></select></div><div class="col-md-2"><label class="form-label">Age / പ്രായം *</label><input id="age-${i}" type="number" min="1" max="100" class="form-control member-age" data-i="${i}" required></div><div class="col-md-4"><div id="collectable-${i}" class="collectable-option" hidden><label class="form-label d-block">Collectable? / പിരിവ് വേണോ?</label><div class="d-flex flex-wrap gap-3"><div class="form-check form-check-inline"><input class="form-check-input member-collectable" type="radio" name="collectable-${i}" id="collectable-yes-${i}" value="yes" checked><label class="form-check-label" for="collectable-yes-${i}">Yes / വേണം</label></div><div class="form-check form-check-inline"><input class="form-check-input member-collectable" type="radio" name="collectable-${i}" id="collectable-no-${i}" value="no"><label class="form-check-label" for="collectable-no-${i}">No / വേണ്ട</label></div></div></div></div><div class="col-md-2"><label class="form-label">Marital Status / വൈവാഹിക നില *</label><select id="marital-${i}" class="form-select member-marital" data-i="${i}" required><option value="">Select</option><option>Single</option><option>Married</option><option>Widower</option></select></div><div class="col-md-3"><label class="form-label">Phone / ഫോൺ *</label><div class="phone-field"><select id="country-${i}" class="form-select member-country" data-i="${i}" aria-label="Country code"><option value="+91">+91</option><option value="+971">+971</option></select><input id="phone-${i}" class="form-control member-phone" data-i="${i}" inputmode="numeric" type="tel" maxlength="10" placeholder="10-digit number" required></div></div>${document.getElementById("receiptMode")?.value === "each" ? `<div class="col-md-4"><label class="form-label">Member Receipt / അംഗത്തിന്റെ രസീത് *</label><input id="memberReceipt-${i}" class="form-control member-receipt" data-i="${i}" required></div>` : ""}</div></div>`;
}
function snapshotHouseholdMemberRows() {
  return [...document.querySelectorAll(".household-member-row")].map((row) => {
    const values = {};
    row.querySelectorAll("input,select,textarea").forEach((field) => {
      if (!field.id) return;
      values[field.id] = field.type === "radio" || field.type === "checkbox"
        ? { checked: field.checked }
        : { value: field.value };
    });
    return values;
  });
}
function restoreHouseholdMemberRows(snapshot, count) {
  snapshot.slice(0, count).forEach((values) => {
    Object.entries(values).forEach(([id, saved]) => {
      const field = document.getElementById(id);
      if (!field) return;
      if (Object.prototype.hasOwnProperty.call(saved, "checked")) field.checked = saved.checked;
      else field.value = saved.value ?? "";
    });
  });
}
function renderRows() {
  const count = Number(document.getElementById("memberCount").value) || 1;
  const savedRows = snapshotHouseholdMemberRows();
  document.getElementById("memberRows").innerHTML = Array.from(
    { length: count },
    (_, i) => memberRow(i),
  ).join("");
  document
    .querySelectorAll(".member-age")
    .forEach((field) => field.setAttribute("max", "99"));
  restoreHouseholdMemberRows(savedRows, count);
  Array.from({ length: count }, (_, i) => i).forEach(updateCollectableUI);
  renderPayers();
  document
    .querySelectorAll(
      ".member-gender,.member-age,.member-phone,.member-country,.member-marital,.member-collectable",
    )
    .forEach((el) => el.addEventListener("input", () => {
      updateCollectableUI(el.dataset.i);
      updateRequiredAmountUI();
      updatePreview();
    }));
  document
    .querySelectorAll(".member-name")
    .forEach((el) => el.addEventListener("input", renderPayers));
  updatePreview();
}
function updateRequiredAmountUI() {
  const members = getDraftMembers();
  members.forEach((m) => {
    const el = document.getElementById(`req-${m.index}`);
    if (el) el.textContent = `Required: ${money(m.requiredAmount)}`;
  });
}
function getDraftMembers() {
  const count = Number(document.getElementById("memberCount").value) || 1;
  return Array.from({ length: count }, (_, i) => {
    const gender = document.getElementById(`gender-${i}`)?.value || "";
    const age = Number(document.getElementById(`age-${i}`)?.value) || 0;
    return {
      index: i,
      name: document.getElementById(`name-${i}`)?.value.trim() || "",
      gender,
      age,
      maritalStatus: document.getElementById(`marital-${i}`)?.value || "",
      countryCode: document.getElementById(`country-${i}`)?.value || "+91",
      phone: normalizePhone(document.getElementById(`phone-${i}`)?.value || ""),
      collectable:
        age >= 21
          ? document.querySelector(`input[name="collectable-${i}"]:checked`)?.value !== "no"
          : false,
      requiredAmount: requiredAmount(
        gender,
        age,
        age >= 21
          ? document.querySelector(`input[name="collectable-${i}"]:checked`)?.value !== "no"
          : false,
      ),
      receiptNumber:
        document.getElementById(`memberReceipt-${i}`)?.value.trim() || "",
    };
  });
}
function updateCollectableUI(index) {
  const age = Number(document.getElementById(`age-${index}`)?.value) || 0;
  const wrap = document.getElementById(`collectable-${index}`);
  if (!wrap) return;
  const show = age >= 21;
  wrap.hidden = !show;
  if (!show) {
    const yes = document.getElementById(`collectable-yes-${index}`);
    if (yes) yes.checked = true;
  }
}
function renderPayers() {
  const current = document.getElementById("payerIndex")?.value || "0";
  const members = getDraftMembers();
  document.getElementById("payerIndex").innerHTML = members
    .map(
      (m) =>
        `<option value="${m.index}">Member ${m.index + 1}${m.name ? ` — ${escapeHTML(m.name)}` : ""}</option>`,
    )
    .join("");
  if (members.some((m) => String(m.index) === current))
    document.getElementById("payerIndex").value = current;
}
function updateReceiptUI() {
  const each = document.getElementById("receiptMode").value === "each";
  document.getElementById("houseReceiptField").style.display = each
    ? "none"
    : "block";
  document.getElementById("receipt").required = !each;
  renderRows();
}
function updatePreview() {
  renderPayers();
  const members = getDraftMembers(),
    total = Number(document.getElementById("totalAmount").value) || 0;
  let remaining = total,
    allocated = 0;
  const rows = members.map((m) => {
    const pay = Math.min(m.requiredAmount, remaining);
    remaining -= pay;
    allocated += pay;
    return { ...m, pay };
  });
  const donation = Math.max(0, total - allocated);
  document.getElementById("allocationPreview").innerHTML =
    `<div class="fw-semibold mb-2">Payment Summary</div>${rows.map((m) => `<div class="d-flex justify-content-between small py-1"><span>Member ${m.index + 1}${m.name ? ` — ${escapeHTML(m.name)}` : ""}</span><span>Required ${money(m.requiredAmount)} · Payment ${money(m.pay)}</span></div>`).join("")}<hr class="my-2"><div class="d-flex justify-content-between"><span>Collected by Pradeshikam</span><b>${money(allocated)}</b></div><div class="d-flex justify-content-between"><span>Donation</span><b>${money(donation)}</b></div><div class="d-flex justify-content-between"><span>Total received</span><b>${money(total)}</b></div>`;
  members.forEach((m) => {
    const el = document.getElementById(`req-${m.index}`);
    if (el) el.textContent = `Required: ${money(m.requiredAmount)}`;
  });
}

document.getElementById("memberCount").addEventListener("change", renderRows);
document
  .getElementById("receiptMode")
  .addEventListener("change", updateReceiptUI);
document.getElementById("totalAmount").addEventListener("input", updatePreview);
document
  .getElementById("pradeshikam")
  ?.addEventListener("change", updatePreview);
renderRows();
updatePreview();

document.getElementById("householdForm").addEventListener("submit", (e) => {
  e.preventDefault();
  saveHousehold(false);
});
document.getElementById("saveHoldBtn").addEventListener("click", () => {
  saveHousehold(true);
});
function normalizedMemberName(value) {
  return String(value || "").trim().replace(/\s+/g, " ").toLocaleLowerCase("en");
}

async function saveHousehold(hold) {
  const form = document.getElementById("householdForm"),
    err = document.getElementById("formError");
  err.classList.add("d-none");
  let valid = true;
  form.querySelectorAll("[required]").forEach((el) => {
    const empty = !String(el.value || "").trim();
    el.classList.toggle("is-invalid", empty);
    if (empty) valid = false;
  });
  if (!valid) {
    err.textContent = "Please fill in all required fields.";
    err.classList.remove("d-none");
    return;
  }
  const invalidName = Array.from(form.querySelectorAll(".member-name")).find((el) => !isEnglishName(el.value));
  if (invalidName) {
    invalidName.classList.add("is-invalid");
    err.textContent = t("name_english_only");
    err.classList.remove("d-none");
    invalidName.focus();
    return;
  }
  const house = String(document.getElementById("house").value || "").trim(),
    pradeshikamId = selectedPradeshikamId(),
    total = Number(document.getElementById("totalAmount").value),
    mode = document.getElementById("mode").value,
    date = document.getElementById("transactionDate").value,
    remarks = document.getElementById("remarks").value.trim(),
    draft = getDraftMembers(),
    payerIndex = Number(document.getElementById("payerIndex").value),
    receiptMode = document.getElementById("receiptMode").value,
    masterReceipt = document.getElementById("receipt").value.trim();
  if (!pradeshikamId) {
    err.textContent = "Select a Pradeshikam.";
    err.classList.remove("d-none");
    return;
  }
  if (total < 0 || isNaN(total)) {
    err.textContent = "Enter a valid amount received.";
    err.classList.remove("d-none");
    return;
  }
  if (receiptMode === "one" && !masterReceipt) {
    err.textContent = "Receipt number is mandatory.";
    err.classList.remove("d-none");
    return;
  }
  if (receiptMode === "each" && draft.some((m) => !m.receiptNumber)) {
    err.textContent = "Enter a receipt number for every member.";
    err.classList.remove("d-none");
    return;
  }
  // Existing household is allowed: newly added members join the same
  // Pradeshikam + House Number cluster instead of creating a duplicate house.
  const existingHouseMembers = db.members.filter(
    (m) =>
      Number(m.pradeshikamId) === Number(pradeshikamId) &&
      houseKey(m.houseNumber) === houseKey(house),
  );
  const addingToExistingHouse = existingHouseMembers.length > 0;
  const validAge = draft.every(
    (m) => Number(m.age) >= 1 && Number(m.age) <= 99,
  );
  if (!validAge) {
    err.textContent = "Age must be between 1 and 99.";
    err.classList.remove("d-none");
    return;
  }
  const validPhone = draft.every((m) =>
    m.countryCode === "+91"
      ? m.phone.length === 10
      : m.phone.length === 9 || m.phone.length === 10,
  );
  if (!validPhone) {
    err.textContent =
      "+91 numbers require 10 digits. +971 numbers require 9 or 10 digits.";
    err.classList.remove("d-none");
    return;
  }
  const receipts =
    receiptMode === "one" ? [masterReceipt] : draft.map((m) => m.receiptNumber);
  const allExisting = [
    ...db.payments.map((p) => p.receiptNumber),
    ...db.payments.map((p) => p.masterReceiptNumber).filter(Boolean),
  ];
  if (
    receipts.some((r) =>
      allExisting.some(
        (x) => String(x).toLowerCase() === String(r).toLowerCase(),
      ),
    )
  ) {
    err.textContent = "One or more receipt numbers are already in use.";
    err.classList.remove("d-none");
    return;
  }
  if (new Set(receipts.map((r) => r.toLowerCase())).size !== receipts.length) {
    err.textContent = "Receipt numbers must be unique.";
    err.classList.remove("d-none");
    return;
  }
  // A changed phone number must not silently create a duplicate person in the
  // same household. Let the operator decide whether to reuse the existing
  // member or deliberately create a separate member with the same name.
  const matchedExistingMembers = [];
  for (const d of draft) {
    const matches = existingHouseMembers.filter(
      (m) => normalizedMemberName(m.name) === normalizedMemberName(d.name),
    );
    if (!matches.length) {
      matchedExistingMembers.push(null);
      continue;
    }
    const exactPhoneMatch = matches.find(
      (m) =>
        String(m.countryCode || "+91") === String(d.countryCode || "+91") &&
        normalizePhone(m.phone || "") === normalizePhone(d.phone || ""),
    );
    const existing = exactPhoneMatch || matches[0];
    const existingPhone = `${existing.countryCode || "+91"} ${existing.phone || "Not recorded"}`;
    const enteredPhone = `${d.countryCode || "+91"} ${d.phone || "Not recorded"}`;
    if (exactPhoneMatch) {
      const addToExisting = await confirmDialog(
        `${existing.name} already exists in house ${house} with phone ${existingPhone}. This payment will be added under the existing member; a new member will not be created.`,
        {
          title: "Member Already Exists",
          confirmLabel: "Add Payment to Existing Member",
          cancelLabel: "Cancel",
          tone: "primary",
          dismissible: false,
        },
      );
      if (!addToExisting) return;
      matchedExistingMembers.push(existing);
      continue;
    }
    const samePerson = await confirmDialog(
      `${existing.name} already exists in house ${house}. Existing phone: ${existingPhone}. Entered phone: ${enteredPhone}. Is this the same member?`,
      {
        title: "Possible Existing Member",
        confirmLabel: "Same Member — Add Payment",
        cancelLabel: "Different Member — Create New",
        tone: "primary",
        dismissible: false,
      },
    );
    matchedExistingMembers.push(samePerson ? existing : null);
  }
  const status = hold ? "hold" : "completed";
  const holdNote = hold
    ? " Marked Hold — receipt issued, payment to be collected and confirmed later."
    : "";
  const created = [];
  const resolvedMembers = draft.map((d, index) => {
    if (matchedExistingMembers[index]) return matchedExistingMembers[index];
    const member = {
      id: uid("m"),
      memberCode: makeMemberCode(pradeshikamId, db),
      name: d.name,
      gender: d.gender,
      age: d.age,
      maritalStatus: d.maritalStatus,
      countryCode: d.countryCode,
      phone: d.phone,
      houseNumber: house,
      pradeshikamId,
      requiredAmount: d.requiredAmount,
      receiptNumber: receiptMode === "one" ? masterReceipt : d.receiptNumber,
      createdAt: new Date().toISOString(),
    };
    db.members.push(member);
    created.push(member);
    return member;
  });
  let remaining = total,
    allocated = 0;
  // A Hold represents the payer's full promised amount, not money already
  // allocated between contribution and donation. The split is calculated
  // later from the amount actually received when Main Committee confirms it.
  if (hold && total > 0) {
    const payer = resolvedMembers[payerIndex] || resolvedMembers[0];
    const payerDraft = draft[payerIndex] || draft[0];
    const rec = receiptMode === "one" ? masterReceipt : payerDraft.receiptNumber;
    const promisedPayment = {
      id: uid("pay"),
      memberId: payer.id,
      receiptNumber: rec,
      masterReceiptNumber: receiptMode === "one" ? masterReceipt : null,
      amount: total,
      paymentMode: mode,
      transactionId: mode === "UPI" ? fcmsGetUpiTransactionId("mode") : "",
      status: "hold",
      remarks: remarks || "",
      paymentDate: new Date(date + "T12:00:00").toISOString(),
      source: "household-promise",
      promisedAmount: total,
    };
    db.payments.push(promisedPayment);
    addActivity(db, {
      action: "Payment Added (Hold)",
      entityType: "payment",
      entityId: promisedPayment.id,
      memberId: payer.id,
      pradeshikamId,
      summary: `${money(total)} promised by ${payer.name}`,
      details: `Household ${house}. Receipt ${rec}.${holdNote}`,
      newValue: paymentSnapshot(promisedPayment),
    });
    remaining = 0;
    allocated = total;
  }
  resolvedMembers.forEach((m, i) => {
    if (hold && total > 0) return;
    if (remaining <= 0) return;
    const isExisting = !!matchedExistingMembers[i];
    const due = isExisting
      ? Math.max(0, Number(m.requiredAmount || 0) - Number(memberStats(m, db).paid || 0))
      : Number(m.requiredAmount) || 0;
    const pay = Math.min(due, remaining);
    if (pay > 0) {
      const rec =
        receiptMode === "one" ? masterReceipt : draft[i].receiptNumber;
      const payment = {
        id: uid("pay"),
        memberId: m.id,
        receiptNumber: rec,
        masterReceiptNumber: receiptMode === "one" ? masterReceipt : null,
        amount: pay,
        paymentMode: mode,
        transactionId: mode === "UPI" ? fcmsGetUpiTransactionId("mode") : "",
        status,
        remarks: remarks || "",
        paymentDate: new Date(date + "T12:00:00").toISOString(),
        source: "household-collection",
      };
      db.payments.push(payment);
      remaining -= pay;
      allocated += pay;
      addActivity(db, {
        action: hold ? "Payment Added (Hold)" : "Payment Added",
        entityType: "payment",
        entityId: payment.id,
        memberId: m.id,
        pradeshikamId,
        summary: `${money(pay)} ${hold ? "held" : "allocated"} for ${m.name}`,
        details: `Household ${house}. Receipt ${rec}.${holdNote}`,
        newValue: paymentSnapshot(payment),
      });
    }
  });
  const donationAmount = hold && total > 0 ? 0 : Math.max(0, total - allocated);
  if (hold && total === 0) {
    if (receiptMode === "one") {
      const payer = resolvedMembers[payerIndex] || resolvedMembers[0];
      const payment = {
        id: uid("pay"),
        memberId: payer.id,
        receiptNumber: masterReceipt,
        masterReceiptNumber: masterReceipt,
        amount: 0,
        paymentMode: mode,
        transactionId: mode === "UPI" ? fcmsGetUpiTransactionId("mode") : "",
        status,
        remarks: remarks || "",
        paymentDate: new Date(date + "T12:00:00").toISOString(),
        source: "household-collection",
      };
      db.payments.push(payment);
      addActivity(db, {
        action: "Payment Added (Hold)",
        entityType: "payment",
        entityId: payment.id,
        memberId: payer.id,
        pradeshikamId,
        summary: `Receipt ${masterReceipt} held for ${payer.name}`,
        details: `Household ${house}. Receipt reserved with ₹0 recorded.${holdNote}`,
        newValue: paymentSnapshot(payment),
      });
    } else {
      resolvedMembers.forEach((m, i) => {
        const rec = draft[i].receiptNumber;
        const payment = {
          id: uid("pay"),
          memberId: m.id,
          receiptNumber: rec,
          masterReceiptNumber: null,
          amount: 0,
          paymentMode: mode,
          transactionId: mode === "UPI" ? fcmsGetUpiTransactionId("mode") : "",
          status,
          remarks: remarks || "",
          paymentDate: new Date(date + "T12:00:00").toISOString(),
          source: "household-collection",
        };
        db.payments.push(payment);
        addActivity(db, {
          action: "Payment Added (Hold)",
          entityType: "payment",
          entityId: payment.id,
          memberId: m.id,
          pradeshikamId,
          summary: `Receipt ${rec} held for ${m.name}`,
          details: `Household ${house}. Receipt reserved with ₹0 recorded.${holdNote}`,
          newValue: paymentSnapshot(payment),
        });
      });
    }
  }
  if (donationAmount > 0) {
    const donor = resolvedMembers[payerIndex] || resolvedMembers[0];
    const donorReceipt =
      receiptMode === "one"
        ? masterReceipt
        : `${draft[payerIndex]?.receiptNumber || draft[0].receiptNumber}-D`;
    const donation = {
      id: uid("don"),
      donorMemberId: donor.id,
      donorName: donor.name,
      pradeshikamId,
      houseNumber: house,
      amount: donationAmount,
      receiptNumber: donorReceipt,
      masterReceiptNumber: receiptMode === "one" ? masterReceipt : null,
      sourceType: "Member",
      sourceLabel: "Member",
      paymentMode: mode,
      transactionId: mode === "UPI" ? fcmsGetUpiTransactionId("mode") : "",
      status,
      date: new Date(date + "T12:00:00").toISOString(),
      remarks,
      createdAt: new Date().toISOString(),
    };
    db.donations.push(donation);
    addActivity(db, {
      action: hold ? "Donation Added (Hold)" : "Donation Added",
      entityType: "donation",
      entityId: donation.id,
      memberId: donor.id,
      pradeshikamId,
      summary: `${money(donationAmount)} donation ${hold ? "held" : "recorded"}`,
      details: `Household ${house}; donor ${donor.name}; receipt ${donorReceipt}.${holdNote}`,
      newValue: donationSnapshot(donation),
    });
  }
  created.forEach((m) =>
    addActivity(db, {
      action: "Member Added",
      entityType: "member",
      entityId: m.id,
      memberId: m.id,
      pradeshikamId,
      summary: `${m.name} added to house ${house}`,
      details: addingToExistingHouse
        ? `${m.name} added to existing household ${house}. Household now has ${existingHouseMembers.length + created.length} members.${holdNote}`
        : `Household ${house} created with ${created.length} members.${holdNote}`,
      newValue: memberSnapshot(m),
    }),
  );
  fcmsClearPageDraft(); saveDB(db);
  location.href = "members.html";
}


/* FCMS PRESERVE MEMBER DETAILS ON COUNT CHANGE */
(function(){
  function fieldKey(el){
    return el.name || el.id || "";
  }

  function snapshotMemberRows(){
    const rows = [
      ...document.querySelectorAll(
        '[data-member-index], .household-member-row, .member-row, .member-card, .member-section, [id^="member-"], [id^="member_"]'
      )
    ];

    const unique = [];
    const seen = new Set();

    rows.forEach(row=>{
      if(!(row instanceof HTMLElement)) return;
      if(seen.has(row)) return;
      const hasInputs = row.querySelector("input,select,textarea");
      if(!hasInputs) return;
      seen.add(row);
      unique.push(row);
    });

    return unique.map((row,index)=>{
      const values = {};
      row.querySelectorAll("input,select,textarea").forEach(el=>{
        const key = fieldKey(el);
        if(!key) return;

        if(el.type === "checkbox" || el.type === "radio"){
          values[key] = {kind:"checked", value:!!el.checked};
        }else{
          values[key] = {kind:"value", value:el.value};
        }
      });

      return { index, values };
    });
  }

  function restoreMemberRows(snapshot, limit){
    const rows = [
      ...document.querySelectorAll(
        '[data-member-index], .household-member-row, .member-row, .member-card, .member-section, [id^="member-"], [id^="member_"]'
      )
    ].filter(row => row instanceof HTMLElement && row.querySelector("input,select,textarea"));

    const max = Math.min(Number(limit) || rows.length, snapshot.length, rows.length);

    for(let i=0;i<max;i++){
      const saved = snapshot[i]?.values || {};
      const row = rows[i];

      row.querySelectorAll("input,select,textarea").forEach(el=>{
        const key = fieldKey(el);
        if(!key || !(key in saved)) return;

        const item = saved[key];

        if(item.kind === "checked"){
          el.checked = !!item.value;
        }else{
          el.value = item.value ?? "";
        }

        // Re-trigger dependent logic such as gender/age required amount,
        // payment mode fields, receipt-book indicator, etc.
        el.dispatchEvent(new Event("input",{bubbles:true}));
        el.dispatchEvent(new Event("change",{bubbles:true}));
      });
    }

    if(typeof window.fcmsRefreshDynamicReceiptBooks === "function"){
      setTimeout(()=>window.fcmsRefreshDynamicReceiptBooks(),30);
    }
    if(typeof window.fcmsRefreshPublishedReceiptBooks === "function"){
      setTimeout(()=>window.fcmsRefreshPublishedReceiptBooks(),40);
    }
  }

  function isMemberCountControl(el){
    if(!el) return false;
    const key = ((el.id||"")+" "+(el.name||"")+" "+(el.getAttribute?.("aria-label")||"")).toLowerCase();
    return key.includes("membercount") ||
           key.includes("member-count") ||
           key.includes("numberofmembers") ||
           key.includes("number-of-members") ||
           key.includes("memberscount") ||
           key.includes("members-count");
  }

  let pendingSnapshot = null;
  let pendingCount = null;

  // Capture values BEFORE the page's original change listener rebuilds rows.
  document.addEventListener("change", function(e){
    const el = e.target;
    if(!isMemberCountControl(el)) return;

    pendingSnapshot = snapshotMemberRows();
    pendingCount = Number(el.value) || 0;

    // Restore after original synchronous/delayed row rebuild completes.
    setTimeout(()=>{
      if(!pendingSnapshot) return;
      restoreMemberRows(pendingSnapshot, pendingCount);
      pendingSnapshot = null;
      pendingCount = null;
    }, 0);

    setTimeout(()=>{
      if(!pendingSnapshot) return;
      restoreMemberRows(pendingSnapshot, pendingCount);
      pendingSnapshot = null;
      pendingCount = null;
    }, 80);
  }, true);

  window.fcmsSnapshotMemberRows = snapshotMemberRows;
  window.fcmsRestoreMemberRows = restoreMemberRows;
})();


/* Reinforce member-count preservation for direct select/input controls */
document.addEventListener("input", function(e){
  const el=e.target;
  if(!el) return;
  const key=((el.id||"")+" "+(el.name||"")).toLowerCase();
  const isCount =
    key.includes("membercount") ||
    key.includes("member-count") ||
    key.includes("numberofmembers") ||
    key.includes("number-of-members");

  if(!isCount || typeof window.fcmsSnapshotMemberRows!=="function") return;
  el.__fcmsMemberSnapshot = window.fcmsSnapshotMemberRows();
}, true);

document.addEventListener("change", function(e){
  const el=e.target;
  if(!el || !el.__fcmsMemberSnapshot || typeof window.fcmsRestoreMemberRows!=="function") return;

  const snapshot=el.__fcmsMemberSnapshot;
  const count=Number(el.value)||0;

  setTimeout(()=>{
    window.fcmsRestoreMemberRows(snapshot,count);
    delete el.__fcmsMemberSnapshot;
  },100);
}, true);
