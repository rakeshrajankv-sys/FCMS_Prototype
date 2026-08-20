const db = getDB(),
  s = currentSession();
markActive();
if (s.role !== "admin" && s.role !== "subcommittee") {
  location.href = "dashboard.html";
}
const allowedCommittees =
  s.role === "admin"
    ? db.subCommittees
    : db.subCommittees.filter((c) => Number(c.id) === Number(s.subCommitteeId));
let selectedId =
  s.role === "admin"
    ? Number(new URLSearchParams(location.search).get("committee")) ||
      Number(allowedCommittees[0]?.id)
    : Number(s.subCommitteeId);
if (!allowedCommittees.some((c) => Number(c.id) === Number(selectedId)))
  selectedId = Number(allowedCommittees[0]?.id);
function committeeName(id) {
  return (
    db.subCommittees.find((c) => Number(c.id) === Number(id))?.name ||
    "Sub Committee"
  );
}
function selectedCommittee() {
  return db.subCommittees.find((c) => Number(c.id) === Number(selectedId));
}
function render() {
  const c = selectedCommittee();
  if (!c) {
    document.getElementById("page-content").innerHTML =
      pageTitle("Submissions");
    return;
  }
  const collected = subCommitteeCollectionTotal(c.id, db),
    subm = subCommitteeSubmittedTotal(c.id, db),
    remaining = Math.max(0, collected - subm),
    rows = [...(db.subCommitteeSubmissions || [])]
      .filter((x) => Number(x.subCommitteeId) === Number(c.id))
      .sort(
        (a, b) =>
          new Date(b.date || b.createdAt) - new Date(a.date || a.createdAt),
      );
  const committeeLocked = s.role === "subcommittee" || new URLSearchParams(location.search).has("committee");
  const selector =
    s.role === "admin" && !committeeLocked
      ? `<div class="panel mb-4"><label class="form-label">Sub Committee / ഉപസമിതി</label><select id="committeeSelect" class="form-select">${db.subCommittees.map((x) => `<option value="${x.id}" ${Number(x.id) === Number(c.id) ? "selected" : ""}>${escapeHTML(x.name)}</option>`).join("")}</select></div>`
      : `<div class="panel mb-4 fcms-locked-committee"><div class="d-flex align-items-center justify-content-between gap-3"><div><div class="form-label mb-1">Sub Committee / ഉപസമിതി</div><div class="fw-bold fs-5">${escapeHTML(c.name)}</div></div><span class="badge rounded-pill text-bg-light"><i class="bi bi-lock-fill me-1"></i>Selected</span></div></div>`;
  document.getElementById("page-content").innerHTML =
    `${pageTitle(`${escapeHTML(c.name)} — Submissions`)} ${selector}<div class="row g-3 mb-4"><div class="col-md-4"><div class="stat-card"><div class="stat-label">Total Collected</div><div class="stat-value">${money(collected)}</div></div></div><div class="col-md-4"><div class="stat-card"><div class="stat-label">Submitted</div><div class="stat-value">${money(subm)}</div></div></div><div class="col-md-4"><div class="stat-card"><div class="stat-label">Remaining</div><div class="stat-value">${money(remaining)}</div></div></div></div>
<div class="panel form-card mb-4"><div class="panel-title mb-3">New Submission</div><form id="submissionForm"><div class="row g-3"><div class="col-md-4"><label class="form-label">Amount / തുക *</label><input id="subAmount" type="number" min="0" max="${remaining}" class="form-control" value="0"></div><div class="col-md-4"><label class="form-label">Submission Date / സമർപ്പിച്ച തീയതി *</label><input id="subDate" type="date" class="form-control" value="${new Date().toISOString().slice(0, 10)}" required></div><div class="col-md-4"><label class="form-label">Remarks / അഭിപ്രായങ്ങൾ</label><input id="subRemarks" class="form-control"></div></div><div id="subError" class="alert alert-danger d-none mt-3"></div><div class="d-flex justify-content-end mt-4"><button class="btn btn-primary" ${remaining <= 0 ? "disabled" : ""}>Save Submission</button></div></form></div>
<div class="panel"><div class="d-flex justify-content-between align-items-center mb-3"><div class="panel-title">Submission History</div><span class="small text-muted">${rows.length} submission(s)</span></div>${!rows.length ? `<div class="empty-state"><i class="bi bi-bank"></i>No submissions recorded yet.</div>` : `<div class="table-responsive"><table class="table"><thead><tr><th>Date</th><th>Amount</th><th>Recorded By</th><th>Remarks</th><th>Actions</th></tr></thead><tbody>${rows.map((x) => `<tr><td data-label="Date">${new Date(x.date || x.createdAt).toLocaleDateString("en-IN")}</td><td data-label="Amount" class="fw-semibold">${money(x.amount)}</td><td data-label="Recorded By">${escapeHTML(x.recordedBy || "-")}</td><td data-label="Remarks">${escapeHTML(x.remarks || "-")}</td><td data-label="Actions"><div class="d-flex gap-1">${s.role === "admin" ? `<a class="btn btn-sm btn-light" href="edit-subcommittee-submission.html?id=${encodeURIComponent(x.id)}" title="Edit"><i class="bi bi-pencil"></i></a>` : ""}${s.role === "subcommittee" ? `<button class="btn btn-sm btn-outline-danger delete-sub" data-id="${escapeHTML(x.id)}" title="Delete"><i class="bi bi-trash"></i></button>` : ""}</div></td></tr>`).join("")}</tbody></table></div>`}</div>`;
  if (s.role === "admin" && !committeeLocked)
    document
      .getElementById("committeeSelect")
      .addEventListener("change", (e) => {
        selectedId = Number(e.target.value);
        history.replaceState(
          null,
          "",
          `subcommittee-submissions.html?committee=${selectedId}`,
        );
        render();
      });
  document.getElementById("submissionForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const amount = Number(document.getElementById("subAmount").value) || 0,
      err = document.getElementById("subError");
    if (amount <= 0) {
      err.textContent = "Enter an amount to submit.";
      err.classList.remove("d-none");
      return;
    }
    if (amount > remaining) {
      err.textContent = `Amount cannot exceed remaining balance of ${money(remaining)}.`;
      err.classList.remove("d-none");
      return;
    }
    const date = document.getElementById("subDate").value;
    if (!date) {
      err.textContent = "Select a submission date.";
      err.classList.remove("d-none");
      return;
    }
    const submission = {
      id: uid("scsub"),
      subCommitteeId: c.id,
      amount,
      date,
      remarks: document.getElementById("subRemarks").value.trim(),
      createdAt: new Date().toISOString(),
      recordedBy: actorLabel(),
      recordedByUserId: s.id,
      recordedByRole: s.role,
    };
    db.subCommitteeSubmissions.push(submission);
    addActivity(db, {
      action: "Sub Committee Submission Added",
      entityType: "subCommitteeSubmission",
      entityId: submission.id,
      summary: `${committeeName(c.id)} submitted ${money(amount)}`,
      details: `Submitted to Main Committee.`,
      newValue: submission,
    });
    saveDB(db);
    render();
  });
  document
    .querySelectorAll(".delete-sub")
    .forEach((btn) =>
      btn.addEventListener("click", () => deleteSubmission(btn.dataset.id)),
    );
}
async function deleteSubmission(id) {
  const sub = (db.subCommitteeSubmissions || []).find((x) => x.id === id);
  if (!sub) return;
  if (s.role === "subcommittee" && (Number(sub.subCommitteeId) !== Number(s.subCommitteeId) || sub.recordedByUserId !== s.id)) return;
  if (s.role !== "admin" && s.role !== "subcommittee") return;
  const ok = await confirmDialog(
    `Delete this submission of ${money(sub.amount || 0)}?`,
  );
  if (!ok) return;
  addActivity(db, {
    action: "Sub Committee Submission Deleted",
    entityType: "subCommitteeSubmission",
    entityId: sub.id,
    summary: `${committeeName(sub.subCommitteeId)}: submission of ${money(sub.amount || 0)} deleted`,
    details: "",
    oldValue: sub,
  });
  db.subCommitteeSubmissions = db.subCommitteeSubmissions.filter(
    (x) => x.id !== id,
  );
  saveDB(db);
  toast("Submission deleted.", "success");
  render();
}
render();
