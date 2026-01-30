(function () {
    const CONFIG = {
    STORAGE: "sc_pro_b_v2",
    HIGH_WITHDRAWAL: 50000,
    AUTO_TOLERANCE: 500,
    PERSIST: true,
  };
  // 🔑 PLATFORM BEHAVIOR FLAGS (DO NOT REMOVE EXISTING CONFIG)
  CONFIG.REQUIRE_APPROVAL_FOR_ALL_TX = true;
  CONFIG.ALLOW_NEGATIVE_BALANCE = true;
  CONFIG.START_ACCOUNT_NO = 1000;

  const ROLES = {
  MANAGER: "manager",
  TELLER: "teller",
  MARKETER: "marketer",
  CEO: "ceo"
};

function currentStaff() {
  const staff = state.staff.find(s => s.id === state.activeStaffId);
  if (!staff) return null;

  // 🔑 HARD DEFAULT (safety)
  staff.role = staff.role || ROLES.TELLER;

  return staff;
}
window.currentStaff = currentStaff;


  const $ = (s) => document.querySelector(s),
    $$ = (s) => document.querySelectorAll(s);
  const uid = (p = "id") => p + Math.random().toString(36).slice(2, 9);
  const fmt = (n) => "₦" + Number(n || 0).toLocaleString();
  async function sha(s) {
    try {
      const h = await crypto.subtle.digest(
        "SHA-256",
        new TextEncoder().encode(s)
      );
      return Array.from(new Uint8Array(h))
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");
    } catch (e) {
      let x = 0;
      for (let i = 0; i < s.length; i++) x = (x << 5) - x + s.charCodeAt(i);
      return (x >>> 0).toString(16);
    }
  }

  function getTxBadgeClass(type) {
    if (type === "credit") return "tx-credit";
    if (type === "withdraw") return "tx-withdraw";
    if (type === "adjust") return "tx-adjust";
    if (type.startsWith("reverse")) return "tx-reverse";
    return "tx-adjust";
  }

  let state = {
  staff: [],
  customers: [],
  approvals: [],
  audit: [],
  cod: [],
  codDrafts: {},
  accounts: { income: [], expense: [] },
  accountEntries: [],
  ui: { current: null }
};

window.state = state; // make global

state.accounts = state.accounts || {};
state.accounts.income = state.accounts.income || [];
state.accounts.expense = state.accounts.expense || [];

state.accountEntries = state.accountEntries || [];

state.ui = state.ui || {};
state.ui.dateFilter = state.ui.dateFilter || "all";

  function load() {
  try {
    const raw = localStorage.getItem(CONFIG?.STORAGE || "sc_pro_b_v2");
    if (!raw) return;

    const data = JSON.parse(raw);

    // Restore main collections safely
    state.staff = Array.isArray(data.staff) ? data.staff : [];
    state.customers = Array.isArray(data.customers) ? data.customers : [];
    state.approvals = Array.isArray(data.approvals) ? data.approvals : [];
    state.audit = Array.isArray(data.audit) ? data.audit : [];
    state.cod = Array.isArray(data.cod) ? data.cod : [];
    state.codDrafts = data.codDrafts || {};

    // ✅ ADD THESE LINES
    state.accounts = data.accounts || { income: [], expense: [] };
    state.accountEntries = Array.isArray(data.accountEntries) ? data.accountEntries : [];

    state.ui = data.ui || { current: null };

  } catch (e) {
    console.warn("Load failed, using fresh state", e);
  }
}

  state.ui = state.ui || {};
state.ui.dashboardMode = false; // ONLY dashboard flag now

function dashboardIsOpen() {
  return state.ui && state.ui.dashboardMode === true;
}
  const dashboardState = {
  filter: null,              // "approvals" | "risk" | null
  selectedApprovalId: null,
  highlightCustomerId: null
};

  function save() {
    if (!CONFIG.PERSIST) return;
    try {
      localStorage.setItem(CONFIG.STORAGE, JSON.stringify(state));
    } catch (e) {
      console.warn("save fail", e);
    }
  }
  
  // 🔑 ENSURE ACCOUNTS STATE EXISTS (REQUIRED FOR DASHBOARD)
state.accounts = state.accounts || {};
state.accounts.income = state.accounts.income || [];
state.accounts.expense = state.accounts.expense || [];
  if (!state.accountEntries) state.accountEntries = [];


  function seed() {
    state.staff = [
      { id: "t1", name: "Ada Teller", role: "teller" },
      { id: "m1", name: "Ben Marketer", role: "marketer" },
      { id: "v1", name: "Chi Vault", role: "vault" },
      { id: "mgr", name: "Dan Manager", role: "manager" },
      { id: "ceo", name: "Eno CEO", role: "ceo" },
    ];
    state.customers = [
      {
        id: "c1",
        name: "Udo Essien",
        phone: "0802000001",
        balance: 50000,
        frozen: false,
        empowerment: {
  outstanding: 0,
  history: []
},

        transactions: [
          {
            id: uid(),
            type: "credit",
            amount: 20000,
            date: "2025-02-01T09:22",
            desc: "Market contrib",
            actor: "m1",
          },
          {
            id: uid(),
            type: "withdraw",
            amount: 5000,
            date: "2025-02-03T11:40",
            desc: "Urgent",
            actor: "t1",
          },
        ],
      },
      {
        id: "c2",
        name: "Ngo Okon",
        phone: "0802000002",
        balance: 125000,
        frozen: false,
        empowerment: {
  outstanding: 0,
  history: []
},

        transactions: [
          {
            id: uid(),
            type: "credit",
            amount: 50000,
            date: "2025-02-02T10:01",
            desc: "Agent",
            actor: "m1",
          },
        ],
      },
      {
        id: "c3",
        name: "Imo Peters",
        phone: "0802000003",
        balance: 4800,
        frozen: false,
        empowerment: {
  outstanding: 0,
  history: []
},

        transactions: [
          {
            id: uid(),
            type: "credit",
            amount: 3000,
            date: "2025-02-04T13:11",
            desc: "POS",
            actor: "t1",
          },
        ],
      },
      {
        id: "c4",
        name: "Joseph Effiong",
        phone: "0802000004",
        balance: 70000,
        frozen: false,
        empowerment: {
  outstanding: 0,
  history: []
},

        transactions: [],
      },
      {
        id: "c5",
        name: "Mary Abraham",
        phone: "0802000005",
        balance: 90000,
        frozen: false,
        empowerment: {
  outstanding: 0,
  history: []
},

        transactions: [
          {
            id: uid(),
            type: "credit",
            amount: 30000,
            date: "2025-02-02T12:00",
            desc: "Agent",
            actor: "m1",
          },
        ],
      },
      {
        id: "c6",
        name: "Peter John",
        phone: "0802000006",
        balance: 15000,
        frozen: false,
        empowerment: {
  outstanding: 0,
  history: []
},

        transactions: [],
      },
      {
        id: "c7",
        name: "Grace N",
        phone: "0802000007",
        balance: 22000,
        frozen: false,
        empowerment: {
  outstanding: 0,
  history: []
},

        transactions: [],
      },
      {
        id: "c8",
        name: "Blessing O",
        phone: "0802000008",
        balance: 34000,
        frozen: false,
        empowerment: {
  outstanding: 0,
  history: []
},

        transactions: [],
      },
      {
        id: "c9",
        name: "Kunle A",
        phone: "0802000009",
        balance: 480000,
        frozen: false,
        empowerment: {
  outstanding: 0,
  history: []
},

        transactions: [
          {
            id: uid(),
            type: "credit",
            amount: 400000,
            date: "2025-02-01T09:22",
            desc: "Large collection",
            actor: "m1",
          },
        ],
      },
      {
        id: "c10",
        name: "Aisha S",
        phone: "0802000010",
        balance: 6000,
        frozen: false,
        empowerment: {
  outstanding: 0,
  history: []
},

        transactions: [],
      },
    ];
    state.approvals = [
      {
        id: uid("ap"),
        type: "withdraw",
        amount: 150000,
        customerId: "c9",
        requestedBy: "t1",
        requestedAt: new Date().toISOString(),
        status: "pending",
      },
    ];
    state.audit = [];
    state.cod = [];
    state.activeStaffId = state.staff[0].id;
    pushAudit("system", "system", "init", "seeded demo data");
    save();
  }

  state.accounts = state.accounts || {};
state.accounts.income = state.accounts.income || [];
state.accounts.expense = state.accounts.expense || [];

  async function pushAudit(actor, role, action, details) {
  const staff = currentStaff();
  const time = new Date().toISOString();
      const prev = state.audit.length
  ? state.audit[state.audit.length - 1].hash
  : "";
    const payload = JSON.stringify({
  time,
  actor,
  actorId: staff?.id || actor || null,
  role,
  action,
  details,
  prev,
});

    const h = await sha(payload);
    const entry = {
  id: uid("a"),
  time,
  actor,
  actorId: staff?.id || null,
  role,
  action,
  details,
  prev,
  hash: h,
};

    state.audit.push(entry);
    save();
    renderAudit();
    return entry;
  }

  async function verifyAudit() {
    const issues = [];
    for (let i = 0; i < state.audit.length; i++) {
      const e = state.audit[i];
      const expected = await sha(
        JSON.stringify({
          time: e.time,
          actor: e.actor,
          role: e.role,
          action: e.action,
          details: e.details,
          prev: e.prev,
        })
      );
      if (expected !== e.hash) issues.push({ i, problem: "hash_mismatch" });
      if (i > 0 && e.prev !== state.audit[i - 1].hash)
        issues.push({ i, problem: "prev_mismatch" });
    }
    return issues;
  }

  function setDateFilter(filter) {
 console.log("DATE FILTER:", filter); // TEMP TEST
 state.ui.dateFilter = filter;
 save();
 renderAccounts();
}

window.setDateFilter = setDateFilter;

function entryMatchesFilter(entryDate) {
  const filter = state.ui.dateFilter || "all";
  if (filter === "all") return true;

  const today = new Date();
  const d = new Date(entryDate);

  // TODAY
  if (filter === "today") {
    return d.toDateString() === today.toDateString();
  }

  // THIS WEEK (Monday → Today)
  if (filter === "week") {
    const firstDayOfWeek = new Date(today);
    const day = today.getDay(); // 0 (Sun) - 6 (Sat)
    const diff = today.getDate() - day + (day === 0 ? -6 : 1);
    firstDayOfWeek.setDate(diff);
    firstDayOfWeek.setHours(0,0,0,0);

    return d >= firstDayOfWeek && d <= today;
  }

  // THIS MONTH
  if (filter === "month") {
    return d.getMonth() === today.getMonth() &&
           d.getFullYear() === today.getFullYear();
  }

  return true;
}

  function nextAccountNumber(type) {
  const base = type === "income" ? 2000 : 3000;
  const list = state.accounts[type] || [];
  const num = base + list.length;
  return `${type === "income" ? "INC" : "EXP"}-${num}`;
}

function getEntriesByAccount(accountId) {
  return (state.accountEntries || []).filter(e => e.accountId === accountId);
}

function sumEntries(entries) {
  return entries.reduce((t, e) => t + Number(e.amount || 0), 0);
}

function sumByType(type) {
  return (state.accountEntries || [])
    .filter(e => e.type === type)
    .filter(e => entryMatchesFilter(e.date)) // 👈 ADD THIS
    .reduce((t, e) => t + Number(e.amount || 0), 0);
}

function sumByAccounts(accountIds) {
  return (state.accountEntries || [])
    .filter(e => accountIds.includes(e.accountId))
    .filter(e => entryMatchesFilter(e.date)) // 👈 ADD THIS
    .reduce((t, e) => t + Number(e.amount || 0), 0);
}


  function can(role, action) {
    const map = {
      teller: ["credit", "withdraw", "create_account", "cod"],
      marketer: ["credit", "create_account", "cod"],
      vault: ["vault_in", "vault_out", "cod", "adjust"],
      manager: ["approve", "view_all", "adjust", "reverse", "delete_tx"],
      ceo: [
        "approve",
        "view_all",
        "adjust",
        "reverse",
        "delete_tx",
        "delete_customer",
      ],
    };
    return map[role] && map[role].includes(action);
  }

  function renderStaff() {
  const sel = $("#staffSelect");
  sel.innerHTML = "";

  state.staff.forEach((s) => {
    const o = document.createElement("option");
    o.value = s.id;
    o.textContent = `${s.name} — ${s.role}`;
    sel.appendChild(o);
  });

  // 🔑 bind selection
  sel.onchange = () => {
    state.activeStaffId = sel.value;
    save();
  };

  // 🔑 default staff (first load)
  if (!state.activeStaffId && state.staff.length > 0) {
    state.activeStaffId = state.staff[0].id;
    sel.value = state.activeStaffId;
    save();
  }
  syncDashboardVisibility(); // ✅ REQUIRED
}


  function syncDashboardVisibility() {
  const btn = document.getElementById("btnDashboard");

  if (!btn) return;

  if (canViewDashboard()) {
    btn.style.display = "inline-block";
  } else {
    btn.style.display = "none";
   
  }
}


function confirmApproval(approval, action) {
  const cust = state.customers.find(c => c.id === approval.customerId);

  openModalGeneric(
    action === "approved" ? "Approve Withdrawal" : "Reject Withdrawal",
    `
      <div class="small"><strong>Customer:</strong> ${cust?.name || approval.customerId}</div>
      <div class="small"><strong>Amount:</strong> ₦${Number(approval.amount).toLocaleString()}</div>
      <div class="small"><strong>Requested by:</strong> ${approval.requestedBy}</div>
      <div class="small" style="margin-top:8px">
        Are you sure you want to <strong>${action}</strong> this withdrawal?
      </div>
    `,
    action === "approved" ? "Approve" : "Reject"
  ).then(ok => {
    if (ok) handleApprovalAction(approval.id, action);
  });
}

function computeTodayStaffTotals(staffId) {
  const _today = new Date().toISOString().slice(0, 10);

  let receipts = 0;
  let payments = 0;
  let empowerment = 0;

  for (const c of state.customers) {
    for (const t of c.transactions || []) {
      const tDate = (t.date || "").slice(0, 10);
      if (t.actor !== staffId) continue;
      if (tDate !== _today) continue;

      if (t.type === "credit" || t.type === "adjust") {
        receipts += Number(t.amount || 0);
      }

      if (t.type === "withdraw") {
        payments += Number(t.amount || 0);
      }

      if (t.type === "empowerment") {
        empowerment += Number(t.amount || 0);
      }
    }
  }

  return {
    receipts,
    payments,
    empowerment, // visual only
  };
}

function createAccount(type, name) {
  const staff = currentStaff();
  if (!staff || !["manager", "ceo"].includes(staff.role)) {
    showToast("Not authorized");
    return;
  }

  if (!name || !name.trim()) {
    showToast("Account name required");
    return;
  }

  const acc = {
    id: uid("acc"),
    category: type, // "income" | "expense"
    name: name.trim(),
    accountNumber: nextAccountNumber(type),
    createdBy: staff.name,
    createdAt: new Date().toISOString(),
    archived: false
  };

  state.accounts[type].push(acc);
  save();
  renderAccounts();

  showToast(`${type.toUpperCase()} account created`);
}

function createAccountEntry(accountId, type, amount, note, date) {
  const staff = currentStaff();
  if (!staff || !["manager", "ceo"].includes(staff.role)) {
    showToast("Not authorized");
    return;
  }

  // ✅ REQUIRED GUARD (ONLY PLACE IT EXISTS)
  if (!state.accountEntries) state.accountEntries = [];

  amount = Number(amount);
  if (!amount || amount <= 0) {
    showToast("Invalid amount");
    return;
  }

  const entry = {
    id: uid("txn"),
    accountId,
    type, // "income" | "expense"
    amount,
    note: note?.trim() || "",
    date,
    createdBy: staff.name,
    createdAt: new Date().toISOString()
  };

 state.accountEntries.push(entry);
save();
renderAccounts(); // 🔥 THIS LINE ADDED
showToast(`${type.toUpperCase()} entry recorded`);
}


function closeModal() {
  const modal = document.getElementById("accountEntryModal");
  if (modal) modal.style.display = "none";

  // Clear inputs
  const amt = document.getElementById("entryAmount");
  const note = document.getElementById("entryNote");
  if (amt) amt.value = "";
  if (note) note.value = "";
}

window.closeModal = closeModal;



function openAccountEntryModal(accountId, type)  {
  const acc = state.accounts[type].find(a => a.id === accountId);
  if (!acc) return;

  const box = document.createElement("div");

  box.innerHTML = `
  <div class="small"><b>${acc.accountNumber} — ${acc.name}</b></div>

  <div style="margin-top:10px">
    <input id="entryAmount" class="input" type="number" placeholder="Amount">
  </div>

  <div style="margin-top:6px">
    <input id="entryNote" class="input" placeholder="Note (optional)">
  </div>

  <div style="margin-top:10px">
    <button class="btn primary"
      onclick="saveAccountEntry('${accountId}', '${type}')">
      Save Entry
    </button>
  </div>
`;

  openModalGeneric("Add Account Entry", box, null);
  }

window.openAccountEntryModal = openAccountEntryModal;

function saveAccountEntry(accountId, type) {
  const amount = document.getElementById("entryAmount").value;
  const note = document.getElementById("entryNote").value;
  const date = new Date().toISOString().slice(0,10);

  createAccountEntry(accountId, type, amount, note, date);

  closeModal();
}

window.saveAccountEntry = saveAccountEntry;



function promptCreateAccount(type) {
  const name = prompt(
    `Enter ${type.toUpperCase()} account name`
  );
  if (name !== null) {
    createAccount(type, name);
  }
}
window.promptCreateAccount = promptCreateAccount;

function getCODDraft(staffId, date) {
  if (!state.codDrafts) state.codDrafts = {};
  return state.codDrafts[`${staffId}|${date}`] || null;
}


function openMyCOD() {
  const staff = currentStaff();
  if (!staff) return;

  let selectedDate = new Date().toISOString().slice(0, 10);

  function getRecords(date) {
    return (state.cod || [])
      .filter(c =>
        c.staffId === staff.id &&
        (!date || c.date === date)
      )
      .sort((a, b) => new Date(b.date) - new Date(a.date));
  }
  
  const box = document.createElement("div");

  const header = document.createElement("div");
  header.innerHTML = `
    <div class="small" style="margin-bottom:8px">
      View Close of Day for:
      <input type="date" id="myCODDate" class="input" value="${selectedDate}">
    </div>
  `;
  box.appendChild(header);

  const list = document.createElement("div");
  box.appendChild(list);

  function renderList(date) {
  const records = getRecords(date);

  if (!records.length) {
    list.innerHTML = `<div class="small muted">No records for this date</div>`;
    return;
  }

  list.innerHTML = records.map(rec => {
    const expected = Number(rec.systemExpected || 0);
    const initial = Number(rec.initialDeclared || 0);
    const declared = Number(rec.staffDeclared || 0);
    const variance = Number(rec.variance || 0);

    return `
      <div class="card" style="margin-bottom:10px">
        <div class="small"><b>Date:</b> ${rec.date}</div>

        <div class="small" style="margin-top:6px">
          <b>System Expected:</b> ${fmt(expected)}<br/>
          <b>Initial Declared:</b> ${fmt(initial)}<br/>
          <b>Final Declared:</b> ${fmt(declared)}<br/>
          <b>Variance:</b>
          <span style="color:${variance === 0 ? "green" : "red"}">
            ${fmt(variance)}
          </span>
        </div>

        ${rec.staffNote ? `
          <div class="small muted" style="margin-top:6px">
            Staff note: ${rec.staffNote}
          </div>
        ` : ""}

        ${rec.status === "resolved" ? `
  <div class="small success" style="margin-top:6px">
    <b>Resolved Amount:</b> ${fmt(rec.resolvedAmount)}
  </div>
  <div class="small muted">
    🧾 Resolution Note: ${rec.resolutionNote || "—"}
  </div>
` : rec.managerNote ? `
  <div class="small warning" style="margin-top:6px">
    ⚠ Manager Note: ${rec.managerNote}
  </div>
` : ""}
      </div>
    `;
  }).join("");
}

  renderList(selectedDate);

  header.querySelector("#myCODDate").onchange = (e) => {
    selectedDate = e.target.value;
    renderList(selectedDate);
  };

  openModalGeneric("My Close of Day", box, "Close");
}

window.openMyCOD = openMyCOD;



async function openCloseDayModal() {
  const staff = currentStaff();
  if (!staff) return showToast("Select staff");
  

  const today = new Date().toISOString().slice(0, 10);
  let selectedDate = today;
  if (!state.codDrafts) state.codDrafts = {};

const resumeDraftKey = `${staff.id}|${today}`;
const resumeDraft = state.codDrafts[resumeDraftKey] || null;

    const back = document.getElementById("txModalBack");
  if (!back) return;

  const box = document.createElement("div");
// ===== ALWAYS RENDER PHASE A UI =====
  box.innerHTML = `
    <div class="small"><b>Staff:</b> ${staff.name}</div>

    <div style="margin-top:6px">
      <label class="small">Close of Day for:</label>
      <input
        type="date"
        id="codDate"
        class="input"
        value="${today}"
        max="${today}"
      />
    </div>

    <input
      id="declaredCash"
      class="input"
      placeholder="Enter total cash collected"
      style="margin-top:10px"
    />

    <div id="codError" class="small danger" style="margin-top:8px;display:none"></div>
  `;
  // 🔒 IF DRAFT EXISTS → LOCK PHASE A & RESUME PHASE B
if (resumeDraft) {
  const dateInput = box.querySelector("#codDate");
  const declaredInput = box.querySelector("#declaredCash");

  if (dateInput) {
    dateInput.value = resumeDraft.date;
    dateInput.disabled = true;
  }

  if (declaredInput) {
    declaredInput.value = resumeDraft.initialDeclared;
    declaredInput.disabled = true;
  }
}


  const modal = document.getElementById("txModal");
document.getElementById("txTitle").textContent = "Close of Day";
document.getElementById("txBody").innerHTML = "";
document.getElementById("txBody").appendChild(box);

modal.querySelectorAll(".tx-ok").forEach(b => b.remove());

const submitBtn = document.createElement("button");
submitBtn.className = "btn tx-ok";
submitBtn.textContent = "Continue";
modal.querySelector(".modal-actions").appendChild(submitBtn);

// 🔁 RESET BUTTON STATE
submitBtn.onclick = null;
submitBtn.disabled = false;
submitBtn.dataset.submitted = "0";

back.style.display = "flex";
 
  // ===== FIRST CLICK ONLY =====
submitBtn.onclick = () => {
  selectedDate = box.querySelector("#codDate")?.value || today;

  if (!state.codDrafts) state.codDrafts = {};

  const draftKey = `${staff.id}|${selectedDate}`;

  // 🚫 HARD BLOCK — already submitted
  const alreadySubmitted = (state.cod || []).some(
    c => c.staffId === staff.id && c.date === selectedDate
  );

  const hasDraft = state.codDrafts[draftKey];

  if (alreadySubmitted) {
    showToast("Close of Day already submitted for this date");
    return;
  }

  // 🔑 allow restart if draft exists but final COD was cleared
  if (hasDraft && !alreadySubmitted) {
    delete state.codDrafts[draftKey];
    save();
  }

  // 🔑 RESUME PHASE B IF DRAFT EXISTS
  const existingDraft = state.codDrafts[draftKey];
  if (existingDraft) {
    renderPhaseB({
      box,
      submitBtn,
      staff,
      selectedDate,
      initialDeclared: existingDraft.initialDeclared
    });
    return;
  }

  // 🟢 PHASE A — FIRST & ONLY DECLARATION
  const initialDeclared = Number(
    box.querySelector("#declaredCash")?.value || 0
  );

  const err = box.querySelector("#codError");
  if (initialDeclared <= 0) {
    if (err) {
      err.textContent = "Enter a valid collected cash amount";
      err.style.display = "block";
    }
    return;
  }

  // 🔒 LOCK PHASE A
  state.codDrafts[draftKey] = {
    staffId: staff.id,
    date: selectedDate,
    initialDeclared,
    startedAt: new Date().toISOString()
  };

  // 🔒 DISABLE PHASE A INPUTS
  box.querySelector("#codDate")?.setAttribute("disabled", true);
  box.querySelector("#declaredCash")?.setAttribute("disabled", true);

  save();

  // ➜ MOVE TO PHASE B
  renderPhaseB({
    box,
    submitBtn,
    staff,
    selectedDate,
    initialDeclared
  });
}
 }

function renderPhaseB({
  box,
  submitBtn,
  staff,
  selectedDate,
  initialDeclared
}) {
  const txs = (state.approvals || []).filter(a =>
  a.requestedBy === staff.id &&
  a.requestedAt?.startsWith(selectedDate)
);

const credits = txs
 .filter(t => t.type === "credit")
 .reduce((s, t) => s + Number(t.amount || 0), 0);

const withdrawals = txs
 .filter(t => t.type === "withdraw")
 .reduce((s, t) => s + Number(t.amount || 0), 0);

const empowerments = txs
 .filter(t => t.type === "empowerment")
 .reduce((s, t) => s + Number(t.amount || 0), 0);

// ✅ LOCKED LOGIC
const expectedCash = credits;

  // ===== PHASE B UI =====
  box.innerHTML = `
    <div class="small"><b>Staff:</b> ${staff.name}</div>
    <div class="small"><b>Date:</b> ${selectedDate}</div>

    <div class="card" style="margin-top:10px">
      <div class="small">System Credits: ${fmt(credits)}</div>
      <div class="small">Withdrawals (info): ${fmt(withdrawals)}</div>
      <div class="small">Empowerments (info): ${fmt(empowerments)}</div>
      <div class="small"><b>Expected Cash:</b> ${fmt(expectedCash)}</div>
    </div>

    <input
      id="finalDeclared"
      class="input"
      value="${initialDeclared}"
      placeholder="Adjust declared cash if needed"
      style="margin-top:8px"
    />

    <textarea
      id="codNote"
      class="input"
      placeholder="Explain variance (required if mismatch)"
      style="margin-top:10px;display:none"
    ></textarea>

    <div id="finalErr" class="small danger" style="margin-top:8px;display:none"></div>
  `;
  

  submitBtn.textContent = "Submit";

  const finalDeclaredInput = box.querySelector("#finalDeclared");
  const noteBox = box.querySelector("#codNote");
  const finalErr = box.querySelector("#finalErr");

  // 🔁 Variance indicator
  const indicator = document.createElement("div");
  indicator.className = "small";
  indicator.style.marginTop = "6px";
  box.insertBefore(indicator, noteBox);

  function recalcVariance() {
    const v = Number(finalDeclaredInput.value || 0) - expectedCash;

    if (v === 0) {
      indicator.textContent = "Balanced ✔";
      indicator.style.color = "green";
      noteBox.style.display = "none";
    } else if (v > 0) {
      indicator.textContent = `Excess ${fmt(v)}`;
      indicator.style.color = "orange";
      noteBox.style.display = "block";
    } else {
      indicator.textContent = `Shortage ${fmt(Math.abs(v))}`;
      indicator.style.color = "red";
      noteBox.style.display = "block";
    }
  }

  finalDeclaredInput.oninput = recalcVariance;
  recalcVariance();

  // ===== FINAL SUBMIT =====
  submitBtn.onclick = () => {
    const finalDeclared = Number(finalDeclaredInput.value || 0);
    const variance = finalDeclared - expectedCash;

    finalErr.style.display = "none";

    if (variance !== 0 && !noteBox.value.trim()) {
      finalErr.textContent = "Explanation is required for variance";
      finalErr.style.display = "block";
      submitBtn.disabled = false;
      return;
    }
    submitBtn.disabled = true;
 

    if (!state.cod) state.cod = [];

    const submittedLate = selectedDate !== new Date().toISOString().slice(0, 10);
    const draftKey = `${staff.id}|${selectedDate}`;
     
  if (!Array.isArray(state.cod)) {
  state.cod = [];
}
  state.cod.push({
  id: uid("cod"),

  staffId: staff.id,
  staffName: staff.name,
  role: staff.role,
  date: selectedDate,

  submittedLate,

  // 🔒 SNAPSHOT (SOURCE OF TRUTH)
  snapshot: {
    credits: Number(credits || 0),
    withdrawals: Number(withdrawals || 0),
    empowerments: Number(empowerments || 0),
  },

  // 🔑 SYSTEM VALUES (LOCKED)
  systemExpected: expectedCash,
  staffDeclared: finalDeclared,
  variance,

  // 🔎 STAFF CONTEXT
  initialDeclared,
  staffNote: noteBox.value || "",

  // 🔎 MANAGER RESOLUTION
  status: variance === 0 ? "balanced" : "flagged",
  resolvedAmount: null,
  resolutionNote: "",
  resolvedBy: null,
  resolvedAt: null,

  createdAt: new Date().toISOString()
});



    pushAudit(
      staff.name,
      staff.role,
      "close_day",
      JSON.stringify({
        initialDeclared,
        finalDeclared,
        expectedCash,
        variance,
        note: noteBox.value || ""
      })
    );

    delete state.codDrafts?.[draftKey];
    save();

    const back = document.getElementById("txModalBack");
back.style.display = "none";

// 🔑 RESET FOR NEXT OPEN
submitBtn.onclick = null;
submitBtn.disabled = false;
submitBtn.dataset.submitted = "0";
back.onclick = null; // 🔑 release modal capture
    showToast("Close of Day submitted");
  };
}

function openCODResolutionModal(codId) {
  console.log("STEP 3: openCODResolutionModal ENTERED", codId);

  if (!isManager()) {
    showToast("Only managers can resolve COD");
    return;
  }

  // 🔑 FETCH REAL RECORD FROM STATE
  const cod = state.cod.find(c => c.id === codId);
  if (!cod) {
    showToast("COD record not found");
    console.error("COD not found in state:", codId, state.cod);
    return;
  }

  const back = document.getElementById("txModalBack");
const modal = document.getElementById("txModal");
const body = document.getElementById("txBody");
const title = document.getElementById("txTitle");

console.log("MODAL BACK FOUND?", back);

  title.textContent = "Resolve Close of Day Variance";

  body.innerHTML = `
    <div class="small">
      <b>Staff:</b> ${cod.staffName}<br/>
      <b>Date:</b> ${cod.date}
    </div>

    <div class="card" style="margin-top:10px">
      <div class="small">System Expected: ${fmt(cod.systemExpected)}</div>
      <div class="small">Staff Declared: ${fmt(cod.staffDeclared)}</div>
      <div class="small danger">Variance: ${fmt(cod.variance)}</div>
    </div>

    <input
      id="resolvedAmount"
      class="input"
      style="margin-top:10px"
      value="${cod.systemExpected}"
      placeholder="Final accepted cash amount"
    />

    <textarea
      id="resolutionNote"
      class="input"
      placeholder="Resolution note (required)"
      style="margin-top:8px"
    ></textarea>
  `;

  modal.querySelectorAll(".tx-ok").forEach(b => b.remove());

  const btn = document.createElement("button");
  btn.className = "btn success tx-ok";
  btn.textContent = "Resolve COD";

  btn.onclick = () => {
    const resolvedAmount = Number(
      document.getElementById("resolvedAmount").value
    );
    const note = document.getElementById("resolutionNote").value.trim();

    if (!note) {
      showToast("Resolution note is required");
      return;
    }

    // 🔑 UPDATE REAL RECORD
    cod.resolvedAmount = resolvedAmount;
    cod.resolutionNote = note;
    cod.resolvedBy = currentStaff().name;
    cod.resolvedAt = new Date().toISOString();
    cod.status = "resolved";
    cod.variance = resolvedAmount - cod.systemExpected;

    save();

    renderCODForDate(window.activeCODDate);
    renderManagerCODSummary(window.activeCODDate);

    document.getElementById("txModalBack").style.display = "none";
showToast("COD resolved");
  };

  modal.querySelector(".modal-actions").appendChild(btn);

// 🔑 SHOW MODAL (THIS WAS MISSING)
back.style.display = "flex";
}
window.openCODResolutionModal = openCODResolutionModal;

function renderApprovals() {
     const el = document.getElementById("approvals");
  if (!el) return;

  const staff = currentStaff();
  const isApprover = staff && canApprove(); // manager or CEO

  const pending = state.approvals
    .filter(a => a.status === "pending")
    .sort((a, b) => new Date(b.requestedAt) - new Date(a.requestedAt));

  if (pending.length === 0) {
    el.innerHTML = `<div class="small muted">No pending approvals</div>`;
    return;
  }

  let html = "";

  pending.forEach(a => {
    const cust = state.customers.find(c => c.id === a.customerId);

    html += `
      <div class="approval-item card" style="margin-bottom:10px">
        <div style="display:flex;justify-content:space-between;align-items:flex-start">
          <div>
            <div style="font-weight:700">
              ${a.type.toUpperCase()} — ${fmt(a.amount)}
            </div>

            <div class="small">
              Customer: <b>${cust ? cust.name : "Unknown"}</b>
            </div>

            <div class="small">
              Requested by: <b>${a.requestedByName || a.requestedBy}</b>
            </div>

            <div class="small muted">
              Requested at: ${new Date(a.requestedAt).toLocaleString()}
            </div>
          </div>

          ${
            isApprover
              ? `
                <div style="display:flex;gap:6px">
                  <button
                    class="btn"
                    onclick="processApproval('${a.id}', 'approve')">
                    Approve
                  </button>

                  <button
                    class="btn ghost danger"
                    onclick="processApproval('${a.id}', 'reject')">
                    Reject
                  </button>
                </div>
              `
              : `
                <div class="small muted" style="margin-top:4px">
                  ⏳ Awaiting manager review
                </div>
              `
          }
        </div>
      </div>
    `;
  });

  el.innerHTML = html;
}

  function renderCustomers() {
         // =========================
  // EXISTING CUSTOMER LOGIC
  // =========================
  const list = $("#custList");
  list.innerHTML = "";
  const q = $("#search").value.toLowerCase();
  let arr = state.customers.slice();

  if ($("#sort").value === "balDesc")
    arr.sort((a, b) => b.balance - a.balance);
  else arr.sort((a, b) => a.name.localeCompare(b.name));

  arr = arr.filter(
    (c) =>
      !q || c.name.toLowerCase().includes(q) || (c.phone || "").includes(q)
  );

  arr.forEach((c) => {
    const r = document.createElement("div");
    r.className = "citem";

if (c.balance < 0) {
  r.style.background = "#fdecea";
  r.style.border = "1px solid #f5c2c7";
}


    const nameBtn = document.createElement("button");
    nameBtn.className = "input";
    nameBtn.style.background = "transparent";
    nameBtn.style.border = "0";
    nameBtn.style.padding = "0";
    nameBtn.style.fontWeight = "700";
    nameBtn.style.cursor = "pointer";
   nameBtn.innerHTML = `
  ${c.name}
  ${
    c.balance < 0
      ? `<span class="badge danger" style="margin-left:6px">
           NEGATIVE ${fmt(Math.abs(c.balance))}
         </span>`
      : ""
  }
  ${
    c.empowerment &&
    c.empowerment.active &&
    c.empowerment.balance < 0
      ? `<span class="badge" style="
           margin-left:6px;
           background:#fff3cd;
           color:#7a5c00
         ">
           EMPOWERMENT ${fmt(Math.abs(c.empowerment.balance))}
         </span>`
      : ""
  }
`;


    nameBtn.onclick = () => openCustomerModal(c.id);

    const left = document.createElement("div");
    const meta = document.createElement("div");
    meta.className = "small";
    meta.textContent = `${c.phone} • ${fmt(c.balance)}`;

    left.appendChild(nameBtn);
    left.appendChild(meta);
    r.appendChild(left);

    const actions = document.createElement("div");
    const view = document.createElement("button");
    view.className = "btn";
    view.textContent = "View";
    view.onclick = () => openCustomerModal(c.id);

    const tx = document.createElement("button");
    tx.className = "input";
    tx.textContent = "Tx";
    tx.onclick = () => {
      $("#custSel").value = c.id;
      showToast("Selected " + c.name);
    };

    actions.appendChild(view);
    actions.appendChild(tx);
    r.appendChild(actions);
    list.appendChild(r);
  });

  $("#custSel").innerHTML = "";
  state.customers.forEach((c) => {
    const o = document.createElement("option");
    o.value = c.id;
    o.textContent = `${c.name} • ${fmt(c.balance)}`;
    $("#custSel").appendChild(o);
  });

  $("#custCount").textContent = state.customers.length;
  $("#totalBal").textContent = fmt(
    state.customers.reduce((s, c) => s + c.balance, 0)
  );

  $("#mobileBal").textContent = state.customers[0]
    ? fmt(state.customers[0].balance)
    : fmt(0);
}

function showDashboard() {
  state.ui.dashboardMode = true;

  const dash = document.getElementById("dashboardView");
  const app = document.getElementById("app");

  if (dash) dash.style.display = "block";
  if (app) app.style.display = "none";

  renderDashboard();
}

function hideDashboard() {
  state.ui.dashboardMode = false;

  const dash = document.getElementById("dashboardView");
  const app = document.getElementById("app");

  if (dash) dash.style.display = "none";
  if (app) app.style.display = "grid";
}


function renderAttentionRequired() {

  const grid = document.getElementById("attentionGrid");

  if (!grid) return;



  const frozen = state.customers.filter(c => c.frozen).length;



  const _today = new Date().toISOString().slice(0, 10);

  let largeWithdrawals = 0;



  state.customers.forEach(c => {

    (c.transactions || []).forEach(t => {

      if (

        t.type === "withdraw" &&

        t.amount >= 50000 &&

        t.date?.startsWith(_today)

      ) {

        largeWithdrawals++;

      }

    });

  });



  grid.innerHTML = `
  <div class="dash-card">
    <div class="small">Large Withdrawals Today</div>
    <h3>${largeWithdrawals}</h3>
  </div>

  <div class="dash-card">
    <div class="small">Frozen Accounts</div>
    <h3>${frozen}</h3>
  </div>
`;

}

function wireDashboardClicks() {
  const pending = document.getElementById("att-pending");
  const large = document.getElementById("att-large");
  const frozen = document.getElementById("att-frozen");

  if (large) {
    large.onclick = () => showToast("Large withdrawals filter coming next");
  }

  if (frozen) {
    frozen.onclick = () => showToast("Frozen account filter coming next");
  }
}

function renderDashboardKPIs() {
  const box = document.getElementById("dashboardKPIs");
  if (!box) return;

  const pendingCount = (state.approvals || []).filter(
    a => a.status === "pending"
  ).length;

  const totalCustomers = state.customers.length;
  const totalBalance = state.customers.reduce((s, c) => s + c.balance, 0);

  const _today = new Date().toISOString().slice(0, 10);
  let inflow = 0;
  let outflow = 0;

  state.customers.forEach(c => {
    (c.transactions || []).forEach(t => {
      if (t.date?.startsWith(_today)) {
        if (t.type === "credit") inflow += t.amount;
        if (t.type === "withdraw") outflow += t.amount;
      }
    });
  });

  box.innerHTML = `
    <div class="dash-card">
      <div class="small">Customers</div>
      <h3>${totalCustomers}</h3>
    </div>

    <div class="dash-card">
      <div class="small">Funds Under Management</div>
      <h3>${fmt(totalBalance)}</h3>
    </div>

    <div class="dash-card clickable" data-kpi="approvals">
    
      <div class="small">Approvals Pending</div>
      <h3>${pendingCount}</h3>
    </div>

    <div class="dash-card">
      <div class="small">Today Inflow</div>
      <h3>${fmt(inflow)}</h3>
    </div>

    <div class="dash-card">
      <div class="small">Today Outflow</div>
      <h3>${fmt(outflow)}</h3>
    </div>
  `;

  const ap = box.querySelector('[data-kpi="approvals"]');
if (ap) {
  ap.onclick = scrollToApprovals;
}
}


function scrollToApprovals() {
  const layout = document.getElementById("layoutRoot");
  if (!layout) return;

  const dashboardVisible =
    document.getElementById("dashboardView")?.style.display !== "none";

  const target = dashboardVisible
    ? document.getElementById("dashboardApprovals")
    : document.getElementById("approvalsCard");

  if (!target) return;

  const top =
    target.getBoundingClientRect().top -
    layout.getBoundingClientRect().top +
    layout.scrollTop -
    20;

  layout.scrollTo({
    top,
    behavior: "smooth"
  });
}

function openApproval(customerId, approvalId) {
  activeCustomerId = customerId;

  // Open customer modal
  openCustomerModal(customerId);

  // Store approval being reviewed
  window.activeApprovalId = approvalId;

  // Switch directly to tools tab
  setActiveTab("tools");
}

function handleApprovalAction(id, action) {
  const approval = state.approvals.find(a => a.id === id);
  if (!approval) return;

  approval.status = action === "approve" ? "approved" : "rejected";
approval.processedAt = new Date().toISOString();
  approval.resolvedBy = currentStaff().id;
  approval.resolvedAt = new Date().toISOString();

    // Audit log
  state.audit.unshift({
    id: crypto.randomUUID(),
    actor: currentStaff().name,
    role: currentStaff().role,
    action: `approval_${action}`,
    date: approval.resolvedAt
  });

  save();

  // 🔁 FORCE FULL UI REFRESH
  renderApprovals();
  renderAudit();
  buildChart();
  updateChartData();
  renderDashboard();
  renderDashboard();
  bindCODButtons();

}



// ================================
// EMPOWERMENT MODEL SAFETY
// ================================
function ensureEmpowermentModel(c) {
  if (!c.empowerment) {
    c.empowerment = {
      active: false,
      principal: 0,
      balance: 0,
      interestRate: 0.1, // 10% default (can change later)
      tenureMonths: 6,
      startDate: null,
      monthlyDue: 0,
      status: "inactive",
      history: []
    };
  }
}

function calculateEmpowermentSchedule(c) {
  const e = c.empowerment;
  const interest = e.principal * e.interestRate;
  const totalPayable = e.principal + interest;

  e.monthlyDue = Math.ceil(totalPayable / e.tenureMonths);
}

function initEmpowermentModel(c, config = {}) {
  if (!c.empowerment) {
    c.empowerment = {
      active: false,
      principal: 0,
      balance: 0,
      tenureMonths: 0,
      interestRate: 0,
      monthlyDue: 0,
      status: "none",
      history: []
    };
  }

  // Apply config only if provided
  if (config.tenureMonths) c.empowerment.tenureMonths = config.tenureMonths;
  if (config.interestRate !== undefined) c.empowerment.interestRate = config.interestRate;

  // Recalculate monthly due safely
  if (c.empowerment.tenureMonths > 0) {
    const interest =
      c.empowerment.principal * (c.empowerment.interestRate || 0);
    const totalPayable = c.empowerment.principal + interest;

    c.empowerment.monthlyDue =
      Math.ceil(totalPayable / c.empowerment.tenureMonths);
  }
}

function applyEmpowermentRepayment(c, amount) {
  if (!c.empowerment || !c.empowerment.active) return amount;

  const repay = Math.min(amount, c.empowerment.balance);
  c.empowerment.balance -= repay;

  // 🔑 log repayment
  c.empowerment.history.push({
    type: "repayment",
    amount: repay,
    date: Date.now()
  });

  // ✅ FULLY PAID
  if (c.empowerment.balance === 0) {
    c.empowerment.active = false;
    c.empowerment.status = "completed";

    c.empowerment.history.push({
      type: "completed",
      principal: c.empowerment.principal,
      date: Date.now()
    });
  }

  return amount - repay;
}
function reject(id) {
  const a = state.approvals.find(x => x.id === id);
  if (!a) return;

  openModalGeneric(
    "Reject Approval",
    "<div class='small'>Reject this request?</div>",
    "Reject"
  ).then(ok => {
    if (!ok) return;

    a.status = "rejected";
    a.rejectedBy = currentStaff().name;
    a.dateRejected = Date.now();

    save();
    renderApprovals();
  });
}


  function renderAudit() {
      const staff = currentStaff();
  const el = document.getElementById("audit");
  if (!el) return;

  // Manager / CEO see everything, others see own
  const visibleAudits = isManager()
    ? state.audit
    : state.audit.filter(a => a.actorId === staff.id);

  el.innerHTML = "";

  visibleAudits
    .slice()
    .reverse()
    .forEach(a => {
      const row = document.createElement("div");
      row.style.padding = "8px";
      row.style.borderBottom = "1px solid rgba(11,27,43,0.06)";

      let detail = "";
      const details =
        typeof a.details === "object" && a.details !== null
          ? a.details
          : null;

      // ✅ TRANSACTION SUBMITTED (TELLER)
      if (a.action === "tx_sent_for_approval" && details) {
        detail = `
          <div style="font-size:13px">
            <b>Sent for approval</b><br/>
            ${(details.txType || "").toUpperCase()} — ${fmt(details.amount)}<br/>
            Customer: <b>${details.customerName || "Unknown"}</b>
          </div>
        `;
      }

      // ✅ APPROVAL / REJECTION (MANAGER / CEO)
      else if (a.action?.startsWith("approval_") && details) {
        detail = `
          <div style="font-size:13px">
            <b>${(details.decision || "").toUpperCase()}</b><br/>
            ${(details.txType || "").toUpperCase()} — ${fmt(details.amount)}<br/>
            Customer: <b>${details.customerName || "Unknown"}</b>
          </div>
        `;
      }

      // ✅ CLOSE OF DAY
      else if (a.action === "close_day" && details) {
        detail = `
          <div style="font-size:13px">
            <b>Close of Day</b><br/>
            Expected: ${fmt(details.expectedCash)}<br/>
            Declared: ${fmt(details.finalDeclared)}<br/>
            Variance: ${fmt(details.variance)}
          </div>
        `;
      }

      // 🔁 Fallback (never crash)
      else {
        detail = `<div style="font-size:13px">${a.action}</div>`;
      }

      row.innerHTML = `
        <div class="small">
          ${new Date(a.time).toLocaleString()}
          • ${a.actor || "System"}
          • ${a.role || "system"}
        </div>
        ${detail}
      `;

      el.appendChild(row);
    });
}

function formatAuditMessage(a) {
  const d = a.details || {};

  if (a.action === "approval") {
    return `
      ${d.decision === "approve" ? "Approved" : "Rejected"}
      ₦${Number(d.amount || 0).toLocaleString()}
      for <b>${d.customerName || "Unknown customer"}</b>
    `;
  }

  if (a.action === "transaction") {
    return `
      ${d.txType.toUpperCase()}
      ₦${Number(d.amount || 0).toLocaleString()}
      for <b>${d.customerName || "Unknown customer"}</b>
    `;
  }

  return a.action;
}


// ---- DEBUG MARK ----
  const modalBack = $("#modalBack"),
  modal = $("#modal"),
  mTitle = $("#mTitle"),
  mMeta = $("#mMeta"),
  mBody = $("#mBody"),
  txModalBack = document.getElementById("txModalBack");
    // ---- Customer Modal Close Logic ----
    // ✅ Customer modal click-away (SAFE)
modalBack.onclick = (e) => {
  if (e.target === modalBack) {
    closeCustomerModal();
  }
};

// Close button inside customer modal
document.getElementById("mCancel").onclick = () => {
  closeCustomerModal();
};

 let activeCustomerId = null;
 window.forceModalTab = null;





function openCustomerModal(id) {
  document.getElementById("custList").style.display = "block";

  const c = state.customers.find(x => x.id === id);
  if (!c) return;

  activeCustomerId = id;
  mTitle.textContent = c.name;
  mMeta.textContent = `ID: ${c.id}` + (c.frozen ? " • Frozen" : "");

  modalBack.style.display = "flex";
  document.getElementById("txCancel").onclick = () => {
  back.style.display = "none";
};

  // 🔑 SINGLE SOURCE OF TRUTH FOR TAB SELECTION (EDGE SAFE)
  const tab = window.forceModalTab || "profile";
  window.forceModalTab = null;

  setTimeout(() => {
    setActiveTab(tab);
  }, 0);
}


  function renderCustomerTimeline(cust) {
    const events = [];

    // --- Account Creation Event ---
    events.push({
      type: "create",
      title: "Account Created",
      desc: `${cust.name} was added to SmartContribution system.`,
      date: cust.createdAt || cust.dateCreated || Date.now(),
    });

    // --- Freeze / Unfreeze Events ---
    if (cust.freezeHistory && cust.freezeHistory.length) {
      cust.freezeHistory.forEach((entry) => {
        events.push({
          type: entry.frozen ? "freeze" : "unfreeze",
          title: entry.frozen ? "Account Frozen" : "Account Unfrozen",
          desc: `Action performed by ${entry.actor}.`,
          date: entry.date,
        });
      });
    }

    // --- Transaction Events ---
    if (cust.transactions && cust.transactions.length) {
      cust.transactions.forEach((t) => {
        events.push({
          type: t.type.startsWith("reverse") ? "reverse" : t.type,
          title:
            t.type === "credit"
              ? "Credit Posted"
              : t.type === "withdraw"
              ? "Withdrawal Posted"
              : t.type.startsWith("reverse")
              ? "Reversal Applied"
              : "Balance Adjustment",
          desc: `₦${Number(t.amount).toLocaleString()} — ${t.desc || ""}`,
          date: t.date,
        });
      });
    }

    // --- Approval Events (if applicable) ---
    if (cust.approvalHistory && cust.approvalHistory.length) {
      cust.approvalHistory.forEach((a) => {
        events.push({
          type: "approval",
          title:
            a.status === "approved" ? "Approval Granted" : "Approval Requested",
          desc: `${a.actor} — ${a.status.toUpperCase()}`,
          date: a.date,
        });
      });
    }

    // --- COD Impacts (Optional) ---
    if (cust.codHistory && cust.codHistory.length) {
      cust.codHistory.forEach((cd) => {
        events.push({
          type: "cod",
          title: "Close Of Day Impact",
          desc: cd.desc,
          date: cd.date,
        });
      });
    }

    // --- SORT EVENTS (Newest → Oldest) ---
    events.sort((a, b) => b.date - a.date);

    // --- RENDER INTO mBody ---
    let html = `<div class="timeline-wrap">`;

    events.forEach((e) => {
      html += `
      <div class="timeline-item timeline-${e.type}">
        <div class="timeline-dot"></div>
        <div class="timeline-time">${new Date(e.date).toLocaleString()}</div>
        <div class="timeline-title">${e.title}</div>
        <div class="timeline-desc">${e.desc}</div>
      </div>
    `;
    });

    html += `</div>`;

    mBody.innerHTML = html;
  }

  function drillDownApproval(a) {
  window.activeApprovalId = a.id;
  activeCustomerId = a.customerId;

  openCustomerModal(a.customerId);
  setActiveTab("tools");
}

  function closeCustomerModal() {
  modalBack.style.display = "none";
  activeCustomerId = null;
}

function renderProfileTab() {
  const c = state.customers.find(x => x.id === activeCustomerId);
  if (!c) {
    mBody.innerHTML = `<div class="small muted">Customer not found</div>`;
    return;
  }

  // 🔑 get pending approvals (newest first)
  const pendingApprovals = state.approvals
    .filter(a => a.customerId === c.id && a.status === "pending")
    .sort((a, b) => new Date(b.requestedAt) - new Date(a.requestedAt));

  const latestApproval = pendingApprovals[0];

  // =========================
  // BUILD HTML SAFELY
  // =========================
  let html = `
  <div class="card" style="margin-bottom:12px">
    <h4>${c.name}</h4>
    <div class="small">Customer ID: ${c.id}</div>
    <div class="small">Phone: ${c.phone || "—"}</div>
  </div>

  <div class="card" style="margin-bottom:12px">
    <div class="kv">
      <div class="kv-label">Balance</div>
      <div class="kv-value">${fmt(c.balance)}</div>
    </div>
`;

// =========================
// NEGATIVE MAIN BALANCE BADGE
// =========================
if (c.balance < 0) {
  html += `
    <div class="badge" style="
      margin-top:6px;
      background:#fdecea;
      color:#b42318;
      display:inline-block;
    ">
      Negative Balance: ${fmt(Math.abs(c.balance))}
    </div>
  `;
}

// =========================
// EMPOWERMENT BADGE (LOAN)
// =========================
if (
  c.empowerment &&
  c.empowerment.active === true &&
  c.empowerment.balance < 0
) {
  html += `
  <div class="badge" style="
    margin-top:8px;
    background:#fff3cd;
    color:#7a5c00;
    display:inline-block;
  ">
    Empowerment Balance: ${fmt(c.empowerment.balance)}
  </div>
`;

}

// 🔒 CLOSE BALANCE CARD
html += `</div>`;


  // =========================
  // PENDING APPROVAL CARD
  // =========================
  if (latestApproval) {
    html += `
      <div class="card warning" id="profilePendingApproval" style="margin-bottom:12px">
        <div class="small"><b>Pending Approval</b></div>

        <div class="small" style="margin-top:6px">
          ${latestApproval.type.toUpperCase()} — ${fmt(latestApproval.amount)}
        </div>

        <div class="small muted">
          Requested by: ${latestApproval.requestedBy}
        </div>

        <div class="small muted">
          ${new Date(latestApproval.requestedAt).toLocaleString()}
        </div>

        <div style="margin-top:8px">
          <button
            id="goToApprovalActions"
            class="btn btn-sm"
            data-approval-id="${latestApproval.id}">
            Go to Approval Actions
          </button>
        </div>
      </div>
    `;
  }
  if (
  c.empowerment &&
  c.empowerment.history &&
  c.empowerment.history.length > 0
) {
  html += `
    <div class="card" style="margin-top:12px">
      <h4>Empowerment History</h4>
      ${[...c.empowerment.history]
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .map(h => `
          <div class="small" style="margin-top:6px">
            ${new Date(h.date).toLocaleDateString()} —
            ${fmt(h.total)} (${fmt(h.interest)} interest)
          </div>
        `)
        .join("")}
    </div>
  `;
}

  // =========================
  // RENDER ONCE
  // =========================
  mBody.innerHTML = html;

  // =========================
  // BIND BUTTON AFTER RENDER
  // =========================
  const btn = document.getElementById("goToApprovalActions");
  if (btn) {
    btn.onclick = (e) => {
      e.stopPropagation();

      activeCustomerId = c.id;
      window.activeApprovalId = btn.dataset.approvalId;

      setActiveTab("tools");
    };
  }
}
  function setActiveTab(tab) {
  // 1️⃣ force tab highlight
  $$(".tab-btn").forEach(b =>
    b.classList.toggle("active", b.dataset.tab === tab)
  );

  // 2️⃣ ALWAYS clear body before render (critical)
  mBody.innerHTML = "";

  // 3️⃣ render explicitly
  switch (tab) {
    case "profile":
      renderProfileTab();
      break;

    case "tx":
      renderTransactionsTab();
      break;

    case "tools":
      renderToolsTab();
      break;

    case "timeline": {
      const c = state.customers.find(c => c.id === activeCustomerId);
      if (c) renderCustomerTimeline(c);
      break;
    }
  }
}



  // profile tab
function renderToolsTab() {
  const c = state.customers.find(x => x.id === activeCustomerId);
  if (!c) return;

  const staff = currentStaff();
  const canAct = staff && (staff.role === "manager" || staff.role === "ceo");

  // ALWAYS recompute pending approvals
  const approvals = state.approvals
    .filter(a => a.customerId === c.id && a.status === "pending")
    .sort((a, b) => new Date(b.requestedAt) - new Date(a.requestedAt));

  // Select approval safely
  const approval =
    approvals.find(a => a.id === window.activeApprovalId) ||
    approvals[0] ||
    null;

  // =========================
  // APPROVAL ACTIONS UI
  // =========================
  let approvalHTML = "";

  if (approval && canAct) {
    approvalHTML = `
      <div class="card danger" style="margin-bottom:12px">
        <h4>Pending Approval</h4>

        ${approvals.length > 1 ? `
          <div class="small" style="margin-bottom:6px">
            Select approval:
            <select id="approvalSelect" class="input">
              ${approvals.map(a => `
                <option value="${a.id}" ${a.id === approval.id ? "selected" : ""}>
                  ${a.type.toUpperCase()} — ${fmt(a.amount)}
                </option>
              `).join("")}
            </select>
          </div>
        ` : ""}

        <div class="small">
          <b>${approval.type.toUpperCase()}</b> — ${fmt(approval.amount)}
        </div>

        <div class="small muted">Requested by: ${approval.requestedBy}</div>
        <div class="small muted">
          ${new Date(approval.requestedAt).toLocaleString()}
        </div>

        <div style="margin-top:12px;display:flex;gap:8px">
          <button class="btn" id="approveBtn">Approve</button>
          <button class="btn danger" id="rejectBtn">Reject</button>
        </div>

        <div class="small" style="margin-top:8px">
          Risk Level:
          ${approval.riskLevel ? `
  <div class="small" style="margin-top:8px">
    Risk Level:
    <span class="badge ${
      approval.riskLevel === "high"
        ? "danger"
        : approval.riskLevel === "medium"
        ? "warning"
        : "success"
    }">
      ${approval.riskLevel.toUpperCase()}
    </span>
  </div>
` : ""}

        </div>

        ${Array.isArray(approval.anomalies) && approval.anomalies.length ? `
          <div class="card warning" style="margin-top:8px">
            <div class="small"><b>Anomaly Alerts</b></div>
            <ul class="small">
              ${approval.anomalies.map(a => `<li>${a}</li>`).join("")}
            </ul>
          </div>
        ` : ""}
      </div>
    `;
  }

// =========================
// FINAL RENDER (ALWAYS)
// =========================

let toolButtons = `
 <button class="btn" onclick="openActionModal('credit')">Credit</button>
 <button class="btn" onclick="openActionModal('withdraw')">Withdraw</button>
 <button class="btn" onclick="openEmpowermentModal()">Empowerment</button>
 <button class="btn ghost" onclick="toggleFreeze('${c.id}')">
   ${c.frozen ? "Unfreeze" : "Freeze"}
 </button>
 <button class="btn danger" onclick="confirmDeleteCustomer('${c.id}')">
   Delete
 </button>
`;

mBody.innerHTML = `
 ${approvalHTML}

 <div style="display:flex;gap:8px;flex-wrap:wrap">
   ${toolButtons}
 </div>
`;

  // =========================
  // EVENT BINDING
  // =========================
  if (approval && canAct) {
    document.getElementById("approveBtn").onclick =
      () => processApproval(approval.id, "approve");

    document.getElementById("rejectBtn").onclick =
      () => processApproval(approval.id, "reject");

    const sel = document.getElementById("approvalSelect");
    if (sel) {
      sel.onchange = () => {
        window.activeApprovalId = sel.value;
        renderToolsTab();
      };
    }
  }
}



// ============================================================
// QUICK ACTION LOGIC — CREDIT, WITHDRAW, FREEZE, DELETE, REFRESH
// ============================================================

// 1. Open credit/withdraw modal *with correct customer context*
async function openActionModal(type) {
  const c = state.customers.find(x => x.id === activeCustomerId);
  if (!c) return;
  if (c.frozen) return showToast("Account is frozen");

  let lastAmount = "";
  let lastDesc = "";

  while (true) {
    const f = document.createElement("div");
    f.innerHTML = `
      <div style="display:flex;gap:8px">
        <input id="actAmt" class="input" placeholder="Amount" value="${lastAmount}" />
      </div>
      <div style="margin-top:8px">
        <input id="actDesc" class="input" placeholder="Description (required)" value="${lastDesc}" />
      </div>
    `;

    const ok = await openModalGeneric(
      (type === "credit" ? "Credit " : "Withdraw ") + c.name,
      f,
      type === "credit" ? "Credit" : "Withdraw"
    );

    if (!ok) return; // user cancelled

    const amt = Number(f.querySelector("#actAmt").value || 0);
    const desc = f.querySelector("#actDesc").value.trim();

    // retain values on loop
    lastAmount = f.querySelector("#actAmt").value;
    lastDesc = desc;

    if (amt <= 0) {
      showToast("Enter valid amount");
      continue; // 🔁 modal reopens, values retained
    }

    if (!desc) {
      showToast("Description is required for audit");
      continue; // 🔁 modal reopens, values retained
    }

    await processTransaction({
      type,
      customerId: c.id,
      amount: amt,
      desc
    });

    // ✅ SUCCESS → break loop → modal closes ON PURPOSE
    break;
  }
}

// 4. Reload profile tab after credit / withdraw
function refreshAfterTransaction() {
  renderProfileTab();
  renderTransactionsTab();
  renderCustomers();
}

// 5. Print Statement (placeholder — we build report later)
function printStatement(id) {
  const c = state.customers.find(x => x.id === id);
  if (!c) return;

  // TEMP OR SIMPLE VERSION
  alert("Statement printing feature will be upgraded in the Report module.");
}

  // tx tab
  function renderTransactionsTab() {
    const c = state.customers.find((x) => x.id === activeCustomerId);
    if (!c) return;
    mBody.innerHTML = "";
    const list = document.createElement("div");
    if (!c.transactions || !c.transactions.length)
      list.innerHTML = '<div class="small">No transactions</div>';
    else {
      for (const t of c.transactions.slice().reverse()) {
        const r = document.createElement("div");
        r.className = "tx-row";
        r.innerHTML = `<div style="display:flex;justify-content:space-between"><div><strong>${
          t.type
        }</strong> <span class="small"> ${t.desc || ""}</span></div><div>${fmt(
          t.amount
        )}</div></div><div class="small">${new Date(
          t.date
        ).toLocaleString()} • ${t.actor}</div>`;
        r.onclick = () => openTransactionModal(t.id, c.id);
        list.appendChild(r);
      }
    }
    mBody.appendChild(list);
  }

  function refreshCustomerProfile() {
  renderProfileTab();

  const tabs = document.querySelectorAll(".tab-btn");
  tabs.forEach(t => t.classList.remove("active"));

  const profileTab = document.querySelector(".tab-btn[data-tab='profile']");
  if (profileTab) profileTab.classList.add("active");
}


  // transaction modal
  function openTransactionModal(txId, custId) {
    const c = state.customers.find((x) => x.id === custId);
    if (!c) return;
    const t = c.transactions.find((x) => x.id === txId);
    if (!t) return;

    // Determine TX badge
    let badgeClass = "tx-credit";
    if (t.type === "withdraw") badgeClass = "tx-withdraw";
    if (t.type === "adjust") badgeClass = "tx-adjust";
    if (t.type.startsWith("reverse")) badgeClass = "tx-reverse";

    txModalBack.style.display = "flex";

    txTitle.innerHTML = `
    <span class="tx-badge ${badgeClass}">${t.type.toUpperCase()}</span>
  `;

    // Modal body layout with metadata
    txBody.innerHTML = `
    <div class="modal-section">
      <div class="kv-col">
        <div class="kv-label">Amount</div>
        <div class="kv-value">${fmt(t.amount)}</div>
      </div>

      <div class="kv-col">
        <div class="kv-label">Date</div>
        <div class="kv-value">${new Date(t.date).toLocaleString()}</div>
      </div>
    </div>

    <div class="modal-section">
      <div class="kv-col">
        <div class="kv-label">Transaction ID</div>
        <div class="kv-value">${t.id}</div>
        <button class="copy-btn" onclick="navigator.clipboard.writeText('${
          t.id
        }')">Copy ID</button>
      </div>

      <div class="kv-col">
        <div class="kv-label">Customer ID</div>
        <div class="kv-value">${c.id}</div>
      </div>

      <div class="kv-col">
        <div class="kv-label">Performed By</div>
        <div class="kv-value">${t.actor}</div>
      </div>

      <div class="kv-col">
        <div class="kv-label">Description</div>
        <div class="kv-label" style="margin-top:10px;">Audit Hash</div>
<div class="kv-value" style="word-break:break-all;">${t.hash || "N/A"}</div>
<button class="copy-btn" onclick="navigator.clipboard.writeText('${
      t.hash || ""
    }')">Copy Hash</button>

        <div class="kv-value">${t.desc || ""}</div>
      </div>
    </div>
  `;

    // Role-based actions
    const cur = currentStaff();
    if (cur && (cur.role === "manager" || cur.role === "ceo")) {
      const dangerZone = document.createElement("div");
      dangerZone.className = "modal-section";

      const btnRev = document.createElement("button");
      btnRev.className = "btn";
      btnRev.style.background = "#e67e22";
      btnRev.textContent = "Reverse Transaction";
      btnRev.onclick = () => {
        reverseTransaction(custId, txId);
        closeTxModal();
      };

      const btnDel = document.createElement("button");
      btnDel.className = "input";
      btnDel.style.border = "1px solid #e74c3c";
      btnDel.style.color = "#e74c3c";
      btnDel.textContent = "Delete Transaction";
      btnDel.onclick = () => {
        deleteTransaction(custId, txId);
        closeTxModal();
      };

      dangerZone.appendChild(btnRev);
      dangerZone.appendChild(btnDel);
      txBody.appendChild(dangerZone);
    }
  }
  function closeTxModal() {
    txModalBack.style.display = "none";
  }

  async function openEditCustomer(id) {
    const c = state.customers.find((x) => x.id === id);
    if (!c) return;
    const f = document.createElement("div");
    f.innerHTML = `<div style="display:flex;gap:8px"><input id="eName" class="input" value="${c.name}"/><input id="ePhone" class="input" value="${c.phone}"/></div>`;
    const ok = await openModalGeneric("Edit Customer", f, "Save");
    if (ok) {
      c.name = f.querySelector("#eName").value.trim();
      c.phone = f.querySelector("#ePhone").value.trim();
      pushAudit(
        currentStaff().name,
        currentStaff().role,
        "edit_customer",
        JSON.stringify({ id: c.id, name: c.name, phone: c.phone })
      );
      save();
      renderCustomers();
      showToast("Saved");
      mTitle.textContent = c.name;
    }
  }

  async function toggleFreeze(id) {
  const c = state.customers.find(x => x.id === id);
  if (!c) return;

  const ok = await openModalGeneric(
    c.frozen ? "Unfreeze Account" : "Freeze Account",
    `<div class="small">
      Are you sure you want to ${c.frozen ? "unfreeze" : "freeze"} this account?
    </div>`,
    "Confirm"
  );

  if (!ok) return;

  state.approvals.push({
    id: uid("ap"),
    type: "freeze",
    action: c.frozen ? "unfreeze" : "freeze",
    customerId: c.id,
    requestedBy: currentStaff().id,
    requestedAt: new Date().toISOString(),
    status: "pending"
  });

  save();
  renderApprovals();
  showToast("Freeze action sent for approval");
}


  async function openEmpowermentModal() {
  const c = state.customers.find(x => x.id === activeCustomerId);
  if (!c) return showToast("No customer selected");

  let lastAmount = "";
  let lastPurpose = "";
  let lastInterest = "";


  while (true) {
    const box = document.createElement("div");
    box.innerHTML = `
      <div class="small">Request Empowerment</div>

      <div style="margin-top:8px">
        <input id="empAmt" class="input" placeholder="Amount" value="${lastAmount}"/>
        <input
  id="empInterest"
  class="input"
  placeholder="Interest (₦)"
  value="${lastInterest}"
/>

      </div>

      <div style="margin-top:8px">
        <input id="empPurpose" class="input" placeholder="Purpose (required)" value="${lastPurpose}"/>
      </div>
    `;

    const ok = await openModalGeneric(
      "Empowerment Request",
      box,
      "Submit"
    );

    // User cancelled
    if (!ok) return;

    const amount = Number(box.querySelector("#empAmt").value || 0);
    const purpose = box.querySelector("#empPurpose").value || "";
    const interest = Number(
  document.getElementById("empInterest").value || 0
);
lastInterest = document.getElementById("empInterest").value;
if (interest < 0) {
  showToast("Interest cannot be negative");
  continue;
}


    // Preserve values for next loop
    lastAmount = box.querySelector("#empAmt").value;
    lastPurpose = purpose;

    if (amount <= 0) {
      showToast("Enter a valid amount");
      continue; // 🔁 modal reopens with values preserved
    }

    if (!purpose.trim()) {
  showToast("Purpose is required for empowerment audit");
  continue; // 🔁 reopens modal with preserved values
}



    // ✅ Valid → send for approval
    await processTransaction({
  type: "empowerment",
  customerId: c.id,
  amount,
  desc: purpose,
  interest
});
    return; // exit loop on success
  }
}

function openCreditAllocationModal(cust, amount) {
  return new Promise(resolve => {

    const maxEmp = Math.abs(cust.empowerment.balance);

    const wrapper = document.createElement("div");

    wrapper.innerHTML = `
      <div class="small" style="margin-bottom:10px">
        Credit Amount: <b>${fmt(amount)}</b>
      </div>

      <div class="kv">
        <div class="kv-label">Repay Empowerment</div>
        <input id="allocEmp" class="input" type="number" min="0" placeholder="0">
      </div>

      <div class="kv" style="margin-top:8px">
        <div class="kv-label">Credit Balance</div>
        <input id="allocBal" class="input" type="number" min="0" value="${amount}">
      </div>

      <div class="small muted" style="margin-top:10px">
        Outstanding Empowerment: ${fmt(maxEmp)}
      </div>

      <div id="allocError" class="small danger" style="margin-top:8px;display:none"></div>
    `;

    openModalGeneric("Split Credit Allocation", wrapper, "Apply")
      .then(ok => {
        if (!ok) return resolve(null);

        const emp = Number(wrapper.querySelector("#allocEmp").value);
        const bal = Number(wrapper.querySelector("#allocBal").value);

        resolve({ emp, bal });
      });

    const empInput = wrapper.querySelector("#allocEmp");
    const balInput = wrapper.querySelector("#allocBal");
    const err = wrapper.querySelector("#allocError");

    function syncFromEmp() {
  let emp = Number(empInput.value || 0);

  if (emp < 0) emp = 0;
  if (emp > maxEmp) emp = maxEmp;
  if (emp > amount) emp = amount;

  empInput.value = emp;
  balInput.value = amount - emp;

  err.style.display = "none";
}
empInput.addEventListener("input", syncFromEmp);


    
    function syncFromBal() {
      let bal = Number(balInput.value || 0);

      if (bal > amount) bal = amount;
      if (bal < 0) bal = 0;

      balInput.value = bal;
      empInput.value = amount - bal;

      if (empInput.value > maxEmp) {
        empInput.value = maxEmp;
        balInput.value = amount - maxEmp;
      }

      validate();
    }

    function validate() {
      const emp = Number(empInput.value);
      const bal = Number(balInput.value);

      if (emp + bal !== amount) {
        err.textContent = "Allocation must equal credit amount";
        err.style.display = "block";
        return false;
      }

      err.style.display = "none";
      return true;
    }

    empInput.oninput = syncFromEmp;
    balInput.oninput = syncFromBal;
  });
}

async function confirmDeleteCustomer(id) {
    const cur = currentStaff();
    if (!cur) return showToast("Select staff");
    if (cur.role !== "ceo") return showToast("Only CEO can delete");
    const ok = await openModalGeneric(
      "Delete Customer",
      '<div class="small">Are you sure? This will remove customer and transactions.</div>',
      "Delete"
    );
    if (ok) deleteCustomer(id);
  } 
  
  function deleteCustomer(id) {

  const idx = state.customers.findIndex((x) => x.id === id);

  if (idx < 0) return;



  const c = state.customers[idx];

  state.customers.splice(idx, 1);



  pushAudit(

    currentStaff().name,

    currentStaff().role,

    "delete_customer",

    JSON.stringify({ id: c.id, name: c.name })

  );



  save();

  renderCustomers();



  // ✅ ONLY HERE we clear active customer

  activeCustomerId = null;

  closeCustomerModal();



  showToast("Deleted");

}

  function reverseTransaction(custId, txId) {
    const c = state.customers.find((x) => x.id === custId);
    if (!c) return;
    const t = c.transactions.find((x) => x.id === txId);
    if (!t) return;
    const staff = currentStaff();
    if (!(staff && (staff.role === "manager" || staff.role === "ceo")))
      return showToast("Not permitted");
    const now = new Date().toISOString();
    if (t.type === "credit") {
      c.balance -= t.amount;
      c.transactions.push({
        id: uid("tx"),
        type: "reverse_credit",
        amount: -t.amount,
        date: now,
        desc: "Reversal of " + t.id,
        actor: staff.name,
      });
    } else if (t.type === "withdraw") {
      c.balance += t.amount;
      c.transactions.push({
        id: uid("tx"),
        type: "reverse_withdraw",
        amount: t.amount,
        date: now,
        desc: "Reversal of " + t.id,
        actor: staff.name,
      });
    } else return showToast("Cannot reverse");
    pushAudit(
      staff.name,
      staff.role,
      "reverse_tx",
      JSON.stringify({ custId, txId })
    );
    save();
    renderCustomers();
    renderTransactionsTab();
    showToast("Reversed");
    updateChartData();
  }

  function deleteTransaction(custId, txId) {
    const c = state.customers.find((x) => x.id === custId);
    if (!c) return;
    const idx = c.transactions.findIndex((x) => x.id === txId);
    if (idx < 0) return;
    const staff = currentStaff();
    if (!(staff && (staff.role === "manager" || staff.role === "ceo")))
      return showToast("Not permitted");
    const t = c.transactions[idx];
    if (t.type === "credit" || t.type === "adjust") c.balance -= t.amount;
    if (t.type === "withdraw") c.balance += t.amount;
    c.transactions.splice(idx, 1);
    pushAudit(
      staff.name,
      staff.role,
      "delete_tx",
      JSON.stringify({ custId, txId })
    );
    save();
    renderCustomers();
    renderTransactionsTab();
    showToast("Deleted tx");
    updateChartData();
  }

document.getElementById("submitTx").onclick = () => {
  console.log("🔥 SUBMIT BUTTON CLICKED");
};


  // =========================
// TRANSACTION PROCESSING
// =========================
async function processTransaction({ type, customerId, amount, desc, interest = 0 }) {
  if (isMarketer()) {
  showToast("Marketers cannot post financial transactions");
  return;
}
  const staff = currentStaff();
  if (!staff) return showToast("Select staff");

  const cust = state.customers.find(c => c.id === customerId);
  if (!cust) return showToast("Customer missing");
  if (cust.frozen) return showToast("Customer frozen");

  amount = Number(amount || 0);
  if (amount <= 0) return showToast("Invalid amount");

  if (!desc || !desc.trim()) {
    showToast("Description is required for audit purposes");
    return;
  }

  const ok = await openModalGeneric(
    "Confirm Transaction",
    `
      <div class="small">
        Confirm <b>${type.toUpperCase()}</b> of
        <b>${fmt(amount)}</b> for <b>${cust.name}</b>?
      </div>
    `,
    "Send for Approval"
  );

  if (!ok) return;

  const now = new Date().toISOString();

 // 🔑 ALL TRANSACTIONS GO FOR APPROVAL (CLIENT REQUIREMENT)
state.approvals.push({
  id: uid("ap"),
  type,
  amount,
  interest: typeof interest === "number" ? interest : 0,
  customerId,
  desc,
  requestedBy: staff.id,
  requestedByName: staff.name,
  requestedAt: now,
  status: "pending"
});

// ✅ AUDIT — TELLER ACTION (ADD THIS, DO NOT REPLACE)
await pushAudit(
  staff.name,
  staff.role,
  "tx_sent_for_approval",
  {
    txType: type,
    amount,
    customerId: cust.id,
    customerName: cust.name,
    description: desc
  }
);

// 🔑 reset after use
window.currentEmpowermentInterest = null;

// persist + UI
save();
renderApprovals();
showToast("Transaction sent for approval");
return;
}

function drillDownApproval(approval) {
  // 1️⃣ Open the customer modal
  openCustomerModal(approval.customerId);

  // 2️⃣ Switch to profile tab
  setActiveTab("profile");

  // 3️⃣ Visual cue (optional but powerful)
  setTimeout(() => {
    const badge = document.createElement("div");
    badge.className = "badge warning";
    badge.textContent = "Pending Approval";
    document.getElementById("mMeta")?.appendChild(badge);
  }, 100);
}

function scoreApprovalRisk(app, cust) {
  let score = 0;

  if (app.amount >= 500000) score += 3;
  if (cust.balance < app.amount * 2) score += 2;

  const today = new Date().toDateString();
  const approvalsToday = state.approvals.filter(a =>
    a.customerId === cust.id &&
    a.status === "approved" &&
    new Date(a.processedAt).toDateString() === today
  ).length;

  if (approvalsToday >= 1) score += 2;

  if (cust.frozen) score += 5;

  return score >= 5 ? "high" : score >= 3 ? "medium" : "low";
}

function detectApprovalAnomalies(app, cust) {
  const flags = [];

  const recentTx = cust.transactions
    ?.filter(t => Date.now() - new Date(t.date).getTime() < 3600000) || [];

  if (recentTx.some(t => t.type === "credit"))
    flags.push("Recent credit before approval");

  if (cust.balance - app.amount < 0)
    flags.push("Approval causes negative balance");

  if (app.riskLevel === "high")
    flags.push("High risk approval");

  return flags;
}

async function processApproval(id, action) {
  const staff = currentStaff();
if (!canApprove()) {
  showToast("You are not authorized to approve transactions");
  return;
}
  const idx = state.approvals.findIndex(a => a.id === id);
  if (idx < 0) return showToast("Approval not found");

  const app = state.approvals[idx];
  if (app.status !== "pending") {
    showToast("Already processed");
    return;
  }

  const cust = state.customers.find(c => c.id === app.customerId);
  if (!cust) return showToast("Customer missing");
 
  // ===== CONFIRM =====
  const ok = await openModalGeneric(
    action === "approve" ? "Confirm Approval" : "Confirm Rejection",
    `
      <div class="small">
        <b>${app.type.toUpperCase()}</b> — ${fmt(app.amount)}<br/>
        Customer: <b>${cust.name}</b>
      </div>
    `,
    action === "approve" ? "Approve" : "Reject"
  );
  if (!ok) return;

  // ===== APPLY DECISION =====
app.status = action === "approve" ? "approved" : "rejected";

  app.processedBy = staff.name;
  app.processedAt = new Date().toISOString();
// =========================
// APPLY EMPOWERMENT APPROVAL (NEGATIVE BALANCE)
// =========================
if (action === "approve" && app.type === "empowerment") {

  cust.empowerment = cust.empowerment || {
    active: true,
    balance: 0,
    interestRate: 0
  };

  cust.empowerment.active = true;
  cust.empowerment.interestRate = Number(app.interest || 0);

  const principal = app.amount;
const interestAmount = app.interest || 0; // already ₦ amount


// 🔒 HARD GUARD
if (isNaN(principal) || isNaN(interestAmount)) {
  showToast("Invalid empowerment figures");
  return;
}

// ✅ TOTAL = principal + flat interest
const totalLoan = principal + interestAmount;

// 🔴 ALWAYS STORE AS NEGATIVE (DEBT)
cust.empowerment.balance -= totalLoan;


  cust.transactions.push({
  id: uid("tx"),
  type: "empowerment",
  amount: totalLoan,
  date: app.processedAt,
  desc: `Empowerment approved — ₦${fmt(principal)} + ₦${fmt(interestAmount)} interest`,
  actor: staff.name,
  approvalId: app.id
});

  if (!cust.empowerment.history) cust.empowerment.history = [];

  cust.empowerment.history.push({
  approvalId: app.id,
  principal,               // ₦ principal
  interest: interestAmount, // ₦ interest (ABSOLUTE)
  total: totalLoan,        // ₦ principal + interest
  date: app.processedAt,
  approvedBy: staff.name
});


}
// =========================
// WITHDRAW APPROVAL (ALLOW NEGATIVE)
// =========================
if (action === "approve" && app.type === "withdraw") {

  cust.balance -= app.amount;

  cust.transactions.push({
    id: uid("tx"),
    type: "withdraw",
    amount: app.amount,
    date: app.processedAt,
    desc: "Approved withdrawal",
    actor: staff.name,
    approvalId: app.id
  });
}

    // =========================
// CREDIT APPROVAL (MANUAL SPLIT)
// =========================
if (app.type === "credit") {

  let creditedToBalance = app.amount;

  // =========================
  // SPLIT REPAYMENT IF EMPOWERMENT EXISTS
  // =========================
  if (
    cust.empowerment &&
    cust.empowerment.active === true &&
    cust.empowerment.balance < 0
  ) {

    const allocation = await openCreditAllocationModal(cust, app.amount);
    if (allocation === null) return;

    if (
      typeof allocation.emp !== "number" ||
      typeof allocation.bal !== "number" ||
      allocation.emp + allocation.bal !== app.amount
    ) {
      showToast("Invalid allocation");
      return;
    }
const confirmSplit = await openModalGeneric(
  "Confirm Credit Allocation",
  `
    <div class="small">
      Total Credit: <b>${fmt(app.amount)}</b><br/>
      Repay Empowerment: <b>${fmt(allocation.emp)}</b><br/>
      Credit Balance: <b>${fmt(allocation.bal)}</b>
    </div>
  `,
  "Confirm Allocation"
);

if (!confirmSplit) {
  showToast("Credit allocation cancelled");
  return;
}

    const outstanding = Math.abs(cust.empowerment.balance);

// amount actually repaid
const appliedEmp = Math.min(allocation.emp, outstanding);

// reduce debt (move toward zero)
cust.empowerment.balance += appliedEmp;

// remainder goes to balance
creditedToBalance = allocation.bal;
cust.balance += creditedToBalance;

cust.transactions.push({
  id: uid("tx"),
  type: "credit",
  amount: app.amount,
  date: app.processedAt,
  desc: `Approved credit — ₦${appliedEmp} to empowerment, ₦${creditedToBalance} to balance`,
  actor: staff.name,
  approvalId: app.id
});

  } else {
    // =========================
    // NORMAL CREDIT
    // =========================
    cust.transactions.push({
      id: uid("tx"),
      type: "credit",
      amount: app.amount,
      date: app.processedAt,
      desc: "Approved credit",
      actor: staff.name,
      approvalId: app.id
    });
  }

  cust.balance += creditedToBalance;
}
// ===== AUDIT (ROLE-AWARE, DETAILED) =====
await pushAudit(
  staff.name,
  staff.role,
  `approval_${app.status}`,
  {
    approvalId: app.id,
    decision: action,          // approve | reject
    customerId: cust.id,
    customerName: cust.name,
    amount: app.amount,
    txType: app.type
  }
);

// NOTE:
// approvals are never deleted.
// status alone determines visibility in UI and COD logic. 
// persist
save();

// re-render UI
renderApprovals();
renderDashboardApprovals?.(); // safe if exists
renderCustomers();
refreshCustomerProfile();
updateChartData();
renderAudit();

  showToast(
    action === "approve"
      ? "Transaction approved"
      : "Transaction rejected"
  );
}

  let chartWeek = null;
  function buildChart() {
       try {
      const ctx = document.getElementById("chartWeek").getContext("2d");
      chartWeek = new Chart(ctx, {
        type: "bar",
        data: {
          labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
          datasets: [
            {
              label: "k₦ collections",
              data: [0, 0, 0, 0, 0, 0, 0],
              backgroundColor: "rgba(15,184,201,0.9)",
              borderRadius: 6,
            },
          ],
        },
        options: {
          plugins: { legend: { display: false } },
          onClick: (e) => {
            const pts = chartWeek.getElementsAtEventForMode(
              e,
              "nearest",
              { intersect: true },
              false
            );
            if (pts.length) {
              openModalGeneric(
                "Logs",
                '<div class="small">Showing logs for ' +
                  chartWeek.data.labels[pts[0].index] +
                  "</div>",
                "Close"
              );
            }
          },
        },
      });
    } catch (e) {
      console.error("chart err", e);
    }
  }
  function updateChartData() {
     if (!chartWeek) return;
    const data = [0, 0, 0, 0, 0, 0, 0];
    for (const c of state.customers) {
      for (const t of c.transactions || []) {
        if (t.type === "credit" || t.type === "adjust") {
          const d = new Date(t.date || Date.now());
          const idx = (d.getDay() + 6) % 7;
          data[idx] += t.amount / 1000;
        }
      }
    }
    chartWeek.data.datasets[0].data = data.map((x) => Math.round(x));
    chartWeek.update();
  }

  function printStatement(id) {
    const c = state.customers.find((x) => x.id === id) || state.customers[0];
    if (!c) return showToast("No customer");
    let html = `<html><head><title>Statement - ${
      c.name
    }</title></head><body><h2>${c.name}</h2><p>Balance: ${fmt(
      c.balance
    )}</p><table border=\"1\" cellpadding=\"6\"><tr><th>Date</th><th>Type</th><th>Amount</th><th>Desc</th></tr>`;
    for (const t of (c.transactions || []).slice().reverse()) {
      html += `<tr><td>${new Date(t.date).toLocaleString()}</td><td>${
        t.type
      }</td><td>${fmt(t.amount)}</td><td>${t.desc || ""}</td></tr>`;
    }
    html += "</table></body></html>";
    const w = window.open("");
    w.document.write(html);
    w.document.close();
    w.print();
  }


  function printAudit() {
    let html =
      '<html><head><title>Audit</title></head><body><h2>Audit</h2><table border="1" cellpadding="6"><tr><th>Time</th><th>Actor</th><th>Role</th><th>Action</th></tr>';
    for (const a of state.audit.slice().reverse()) {
      html += `<tr><td>${new Date(a.time).toLocaleString()}</td><td>${
        a.actor
      }</td><td>${a.role}</td><td>${a.action}</td></tr>`;
    }
    html += "</table></body></html>";
    const w = window.open("");
    w.document.write(html);
    w.document.close();
    w.print();
  }

  function exportCustomerCSV(id) {
    const c = state.customers.find((x) => x.id === id);
    if (!c) return showToast("No customer");
    let rows = [["name", "phone", "balance"]];
    rows.push([c.name, c.phone, c.balance]);
    rows.push([]);
    rows.push(["tx_id", "type", "amount", "date", "desc", "actor"]);
    for (const t of c.transactions || []) {
      rows.push([
        t.id,
        t.type,
        t.amount,
        t.date || "",
        t.desc || "",
        t.actor || "",
      ]);
    }
    const csv = rows
      .map((r) =>
        r.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")
      )
      .join("\\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `customer_${c.id}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    showToast("CSV downloaded");
  }

  function openAuditForCustomer(id) {
    const filtered = state.audit.filter(
      (a) => a.details && a.details.includes(id)
    );
    let html = '<div class="small">Audit entries for customer</div>';
    if (!filtered.length)
      html += '<div class="small">No audit entries for this customer</div>';
    else {
      for (const a of filtered.slice().reverse()) {
        html += `<div class=\"kv\"><div class=\"small\">${new Date(
          a.time
        ).toLocaleString()} • ${a.actor}</div><div class=\"small\">${
          a.action
        }</div></div>`;
      }
    }
    openModalGeneric("Customer Audit", html, "Close");
  }


function isManager() {
  const s = currentStaff();
  return s && (s.role === ROLES.MANAGER || s.role === ROLES.CEO);
}

function isTeller() {
  const s = currentStaff();
  return s && s.role === ROLES.TELLER;
}

function isMarketer() {
  const s = currentStaff();
  return s && s.role === ROLES.MARKETER;
}

function canApprove() {
  return isManager();
}

function canViewDashboard() {
  return isManager();
}


function initCODDatePicker() {
  const picker = document.getElementById("codDatePicker");
  if (!picker) return;

  // 🔑 single source of truth
  if (!window.activeCODDate) {
    window.activeCODDate = new Date().toISOString().slice(0, 10);
  }

  picker.value = window.activeCODDate;

  picker.onchange = () => {
    window.activeCODDate = picker.value;

    // 🔥 THIS IS WHAT WAS MISSING
    renderCODForDate(window.activeCODDate);
  };

  // 🔥 INITIAL RENDER (CRITICAL)
  renderCODForDate(window.activeCODDate);
}

function saveManagerCODNote(codId) {
  const note = document.getElementById("managerNoteBox")?.value || "";

  const cod = state.cod.find(c => c.id === codId);
  if (!cod) return;

  cod.managerNote = note.trim();
  cod.managerNotedAt = new Date().toISOString();
  cod.managerNotedBy = currentStaff().name;

  save();
  showToast("Manager note saved");
  renderCODForDate(cod.date);
}


function renderCODForDate(dateStr) {
  const el = document.getElementById("codTodayList");
  if (!el) return;

  const date = dateStr || new Date().toISOString().slice(0, 10);

  const todaysCOD = state.cod.filter(c => c.date === date);
  // =========================
// 🔑 MANAGER SYSTEM TOTALS
// =========================
const systemTotals = todaysCOD.reduce(
  (acc, c) => {
    const expected = Number(c.systemExpected || 0);

    const declared =
      c.status === "resolved"
        ? Number(c.resolvedAmount || 0)
        : Number(c.staffDeclared || 0);

    acc.expected += expected;
    acc.declared += declared;
    acc.variance += declared - expected;

    return acc;
  },
  { expected: 0, declared: 0, variance: 0 }
);

// informational totals (not used for balancing)
const systemInfo = todaysCOD.reduce(
  (acc, c) => {
    acc.withdrawals += Number(c.snapshot?.withdrawals || 0);
    acc.empowerments += Number(c.snapshot?.empowerments || 0);
    return acc;
  },
  { withdrawals: 0, empowerments: 0 }
);

// =========================
// 🔑 SYSTEM SUMMARY CARD
// =========================
summaryHTML = `
  <div
    class="card system-cod"
    style="margin-bottom:16px;border-left:4px solid #1976d2"
  >
    <h4>
      System Close of Day Summary
      <span class="small muted">(system reference)</span>
    </h4>

    <div class="small">
      Expected Cash: <b>${fmt(systemTotals.expected)}</b><br/>
      Declared Cash: <b>${fmt(systemTotals.declared)}</b><br/>
      Net Variance:
      <b style="color:${systemTotals.variance === 0 ? "green" : "red"}">
        ${fmt(systemTotals.variance)}
      </b>
    </div>

    <div class="small muted" style="margin-top:6px">
      Withdrawals (info): ${fmt(systemInfo.withdrawals)}<br/>
      Empowerments (info): ${fmt(systemInfo.empowerments)}
    </div>
  </div>
`;
let html = "";

state.staff.forEach(staff => {
  const rec = todaysCOD.find(c => c.staffId === staff.id);

  // ❌ NOT SUBMITTED
  if (!rec) {
    html += `
      <div class="card warning" style="margin-bottom:8px">
        <b>${staff.name}</b> (${staff.role})<br/>
        <span class="danger">❌ Not submitted</span>
      </div>
    `;
    return;
  }

  // 🔎 STATUS FLAGS
  const isResolved = rec.status === "resolved";
  const isFlagged = rec.status === "flagged";
  const isBalanced = rec.status === "balanced";

  const statusLabel = isBalanced
    ? `<span style="color:green">✔ Balanced</span>`
    : isResolved
      ? `<span style="color:#1976d2">✔ Resolved</span>`
      : `<span style="color:red">⚠ Flagged</span>`;

  html += `
    <div
      class="card cod-card"
      data-staff-id="${rec.staffId}"
      data-date="${rec.date}"
      style="
        margin-bottom:8px;
        cursor:pointer;
        border-left:4px solid ${
          isBalanced ? '#2e7d32'
          : isResolved ? '#1976d2'
          : isFlagged ? '#ed6c02'
          : '#d32f2f'
        };
        background:${
          isBalanced ? '#e8f5e9'
          : isResolved ? '#e3f2fd'
          : isFlagged ? '#fff3e0'
          : '#ffebee'
        };
        padding-left:8px;
      "
    >
      <b>${staff.name}</b> (${staff.role})<br/>
      <div class="small">${statusLabel}</div>

     <div class="small" style="margin-top:4px">
  <b>Expected:</b> ${fmt(rec.systemExpected)}<br/>

  ${
    isResolved
      ? `<b style="color:#0a7d2c">Resolved Amount:</b> ${fmt(rec.resolvedAmount)}<br/>
         <span style="opacity:.6">Staff Declared: ${fmt(rec.staffDeclared)}</span><br/>`
      : `<b>Staff Declared:</b> ${fmt(rec.staffDeclared)}<br/>`
  }

        ${
  isResolved && rec.resolutionNote
    ? `<div class="small muted" style="margin-top:4px">
         🧾 ${rec.resolutionNote}
       </div>`
    : isBalanced && rec.managerNote
    ? `<div class="small warning" style="margin-top:4px">
         ⚠ Manager note: ${rec.managerNote}
       </div>`
    : rec.staffNote
    ? `<div class="small muted" style="margin-top:4px">
         📝 ${rec.staffNote}
       </div>`
    : ""
}

      </div>

      ${
        rec.initialDeclared !== undefined
          ? `<div class="small muted" style="margin-top:4px">
               Initial declared: ${fmt(rec.initialDeclared)}
             </div>`
          : ""
      }

      ${
        isManager() && isFlagged
          ? `
            <div style="margin-top:8px">
              <button
                type="button"
                class="btn danger cod-resolve-btn"
                data-cod-id="${rec.id}"
              >
                Resolve
              </button>
            </div>
          `
          : ""
      }
    </div>
  `;
});
       
 // 1️⃣ Render HTML FIRST
el.innerHTML =
  summaryHTML +
  (html || `<div class="small muted">No records</div>`);

// 2️⃣ Bind COD card click (drilldown)
document.querySelectorAll(".cod-card").forEach(card => {
  card.onclick = () => {
    const staffId = card.dataset.staffId;
    const date = card.dataset.date;
    openCODDrillDown(staffId, date);
  };
});

// 3️⃣ Bind Resolve button (STOP propagation)
document.querySelectorAll(".cod-resolve-btn").forEach(btn => {
  btn.onclick = (e) => {
    e.stopPropagation(); // 🔴 CRITICAL
    const codId = btn.dataset.codId;
    openCODResolutionModal(codId);
  };
});
}
window.renderCODForDate = renderCODForDate;


function renderManagerCODSummary(dateStr) {
  const staff = currentStaff();
  if (!staff || !["manager", "ceo"].includes(staff.role)) return;

  const date =
    dateStr ||
    window.activeCODDate ||
    new Date().toISOString().slice(0, 10);

  const records = (state.cod || []).filter(c => c.date === date);

  // =========================
  // 🔑 APPROVED CREDITS (MANAGER VIEW)
  // =========================
  const approvedTxs = (state.approvals || []).filter(a =>
    a.type === "credit" &&
    a.status === "approved" &&
    (a.processedAt || a.requestedAt)?.startsWith(date)
  );

  const approvedTotal = approvedTxs.reduce(
    (sum, a) => sum + Number(a.amount || 0),
    0
  );

  // =========================
  // 🔑 SYSTEM DECLARED (FROM COD)
  // =========================
  const systemDeclared = records.reduce((sum, r) => {
    return (
      sum +
      (
        r.status === "resolved"
          ? Number(r.resolvedAmount || 0)
          : Number(r.staffDeclared || 0)
      )
    );
  }, 0);

  // =========================
  // 🔑 MANAGER VARIANCE
  // =========================
  const variance = approvedTotal - systemDeclared;

  const submittedCount = records.length;
  const notSubmitted = state.staff.length - submittedCount;

  const el = document.getElementById("managerCODSummary");
  if (!el) return;

  el.innerHTML = `
    <div class="card" style="margin-bottom:12px">
      <h4>Manager Close of Day Summary</h4>

      <div class="small"><b>Date:</b> ${date}</div>

      <div class="kv">
        <div class="kv-label">Approved Cash</div>
        <div>${fmt(approvedTotal)}</div>
      </div>

      <div class="kv">
        <div class="kv-label">System Declared Cash</div>
        <div>${fmt(systemDeclared)}</div>
      </div>

      <div class="kv">
        <div class="kv-label">Approval Variance</div>
        <div style="color:${variance === 0 ? "green" : "red"}">
          ${fmt(variance)}
        </div>
      </div>

      <hr/>

      <div class="small">
        Submitted: <b>${submittedCount}</b><br/>
        Not Submitted: <b>${notSubmitted}</b>
      </div>
    </div>
  `;
}

window.renderManagerCODSummary = renderManagerCODSummary;


function openCODDrillDown(staffId, date) {
  const modal = document.getElementById("txModal");
  const body = document.getElementById("txBody");
  const title = document.getElementById("txTitle");
  const back = document.getElementById("txModalBack");

  const cod = state.cod.find(
    c => c.staffId === staffId && c.date === date
  );

  if (!cod) {
    showToast("COD record not found");
    return;
  }

  // 🔒 SNAPSHOT (SOURCE OF TRUTH)
  const snap = cod.snapshot || {
    credits: 0,
    withdrawals: 0,
    empowerments: 0
  };

  // 🔑 ALL TRANSACTIONS BY STAFF FOR DATE (APPROVED + PENDING)
  const txs = (state.approvals || [])
    .filter(a =>
      a.requestedBy === staffId &&
      (a.processedAt || a.requestedAt)?.startsWith(date)
    )
    .sort(
      (a, b) =>
        new Date(b.processedAt || b.requestedAt) -
        new Date(a.processedAt || a.requestedAt)
    );

  title.textContent = "Close of Day — Breakdown (Read-only)";

  // 🔒 LOCK MODAL HEIGHT (SCROLL FIX)
  body.style.height = "70vh";
  body.style.overflow = "hidden";
  body.style.display = "flex";
  body.style.flexDirection = "column";

  body.innerHTML = `
    <!-- HEADER -->
    <div class="small" style="display:flex;gap:12px;flex-wrap:wrap">
      <div><b>Staff:</b> ${cod.staffName}</div>
      <div><b>Date:</b> ${cod.date}</div>
      <div><b>Expected:</b> ${fmt(cod.systemExpected)}</div>
      <div><b>Declared:</b> ${fmt(cod.staffDeclared)}</div>
    </div>

    ${
      cod.status === "resolved"
        ? `
          <div class="small muted" style="margin-top:4px">
            <b>Resolved:</b> ${fmt(cod.resolvedAmount)}
            — 🧾 ${cod.resolutionNote || "—"}
          </div>
        `
        : cod.staffNote
        ? `
          <div class="small muted" style="margin-top:4px">
            📝 ${cod.staffNote}
          </div>
        `
        : ""
    }

    <!-- SNAPSHOT SUMMARY -->
    <div class="small" style="margin-top:8px">
      Credits: <b>${fmt(snap.credits)}</b><br/>
      Withdrawals (info): ${fmt(snap.withdrawals)}<br/>
      Empowerments (info): ${fmt(snap.empowerments)}
    </div>

    <h4 style="margin:8px 0 4px">Transactions</h4>

    <!-- SCROLL AREA -->
    <div
      style="
        flex:1;
        overflow-y:auto;
        padding-right:10px;
      "
    >
      ${
        txs.length
          ? txs.map(t => `
            <div class="small" style="border-bottom:1px solid #eee;padding:6px 0">
              <b>${t.type.toUpperCase()}</b> — ${fmt(t.amount)}<br/>
              <span class="muted">
                ${new Date(t.processedAt || t.requestedAt).toLocaleString()}
                — ${t.status.toUpperCase()}
              </span>
            </div>
          `).join("")
          : `<div class="small muted">No transactions</div>`
      }
    </div>

    ${
      isManager()
        ? `
          <div style="margin-top:10px">
            <label class="small muted">Manager note (optional)</label>

            <textarea
              id="managerNoteInput"
              class="input"
              style="margin-top:4px;min-height:60px"
              placeholder="Internal note (visible to staff)"
            >${cod.managerNote || ""}</textarea>

            <button
              id="saveManagerNoteBtn"
              class="btn"
              style="margin-top:6px"
            >
              Save Note
            </button>
          </div>
        `
        : ""
    }
  `;

  modal.querySelectorAll(".tx-ok").forEach(b => b.remove());
  back.style.display = "flex";

  // 💾 SAVE MANAGER NOTE
  const saveBtn = document.getElementById("saveManagerNoteBtn");
  if (saveBtn) {
    saveBtn.onclick = () => {
  const input = document.getElementById("managerNoteInput");
  if (!input) return;

  cod.managerNote = input.value.trim();
  cod.managerNoteAt = new Date().toISOString();
  cod.managerNoteBy = currentStaff()?.name || "";

  save();

  input.value = ""; // ✅ CLEAR FIELD AFTER SAVE

  showToast("Manager note saved");
  renderCODForDate(cod.date);
};
  }
}

window.openCODDrillDown = openCODDrillDown;


function renderDashboard() {
  const dash = document.getElementById("dashboardView");
  if (!dash || dash.style.display !== "block") return; // 🛑 Do nothing if dashboard isn't visible

  if (!canViewDashboard()) return;

  renderDashboardKPIs();
  renderAttentionRequired();
  renderDashboardApprovals();
  renderDashboardActivity();
  initCODDatePicker();
  bindCODButtons();
  renderManagerCODSummary(window.activeCODDate);
  renderCODForDate(window.activeCODDate);
}

function renderDashboardApprovals() {
  const box = document.getElementById("dashboardApprovals");
  if (!box) return;

  box.innerHTML = "";

  const pending = state.approvals.filter(a => a.status === "pending");

  if (!pending.length) {
    box.innerHTML = `<div class="small">No approvals requiring action</div>`;
    return;
  }

  pending.forEach(a => {
    const cust = state.customers.find(c => c.id === a.customerId);
    const date = a.requestedAt
  ? new Date(a.requestedAt).toLocaleString()
  : "";

    const row = document.createElement("div");
    row.className = "approval-row large";

    const risk =
      a.amount >= 500000 ? `<span class="badge danger">HIGH RISK</span>` : "";

    row.innerHTML = `
  <div class="approval-info">
    <strong>${a.type.toUpperCase()} — ₦${Number(a.amount).toLocaleString()}</strong> ${risk}

    <div class="small"><b>Customer:</b> ${cust?.name || a.customerId}</div>
    <div class="small"><b>Requested by:</b> ${a.requestedByName || a.requestedBy}</div>
    <div class="small muted">${date}</div>
  </div>

  <div class="approval-actions">
    <button class="btn approve">Approve</button>
    <button class="btn danger reject">Reject</button>
  </div>
`;

    row.querySelector(".approve").onclick = () =>
      confirmApproval(a, "approved");

    row.querySelector(".reject").onclick = () =>
      confirmApproval(a, "rejected");

    row.querySelector(".approval-info").onclick = () => {
      if (cust) openCustomerModal(cust.id);
    };

    box.appendChild(row);
  });
}


function renderDashboardActivity() {
  const box = document.getElementById("dashboardActivity");
  if (!box) return;

  const logs = state.audit.slice(-6).reverse();

  if (!logs.length) {
    box.innerHTML = `<div class="small muted">No recent activity</div>`;
    
    if (["manager", "ceo"].includes(currentStaff()?.role)) {
  renderAccounts();
}
    return;
  }

  box.innerHTML = logs.map(a => `
    <div class="small">
      ${new Date(a.time).toLocaleString()} —
      <b>${a.actor}</b> (${a.role}) →
      ${a.action}
    </div>
  `).join("");
  // 🔑 Always render accounts for manager/CEO
if (["manager", "ceo"].includes(currentStaff()?.role)) {
  renderAccounts();
}
}

function renderAccountEntries(accountId) {
  const entries = (state.accountEntries || [])
    .filter(e => e.accountId === accountId)
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  if (!entries.length) {
    return `<div class="small muted">No entries yet</div>`;
  }

  return entries.map(e => `
    <div class="small" style="margin-top:4px;padding-left:6px;border-left:2px solid #ddd;">
      ${e.date} — ${fmt(e.amount)} 
      ${e.note ? `<span class="muted">(${e.note})</span>` : ""}
    </div>
  `).join("");
}

window.renderAccountEntries = renderAccountEntries;


function renderAccounts() {

  // 🔒 HARD GUARD — accounts must always exist
  state.accounts = state.accounts || {};
state.accounts.income = state.accounts.income || [];
state.accounts.expense = state.accounts.expense || [];
const totalIncome = sumByType("income");
const totalExpense = sumByType("expense");
const net = totalIncome - totalExpense;
  // 🔒 DOUBLE GUARD — legacy safety
  if (!Array.isArray(state.accounts.income)) state.accounts.income = [];
  if (!Array.isArray(state.accounts.expense)) state.accounts.expense = [];
  
  const el = document.getElementById("accountsPanel");
  if (!el) return;

  const renderList = (type) =>
  state.accounts[type]
    .filter(a => !a.archived)
    .map(a => `
  <div class="card small">
    <b>${a.accountNumber}</b> — ${a.name}<br/>

<div class="small muted" style="margin:4px 0">
  Total: <b>${fmt(sumEntries(getEntriesByAccount(a.id)))}</b>
</div>

<button class="btn small add-entry-btn"
  onclick="openAccountEntryModal('${a.id}', '${type}')">
  + Add Entry
</button>

    <div class="account-entries">
      ${renderAccountEntries(a.id)}
    </div>
  </div>
`).join("");

  const active = state.ui.dateFilter || "all";

el.innerHTML = `
<div class="card" style="margin-bottom:12px;border-left:4px solid #1976d2">

 <div style="margin-bottom:10px">
  <button class="btn small ${active==='today'?'primary':''}" onclick="setDateFilter('today')">Today</button>
  <button class="btn small ${active==='week'?'primary':''}" onclick="setDateFilter('week')">This Week</button>
  <button class="btn small ${active==='month'?'primary':''}" onclick="setDateFilter('month')">This Month</button>
  <button class="btn small ${active==='all'?'primary':''}" onclick="setDateFilter('all')">All Time</button>
 </div>

    <div class="small">
      Total Income: <b>${fmt(totalIncome)}</b><br/>
      Total Expenses: <b>${fmt(totalExpense)}</b><br/>
      Net (Income − Expense):
      <b style="color:${net >= 0 ? 'green' : 'red'}">
        ${fmt(net)}
      </b>
    </div>
  </div>
    <h4>Income Accounts</h4>
    ${renderList("income")}
   <button class="accounts-btn" onclick="promptCreateAccount('income')">
  + Add Income Account
</button>

    <h4 style="margin-top:12px">Expense Accounts</h4>
    ${renderList("expense")}
    <button class="accounts-btn" onclick="promptCreateAccount('expense')">
  + Add Expense Account
</button>
  `;
}

  function showToast(msg, ms = 1800) {
    const t = $("#toast");
    t.textContent = msg;
    t.style.display = "block";
    setTimeout(() => (t.style.display = "none"), ms);
  }

  function openModalGeneric(title, content, okText = "OK") {
  const back = document.getElementById("txModalBack");
  const modal = document.getElementById("txModal");
  const titleEl = document.getElementById("txTitle");
  const bodyEl = document.getElementById("txBody");
  const actions = modal.querySelector(".modal-actions");
  const cancelBtn = document.getElementById("txCancel");

  // reset modal completely
  titleEl.textContent = title;
  bodyEl.innerHTML = "";
  actions.querySelectorAll(".tx-ok").forEach(b => b.remove());

  if (typeof content === "string") bodyEl.innerHTML = content;
  else bodyEl.appendChild(content);

  let okBtn = null;

if (okText) {
  okBtn = document.createElement("button");
  okBtn.className = "btn tx-ok";
  okBtn.textContent = okText;
  actions.appendChild(okBtn);
}

  back.style.display = "flex";

  return new Promise(resolve => {
    const cleanup = () => {
      back.style.display = "none";
      if (okBtn) okBtn.onclick = null;
      cancelBtn.onclick = null;
      back.onclick = null;
    };

    if (okBtn) {
  okBtn.onclick = e => {
    e.stopPropagation();
    cleanup();
    resolve(true);
  };
}

    cancelBtn.onclick = e => {
      e.stopPropagation();
      cleanup();
      resolve(false);
    };

    back.onclick = e => {
      if (e.target === back) {
        cleanup();
        resolve(false);
      }
    };
  });
}

// ============================
// GLOBAL TAB CLICK HANDLER
// ============================
document.addEventListener("click", (e) => {
  const btn = e.target.closest(".tab-btn");
  if (!btn) return;

  e.preventDefault();
  e.stopPropagation();

  const tab = btn.dataset.tab;
  if (tab) {
    setActiveTab(tab);
  }
});
  // UI events
const btn = document.getElementById("btnCOD");
if (btn) {
  btn.onclick = async () => {
    console.log("BTN COD CLICKED");
    await openCloseDayModal();
  };
}

window.openCloseDayModal = openCloseDayModal;


function bindDashboardButton() {
  const btn = document.getElementById("btnDashboard");
  if (!btn) return;

  btn.onclick = () => {
    const dash = document.getElementById("dashboardView");
    const app = document.getElementById("app");

    const openingDashboard = dash.style.display !== "block";

    state.ui.dashboardMode = openingDashboard; // 🔥 THIS is critical

    if (openingDashboard) {
      dash.style.display = "block";
      app.style.display = "none";
      renderDashboard();
    } else {
      dash.style.display = "none";
      app.style.display = "grid";
    }

    save();
  };
}


  document.getElementById("btnNew").addEventListener("click", async () => {
    const f = document.createElement("div");
    f.innerHTML = `<div style="display:flex;gap:8px"><input id="nName" class="input" placeholder="Full name"/><input id="nPhone" class="input" placeholder="Phone"/></div><div style="margin-top:8px"><input id="nBal" class="input" placeholder="Opening balance"/></div>`;
    const ok = await openModalGeneric("Create Customer", f, "Create");
    if (ok) {
      const name = f.querySelector("#nName").value.trim();
      const phone = f.querySelector("#nPhone").value.trim();
      const bal = Number(f.querySelector("#nBal").value || 0);
      if (!name) return showToast("Enter name");
      const c = {
        id: uid("c"),
        name,
        phone,
        balance: bal,
        frozen: false,
        transactions: [],
      };
      state.customers.push(c);
      await pushAudit(
        currentStaff().name,
         currentStaff().role,
        "create_customer",
        JSON.stringify(c)
      );
      save();
      renderCustomers();
      updateChartData();
      showToast("Customer created");
    }
  });
  

document.getElementById("btnVerify").addEventListener("click", async () => {
    const probs = await verifyAudit();
    if (!probs.length) showToast("Audit OK");
    else
      openModalGeneric(
        "Audit issues",
        '<div class="small">Problems detected</div>',
        "Close"
      );
  });
  document
    .getElementById("mobileContrib")
    .addEventListener("click", async () => {
      const f = document.createElement("div");
      f.innerHTML =
        '<div class="small">Mobile contribution</div><div style="margin-top:8px"><input id="mobAmt" class="input" placeholder="Amount"/></div>';
      const ok = await openModalGeneric("Contribute", f, "Contribute");
      if (ok) {
        const v = Number(f.querySelector("#mobAmt").value || 0);
        if (v <= 0) return showToast("Enter amount");
        const c = state.customers[0];
        c.balance += v;
        c.transactions.push({
          id: uid("tx"),
          type: "credit",
          amount: v,
          date: new Date().toISOString(),
          desc: "mobile contrib",
          actor: currentStaff().name,
        });
        await pushAudit(
          currentStaff().name,
          currentStaff().role,
          "mobile_contrib",
          JSON.stringify({ customer: c.id, amount: v })
        );
        save();
        renderCustomers();
        updateChartData();
        showToast("Thanks");
      }
    });
  document
    .getElementById("printStmt")
    .addEventListener("click", () => printStatement());
  document
    .getElementById("printAudit")
    .addEventListener("click", () => printAudit());
  document
    .getElementById("txCancel")
    .addEventListener("click", () => closeTxModal());
  txModalBack.addEventListener("click", (e) => {
  e.stopPropagation(); // 🔑 THIS IS THE KEY
  if (e.target === txModalBack) {
    txModalBack.style.display = "none";
  }
});
  // init
  
 try {
    load();
  if (!Array.isArray(state.approvals)) state.approvals = [];
  if (!Array.isArray(state.audit)) state.audit = [];
  if (!state.ui) state.ui = {};

  if (!state.staff.length || !state.customers.length) seed();

  renderStaff();
  renderCustomers();
  renderApprovals();
  renderAudit();
  buildChart();
  updateChartData();
  
  bindCODButtons();
  bindDashboardButton();      // controls show/hide dashboard
  syncDashboardVisibility();  // shows dashboard button only for managers

 
} catch (e) {
  console.error("INIT ERROR", e);
}


  // ===============================
// 🔑 FORCE EDGE-SAFE BINDING
// ===============================
(function bindCloseDayButton() {
  const btn = document.getElementById("btnCOD");
  if (!btn) return;

  // remove any old handlers Edge may have dropped
  btn.onclick = null;

  // force-enable (Edge respects this strictly)
  btn.disabled = false;
  btn.style.pointerEvents = "auto";

  // bind explicitly
  btn.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    openCloseDayModal();
  });
})();

  if (!state.activeStaffId && state.staff.length) {
    state.activeStaffId = state.staff[0].id;
    save();
  }

  const staffSelect = document.getElementById("staffSelect");
  if (staffSelect) {
    staffSelect.value = state.activeStaffId;

    staffSelect.onchange = (e) => {
      state.activeStaffId = e.target.value;
      save();

      hideDashboard();
      renderCustomers();
      renderApprovals();
      renderAudit();
      syncDashboardVisibility();
      bindCODButtons();
    };
  }

