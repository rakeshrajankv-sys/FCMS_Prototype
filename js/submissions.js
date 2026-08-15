const db = getDB(),
  s = currentSession();
markActive();
const allowedPradeshikams =
  s.role === "admin"
    ? db.pradeshikams
    : db.pradeshikams.filter((p) => Number(p.id) === Number(s.pradeshikamId));
let selectedId =
  s.role === "admin"
    ? Number(new URLSearchParams(location.search).get("pradeshikam")) ||
      Number(allowedPradeshikams[0]?.id)
    : Number(s.pradeshikamId);
if (!allowedPradeshikams.some((p) => Number(p.id) === Number(selectedId)))
  selectedId = Number(allowedPradeshikams[0]?.id);
function prName(id) {
  return (
    db.pradeshikams.find((p) => Number(p.id) === Number(id))?.name ||
    "Pradeshikam"
  );
}
function memberCollected(id) {
  return memberCollectionTotal(id, db);
}
function donations(id) {
  return donationTotal(id, db);
}
function submitted(id, type) {
  return (db.submissions || [])
    .filter((x) => Number(x.pradeshikamId) === Number(id))
    .reduce(
      (sum, x) =>
        sum +
        Number(
          type === "member"
            ? x.memberAmount
            : type === "donation"
              ? x.donationAmount
              : Number(x.memberAmount || 0) + Number(x.donationAmount || 0),
        ),
      0,
    );
}
function remaining(id, type) {
  return Math.max(
    0,
    (type === "member" ? memberCollected(id) : donations(id)) -
      submitted(id, type),
  );
}
function selectedPradeshikam() {
  return db.pradeshikams.find((p) => Number(p.id) === Number(selectedId));
}
function render() {
  const p = selectedPradeshikam();
  if (!p) {
    document.getElementById("page-content").innerHTML =
      pageTitle("Submissions");
    return;
  }
  const mc = memberCollected(p.id),
    dc = donations(p.id),
    ms = submitted(p.id, "member"),
    ds = submitted(p.id, "donation"),
    mr = Math.max(0, mc - ms),
    dr = Math.max(0, dc - ds),
    rows = [...(db.submissions || [])]
      .filter((x) => Number(x.pradeshikamId) === Number(p.id))
      .sort(
        (a, b) =>
          new Date(b.date || b.createdAt) - new Date(a.date || a.createdAt),
      );
  const selector =
    s.role === "admin"
      ? `<div class="panel mb-4"><label class="form-label">Pradeshikam</label><select id="pradeshikamSelect" class="form-select">${db.pradeshikams.map((x) => `<option value="${x.id}" ${Number(x.id) === Number(p.id) ? "selected" : ""}>${escapeHTML(x.name)}</option>`).join("")}</select></div>`
      : "";
  const form =
    s.role === "pradeshikam" || s.role === "admin"
      ? `<div class="panel form-card mb-4"><div class="panel-title mb-3">New Submission</div><form id="submissionForm"><div class="row g-3"><div class="col-md-4"><label class="form-label">Amount Type *</label><select id="amountType" class="form-select"><option value="member">Collected by Pradeshikam</option><option value="donation">Donation</option><option value="both">Both</option></select></div><div class="col-md-4" id="memberAmountWrap"><label class="form-label">Amount *</label><input id="memberAmount" type="number" min="0" max="${mr}" class="form-control" value="0"></div><div class="col-md-4" id="donationAmountWrap"><label class="form-label">Donation Amount *</label><input id="donationAmount" type="number" min="0" max="${dr}" class="form-control" value="0"></div><div class="col-md-6"><label class="form-label">Submission Date *</label><input id="submissionDate" type="date" class="form-control" value="${new Date().toISOString().slice(0, 10)}" required></div><div class="col-12"><label class="form-label">Remarks</label><textarea id="submissionRemarks" class="form-control" rows="2"></textarea></div></div><div id="submissionPreview" class="receipt-box mt-3"></div><div id="submissionError" class="alert alert-danger d-none mt-3"></div><div class="d-flex justify-content-end mt-4"><button class="btn btn-primary" ${mr + dr <= 0 ? "disabled" : ""}>Save Submission</button></div></form></div>`
      : "";
  document.getElementById("page-content").innerHTML =
    `${pageTitle("Submissions")} ${selector}<div class="row g-3 mb-4"><div class="col-md-3"><div class="stat-card"><div class="stat-label">Collected by Pradeshikam</div><div class="stat-value">${money(mc)}</div></div></div><div class="col-md-3"><div class="stat-card"><div class="stat-label">Donations</div><div class="stat-value">${money(dc)}</div></div></div><div class="col-md-3"><div class="stat-card"><div class="stat-label">Submitted</div><div class="stat-value">${money(ms + ds)}</div></div></div><div class="col-md-3"><div class="stat-card"><div class="stat-label">Remaining</div><div class="stat-value">${money(mr + dr)}</div></div></div></div><div class="panel mb-4"><div class="panel-title mb-3">Amount Available</div><div class="row g-3"><div class="col-md-6"><div class="d-flex justify-content-between"><span>Collected by Pradeshikam remaining</span><b>${money(mr)}</b></div></div><div class="col-md-6"><div class="d-flex justify-content-between"><span>Donation remaining</span><b>${money(dr)}</b></div></div></div></div>${form}<div class="panel"><div class="d-flex justify-content-between align-items-center mb-3"><div class="panel-title">Submission History</div><span class="small text-muted">${rows.length} submission(s)</span></div>${!rows.length ? `<div class="empty-state"><i class="bi bi-bank"></i>No submissions recorded yet.</div>` : `<div class="table-responsive"><table class="table"><thead><tr><th>Date</th><th>Type</th><th>Collected by Pradeshikam</th><th>Donation</th><th>Total</th><th>Remaining</th><th>Recorded By</th><th>Actions</th></tr></thead><tbody>${renderRows(rows, p.id)}</tbody></table></div>`}</div>`;
  if (s.role === "admin")
    document
      .getElementById("pradeshikamSelect")
      .addEventListener("change", (e) => {
        selectedId = Number(e.target.value);
        history.replaceState(
          null,
          "",
          `submissions.html?pradeshikam=${selectedId}`,
        );
        render();
      });
  if (s.role === "pradeshikam" || s.role === "admin") {
    const type = document.getElementById("amountType");
    const ma = document.getElementById("memberAmount"),
      da = document.getElementById("donationAmount"),
      prSelect = document.getElementById("submitPradeshikam");
    function targetId() {
      return prSelect ? Number(prSelect.value) : Number(selectedId);
    }
    function targetRemaining() {
      const id = targetId();
      return {
        mr: Math.max(0, memberCollected(id) - submitted(id, "member")),
        dr: Math.max(0, donations(id) - submitted(id, "donation")),
      };
    }
    function update() {
      const t = type.value,
        { mr: tmr, dr: tdr } = targetRemaining();
      document.getElementById("memberAmountWrap").style.display =
        t === "donation" ? "none" : "block";
      document.getElementById("donationAmountWrap").style.display =
        t === "member" ? "none" : "block";
      ma.max = tmr;
      da.max = tdr;
      if (t === "member") da.value = 0;
      if (t === "donation") ma.value = 0;
      document.getElementById("submissionPreview").innerHTML =
        `<div class="d-flex justify-content-between"><span>Pradeshikam amount</span><b>${money(Number(ma.value) || 0)}</b></div><div class="d-flex justify-content-between"><span>Donation amount</span><b>${money(Number(da.value) || 0)}</b></div><div class="d-flex justify-content-between"><span>Total submission</span><b>${money((Number(ma.value) || 0) + (Number(da.value) || 0))}</b></div><div class="small text-muted mt-2">Remaining for ${escapeHTML(prName(targetId()))}: ${money(tmr)} pradeshikam · ${money(tdr)} donation</div>`;
    }
    type.addEventListener("change", update);
    prSelect?.addEventListener("change", update);
    [ma, da].forEach((el) => el.addEventListener("input", update));
    update();
    document
      .getElementById("submissionForm")
      .addEventListener("submit", (e) => {
        e.preventDefault();
        const submitId = targetId(),
          { mr: tmr, dr: tdr } = targetRemaining(),
          memberAmount = Number(ma.value) || 0,
          donationAmount = Number(da.value) || 0,
          err = document.getElementById("submissionError"),
          total = memberAmount + donationAmount;
        if (type.value === "member" && memberAmount > tmr) {
          err.textContent = `Pradeshikam amount cannot exceed ${money(tmr)}.`;
          err.classList.remove("d-none");
          return;
        }
        if (type.value === "donation" && donationAmount > tdr) {
          err.textContent = `Donation amount cannot exceed ${money(tdr)}.`;
          err.classList.remove("d-none");
          return;
        }
        if (
          type.value === "both" &&
          (memberAmount > tmr || donationAmount > tdr)
        ) {
          err.textContent = "One or both amounts exceed the remaining amount.";
          err.classList.remove("d-none");
          return;
        }
        if (total <= 0) {
          err.textContent = "Enter an amount to submit.";
          err.classList.remove("d-none");
          return;
        }
        const date = document.getElementById("submissionDate").value;
        if (!date) {
          err.textContent = "Select a submission date.";
          err.classList.remove("d-none");
          return;
        }
        const submission = {
          id: uid("sub"),
          pradeshikamId: submitId,
          memberAmount,
          donationAmount,
          amount: total,
          date,
          remarks: document.getElementById("submissionRemarks").value.trim(),
          createdAt: new Date().toISOString(),
          recordedBy: actorLabel(),
          type: type.value,
        };
        db.submissions.push(submission);
        addActivity(db, {
          action: "Submission Added",
          entityType: "submission",
          entityId: submission.id,
          pradeshikamId: submitId,
          summary: `${prName(submitId)} submitted ${money(total)}`,
          details: `Pradeshikam ${money(memberAmount)} · Donation ${money(donationAmount)}.`,
          newValue: submission,
        });
        saveDB(db);
        selectedId = submitId;
        history.replaceState(
          null,
          "",
          s.role === "admin"
            ? `submissions.html?pradeshikam=${selectedId}`
            : "submissions.html",
        );
        render();
      });
  }
}
function renderRows(rows, pid) {
  let memberRun = 0,
    donRun = 0;
  const chrono = [...rows].sort(
    (a, b) => new Date(a.date || a.createdAt) - new Date(b.date || b.createdAt),
  );
  const totals = new Map();
  chrono.forEach((x) => {
    memberRun += Number(x.memberAmount || 0);
    donRun += Number(x.donationAmount || 0);
    totals.set(x.id, {
      memberRemaining: Math.max(0, memberCollected(pid) - memberRun),
      donRemaining: Math.max(0, donations(pid) - donRun),
    });
  });
  const html = rows
    .map((x) => {
      const mem = Number(x.memberAmount || 0),
        don = Number(x.donationAmount || 0),
        t = totals.get(x.id) || { memberRemaining: 0, donRemaining: 0 };
      return `<tr><td>${escapeHTML(new Date((x.date || x.createdAt) + (x.date && !String(x.date).includes("T") ? "T00:00:00" : "")).toLocaleDateString("en-IN"))}</td><td>${escapeHTML(x.type || (mem && don ? "Both" : mem ? "Pradeshikam" : "Donation"))}</td><td>${money(mem)}</td><td>${money(don)}</td><td class="fw-semibold">${money(mem + don)}</td><td>${money(t.memberRemaining + t.donRemaining)}</td><td>${escapeHTML(x.recordedBy || "-")}</td><td><div class="d-flex gap-1">${s.role === "admin" ? `<a class="btn btn-sm btn-light" href="edit-submission.html?id=${encodeURIComponent(x.id)}" title="Edit"><i class="bi bi-pencil"></i></a>` : ""}<button class="btn btn-sm btn-outline-danger delete-submission" data-id="${escapeHTML(x.id)}" title="Delete"><i class="bi bi-trash"></i></button></div></td></tr>`;
    })
    .join("");
  setTimeout(
    () =>
      document
        .querySelectorAll(".delete-submission")
        .forEach((btn) =>
          btn.addEventListener("click", () => deleteSubmission(btn.dataset.id)),
        ),
    0,
  );
  return html;
}
function deleteSubmission(id) {
  const sub = db.submissions.find((x) => x.id === id);
  if (!sub) return;
  if (
    s.role !== "admin" &&
    Number(sub.pradeshikamId) !== Number(s.pradeshikamId)
  )
    return;
  if (!confirm(`Delete this submission of ${money(sub.amount || 0)}?`)) return;
  addActivity(db, {
    action: "Submission Deleted",
    entityType: "submission",
    entityId: sub.id,
    pradeshikamId: sub.pradeshikamId,
    summary: `Submission of ${money(sub.amount || 0)} deleted`,
    details: `Member ${money(sub.memberAmount || 0)} · Donation ${money(sub.donationAmount || 0)}.`,
    oldValue: sub,
  });
  db.submissions = db.submissions.filter((x) => x.id !== id);
  saveDB(db);
  render();
}
render();
