const s = currentSession();
if (!s || s.role !== "admin") location.href = "dashboard.html";
else {
  let db = getDB();
  markActive();
  const choices = [
    ...SUB_COMMITTEE_DEFS.map((c) => ({ id: c.id, name: c.name })),
    { id: "other", name: "Other" },
  ];
  let selectedCommittee = "souvenir";

  function render() {
    db = getDB();
    const rows = [...(db.mainExpenses || [])].sort(
      (a, b) =>
        new Date(b.date || b.createdAt) - new Date(a.date || a.createdAt),
    );
    const filtered =
      selectedCommittee === "all"
        ? rows
        : rows.filter((x) => (x.committeeId || "other") === selectedCommittee);
    const total = rows.reduce((a, x) => a + Number(x.amount || 0), 0);
    const subTotal = rows
      .filter((x) => x.committeeId !== "other")
      .reduce((a, x) => a + Number(x.amount || 0), 0);
    const otherTotal = rows
      .filter((x) => x.committeeId === "other")
      .reduce((a, x) => a + Number(x.amount || 0), 0);

    document.getElementById("page-content").innerHTML = `
  ${pageTitle("Expenses", "Record and manage expenses by committee", `<button id="add" class="btn btn-primary"><i class="bi bi-plus-circle me-2"></i>Add Expense</button>`)}
  ${mainOfficeDeficit(db)>0?`<div class="alert alert-danger d-flex align-items-center gap-2 mb-4"><i class="bi bi-exclamation-triangle-fill"></i><span>Main Office deficit: ${money(mainOfficeDeficit(db))}. New expenses are blocked until sufficient funds are received or existing commitments are reduced.</span></div>`:""}
  <div class="row g-3 mb-4">
    ${card("bi-receipt", "Total Expenses", total)}
    ${card("bi-diagram-2", "Sub Committee Expenses", subTotal)}
    ${card("bi-three-dots", "Other Expenses", otherTotal)}
  </div>

  <div class="panel mb-4">
    <div class="panel-title mb-3">Expense by Committee</div>
    <div class="expense-committee-tabs">
      <button type="button" class="expense-tab ${selectedCommittee === "souvenir" ? "active" : ""}" data-committee="souvenir"><i class="bi bi-book me-2"></i>Souvenir Committee <strong>${money(rows.filter((x) => x.committeeId === "souvenir").reduce((a, x) => a + Number(x.amount || 0), 0))}</strong></button>
      <button type="button" class="expense-tab ${selectedCommittee === "publicity" ? "active" : ""}" data-committee="publicity"><i class="bi bi-megaphone me-2"></i>Publicity Committee <strong>${money(rows.filter((x) => x.committeeId === "publicity").reduce((a, x) => a + Number(x.amount || 0), 0))}</strong></button>
      <button type="button" class="expense-tab ${selectedCommittee === "audio-video" ? "active" : ""}" data-committee="audio-video"><i class="bi bi-camera-video me-2"></i>Audio Video Committee <strong>${money(rows.filter((x) => x.committeeId === "audio-video").reduce((a, x) => a + Number(x.amount || 0), 0))}</strong></button>
      <button type="button" class="expense-tab ${selectedCommittee === "other" ? "active" : ""}" data-committee="other"><i class="bi bi-three-dots me-2"></i>Other <strong>${money(otherTotal)}</strong></button>
      <button type="button" class="expense-tab ${selectedCommittee === "all" ? "active" : ""}" data-committee="all"><i class="bi bi-list-ul me-2"></i>All</button>
    </div>
  </div>

  <div class="panel mb-4" id="formWrap" style="display:none">
    <div class="panel-title mb-3">Add / Edit Expense</div>
    <form id="form">
      <input type="hidden" id="editId">
      <div class="row g-3">
        <div class="col-md-4"><label class="form-label">Committee / കമ്മിറ്റി *</label><select id="committee" class="form-select" required>${choices.map((c) => `<option value="${c.id}">${escapeHTML(c.name)}</option>`).join("")}</select></div>
        <div class="col-md-6 d-none" id="otherPurposeWrap"><label class="form-label">Purpose / ഉദ്ദേശ്യം *</label><input id="otherPurpose" class="form-control" /></div>
        <div class="col-md-4"><label class="form-label">Expense Details / ചെലവ് വിവരങ്ങൾ *</label><input id="title" class="form-control" required placeholder="What was the expense for?"></div>
        <div class="col-md-4"><label class="form-label">Amount / തുക *</label><input id="amount" type="number" min="1" class="form-control" required></div>
        <div class="col-md-4"><label class="form-label">Date / തീയതി *</label><input id="date" type="date" class="form-control" value="${new Date().toISOString().slice(0, 10)}" required></div>
        <div class="col-md-4"><label class="form-label">Phone Number / ഫോൺ നമ്പർ</label><input id="phone" class="form-control" inputmode="numeric" maxlength="10" placeholder="Optional"></div>
        <div class="col-md-4"><label class="form-label">Remarks / അഭിപ്രായങ്ങൾ</label><input id="remarks" class="form-control"></div>
        <div class="col-md-6"><label class="form-label">Upload Bill / ബിൽ അപ്‌ലോഡ് ചെയ്യുക</label><input id="bill" type="file" class="form-control" accept="image/*,.pdf"></div>
      </div>
      <div id="err" class="alert alert-danger d-none mt-3"></div>
      <div class="d-flex justify-content-end gap-2 mt-3"><button type="button" id="cancel" class="btn btn-light">Cancel</button><button class="btn btn-primary">Save Expense</button></div>
    </form>
  </div>

  <div class="panel">
    <div class="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
      <div>
        <div class="panel-title">${selectedCommittee === "all" ? "All Expense Records" : selectedCommittee === "other" ? "Other Expenses" : escapeHTML(subCommitteeName(selectedCommittee)) + " Expenses"}</div>
        <div class="small text-muted">${filtered.length} record${filtered.length === 1 ? "" : "s"}</div>
      </div>
      <button id="export" class="btn btn-sm btn-light export-icon-btn" title="Download CSV" aria-label="Download CSV"><i class="bi bi-download" aria-hidden="true"></i></button>
    </div>
    ${filtered.length ? `<div class="table-responsive"><table class="table"><thead><tr><th>Committee</th><th>Purpose</th><th>Date</th><th>Details</th><th>Amount</th><th>Phone</th><th>Bill</th><th>Remarks</th><th>Actions</th></tr></thead><tbody>${filtered.map((x) => `<tr><td>${escapeHTML(choices.find((c) => c.id === x.committeeId)?.name || x.committeeId || "Other")}</td><td>${escapeHTML(x.expensePurpose || "-")}</td><td>${new Date(x.date || x.createdAt).toLocaleDateString("en-IN")}</td><td>${escapeHTML(x.title || "")}</td><td class="fw-semibold">${money(x.amount)}</td><td>${escapeHTML(x.phone || "-")}</td><td>${x.billData ? `<a href="${x.billData}" target="_blank" class="btn btn-sm btn-light">View</a>` : "-"}</td><td>${escapeHTML(x.remarks || "-")}</td><td><div class="d-flex gap-1"><button class="btn btn-sm btn-light edit" data-id="${x.id}"><i class="bi bi-pencil"></i></button><button class="btn btn-sm btn-outline-danger del" data-id="${x.id}"><i class="bi bi-trash"></i></button></div></td></tr>`).join("")}</tbody></table></div>` : `<div class="empty-state">No expenses recorded for this committee.</div>`}
  </div>`;

    const committeeSelect = document.getElementById("committee");
    const otherPurposeWrap = document.getElementById("otherPurposeWrap");
    const otherPurpose = document.getElementById("otherPurpose");
    function syncOtherPurpose() {
      const isOther = committeeSelect.value === "other";
      otherPurposeWrap.classList.toggle("d-none", !isOther);
      otherPurpose.required = isOther;
      if (!isOther) otherPurpose.value = "";
    }
    committeeSelect.addEventListener("change", syncOtherPurpose);
    syncOtherPurpose();

    document.querySelectorAll(".expense-tab").forEach(
      (b) =>
        (b.onclick = () => {
          selectedCommittee = b.dataset.committee;
          render();
        }),
    );

    function reset() {
      document.getElementById("form").reset();
      document.getElementById("editId").value = "";
      document.getElementById("date").value = new Date()
        .toISOString()
        .slice(0, 10);
      document.getElementById("committee").value =
        selectedCommittee === "all" ? "souvenir" : selectedCommittee;
      document.getElementById("otherPurpose").value = "";
      syncOtherPurpose();
      document.getElementById("err").classList.add("d-none");
    }

    document.getElementById("add").onclick = () => {
      document.getElementById("formWrap").style.display = "block";
      reset();
      document
        .getElementById("formWrap")
        .scrollIntoView({ behavior: "smooth", block: "start" });
    };
    document.getElementById("cancel").onclick = () =>
      (document.getElementById("formWrap").style.display = "none");
    document.getElementById("phone").oninput = (e) =>
      (e.target.value = e.target.value.replace(/\D/g, "").slice(0, 10));

    document.getElementById("form").onsubmit = (e) => {
      e.preventDefault();
      const amount = Number(document.getElementById("amount").value),
        err = document.getElementById("err"),
        editId = document.getElementById("editId").value;
      err.classList.add("d-none");
      if (amount <= 0) {
        err.textContent = "Enter a valid amount.";
        err.classList.remove("d-none");
        return;
      }
      if (document.getElementById("committee").value === "other" && !document.getElementById("otherPurpose").value.trim()) {
        err.textContent = "Please enter the purpose for the Other expense.";
        err.classList.remove("d-none");
        document.getElementById("otherPurpose").focus();
        return;
      }

      // Main-office expenses must be funded by money actually received by
      // the office. When editing, exclude the existing expense from the
      // available-balance calculation so a user can change its amount.
      const officeAvailable = mainOfficeAvailableBalance(db, null, editId || null);
      if (amount > officeAvailable) {
        err.textContent = `Expense exceeds the Main Office available balance of ${money(officeAvailable)}.`;
        err.classList.remove("d-none");
        return;
      }

      const save = (billData) => {
        const x = {
          id: editId || uid("me"),
          committeeId: document.getElementById("committee").value,
          expensePurpose: document.getElementById("committee").value === "other" ? document.getElementById("otherPurpose").value.trim() : "",
          title: document.getElementById("title").value.trim(),
          amount,
          date: document.getElementById("date").value,
          phone: document.getElementById("phone").value.trim(),
          remarks: document.getElementById("remarks").value.trim(),
          billData: billData || "",
          recordedBy: actorLabel(),
          createdAt: new Date().toISOString(),
        };
        if (editId) {
          const i = db.mainExpenses.findIndex((y) => y.id === editId);
          const old = db.mainExpenses[i];
          if (!billData) x.billData = old?.billData || "";
          db.mainExpenses[i] = x;
          addActivity(db, {
            action: "Main Expense Edited",
            entityType: "mainExpense",
            entityId: x.id,
            summary: `${subCommitteeName(x.committeeId)}: ${x.title} expense edited`,
            oldValue: old,
            newValue: x,
          });
        } else {
          db.mainExpenses.push(x);
          addActivity(db, {
            action: "Main Expense Added",
            entityType: "mainExpense",
            entityId: x.id,
            summary: `${subCommitteeName(x.committeeId)}: ${x.title} expense ${money(amount)}`,
            newValue: x,
          });
        }
        saveDB(db);
        render();
      };
      const file = document.getElementById("bill").files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = () => save(reader.result);
        reader.readAsDataURL(file);
      } else save("");
    };

    document.querySelectorAll(".edit").forEach(
      (b) =>
        (b.onclick = () => {
          const x = db.mainExpenses.find((y) => y.id === b.dataset.id);
          if (!x) return;
          document.getElementById("formWrap").style.display = "block";
          document.getElementById("editId").value = x.id;
          document.getElementById("committee").value = x.committeeId || "other";
          document.getElementById("otherPurpose").value = x.expensePurpose || "";
          syncOtherPurpose();
          document.getElementById("title").value = x.title || "";
          document.getElementById("amount").value = x.amount || "";
          document.getElementById("date").value = String(x.date || "").slice(
            0,
            10,
          );
          document.getElementById("phone").value = x.phone || "";
          document.getElementById("remarks").value = x.remarks || "";
          document
            .getElementById("formWrap")
            .scrollIntoView({ behavior: "smooth", block: "start" });
        }),
    );

    document.querySelectorAll(".del").forEach(
      (b) =>
        (b.onclick = () => {
          const x = db.mainExpenses.find((y) => y.id === b.dataset.id);
          if (!x || !confirm("Delete this expense?")) return;
          db.mainExpenses = db.mainExpenses.filter((y) => y.id !== x.id);
          addActivity(db, {
            action: "Main Expense Deleted",
            entityType: "mainExpense",
            entityId: x.id,
            summary: `${subCommitteeName(x.committeeId)}: ${x.title} expense deleted`,
            oldValue: x,
          });
          saveDB(db);
          render();
        }),
    );

    document.getElementById("export").onclick = () => {
      exportCSV(
        filtered.map((x) => ({
          Committee:
            choices.find((c) => c.id === x.committeeId)?.name || x.committeeId,
          Purpose: x.expensePurpose || "",
          Date: x.date,
          Details: x.title,
          Amount: x.amount,
          Phone: x.phone || "",
          Remarks: x.remarks || "",
          Bill: x.billData ? "Uploaded" : "",
        })),
        `main-expenses-${selectedCommittee}.csv`,
      );
    };
  }

  function card(i, l, v) {
    return `<div class="col-6 col-xl-4"><div class="stat-card"><div class="stat-icon"><i class="bi ${i}"></i></div><div class="stat-label">${l}</div><div class="stat-value">${money(v)}</div></div></div>`;
  }
  render();
}
