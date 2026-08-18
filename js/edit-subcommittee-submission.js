const db = getDB(),
  s = currentSession();
markActive();
const id = new URLSearchParams(location.search).get("id"),
  item = (db.subCommitteeSubmissions || []).find((x) => x.id === id);
if (!item || s.role !== "admin") {
  location.href = "subcommittee-submissions.html";
} else {
  const committee = db.subCommittees.find(
    (c) => Number(c.id) === Number(item.subCommitteeId),
  );
  document.getElementById("page-content").innerHTML =
    `${pageTitle("Edit Submission")}<div class="panel form-card"><div class="receipt-box mb-4"><div class="d-flex justify-content-between"><span>Sub Committee</span><b>${escapeHTML(committee?.name || "-")}</b></div></div><form id="editForm"><div class="row g-3">
<div class="col-md-6"><label class="form-label">Amount / തുക *</label><input id="amount" type="number" min="0" step="1" class="form-control" required value="${Number(item.amount)}"></div>
<div class="col-md-6"><label class="form-label">Date / തീയതി *</label><input id="date" type="date" class="form-control" required value="${new Date(item.date || item.createdAt).toISOString().slice(0, 10)}"></div>
<div class="col-12"><label class="form-label">Remarks / അഭിപ്രായങ്ങൾ</label><textarea id="remarks" class="form-control" rows="3">${escapeHTML(item.remarks || "")}</textarea></div>
</div><div id="formError" class="alert alert-danger d-none mt-3"></div><div class="d-flex justify-content-end gap-2 mt-4"><a href="subcommittee-submissions.html?committee=${item.subCommitteeId}" class="btn btn-light">Cancel</a><button class="btn btn-primary">Save Changes</button></div></form></div>`;
  document.getElementById("editForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const amount = Number(document.getElementById("amount").value),
      err = document.getElementById("formError");
    if (amount < 0) {
      err.textContent = "Enter a valid amount.";
      err.classList.remove("d-none");
      return;
    }
    const old = { ...item };
    item.amount = amount;
    item.date = document.getElementById("date").value;
    item.remarks = document.getElementById("remarks").value.trim();
    addActivity(db, {
      action: "Sub Committee Submission Edited",
      entityType: "subCommitteeSubmission",
      entityId: item.id,
      summary: `${committee?.name || "Sub Committee"}: submission edited`,
      details: "Edited by Main Committee.",
      oldValue: old,
      newValue: item,
    });
    saveDB(db);
    location.href =
      "subcommittee-submissions.html?committee=" + item.subCommitteeId;
  });
}
