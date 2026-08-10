function exportCSV(data,filename){if(!data.length){alert("No data to export.");return}const keys=Object.keys(data[0]),csv=[keys.join(","),...data.map(row=>keys.map(k=>`"${String(row[k]??"").replace(/"/g,'""')}"`).join(","))].join("\n");const blob=new Blob(["\ufeff"+csv],{type:"text/csv;charset=utf-8"}),a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download=filename;a.click();URL.revokeObjectURL(a.href)}


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
