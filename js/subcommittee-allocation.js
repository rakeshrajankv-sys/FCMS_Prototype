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
      `${pageTitle("Sub Committee Allocation", "Funds given from the office to each sub committee.", `<button id="exportAlloc" class="btn btn-outline-primary export-icon-btn" title="Download CSV" aria-label="Download CSV"><i class="bi bi-download" aria-hidden="true"></i></button>`)}
<div class="row g-3 mb-4">${db.subCommittees.map((c) => `<div class="col-md-4"><div class="stat-card"><div class="stat-label">${escapeHTML(c.name)}</div><div class="stat-value">${money(subCommitteeAllocationTotal(c.id, db))}</div><div class="small text-muted mt-1">Expenses: ${money(subCommitteeExpenseTotal(c.id, db))} · Remaining: ${money(Math.max(0, subCommitteeAllocationTotal(c.id, db) - subCommitteeExpenseTotal(c.id, db)))}</div></div></div>`).join("")}</div>
<div class="panel mb-4"><div class="d-flex justify-content-between align-items-center flex-wrap gap-2"><div><div class="panel-title">Main Office Available Funds</div><div class="small text-muted">Based on money received by the Main Office, less Main Office expenses and previous Sub Committee allocations.</div></div><div class="stat-value">${money(mainOfficeAvailableBalance(db))}</div>${mainOfficeDeficit(db)>0?`<div class="alert alert-danger mt-3 mb-0"><i class="bi bi-exclamation-triangle-fill me-2"></i>Main Office deficit: ${money(mainOfficeDeficit(db))}. New allocations are blocked until the deficit is cleared.</div>`:""}</div></div>
<div class="panel form-card mb-4" id="allocFormWrap"><div class="panel-title mb-3" id="allocFormTitle">New Allocation</div><form id="allocForm" novalidate><input type="hidden" id="editAllocId"><div class="row g-3">
<div class="col-md-4"><label class="form-label">Sub Committee / ഉപസമിതി *</label><select id="allocCommittee" class="form-select" required>${db.subCommittees.map((c) => `<option value="${c.id}">${escapeHTML(c.name)}</option>`).join("")}<option value="other">Other</option></select></div>
<div class="col-md-4"><label class="form-label">Amount / തുക *</label><input id="allocAmount" type="number" min="1" step="1" class="form-control" required></div>
<div class="col-md-4"><label class="form-label">Date / തീയതി *</label><input id="allocDate" type="date" class="form-control" required></div>
<div class="col-md-6"><label class="form-label">Collected By (Name) / ശേഖരിച്ച വ്യക്തിയുടെ പേര് *</label><input id="allocName" class="form-control" required placeholder="Who collected this?"></div>
<div class="col-md-6"><label class="form-label">Collected By (Phone) / ശേഖരിച്ച വ്യക്തിയുടെ ഫോൺ *</label><div class="phone-field"><select id="allocPhoneCode" class="form-select"><option value="+91">+91</option><option value="+971">+971</option></select><input id="allocPhone" class="form-control" type="tel" inputmode="numeric" maxlength="10" required placeholder="10-digit number"></div></div>
<div class="col-md-6 d-none" id="allocOtherPurposeWrap"><label class="form-label">Purpose / ഉദ്ദേശ്യം *</label><input id="allocOtherPurpose" class="form-control" /></div>
<div class="col-12"><label class="form-label">Voucher / Receipt / വൗച്ചർ / രസീത് <span class="text-danger fw-bold" aria-hidden="true">*</span></label><div class="fcms-receipt-box"><div class="fcms-receipt-actions"><label class="btn btn-light mb-0"><i class="bi bi-folder2-open me-1"></i>Choose Image<input id="allocVoucher" type="file" accept="image/jpeg,image/png,image/webp" class="d-none"></label><button type="button" class="btn btn-primary" id="allocTakePhoto"><i class="bi bi-camera-fill me-1"></i>Take Photo</button></div><div id="allocVoucherPreview" class="fcms-receipt-preview"><img id="allocVoucherThumb" class="fcms-receipt-thumb" alt="Voucher preview"><div class="fcms-receipt-meta"><strong id="allocVoucherName">No image selected</strong><small>Voucher / receipt attached to this allocation</small></div><button type="button" class="btn btn-sm btn-outline-danger" id="allocRemoveVoucher" title="Remove"><i class="bi bi-trash"></i></button></div></div></div>
<div class="col-12"><label class="form-label">Remarks / അഭിപ്രായങ്ങൾ</label><input id="allocRemarks" class="form-control"></div>
</div><div id="allocError" class="alert alert-danger d-none mt-3"></div><div class="d-flex justify-content-end gap-2 mt-4"><button type="button" id="allocCancel" class="btn btn-light d-none">Cancel</button><button class="btn btn-primary" id="allocSubmitBtn"><i class="bi bi-cash-stack me-1"></i>Save Allocation</button></div></form></div>
<div class="panel"><div class="panel-title mb-3">Allocation History</div><div id="allocTable"></div></div>`;
    document.getElementById("allocDate").value = todayValue();
    renderTable();
    document.getElementById("allocPhone").addEventListener("input", (e) => {
      e.target.value = e.target.value.replace(/\D/g, "").slice(0, 10);
    });
    const allocCommittee = document.getElementById("allocCommittee");
    const allocOtherPurposeWrap = document.getElementById("allocOtherPurposeWrap");
    const allocOtherPurpose = document.getElementById("allocOtherPurpose");
    function syncAllocationPurpose() {
      const isOther = allocCommittee.value === "other";
      allocOtherPurposeWrap.classList.toggle("d-none", !isOther);
      allocOtherPurpose.required = isOther;
      if (!isOther) allocOtherPurpose.value = "";
    }
    allocCommittee.addEventListener("change", syncAllocationPurpose);
    syncAllocationPurpose();
    let pendingVoucher = null;
    let removeExistingVoucher = false;
    const voucherInput = document.getElementById("allocVoucher");
    const voucherPreview = document.getElementById("allocVoucherPreview");
    const voucherThumb = document.getElementById("allocVoucherThumb");
    const voucherName = document.getElementById("allocVoucherName");
    const showVoucher = (item) => {
      if (!item) { voucherPreview.classList.remove("show"); return; }
      voucherThumb.src = item.dataUrl;
      voucherName.textContent = item.name || "Voucher image";
      voucherPreview.classList.add("show");
    };
    const setVoucher = (item) => { pendingVoucher = item; removeExistingVoucher = false; showVoucher(item); };
    voucherInput.addEventListener("change", async () => {
      const result = await FCMSReceiptCamera.processFile(voucherInput.files[0]);
      voucherInput.value = "";
      if (result?.error) { document.getElementById("allocError").textContent = result.error; document.getElementById("allocError").classList.remove("d-none"); return; }
      if (result) setVoucher(result);
    });
    document.getElementById("allocTakePhoto").addEventListener("click", () => {
      FCMSReceiptCamera.open(setVoucher);
    });
    document.getElementById("allocRemoveVoucher").addEventListener("click", () => {
      pendingVoucher = null; removeExistingVoucher = true; voucherPreview.classList.remove("show");
    });
    document.getElementById("allocCancel").addEventListener("click", () => {
      document.getElementById("allocForm").reset();
      document.getElementById("editAllocId").value = "";
      document.getElementById("allocFormTitle").textContent = "New Allocation";
      document.getElementById("allocDate").value = todayValue();
      document.getElementById("allocCommittee").value = db.subCommittees[0]?.id || "";
      document.getElementById("allocOtherPurpose").value = "";
      syncAllocationPurpose();
      document.getElementById("allocCancel").classList.add("d-none");
      pendingVoucher = null; removeExistingVoucher = false; voucherInput.value = ""; voucherPreview.classList.remove("show");
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
        committeeValue = document.getElementById("allocCommittee").value,
        isOther = committeeValue === "other",
        committeeId = isOther ? "other" : Number(committeeValue);
      if (amount <= 0) {
        err.textContent = "Enter a valid amount.";
        err.classList.remove("d-none");
        return;
      }
      const editId = document.getElementById("editAllocId").value;
      const voucherDataUrl = pendingVoucher?.dataUrl || "";
      const voucherName = pendingVoucher?.name || "";
      const currentAllocation = editId ? db.subCommitteeAllocations.find((x) => x.id === editId) : null;
      const availableOffice = mainOfficeAvailableBalance(db, editId || null);
      if (!voucherDataUrl) {
        err.textContent = t("voucher_receipt_required");
        err.classList.remove("d-none");
        return;
      }
      if (amount > availableOffice) {
        err.textContent = t("allocation_exceeds_office_balance").replace("{amount}", money(availableOffice));
        err.classList.remove("d-none");
        return;
      }
      if (editId && currentAllocation) {
        const oldValue = currentAllocation.subCommitteeId ?? currentAllocation.committeeId;
        const oldIsOther = String(oldValue) === "other";
        const oldCommitteeId = oldIsOther ? "other" : Number(oldValue);
        const newCommitteeId = committeeId;

        // Never allow an edit to leave either the old committee or the new
        // committee with expenses greater than its resulting allocation.
        const oldAllocationAfterEdit =
          subCommitteeAllocationTotal(oldCommitteeId, db) -
          Number(currentAllocation.amount || 0) +
          (oldCommitteeId === newCommitteeId ? amount : 0);
        const oldExpenses = oldIsOther ? 0 : subCommitteeExpenseTotal(oldCommitteeId, db);
        if (!oldIsOther && oldCommitteeId !== newCommitteeId && oldExpenses > oldAllocationAfterEdit) {
          err.textContent = t("allocation_below_existing_expenses").replace("{amount}", money(oldExpenses));
          err.classList.remove("d-none");
          return;
        }

        const newAllocationAfterEdit =
          subCommitteeAllocationTotal(newCommitteeId, db) -
          (oldCommitteeId === newCommitteeId ? Number(currentAllocation.amount || 0) : 0) +
          amount;
        const newExpenses = newCommitteeId === "other" ? 0 : subCommitteeExpenseTotal(newCommitteeId, db);
        if (newExpenses > newAllocationAfterEdit) {
          err.textContent = t("allocation_below_existing_expenses").replace("{amount}", money(newExpenses));
          err.classList.remove("d-none");
          return;
        }
      }
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
          allocationType: isOther ? "other" : "regular",
          allocationPurpose: isOther ? document.getElementById("allocOtherPurpose").value.trim() : "",
          remarks: document.getElementById("allocRemarks").value.trim(),
        };
        if (voucherDataUrl) { updated.voucherDataUrl = voucherDataUrl; updated.voucherName = voucherName; }
        else if (removeExistingVoucher) { delete updated.voucherDataUrl; delete updated.voucherName; }
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
          allocationType: isOther ? "other" : "regular",
          allocationPurpose: isOther ? document.getElementById("allocOtherPurpose").value.trim() : "",
          remarks: document.getElementById("allocRemarks").value.trim(),
          voucherDataUrl,
          voucherName,
          createdAt: new Date().toISOString(),
          recordedBy: actorLabel(),
        };
        db.subCommitteeAllocations.push(allocation);
        addActivity(db, {
          action: "Sub Committee Allocation Added",
          entityType: "subCommitteeAllocation",
          entityId: allocation.id,
          summary: `${money(amount)} allocated to ${committeeName(committeeId)}`,
          details: `Collected by ${allocation.collectedByName} (${formatPhone(allocation.collectedByPhone, allocation.collectedByPhoneCode)}).${allocation.voucherName ? ` Voucher attached: ${allocation.voucherName}.` : ""}`,
          newValue: allocation,
        });
      }
      fcmsClearPageDraft(); saveDB(db);
      form.reset();
      render();
    });
    document.getElementById("exportAlloc").addEventListener("click", () => {
      const data = [...db.subCommitteeAllocations]
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .map((a) => ({
          Date: new Date(a.date).toLocaleDateString("en-IN"),
          SubCommittee: (a.subCommitteeId ?? a.committeeId) === "other" ? "Other" : committeeName(a.subCommitteeId ?? a.committeeId),
          Amount: a.amount,
          CollectedByName: a.collectedByName || "",
          CollectedByPhone: formatPhone(
            a.collectedByPhone,
            a.collectedByPhoneCode,
          ),
          Type: a.allocationType === "other" ? "Other" : "Regular Allocation",
          Purpose: a.allocationPurpose || "",
          Remarks: a.remarks || "",
        }));
      exportCSV(data, "nidhi-subcommittee-allocations.csv");
    });
  }
  function renderTable() {
    const rows = [...db.subCommitteeAllocations].sort(
      (a, b) => new Date(b.date) - new Date(a.date),
    );
    document.getElementById("allocTable").innerHTML = !rows.length
      ? `<div class="empty-state"><i class="bi bi-cash-stack"></i>No allocations yet.</div>`
      : `<div class="table-responsive"><table class="table"><thead><tr><th>Date</th><th>Sub Committee</th><th>Amount</th><th>Collected By</th><th>Purpose</th><th>Voucher</th><th>Remarks</th><th>Actions</th></tr></thead><tbody>${rows
          .map(
            (a) =>
              `<tr><td data-label="Date">${new Date(a.date).toLocaleDateString("en-IN")}</td><td data-label="Sub Committee">${escapeHTML(String((a.subCommitteeId ?? a.committeeId) === "other" ? "Other" : committeeName(a.subCommitteeId ?? a.committeeId)))}</td><td data-label="Amount" class="fw-semibold">${money(a.amount)}</td><td data-label="Collected By"><b>${escapeHTML(a.collectedByName || "-")}</b><br><small class="text-muted">${escapeHTML(formatPhone(a.collectedByPhone, a.collectedByPhoneCode))}</small></td><td data-label="Purpose">${escapeHTML(a.allocationPurpose || "-")}</td><td data-label="Voucher">${a.voucherDataUrl ? `<a href="${a.voucherDataUrl}" target="_blank" rel="noopener" class="btn btn-sm btn-light" title="View voucher"><i class="bi bi-image me-1"></i>View</a>` : "-"}</td><td data-label="Remarks">${escapeHTML(a.remarks || "-")}</td><td data-label="Actions"><div class="d-flex gap-1"><button class="btn btn-sm btn-light edit-alloc" data-id="${escapeHTML(a.id)}" title="Edit"><i class="bi bi-pencil"></i></button><button class="btn btn-sm btn-outline-danger delete-alloc" data-id="${escapeHTML(a.id)}" title="Delete"><i class="bi bi-trash"></i></button></div></td></tr>`,
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
    document.getElementById("allocCommittee").value = (a.subCommitteeId ?? a.committeeId) || "other";
    document.getElementById("allocAmount").value = a.amount;
    document.getElementById("allocDate").value = String(a.date).slice(0, 10);
    document.getElementById("allocName").value = a.collectedByName || "";
    document.getElementById("allocPhoneCode").value =
      a.collectedByPhoneCode || "+91";
    document.getElementById("allocPhone").value = a.collectedByPhone || "";
    document.getElementById("allocOtherPurpose").value = a.allocationPurpose || "";
    syncAllocationPurpose();
    document.getElementById("allocRemarks").value = a.remarks || "";
    pendingVoucher = a.voucherDataUrl ? {dataUrl:a.voucherDataUrl,name:a.voucherName || "Voucher image"} : null;
    removeExistingVoucher = false;
    if (pendingVoucher) showVoucher(pendingVoucher); else voucherPreview.classList.remove("show");
    document.getElementById("allocCancel").classList.remove("d-none");
    document.getElementById("allocFormWrap").scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
  }
  async function deleteAllocation(id) {
    const a = db.subCommitteeAllocations.find((x) => x.id === id);
    if (!a) return;
    const allocationCommittee = a.subCommitteeId ?? a.committeeId;
    const committeeSpent = allocationCommittee === "other" ? 0 : subCommitteeExpenseTotal(allocationCommittee, db);
    const remainingAfterDelete = allocationCommittee === "other" ? 0 : Math.max(0, subCommitteeAllocationTotal(allocationCommittee, db) - Number(a.amount || 0));
    if (allocationCommittee !== "other" && remainingAfterDelete < committeeSpent) {
      await confirmDialog(t("allocation_delete_blocked").replace("{amount}", money(committeeSpent)));
      return;
    }
    const ok = await confirmDialog(
      `Delete allocation of ${money(a.amount)} to ${allocationCommittee === "other" ? "Other" : committeeName(allocationCommittee)}?`,
    );
    if (!ok) return;
    addActivity(db, {
      action: "Sub Committee Allocation Deleted",
      entityType: "subCommitteeAllocation",
      entityId: a.id,
      summary: `Allocation of ${money(a.amount)} to ${allocationCommittee === "other" ? "Other" : committeeName(allocationCommittee)} deleted`,
      details: "",
      oldValue: a,
    });
    db.subCommitteeAllocations = db.subCommitteeAllocations.filter(
      (x) => x.id !== id,
    );
    fcmsClearPageDraft(); saveDB(db);
    toast("Allocation deleted.", "success");
    render();
  }
  render();
}
