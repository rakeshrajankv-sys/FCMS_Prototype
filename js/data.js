const FCMS_KEY = "fcms_prototype_v1";
const SESSION_KEY = "fcms_session";

const PRADESHIKAM_NAMES = [
  "Ambangad","Bara/Mukkunnoth","Bedakam","Chalingal","Chemmanad","Kalanad","kuttikkol","Kolathur/Maruthadukkam","Kaniyamabdi","Melbara","Poinachi","pakkam","Periya","Poochakkad","Thokkanam/karuvakod","Thiravakoli","Udma","chendalam"
];
const DEFAULT_PRADESHIKAMS = PRADESHIKAM_NAMES.map((name,i)=>({id:i+1,name,username:`p${i+1}`,password:"p123"}));
const DEFAULT_USERS = [
  {id:1,role:"admin",name:"Main Committee",username:"admin",password:"admin123",pradeshikamId:null},
  ...DEFAULT_PRADESHIKAMS.map((p,i)=>({id:i+2,role:"pradeshikam",name:p.name,username:p.username,password:p.password,pradeshikamId:p.id}))
];

function seedDemoData(){
  let db=JSON.parse(localStorage.getItem(FCMS_KEY)||"null");
  if(!db) db={pradeshikams:DEFAULT_PRADESHIKAMS,users:DEFAULT_USERS,members:[],payments:[],donations:[],activities:[],submissions:[]};
  db.pradeshikams ||= DEFAULT_PRADESHIKAMS;
  db.pradeshikams.forEach((p,i)=>{if(PRADESHIKAM_NAMES[i])p.name=PRADESHIKAM_NAMES[i]});
  db.users ||= DEFAULT_USERS;
  db.users.forEach(u=>{if(u.role==="pradeshikam"&&u.pradeshikamId&&PRADESHIKAM_NAMES[u.pradeshikamId-1])u.name=PRADESHIKAM_NAMES[u.pradeshikamId-1]});
  db.members ||= []; db.payments ||= []; db.donations ||= []; db.activities ||= []; db.submissions ||= [];
  db.members.forEach(m=>{m.countryCode ||= "+91"; m.maritalStatus ||= "Single";});
  db.donations.forEach(d=>{d.sourceType ||= "Member"; d.paymentMode ||= "Cash";});
  db.submissions.forEach(x=>{if(x.memberAmount==null&&x.donationAmount==null){x.memberAmount=Number(x.amount||0);x.donationAmount=0;}x.memberAmount=Number(x.memberAmount||0);x.donationAmount=Number(x.donationAmount||0);x.amount=x.memberAmount+x.donationAmount;});
  localStorage.setItem(FCMS_KEY,JSON.stringify(db));
  return db;
}
function getDB(){return seedDemoData()}
function saveDB(db){localStorage.setItem(FCMS_KEY,JSON.stringify(db))}
function uid(prefix="id"){return prefix+"_"+Date.now().toString(36)+"_"+Math.random().toString(36).slice(2,7)}
function money(n){return new Intl.NumberFormat("en-IN",{style:"currency",currency:"INR",maximumFractionDigits:0}).format(Number(n)||0)}
function escapeHTML(v){return String(v??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]))}
function normalizePhone(v){return String(v??"").replace(/\D/g,"")}
function formatPhone(v,countryCode="+91"){const digits=normalizePhone(v);return digits?`${countryCode||"+91"} ${digits}`:""}
function requiredAmount(gender,age){return Number(age)>=21?(gender==="Male"?8000:gender==="Female"?2000:0):0}
function statusFor(required,paid){required=Number(required)||0;paid=Number(paid)||0;if(required<=0)return "Green";const pct=paid/required*100;if(pct>=100)return "Green";if(pct>=80)return "Yellow";return "Red"}
function percent(required,paid){return Math.min(100,required>0?(paid/required)*100:100)}
function memberStats(member,db=getDB()){
  const paid=db.payments.filter(p=>p.memberId===member.id).reduce((s,p)=>s+Number(p.amount||0),0);
  const req=Number(member.requiredAmount)||0;
  return {paid,balance:Math.max(0,req-paid),status:statusFor(req,paid),percent:percent(req,paid)};
}
function makeMemberCode(pradeshikamId,db=getDB()){const prefix=`P${String(pradeshikamId).padStart(2,"0")}-`;const nums=db.members.filter(m=>m.pradeshikamId===Number(pradeshikamId)).map(m=>Number(String(m.memberCode||"").split("-")[1])).filter(Boolean);const next=(nums.length?Math.max(...nums):0)+1;return prefix+String(next).padStart(4,"0")}
function houseKey(v){return String(v||"").trim().toLowerCase().replace(/\s+/g," ")}
function houseMembersFor(member,db=getDB()){if(!member)return[];const key=houseKey(member.houseNumber);return db.members.filter(m=>m.pradeshikamId===member.pradeshikamId&&houseKey(m.houseNumber)===key)}
function donationTotal(pradeshikamId=null,db=getDB()){return (db.donations||[]).filter(d=>pradeshikamId==null||Number(d.pradeshikamId)===Number(pradeshikamId)).reduce((a,d)=>a+Number(d.amount||0),0)}
function memberCollectionTotal(pradeshikamId=null,db=getDB()){return (db.payments||[]).filter(p=>{const m=db.members.find(x=>x.id===p.memberId);return !!m&&(pradeshikamId==null||Number(m.pradeshikamId)===Number(pradeshikamId))}).reduce((a,p)=>a+Number(p.amount||0),0)}
function totalReceived(pradeshikamId=null,db=getDB()){return memberCollectionTotal(pradeshikamId,db)+donationTotal(pradeshikamId,db)}
function currentSession(){return JSON.parse(sessionStorage.getItem(SESSION_KEY)||"null")}
function setSession(user){sessionStorage.setItem(SESSION_KEY,JSON.stringify(user))}
function clearSession(){sessionStorage.removeItem(SESSION_KEY)}
function actorLabel(){const s=currentSession();return s?(s.role==="admin"?"Main Committee":s.name):"System"}
function addActivity(db,{action,entityType,entityId,memberId,pradeshikamId,summary,details,oldValue=null,newValue=null}){db.activities ||= [];db.activities.unshift({id:uid("act"),timestamp:new Date().toISOString(),actor:actorLabel(),actorRole:currentSession()?.role||"system",action,entityType,entityId,memberId:memberId||null,pradeshikamId:pradeshikamId||null,summary,details:details||"",oldValue:oldValue===undefined?null:oldValue,newValue:newValue===undefined?null:newValue})}
function memberSnapshot(m){if(!m)return null;return {memberCode:m.memberCode,name:m.name,gender:m.gender,age:m.age,phone:m.phone||"",countryCode:m.countryCode||"+91",maritalStatus:m.maritalStatus||"Single",houseNumber:m.houseNumber||"",pradeshikamId:m.pradeshikamId,requiredAmount:m.requiredAmount,receiptNumber:m.receiptNumber||""}}
function paymentSnapshot(p){if(!p)return null;return {receiptNumber:p.receiptNumber,masterReceiptNumber:p.masterReceiptNumber||null,amount:Number(p.amount),paymentMode:p.paymentMode,remarks:p.remarks||"",paymentDate:p.paymentDate}}
function donationSnapshot(d){if(!d)return null;return {receiptNumber:d.receiptNumber,amount:Number(d.amount),sourceType:d.sourceType||"Member",donorName:d.donorName||"",pradeshikamId:d.pradeshikamId,paymentMode:d.paymentMode||"",date:d.date||d.createdAt,remarks:d.remarks||""}}
function resetPrototype(){localStorage.removeItem(FCMS_KEY);location.href="index.html"}
