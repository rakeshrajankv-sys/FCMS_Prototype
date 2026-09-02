/* First-device identity enrollment.
   The current FCMS prototype has no SMS provider configured, so this stores a
   device-bound verification challenge. Replace sendOtp/verifyOtp with Supabase
   Phone Auth when SMS credentials are configured. */
const FCMS_DEVICE_KEY = "fcms_verified_devices_v2";
function deviceFingerprint() {
  const raw = [navigator.userAgent, navigator.platform, screen.width, screen.height, Intl.DateTimeFormat().resolvedOptions().timeZone].join("|");
  let h = 2166136261;
  for (let i = 0; i < raw.length; i++) { h ^= raw.charCodeAt(i); h = Math.imul(h, 16777619); }
  return "dev_" + (h >>> 0).toString(16);
}
function deviceRecords() { try { return JSON.parse(localStorage.getItem(FCMS_DEVICE_KEY) || "{}"); } catch (_) { return {}; } }
function deviceRecord(userId) { const r=deviceRecords()[String(userId)]; return r && r.deviceId===deviceFingerprint() && r.verifiedAt ? r : null; }
function deviceIsVerified(userId) { return !!deviceRecord(userId); }
function saveDeviceVerification(userId, profile) {
  const now=new Date().toISOString(), deviceId=deviceFingerprint();
  const all=deviceRecords(); all[String(userId)]={deviceId,verifiedAt:now,name:profile.name,phone:profile.phone}; localStorage.setItem(FCMS_DEVICE_KEY,JSON.stringify(all));
  const db=getDB(); db.verifiedUsers ||= []; const account=db.users.find(u=>String(u.id)===String(userId));
  const pr=account?.role==="pradeshikam"?db.pradeshikams.find(p=>Number(p.id)===Number(account.pradeshikamId)):null;
  const sc=account?.role==="subcommittee"?db.subCommittees.find(c=>Number(c.id)===Number(account.subCommitteeId)):null;
  const existing=db.verifiedUsers.find(x=>String(x.userId)===String(userId)&&x.deviceId===deviceId);
  const row={userId,deviceId,name:profile.name,phone:profile.phone,username:account?.username||"",role:account?.role||"",pradeshikamId:account?.pradeshikamId||null,pradeshikamName:pr?.name||"",subCommitteeId:account?.subCommitteeId||null,subCommitteeName:sc?.name||"",deviceType:/Mobi|Android/i.test(navigator.userAgent)?"Mobile":"Desktop / Laptop",lastVerifiedAt:now};
  if(existing){Object.assign(existing,row);existing.verificationCount=Number(existing.verificationCount||0)+1;existing.firstVerifiedAt ||= now;} else db.verifiedUsers.push({...row,firstVerifiedAt:now,verificationCount:1});
  if(account){account.verifiedPhone=profile.phone; account.lastVerifiedName=profile.name;}
  fcmsClearPageDraft(); saveDB(db);
}
function normalizedPhone(v){
  const digits=String(v||"").replace(/\D/g,"").replace(/^91(?=\d{10}$)/,"");
  return digits ? "+91" + digits.slice(0,10) : "";
}
function localPhoneDigits(v){ return String(v||"").replace(/\D/g,"").replace(/^91(?=\d{10}$)/,"").slice(0,10); }
function validPhone(v){ return /^[6-9]\d{9}$/.test(localPhoneDigits(v)); }
const FCMS_DEMO_OTP = "123456";
function requestDeviceEnrollment(user) {
  const existing=deviceRecord(user.id);
  if (existing) { user.name=existing.name||user.name; user.verifiedPhone=existing.phone||""; return Promise.resolve(true); }
  return new Promise(resolve=>{
    const overlay=document.createElement("div"); overlay.className="fcms-device-overlay fcms-device-enter";
    overlay.innerHTML=`<div class="fcms-device-card">
      <div class="fcms-verification-brand"><img src="logo.png?v=20260902optimized1" alt="FCMS" width="512" height="512" decoding="async"><h2>Verification</h2><span></span></div>
      <div id="dvStep1">
        <div class="fcms-input-icon"><i class="bi bi-person"></i><input id="dvName" class="form-control form-control-lg" value="" autocomplete="name" placeholder="Enter your full name" required></div>
        <div class="fcms-phone-field"><span class="fcms-country-code">+91</span><div class="fcms-input-icon"><i class="bi bi-telephone"></i><input id="dvPhone" class="form-control form-control-lg" inputmode="numeric" autocomplete="tel-national" maxlength="10" placeholder="Enter mobile number" required></div></div>
        <div id="dvErr" class="alert alert-danger d-none mt-3"></div>
        <button id="dvContinue" class="btn btn-primary btn-lg w-100 fcms-verify-button">Verify &amp; Continue <i class="bi bi-arrow-right"></i></button>
      </div>
      <div id="dvStep2" class="d-none">
        <div class="fcms-confirm-title">Confirm Details</div>
        <div id="dvConfirmSummary" class="fcms-confirm-summary"></div>
        <div id="dvOtpWrap"><div class="fcms-input-icon"><i class="bi bi-shield-lock"></i><input id="dvOtp" class="form-control form-control-lg text-center" inputmode="numeric" maxlength="6" autocomplete="one-time-code" placeholder="Enter 6-digit OTP"></div><div class="fcms-demo-otp">Demo OTP: <strong>123456</strong></div><div id="dvOtpErr" class="alert alert-danger d-none mt-3"></div></div>
        <button id="dvVerify" class="btn btn-primary btn-lg w-100 fcms-verify-button">Verify OTP &amp; Continue <i class="bi bi-arrow-right"></i></button>
        <button id="dvBack" type="button" class="btn btn-link w-100 mt-2">Back</button>
      </div>
    </div>`
    document.body.appendChild(overlay); requestAnimationFrame(()=>overlay.classList.add("is-visible"));
    const phoneInput=overlay.querySelector("#dvPhone");
    phoneInput.addEventListener("input",()=>{ phoneInput.value=phoneInput.value.replace(/\D/g,"").slice(0,10); });
    const otpInput=overlay.querySelector("#dvOtp");
    otpInput.addEventListener("input",()=>{ otpInput.value=otpInput.value.replace(/\D/g,"").slice(0,6); });
    const err=overlay.querySelector("#dvErr"), otpErr=overlay.querySelector("#dvOtpErr");
    const swapStep=(from,to)=>{ from.classList.add("fcms-step-out"); window.setTimeout(()=>{ from.classList.add("d-none"); from.classList.remove("fcms-step-out"); to.classList.remove("d-none"); to.classList.add("fcms-step-in"); requestAnimationFrame(()=>to.classList.remove("fcms-step-in")); },180); };
    const closeOverlay=(ok)=>{ overlay.classList.remove("is-visible"); overlay.classList.add("fcms-device-exit"); window.setTimeout(()=>{ overlay.remove(); resolve(ok); },220); };
    overlay.querySelector("#dvContinue").onclick=()=>{ const name=overlay.querySelector("#dvName").value.trim(),localPhone=localPhoneDigits(overlay.querySelector("#dvPhone").value),phone=normalizedPhone(localPhone); err.classList.add("d-none"); if(name.length<2){err.textContent="Enter your full name.";err.classList.remove("d-none");return;} if(!validPhone(localPhone)){err.textContent="Enter a valid 10-digit Indian mobile number.";err.classList.remove("d-none");return;} overlay.dataset.name=name;overlay.dataset.phone=phone; overlay.querySelector("#dvConfirmSummary").innerHTML=`<div><span>Name</span><b>${escapeHTML(name)}</b></div><div><span>Mobile</span><b>${escapeHTML(phone)}</b></div>`; swapStep(overlay.querySelector("#dvStep1"),overlay.querySelector("#dvStep2")); window.setTimeout(()=>overlay.querySelector("#dvOtp")?.focus(),240); };
    overlay.querySelector("#dvBack").onclick=()=>{swapStep(overlay.querySelector("#dvStep2"),overlay.querySelector("#dvStep1"));};
    overlay.querySelector("#dvVerify").onclick=()=>{ const code=overlay.querySelector("#dvOtp").value.trim(); otpErr.classList.add("d-none"); if(!/^\d{6}$/.test(code)){otpErr.textContent="Enter the 6-digit OTP.";otpErr.classList.remove("d-none");return;} if(typeof window.fcmsVerifyPhoneOtp === "function"){ Promise.resolve(window.fcmsVerifyPhoneOtp(overlay.dataset.phone,code)).then(ok=>{if(!ok){otpErr.textContent="Invalid OTP.";otpErr.classList.remove("d-none");return;} complete();}).catch(()=>{otpErr.textContent="OTP verification failed.";otpErr.classList.remove("d-none");}); return; } if(code!==FCMS_DEMO_OTP){otpErr.textContent="Invalid OTP. Use 123456 for the prototype.";otpErr.classList.remove("d-none");return;} complete(); };
    function complete(){ saveDeviceVerification(user.id,{name:overlay.dataset.name,phone:overlay.dataset.phone}); user.name=overlay.dataset.name; user.verifiedPhone=overlay.dataset.phone; closeOverlay(true); }
  });
}

/* Verification over Login background: hide Login card only */
(function(){
  function syncVerificationLoginState(){
    const verification = document.querySelector(".fcms-device-overlay");
    const visible = !!verification && getComputedStyle(verification).display !== "none";
    document.documentElement.classList.toggle("fcms-verification-active", visible);
  }

  const observer = new MutationObserver(syncVerificationLoginState);
  observer.observe(document.documentElement, {
    childList:true,
    subtree:true,
    attributes:true,
    attributeFilter:["class","style","hidden"]
  });

  if(document.readyState === "loading"){
    document.addEventListener("DOMContentLoaded", syncVerificationLoginState, {once:true});
  }else{
    syncVerificationLoginState();
  }
})();
