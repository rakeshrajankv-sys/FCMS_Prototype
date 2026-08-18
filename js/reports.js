const db = getDB(),
  s = currentSession();
markActive();
if (s.role === "subcommittee") {
  renderSubCommitteeReport();
} else {
  renderMainReport();
}
function renderSubCommitteeReport() {
  const c = db.subCommittees.find(
    (x) => Number(x.id) === Number(s.subCommitteeId),
  );
  document.getElementById("page-content").innerHTML =
    `${pageTitle(`${escapeHTML(c?.name || "Sub Committee")} Reports`)}<div class="panel mb-4"><div class="row g-2 align-items-end"><div class="col-md-4"><label class="form-label">Report / റിപ്പോർട്ട്</label><select id="scType" class="form-select"><option value="collections">Collections</option><option value="expenses">Expenses</option><option value="submissions">Submissions</option></select></div><div class="col-md-2"><button id="scDownload" class="btn btn-primary w-100"><i class="bi bi-file-earmark-spreadsheet me-1"></i>Export</button></div></div></div><div class="panel"><div class="panel-title mb-3">Summary</div><div id="scSummary"></div></div>`;
  const collected = subCommitteeCollectionTotal(c.id, db),
    submitted = subCommitteeSubmittedTotal(c.id, db),
    received = subCommitteeAllocationTotal(c.id, db),
    spent = subCommitteeExpenseTotal(c.id, db);
  document.getElementById("scSummary").innerHTML =
    `<div class="row g-3"><div class="col-6 col-lg-3"><div class="stat-card"><div class="stat-label">Collected</div><div class="stat-value">${money(collected)}</div></div></div><div class="col-6 col-lg-3"><div class="stat-card"><div class="stat-label">Submitted</div><div class="stat-value">${money(submitted)}</div></div></div><div class="col-6 col-lg-3"><div class="stat-card"><div class="stat-label">Received from Office</div><div class="stat-value">${money(received)}</div></div></div><div class="col-6 col-lg-3"><div class="stat-card"><div class="stat-label">Spent</div><div class="stat-value">${money(spent)}</div></div></div></div>`;
  document.getElementById("scDownload").addEventListener("click", () => {
    const type = document.getElementById("scType").value;
    if (type === "collections") {
      const data = (db.subCommitteeCollections || [])
        .filter((x) => Number(x.subCommitteeId) === Number(c.id))
        .flatMap((x) => {
          const base = [{ Date: new Date(x.date || x.createdAt).toLocaleString("en-IN"), Source: x.sourceType || "Person", Name: x.donorName || "", Place: x.place || "", Receipt: x.receiptNumber || "", Amount: x.amount, PaymentMode: x.paymentMode || "", Remarks: x.remarks || "" }];
          const extra = (db.subCommitteeCollectionPayments || []).filter(p => p.collectionId === x.id).map(p => ({ Date: new Date(p.date || p.createdAt).toLocaleString("en-IN"), Source: "Additional Payment", Name: x.donorName || "", Place: x.place || "", Receipt: p.receiptNumber || "", Amount: p.amount, PaymentMode: p.paymentMode || "", Remarks: p.remarks || "" }));
          return base.concat(extra);
        });
      exportCSV(data, "fcms-subcommittee-collections.csv");
    } else if (type === "expenses") {
      const data = (db.subCommitteeExpenses || [])
        .filter((x) => Number(x.subCommitteeId) === Number(c.id))
        .map((x) => ({
          Date: new Date(x.date || x.createdAt).toLocaleString("en-IN"),
          Description: x.description || "",
          Amount: x.amount,
          Bill: x.billName || "",
          Remarks: x.remarks || "",
        }));
      exportCSV(data, "fcms-subcommittee-expenses.csv");
    } else {
      const data = (db.subCommitteeSubmissions || [])
        .filter((x) => Number(x.subCommitteeId) === Number(c.id))
        .map((x) => ({
          Date: new Date(x.date || x.createdAt).toLocaleString("en-IN"),
          Amount: x.amount,
          RecordedBy: x.recordedBy || "",
          Remarks: x.remarks || "",
        }));
      exportCSV(data, "fcms-subcommittee-submissions.csv");
    }
  });
}
function renderMainReport() {
  document.getElementById("page-content").innerHTML =
    `${pageTitle("Reports")}<div class="panel mb-4"><div class="row g-2 align-items-end"><div class="col-md-4"><label class="form-label">Pradeshikam / പ്രദേശികം</label><select id="pr" class="form-select">${s.role === "admin" ? `<option value="">All Pradeshikams</option>` : ""}${db.pradeshikams
      .filter((p) => s.role === "admin" || p.id === s.pradeshikamId)
      .map(
        (p) =>
          `<option value="${p.id}" ${s.role !== "admin" ? "selected" : ""}>${escapeHTML(p.name)}</option>`,
      )
      .join(
        "",
      )}</select></div><div class="col-md-3"><label class="form-label">Status / നില</label><select id="st" class="form-select"><option value="">All statuses</option><option>Green</option><option>Yellow</option><option>Red</option></select></div><div class="col-md-3"><label class="form-label">Report / റിപ്പോർട്ട്</label><select id="type" class="form-select"><option value="members">Members</option><option value="payments">Collections</option><option value="donations">Donations</option>${s.role === "admin" ? `<option value="subcommittee">Sub Committee Collections</option><option value="subcommitteeExpenses">Sub Committee Expenses</option><option value="subcommitteeOverview">Sub Committee Overview</option>` : ""}</select></div><div class="col-md-2"><button id="download" class="btn btn-primary w-100"><i class="bi bi-file-earmark-spreadsheet me-1"></i>Export</button></div></div></div><div class="panel"><div class="panel-title mb-3">Summary</div><div id="summary"></div></div>`;
  function selectedPid() {
    return document.getElementById("pr").value;
  }
  function filteredMembers() {
    return db.members.filter(
      (m) =>
        (s.role === "admin" || m.pradeshikamId === s.pradeshikamId) &&
        (!selectedPid() || m.pradeshikamId == selectedPid()) &&
        (!document.getElementById("st").value ||
          memberStats(m, db).status === document.getElementById("st").value),
    );
  }
  function visibleDonations() {
    return (db.donations || []).filter(
      (d) =>
        d.status !== "hold" &&
        (s.role === "admin" ||
          Number(d.pradeshikamId) === Number(s.pradeshikamId)) &&
        (!selectedPid() || Number(d.pradeshikamId) === Number(selectedPid())),
    );
  }
  function visibleDonationsAll() {
    return (db.donations || []).filter(
      (d) =>
        (s.role === "admin" ||
          Number(d.pradeshikamId) === Number(s.pradeshikamId)) &&
        (!selectedPid() || Number(d.pradeshikamId) === Number(selectedPid())),
    );
  }
  function renderSummary() {
    const ms = filteredMembers(),
      ex = ms.reduce((a, m) => a + Number(m.requiredAmount), 0),
      pd = ms.reduce((a, m) => a + memberStats(m, db).paid, 0),
      ds = visibleDonations().reduce((a, d) => a + Number(d.amount || 0), 0);
    const overview = db.subCommittees.map((c) => { const collected=subCommitteeCollectionTotal(c.id,db), submitted=subCommitteeSubmittedTotal(c.id,db), received=subCommitteeAllocationTotal(c.id,db), spent=subCommitteeExpenseTotal(c.id,db); return {c,collected,submitted,received,spent}; });
    document.getElementById("summary").innerHTML =
      `<div class="row g-3 mb-4"><div class="col-6 col-lg-3"><div class="stat-card"><div class="stat-label">Members</div><div class="stat-value">${ms.length}</div></div></div><div class="col-6 col-lg-3"><div class="stat-card"><div class="stat-label">Collected by Pradeshikam</div><div class="stat-value">${money(pd)}</div></div></div><div class="col-6 col-lg-3"><div class="stat-card"><div class="stat-label">Donations</div><div class="stat-value">${money(ds)}</div></div></div><div class="col-6 col-lg-3"><div class="stat-card"><div class="stat-label">Total Received</div><div class="stat-value">${money(pd + ds)}</div></div></div></div><div class="small text-muted mb-4">Member required amount: ${money(ex)} · Member balance: ${money(Math.max(0, ex - pd))}</div><div class="panel border-0 p-0"><div class="panel-title mb-3">Sub Committee Overview</div><div class="table-responsive"><table class="table"><thead><tr><th>Sub Committee</th><th>Collected</th><th>Submitted</th><th>Remaining</th><th>Received from Office</th><th>Spent</th><th>Balance</th></tr></thead><tbody>${overview.map(x=>`<tr><td><b>${escapeHTML(x.c.name)}</b></td><td>${money(x.collected)}</td><td>${money(x.submitted)}</td><td>${money(Math.max(0,x.collected-x.submitted))}</td><td>${money(x.received)}</td><td>${money(x.spent)}</td><td class="fw-semibold">${money(Math.max(0,x.received-x.spent))}</td></tr>`).join("")}</tbody></table></div></div>`;
  }
  ["pr", "st", "type"].forEach((id) =>
    document.getElementById(id).addEventListener("change", renderSummary),
  );
  document.getElementById("download").addEventListener("click", () => {
    const type = document.getElementById("type").value;
    if (type === "members") {
      const data = filteredMembers().map((m) => {
        const x = memberStats(m, db),
          p = db.pradeshikams.find((p) => p.id === m.pradeshikamId);
        return {
          MemberID: m.memberCode,
          Name: m.name,
          Gender: m.gender,
          Age: m.age,
          MaritalStatus: m.maritalStatus || "",
          Phone: formatPhone(m.phone || "", m.countryCode || "+91"),
          HouseNumber: m.houseNumber || "",
          Pradeshikam: p?.name || "",
          Required: m.requiredAmount,
          Paid: x.paid,
          Balance: x.balance,
          Status: x.status,
        };
      });
      exportCSV(data, "fcms-members.csv");
    } else if (type === "payments") {
      const ids = new Set(filteredMembers().map((m) => m.id));
      const data = db.payments
        .filter((p) => ids.has(p.memberId))
        .map((p) => {
          const m = db.members.find((x) => x.id === p.memberId),
            pr = db.pradeshikams.find((x) => x.id === m?.pradeshikamId);
          return {
            Receipt: p.receiptNumber,
            MemberID: m?.memberCode || "",
            Name: m?.name || "",
            Pradeshikam: pr?.name || "",
            Amount: p.amount,
            PaymentMode: p.paymentMode,
            Status: p.status === "hold" ? "Hold" : "Completed",
            Date: new Date(p.paymentDate).toLocaleString("en-IN"),
            Remarks: p.remarks || "",
          };
        });
      exportCSV(data, "fcms-collections.csv");
    } else if (type === "donations") {
      const data = visibleDonationsAll().map((d) => {
        const donor = d.donorMemberId
            ? db.members.find((m) => m.id === d.donorMemberId)
            : null,
          pr = db.pradeshikams.find(
            (p) => Number(p.id) === Number(d.pradeshikamId),
          );
        return {
          Date: new Date(d.date || d.createdAt).toLocaleString("en-IN"),
          Receipt: d.receiptNumber || "",
          Source: d.sourceType || "Member",
          Donor: d.donorName || donor?.name || "",
          House: d.houseNumber || donor?.houseNumber || "",
          Pradeshikam: pr?.name || "",
          Amount: d.amount,
          PaymentMode: d.paymentMode || "",
          Status: d.status === "hold" ? "Hold" : "Completed",
          Remarks: d.remarks || "",
        };
      });
      exportCSV(data, "fcms-donations.csv");
    } else if (type === "subcommittee") {
      const data = (db.subCommitteeCollections || []).map((x) => {
        const c = db.subCommittees.find(
          (y) => Number(y.id) === Number(x.subCommitteeId),
        );
        return {
          Date: new Date(x.date || x.createdAt).toLocaleString("en-IN"),
          SubCommittee: c?.name || "",
          Source: x.sourceType || "Person",
          Name: x.donorName || "",
          Place: x.place || "",
          Receipt: x.receiptNumber || "",
          Amount: x.amount,
          PaymentMode: x.paymentMode || "",
          Remarks: x.remarks || "",
        };
      });
      exportCSV(data, "fcms-subcommittee-collections.csv");
    } else if (type === "subcommitteeExpenses") {
      const data = (db.subCommitteeExpenses || []).map((x) => {
        const c = db.subCommittees.find(
          (y) => Number(y.id) === Number(x.subCommitteeId),
        );
        return {
          Date: new Date(x.date || x.createdAt).toLocaleString("en-IN"),
          SubCommittee: c?.name || "",
          Description: x.description || "",
          Amount: x.amount,
          Bill: x.billName || "",
          Remarks: x.remarks || "",
        };
      });
      exportCSV(data, "fcms-subcommittee-expenses.csv");
    } else if (type === "subcommitteeOverview") {
      const data = db.subCommittees.map((c) => {
        const collected = subCommitteeCollectionTotal(c.id, db), submitted = subCommitteeSubmittedTotal(c.id, db), received = subCommitteeAllocationTotal(c.id, db), spent = subCommitteeExpenseTotal(c.id, db);
        return { SubCommittee: c.name, Collected: collected, Submitted: submitted, RemainingToSubmit: Math.max(0, collected-submitted), ReceivedFromOffice: received, Spent: spent, RemainingAfterExpense: Math.max(0, received-spent) };
      });
      exportCSV(data, "fcms-subcommittee-overview.csv");
    }
  });
  renderSummary();
}
