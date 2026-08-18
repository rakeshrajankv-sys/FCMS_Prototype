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
  let selectedId =
    s.role === "admin"
      ? Number(new URLSearchParams(location.search).get("committee")) ||
        Number(db.subCommittees[0]?.id)
      : Number(s.subCommitteeId);
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
  function fileToDataUrl(file) {
    return new Promise((res, rej) => {
      const r = new FileReader();
      r.onload = () => res(r.result);
      r.onerror = rej;
      r.readAsDataURL(file);
    });
  }
  function render() {
    const c = db.subCommittees.find((x) => Number(x.id) === Number(selectedId));
    if (!c) {
      document.getElementById("page-content").innerHTML = pageTitle("Expense");
      return;
    }
    const allocated = subCommitteeAllocationTotal(c.id, db),
      spent = subCommitteeExpenseTotal(c.id, db),
      remaining = Math.max(0, allocated - spent),
      rows = (db.subCommitteeExpenses || [])
        .filter((x) => Number(x.subCommitteeId) === Number(c.id))
        .sort(
          (a, b) =>
            new Date(b.date || b.createdAt) - new Date(a.date || a.createdAt),
        );
    const selector =
      s.role === "admin"
        ? `<div class="panel mb-4"><label class="form-label">Sub Committee</label><select id="committeeSelect" class="form-select">${db.subCommittees.map((x) => `<option value="${x.id}" ${Number(x.id) === Number(c.id) ? "selected" : ""}>${escapeHTML(x.name)}</option>`).join("")}</select></div>`
        : "";
    document.getElementById("page-content").innerHTML =
      `${pageTitle(`${escapeHTML(c.name)} — Expenses`, "", `<button id="exportExp" class="btn btn-outline-primary"><i class="bi bi-download me-1"></i>CSV</button>`)}
  ${selector}
  <div class="row g-3 mb-4"><div class="col-md-4"><div class="stat-card"><div class="stat-label">Received from Office</div><div class="stat-value">${money(allocated)}</div></div></div><div class="col-md-4"><div class="stat-card"><div class="stat-label">Total Spent</div><div class="stat-value">${money(spent)}</div></div></div><div class="col-md-4"><div class="stat-card"><div class="stat-label">Remaining</div><div class="stat-value">${money(remaining)}</div></div></div></div>
  ${
    canAddOrEdit
      ? `<div class="panel form-card mb-4" id="expFormWrap"><div class="panel-title mb-3" id="expFormTitle">Add Expense</div><form id="expForm" novalidate><input type="hidden" id="editExpId"><div class="row g-3">
  <div class="col-md-4"><label class="form-label">Amount *</label><input id="expAmount" type="number" min="1" step="1" class="form-control" required></div>
  <div class="col-md-4"><label class="form-label">Date *</label><input id="expDate" type="date" class="form-control" required></div>
  <div class="col-md-4"><label class="form-label">Bill (optional)</label><input id="expBill" type="file" accept="image/*,.pdf" class="form-control"></div>
  <div class="col-md-6"><label class="form-label">Description *</label><input id="expDesc" class="form-control" required placeholder="What was this spent on?"></div>
  <div class="col-md-6"><label class="form-label">Remarks</label><input id="expRemarks" class="form-control"></div>
  </div><div id="expError" class="alert alert-danger d-none mt-3"></div><div class="d-flex justify-content-end gap-2 mt-4"><button type="button" id="expCancel" class="btn btn-light d-none">Cancel</button><button class="btn btn-primary" id="expSubmitBtn"><i class="bi bi-receipt-cutoff me-1"></i>Save Expense</button></div></form></div>`
      : ""
  }
  <div class="panel"><div class="panel-title mb-3">Expense History</div><div id="expTable"></div></div>`;
    if (canAddOrEdit) document.getElementById("expDate").value = todayValue();
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
              `<tr><td data-label="Date">${new Date(x.date || x.createdAt).toLocaleDateString("en-IN")}</td><td data-label="Description">${escapeHTML(x.description || "-")}</td><td data-label="Amount" class="fw-semibold">${money(x.amount)}</td><td data-label="Bill">${x.billDataUrl ? `<a href="${x.billDataUrl}" download="${escapeHTML(x.billName || "bill")}" class="btn btn-sm btn-light" title="View/Download Bill"><i class="bi bi-paperclip"></i></a>` : "-"}</td><td data-label="Remarks">${escapeHTML(x.remarks || "-")}</td>${canAddOrEdit ? `<td data-label="Actions"><div class="d-flex gap-1">${isAdmin ? `<button class="btn btn-sm btn-light edit-exp" data-id="${escapeHTML(x.id)}" title="Edit"><i class="bi bi-pencil"></i></button>` : ""}<button class="btn btn-sm btn-outline-danger delete-exp" data-id="${escapeHTML(x.id)}" title="Delete"><i class="bi bi-trash"></i></button></div></td>` : ""}</tr>`,
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
      document.getElementById("expRemarks").value = x.remarks || "";
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
        const fileInput = document.getElementById("expBill");
        let billDataUrl = "",
          billName = "";
        if (fileInput.files[0]) {
          if (fileInput.files[0].size > 4 * 1024 * 1024) {
            err.textContent = "Bill file must be under 4MB.";
            err.classList.remove("d-none");
            return;
          }
          billDataUrl = await fileToDataUrl(fileInput.files[0]);
          billName = fileInput.files[0].name;
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
            description: document.getElementById("expDesc").value.trim(),
            remarks: document.getElementById("expRemarks").value.trim(),
          };
          if (billDataUrl) {
            updated.billDataUrl = billDataUrl;
            updated.billName = billName;
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
            description: document.getElementById("expDesc").value.trim(),
            remarks: document.getElementById("expRemarks").value.trim(),
            billDataUrl,
            billName,
            createdAt: new Date().toISOString(),
            recordedBy: actorLabel(),
          };
          db.subCommitteeExpenses.push(expense);
          addActivity(db, {
            action: "Sub Committee Expense Added",
            entityType: "subCommitteeExpense",
            entityId: expense.id,
            summary: `${committeeName(c.id)}: ${money(amount)} spent on ${expense.description}`,
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
        SubCommittee: committeeName(x.subCommitteeId),
        Description: x.description || "",
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
    if (
      s.role !== "admin" &&
      Number(x.subCommitteeId) !== Number(s.subCommitteeId)
    )
      return;
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
