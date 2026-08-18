const db = getDB(),
  s = currentSession();
markActive();
if (s.role !== "admin") {
  location.href = "dashboard.html";
} else {
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
  function render() {
    document.getElementById("page-content").innerHTML =
      `${pageTitle("Sub Committee Allocation", "Funds given from the office to each sub committee.", `<button id="exportAlloc" class="btn btn-outline-primary"><i class="bi bi-download me-1"></i>CSV</button>`)}
<div class="row g-3 mb-4">${db.subCommittees.map((c) => `<div class="col-md-4"><div class="stat-card"><div class="stat-label">${escapeHTML(c.name)}</div><div class="stat-value">${money(subCommitteeAllocationTotal(c.id, db))}</div><div class="small text-muted mt-1">Expenses: ${money(subCommitteeExpenseTotal(c.id, db))} · Remaining: ${money(Math.max(0, subCommitteeAllocationTotal(c.id, db) - subCommitteeExpenseTotal(c.id, db)))}</div></div></div>`).join("")}</div>
<div class="panel form-card mb-4" id="allocFormWrap"><div class="panel-title mb-3" id="allocFormTitle">New Allocation</div><form id="allocForm" novalidate><input type="hidden" id="editAllocId"><div class="row g-3">
<div class="col-md-4"><label class="form-label">Sub Committee / ഉപസമിതി *</label><select id="allocCommittee" class="form-select" required>${db.subCommittees.map((c) => `<option value="${c.id}">${escapeHTML(c.name)}</option>`).join("")}</select></div>
<div class="col-md-4"><label class="form-label">Amount / തുക *</label><input id="allocAmount" type="number" min="1" step="1" class="form-control" required></div>
<div class="col-md-4"><label class="form-label">Date / തീയതി *</label><input id="allocDate" type="date" class="form-control" required></div>
<div class="col-md-6"><label class="form-label">Collected By (Name) / ശേഖരിച്ച വ്യക്തിയുടെ പേര് *</label><input id="allocName" class="form-control" required placeholder="Who collected this?"></div>
<div class="col-md-6"><label class="form-label">Collected By (Phone) / ശേഖരിച്ച വ്യക്തിയുടെ ഫോൺ *</label><div class="phone-field"><select id="allocPhoneCode" class="form-select"><option value="+91">+91</option><option value="+971">+971</option></select><input id="allocPhone" class="form-control" type="tel" inputmode="numeric" maxlength="10" required placeholder="10-digit number"></div></div>
<div class="col-12"><label class="form-label">Remarks / അഭിപ്രായങ്ങൾ</label><input id="allocRemarks" class="form-control"></div>
</div><div id="allocError" class="alert alert-danger d-none mt-3"></div><div class="d-flex justify-content-end gap-2 mt-4"><button type="button" id="allocCancel" class="btn btn-light d-none">Cancel</button><button class="btn btn-primary" id="allocSubmitBtn"><i class="bi bi-cash-stack me-1"></i>Save Allocation</button></div></form></div>
<div class="panel"><div class="panel-title mb-3">Allocation History</div><div id="allocTable"></div></div>`;
    document.getElementById("allocDate").value = todayValue();
    renderTable();
    document.getElementById("allocPhone").addEventListener("input", (e) => {
      e.target.value = e.target.value.replace(/\D/g, "").slice(0, 10);
    });
    document.getElementById("allocCancel").addEventListener("click", () => {
      document.getElementById("allocForm").reset();
      document.getElementById("editAllocId").value = "";
      document.getElementById("allocFormTitle").textContent = "New Allocation";
      document.getElementById("allocDate").value = todayValue();
      document.getElementById("allocCancel").classList.add("d-none");
    });
    document.getElementById("allocForm").addEventListener("submit", (e) => {
      e.preventDefault();
      const form = e.currentTarget,
        err = document.getElementById("allocError");
      err.classList.add("d-none");
      let ok = true;
      form.querySelectorAll("[required]").forEach((el) => {
        const empty = !String(el.value || "").trim();
        el.classList.toggle("is-invalid", empty);
        if (empty) ok = false;
      });
      if (!ok) {
        err.textContent = "Please fill in all required fields.";
        err.classList.remove("d-none");
        return;
      }
      const amount = Number(document.getElementById("allocAmount").value),
        committeeId = Number(document.getElementById("allocCommittee").value);
      if (amount <= 0) {
        err.textContent = "Enter a valid amount.";
        err.classList.remove("d-none");
        return;
      }
      const editId = document.getElementById("editAllocId").value;
      if (editId) {
        const idx = db.subCommitteeAllocations.findIndex(
          (x) => x.id === editId,
        );
        if (idx === -1) return;
        const old = { ...db.subCommitteeAllocations[idx] };
        const updated = {
          ...db.subCommitteeAllocations[idx],
          subCommitteeId: committeeId,
          amount,
          date: document.getElementById("allocDate").value,
          collectedByName: document.getElementById("allocName").value.trim(),
          collectedByPhone: normalizePhone(
            document.getElementById("allocPhone").value,
          ),
          collectedByPhoneCode: document.getElementById("allocPhoneCode").value,
          remarks: document.getElementById("allocRemarks").value.trim(),
        };
        db.subCommitteeAllocations[idx] = updated;
        addActivity(db, {
          action: "Sub Committee Allocation Edited",
          entityType: "subCommitteeAllocation",
          entityId: updated.id,
          summary: `Allocation to ${committeeName(committeeId)} edited`,
          details: "Edited by Main Committee.",
          oldValue: old,
          newValue: updated,
        });
      } else {
        const allocation = {
          id: uid("alloc"),
          subCommitteeId: committeeId,
          amount,
          date: document.getElementById("allocDate").value,
          collectedByName: document.getElementById("allocName").value.trim(),
          collectedByPhone: normalizePhone(
            document.getElementById("allocPhone").value,
          ),
          collectedByPhoneCode: document.getElementById("allocPhoneCode").value,
          remarks: document.getElementById("allocRemarks").value.trim(),
          createdAt: new Date().toISOString(),
          recordedBy: actorLabel(),
        };
        db.subCommitteeAllocations.push(allocation);
        addActivity(db, {
          action: "Sub Committee Allocation Added",
          entityType: "subCommitteeAllocation",
          entityId: allocation.id,
          summary: `${money(amount)} allocated to ${committeeName(committeeId)}`,
          details: `Collected by ${allocation.collectedByName} (${formatPhone(allocation.collectedByPhone, allocation.collectedByPhoneCode)}).`,
          newValue: allocation,
        });
      }
      saveDB(db);
      form.reset();
      render();
    });
    document.getElementById("exportAlloc").addEventListener("click", () => {
      const data = [...db.subCommitteeAllocations]
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .map((a) => ({
          Date: new Date(a.date).toLocaleDateString("en-IN"),
          SubCommittee: committeeName(a.subCommitteeId),
          Amount: a.amount,
          CollectedByName: a.collectedByName || "",
          CollectedByPhone: formatPhone(
            a.collectedByPhone,
            a.collectedByPhoneCode,
          ),
          Remarks: a.remarks || "",
        }));
      exportCSV(data, "fcms-subcommittee-allocations.csv");
    });
  }
  function renderTable() {
    const rows = [...db.subCommitteeAllocations].sort(
      (a, b) => new Date(b.date) - new Date(a.date),
    );
    document.getElementById("allocTable").innerHTML = !rows.length
      ? `<div class="empty-state"><i class="bi bi-cash-stack"></i>No allocations yet.</div>`
      : `<div class="table-responsive"><table class="table"><thead><tr><th>Date</th><th>Sub Committee</th><th>Amount</th><th>Collected By</th><th>Remarks</th><th>Actions</th></tr></thead><tbody>${rows
          .map(
            (a) =>
              `<tr><td data-label="Date">${new Date(a.date).toLocaleDateString("en-IN")}</td><td data-label="Sub Committee">${escapeHTML(committeeName(a.subCommitteeId))}</td><td data-label="Amount" class="fw-semibold">${money(a.amount)}</td><td data-label="Collected By"><b>${escapeHTML(a.collectedByName || "-")}</b><br><small class="text-muted">${escapeHTML(formatPhone(a.collectedByPhone, a.collectedByPhoneCode))}</small></td><td data-label="Remarks">${escapeHTML(a.remarks || "-")}</td><td data-label="Actions"><div class="d-flex gap-1"><button class="btn btn-sm btn-light edit-alloc" data-id="${escapeHTML(a.id)}" title="Edit"><i class="bi bi-pencil"></i></button><button class="btn btn-sm btn-outline-danger delete-alloc" data-id="${escapeHTML(a.id)}" title="Delete"><i class="bi bi-trash"></i></button></div></td></tr>`,
          )
          .join("")}</tbody></table></div>`;
    document
      .querySelectorAll(".delete-alloc")
      .forEach((btn) =>
        btn.addEventListener("click", () => deleteAllocation(btn.dataset.id)),
      );
    document
      .querySelectorAll(".edit-alloc")
      .forEach((btn) =>
        btn.addEventListener("click", () =>
          startEditAllocation(btn.dataset.id),
        ),
      );
  }
  function startEditAllocation(id) {
    const a = db.subCommitteeAllocations.find((x) => x.id === id);
    if (!a) return;
    document.getElementById("allocFormTitle").textContent = "Edit Allocation";
    document.getElementById("editAllocId").value = a.id;
    document.getElementById("allocCommittee").value = a.subCommitteeId;
    document.getElementById("allocAmount").value = a.amount;
    document.getElementById("allocDate").value = String(a.date).slice(0, 10);
    document.getElementById("allocName").value = a.collectedByName || "";
    document.getElementById("allocPhoneCode").value =
      a.collectedByPhoneCode || "+91";
    document.getElementById("allocPhone").value = a.collectedByPhone || "";
    document.getElementById("allocRemarks").value = a.remarks || "";
    document.getElementById("allocCancel").classList.remove("d-none");
    document.getElementById("allocFormWrap").scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
  }
  async function deleteAllocation(id) {
    const a = db.subCommitteeAllocations.find((x) => x.id === id);
    if (!a) return;
    const ok = await confirmDialog(
      `Delete allocation of ${money(a.amount)} to ${committeeName(a.subCommitteeId)}?`,
    );
    if (!ok) return;
    addActivity(db, {
      action: "Sub Committee Allocation Deleted",
      entityType: "subCommitteeAllocation",
      entityId: a.id,
      summary: `Allocation of ${money(a.amount)} to ${committeeName(a.subCommitteeId)} deleted`,
      details: "",
      oldValue: a,
    });
    db.subCommitteeAllocations = db.subCommitteeAllocations.filter(
      (x) => x.id !== id,
    );
    saveDB(db);
    toast("Allocation deleted.", "success");
    render();
  }
  render();
}
