const db = getDB(),
  s = currentSession();
markActive();
if (s.role !== "admin" && s.role !== "pradeshikam") {
  location.href = "dashboard.html";
}
const allowed =
  s.role === "admin"
    ? db.members
    : db.members.filter(
        (m) => Number(m.pradeshikamId) === Number(s.pradeshikamId),
      );
document.getElementById("page-content").innerHTML =
  `${pageTitle("Add Collection", "Select a member to enter a collection.")}<div class="panel"><div class="row g-3"><div class="col-lg-7"><label class="form-label">Search Member / അംഗത്തെ തിരയുക</label><input id="q" class="form-control" placeholder="Search name, phone or house number"></div><div class="col-lg-5 d-flex align-items-end"><div class="small text-muted">Select a member below to continue to the collection form.</div></div></div><div id="results" class="mt-3"></div></div>`;
function render() {
  const q = document.getElementById("q").value.trim().toLowerCase();
  const arr = allowed
    .filter(
      (m) =>
        !q ||
        [m.name, m.phone, m.houseNumber, m.memberCode]
          .join(" ")
          .toLowerCase()
          .includes(q),
    )
    .slice(0, 30);
  document.getElementById("results").innerHTML = arr.length
    ? `<div class="list-group">${arr.map((m) => `<a class="list-group-item list-group-item-action d-flex justify-content-between align-items-center" href="add-payment.html?id=${encodeURIComponent(m.id)}"><span><b>${escapeHTML(m.name)}</b><span class="d-block small text-muted">${escapeHTML(formatPhone(m.phone, m.countryCode))} · House ${escapeHTML(m.houseNumber || "-")}</span></span><i class="bi bi-chevron-right"></i></a>`).join("")}</div>`
    : `<div class="empty-state"><i class="bi bi-people"></i>No members found.</div>`;
}
document.getElementById("q").addEventListener("input", render);
render();
