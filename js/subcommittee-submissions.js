const s=currentSession();
if(!s){location.href="index.html";}
else if(s.role==="admin"){location.href="submissions.html?type=subcommittee";}
else if(s.role==="subcommittee"){location.href=`submissions.html?type=subcommittee&id=${encodeURIComponent(s.subCommitteeId)}`;}
else{location.href="dashboard.html";}
