seedDemoData();
function requireAuth() {
  const s = currentSession();
  if (!s) {
    location.href = "index.html";
    return null;
  }
  return s;
}
function isAdmin() {
  return currentSession()?.role === "admin";
}
function isPradeshikam() {
  return currentSession()?.role === "pradeshikam";
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
  setSession({
    id: user.id,
    role: user.role,
    name: user.name,
    username: user.username,
    pradeshikamId: user.pradeshikamId,
  });
  location.href = "dashboard.html";
});
