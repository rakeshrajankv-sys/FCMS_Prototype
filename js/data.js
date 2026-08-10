const FCMS_KEY = "fcms_prototype_v1";
const SESSION_KEY = "fcms_session";

const DEFAULT_PRADESHIKAMS = Array.from({length:18},(_,i)=>({id:i+1,name:`Pradeshikam ${i+1}`,username:`p${i+1}`,password:"p123"}));
const DEFAULT_USERS = [
  {id:1,role:"admin",name:"Main Committee",username:"admin",password:"admin123",pradeshikamId:null},
  ...DEFAULT_PRADESHIKAMS.map((p,i)=>({id:i+2,role:"pradeshikam",name:p.name,username:p.username,password:p.password,pradeshikamId:p.id}))
];

function seedDemoData(){
  let db = JSON.parse(localStorage.getItem(FCMS_KEY) || "null");
  if(!db){
    db={pradeshikams:DEFAULT_PRADESHIKAMS,users:DEFAULT_USERS,members:[],payments:[],activities:[]};
    localStorage.setItem(FCMS_KEY,JSON.stringify(db));
  } else {
    db.pradeshikams ||= DEFAULT_PRADESHIKAMS;
    db.users ||= DEFAULT_USERS;
    db.members ||= [];
    db.payments ||= [];
    db.activities ||= [];
    // Migrate older versions without changing their existing data.
    if(!Array.isArray(db.activities)) db.activities=[];
    localStorage.setItem(FCMS_KEY,JSON.stringify(db));
  }
  return db;
}
function getDB(){return seedDemoData()}
function saveDB(db){localStorage.setItem(FCMS_KEY,JSON.stringify(db))}
function uid(prefix="id"){return prefix+"_"+Date.now().toString(36)+"_"+Math.random().toString(36).slice(2,7)}
function money(n){return new Intl.NumberFormat("en-IN",{style:"currency",currency:"INR",maximumFractionDigits:0}).format(Number(n)||0)}
function escapeHTML(v){return String(v??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]))}
function normalizePhone(v){
  const digits=String(v??"").replace(/\D/g,"");
  return digits.startsWith("91") && digits.length===12 ? digits.slice(2) : digits;
}
function formatPhone(v){
  const digits=normalizePhone(v);
  return digits.length===10 ? "+91 "+digits : (digits ? "+91 "+digits : "");
}
function requiredAmount(gender,age){return Number(age)>=21 ? (gender==="Male"?8000:gender==="Female"?2000:0) : 0}
function statusFor(required,paid){
  required=Number(required)||0; paid=Number(paid)||0;
  if(required<=0) return "Green";
  const pct=paid/required*100;
  if(pct>=100) return "Green";
  if(pct>=80) return "Yellow";
  return "Red";
}
function percent(required,paid){return Math.min(100,required>0?(paid/required)*100:100)}
function memberStats(member,db=getDB()){
  const paid=db.payments.filter(p=>p.memberId===member.id).reduce((s,p)=>s+Number(p.amount),0);
  const req=Number(member.requiredAmount);
  return {paid,balance:Math.max(0,req-paid),status:statusFor(req,paid),percent:percent(req,paid)};
}
function makeMemberCode(pradeshikamId,db=getDB()){
  const prefix=`P${String(pradeshikamId).padStart(2,"0")}-`;
  const nums=db.members.filter(m=>m.pradeshikamId===Number(pradeshikamId)).map(m=>Number(String(m.memberCode||"").split("-")[1])).filter(Boolean);
  const next=(nums.length?Math.max(...nums):0)+1;
  return prefix+String(next).padStart(4,"0");
}
function currentSession(){return JSON.parse(sessionStorage.getItem(SESSION_KEY)||"null")}
function setSession(user){sessionStorage.setItem(SESSION_KEY,JSON.stringify(user))}
function clearSession(){sessionStorage.removeItem(SESSION_KEY)}

function actorLabel(){
  const s=currentSession();
  return s ? (s.role==="admin" ? "Main Committee" : s.name) : "System";
}
function addActivity(db,{action,entityType,entityId,memberId,pradeshikamId,summary,details,oldValue=null,newValue=null}){
  db.activities ||= [];
  db.activities.unshift({
    id:uid("act"),
    timestamp:new Date().toISOString(),
    actor:actorLabel(),
    actorRole:currentSession()?.role||"system",
    action,entityType,entityId,memberId:memberId||null,
    pradeshikamId:pradeshikamId||null,summary,details:details||"",
    oldValue:oldValue===undefined?null:oldValue,
    newValue:newValue===undefined?null:newValue
  });
}
function memberSnapshot(m){
  if(!m) return null;
  return {memberCode:m.memberCode,name:m.name,gender:m.gender,age:m.age,phone:m.phone||"",houseNumber:m.houseNumber||"",pradeshikamId:m.pradeshikamId,requiredAmount:m.requiredAmount};
}
function paymentSnapshot(p){
  if(!p) return null;
  return {receiptNumber:p.receiptNumber,amount:Number(p.amount),paymentMode:p.paymentMode,remarks:p.remarks||"",paymentDate:p.paymentDate};
}
function resetPrototype(){
  localStorage.removeItem(FCMS_KEY); location.href="index.html";
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
