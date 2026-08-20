function getCommitteeContext() {
  const s = currentSession();
  const requested = new URLSearchParams(location.search).get("committee");
  const committeeId = s?.role === "subcommittee" ? s.subCommitteeId : requested;
  const committee = (getDB().subCommittees || []).find((c) => Number(c.id) === Number(committeeId));
  if (
    !s ||
    !committee ||
    (s.role !== "admin" &&
      (s.role !== "subcommittee" || Number(s.subCommitteeId) !== Number(committeeId)))
  ) {
    location.href = "dashboard.html";
    return null;
  }
  return { s, committee };
}
function subCommitteeRows(db, committeeId) {
  return (db.subCommitteeCollections || []).filter(
    (x) => Number(x.subCommitteeId) === Number(committeeId),
  );
}
function subCommitteeDonorLabel(x, db) {
  const m = x.memberId ? db.members.find((m) => m.id === x.memberId) : null;
  return x.donorName || m?.name || x.sourceType || "Donor";
}
function subCommitteePhoneLabel(x, db) {
  const m = x.memberId ? db.members.find((m) => m.id === x.memberId) : null;
  return formatPhone(
    x.phone || m?.phone || "",
    x.countryCode || m?.countryCode || "+91",
  );
}
