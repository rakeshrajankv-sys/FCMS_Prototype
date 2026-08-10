const db=getDB(),s=currentSession();markActive();
if(s.role!=="admin"){location.href="members.html"}
const id=new URLSearchParams(location.search).get("id"),member=db.members.find(m=>m.id===id);
if(!member){location.href="members.html"}
else{
document.getElementById("page-content").innerHTML=`
${pageTitle("Edit Member","Main Committee can correct member information.")}
<div class="panel form-card"><form id="editMemberForm" novalidate>
<div class="row g-3">
<div class="col-md-6"><label class="form-label">Name *</label><input id="name" class="form-control" required value="${escapeHTML(member.name)}"></div>
<div class="col-md-3"><label class="form-label">Gender *</label><select id="gender" class="form-select" required><option ${member.gender==="Male"?"selected":""}>Male</option><option ${member.gender==="Female"?"selected":""}>Female</option></select></div>
<div class="col-md-3"><label class="form-label">Age *</label><input id="age" type="number" min="0" max="100" class="form-control" required value="${member.age}"></div>
<div class="col-md-4"><label class="form-label">Phone Number *</label><div class="input-group"><span class="input-group-text">+91</span><input id="phone" class="form-control" inputmode="numeric" type="tel" minlength="10" maxlength="10" pattern="[0-9]{10}" required value="${escapeHTML(normalizePhone(member.phone||""))}"></div></div>
<div class="col-md-4"><label class="form-label">House Number *</label><input id="house" class="form-control" required value="${escapeHTML(member.houseNumber||"")}"></div>
<div class="col-md-4"><label class="form-label">Pradeshikam *</label><select id="pradeshikam" class="form-select" required>${db.pradeshikams.map(p=>`<option value="${p.id}" ${Number(member.pradeshikamId)===Number(p.id)?"selected":""}>${escapeHTML(p.name)}</option>`).join("")}</select></div>
</div>
<div class="receipt-box mt-4">Current required amount: <b>${money(member.requiredAmount)}</b>. It will be recalculated from gender and age.</div>
<div id="formError" class="alert alert-danger d-none mt-3"></div>
<div class="d-flex justify-content-end gap-2 mt-4"><a href="member-details.html?id=${encodeURIComponent(member.id)}" class="btn btn-light">Cancel</a><button class="btn btn-primary">Save Changes</button></div>
</form></div>`;
document.getElementById("editMemberForm").addEventListener("submit",e=>{
 e.preventDefault();
 const updated={...member,name:document.getElementById("name").value.trim(),gender:document.getElementById("gender").value,age:Number(document.getElementById("age").value),phone:normalizePhone(document.getElementById("phone").value),houseNumber:document.getElementById("house").value.trim(),pradeshikamId:Number(document.getElementById("pradeshikam").value)};
 updated.requiredAmount=requiredAmount(updated.gender,updated.age);
 const paidNow=memberStats(member,db).paid;
 const err=document.getElementById("formError");
 if(updated.phone.length!==10){err.textContent="Phone number must contain exactly 10 digits after +91.";err.classList.remove("d-none");return}
 if(updated.age<1||updated.age>100){err.textContent="Age must be between 1 and 100.";err.classList.remove("d-none");return}
 if(updated.requiredAmount>0 && paidNow>updated.requiredAmount){err.textContent=`Required amount cannot be set below the current paid total of ${money(paidNow)}.`;err.classList.remove("d-none");return}
 const dup=db.members.find(m=>m.id!==member.id&&m.pradeshikamId===updated.pradeshikamId&&updated.phone&&updated.houseNumber&&m.phone===updated.phone&&m.houseNumber===updated.houseNumber);
 if(dup){err.textContent="Another member already uses this phone number and house number in the selected Pradeshikam.";err.classList.remove("d-none");return}
 const old=memberSnapshot(member);Object.assign(member,updated);
 addActivity(db,{action:"Member Edited",entityType:"member",entityId:member.id,memberId:member.id,pradeshikamId:member.pradeshikamId,summary:`${member.name} edited`,details:"Member information updated by Main Committee.",oldValue:old,newValue:memberSnapshot(member)});
 saveDB(db);location.href="member-details.html?id="+encodeURIComponent(member.id);
});
}


// Under-21 payment rule: no collection is required.
// Payment amount may be submitted as ₹0 so the form can be completed.
window.getRequiredCollectionAmount = function(age, gender) {
  const a = Number(age);
  if (!Number.isFinite(a) || a < 21) return 0;
  return String(gender || '').toLowerCase() === 'female' ? 2000 : 8000;
};

window.isUnder21NoCollection = function(age) {
  return Number(age) < 21;
};
