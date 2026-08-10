/* Required-field visual validation: keeps the existing design and only marks missing required fields red. */
(function(){
  function markMissing(form){
    let first=null;
    form.querySelectorAll('[required]').forEach(function(el){
      const empty = (el.type === 'checkbox' || el.type === 'radio') ? !el.checked : !String(el.value||'').trim();
      el.classList.toggle('field-missing', empty);
      if(empty && !first) first=el;
    });
    if(first) first.focus();
    return !first;
  }
  document.addEventListener('DOMContentLoaded', function(){
    document.querySelectorAll('form').forEach(function(form){
      form.addEventListener('submit', function(e){
        if(!markMissing(form)) e.preventDefault();
      }, true);
      form.addEventListener('input', function(e){
        if(e.target.matches('[required]') && String(e.target.value||'').trim()) e.target.classList.remove('field-missing');
      });
      form.addEventListener('change', function(e){
        if(e.target.matches('[required]') && String(e.target.value||'').trim()) e.target.classList.remove('field-missing');
      });
      form.querySelectorAll('[required]').forEach(function(el){
        el.addEventListener('blur', function(){
          if(!String(el.value||'').trim()) el.classList.add('field-missing');
        });
      });
    });
  });
})();


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
