const db = getDB(),
  s = currentSession();
markActive();
const params = new URLSearchParams(location.search);
const requestedPradeshikam = params.get("pradeshikam");
const requestedHouse = params.get("house");
let members =
  s.role === "admin"
    ? db.members
    : db.members.filter(
        (m) => Number(m.pradeshikamId) === Number(s.pradeshikamId),
      );
if (s.role === "admin" && requestedPradeshikam)
  members = members.filter(
    (m) => Number(m.pradeshikamId) === Number(requestedPradeshikam),
  );
const prName = db.pradeshikams.find(
  (p) => Number(p.id) === Number(requestedPradeshikam),
)?.name;

document.getElementById("page-content").innerHTML = `
${pageTitle("Members", "", `<a href="add-member.html" class="btn btn-primary"><i class="bi bi-person-plus me-2"></i>Add Member</a>`)}
<div class="panel mb-4 member-tabs-panel">
  <div class="member-view-tabs" role="tablist">
    <button type="button" class="member-view-tab active" data-view="members"><i class="bi bi-people"></i><span>Member List</span></button>
    <button type="button" class="member-view-tab" data-view="houses"><i class="bi bi-house"></i><span>House</span></button>
  </div>
</div>
<div id="memberView"></div>`;

const viewRoot = document.getElementById("memberView");
function houseKey(v) {
  return String(v || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
}
function renderMemberList() {
  viewRoot.innerHTML = `<div class="panel"><div class="row g-2 mb-3"><div class="col-md-7"><input id="search" class="form-control" placeholder="Search name, phone, house number or member ID"></div><div class="col-md-3"><select id="statusFilter" class="form-select"><option value="">All statuses</option><option>Green</option><option>Yellow</option><option>Red</option></select></div><div class="col-md-2"><select id="genderFilter" class="form-select"><option value="">All genders</option><option>Male</option><option>Female</option></select></div></div><div id="memberTable"></div></div>`;
  const render = () => {
    const q = document.getElementById("search").value.toLowerCase(),
      sf = document.getElementById("statusFilter").value,
      gf = document.getElementById("genderFilter").value;
    const arr = members.filter((m) => {
      const x = memberStats(m, db);
      return (
        (!requestedHouse ||
          houseKey(m.houseNumber) === houseKey(requestedHouse)) &&
        (!q ||
          [m.memberCode, m.name, m.phone, m.houseNumber, m.countryCode]
            .join(" ")
            .toLowerCase()
            .includes(q)) &&
        (!sf || x.status === sf) &&
        (!gf || m.gender === gf)
      );
    });
    document.getElementById("memberTable").innerHTML = !arr.length
      ? `<div class="empty-state"><i class="bi bi-people"></i>No members found.</div>`
      : `<div class="table-responsive"><table class="table"><thead><tr><th>Member</th><th>Gender/Age</th><th class="member-phone-column">Phone</th><th>House</th><th>Pradeshikam</th><th>Required</th><th>Paid</th><th>Balance</th><th>Status</th><th></th></tr></thead><tbody>${arr
          .map((m) => {
            const x = memberStats(m, db);
            return `<tr><td data-label="Member"><b>${escapeHTML(m.name)}</b><div class="small text-muted">${m.memberCode}</div></td><td data-label="Gender/Age">${m.gender}, ${m.age}</td><td data-label="Phone" class="member-phone-column">${escapeHTML(formatPhone(m.phone, m.countryCode) || "-")}</td><td data-label="House">${escapeHTML(m.houseNumber || "-")}</td><td data-label="Pradeshikam">${escapeHTML(db.pradeshikams.find((p) => p.id === m.pradeshikamId)?.name || "-")}</td><td data-label="Required">${money(m.requiredAmount)}</td><td data-label="Paid" class="fw-semibold">${money(x.paid)}</td><td data-label="Balance">${money(x.balance)}</td><td data-label="Status"><span class="status-badge status-${x.status.toLowerCase()}">● ${x.status}</span></td><td data-label="Actions"><a class="btn btn-sm btn-light" href="member-details.html?id=${encodeURIComponent(m.id)}" title="View"><i class="bi bi-eye"></i></a></td></tr>`;
          })
          .join("")}</tbody></table></div>`;
  };
  render();
  ["search", "statusFilter", "genderFilter"].forEach((id) =>
    document
      .getElementById(id)
      .addEventListener(id === "search" ? "input" : "change", render),
  );
}
function renderHouses() {
  const groups = new Map();
  members.forEach((m) => {
    const key = houseKey(m.houseNumber) || `__${m.id}`;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(m);
  });
  let arr = [...groups.values()];
  if (requestedHouse)
    arr = arr.filter(
      (g) => houseKey(g[0].houseNumber) === houseKey(requestedHouse),
    );
  viewRoot.innerHTML = `<div class="panel"><div class="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3"><div class="panel-title">Households</div><span class="small text-muted">${arr.length} house${arr.length === 1 ? "" : "s"}</span></div><div class="row g-3" id="houseList"></div></div>`;
  document.getElementById("houseList").innerHTML = !arr.length
    ? `<div class="col-12"><div class="empty-state py-4"><i class="bi bi-house"></i>No houses found.</div></div>`
    : arr
        .map((g) => {
          const req = g.reduce((a, m) => a + Number(m.requiredAmount || 0), 0),
            paid = g.reduce((a, m) => a + memberStats(m, db).paid, 0),
            left = Math.max(0, req - paid),
            p = db.pradeshikams.find(
              (x) => Number(x.id) === Number(g[0].pradeshikamId),
            );
          return `<div class="col-md-6 col-xl-4"><div class="house-card h-100"><div class="d-flex justify-content-between align-items-start gap-2"><div><div class="fw-bold">House Number: ${escapeHTML(g[0].houseNumber || "-")}</div><div class="small text-muted mt-1">${g.length} member${g.length === 1 ? "" : "s"} · ${escapeHTML(p?.name || "")}</div></div><span class="status-badge ${left === 0 ? "status-green" : "status-yellow"}">${left === 0 ? "Complete" : "Balance"}</span></div><div class="small mt-3 house-member-mini">${g.map((m) => `<div><span>${escapeHTML(m.name)}</span><span>${money(memberStats(m, db).paid)} / ${money(m.requiredAmount)}</span></div>`).join("")}</div><div class="d-flex justify-content-between mt-3 small"><span>Required <b>${money(req)}</b></span><span>Balance <b>${money(left)}</b></span></div><a href="members.html?${requestedPradeshikam ? `pradeshikam=${encodeURIComponent(requestedPradeshikam)}&` : ""}house=${encodeURIComponent(g[0].houseNumber || "")}" class="btn btn-sm btn-outline-primary w-100 mt-3">View</a></div></div>`;
        })
        .join("");
}
function switchView(view) {
  document
    .querySelectorAll(".member-view-tab")
    .forEach((b) => b.classList.toggle("active", b.dataset.view === view));
  view === "houses" ? renderHouses() : renderMemberList();
}
document
  .querySelectorAll(".member-view-tab")
  .forEach((b) =>
    b.addEventListener("click", () => switchView(b.dataset.view)),
  );
switchView(requestedHouse ? "houses" : "members");
