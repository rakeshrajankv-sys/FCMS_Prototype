const ctx=getCommitteeContext();
if(ctx){
  const {s,committee}=ctx; let db=getDB(); markActive();
  const isAdmin=s.role==="admin";
  const params=new URLSearchParams(location.search);
  const shouldOpenAdd=params.get("add")==="1";

  function render(){
    db=getDB();
    const rows=subCommitteeRows(db,committee.id).sort((a,b)=>new Date(b.date||b.createdAt)-new Date(a.date||a.createdAt));
    document.getElementById("page-content").innerHTML=`
      ${pageTitle(`${escapeHTML(committee.name)} Collections`,"Collection records",`<button id="addCollection" class="btn btn-primary"><i class="bi bi-plus-circle me-2"></i>Add Collection</button>`)}
      <div class="panel mb-4" id="formWrap" style="display:${shouldOpenAdd?"block":"none"}">
        <div class="d-flex justify-content-between align-items-center mb-3"><div class="panel-title">Add / Edit Collection</div><span class="small text-muted">Receipt number is mandatory</span></div>
        <form id="collectionForm"><input type="hidden" id="editId">
          <div class="row g-3">
            <div class="col-md-4"><label class="form-label">Name *</label><input id="donorName" class="form-control" required placeholder="Person / Shop / Organization / Other"></div>
            <div class="col-md-4"><label class="form-label">Fund Given By *</label><input id="fundGivenBy" class="form-control" required placeholder="Name of the person who gave the fund"></div>
            <div class="col-md-4"><label class="form-label">Phone Number</label><div class="phone-field"><select id="phoneCode" class="form-select"><option value="+91">+91</option><option value="+971">+971</option></select><input id="phone" class="form-control" inputmode="numeric" maxlength="10" placeholder="10-digit number"></div></div>
            <div class="col-md-4"><label class="form-label">Place *</label><input id="place" class="form-control" required placeholder="Where the collection was made"></div>
            <div class="col-md-4"><label class="form-label">Amount *</label><input id="amount" type="number" min="1" class="form-control" required></div>
            <div class="col-md-4"><label class="form-label">Receipt Number *</label><input id="receipt" class="form-control" required></div>
            <div class="col-md-4"><label class="form-label">Payment Mode *</label><select id="mode" class="form-select" required><option>Cash</option><option>UPI</option><option>Bank</option><option>Cheque</option></select></div>
            <div class="col-md-4"><label class="form-label">Date *</label><input id="date" type="date" class="form-control" value="${new Date().toISOString().slice(0,10)}" required></div>
            <div class="col-md-4"><label class="form-label">Remarks</label><input id="remarks" class="form-control"></div>
          </div>
          <div id="err" class="alert alert-danger d-none mt-3"></div>
          <div class="d-flex justify-content-end gap-2 mt-3"><button type="button" id="cancel" class="btn btn-light">Cancel</button><button class="btn btn-primary">Save Collection</button></div>
        </form>
      </div>
      <div class="panel"><div class="d-flex justify-content-between align-items-center mb-3"><div class="panel-title">Collection Records</div><button id="export" class="btn btn-sm btn-light"><i class="bi bi-file-earmark-spreadsheet me-1"></i>Excel / CSV</button></div>
      ${rows.length?`<div class="table-responsive"><table class="table"><thead><tr><th>Name</th><th>Fund Given By</th><th>Phone</th><th>Place</th><th>Receipt</th><th>Amount</th><th>Mode</th><th>Date</th>${isAdmin?"<th>Actions</th>":""}</tr></thead><tbody>${rows.map(x=>`<tr><td>${escapeHTML(x.donorName||x.name||"-")}</td><td>${escapeHTML(x.fundGivenBy||"-")}</td><td>${escapeHTML(subCommitteePhoneLabel(x,db)||"-")}</td><td>${escapeHTML(x.place||"-")}</td><td>${escapeHTML(x.receiptNumber||"-")}</td><td class="fw-semibold">${money(x.amount)}</td><td>${escapeHTML(x.paymentMode||"-")}</td><td>${new Date(x.date||x.createdAt).toLocaleDateString("en-IN")}</td>${isAdmin?`<td><div class="d-flex gap-1"><button class="btn btn-sm btn-light edit" data-id="${x.id}"><i class="bi bi-pencil"></i></button><button class="btn btn-sm btn-outline-danger del" data-id="${x.id}"><i class="bi bi-trash"></i></button></div></td>`:""}</tr>`).join("")}</tbody></table></div>`:`<div class="empty-state"><i class="bi bi-cash-stack"></i>No collections recorded.</div>`}</div>`;

    const formWrap=document.getElementById("formWrap");
    document.getElementById("addCollection").onclick=()=>{formWrap.style.display="block";resetForm();formWrap.scrollIntoView({behavior:"smooth",block:"start"})};
    document.getElementById("cancel").onclick=()=>formWrap.style.display="none";
    document.getElementById("phone").oninput=e=>e.target.value=e.target.value.replace(/\D/g,"").slice(0,10);
    document.getElementById("collectionForm").onsubmit=e=>{
      e.preventDefault();
      const editId=document.getElementById("editId").value;
      const name=document.getElementById("donorName").value.trim();
      const fundGivenBy=document.getElementById("fundGivenBy").value.trim();
      const phone=document.getElementById("phone").value.replace(/\D/g,"");
      const phoneCode=document.getElementById("phoneCode").value;
      const amount=Number(document.getElementById("amount").value);
      const receipt=document.getElementById("receipt").value.trim();
      const err=document.getElementById("err");
      if(!name||!fundGivenBy||!receipt||amount<=0){err.textContent="Name, Fund Given By, amount and receipt number are mandatory.";err.classList.remove("d-none");return;}
      if(phone && ((phoneCode==="+91"&&phone.length!==10)||(phoneCode==="+971"&&(phone.length<9||phone.length>10)))){err.textContent="Enter a valid phone number.";err.classList.remove("d-none");return;}
      const duplicate=(db.subcommitteeCollections||[]).some(x=>(x.receiptNumber||"").toLowerCase()===receipt.toLowerCase()&&x.id!==editId)||(db.payments||[]).some(x=>(x.receiptNumber||"").toLowerCase()===receipt.toLowerCase())||(db.donations||[]).some(x=>(x.receiptNumber||"").toLowerCase()===receipt.toLowerCase());
      if(duplicate){err.textContent="This receipt number is already in use.";err.classList.remove("d-none");return;}
      const rec={id:editId||uid("scc"),committeeId:committee.id,memberId:null,donorName:name,name,fundGivenBy,sourceType:"Sub Committee Collection",phone,countryCode:phoneCode,place:document.getElementById("place").value.trim(),amount,paymentMode:document.getElementById("mode").value,receiptNumber:receipt,date:document.getElementById("date").value,remarks:document.getElementById("remarks").value.trim(),status:"completed",createdAt:new Date().toISOString(),recordedBy:actorLabel()};
      if(editId){const i=db.subcommitteeCollections.findIndex(x=>x.id===editId);const old=db.subcommitteeCollections[i];if(!old){return;}db.subcommitteeCollections[i]=rec;addActivity(db,{action:"Sub Committee Collection Edited",entityType:"subcommitteeCollection",entityId:rec.id,summary:`${committee.name} collection edited`,oldValue:old,newValue:rec});}
      else{db.subcommitteeCollections.push(rec);addActivity(db,{action:"Sub Committee Collection Added",entityType:"subcommitteeCollection",entityId:rec.id,summary:`${committee.name} collected ${money(amount)}`,details:`${receipt}`,newValue:rec});}
      saveDB(db);location.href=`subcommittee-collections.html?committee=${encodeURIComponent(committee.id)}`;
    };
    if(isAdmin){
      document.querySelectorAll(".edit").forEach(b=>b.onclick=()=>{const x=db.subcommitteeCollections.find(x=>x.id===b.dataset.id);if(!x)return;formWrap.style.display="block";document.getElementById("editId").value=x.id;document.getElementById("donorName").value=x.donorName||x.name||"";document.getElementById("fundGivenBy").value=x.fundGivenBy||"";document.getElementById("phone").value=x.phone||"";document.getElementById("phoneCode").value=x.countryCode||"+91";document.getElementById("place").value=x.place||"";document.getElementById("amount").value=x.amount;document.getElementById("receipt").value=x.receiptNumber||"";document.getElementById("mode").value=x.paymentMode||"Cash";document.getElementById("date").value=String(x.date||"").slice(0,10);document.getElementById("remarks").value=x.remarks||"";formWrap.scrollIntoView({behavior:"smooth",block:"start"})});
      document.querySelectorAll(".del").forEach(b=>b.onclick=()=>{const x=db.subcommitteeCollections.find(x=>x.id===b.dataset.id);if(!x||!confirm("Delete this collection?"))return;db.subcommitteeCollections=db.subcommitteeCollections.filter(y=>y.id!==x.id);addActivity(db,{action:"Sub Committee Collection Deleted",entityType:"subcommitteeCollection",entityId:x.id,summary:`${committee.name} collection deleted`,oldValue:x});saveDB(db);render();});
    }
    document.getElementById("export").onclick=()=>exportCSV(rows.map(x=>({Date:x.date,Committee:committee.name,Name:x.donorName||x.name||"",FundGivenBy:x.fundGivenBy||"",Phone:subCommitteePhoneLabel(x,db),Place:x.place||"",Receipt:x.receiptNumber,Amount:x.amount,PaymentMode:x.paymentMode,Remarks:x.remarks||""})),`${committee.id}-collections.csv`);
  }
  function resetForm(){document.getElementById("collectionForm").reset();document.getElementById("editId").value="";document.getElementById("date").value=new Date().toISOString().slice(0,10);document.getElementById("err").classList.add("d-none");}
  render();
}
