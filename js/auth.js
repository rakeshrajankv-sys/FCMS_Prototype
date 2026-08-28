seedDemoData();
function requireAuth() {
  const s = currentSession();
  if (!s) {
    location.href = "index.html";
    return null;
  }
  const db = getDB();
  const freshUser =
    db.users.find((u) => u.id === s.id) ||
    db.users.find((u) => u.username === s.username);
  if (freshUser) {
    const patched = {
      id: freshUser.id,
      role: freshUser.role,
      name: freshUser.name,
      username: freshUser.username,
      pradeshikamId: freshUser.pradeshikamId,
      subCommitteeId: freshUser.subCommitteeId,
      verifiedPhone: s.verifiedPhone || freshUser.verifiedPhone || "",
    };
    if (JSON.stringify(patched) !== JSON.stringify(s)) setSession(patched);
    return patched;
  }
  return s;
}
function isAdmin() {
  return currentSession()?.role === "admin";
}
function isPradeshikam() {
  return currentSession()?.role === "pradeshikam";
}
function isSubCommittee() {
  return currentSession()?.role === "subcommittee";
}
document.getElementById("loginForm")?.addEventListener("submit", (e) => {
  e.preventDefault();
  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value;
  const user = getDB().users.find(
    (u) => u.username === username && u.password === password,
  );
  const err = document.getElementById("loginError");
  if (!user) {
    err.textContent = "Invalid username or password.";
    err.classList.remove("d-none");
    return;
  }
  const profileUser = {
    id: user.id,
    role: user.role,
    name: user.name,
    username: user.username,
    pradeshikamId: user.pradeshikamId,
    subCommitteeId: user.subCommitteeId,
    verifiedPhone: user.verifiedPhone || "",
  };
  requestDeviceEnrollment(profileUser).then((verified) => {
    if (!verified) return;
    setSession(profileUser);
    document.body.classList.add("fcms-login-exit");
    const reducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
    window.setTimeout(() => { location.href = "dashboard.html"; }, reducedMotion ? 0 : (window.innerWidth <= 900 ? 600 : 740));
  });
});
