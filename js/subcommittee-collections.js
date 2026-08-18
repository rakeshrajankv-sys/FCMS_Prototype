const db = getDB(),
  s = currentSession();
markActive();
if (s.role !== "admin" && s.role !== "subcommittee") {
  location.href = "dashboard.html";
}
const scParams = new URLSearchParams(location.search);
const allowedCommittees =
  s.role === "admin"
    ? db.subCommittees
    : db.subCommittees.filter((c) => Number(c.id) === Number(s.subCommitteeId));
let selectedCommitteeId =
  s.role === "admin"
    ? Number(scParams.get("committee")) || Number(allowedCommittees[0]?.id)
    : Number(s.subCommitteeId);
if (
  !allowedCommittees.some((c) => Number(c.id) === Number(selectedCommitteeId))
)
  selectedCommitteeId = Number(allowedCommittees[0]?.id);
function committeeName(id) {
  return (
    db.subCommittees.find((c) => Number(c.id) === Number(id))?.name ||
    "Sub Committee"
  );
}
function todayValue() {
  const d = new Date();
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 10);
}
function committee() {
  return db.subCommittees.find(
    (c) => Number(c.id) === Number(selectedCommitteeId),
  );
}
const visibleMembersSC = db.members;
function scCommitteeIcon() {
  return committee()?.icon || "bi-cash-coin";
}
function render() {
  const c = committee();
  if (!c) {
    document.getElementById("page-content").innerHTML = pageTitle(
      "Sub Committee Collections",
    );
    return;
  }
  const selector =
    s.role === "admin"
      ? `<div class="panel mb-4"><label class="form-label">Sub Committee</label><select id="committeeSelect" class="form-select">${db.subCommittees.map((x) => `<option value="${x.id}" ${Number(x.id) === Number(c.id) ? "selected" : ""}>${escapeHTML(x.name)}</option>`).join("")}</select></div>`
      : "";
  document.getElementById("page-content").innerHTML =
    `${pageTitle(`${escapeHTML(c.name)} — Collections`, "", `<button id="exportSC" class="btn btn-outline-primary"><i class="bi bi-download me-1"></i>CSV</button>`)}
${selector}
<div class="row g-3 mb-4"><div class="col-md-4"><div class="stat-card"><div class="stat-label">Total Collected</div><div class="stat-value" id="scTotal">₹0</div></div></div></div>
<div class="panel mb-4"><div class="panel-title mb-3">Add Collection</div><form id="scForm" novalidate><div class="row g-3">
<div class="col-md-3"><label class="form-label">Source *</label><select id="scSource" class="form-select" required><option value="Member">Member</option><option value="Person">Person</option><option value="Shop">Shop</option><option value="Organization">Organization</option><option value="Other">Other</option></select></div>
<div class="col-md-3" id="scMemberField"><label class="form-label">Member *</label><div class="member-picker"><input id="scMemberSearch" class="form-control" placeholder="Search name, phone or house number" autocomplete="off"><input id="scMember" type="hidden"><div id="scMemberResults" class="member-results d-none"></div><div id="scSelectedMember" class="selected-member d-none"></div></div></div>
<div class="col-md-3" id="scNameField"><label class="form-label">Name *</label><input id="scName" class="form-control"></div>
<div class="col-md-3"><label class="form-label">Place *</label><input id="scPlace" class="form-control" required placeholder="Collection location"></div>
<div class="col-md-3" id="scPhoneField"><label class="form-label">Phone Number</label><div class="phone-field"><select id="scPhoneCode" class="form-select" aria-label="Country code"><option value="+91">+91</option><option value="+971">+971</option></select><input id="scPhone" class="form-control" type="tel" inputmode="numeric" maxlength="10" placeholder="10-digit number"></div></div>
<div class="col-md-3"><label class="form-label">Amount *</label><input id="scAmount" type="number" min="1" step="1" class="form-control" required></div>
<div class="col-md-3"><label class="form-label">Receipt Number *</label><input id="scReceipt" class="form-control" required></div>
<div class="col-md-3"><label class="form-label">Payment Mode *</label><select id="scMode" class="form-select" required><option>Cash</option><option>UPI</option><option>Bank</option><option>Cheque</option></select></div>
<div class="col-md-3"><label class="form-label">Date *</label><input id="scDate" type="date" class="form-control" required></div>
<div class="col-12"><label class="form-label">Remarks</label><input id="scRemarks" class="form-control"></div>
</div><div id="scError" class="alert alert-danger d-none mt-3"></div><div class="d-flex justify-content-end mt-4"><button class="btn btn-primary"><i class="bi ${scCommitteeIcon()} me-1"></i>Save Collection</button></div></form></div>
<div class="panel"><div class="row g-2 mb-3"><div class="col-md-8"><input id="scSearch" class="form-control" placeholder="Search name, place, receipt"></div><div class="col-md-4"><select id="scFilterSource" class="form-select"><option value="">All sources</option><option>Member</option><option>Person</option><option>Shop</option><option>Organization</option><option>Other</option></select></div></div><div id="scTable"></div></div>`;
  document.getElementById("scDate").value = todayValue();
  function updateScSourceFields() {
    const type = document.getElementById("scSource").value,
      isMember = type === "Member";
    document.getElementById("scMemberField").style.display = isMember
      ? "block"
      : "none";
    document.getElementById("scNameField").style.display = isMember
      ? "none"
      : "block";
    document.getElementById("scPhoneField").style.display = isMember
      ? "none"
      : "block";
    document.getElementById("scMember").required = isMember;
    document.getElementById("scName").required = !isMember;
    if (isMember) {
      document.getElementById("scPhone").value = "";
    } else {
      document.getElementById("scMemberSearch").value = "";
      document.getElementById("scMemberResults").classList.add("d-none");
      document.getElementById("scSelectedMember").classList.add("d-none");
      document.getElementById("scMember").value = "";
    }
  }
  updateScSourceFields();
  document
    .getElementById("scSource")
    .addEventListener("change", updateScSourceFields);
  function renderScMemberResults() {
    const q = document
      .getElementById("scMemberSearch")
      .value.trim()
      .toLowerCase();
    const box = document.getElementById("scMemberResults");
    const arr = visibleMembersSC
      .filter(
        (m) =>
          !q ||
          [m.name, m.phone, m.houseNumber, m.memberCode]
            .join(" ")
            .toLowerCase()
            .includes(q),
      )
      .slice(0, 30);
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
        btn.addEventListener("click", () => selectScMember(btn.dataset.id)),
      );
  }
  function selectScMember(id) {
    const m = visibleMembersSC.find((x) => x.id === id);
    if (!m) return;
    document.getElementById("scMember").value = m.id;
    document.getElementById("scMemberSearch").value = "";
    document.getElementById("scMemberResults").classList.add("d-none");
    const sel = document.getElementById("scSelectedMember");
    sel.innerHTML = `<span><b>${escapeHTML(m.name || "-")}</b><small>${escapeHTML(formatPhone(m.phone, m.countryCode))} &middot; House ${escapeHTML(m.houseNumber || "-")}</small></span><button type="button" class="btn btn-sm btn-light" id="scClearMember">Change</button>`;
    sel.classList.remove("d-none");
    document.getElementById("scClearMember").addEventListener("click", () => {
      document.getElementById("scMember").value = "";
      sel.classList.add("d-none");
      document.getElementById("scMemberSearch").focus();
    });
  }
  document
    .getElementById("scMemberSearch")
    .addEventListener("focus", renderScMemberResults);
  document
    .getElementById("scMemberSearch")
    .addEventListener("input", renderScMemberResults);
  const rows = (db.subCommitteeCollections || []).filter(
    (x) => Number(x.subCommitteeId) === Number(c.id),
  );
  document.getElementById("scTotal").textContent = money(
    rows.reduce((a, x) => a + Number(x.amount || 0), 0),
  );
  function renderTable() {
    const q = (document.getElementById("scSearch").value || "").toLowerCase(),
      src = document.getElementById("scFilterSource").value;
    const arr = rows
      .filter((x) => !src || x.sourceType === src)
      .filter((x) =>
        !q
          ? true
          : [x.donorName, x.place, x.receiptNumber, x.paymentMode]
              .join(" ")
              .toLowerCase()
              .includes(q),
      )
      .sort(
        (a, b) =>
          new Date(b.date || b.createdAt) - new Date(a.date || a.createdAt),
      );
    document.getElementById("scTable").innerHTML = !arr.length
      ? `<div class="empty-state"><i class="bi ${scCommitteeIcon()}"></i>No collections found.</div>`
      : `<div class="table-responsive"><table class="table"><thead><tr><th>Date</th><th>Source</th><th>Name</th><th>Place</th><th>Receipt</th><th>Mode</th><th>Amount</th><th>Actions</th></tr></thead><tbody>${arr
          .map(
            (x) =>
              `<tr><td data-label="Date">${new Date(x.date || x.createdAt).toLocaleDateString("en-IN")}</td><td data-label="Source">${escapeHTML(x.sourceType || "Person")}</td><td data-label="Name">${escapeHTML(x.donorName || "-")}</td><td data-label="Place">${escapeHTML(x.place || "-")}</td><td data-label="Receipt"><b>${escapeHTML(x.receiptNumber || "-")}</b></td><td data-label="Mode">${escapeHTML(x.paymentMode || "-")}</td><td data-label="Amount" class="fw-semibold">${money(x.amount)}</td><td data-label="Actions"><div class="d-flex gap-1">${s.role === "admin" ? `<a class="btn btn-sm btn-light" href="edit-subcommittee-collection.html?id=${encodeURIComponent(x.id)}" title="Edit"><i class="bi bi-pencil"></i></a>` : ""}<button class="btn btn-sm btn-outline-danger delete-sc" data-id="${escapeHTML(x.id)}" title="Delete"><i class="bi bi-trash"></i></button></div></td></tr>`,
          )
          .join("")}</tbody></table></div>`;
    document
      .querySelectorAll(".delete-sc")
      .forEach((btn) =>
        btn.addEventListener("click", () => deleteCollection(btn.dataset.id)),
      );
  }
  renderTable();
  document.getElementById("scSearch").addEventListener("input", renderTable);
  document
    .getElementById("scFilterSource")
    .addEventListener("change", renderTable);
  if (s.role === "admin")
    document
      .getElementById("committeeSelect")
      .addEventListener("change", (e) => {
        selectedCommitteeId = Number(e.target.value);
        history.replaceState(
          null,
          "",
          `subcommittee-collections.html?committee=${selectedCommitteeId}`,
        );
        render();
      });
  document.getElementById("scPhone").addEventListener("input", (e) => {
    e.target.value = e.target.value.replace(/\D/g, "").slice(0, 10);
  });
  document.getElementById("scForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const form = e.currentTarget,
      err = document.getElementById("scError");
    err.classList.add("d-none");
    let ok = true;
    form.querySelectorAll("[required]").forEach((el) => {
      if (el.offsetParent === null) return;
      const empty = !String(el.value || "").trim();
      el.classList.toggle("is-invalid", empty);
      if (empty) ok = false;
    });
    const isMemberSource =
      document.getElementById("scSource").value === "Member";
    if (isMemberSource && !document.getElementById("scMember").value) {
      ok = false;
    }
    if (!ok) {
      err.textContent = isMemberSource
        ? "Please select a member and fill in all required fields."
        : "Please fill in all required fields.";
      err.classList.remove("d-none");
      return;
    }
    const amount = Number(document.getElementById("scAmount").value),
      receipt = document.getElementById("scReceipt").value.trim();
    if (amount <= 0) {
      err.textContent = "Enter a valid amount.";
      err.classList.remove("d-none");
      return;
    }
    const receiptUsed = (db.subCommitteeCollections || []).some(
      (x) =>
        String(x.receiptNumber || "").toLowerCase() === receipt.toLowerCase(),
    );
    if (receiptUsed) {
      err.textContent = "This receipt number is already in use.";
      err.classList.remove("d-none");
      return;
    }
    const selectedMemberId = document.getElementById("scMember").value;
    const selectedMember = selectedMemberId
      ? visibleMembersSC.find((m) => m.id === selectedMemberId)
      : null;
    const collection = {
      id: uid("scc"),
      subCommitteeId: c.id,
      sourceType: document.getElementById("scSource").value,
      memberId: selectedMember ? selectedMember.id : null,
      donorName: selectedMember
        ? selectedMember.name
        : document.getElementById("scName").value.trim(),
      place: document.getElementById("scPlace").value.trim(),
      donorPhone: selectedMember
        ? normalizePhone(selectedMember.phone || "")
        : normalizePhone(document.getElementById("scPhone").value || ""),
      donorPhoneCode: selectedMember
        ? selectedMember.countryCode || "+91"
        : document.getElementById("scPhoneCode").value,
      amount,
      receiptNumber: receipt,
      paymentMode: document.getElementById("scMode").value,
      date: new Date(
        document.getElementById("scDate").value + "T12:00:00",
      ).toISOString(),
      remarks: document.getElementById("scRemarks").value.trim(),
      createdAt: new Date().toISOString(),
    };
    db.subCommitteeCollections.push(collection);
    addActivity(db, {
      action: "Sub Committee Collection Added",
      entityType: "subCommitteeCollection",
      entityId: collection.id,
      pradeshikamId: null,
      summary: `${committeeName(c.id)}: ${money(amount)} collected from ${collection.donorName}`,
      details: `${collection.sourceType} at ${collection.place}, receipt ${receipt}.`,
      newValue: subCommitteeCollectionSnapshot(collection),
    });
    saveDB(db);
    form.reset();
    render();
  });
  document.getElementById("exportSC").addEventListener("click", () => {
    const data = rows.map((x) => ({
      Date: new Date(x.date || x.createdAt).toLocaleString("en-IN"),
      SubCommittee: committeeName(x.subCommitteeId),
      Source: x.sourceType || "Person",
      Name: x.donorName || "",
      Place: x.place || "",
      Receipt: x.receiptNumber || "",
      Amount: x.amount,
      PaymentMode: x.paymentMode || "",
      Remarks: x.remarks || "",
    }));
    exportCSV(
      data,
      `fcms-${committeeName(c.id).toLowerCase().replace(/\s+/g, "-")}-collections.csv`,
    );
  });
}
function deleteCollection(id) {
  const x = (db.subCommitteeCollections || []).find((c) => c.id === id);
  if (!x) return;
  if (
    s.role !== "admin" &&
    Number(x.subCommitteeId) !== Number(s.subCommitteeId)
  )
    return;
  if (
    !confirm(
      `Delete collection receipt ${x.receiptNumber} for ${money(x.amount)}?`,
    )
  )
    return;
  addActivity(db, {
    action: "Sub Committee Collection Deleted",
    entityType: "subCommitteeCollection",
    entityId: x.id,
    summary: `${committeeName(x.subCommitteeId)}: collection ${x.receiptNumber} deleted`,
    details: `${money(x.amount)} from ${x.donorName || "donor"}.`,
    oldValue: subCommitteeCollectionSnapshot(x),
  });
  db.subCommitteeCollections = db.subCommitteeCollections.filter(
    (c) => c.id !== id,
  );
  saveDB(db);
  render();
}
render();
