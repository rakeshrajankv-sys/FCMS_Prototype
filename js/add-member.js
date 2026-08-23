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
function renderRows() {
  const count = Number(document.getElementById("memberCount").value) || 1;
  document.getElementById("memberRows").innerHTML = Array.from(
    { length: count },
    (_, i) => memberRow(i),
  ).join("");
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
function saveHousehold(hold) {
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
  const duplicateHouse = db.members.find(
    (m) =>
      m.pradeshikamId === pradeshikamId &&
      houseKey(m.houseNumber) === houseKey(house),
  );
  if (duplicateHouse) {
    err.textContent = `House ${house} already exists. Use View/Edit Member for an existing household.`;
    err.classList.remove("d-none");
    return;
  }
  const validAge = draft.every(
    (m) => Number(m.age) >= 1 && Number(m.age) <= 100,
  );
  if (!validAge) {
    err.textContent = "Age must be between 1 and 100.";
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
  const status = hold ? "hold" : "completed";
  const holdNote = hold
    ? " Marked Hold — receipt issued, payment to be collected and confirmed later."
    : "";
  const created = [];
  draft.forEach((d) => {
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
  });
  let remaining = total,
    allocated = 0;
  created.forEach((m, i) => {
    if (remaining <= 0) return;
    const due = Number(m.requiredAmount) || 0;
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
  const donationAmount = Math.max(0, total - allocated);
  if (hold && total === 0) {
    if (receiptMode === "one") {
      const payer = created[payerIndex] || created[0];
      const payment = {
        id: uid("pay"),
        memberId: payer.id,
        receiptNumber: masterReceipt,
        masterReceiptNumber: masterReceipt,
        amount: 0,
        paymentMode: mode,
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
      created.forEach((m, i) => {
        const rec = draft[i].receiptNumber;
        const payment = {
          id: uid("pay"),
          memberId: m.id,
          receiptNumber: rec,
          masterReceiptNumber: null,
          amount: 0,
          paymentMode: mode,
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
    const donor = created[payerIndex] || created[0];
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
      details: `Household ${house} created with ${created.length} members.${holdNote}`,
      newValue: memberSnapshot(m),
    }),
  );
  saveDB(db);
  location.href = "members.html";
}
