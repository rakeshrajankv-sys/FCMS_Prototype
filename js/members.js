const db = getDB(),
  s = currentSession();
markActive();
const params = new URLSearchParams(location.search);
const requestedPradeshikam = params.get("pradeshikam");
const requestedHouse = params.get("house");
const requestedView = params.get("view");
const myCommittee =
  s.role === "subcommittee"
    ? db.subCommittees.find((c) => Number(c.id) === Number(s.subCommitteeId))
    : null;
const canViewAllMembers = s.role === "admin" || s.role === "subcommittee";
const canAddHousePayment = s.role === "admin" || s.role === "pradeshikam" || !!myCommittee?.financeAccess;
let members = canViewAllMembers
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
${pageTitle("Members", "", s.role === "admin" || myCommittee?.financeAccess ? `<a href="add-member.html" class="btn btn-primary"><i class="bi bi-person-plus me-2"></i>Add Member</a>` : "")}
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
            return `<tr><td data-label="Member"><b>${escapeHTML(m.name)}</b><div class="small text-muted">${m.memberCode}</div></td><td data-label="Gender/Age">${m.gender}, ${m.age}</td><td data-label="Phone" class="member-phone-column">${escapeHTML(formatPhone(m.phone, m.countryCode) || "-")}</td><td data-label="House">${escapeHTML(m.houseNumber || "-")}</td><td data-label="Pradeshikam">${escapeHTML(fcmsPradeshikamLabel(db.pradeshikams.find((p) => p.id === m.pradeshikamId)?.name || "-"))}</td><td data-label="Required">${money(m.requiredAmount)}</td><td data-label="Paid" class="fw-semibold">${money(x.paid)}</td><td data-label="Balance">${money(x.balance)}</td><td data-label="Status"><span class="status-badge status-${x.status.toLowerCase()}">● ${x.status}</span></td><td data-label="Actions"><a class="btn btn-sm btn-light" href="member-details.html?id=${encodeURIComponent(m.id)}" title="View"><i class="bi bi-eye"></i></a></td></tr>`;
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
          return `<div class="col-md-6 col-xl-4"><div class="house-card h-100"><div class="d-flex justify-content-between align-items-start gap-2"><div><div class="fw-bold">House Number: ${escapeHTML(g[0].houseNumber || "-")}</div><div class="small text-muted mt-1">${g.length} member${g.length === 1 ? "" : "s"} · ${escapeHTML(fcmsPradeshikamLabel(p?.name || ""))}</div></div><span class="status-badge ${left === 0 ? "status-green" : "status-yellow"}">${left === 0 ? "Complete" : "Balance"}</span></div><div class="small mt-3 house-member-mini">${g.map((m) => `<div><span>${escapeHTML(m.name)}</span><span>${money(memberStats(m, db).paid)} / ${money(m.requiredAmount)}</span></div>`).join("")}</div><div class="d-flex justify-content-between mt-3 small"><span>Required <b>${money(req)}</b></span><span>Balance <b>${money(left)}</b></span></div><div class="house-card-actions mt-3"><a href="members.html?${requestedPradeshikam ? `pradeshikam=${encodeURIComponent(requestedPradeshikam)}&` : ""}house=${encodeURIComponent(g[0].houseNumber || "")}&view=members" data-no-transition="true" class="btn btn-sm btn-outline-primary"><i class="bi bi-eye me-1"></i>View</a><button type="button" class="btn btn-sm btn-outline-secondary house-history-btn" data-house="${escapeHTML(g[0].houseNumber || "")}" data-pradeshikam="${Number(g[0].pradeshikamId)}"><i class="bi bi-clock-history me-1"></i>History</button>${canAddHousePayment ? `<button type="button" class="btn btn-sm btn-primary house-payment-btn" data-house="${escapeHTML(g[0].houseNumber || "")}" data-pradeshikam="${Number(g[0].pradeshikamId)}"><i class="bi bi-cash-coin me-1"></i>Payment</button>` : ""}</div></div></div>`;
        })
        .join("");
  document.querySelectorAll(".house-payment-btn").forEach((btn) => btn.addEventListener("click", () => openHousePayment(btn.dataset.house, Number(btn.dataset.pradeshikam))));
  document.querySelectorAll(".house-history-btn").forEach((btn) => btn.addEventListener("click", () => openHouseHistory(btn.dataset.house, Number(btn.dataset.pradeshikam))));
}

function houseGroup(house, pradeshikamId) {
  return members.filter(m => Number(m.pradeshikamId) === Number(pradeshikamId) && houseKey(m.houseNumber) === houseKey(house));
}
function houseBalance(group) {
  return group.reduce((sum,m) => sum + memberStats(m, db).balance, 0);
}

