const db = getDB(), s = currentSession();
if (!s || s.role !== "admin") { location.href = "dashboard.html"; throw new Error("Admin only"); }
markActive();
db.verifiedUsers ||= [];

function roleLabel(role) {
  return role === "admin" ? t("main_committee") : role === "subcommittee" ? t("sub_committee") : t("pradeshikam");
}
function belongsTo(x) {
  if (x.role === "subcommittee") return x.subCommitteeName || "-";
  if (x.role === "pradeshikam") return x.pradeshikamName || "-";
  return t("main_committee");
}
function fmt(value) {
  return value ? new Date(value).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" }) : "-";
}
function deviceLabel(x) {
  return x.deviceType || (/Mobi|Android/i.test(navigator.userAgent) ? "Mobile" : "Desktop / Laptop");
}

const content = document.getElementById("page-content");
content.innerHTML = `${pageTitle(t("verified_users"))}
<div class="panel verified-users-panel">
  <div class="verified-users-toolbar">
    <div class="verified-search-wrap">
      <i class="bi bi-search"></i>
      <input id="vuSearch" class="form-control" placeholder="${escapeHTML(t("search_verified_users"))}" aria-label="${escapeHTML(t("search_verified_users"))}">
    </div>
    <div class="verified-role-wrap">
      <label for="vuRole" class="form-label">${escapeHTML(t("verified_role"))}</label>
      <select id="vuRole" class="form-select">
        <option value="">${escapeHTML(t("all_roles"))}</option>
        <option value="admin">${escapeHTML(t("main_committee"))}</option>
        <option value="pradeshikam">${escapeHTML(t("pradeshikam"))}</option>
        <option value="subcommittee">${escapeHTML(t("sub_committee"))}</option>
      </select>
    </div>
  </div>
  <div class="table-responsive verified-users-table-wrap">
    <table class="table align-middle verified-users-table">
      <thead><tr>
        <th>Sl No</th><th>${t("verified_name")}</th><th>${t("verified_phone")}</th><th>${t("verified_role")}</th>
        <th>${t("verified_belongs_to")}</th><th>${t("verified_device")}</th><th>${t("verified_first")}</th><th>${t("verified_last")}</th><th>${t("verified_count")}</th><th>${t("verified_actions")}</th>
      </tr></thead>
      <tbody id="vuRows"></tbody>
    </table>
  </div>
  <div class="verified-users-footer"><span id="vuFooterText"></span><strong id="vuCount">0</strong></div>
</div>`;

function render() {
  const q = (document.getElementById("vuSearch")?.value || "").toLowerCase().trim();
  const role = document.getElementById("vuRole")?.value || "";
  const rows = [...db.verifiedUsers]
    .sort((a,b) => new Date(b.lastVerifiedAt || 0) - new Date(a.lastVerifiedAt || 0))
    .filter(x => (!role || x.role === role) && (!q || [x.name,x.phone,x.username,x.pradeshikamName,x.subCommitteeName,x.deviceType].join(" ").toLowerCase().includes(q)));

  document.getElementById("vuCount").textContent = rows.length;
  document.getElementById("vuFooterText").textContent = rows.length ? `Showing ${rows.length} verified user${rows.length === 1 ? "" : "s"}` : "";
  document.getElementById("vuRows").innerHTML = rows.length ? rows.map((x,i) => `
    <tr>
      <td data-label="Sl No"><span class="serial-pill">${i+1}</span></td>
      <td data-label="${t("verified_name")}"><div class="verified-person"><div class="verified-avatar">${escapeHTML((x.name||"U").trim().charAt(0).toUpperCase())}</div><div><b>${escapeHTML(x.name||"-")}</b><small>${escapeHTML(x.username||"")}</small></div></div></td>
      <td data-label="${t("verified_phone")}"><span class="verified-phone"><i class="bi bi-telephone"></i>${escapeHTML(x.phone||"-")}</span></td>
      <td data-label="${t("verified_role")}"><span class="role-chip">${escapeHTML(roleLabel(x.role))}</span></td>
      <td data-label="${t("verified_belongs_to")}">${escapeHTML(belongsTo(x))}</td>
      <td data-label="${t("verified_device")}">${escapeHTML(deviceLabel(x))}</td>
      <td data-label="${t("verified_first")}">${escapeHTML(fmt(x.firstVerifiedAt))}</td>
      <td data-label="${t("verified_last")}">${escapeHTML(fmt(x.lastVerifiedAt))}</td>
      <td data-label="${t("verified_count")}"><span class="count-pill">${Number(x.verificationCount||0)}</span></td>
      <td data-label="${t("verified_actions")}"><a class="btn btn-sm btn-light verified-history-btn" href="activity-history.html?verified=${encodeURIComponent(x.id)}" title="${escapeHTML(t("verified_view_activity"))}" aria-label="${escapeHTML(t("verified_view_activity"))}"><i class="bi bi-clock-history"></i></a></td>
    </tr>`).join("") : `<tr><td colspan="10"><div class="empty-state py-5"><i class="bi bi-person-check"></i>${escapeHTML(t("no_verified_users"))}</div></td></tr>`;
}

document.getElementById("vuSearch").addEventListener("input", fcmsDebounce(render,180));
document.getElementById("vuRole").addEventListener("change", render);
render();
