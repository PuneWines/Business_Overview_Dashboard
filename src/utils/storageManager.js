// Storage Manager - Handle all localStorage operations

const STORAGE_KEYS = {
  USERS: 'pcb_users',
  CREDITS: 'pcb_credits',
  EXPENSES: 'pcb_expenses',
  LEDGER: 'pcb_ledger',
  SETTINGS: 'pcb_settings',
  AUTH_USER: 'pcb_authUser'
};

const DEFAULT_USERS = [
  { id: 'admin', name: 'Admin User', password: 'admin123', role: 'ADMIN', accessPages: [] },
  { id: 'user', name: 'Employee 1', password: 'user123', role: 'USER', accessPages: [] },
];

const DEFAULT_SETTINGS = {
  groupHeads: ['IT', 'HR', 'Finance', 'Operations', 'Marketing'],
  paymentModes: ['Cash', 'Cheque', 'Bank Transfer', 'Online Payment'],
  lastSerialNumber: 0
};

const PERSON_NAMES = [
  'Rajesh Kumar', 'Priya Sharma', 'Amit Patel', 'Sneha Gupta', 'Vikram Singh',
  'Anita Desai', 'Suresh Reddy', 'Kavita Nair', 'Manoj Tiwari', 'Deepa Joshi'
];
const PAYMENT_MODES = ['Cash', 'Cheque', 'Bank Transfer', 'Online'];
const GROUP_HEADS = ['IT', 'HR', 'Finance', 'Operations', 'Marketing'];

const CREDIT_REMARKS = [
  'Monthly petty cash replenishment', 'Emergency fund allocation', 'Travel advance disbursement',
  'Office supplies budget', 'Client meeting expenses advance', 'Quarterly maintenance fund',
  'Vendor payment advance', 'Event preparation budget', 'Utility payment fund', 'Miscellaneous fund top-up',
];

const EXPENSE_REMARKS = [
  'Office stationery – pens, notebooks', 'Cab fare for client visit', 'Printer cartridge replacement',
  'Staff lunch – team meeting', 'Courier charges – document dispatch', 'Plumbing repair in conference room',
  'Water dispenser service', 'Wi-Fi router replacement', 'Conference room supplies', 'Fuel reimbursement',
  'Pantry supplies – tea, coffee', 'Parking charges', 'First-aid kit replenishment',
  'AC filter cleaning', 'Birthday celebration – HR team', 'Fire extinguisher refill',
  'UPS battery replacement', 'Office chair repair', 'Photocopy charges', 'Train ticket – audit visit'
];

function seededRandom(seed) {
  let s = seed;
  return function () {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function generateDummyCredits(count = 50) {
  const rand = seededRandom(42);
  const credits = [];
  const baseDate = new Date();
  for (let i = 0; i < count; i++) {
    const daysAgo = count - i + Math.floor(rand() * 3);
    const dateObj = new Date(baseDate.getTime() - daysAgo * 86400000);
    credits.push({
      id: `CRD-SEED-${1000 + i}`,
      sn: `SN-${1000 + i}`,
      personName: PERSON_NAMES[i % PERSON_NAMES.length],
      date: dateObj.toISOString().split('T')[0],
      amount: (Math.floor(rand() * 50) + 5) * 100,
      paymentMode: PAYMENT_MODES[i % PAYMENT_MODES.length],
      image: '',
      remarks: CREDIT_REMARKS[i % CREDIT_REMARKS.length],
      status: 'APPROVED',
      timestamp: dateObj.toISOString()
    });
  }
  return credits;
}

function generateDummyExpenses(count = 35) {
  const rand = seededRandom(99);
  const expenses = [];
  const baseDate = new Date();
  const statusPool = ['APPROVED', 'APPROVED', 'APPROVED', 'PENDING', 'PENDING', 'REJECTED'];
  for (let i = 0; i < count; i++) {
    const daysAgo = count - i + Math.floor(rand() * 3);
    const dateObj = new Date(baseDate.getTime() - daysAgo * 86400000);
    expenses.push({
      id: `EXP-SEED-${2000 + i}`,
      sn: `EXP-${2000 + i}`,
      personName: PERSON_NAMES[i % PERSON_NAMES.length],
      date: dateObj.toISOString().split('T')[0],
      amount: (Math.floor(rand() * 15) + 1) * 100,
      paymentMode: PAYMENT_MODES[i % PAYMENT_MODES.length],
      groupHead: GROUP_HEADS[i % GROUP_HEADS.length],
      image: '',
      remarks: EXPENSE_REMARKS[i % EXPENSE_REMARKS.length],
      status: statusPool[i % statusPool.length],
      timestamp: dateObj.toISOString()
    });
  }
  return expenses;
}

function generateLedgerFromData(credits, expenses) {
  const ledger = [];
  const balanceMap = {};
  [...credits].sort((a, b) => new Date(a.date) - new Date(b.date)).forEach((c, idx) => {
    if (!balanceMap[c.personName]) balanceMap[c.personName] = 0;
    balanceMap[c.personName] += c.amount;
    ledger.push({ id: `LDG-CR-${3000 + idx}`, personName: c.personName, type: 'CREDIT', amount: c.amount, date: c.date, referenceId: c.id, balance: balanceMap[c.personName], timestamp: c.timestamp });
  });
  [...expenses].filter(e => e.status === 'APPROVED').sort((a, b) => new Date(a.date) - new Date(b.date)).forEach((e, idx) => {
    if (!balanceMap[e.personName]) balanceMap[e.personName] = 0;
    balanceMap[e.personName] -= e.amount;
    ledger.push({ id: `LDG-EX-${4000 + idx}`, personName: e.personName, type: 'EXPENSE', amount: e.amount, date: e.date, referenceId: e.id, balance: balanceMap[e.personName], timestamp: e.timestamp });
  });
  return ledger;
}

export const initializeStorage = () => {
  if (!localStorage.getItem(STORAGE_KEYS.USERS)) localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(DEFAULT_USERS));
  if (!localStorage.getItem(STORAGE_KEYS.SETTINGS)) localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(DEFAULT_SETTINGS));
  if (!localStorage.getItem('user')) localStorage.setItem('user', JSON.stringify({ id: 'admin', name: 'Admin User', role: 'ADMIN' }));
  if (!localStorage.getItem(STORAGE_KEYS.CREDITS)) {
    const dummyCredits = generateDummyCredits(50);
    const dummyExpenses = generateDummyExpenses(35);
    localStorage.setItem(STORAGE_KEYS.CREDITS, JSON.stringify(dummyCredits));
    localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(dummyExpenses));
    localStorage.setItem(STORAGE_KEYS.LEDGER, JSON.stringify(generateLedgerFromData(dummyCredits, dummyExpenses)));
  } else {
    if (!localStorage.getItem(STORAGE_KEYS.EXPENSES)) localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify([]));
    if (!localStorage.getItem(STORAGE_KEYS.LEDGER)) localStorage.setItem(STORAGE_KEYS.LEDGER, JSON.stringify([]));
  }
};