function closeHouseHistory() {
  document.getElementById("houseHistoryOverlay")?.remove();
}
function fcmsHistoryDate(v) {
  if (!v) return "-";
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? "-" : d.toLocaleString("en-IN", { day:"2-digit", month:"short", year:"numeric", hour:"2-digit", minute:"2-digit" });
}
function openHouseHistory(house, pradeshikamId) {
  const group = houseGroup(house, pradeshikamId);
  if (!group.length) return;
  const ids = new Set(group.map(m => m.id));
  const req = group.reduce((a,m)=>a+Number(m.requiredAmount||0),0);
  const paid = group.reduce((a,m)=>a+memberStats(m,db).paid,0);
  const balance = Math.max(0, req-paid);
  const payments = (db.payments||[]).filter(p=>ids.has(p.memberId)).sort((a,b)=>new Date(b.paymentDate||b.createdAt||0)-new Date(a.paymentDate||a.createdAt||0));
  const donations = (db.donations||[]).filter(d=>ids.has(d.donorMemberId) || (Number(d.pradeshikamId)===Number(pradeshikamId) && houseKey(d.houseNumber)===houseKey(house))).sort((a,b)=>new Date(b.date||b.createdAt||0)-new Date(a.date||a.createdAt||0));
  const donationTotal = donations.filter(d=>d.status!=="hold").reduce((a,d)=>a+Number(d.amount||0),0);
  const activities = (db.activities||db.activityHistory||[]).filter(a=>ids.has(a.memberId) || (Number(a.pradeshikamId)===Number(pradeshikamId) && (ids.has(a?.oldValue?.memberId)||ids.has(a?.newValue?.memberId)||houseKey(a?.oldValue?.houseNumber)===houseKey(house)||houseKey(a?.newValue?.houseNumber)===houseKey(house)))).sort((a,b)=>new Date(b.createdAt||b.date||0)-new Date(a.createdAt||a.date||0));
  const pr = db.pradeshikams.find(p=>Number(p.id)===Number(pradeshikamId));
  const overlay=document.createElement("div");
  overlay.id="houseHistoryOverlay"; overlay.className="fcms-form-overlay";
  overlay.innerHTML=`<div class="fcms-form-modal house-history-modal" role="dialog" aria-modal="true">
    <div class="fcms-form-modal-head"><div><h3>House History</h3><div class="small text-muted">House ${escapeHTML(house||"-")} · ${escapeHTML(fcmsPradeshikamLabel(pr?.name||""))}</div></div><button type="button" class="btn btn-light btn-sm" id="houseHistoryClose"><i class="bi bi-x-lg"></i></button></div>
    <div class="house-history-kpis"><div><span>Required</span><b>${money(req)}</b></div><div><span>Total Paid</span><b>${money(paid)}</b></div><div><span>Remaining</span><b>${money(balance)}</b></div><div><span>Donations</span><b>${money(donationTotal)}</b></div></div>
    <div class="house-history-section"><div class="panel-title mb-2">Members</div><div class="table-responsive house-history-table-wrap"><table class="table"><thead><tr><th>Member</th><th>Required</th><th>Paid</th><th>Remaining</th><th>Status</th></tr></thead><tbody>${group.map(m=>{const st=memberStats(m,db);return `<tr><td><b>${escapeHTML(m.name)}</b><div class="small text-muted">${escapeHTML(m.memberCode||"")}</div></td><td>${money(m.requiredAmount)}</td><td>${money(st.paid)}</td><td>${money(st.balance)}</td><td><span class="status-badge status-${st.status.toLowerCase()}">● ${st.status}</span></td></tr>`}).join("")}</tbody></table></div></div>
    <div class="house-history-section"><div class="panel-title mb-2">Payments</div>${payments.length?`<div class="table-responsive house-history-table-wrap"><table class="table"><thead><tr><th>Date</th><th>Member</th><th>Receipt</th><th>Mode</th><th>Amount</th></tr></thead><tbody>${payments.map(p=>{const m=group.find(x=>x.id===p.memberId);return `<tr><td>${fcmsHistoryDate(p.paymentDate||p.createdAt)}</td><td>${escapeHTML(m?.name||"-")}</td><td>${escapeHTML(p.receiptNumber||"-")}</td><td>${escapeHTML(p.paymentMode||"-")}${p.transactionId?`<div class="small text-muted">${escapeHTML(p.transactionId)}</div>`:""}</td><td class="fw-semibold">${money(p.amount)}</td></tr>`}).join("")}</tbody></table></div>`:`<div class="empty-state py-3">No payments recorded.</div>`}</div>
    <div class="house-history-section"><div class="panel-title mb-2">Donations</div>${donations.length?`<div class="table-responsive house-history-table-wrap"><table class="table"><thead><tr><th>Date</th><th>Donor</th><th>Receipt</th><th>Mode</th><th>Amount</th></tr></thead><tbody>${donations.map(d=>`<tr><td>${fcmsHistoryDate(d.date||d.createdAt)}</td><td>${escapeHTML(d.donorName||group.find(m=>m.id===d.donorMemberId)?.name||"-")}</td><td>${escapeHTML(d.receiptNumber||"-")}</td><td>${escapeHTML(d.paymentMode||"-")}</td><td class="fw-semibold">${money(d.amount)}</td></tr>`).join("")}</tbody></table></div>`:`<div class="empty-state py-3">No donations recorded.</div>`}</div>
    <div class="house-history-section"><div class="panel-title mb-2">Activity History</div>${activities.length?`<div class="house-activity-list">${activities.slice(0,100).map(a=>`<div class="house-activity-item"><div><b>${escapeHTML(a.action||"Activity")}</b><div class="small text-muted">${escapeHTML(a.summary||a.details||"")}</div></div><div class="small text-muted text-end">${fcmsHistoryDate(a.createdAt||a.date)}${a.performedByName?`<br>${escapeHTML(a.performedByName)}`:""}</div></div>`).join("")}</div>`:`<div class="empty-state py-3">No activity recorded.</div>`}</div>
  </div>`;
  document.body.appendChild(overlay); applyFcmsMalayalamToDom(overlay);
  overlay.querySelector("#houseHistoryClose").addEventListener("click",closeHouseHistory);
  overlay.addEventListener("click",e=>{if(e.target===overlay)closeHouseHistory();});
}

