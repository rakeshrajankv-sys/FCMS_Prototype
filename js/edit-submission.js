const db = getDB(),
  s = currentSession();
markActive();
if (s.role !== "admin") {
  location.href = "submissions.html";
} else {
  const id = new URLSearchParams(location.search).get("id"),
    sub = (db.submissions || []).find((x) => x.id === id);
  if (!sub) {
    location.href = "submissions.html";
  } else {
    const p = db.pradeshikams.find(
      (x) => Number(x.id) === Number(sub.pradeshikamId),
    );
    document.getElementById("page-content").innerHTML =
      `${pageTitle("Edit Submission")}<div class="panel form-card"><form id="editSubmissionForm"><div class="row g-3"><div class="col-md-4"><label class="form-label">Pradeshikam</label><input class="form-control" value="${escapeHTML(p?.name || "")}" disabled></div><div class="col-md-4"><label class="form-label">Amount Type *</label><select id="type" class="form-select"><option value="member" ${sub.type === "member" ? "selected" : ""}>Member Collected Amount</option><option value="donation" ${sub.type === "donation" ? "selected" : ""}>Donation</option><option value="both" ${sub.type === "both" ? "selected" : ""}>Both</option></select></div><div class="col-md-4"><label class="form-label">Submission Date *</label><input id="date" type="date" class="form-control" required value="${String(sub.date || sub.createdAt).slice(0, 10)}"></div><div class="col-md-4"><label class="form-label">Member Amount *</label><input id="memberAmount" type="number" min="0" class="form-control" value="${Number(sub.memberAmount || 0)}"></div><div class="col-md-4"><label class="form-label">Donation Amount *</label><input id="donationAmount" type="number" min="0" class="form-control" value="${Number(sub.donationAmount || 0)}"></div><div class="col-12"><label class="form-label">Remarks</label><textarea id="remarks" class="form-control" rows="3">${escapeHTML(sub.remarks || "")}</textarea></div></div><div id="formError" class="alert alert-danger d-none mt-3"></div><div class="d-flex justify-content-end gap-2 mt-4"><a href="submissions.html?pradeshikam=${sub.pradeshikamId}" class="btn btn-light">Cancel</a><button class="btn btn-primary">Save Changes</button></div></form></div>`;
    document
      .getElementById("editSubmissionForm")
      .addEventListener("submit", (e) => {
        e.preventDefault();
        const ma = Number(document.getElementById("memberAmount").value) || 0,
          da = Number(document.getElementById("donationAmount").value) || 0,
          t = document.getElementById("type").value,
          err = document.getElementById("formError");
        if ((t === "member" && da > 0) || (t === "donation" && ma > 0)) {
          err.textContent = "The amounts must match the selected type.";
          err.classList.remove("d-none");
          return;
        }
        if (ma < 0 || da < 0 || ma + da <= 0) {
          err.textContent = "Enter a valid submission amount.";
          err.classList.remove("d-none");
          return;
        }
        const old = { ...sub };
        Object.assign(sub, {
          memberAmount: ma,
          donationAmount: da,
          amount: ma + da,
          type: t,
          date: document.getElementById("date").value,
          remarks: document.getElementById("remarks").value.trim(),
        });
        addActivity(db, {
          action: "Submission Edited",
          entityType: "submission",
          entityId: sub.id,
          pradeshikamId: sub.pradeshikamId,
          summary: `Submission ${money(sub.amount)} edited`,
          details: `Member ${money(ma)} · Donation ${money(da)}.`,
          oldValue: old,
          newValue: sub,
        });
        saveDB(db);
        location.href = `submissions.html?pradeshikam=${sub.pradeshikamId}`;
      });
  }
}
