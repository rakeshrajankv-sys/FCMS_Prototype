const s = currentSession();
if (!s || s.role !== "admin") location.href = "dashboard.html";
else {
  let db = getDB();
  markActive();
  function render() {
    const rows = [...(db.subcommitteeAllocations || [])].sort(
      (a, b) =>
        new Date(b.date || b.createdAt) - new Date(a.date || a.createdAt),
    );
    document.getElementById("page-content").innerHTML =
      `${pageTitle("Sub Committee Allocation", "", `<button id="add" class="btn btn-primary"><i class="bi bi-plus-circle me-2"></i>New Allocation</button>`)}<div class="panel mb-4" id="formWrap" style="display:none"><div class="panel-title mb-3">Allocate Amount from Main Office</div><form id="form"><input type="hidden" id="editId"><div class="row g-3"><div class="col-md-4"><label class="form-label">Sub Committee *</label><select id="committee" class="form-select" required>${SUB_COMMITTEE_DEFS.map((c) => `<option value="${c.id}">${escapeHTML(c.name)}</option>`).join("")}</select></div><div class="col-md-4"><label class="form-label">Amount *</label><input id="amount" type="number" min="1" class="form-control" required></div><div class="col-md-4"><label class="form-label">Date *</label><input id="date" type="date" class="form-control" value="${new Date().toISOString().slice(0, 10)}" required></div><div class="col-md-4"><label class="form-label">Collected By *</label><input id="collectedBy" class="form-control" placeholder="Name" required></div><div class="col-md-4"><label class="form-label">Phone Number *</label><input id="phone" type="tel" inputmode="numeric" class="form-control" placeholder="Phone number" required></div><div class="col-md-4"><label class="form-label">Remarks</label><input id="remarks" class="form-control"></div></div><div id="err" class="alert alert-danger d-none mt-3"></div><div class="d-flex justify-content-end gap-2 mt-3"><button type="button" id="cancel" class="btn btn-light">Cancel</button><button class="btn btn-primary">Save Allocation</button></div></form></div><div class="panel"><div class="d-flex justify-content-between align-items-center mb-3"><div class="panel-title">Allocation History</div><button id="export" class="btn btn-sm btn-light"><i class="bi bi-file-earmark-spreadsheet me-1"></i>Excel / CSV</button></div>${rows.length ? `<div class="table-responsive"><table class="table"><thead><tr><th>Committee</th><th>Amount</th><th>Date</th><th>Collected By</th><th>Phone</th><th>Remarks</th><th>Actions</th></tr></thead><tbody>${rows.map((x) => `<tr><td>${escapeHTML(subCommitteeName(x.committeeId))}</td><td class="fw-semibold">${money(x.amount)}</td><td>${new Date(x.date || x.createdAt).toLocaleDateString("en-IN")}</td><td>${escapeHTML(x.collectedBy || "-")}</td><td>${escapeHTML(x.phone || "-")}</td><td>${escapeHTML(x.remarks || "-")}</td><td><div class="d-flex gap-1"><button class="btn btn-sm btn-light edit" data-id="${x.id}"><i class="bi bi-pencil"></i></button><button class="btn btn-sm btn-outline-danger del" data-id="${x.id}"><i class="bi bi-trash"></i></button></div></td></tr>`).join("")}</tbody></table></div>` : `<div class="empty-state">No allocations recorded.</div>`}</div>`;
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
      const x = {
        id: editId || uid("sca"),
        committeeId: document.getElementById("committee").value,
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
          summary: `${subCommitteeName(x.committeeId)} allocation edited`,
          oldValue: old,
          newValue: x,
        });
      } else {
        db.subcommitteeAllocations.push(x);
        addActivity(db, {
          action: "Sub Committee Allocation Added",
          entityType: "subcommitteeAllocation",
          entityId: x.id,
          summary: `${subCommitteeName(x.committeeId)} allocated ${money(amount)}`,
          newValue: x,
        });
      }
      saveDB(db);
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
          document.getElementById("committee").value = x.committeeId;
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
        (b.onclick = () => {
          const x = db.subcommitteeAllocations.find(
            (y) => y.id === b.dataset.id,
          );
          if (!x || !confirm("Delete this allocation?")) return;
          db.subcommitteeAllocations = db.subcommitteeAllocations.filter(
            (y) => y.id !== x.id,
          );
          addActivity(db, {
            action: "Sub Committee Allocation Deleted",
            entityType: "subcommitteeAllocation",
            entityId: x.id,
            summary: `${subCommitteeName(x.committeeId)} allocation deleted`,
            oldValue: x,
          });
          saveDB(db);
          render();
        }),
    );
    document.getElementById("export").onclick = () =>
      exportCSV(
        rows.map((x) => ({
          Committee: subCommitteeName(x.committeeId),
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