function closeHousePayment() {
  document.getElementById("housePaymentOverlay")?.remove();
}
function openHousePayment(house, pradeshikamId) {
  const group = houseGroup(house, pradeshikamId);
  if (!group.length || !canAddHousePayment) return;
  const outstanding = houseBalance(group);
  const overlay = document.createElement("div");
  overlay.id = "housePaymentOverlay";
  overlay.className = "fcms-form-overlay";
  overlay.innerHTML = `<div class="fcms-form-modal house-payment-modal" role="dialog" aria-modal="true">
    <div class="fcms-form-modal-head"><div><h3>Payment</h3><div class="small text-muted">House ${escapeHTML(house || "-")} · ${escapeHTML(fcmsPradeshikamLabel(db.pradeshikams.find(p=>Number(p.id)===Number(pradeshikamId))?.name || ""))}</div></div><button type="button" class="btn btn-light btn-sm" id="housePayClose" aria-label="Close"><i class="bi bi-x-lg"></i></button></div>
    <form id="housePaymentForm" data-fcms-draft-scope="${escapeHTML(String(pradeshikamId)+":"+houseKey(house))}"><div class="row g-3">
      <div class="col-md-6"><label class="form-label">Paid By *</label><select id="housePayer" class="form-select" required>${group.map(m=>`<option value="${escapeHTML(m.id)}">${escapeHTML(m.name)}</option>`).join("")}</select></div>
      <div class="col-md-6"><label class="form-label">Receipt Number *</label><input id="houseReceipt" class="form-control" required autocomplete="off"></div>
      <div class="col-md-6"><label class="form-label">Payment Amount *</label><input id="houseAmount" type="number" min="1" step="1" class="form-control" required></div>
      <div class="col-md-6"><label class="form-label">Payment Mode *</label><select id="housePaymentMode" class="form-select" required><option>Cash</option><option>UPI</option><option>Bank</option><option>Cheque</option></select></div>
      <div class="col-md-6"><label class="form-label">Date *</label><input id="housePaymentDate" type="date" class="form-control" value="${new Date().toISOString().slice(0,10)}" required></div>
      <div class="col-12"><label class="form-label">Remarks</label><textarea id="housePaymentRemarks" class="form-control" rows="2"></textarea></div>
    </div>
    <div class="house-payment-summary"><span>House Balance <b id="houseBalancePreview">${money(outstanding)}</b></span><span>Excess Donation <b id="houseDonationPreview">${money(0)}</b></span></div>
    <div id="housePaymentError" class="alert alert-danger d-none mt-3"></div>
    <div class="d-flex justify-content-end gap-2 mt-4"><button type="button" class="btn btn-light" id="housePayCancel">Cancel</button><button class="btn btn-primary">Save Payment</button></div></form>
  </div>`;
  document.body.appendChild(overlay);
  applyFcmsMalayalamToDom(overlay);
  fcmsAttachUpiTransactionFields(overlay);
  fcmsAttachDraftSaving(overlay);
  const amountInput = overlay.querySelector("#houseAmount");
  const preview = () => { const a=Math.max(0,Number(amountInput.value||0)); overlay.querySelector("#houseDonationPreview").textContent=money(Math.max(0,a-outstanding)); };
  amountInput.addEventListener("input", preview);
  overlay.querySelector("#housePayClose").addEventListener("click", closeHousePayment);
  overlay.querySelector("#housePayCancel").addEventListener("click", closeHousePayment);
  overlay.addEventListener("click", e => { if (e.target === overlay) closeHousePayment(); });
  overlay.querySelector("#housePaymentForm").addEventListener("submit", e => saveHousePayment(e, group, pradeshikamId));
}
function saveHousePayment(e, group, pradeshikamId) {
  e.preventDefault();
  const form=e.currentTarget, err=form.querySelector("#housePaymentError");
  const payer=db.members.find(m=>m.id===form.querySelector("#housePayer").value);
  const receipt=form.querySelector("#houseReceipt").value.trim();
  const amount=Number(form.querySelector("#houseAmount").value);
  const mode=form.querySelector("#housePaymentMode").value;
  const transactionId=fcmsGetUpiTransactionId("housePaymentMode");
  const date=form.querySelector("#housePaymentDate").value;
  const remarks=form.querySelector("#housePaymentRemarks").value.trim();
  const showError=(msg)=>{err.textContent=msg;err.classList.remove("d-none");};
  err.classList.add("d-none");
  if(!payer || !receipt || !Number.isFinite(amount) || amount<=0 || !date) return showError("Enter all required payment details.");
  if(mode === "UPI" && !transactionId) return showError("Enter the UPI transaction ID.");
  const receiptUsed=[...(db.payments||[]),...(db.donations||[])].some(x=>String(x.receiptNumber||"").trim().toLowerCase()===receipt.toLowerCase());
  if(receiptUsed) return showError("This receipt number has already been used.");
  const groupId=uid("hpay"), paymentDate=new Date(date+"T12:00:00").toISOString();
  let remaining=amount;
  const ordered=[payer,...group.filter(m=>m.id!==payer.id)];
  const created=[];
  ordered.forEach(m=>{
    if(remaining<=0) return;
    const bal=memberStats(m,db).balance;
    const applied=Math.min(remaining,bal);
    if(applied<=0) return;
    const payment={id:uid("pay"),memberId:m.id,receiptNumber:receipt,amount:applied,paymentMode:mode,transactionId,status:"completed",remarks,paymentDate,housePaymentId:groupId,paidByMemberId:payer.id};
    db.payments.push(payment); created.push({m,payment}); remaining-=applied;
  });
  created.forEach(({m,payment})=>addActivity(db,{action:"Payment Added",entityType:"payment",entityId:payment.id,memberId:m.id,pradeshikamId:m.pradeshikamId,summary:`Receipt ${receipt} added`,details:`${money(payment.amount)} applied to ${m.name}; paid by ${payer.name}.`,newValue:paymentSnapshot(payment)}));
  if(remaining>0){
    const donation={id:uid("don"),donorMemberId:payer.id,donorName:payer.name,pradeshikamId:Number(pradeshikamId),houseNumber:payer.houseNumber||"",amount:remaining,receiptNumber:receipt,sourceType:"Member",sourceLabel:"Member",donorPhone:payer.phone||"",donorPhoneCode:payer.countryCode||"+91",paymentMode:mode,transactionId,status:"completed",date:paymentDate,remarks:remarks ? `${remarks} · Excess from household payment` : "Excess from household payment",createdAt:new Date().toISOString(),housePaymentId:groupId};
    db.donations.push(donation);
    addActivity(db,{action:"Donation Added",entityType:"donation",entityId:donation.id,memberId:payer.id,pradeshikamId:Number(pradeshikamId),summary:`${money(remaining)} donation recorded`,details:`Excess from household payment by ${payer.name} with receipt ${receipt}.`,newValue:donationSnapshot(donation)});
  }
  fcmsClearFormDraft(form); saveDB(db); closeHousePayment(); toast("House payment saved successfully.","success"); renderHouses();
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
switchView(requestedView === "members" ? "members" : requestedHouse ? "houses" : "members");
