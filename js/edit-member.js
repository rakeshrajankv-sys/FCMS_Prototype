const db = getDB(),
  s = currentSession();
markActive();
if (s.role !== "admin") {
  location.href = "members.html";
}
const id = new URLSearchParams(location.search).get("id"),
  member = db.members.find((m) => m.id === id);
if (!member) {
  location.href = "members.html";
} else {
  member.countryCode ||= "+91";
  member.maritalStatus ||= "Single";
  document.getElementById("page-content").innerHTML =
    `${pageTitle("Edit Member")}
<div class="panel form-card"><form id="editMemberForm"><div class="row g-3">
<div class="col-md-6"><label class="form-label">Name / പേര് *</label><input id="name" class="form-control" required value="${escapeHTML(member.name)}"></div>
<div class="col-md-3"><label class="form-label">Gender / ലിംഗം *</label><select id="gender" class="form-select" required><option ${member.gender === "Male" ? "selected" : ""}>Male</option><option ${member.gender === "Female" ? "selected" : ""}>Female</option></select></div>
<div class="col-md-3"><label class="form-label">Age / പ്രായം *</label><input id="age" type="number" min="1" max="100" class="form-control" required value="${member.age}"></div>
<div class="col-md-4"><div id="collectableWrap" class="collectable-option" hidden><label class="form-label d-block">Collectable? / പിരിവ് വേണോ?</label><div class="d-flex flex-wrap gap-3"><div class="form-check form-check-inline"><input class="form-check-input" type="radio" name="collectable" id="collectableYes" value="yes"><label class="form-check-label" for="collectableYes">Yes / വേണം</label></div><div class="form-check form-check-inline"><input class="form-check-input" type="radio" name="collectable" id="collectableNo" value="no"><label class="form-check-label" for="collectableNo">No / വേണ്ട</label></div></div></div></div>
<div class="col-md-4"><label class="form-label">Marital Status / വൈവാഹിക നില *</label><select id="marital" class="form-select" required>${["Single", "Married", "Widower"].map((x) => `<option ${member.maritalStatus === x ? "selected" : ""}>${x}</option>`).join("")}</select></div>
<div class="col-md-4"><label class="form-label">Phone Number / ഫോൺ നമ്പർ *</label><div class="input-group"><select id="country" class="form-select" style="max-width:92px"><option ${member.countryCode === "+91" ? "selected" : ""}>+91</option><option ${member.countryCode === "+971" ? "selected" : ""}>+971</option></select><input id="phone" class="form-control" inputmode="numeric" type="tel" maxlength="10" required value="${escapeHTML(normalizePhone(member.phone || ""))}"></div></div>
<div class="col-md-4"><label class="form-label">House Number / വീടിന്റെ നമ്പർ *</label><input id="house" class="form-control" required value="${escapeHTML(member.houseNumber || "")}"></div>
<div class="col-md-4"><label class="form-label">Pradeshikam / പ്രദേശികം</label><select id="pradeshikam" class="form-select">${db.pradeshikams.map((p) => `<option value="${p.id}" ${Number(member.pradeshikamId) === Number(p.id) ? "selected" : ""}>${escapeHTML(p.name)}</option>`).join("")}</select></div>
</div><div class="receipt-box mt-4">Required amount: <b>${money(member.requiredAmount)}</b></div><div id="formError" class="alert alert-danger d-none mt-3"></div><div class="d-flex justify-content-end gap-2 mt-4"><a href="member-details.html?id=${encodeURIComponent(member.id)}" class="btn btn-light">Cancel</a><button class="btn btn-primary">Save Changes</button></div></form></div>`;
  function syncCollectableUI() {
    const age = Number(document.getElementById("age").value) || 0;
    const wrap = document.getElementById("collectableWrap");
    const yes = document.getElementById("collectableYes");
    const no = document.getElementById("collectableNo");
    const show = age >= 21;
    wrap.hidden = !show;
    if (!show) {
      if (yes) yes.checked = true;
      if (no) no.checked = false;
    }
  }
  const initialCollectable = member.collectable !== false;
  document.getElementById("collectableYes").checked = initialCollectable;
  document.getElementById("collectableNo").checked = !initialCollectable;
  document.getElementById("age").addEventListener("input", syncCollectableUI);
  document.querySelectorAll('input[name="collectable"]').forEach((el) => el.addEventListener("change", syncCollectableUI));
  syncCollectableUI();

  document.getElementById("editMemberForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const nameInput = document.getElementById("name");
    const nameValue = nameInput.value.trim();
    const err = document.getElementById("formError");
    if (!isEnglishName(nameValue)) {
      nameInput.classList.add("is-invalid");
      err.textContent = t("name_english_only");
      err.classList.remove("d-none");
      nameInput.focus();
      return;
    }
    nameInput.classList.remove("is-invalid");
    const country = document.getElementById("country").value,
      phone = normalizePhone(document.getElementById("phone").value),
      updated = {
        ...member,
        name: document.getElementById("name").value.trim(),
        gender: document.getElementById("gender").value,
        age: Number(document.getElementById("age").value),
        maritalStatus: document.getElementById("marital").value,
        countryCode: country,
        phone,
        houseNumber: document.getElementById("house").value.trim(),
        pradeshikamId: Number(document.getElementById("pradeshikam").value),
      };
    updated.collectable = updated.age >= 21
      ? document.querySelector('input[name="collectable"]:checked')?.value !== "no"
      : false;
    updated.requiredAmount = requiredAmount(updated.gender, updated.age, updated.collectable);
    const paidNow = memberStats(member, db).paid;
    if (
      (country === "+91" && phone.length !== 10) ||
      (country === "+971" && (phone.length < 9 || phone.length > 10))
    ) {
      err.textContent =
        "+91 numbers require 10 digits. +971 numbers require 9 or 10 digits.";
      err.classList.remove("d-none");
      return;
    }
    if (updated.age < 1 || updated.age > 100) {
      err.textContent = "Age must be between 1 and 100.";
      err.classList.remove("d-none");
      return;
    }
    if (!updated.collectable && paidNow > 0) {
      err.textContent = `This member already has ${money(paidNow)} collected. They cannot be marked as not collectable.`;
      err.classList.remove("d-none");
      return;
    }
    if (updated.requiredAmount > 0 && paidNow > updated.requiredAmount) {
      err.textContent = `Required amount cannot be below the current paid total of ${money(paidNow)}.`;
      err.classList.remove("d-none");
      return;
    }
    const dup = db.members.find(
      (m) =>
        m.id !== member.id &&
        m.pradeshikamId === updated.pradeshikamId &&
        m.phone === updated.phone &&
        houseKey(m.houseNumber) === houseKey(updated.houseNumber),
    );
    if (dup) {
      err.textContent =
        "Another member already uses this phone number and house number.";
      err.classList.remove("d-none");
      return;
    }
    const old = memberSnapshot(member);
    Object.assign(member, updated);
    addActivity(db, {
      action: "Member Edited",
      entityType: "member",
      entityId: member.id,
      memberId: member.id,
      pradeshikamId: member.pradeshikamId,
      summary: `${member.name} edited`,
      details: "Member information updated by Main Committee.",
      oldValue: old,
      newValue: memberSnapshot(member),
    });
    saveDB(db);
    location.href = "member-details.html?id=" + encodeURIComponent(member.id);
  });
}