export const getFromStorage = (key) => { const d = localStorage.getItem(key); return d ? JSON.parse(d) : null; };
export const saveToStorage = (key, data) => localStorage.setItem(key, JSON.stringify(data));

export const getUsers = () => { const u = getFromStorage(STORAGE_KEYS.USERS); if (!u || !u.some(x => x.id === 'admin')) { saveToStorage(STORAGE_KEYS.USERS, DEFAULT_USERS); return DEFAULT_USERS; } return u; };
export const saveUsers = (users) => saveToStorage(STORAGE_KEYS.USERS, users);

export const getCredits = () => getFromStorage(STORAGE_KEYS.CREDITS) || [];
export const saveCredits = (credits) => saveToStorage(STORAGE_KEYS.CREDITS, credits);
export const saveCredit = (credit) => { const c = getCredits(); c.push(credit); saveCredits(c); };
export const getCreditById = (id) => getCredits().find(c => c.id === id);
export const updateCredit = (updated) => { const c = getCredits(); const i = c.findIndex(x => x.id === updated.id); if (i !== -1) { c[i] = updated; saveCredits(c); } };

export const getExpenses = () => getFromStorage(STORAGE_KEYS.EXPENSES) || [];
export const saveExpenses = (expenses) => saveToStorage(STORAGE_KEYS.EXPENSES, expenses);
export const saveExpense = (expense) => { const e = getExpenses(); e.push(expense); saveExpenses(e); };
export const getExpenseById = (id) => getExpenses().find(e => e.id === id);
export const updateExpense = (updated) => { const e = getExpenses(); const i = e.findIndex(x => x.id === updated.id); if (i !== -1) { e[i] = updated; saveExpenses(e); } };

export const getLedger = () => getFromStorage(STORAGE_KEYS.LEDGER) || [];
export const saveLedgers = (ledger) => saveToStorage(STORAGE_KEYS.LEDGER, ledger);
export const saveLedger = (entry) => { const l = getLedger(); l.push(entry); saveLedgers(l); };

export const getSettings = () => getFromStorage(STORAGE_KEYS.SETTINGS) || DEFAULT_SETTINGS;
export const saveSettings = (settings) => saveToStorage(STORAGE_KEYS.SETTINGS, settings);

export const getAuthUser = () => getFromStorage(STORAGE_KEYS.AUTH_USER);
export const saveAuthUser = (user) => saveToStorage(STORAGE_KEYS.AUTH_USER, user);
export const clearAuthUser = () => localStorage.removeItem(STORAGE_KEYS.AUTH_USER);

export { STORAGE_KEYS };