function bindCODButtons() {
  const staff = currentStaff();
  if (!staff) return;

  const btnCOD = document.getElementById("btnCOD");
  const btnMyCOD = document.getElementById("btnMyCOD");

  // Bind Close Day (all staff)
  if (btnCOD) {
    btnCOD.onclick = async () => {
      await openCloseDayModal();
    };
  }

  // Staff-only: My Close of Day
  if (btnMyCOD) {
    if (!["manager", "ceo"].includes(staff.role)) {
      btnMyCOD.style.display = "inline-block";
      btnMyCOD.onclick = () => openMyCOD();
    } else {
      btnMyCOD.style.display = "none";
    }
  }
}


function resetCODForDate(dateStr) {
  if (!canApprove()) {
    showToast("Not authorized");
    return;
  }

  state.cod = (state.cod || []).filter(
    c => c.date !== dateStr
  );

  save();
  renderCODForDate(dateStr);

  showToast(`COD reset for ${dateStr}`);
}
window.resetCODForDate = resetCODForDate;

function resetCODDraftForStaffDate(staffId, dateStr) {
  if (!state.codDrafts) return;

  const key = `${staffId}|${dateStr}`;
  delete state.codDrafts[key];

  save();
}
window.resetCODDraftForStaffDate = resetCODDraftForStaffDate;



// =========================
// EXPOSE FOR DEBUG
// =========================
window.SmartContrib = { state, save, pushAudit };

  // ============================================================
// EXPOSE ACTION FUNCTIONS TO GLOBAL SCOPE (HTML onclick support)
// ============================================================
window.openActionModal = openActionModal;
window.toggleFreeze = toggleFreeze;
window.confirmDeleteCustomer = confirmDeleteCustomer;
window.printStatement = printStatement;
window.refreshAfterTransaction = refreshAfterTransaction;
window.openEmpowermentModal = openEmpowermentModal;
window.openEditCustomer = openEditCustomer;
window.processApproval = processApproval;


})();
