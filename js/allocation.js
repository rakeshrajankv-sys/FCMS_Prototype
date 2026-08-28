const s = currentSession();
if (!s || s.role !== "admin") location.href = "dashboard.html";
else {
  let db = getDB();
  markActive();
  function oldCommitteeToNumber(v) { return v === "other" ? null : Number(v); }
  function render() {
    const rows = [...(db.subcommitteeAllocations || [])].sort(
      (a, b) =>
        new Date(b.date || b.createdAt) - new Date(a.date || a.createdAt),
    );
    document.getElementById("page-content").innerHTML =
      `${pageTitle("Sub Committee Allocation", "", `<button id="add" class="btn btn-primary"><i class="bi bi-plus-circle me-2"></i>New Allocation</button>`)}<div class="panel mb-4" id="formWrap" style="display:none"><div class="panel-title mb-3">Allocate Amount from Main Office</div><form id="form"><input type="hidden" id="editId"><div class="row g-3"><div class="col-md-4"><label class="form-label">Sub Committee / ഉപസമിതി *</label><select id="committee" class="form-select" required>${SUB_COMMITTEE_DEFS.map((c) => `<option value="${c.id}">${escapeHTML(c.name)}</option>`).join("")}<option value="other">Other</option></select></div><div class="col-md-4"><label class="form-label">Amount / തുക *</label><input id="amount" type="number" min="1" class="form-control" required></div><div class="col-md-4"><label class="form-label">Date / തീയതി *</label><input id="date" type="date" class="form-control" value="${new Date().toISOString().slice(0, 10)}" required></div><div class="col-md-4"><label class="form-label">Collected By / ശേഖരിച്ചത് *</label><input id="collectedBy" class="form-control" placeholder="Name" required></div><div class="col-md-4"><label class="form-label">Phone Number / ഫോൺ നമ്പർ *</label><input id="phone" type="tel" inputmode="numeric" class="form-control" placeholder="Phone number" required></div><div class="col-md-4 d-none" id="otherPurposeWrap"><label class="form-label">Purpose / ഉദ്ദേശ്യം *</label><input id="otherPurpose" class="form-control"></div><div class="col-md-4"><label class="form-label">Remarks / അഭിപ്രായങ്ങൾ</label><input id="remarks" class="form-control"></div></div><div id="err" class="alert alert-danger d-none mt-3"></div><div class="d-flex justify-content-end gap-2 mt-3"><button type="button" id="cancel" class="btn btn-light">Cancel</button><button class="btn btn-primary">Save Allocation</button></div></form></div><div class="panel"><div class="d-flex justify-content-between align-items-center mb-3"><div class="panel-title">Allocation History</div><button id="export" class="btn btn-sm btn-light export-icon-btn" title="Download CSV" aria-label="Download CSV"><i class="bi bi-download" aria-hidden="true"></i></button></div>${rows.length ? `<div class="table-responsive"><table class="table"><thead><tr><th>Committee</th><th>Purpose</th><th>Amount</th><th>Date</th><th>Collected By</th><th>Phone</th><th>Remarks</th><th>Actions</th></tr></thead><tbody>${rows.map((x) => `<tr><td>${escapeHTML(x.committeeId === "other" ? "Other" : subCommitteeName(x.committeeId || x.subCommitteeId))}</td><td>${escapeHTML(x.purpose || "-")}</td><td class="fw-semibold">${money(x.amount)}</td><td>${new Date(x.date || x.createdAt).toLocaleDateString("en-IN")}</td><td>${escapeHTML(x.collectedBy || "-")}</td><td>${escapeHTML(x.phone || "-")}</td><td>${escapeHTML(x.remarks || "-")}</td><td><div class="d-flex gap-1"><button class="btn btn-sm btn-light edit" data-id="${x.id}"><i class="bi bi-pencil"></i></button><button class="btn btn-sm btn-outline-danger del" data-id="${x.id}"><i class="bi bi-trash"></i></button></div></td></tr>`).join("")}</tbody></table></div>` : `<div class="empty-state">No allocations recorded.</div>`}</div>`;
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

    document.getElementById("add").onclick = () => {
      document.getElementById("formWrap").style.display = "block";
      document.getElementById("form").reset();
      document.getElementById("editId").value = "";
      document.getElementById("date").value = new Date()
        .toISOString()
        .slice(0, 10);
    };
    document.getElementById("cancel").onclick = () =>
      (document.getElementById("formWrap").style.display = "none");
    document.getElementById("form").onsubmit = (e) => {
      e.preventDefault();
      const amount = Number(document.getElementById("amount").value),
        err = document.getElementById("err"),
        editId = document.getElementById("editId").value;
      if (amount <= 0) {
        err.textContent = "Enter a valid amount.";
        err.classList.remove("d-none");
        return;
      }
      if (document.getElementById("committee").value === "other" && !document.getElementById("otherPurpose").value.trim()) {
        err.textContent = "Please enter the purpose for the Other allocation.";
        err.classList.remove("d-none");
        document.getElementById("otherPurpose").focus();
        return;
      }
      const newCommitteeId = document.getElementById("committee").value;
      if (editId) {
        const old = db.subcommitteeAllocations.find((y) => y.id === editId);
        if (old && old.committeeId !== "other") {
          const oldSpent = subCommitteeExpenseTotal(old.committeeId, db);
          if (oldCommitteeToNumber(old.committeeId) !== oldCommitteeToNumber(newCommitteeId) && oldSpent > 0 && Number(old.amount || 0) - amount < oldSpent) {
            err.textContent = `The old committee already has ${money(oldSpent)} in expenses; the existing allocation cannot be reduced below that amount.`;
            err.classList.remove("d-none");
            return;
          }
        }
        if (newCommitteeId !== "other") {
          const newSpent = subCommitteeExpenseTotal(newCommitteeId, db);
          if (amount < newSpent) {
            err.textContent = `Allocation cannot be reduced below this committee's existing expenses of ${money(newSpent)}.`;
            err.classList.remove("d-none");
            return;
          }
        }
        const availableOffice = mainOfficeAvailableBalance(db, editId);
        if (amount > availableOffice) {
          err.textContent = `Allocation cannot exceed the Main Office available balance of ${money(availableOffice)}.`;
          err.classList.remove("d-none");
          return;
        }
      } else {
        const availableOffice = mainOfficeAvailableBalance(db);
        if (amount > availableOffice) {
          err.textContent = `Allocation cannot exceed the Main Office available balance of ${money(availableOffice)}.`;
          err.classList.remove("d-none");
          return;
        }
        if (newCommitteeId !== "other" && amount < subCommitteeExpenseTotal(newCommitteeId, db)) {
          err.textContent = `Allocation cannot be less than this committee's existing expenses of ${money(subCommitteeExpenseTotal(newCommitteeId, db))}.`;
          err.classList.remove("d-none");
          return;
        }
      }
      const x = {
        id: editId || uid("sca"),
        committeeId: newCommitteeId,
        purpose: document.getElementById("committee").value === "other" ? document.getElementById("otherPurpose").value.trim() : "",
        amount,
        date: document.getElementById("date").value,
        collectedBy: document.getElementById("collectedBy").value.trim(),
        phone: document.getElementById("phone").value.trim(),
        remarks: document.getElementById("remarks").value.trim(),
        createdAt: new Date().toISOString(),
        recordedBy: actorLabel(),
      };
      if (editId) {
        const i = db.subcommitteeAllocations.findIndex((y) => y.id === editId);
        const old = db.subcommitteeAllocations[i];
        db.subcommitteeAllocations[i] = x;
        addActivity(db, {
          action: "Sub Committee Allocation Edited",
          entityType: "subcommitteeAllocation",
          entityId: x.id,
          summary: `${x.committeeId === "other" ? "Other" : subCommitteeName(x.committeeId || x.subCommitteeId)} allocation edited`,
          oldValue: old,
          newValue: x,
        });
      } else {
        db.subcommitteeAllocations.push(x);
        addActivity(db, {
          action: "Sub Committee Allocation Added",
          entityType: "subcommitteeAllocation",
          entityId: x.id,
          summary: `${x.committeeId === "other" ? "Other" : subCommitteeName(x.committeeId || x.subCommitteeId)} allocated ${money(amount)}`,
          newValue: x,
        });
      }
      fcmsClearPageDraft(); saveDB(db);
      render();
    };
    document.querySelectorAll(".edit").forEach(
      (b) =>
        (b.onclick = () => {
          const x = db.subcommitteeAllocations.find(
            (y) => y.id === b.dataset.id,
          );
          document.getElementById("formWrap").style.display = "block";
          document.getElementById("editId").value = x.id;
          document.getElementById("committee").value = x.committeeId || x.subCommitteeId || "other";
          document.getElementById("otherPurpose").value = x.purpose || x.expensePurpose || "";
          syncOtherPurpose();
          document.getElementById("amount").value = x.amount;
          document.getElementById("date").value = String(x.date || "").slice(
            0,
            10,
          );
          document.getElementById("collectedBy").value = x.collectedBy || "";
          document.getElementById("phone").value = x.phone || "";
          document.getElementById("remarks").value = x.remarks || "";
        }),
    );
    document.querySelectorAll(".del").forEach(
      (b) =>
        (b.onclick = async () => {
          const x = db.subcommitteeAllocations.find(
            (y) => y.id === b.dataset.id,
          );
          if (!x) return;
          const committeeId = x.committeeId || x.subCommitteeId;
          if (committeeId !== "other") {
            const spent = subCommitteeExpenseTotal(committeeId, db);
            const remainingAfterDelete = Math.max(0, subCommitteeAllocationTotal(committeeId, db) - Number(x.amount || 0));
            if (remainingAfterDelete < spent) {
              toast(`This allocation cannot be deleted because ${money(spent)} has already been spent by this Sub Committee.`, "danger");
              return;
            }
          }
          if (!(await confirmDialog(`Delete this allocation?`))) return;
          db.subcommitteeAllocations = db.subcommitteeAllocations.filter(
            (y) => y.id !== x.id,
          );
          addActivity(db, {
            action: "Sub Committee Allocation Deleted",
            entityType: "subcommitteeAllocation",
            entityId: x.id,
            summary: `${x.committeeId === "other" ? "Other" : subCommitteeName(x.committeeId || x.subCommitteeId)} allocation deleted`,
            oldValue: x,
          });
          fcmsClearPageDraft(); saveDB(db);
          render();
        }),
    );
    document.getElementById("export").onclick = () =>
      exportCSV(
        rows.map((x) => ({
          Committee: x.committeeId === "other" ? "Other" : subCommitteeName(x.committeeId || x.subCommitteeId),
          Purpose: x.purpose || "",
          Amount: x.amount,
          Date: x.date,
          "Collected By": x.collectedBy,
          Phone: x.phone || "",
          Remarks: x.remarks || "",
        })),
        "subcommittee-allocation.csv",
      );
  }
  render();
}
