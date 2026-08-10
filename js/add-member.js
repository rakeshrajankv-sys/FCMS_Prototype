const db=getDB(),s=currentSession();markActive();
const allowedPradeshikams=s.role==="admin"?db.pradeshikams:[db.pradeshikams.find(p=>p.id===s.pradeshikamId)];
const lockedPr=allowedPradeshikams[0];
document.getElementById("page-content").innerHTML=`
${pageTitle("New Member","Register a new person and record their first payment.")}
<div class="panel form-card">
<form id="memberForm" novalidate>
<h6 class="fw-bold mb-3">Member Details</h6>
<div class="row g-3">
<div class="col-md-6"><label class="form-label">Name *</label><input id="name" class="form-control" required></div>
<div class="col-md-3"><label class="form-label">Gender *</label><select id="gender" class="form-select" required><option value="">Select</option><option>Male</option><option>Female</option></select></div>
<div class="col-md-3"><label class="form-label">Age *</label><input id="age" type="number" min="1" max="100" class="form-control" required></div>
<div class="col-md-4"><label class="form-label">Phone Number *</label><div class="input-group"><span class="input-group-text">+91</span><input id="phone" class="form-control" inputmode="numeric" type="tel" minlength="10" maxlength="10" pattern="[0-9]{10}" required></div></div>
<div class="col-md-4"><label class="form-label">House Number *</label><input id="house" class="form-control" required></div>
<div class="col-md-4"><label class="form-label">Pradeshikam *</label>
${s.role==="admin"
?`<select id="pradeshikam" class="form-select" required><option value="">Select Pradeshikam</option>${db.pradeshikams.map(p=>`<option value="${p.id}">${escapeHTML(p.name)}</option>`).join("")}</select>`
:`<input id="pradeshikam" class="form-control" value="${escapeHTML(lockedPr?.name||"")}" disabled>`}
</div>
</div>
<hr class="my-4"><h6 class="fw-bold mb-3">First Payment</h6>
<div class="row g-3">
<div class="col-md-4"><label class="form-label">Receipt Number *</label><input id="receipt" class="form-control" required></div>
<div class="col-md-4"><label class="form-label">Amount *</label><input id="amount" type="number" min="1" step="1" class="form-control" required></div>
<div class="col-md-4"><label class="form-label">Payment Mode *</label><select id="mode" class="form-select" required><option>Cash</option><option>UPI</option><option>Bank</option></select></div>
<div class="col-12"><label class="form-label">Remarks</label><textarea id="remarks" class="form-control" rows="2"></textarea></div>
</div>
<div id="preview" class="receipt-box mt-4">Required amount will be calculated automatically.</div>
<div id="formError" class="alert alert-danger d-none mt-3"></div>
<div class="d-flex justify-content-end gap-2 mt-4"><a href="members.html" class="btn btn-light">Cancel</a><button class="btn btn-primary">Save Member & Payment</button></div>
</form></div>`;

["name","gender","age","phone","house","pradeshikam","receipt","amount","mode"].forEach(id=>document.getElementById(id)?.addEventListener("input",()=>document.getElementById(id).classList.remove("is-invalid")));
["gender","pradeshikam","mode"].forEach(id=>document.getElementById(id)?.addEventListener("change",()=>document.getElementById(id).classList.remove("is-invalid")));
function selectedPradeshikamId(){return s.role==="admin"?Number(document.getElementById("pradeshikam").value):Number(s.pradeshikamId)}
function updatePreview(){
  const req=requiredAmount(document.getElementById("gender").value,document.getElementById("age").value);
  const amt=Number(document.getElementById("amount").value)||0;
  document.getElementById("preview").innerHTML=`<div class="d-flex justify-content-between"><span>Required Amount</span><b>${money(req)}</b></div><div class="d-flex justify-content-between mt-1"><span>First Payment</span><b>${money(amt)}</b></div>`;
}
["gender","age","amount"].forEach(id=>document.getElementById(id).addEventListener("input",updatePreview));
document.getElementById("pradeshikam")?.addEventListener("change",updatePreview);
document.getElementById("memberForm").addEventListener("submit",e=>{
  e.preventDefault();
  const form=e.currentTarget;
  let requiredOk=true;
  form.querySelectorAll("[required]").forEach(el=>{const empty=!String(el.value||"").trim();el.classList.toggle("is-invalid",empty);if(empty)requiredOk=false});
  if(!requiredOk){const err=document.getElementById("formError");err.textContent="Please fill in all required fields highlighted in red.";err.classList.remove("d-none");return}
  const name=document.getElementById("name").value.trim(),gender=document.getElementById("gender").value,age=Number(document.getElementById("age").value),
  phone=normalizePhone(document.getElementById("phone").value),house=document.getElementById("house").value.trim(),receipt=document.getElementById("receipt").value.trim(),
  amount=Number(document.getElementById("amount").value),mode=document.getElementById("mode").value,remarks=document.getElementById("remarks").value.trim(),
  pradeshikamId=selectedPradeshikamId(),err=document.getElementById("formError");
  if(phone.length!==10){err.textContent="Phone number must contain exactly 10 digits after +91.";err.classList.remove("d-none");return}
  if(age<1||age>100){err.textContent="Age must be between 1 and 100.";err.classList.remove("d-none");return}
  if(!pradeshikamId){err.textContent="Select a Pradeshikam.";err.classList.remove("d-none");return}
  const duplicate=db.members.find(m=>m.pradeshikamId===pradeshikamId && ((phone&&house&&m.phone===phone&&m.houseNumber===house)||(name&&house&&!phone&&m.name.toLowerCase()===name.toLowerCase()&&m.houseNumber===house)));
  if(duplicate){err.textContent="This person already exists in this Pradeshikam. Open the existing member and add a payment instead.";err.classList.remove("d-none");return}
  if(db.payments.some(p=>p.receiptNumber===receipt)){err.textContent="This receipt number already exists.";err.classList.remove("d-none");return}
  const req=requiredAmount(gender,age);
  if(amount<=0){err.textContent="Enter a valid payment amount.";err.classList.remove("d-none");return}
  if(req>0 && amount>req){err.textContent=`Payment cannot exceed the required amount of ${money(req)}.`;err.classList.remove("d-none");return}
  const member={id:uid("m"),memberCode:makeMemberCode(pradeshikamId,db),name,gender,age,phone,houseNumber:house,pradeshikamId,requiredAmount:req,createdAt:new Date().toISOString()};
  db.members.push(member);
  const payment={id:uid("pay"),memberId:member.id,receiptNumber:receipt,amount,paymentMode:mode,remarks,paymentDate:new Date().toISOString()};
  db.payments.push(payment);
  addActivity(db,{action:"Member Added",entityType:"member",entityId:member.id,memberId:member.id,pradeshikamId,summary:`${member.name} added`,details:`Member ${member.memberCode} added with first receipt ${receipt} for ${money(amount)}.`,newValue:memberSnapshot(member)});
  addActivity(db,{action:"Payment Added",entityType:"payment",entityId:payment.id,memberId:member.id,pradeshikamId,summary:`Receipt ${receipt} added`,details:`${money(amount)} via ${mode}.`,newValue:paymentSnapshot(payment)});
  saveDB(db);
  location.href="member-details.html?id="+encodeURIComponent(member.id);
});
