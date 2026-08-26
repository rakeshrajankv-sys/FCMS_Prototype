(function () {
  if (window.__fcmsSubcommitteeExpenseLoaded) return;
  window.__fcmsSubcommitteeExpenseLoaded = true;

  const db = getDB(),
    s = currentSession();
  markActive();
  if (s.role !== "admin" && s.role !== "subcommittee") {
    location.href = "dashboard.html";
  }
  const canManage = s.role === "subcommittee";
  const isAdmin = s.role === "admin";
  const canAddOrEdit = canManage || isAdmin;
  const requestedCommittee = new URLSearchParams(location.search).get("committee");
  let selectedId =
    s.role === "admin"
      ? (requestedCommittee === "other" ? "other" : Number(requestedCommittee) || Number(db.subCommittees[0]?.id))
      : Number(s.subCommitteeId);
  function committeeName(id) {
    if (String(id) === "other") return "Other";
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
  function fileToDataUrl(file) {
    return new Promise((res, rej) => {
      const r = new FileReader();
      r.onload = () => res(r.result);
      r.onerror = rej;
      r.readAsDataURL(file);
    });
  }
  function render() {
    const isOther = String(selectedId) === "other";
    const c = isOther ? { id: "other", name: "Other" } : db.subCommittees.find((x) => Number(x.id) === Number(selectedId));
    if (!c) {
      document.getElementById("page-content").innerHTML = pageTitle("Expense");
      return;
    }
    const allocated = isOther ? 0 : subCommitteeAllocationTotal(c.id, db),
      spent = isOther ? (db.subCommitteeExpenses || []).filter((x) => String(x.subCommitteeId) === "other").reduce((a, x) => a + Number(x.amount || 0), 0) : subCommitteeExpenseTotal(c.id, db),
      remaining = Math.max(0, allocated - spent),
      rows = (db.subCommitteeExpenses || [])
        .filter((x) => isOther ? String(x.subCommitteeId) === "other" : Number(x.subCommitteeId) === Number(c.id))
        .sort(
          (a, b) =>
            new Date(b.date || b.createdAt) - new Date(a.date || a.createdAt),
        );
    const committeeLocked = s.role === "subcommittee" || new URLSearchParams(location.search).has("committee");
    const selector =
      s.role === "admin" && !committeeLocked
        ? `<div class="panel mb-4"><label class="form-label">Sub Committee / ഉപസമിതി</label><select id="committeeSelect" class="form-select">${db.subCommittees.map((x) => `<option value="${x.id}" ${Number(x.id) === Number(c.id) ? "selected" : ""}>${escapeHTML(x.name)}</option>`).join("")}<option value="other" ${isOther ? "selected" : ""}>Other</option></select></div>`
        : `<div class="panel mb-4 fcms-locked-committee"><div class="d-flex align-items-center justify-content-between gap-3"><div><div class="form-label mb-1">Sub Committee / ഉപസമിതി</div><div class="fw-bold fs-5">${escapeHTML(c.name)}</div></div><span class="badge rounded-pill text-bg-light"><i class="bi bi-lock-fill me-1"></i>Selected</span></div></div>`;
    document.getElementById("page-content").innerHTML =
      `${pageTitle(`${escapeHTML(c.name)} — Expenses`, "", `<button id="exportExp" class="btn btn-outline-primary export-icon-btn" title="Download CSV" aria-label="Download CSV"><i class="bi bi-download" aria-hidden="true"></i></button>`)}
  ${selector}
  <div class="row g-3 mb-4"><div class="col-md-4"><div class="stat-card"><div class="stat-label">Received from Office</div><div class="stat-value">${money(allocated)}</div></div></div><div class="col-md-4"><div class="stat-card"><div class="stat-label">Total Spent</div><div class="stat-value">${money(spent)}</div></div></div><div class="col-md-4"><div class="stat-card"><div class="stat-label">Remaining</div><div class="stat-value">${money(remaining)}</div></div></div></div>
  ${isOther ? "" : allocated <= 0 ? `<div class="alert alert-warning d-flex align-items-center gap-2 mb-4"><i class="bi bi-info-circle-fill"></i><span>${t("no_allocated_funds_expense")}</span></div>` : ""}
  ${
    canAddOrEdit
      ? `<div class="panel form-card mb-4" id="expFormWrap"><div class="panel-title mb-3" id="expFormTitle">Add Expense</div><form id="expForm" novalidate><input type="hidden" id="editExpId"><div class="row g-3">
  <div class="col-md-4"><label class="form-label">Amount / തുക *</label><input id="expAmount" type="number" min="1" step="1" class="form-control" required></div>
  <div class="col-md-4"><label class="form-label">Date / തീയതി *</label><input id="expDate" type="date" class="form-control" required></div>
  <div class="col-12"><label class="form-label">Receipt / Bill / രസീത് / ബിൽ <span class="text-danger fw-bold" aria-hidden="true">*</span></label><div class="fcms-receipt-box"><div class="fcms-receipt-actions"><label class="btn btn-light mb-0"><i class="bi bi-folder2-open me-1"></i>Choose Image<input id="expBill" type="file" accept="image/jpeg,image/png,image/webp" class="d-none"></label><button type="button" class="btn btn-primary" id="expTakePhoto"><i class="bi bi-camera-fill me-1"></i>Take Photo</button></div><div id="expBillPreview" class="fcms-receipt-preview"><img id="expBillThumb" class="fcms-receipt-thumb" alt="Voucher preview"><div class="fcms-receipt-meta"><strong id="expBillName">No image selected</strong><small>Receipt / bill attached to this expense</small></div><button type="button" class="btn btn-sm btn-outline-danger" id="expRemoveBill" title="Remove"><i class="bi bi-trash"></i></button></div></div></div>
  <div class="col-md-6" id="expDescWrap"><label class="form-label">Description / വിവരണം *</label><input id="expDesc" class="form-control" required placeholder="What was this spent on?"></div>
  <div class="col-md-6 d-none" id="expOtherPurposeWrap"><label class="form-label">Purpose / ഉദ്ദേശ്യം *</label><input id="expOtherPurpose" class="form-control"></div>
  <div class="col-md-6"><label class="form-label">Remarks / അഭിപ്രായങ്ങൾ</label><input id="expRemarks" class="form-control"></div>
  </div><div id="expError" class="alert alert-danger d-none mt-3"></div><div class="d-flex justify-content-end gap-2 mt-4"><button type="button" id="expCancel" class="btn btn-light d-none">Cancel</button><button class="btn btn-primary" id="expSubmitBtn" ${(isOther ? mainOfficeAvailableBalance(db) <= 0 : allocated <= 0) ? "disabled" : ""}><i class="bi bi-receipt-cutoff me-1"></i>Save Expense</button></div></form></div>`
      : ""
  }
  <div class="panel"><div class="panel-title mb-3">Expense History</div><div id="expTable"></div></div>`;
    if (canAddOrEdit) document.getElementById("expDate").value = todayValue();
    const expDescWrap = document.getElementById("expDescWrap");
    const expDesc = document.getElementById("expDesc");
    const expOtherPurposeWrap = document.getElementById("expOtherPurposeWrap");
    const expOtherPurpose = document.getElementById("expOtherPurpose");
    function syncOtherExpensePurpose() {
      const other = String(selectedId) === "other";
      expDescWrap?.classList.toggle("d-none", other);
      expDesc && (expDesc.required = !other);
      expOtherPurposeWrap?.classList.toggle("d-none", !other);
      expOtherPurpose && (expOtherPurpose.required = other);
      if (!other && expOtherPurpose) expOtherPurpose.value = "";
      const btn = document.getElementById("expSubmitBtn");
      if (btn) btn.disabled = other ? mainOfficeAvailableBalance(db) <= 0 : allocated <= 0;
    }
    syncOtherExpensePurpose();
    let pendingBill = null;
    let removeExistingBill = false;
    const billInput = document.getElementById("expBill");
    const billPreview = document.getElementById("expBillPreview");
    const billThumb = document.getElementById("expBillThumb");
    const billNameEl = document.getElementById("expBillName");
    const showBill = (item) => {
      if (!item) { billPreview.classList.remove("show"); return; }
      billThumb.src = item.dataUrl;
      billNameEl.textContent = item.name || "Voucher image";
      billPreview.classList.add("show");
    };
    const setBill = (item) => { pendingBill = item; removeExistingBill = false; showBill(item); };
    billInput?.addEventListener("change", async () => {
      const result = await FCMSReceiptCamera.processFile(billInput.files[0]);
      billInput.value = "";
      if (result?.error) { document.getElementById("expError").textContent = result.error; document.getElementById("expError").classList.remove("d-none"); return; }
      if (result) setBill(result);
    });
    document.getElementById("expTakePhoto")?.addEventListener("click", () => FCMSReceiptCamera.open(setBill));
    document.getElementById("expRemoveBill")?.addEventListener("click", () => { pendingBill=null; removeExistingBill=true; billPreview.classList.remove("show"); });
    if (s.role === "admin")
      document
        .getElementById("committeeSelect")
        .addEventListener("change", (e) => {
          selectedId = Number(e.target.value);
          history.replaceState(
            null,
            "",
            `subcommittee-expense.html?committee=${selectedId}`,
          );
          render();
        });
    document.getElementById("expTable").innerHTML = !rows.length
      ? `<div class="empty-state"><i class="bi bi-receipt-cutoff"></i>No expenses recorded yet.</div>`
      : `<div class="table-responsive"><table class="table"><thead><tr><th>Date</th><th>Description</th><th>Amount</th><th>Bill</th><th>Remarks</th>${canAddOrEdit ? "<th>Actions</th>" : ""}</tr></thead><tbody>${rows
          .map(
            (x) =>
              `<tr><td data-label="Date">${new Date(x.date || x.createdAt).toLocaleDateString("en-IN")}</td><td data-label="Description">${escapeHTML(x.expensePurpose || x.description || "-")}</td><td data-label="Amount" class="fw-semibold">${money(x.amount)}</td><td data-label="Bill">${x.billDataUrl ? `<a href="${x.billDataUrl}" download="${escapeHTML(x.billName || "bill")}" class="btn btn-sm btn-light" title="View / Download Receipt / Bill"><i class="bi bi-paperclip"></i></a>` : "-"}</td><td data-label="Remarks">${escapeHTML(x.remarks || "-")}</td>${canAddOrEdit ? `<td data-label="Actions"><div class="d-flex gap-1">${isAdmin ? `<button class="btn btn-sm btn-light edit-exp" data-id="${escapeHTML(x.id)}" title="Edit"><i class="bi bi-pencil"></i></button><button class="btn btn-sm btn-outline-danger delete-exp" data-id="${escapeHTML(x.id)}" title="Delete"><i class="bi bi-trash"></i></button>` : `<button class="btn btn-sm btn-outline-danger delete-exp" data-id="${escapeHTML(x.id)}" title="Delete"><i class="bi bi-trash"></i></button>`}</div></td>` : ""}</tr>`,
          )
          .join("")}</tbody></table></div>`;
    document
      .querySelectorAll(".delete-exp")
      .forEach((btn) =>
        btn.addEventListener("click", () => deleteExpense(btn.dataset.id)),
      );
    if (isAdmin)
      document
        .querySelectorAll(".edit-exp")
        .forEach((btn) =>
          btn.addEventListener("click", () => startEditExpense(btn.dataset.id)),
        );
    function startEditExpense(id) {
      const x = rows.find((y) => y.id === id);
      if (!x) return;
      document.getElementById("expFormTitle").textContent = "Edit Expense";
      document.getElementById("editExpId").value = x.id;
      document.getElementById("expAmount").value = x.amount;
      document.getElementById("expDate").value = String(
        x.date || x.createdAt,
      ).slice(0, 10);
      document.getElementById("expDesc").value = x.description || "";
      document.getElementById("expOtherPurpose").value = x.expensePurpose || "";
      document.getElementById("expRemarks").value = x.remarks || "";
      syncOtherExpensePurpose();
      pendingBill = x.billDataUrl ? {dataUrl:x.billDataUrl,name:x.billName || "Voucher image"} : null;
      removeExistingBill = false;
      if (pendingBill) showBill(pendingBill); else billPreview.classList.remove("show");
      document.getElementById("expCancel").classList.remove("d-none");
      document.getElementById("expFormWrap").scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
    document.getElementById("expCancel")?.addEventListener("click", () => {
      document.getElementById("expForm").reset();
      document.getElementById("editExpId").value = "";
      document.getElementById("expFormTitle").textContent = "Add Expense";
      document.getElementById("expDate").value = todayValue();
      document.getElementById("expCancel").classList.add("d-none");
      pendingBill = null; removeExistingBill = false; billInput.value = ""; billPreview.classList.remove("show");
    });
    if (canAddOrEdit)
      document.getElementById("expForm").addEventListener("submit", async (e) => {
        e.preventDefault();
        const form = e.currentTarget,
          err = document.getElementById("expError");
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
        const amount = Number(document.getElementById("expAmount").value);
        if (amount <= 0) {
          err.textContent = "Enter a valid amount.";
          err.classList.remove("d-none");
          return;
        }
        const editId = document.getElementById("editExpId").value;
        const existingExpense = editId ? db.subCommitteeExpenses.find((x) => x.id === editId) : null;
        const billDataUrl = pendingBill?.dataUrl || "";
        const billName = pendingBill?.name || "";
        const existingBillDataUrl = existingExpense?.billDataUrl || "";
        const effectiveBillDataUrl = billDataUrl || existingBillDataUrl;
        if (!effectiveBillDataUrl) {
          err.textContent = t("receipt_bill_required");
          err.classList.remove("d-none");
          return;
        }
        const otherExpense = String(selectedId) === "other";
        const committeeAllocated = otherExpense ? 0 : subCommitteeAllocationTotal(c.id, db);
        const committeeSpentExcludingCurrent = otherExpense ? (db.subCommitteeExpenses || []).filter((x) => String(x.subCommitteeId) === "other").reduce((a, x) => a + Number(x.amount || 0), 0) - (existingExpense ? Number(existingExpense.amount || 0) : 0) : subCommitteeExpenseTotal(c.id, db) - (existingExpense ? Number(existingExpense.amount || 0) : 0);
        const expenseAvailable = otherExpense ? mainOfficeAvailableBalance(db, null, editId || null) : Math.max(0, committeeAllocated - committeeSpentExcludingCurrent);
        if (amount > expenseAvailable) {
          err.textContent = t("expense_exceeds_available_balance").replace("{amount}", money(expenseAvailable));
          err.classList.remove("d-none");
          return;
        }
        if (!otherExpense && committeeAllocated <= 0) {
          err.textContent = t("no_allocated_funds_expense");
          err.classList.remove("d-none");
          return;
        }
        if (editId) {
          if (!isAdmin) return;
          const idx = db.subCommitteeExpenses.findIndex((y) => y.id === editId);
          if (idx === -1) return;
          const old = subCommitteeExpenseSnapshot(db.subCommitteeExpenses[idx]);
          const updated = {
            ...db.subCommitteeExpenses[idx],
            amount,
            date: document.getElementById("expDate").value,
            description: otherExpense ? "" : document.getElementById("expDesc").value.trim(),
            expensePurpose: otherExpense ? document.getElementById("expOtherPurpose").value.trim() : "",
            remarks: document.getElementById("expRemarks").value.trim(),
          };
          if (billDataUrl) {
            updated.billDataUrl = billDataUrl;
            updated.billName = billName;
          } else if (removeExistingBill) {
            delete updated.billDataUrl;
            delete updated.billName;
          }
          db.subCommitteeExpenses[idx] = updated;
          addActivity(db, {
            action: "Sub Committee Expense Edited",
            entityType: "subCommitteeExpense",
            entityId: updated.id,
            summary: `${committeeName(c.id)}: expense edited`,
            details: "Edited by Main Committee.",
            oldValue: old,
            newValue: subCommitteeExpenseSnapshot(updated),
          });
        } else {
          const expense = {
            id: uid("exp"),
            subCommitteeId: c.id,
            amount,
            date: document.getElementById("expDate").value,
            description: otherExpense ? "" : document.getElementById("expDesc").value.trim(),
            expensePurpose: otherExpense ? document.getElementById("expOtherPurpose").value.trim() : "",
            remarks: document.getElementById("expRemarks").value.trim(),
            billDataUrl,
            billName,
            createdAt: new Date().toISOString(),
            recordedBy: actorLabel(),
            recordedByUserId: s.id,
            recordedByRole: s.role,
          };
          db.subCommitteeExpenses.push(expense);
          addActivity(db, {
            action: "Sub Committee Expense Added",
            entityType: "subCommitteeExpense",
            entityId: expense.id,
            summary: `${committeeName(c.id)}: ${money(amount)} spent on ${expense.expensePurpose || expense.description}`,
            details: billName ? `Bill attached: ${billName}.` : "",
            newValue: subCommitteeExpenseSnapshot(expense),
          });
        }
        saveDB(db);
        render();
      });
    document.getElementById("exportExp").addEventListener("click", () => {
      const data = rows.map((x) => ({
        Date: new Date(x.date || x.createdAt).toLocaleDateString("en-IN"),
        SubCommittee: String(x.subCommitteeId) === "other" ? "Other" : committeeName(x.subCommitteeId),
        Description: x.description || "",
        Purpose: x.expensePurpose || "",
        Amount: x.amount,
        Bill: x.billName || "",
        Remarks: x.remarks || "",
      }));
      exportCSV(
        data,
        `fcms-${committeeName(c.id).toLowerCase().replace(/\s+/g, "-")}-expenses.csv`,
      );
    });
  }
  async function deleteExpense(id) {
    const x = (db.subCommitteeExpenses || []).find((e) => e.id === id);
    if (!x) return;
    if (s.role === "subcommittee" && (Number(x.subCommitteeId) !== Number(s.subCommitteeId) || x.recordedByUserId !== s.id)) return;
    if (s.role !== "admin" && s.role !== "subcommittee") return;
    const ok = await confirmDialog(
      `Delete expense of ${money(x.amount)} for "${x.description}"?`,
    );
    if (!ok) return;
    addActivity(db, {
      action: "Sub Committee Expense Deleted",
      entityType: "subCommitteeExpense",
      entityId: x.id,
      summary: `${committeeName(x.subCommitteeId)}: expense of ${money(x.amount)} deleted`,
      details: "",
      oldValue: subCommitteeExpenseSnapshot(x),
    });
    db.subCommitteeExpenses = db.subCommitteeExpenses.filter((e) => e.id !== id);
    saveDB(db);
    toast("Expense deleted.", "success");
    render();
  }
  render();
})();
