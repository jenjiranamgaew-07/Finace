import { useState, useEffect, useMemo } from "react";
import { initializeApp } from "firebase/app";
import { getFirestore, doc, onSnapshot, setDoc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCZDHBslv9KRiTwtmm8dyzgMgz1YAZeV3E",
  authDomain: "finance-tracker-5b8de.firebaseapp.com",
  projectId: "finance-tracker-5b8de",
  storageBucket: "finance-tracker-5b8de.firebasestorage.app",
  messagingSenderId: "103568432665",
  appId: "1:103568432665:web:35673a69f8ebf7f3d11488"
};

let fbApp, db;
try {
  fbApp = initializeApp(firebaseConfig);
  db = getFirestore(fbApp);
} catch(e) { console.warn("Firebase init failed", e); }

// ===== DEFAULT DATA =====
const DEFAULT_SETTINGS = { exchangeRate: 35, monthlyIncome: 3020, budgetWarning: 200 };

const DEFAULT_CATEGORIES = [
  "รายรับ","หนี้บ้านไทย ABN","บัตรเครดิต ABN","Bondora","บัตร Amex","ประกันสุขภาพสะสม","หนี้ DUO",
  "หนี้ไทย","กู้สหกรณ์","ไฟแนนซ์รถคิก","ไฟแนนซ์รถคอท","หนี้ทรู","Shopee",
  "ค่ากับข้าว/ของใช้","น้ำมันรถ","ช้อปส่วนตัว","ค่าไฟที่ไทย","ประกัน","ให้แม่","อื่นๆ"
];

const DEFAULT_DEBTS = [
  { id:"abn_home", name:"หนี้บ้านไทย ABN", amount:260, currency:"EUR", totalInstallments:81, remaining:79, category:"eur", icon:"🏠" },
  { id:"health_ins", name:"ประกันสุขภาพสะสม", amount:66, currency:"EUR", totalInstallments:12, remaining:11, category:"eur", icon:"🏥" },
  { id:"abn_credit", name:"บัตรเครดิต ABN", amount:40, currency:"EUR", totalInstallments:29, remaining:29, category:"eur", icon:"💳" },
  { id:"bondora", name:"Bondora", amount:22.74, currency:"EUR", totalInstallments:28, remaining:26, category:"eur", icon:"📊" },
  { id:"amex", name:"Amex (จ่ายยอดเต็ม)", amount:50, currency:"EUR", totalInstallments:33, remaining:32, category:"eur", icon:"💳", isRolling:true },
  { id:"coop_loan", name:"กู้สหกรณ์ (คิก)", amountTHB:3722, amount:3722/35, currency:"THB", totalInstallments:166, remaining:163, category:"thai", icon:"🤝" },
  { id:"car_kik", name:"ไฟแนนซ์รถคิก", amountTHB:3555, amount:3555/35, currency:"THB", totalInstallments:70, remaining:67, category:"thai", icon:"🚗" },
  { id:"car_kot", name:"ไฟแนนซ์รถคอท", amountTHB:5400, amount:5400/35, currency:"THB", totalInstallments:50, remaining:48, category:"thai", icon:"🚗" },
  { id:"true_debt", name:"หนี้ทรู", amountTHB:2830, amount:2830/35, currency:"THB", totalInstallments:4, remaining:1, category:"thai", icon:"📱" },
  { id:"shopee1", name:"Shopee 1", amountTHB:1822, amount:1822/35, currency:"THB", totalInstallments:6, remaining:4, category:"thai", icon:"🛍️" },
  { id:"shopee2", name:"Shopee 2", amountTHB:1470, amount:1470/35, currency:"THB", totalInstallments:6, remaining:4, category:"thai", icon:"🛍️" },
  { id:"shopee3", name:"Shopee 3", amountTHB:3200, amount:3200/35, currency:"THB", totalInstallments:10, remaining:8, category:"thai", icon:"🛍️" },
  { id:"shopee4", name:"Shopee 4", amountTHB:2900, amount:2900/35, currency:"THB", totalInstallments:10, remaining:9, category:"thai", icon:"🛍️" },
  { id:"shopee2870", name:"Shopee 2870", amountTHB:2870, amount:2870/35, currency:"THB", totalInstallments:4, remaining:2, category:"thai", icon:"🛍️" },
];

const DEFAULT_EXPENSES = [
  { id:"health", name:"ประกันสุขภาพ VGZ", amount:149.9, icon:"🏥" },
  { id:"car_ins", name:"ประกันรถ", amount:40, icon:"🚗" },
  { id:"phone", name:"ค่าโทรศัพท์", amount:50, icon:"📱" },
  { id:"duo", name:"DUO (กยศ)", amount:48, icon:"🎓" },
  { id:"fuel", name:"น้ำมันรถ", amount:200, icon:"⛽" },
  { id:"grocery", name:"ค่ากับข้าว/ของใช้", amount:800, icon:"🛒" },
  { id:"lottery", name:"หวย", amount:21, icon:"🎰" },
  { id:"personal", name:"ช้อปส่วนตัว", amount:100, icon:"👜" },
  { id:"misc", name:"อื่นๆ", amount:100, icon:"💰" },
  { id:"mom", name:"ให้แม่", amountTHB:5000, amount:5000/35, icon:"👩" },
  { id:"electricity", name:"ค่าไฟที่ไทย", amountTHB:2000, amount:2000/35, icon:"💡" },
];

const DEBT_CATEGORY_MAP = {
  "หนี้บ้านไทย ABN": "abn_home",
  "บัตรเครดิต ABN": "abn_credit",
  "Bondora": "bondora",
  "บัตร Amex": "amex",
  "ประกันสุขภาพสะสม": "health_ins",
  "หนี้ DUO": null,
  "กู้สหกรณ์": "coop_loan",
  "ไฟแนนซ์รถคิก": "car_kik",
  "ไฟแนนซ์รถคอท": "car_kot",
  "หนี้ทรู": "true_debt",
  "Shopee": null,
};

const DEFAULT_TRANSACTIONS = [
  { id:"m01", date:"2026-03-27", name:"Greenfood เงินเดือน", category:"รายรับ", amount:3032.96, method:"Income" },
  { id:"m02", date:"2026-03-01", name:"หนี้บ้านไทย", category:"หนี้บ้านไทย ABN", amount:-260, method:"Debit" },
  { id:"m03", date:"2026-03-01", name:"กินข้าวนอกบ้าน Hotpot", category:"ค่ากับข้าว/ของใช้", amount:-88.9, method:"Debit" },
  { id:"m04", date:"2026-03-01", name:"ส่งเงินกลับไทย", category:"ช้อปส่วนตัว", amount:-29.21, method:"Debit" },
  { id:"m05", date:"2026-03-01", name:"รวมยอด Amex", category:"ช้อปส่วนตัว", amount:-428.25, method:"Credit" },
  { id:"m06", date:"2026-03-02", name:"สมาชิกช่องกล้า", category:"ช้อปส่วนตัว", amount:-1.37, method:"Debit" },
  { id:"m07", date:"2026-03-02", name:"Tinq น้ำมัน", category:"น้ำมันรถ", amount:-81.53, method:"Credit" },
  { id:"m08", date:"2026-03-03", name:"Car insurance", category:"ประกัน", amount:-36.26, method:"Debit" },
  { id:"m09", date:"2026-03-05", name:"Amex ยอดเต็ม", category:"บัตร Amex", amount:-1685.7, method:"Debit" },
  { id:"m10", date:"2026-03-06", name:"Bondora", category:"Bondora", amount:-22.74, method:"Debit" },
  { id:"m11", date:"2026-03-09", name:"Aldi", category:"ค่ากับข้าว/ของใช้", amount:-85.25, method:"Credit" },
  { id:"m12", date:"2026-03-15", name:"Car wash", category:"น้ำมันรถ", amount:-15.5, method:"Credit" },
  { id:"m13", date:"2026-03-17", name:"Tinq น้ำมัน", category:"น้ำมันรถ", amount:-87.3, method:"Credit" },
  { id:"m14", date:"2026-03-25", name:"Simple โทรศัพท์", category:"ค่าโทรศัพท์", amount:-5.15, method:"Debit" },
  { id:"m15", date:"2026-03-27", name:"Vodafon", category:"ค่าโทรศัพท์", amount:-36.86, method:"Debit" },
  { id:"m16", date:"2026-03-27", name:"Postcode Loterij หวย", category:"อื่นๆ", amount:-21.0, method:"Debit" },
  { id:"m17", date:"2026-03-27", name:"VGZ ประกันสุขภาพสะสม", category:"ประกันสุขภาพสะสม", amount:-65.73, method:"Debit" },
  { id:"m18", date:"2026-03-31", name:"DUO", category:"หนี้ DUO", amount:-46.23, method:"Debit" },
  { id:"m19", date:"2026-03-31", name:"InShared ประกันรถ", category:"ประกัน", amount:-36.26, method:"Debit" },
  { id:"a01", date:"2026-04-27", name:"Greenfood เงินเดือน", category:"รายรับ", amount:3032.96, method:"Income" },
  { id:"a02", date:"2026-04-01", name:"Thai home ABN", category:"หนี้บ้านไทย ABN", amount:-260, method:"Debit" },
  { id:"a03", date:"2026-04-05", name:"VGZ ประกันสุขภาพ", category:"ประกัน", amount:-149.9, method:"Debit" },
  { id:"a04", date:"2026-04-05", name:"TINQ น้ำมัน", category:"น้ำมันรถ", amount:-92.03, method:"Credit" },
  { id:"a05", date:"2026-04-06", name:"Aldi", category:"ค่ากับข้าว/ของใช้", amount:-79.99, method:"Credit" },
  { id:"a06", date:"2026-04-06", name:"Bondora", category:"Bondora", amount:-22.74, method:"Debit" },
  { id:"a07", date:"2026-04-12", name:"Aldi", category:"ค่ากับข้าว/ของใช้", amount:-121.48, method:"Credit" },
  { id:"a08", date:"2026-04-12", name:"DUO", category:"หนี้ DUO", amount:-46.23, method:"Debit" },
  { id:"a09", date:"2026-04-18", name:"Aldi", category:"ค่ากับข้าว/ของใช้", amount:-99.9, method:"Credit" },
  { id:"a10", date:"2026-04-22", name:"Tinq น้ำมัน", category:"น้ำมันรถ", amount:-30.53, method:"Credit" },
  { id:"a11", date:"2026-04-28", name:"Postcode หวย", category:"อื่นๆ", amount:-21.0, method:"Debit" },
  { id:"a12", date:"2026-04-28", name:"Simple โทรศัพท์", category:"ค่าโทรศัพท์", amount:-5.15, method:"Debit" },
  { id:"a13", date:"2026-04-28", name:"Aldi", category:"ค่ากับข้าว/ของใช้", amount:-87.1, method:"Credit" },
];

const MONTHS = ["ม.ค.","ก.พ.","มี.ค.","เม.ย.","พ.ค.","มิ.ย.","ก.ค.","ส.ค.","ก.ย.","ต.ค.","พ.ย.","ธ.ค."];
const fmt = n => `€${Math.abs(n).toLocaleString("nl-NL",{minimumFractionDigits:2,maximumFractionDigits:2})}`;
const fmtTHB = n => `฿${Math.round(Math.abs(n)).toLocaleString("th-TH")}`;
const uid = () => "id"+Date.now()+Math.random().toString(36).slice(2,6);
const today = () => new Date().toISOString().slice(0,10);

// ===== PERSISTENCE: Firebase + localStorage fallback =====
const LS_KEY = "financeTracker_v2";

function lsLoad() {
  try { const d = localStorage.getItem(LS_KEY); return d ? JSON.parse(d) : null; } catch { return null; }
}
function lsSave(data) {
  try { localStorage.setItem(LS_KEY, JSON.stringify(data)); } catch(e) { console.warn("localStorage save failed", e); }
}

async function fbSave(data) {
  if (!db) return;
  try { await setDoc(doc(db, "finance", "user_data"), data); } catch(e) { console.warn("Firebase save failed", e); }
}

// ===== AI ANALYSIS =====
async function callClaude(prompt, systemPrompt) {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1000,
      system: systemPrompt || "คุณเป็นที่ปรึกษาการเงินส่วนตัว ตอบเป็นภาษาไทย กระชับ ตรงประเด็น ใช้ emoji เพื่อให้อ่านง่าย",
      messages: [{ role: "user", content: prompt }]
    })
  });
  const d = await res.json();
  return d.content?.[0]?.text || "ไม่สามารถวิเคราะห์ได้";
}

// ===== FINANCIAL SCORE =====
function calcFinancialScore(debts, expenses, transactions, settings) {
  const monthlyDebt = debts.reduce((s,d)=>s+d.amount,0);
  const monthlyFixed = expenses.reduce((s,e)=>s+e.amount,0);
  const total = monthlyDebt + monthlyFixed;
  const income = settings.monthlyIncome;
  const debtRatio = total / income; // lower = better
  const balance = income - total;
  
  // Score components (0-100 each)
  const debtScore = Math.max(0, Math.min(100, (1 - debtRatio) * 100));
  const savingsScore = balance > 0 ? Math.min(100, (balance / income) * 200) : 0;
  const debtCount = debts.filter(d=>d.remaining>0).length;
  const diversityScore = Math.max(0, 100 - debtCount * 6);
  
  const total_score = Math.round((debtScore * 0.4) + (savingsScore * 0.4) + (diversityScore * 0.2));
  
  let grade = "F", color = "#ef4444", label = "วิกฤต";
  if (total_score >= 80) { grade = "A"; color = "#22c55e"; label = "ดีเยี่ยม"; }
  else if (total_score >= 65) { grade = "B"; color = "#86efac"; label = "ดี"; }
  else if (total_score >= 50) { grade = "C"; color = "#fbbf24"; label = "พอใช้"; }
  else if (total_score >= 35) { grade = "D"; color = "#fb923c"; label = "ต้องปรับปรุง"; }
  
  return { score: total_score, grade, color, label, debtRatio, balance };
}

export default function App() {
  const [loaded, setLoaded] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [debts, setDebtsState] = useState(DEFAULT_DEBTS);
  const [expenses, setExpensesState] = useState(DEFAULT_EXPENSES);
  const [transactions, setTxnsState] = useState(DEFAULT_TRANSACTIONS);
  const [settings, setSettingsState] = useState(DEFAULT_SETTINGS);
  const [categories, setCategoriesState] = useState(DEFAULT_CATEGORIES);

  const [activeTab, setActiveTab] = useState("dashboard");
  const [notif, setNotif] = useState(null);

  // Modals
  const [showAddDebt, setShowAddDebt] = useState(false);
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [showTransfer, setShowTransfer] = useState(false);
  const [showAddCat, setShowAddCat] = useState(false);
  const [editingTx, setEditingTx] = useState(null);

  // Transfer
  const [transferAmt, setTransferAmt] = useState("");
  const [transferDate, setTransferDate] = useState(today());
  const [transferSplit, setTransferSplit] = useState(null);

  // Quick entry
  const [qName, setQName] = useState("");
  const [qAmt, setQAmt] = useState("");
  const [qCat, setQCat] = useState("ค่ากับข้าว/ของใช้");
  const [qMethod, setQMethod] = useState("Debit");
  const [qDate, setQDate] = useState(today());
  const [qIsThb, setQIsThb] = useState(false);
  const [newCat, setNewCat] = useState("");

  // New debt/expense forms
  const [newDebt, setNewDebt] = useState({name:"",amount:"",currency:"EUR",totalInstallments:"",remaining:"",category:"eur",icon:"💳",amountTHB:"",isRolling:false});
  const [newExpense, setNewExpense] = useState({name:"",amount:"",amountTHB:"",isTHB:false,icon:"💰"});

  // History filters
  const [histSearch, setHistSearch] = useState("");
  const [histMonth, setHistMonth] = useState("");
  const [histYear, setHistYear] = useState("");
  const [histPage, setHistPage] = useState(1);
  const PAGE_SIZE = 15;

  // Report
  const [reportMonth, setReportMonth] = useState(new Date().getMonth());
  const [reportYear, setReportYear] = useState(2026);

  // AI
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState(null);
  const [aiTab, setAiTab] = useState("summary");

  // Budget warning threshold
  const [showBudgetWarning, setShowBudgetWarning] = useState(false);

  // Load: Firebase realtime + localStorage fallback
  useEffect(() => {
    // First load from localStorage instantly
    const ls = lsLoad();
    if (ls) {
      if (ls.debts) setDebtsState(ls.debts);
      if (ls.expenses) setExpensesState(ls.expenses);
      if (ls.transactions) setTxnsState(ls.transactions);
      if (ls.settings) setSettingsState(ls.settings);
      if (ls.categories) setCategoriesState(ls.categories);
    }

    // Then subscribe to Firebase realtime
    if (db) {
      const unsub = onSnapshot(doc(db, "finance", "user_data"), (snap) => {
        if (snap.exists()) {
          const data = snap.data();
          if (data.debts) setDebtsState(data.debts);
          if (data.expenses) setExpensesState(data.expenses);
          if (data.transactions) setTxnsState(data.transactions);
          if (data.settings) setSettingsState(data.settings);
          if (data.categories) setCategoriesState(data.categories);
          lsSave(data); // always keep localStorage in sync
        }
        setLoaded(true);
      }, (err) => {
        console.warn("Firebase listen error:", err);
        setLoaded(true);
      });
      return () => unsub();
    } else {
      setLoaded(true);
    }
  }, []);

  const toast = (msg, color="#22c55e") => { setNotif({msg,color}); setTimeout(()=>setNotif(null),3500); };

  const saveAll = async (d, e, t, s, c) => {
    const data = {debts:d, expenses:e, transactions:t, settings:s, categories:c};
    lsSave(data);
    setSyncing(true);
    await fbSave(data);
    setSyncing(false);
  };

  const saveDebts = d => { setDebtsState(d); saveAll(d,expenses,transactions,settings,categories); };
  const saveExpenses = e => { setExpensesState(e); saveAll(debts,e,transactions,settings,categories); };
  const saveTxns = t => { setTxnsState(t); saveAll(debts,expenses,t,settings,categories); };
  const saveSettings = s => { setSettingsState(s); saveAll(debts,expenses,transactions,s,categories); };
  const saveCats = c => { setCategoriesState(c); saveAll(debts,expenses,transactions,settings,c); };

  // Stats
  const monthlyDebt = useMemo(() => debts.reduce((s,d)=>s+d.amount,0), [debts]);
  const monthlyFixed = useMemo(() => expenses.reduce((s,e)=>s+e.amount,0), [expenses]);
  const totalMonthly = monthlyDebt + monthlyFixed;
  const balance = settings.monthlyIncome - totalMonthly;
  const totalDebtEUR = useMemo(() => debts.filter(d=>!d.isRolling).reduce((s,d)=>s+d.amount*d.remaining,0), [debts]);
  const maxMonths = Math.max(...debts.filter(d=>!d.isRolling).map(d=>d.remaining),0);
  const debtFreeDate = new Date(2026,4); debtFreeDate.setMonth(debtFreeDate.getMonth()+maxMonths);

  const financialScore = useMemo(() => calcFinancialScore(debts, expenses, transactions, settings), [debts, expenses, transactions, settings]);

  // Budget warning
  useEffect(() => {
    if (balance < (settings.budgetWarning || 200) && balance >= 0) setShowBudgetWarning(true);
    else if (balance < 0) setShowBudgetWarning(true);
    else setShowBudgetWarning(false);
  }, [balance, settings.budgetWarning]);

  // Current month spending
  const nowMonth = new Date().getMonth();
  const nowYear = new Date().getFullYear();
  const thisMonthTxns = transactions.filter(t => { const d = new Date(t.date); return d.getMonth()===nowMonth && d.getFullYear()===nowYear; });
  const thisMonthSpent = thisMonthTxns.filter(t=>t.amount<0).reduce((s,t)=>s+Math.abs(t.amount),0);
  const thisMonthIncome = thisMonthTxns.filter(t=>t.amount>0).reduce((s,t)=>s+t.amount,0);

  // Forecast: days until balance hits 0
  const dailyBurn = thisMonthSpent / new Date().getDate();
  const daysLeft = balance / dailyBurn;
  const forecastDate = new Date(); forecastDate.setDate(forecastDate.getDate() + Math.round(daysLeft));

  // Projection
  const projection = useMemo(() => {
    const fixedExp = expenses.reduce((s,e)=>s+e.amount,0);
    let carry = 0; const res = [];
    for (let m=4; m<12; m++) {
      const activeDebt = debts.filter(d=>d.remaining-(m-4)>0).reduce((s,d)=>s+d.amount,0);
      const bal = settings.monthlyIncome - activeDebt - fixedExp;
      carry += bal;
      res.push({month:MONTHS[m], balance:bal, cumulative:carry});
    }
    return res;
  }, [debts, expenses, settings]);
  const yearEndSavings = projection[projection.length-1]?.cumulative||0;
  const maxBar = Math.max(...projection.map(s=>Math.abs(s.cumulative)),1);

  // ===== AUTO REDUCE INSTALLMENTS =====
  const addTxnAndReduceDebt = (tx) => {
    const newTxns = [tx, ...transactions];
    let newDebts = [...debts];
    
    // Only exact category match — ไม่ fuzzy match เพื่อป้องกันหักผิดรายการ
    const catKey = tx.category;
    const debtId = DEBT_CATEGORY_MAP[catKey] || null;
    
    if (debtId && tx.amount < 0) {
      newDebts = debts.map(d => {
        if (d.id === debtId && d.remaining > 0) {
          return {...d, remaining: d.remaining - 1};
        }
        return d;
      });
    }
    
    setTxnsState(newTxns);
    setDebtsState(newDebts);
    saveAll(newDebts, expenses, newTxns, settings, categories);
  };

  // Transfer
  const handleThaiTransfer = () => {
    const total = parseFloat(transferAmt); if(!total||total<=0) return;
    const thaiDebts = debts.filter(d=>d.category==="thai"&&d.remaining>0);
    const totalReq = thaiDebts.reduce((s,d)=>s+(d.amountTHB||d.amount*settings.exchangeRate),0);
    const split = thaiDebts.map(d=>{const req=d.amountTHB||d.amount*settings.exchangeRate; const paid=Math.min(req,(req/totalReq)*total); return {...d,paidTHB:Math.round(paid),paidEUR:paid/settings.exchangeRate};});
    setTransferSplit({split,remaining:total-split.reduce((s,x)=>s+x.paidTHB,0),total});
  };

  const confirmTransfer = () => {
    if(!transferSplit) return;
    const txs = transferSplit.split.map(d=>({id:uid(),date:transferDate,name:`จ่ายหนี้ ${d.name}`,category:"หนี้ไทย",amount:-d.paidEUR,method:"Debit"}));
    if(transferSplit.remaining>0) txs.push({id:uid(),date:transferDate,name:"ส่งให้แม่",category:"ให้แม่",amount:-(transferSplit.remaining/settings.exchangeRate),method:"Debit"});
    
    // Reduce remaining for thai debts
    const newDebts = debts.map(d => {
      const hit = transferSplit.split.find(s=>s.id===d.id);
      if (hit && d.remaining > 0) return {...d, remaining: d.remaining - 1};
      return d;
    });
    const newTxns = [...txs, ...transactions];
    setDebtsState(newDebts);
    setTxnsState(newTxns);
    saveAll(newDebts, expenses, newTxns, settings, categories);
    setShowTransfer(false); setTransferAmt(""); setTransferSplit(null);
    toast(`✅ บันทึกโอน ${fmtTHB(parseFloat(transferAmt))} แล้ว — งวดลดแล้ว!`);
  };

  // Quick entry
  const addQuickEntry = () => {
    if(!qAmt||!qName) return;
    const isInc = qCat==="รายรับ";
    let amtEUR = parseFloat(qAmt);
    if (qIsThb) amtEUR = amtEUR / settings.exchangeRate;
    const tx = {id:uid(),date:qDate,name:qName,category:qCat,amount:isInc?amtEUR:-amtEUR,method:qMethod};
    addTxnAndReduceDebt(tx);
    setQName(""); setQAmt(""); toast(`✅ บันทึก "${qName}" แล้ว`);
  };

  // Edit transaction
  const saveEditTx = () => {
    if(!editingTx) return;
    const newTxns = transactions.map(t=>t.id===editingTx.id?editingTx:t);
    saveTxns(newTxns);
    setEditingTx(null); toast("💾 แก้ไขรายการแล้ว");
  };
  const deleteTx = (id) => { saveTxns(transactions.filter(t=>t.id!==id)); toast("🗑️ ลบรายการแล้ว","#f59e0b"); };

  // Debt ops
  const updateDebt = (id,field,value) => {
    const updated = debts.map(d=>{
      if(d.id!==id) return d;
      const u={...d,[field]:["name","icon","category"].includes(field)?value:parseFloat(value)||0};
      if(field==="amountTHB") u.amount=u.amountTHB/settings.exchangeRate;
      return u;
    });
    saveDebts(updated); toast("💾 บันทึกแล้ว");
  };
  const addDebt = () => {
    if(!newDebt.name||(!newDebt.amount&&!newDebt.amountTHB)) return;
    const r=settings.exchangeRate;
    const d={...newDebt,id:uid(),amount:newDebt.currency==="THB"?(parseFloat(newDebt.amountTHB)||0)/r:parseFloat(newDebt.amount),amountTHB:newDebt.currency==="THB"?parseFloat(newDebt.amountTHB):undefined,totalInstallments:parseInt(newDebt.totalInstallments)||0,remaining:parseInt(newDebt.remaining)||0};
    saveDebts([...debts,d]); setShowAddDebt(false);
    setNewDebt({name:"",amount:"",currency:"EUR",totalInstallments:"",remaining:"",category:"eur",icon:"💳",amountTHB:"",isRolling:false});
    toast(`✅ เพิ่มหนี้ "${d.name}" แล้ว`);
  };
  const removeDebt = id => { saveDebts(debts.filter(d=>d.id!==id)); toast("🗑️ ลบหนี้แล้ว","#f59e0b"); };

  // Expense ops
  const updateExpense = (id,field,value) => {
    const updated = expenses.map(e=>{
      if(e.id!==id) return e;
      const u={...e,[field]:["name","icon"].includes(field)?value:parseFloat(value)||0};
      if(field==="amountTHB") u.amount=u.amountTHB/settings.exchangeRate;
      return u;
    });
    saveExpenses(updated); toast("💾 บันทึกแล้ว");
  };
  const addExpense = () => {
    if(!newExpense.name||(!newExpense.amount&&!newExpense.amountTHB)) return;
    const e={...newExpense,id:uid(),amount:newExpense.isTHB?(parseFloat(newExpense.amountTHB)||0)/settings.exchangeRate:parseFloat(newExpense.amount),amountTHB:newExpense.isTHB?parseFloat(newExpense.amountTHB):undefined};
    saveExpenses([...expenses,e]); setShowAddExpense(false);
    setNewExpense({name:"",amount:"",amountTHB:"",isTHB:false,icon:"💰"});
    toast(`✅ เพิ่ม "${e.name}" แล้ว`);
  };
  const removeExpense = id => { saveExpenses(expenses.filter(e=>e.id!==id)); toast("🗑️ ลบแล้ว","#f59e0b"); };

  // Category ops
  const addCategory = () => {
    if(!newCat.trim()) return;
    saveCats([...categories,newCat.trim()]);
    setNewCat(""); setShowAddCat(false); toast(`✅ เพิ่มหมวด "${newCat}" แล้ว`);
  };

  // Filtered history
  const filteredTxns = useMemo(() => {
    return transactions.filter(t => {
      const d = new Date(t.date);
      const matchSearch = !histSearch || t.name.toLowerCase().includes(histSearch.toLowerCase()) || t.category.toLowerCase().includes(histSearch.toLowerCase());
      const matchMonth = !histMonth || d.getMonth() === parseInt(histMonth);
      const matchYear = !histYear || d.getFullYear() === parseInt(histYear);
      return matchSearch && matchMonth && matchYear;
    });
  }, [transactions, histSearch, histMonth, histYear]);

  const totalPages = Math.ceil(filteredTxns.length / PAGE_SIZE);
  const pagedTxns = filteredTxns.slice((histPage-1)*PAGE_SIZE, histPage*PAGE_SIZE);

  // Report data
  const reportTxns = transactions.filter(t=>{const d=new Date(t.date);return d.getMonth()===reportMonth&&d.getFullYear()===reportYear;});
  const reportInc = reportTxns.filter(t=>t.amount>0).reduce((s,t)=>s+t.amount,0);
  const reportExp = reportTxns.filter(t=>t.amount<0).reduce((s,t)=>s+t.amount,0);
  const reportBal = reportInc+reportExp;
  const reportByCat = reportTxns.filter(t=>t.amount<0).reduce((acc,t)=>{acc[t.category]=(acc[t.category]||0)+Math.abs(t.amount);return acc;},{});

  function calcMonthlyBalances(txns, year) {
    const months = {};
    txns.forEach(t => {
      const d = new Date(t.date);
      if (d.getFullYear() !== year) return;
      const key = d.getMonth();
      months[key] = (months[key]||0) + t.amount;
    });
    const result = {};
    let carry = 0;
    for (let m = 0; m < 12; m++) {
      const bal = (months[m]||0) + carry;
      result[m] = { monthly: months[m]||0, cumulative: bal };
      carry = bal;
    }
    return result;
  }
  const monthlyBals = calcMonthlyBalances(transactions, reportYear);

  // AI Analysis
  const runAI = async (type) => {
    setAiLoading(true); setAiResult(null); setAiTab(type);
    try {
      const recentTxns = transactions.slice(0, 50);
      const catSummary = recentTxns.filter(t=>t.amount<0).reduce((acc,t)=>{acc[t.category]=(acc[t.category]||0)+Math.abs(t.amount);return acc;},{});
      
      let prompt = "";
      if (type === "summary") {
        prompt = `วิเคราะห์พฤติกรรมการใช้จ่ายของฉัน:
รายรับ/เดือน: €${settings.monthlyIncome}
รายจ่ายประจำ: €${totalMonthly.toFixed(2)}
คงเหลือ/เดือน: €${balance.toFixed(2)}
หนี้ทั้งหมด: ${debts.length} รายการ
สรุปรายจ่ายตามหมวด: ${JSON.stringify(catSummary)}
รายการล่าสุด 10 รายการ: ${JSON.stringify(recentTxns.slice(0,10).map(t=>({name:t.name,amount:t.amount,cat:t.category})))}

สรุปพฤติกรรม บอกจุดแข็ง จุดอ่อน และคำแนะนำ 3 ข้อ ที่ actionable จริงๆ`;
      } else if (type === "forecast") {
        prompt = `วิเคราะห์ทิศทางการเงินของฉัน:
รายรับ/เดือน: €${settings.monthlyIncome}
ค่าใช้จ่ายรวม/เดือน: €${totalMonthly.toFixed(2)}
ยอดคงเหลือ/เดือน: €${balance.toFixed(2)}
หนี้ทั้งหมด: €${totalDebtEUR.toFixed(0)} (${debts.filter(d=>!d.isRolling&&d.remaining>0).length} รายการ)
หมดหนี้ภายใน: ${maxMonths} เดือน
ยอดสะสมสิ้นปี 2026 (projection): €${yearEndSavings.toFixed(0)}
ค่าใช้จ่ายเดือนนี้จนถึงวันนี้: €${thisMonthSpent.toFixed(2)}

คาด forecast ว่า 3 เดือนข้างหน้าจะเป็นอย่างไร บอกความเสี่ยง และแนะนำการออม`;
      } else if (type === "score") {
        prompt = `ให้คะแนนสุขภาพการเงินของฉัน:
Financial Score: ${financialScore.score}/100 (${financialScore.label})
อัตราส่วนหนี้ต่อรายรับ: ${(financialScore.debtRatio*100).toFixed(1)}%
จำนวนหนี้: ${debts.filter(d=>!d.isRolling&&d.remaining>0).length} รายการ
เงินเหลือ/เดือน: €${balance.toFixed(2)}
ออมได้ถ้าหมดหนี้: €${(balance+monthlyDebt).toFixed(0)}/เดือน

อธิบาย score นี้ บอกว่าต้องทำอะไรเพื่อให้ score ดีขึ้น และ milestone ที่ควรทำ`;
      }
      
      const result = await callClaude(prompt);
      setAiResult(result);
    } catch(e) {
      setAiResult("❌ เกิดข้อผิดพลาด: " + e.message);
    }
    setAiLoading(false);
  };

  // Styles
  const S = {
    card: {background:"#161921",border:"1px solid #252a3a",borderRadius:16,padding:16,marginBottom:12},
    cardSm: {background:"#1a1e2a",border:"1px solid #2a3045",borderRadius:12,padding:12},
    inp: {background:"#1a1e2a",border:"1px solid #2a3045",borderRadius:8,padding:"8px 12px",color:"#e8eaf0",fontFamily:"inherit",fontSize:13,width:"100%",outline:"none"},
    inpSm: {background:"#0d1117",border:"1px solid #2563eb55",borderRadius:6,padding:"4px 8px",color:"#93c5fd",fontFamily:"'Space Mono',monospace",fontSize:13,width:80,outline:"none",textAlign:"right"},
    btn: {background:"#3b82f6",color:"white",border:"none",borderRadius:10,padding:"11px 18px",fontFamily:"inherit",fontSize:14,fontWeight:600,cursor:"pointer",width:"100%"},
    btnSm: {background:"#1e2535",color:"#94a3b8",border:"1px solid #2a3045",borderRadius:8,padding:"6px 12px",fontFamily:"inherit",fontSize:12,cursor:"pointer"},
    btnDanger: {background:"#3f0f0f",color:"#fca5a5",border:"1px solid #7f1d1d44",borderRadius:6,padding:"4px 10px",fontFamily:"inherit",fontSize:11,cursor:"pointer"},
    label: {fontSize:10,fontWeight:700,letterSpacing:"0.12em",color:"#64748b",textTransform:"uppercase",marginBottom:8,display:"block"},
    prog: {height:5,background:"#1e2535",borderRadius:3,overflow:"hidden",marginTop:8},
    text: {color:"#cbd5e1"},
    muted: {color:"#64748b"},
    danger: {color:"#f87171"},
    success: {color:"#4ade80"},
    warn: {color:"#fbbf24"},
  };

  if(!loaded) return (
    <div style={{background:"#0a0c12",minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",color:"#475569",fontFamily:"Sarabun,sans-serif",flexDirection:"column",gap:12}}>
      <div style={{fontSize:48}}>💰</div>
      <div style={{color:"#94a3b8"}}>กำลังโหลดข้อมูล...</div>
      <div style={{fontSize:11,color:"#334155"}}>🔥 Firebase Realtime Sync</div>
    </div>
  );

  return (
    <div style={{fontFamily:"'Sarabun',sans-serif",background:"#0a0c12",minHeight:"100vh",color:"#e2e8f0",maxWidth:480,margin:"0 auto",paddingBottom:80}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sarabun:wght@300;400;500;600;700&family=Space+Mono:wght@400;700&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;}
        ::-webkit-scrollbar{width:0;}
        .inp-focus:focus{border-color:#3b82f6!important;outline:none;}
        input,select,textarea{color:#e2e8f0!important;}
        input[type="date"]{color-scheme:dark;}
        input::placeholder{color:#475569!important;}
        .tab-btn{transition:all 0.2s;}
        .tab-btn:hover{opacity:0.85;}
        .modal-bg{position:fixed;inset:0;background:rgba(0,0,0,0.82);backdrop-filter:blur(8px);z-index:100;display:flex;align-items:flex-end;justify-content:center;}
        .modal{background:#111520;border:1px solid #252a3a;border-radius:20px 20px 0 0;padding:24px;width:100%;max-width:480px;max-height:90vh;overflow-y:auto;}
        .row{display:flex;align-items:center;gap:8px;}
        @keyframes slideUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.5}}
        .ai-text{white-space:pre-wrap;line-height:1.8;font-size:13px;color:#cbd5e1;}
        .hist-row{border-bottom:1px solid #1a1f2e;padding:10px 0;display:flex;align-items:center;gap:10;}
        .hist-row:hover{background:#0f1219;}
      `}</style>

      {/* Sync bar */}
      {syncing && <div style={{position:"fixed",top:0,left:0,right:0,height:2,background:"linear-gradient(90deg,#3b82f6,#06b6d4,#3b82f6)",backgroundSize:"200%",zIndex:999,animation:"pulse 1s linear infinite"}}/>}
      {notif && <div style={{position:"fixed",top:16,left:"50%",transform:"translateX(-50%)",background:notif.color,color:"white",padding:"10px 20px",borderRadius:12,fontWeight:600,fontSize:13,zIndex:999,boxShadow:"0 8px 24px rgba(0,0,0,0.5)",whiteSpace:"nowrap",animation:"slideUp 0.3s ease"}}>{notif.msg}</div>}

      {/* Budget Warning Banner */}
      {showBudgetWarning && (
        <div style={{background:balance<0?"#3f0f0f":"#2d1f00",borderBottom:`1px solid ${balance<0?"#7f1d1d":"#78350f"}`,padding:"10px 20px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <span style={{fontSize:12,color:balance<0?"#fca5a5":"#fde68a",fontWeight:600}}>
            {balance<0?"🚨 รายจ่ายเกินรายรับ":"⚠️ เงินเหลือน้อย"} — {balance>=0?`เหลือ ${fmt(balance)}`:`ขาด ${fmt(Math.abs(balance))}`}
          </span>
          <button onClick={()=>setShowBudgetWarning(false)} style={{background:"none",border:"none",color:"#64748b",cursor:"pointer",fontSize:14}}>✕</button>
        </div>
      )}

      {/* HEADER */}
      <div style={{padding:"20px 20px 0",background:"linear-gradient(180deg,#0d1117 0%,#0a0c12 100%)"}}>
        <div style={{marginBottom:16,paddingTop:8,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div>
            <div style={{fontSize:10,color:"#374151",fontWeight:700,letterSpacing:"0.1em",textTransform:"uppercase"}}>Finance Tracker</div>
            <div style={{fontSize:20,fontWeight:700,color:"#f1f5f9"}}>สวัสดี 👋</div>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:8}}>
            <div style={{textAlign:"center",background:"#0f1827",border:"1px solid #1e3a5f",borderRadius:10,padding:"6px 12px"}}>
              <div style={{fontSize:16,fontWeight:700,color:financialScore.color,fontFamily:"'Space Mono',monospace"}}>{financialScore.score}</div>
              <div style={{fontSize:9,color:"#475569"}}>Score {financialScore.grade}</div>
            </div>
            <div style={{fontSize:10,color:"#22c55e",background:"#0a1f0a",border:"1px solid #14532d55",padding:"4px 10px",borderRadius:20}}>🔥 Realtime</div>
          </div>
        </div>

        {/* Hero */}
        <div style={{background:"linear-gradient(135deg,#0f2041,#1565c0,#0288d1)",borderRadius:20,padding:20,marginBottom:12,boxShadow:"0 8px 32px rgba(37,99,235,0.2)",position:"relative",overflow:"hidden"}}>
          <div style={{position:"absolute",top:-30,right:-30,width:120,height:120,background:"rgba(255,255,255,0.04)",borderRadius:"50%"}}/>
          <div style={{position:"absolute",bottom:-20,left:-10,width:80,height:80,background:"rgba(255,255,255,0.03)",borderRadius:"50%"}}/>
          <div style={{fontSize:10,color:"rgba(255,255,255,0.45)",fontWeight:700,letterSpacing:"0.1em",textTransform:"uppercase"}}>รายรับ/เดือน</div>
          <div style={{fontSize:34,fontWeight:700,color:"white",fontFamily:"'Space Mono',monospace",lineHeight:1.2,marginTop:4}}>{fmt(settings.monthlyIncome)}</div>
          <div style={{display:"flex",gap:12,marginTop:14,flexWrap:"wrap"}}>
            {[{l:"รายจ่ายรวม",v:fmt(totalMonthly),c:"#fca5a5"},{l:"คงเหลือ/เดือน",v:(balance>=0?"+":"")+fmt(balance),c:balance>=0?"#86efac":"#fca5a5"},{l:"เก็บได้ปีนี้",v:fmt(yearEndSavings),c:"#fde68a"}].map(s=>(
              <div key={s.l}><div style={{fontSize:9,color:"rgba(255,255,255,0.38)",marginBottom:2}}>{s.l}</div><div style={{fontSize:13,fontWeight:700,color:s.c,fontFamily:"'Space Mono',monospace"}}>{s.v}</div></div>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:12}}>
          {[
            {l:"หนี้ทั้งหมด",v:fmt(totalDebtEUR),c:"#f87171",i:"💸"},
            {l:"จ่าย/เดือน",v:fmt(monthlyDebt),c:"#fb923c",i:"📅"},
            {l:"เดือนนี้ใช้",v:fmt(thisMonthSpent),c:"#a78bfa",i:"🛒"}
          ].map(s=>(
            <div key={s.l} style={{...S.cardSm,textAlign:"center",padding:10}}>
              <div style={{fontSize:16,marginBottom:2}}>{s.i}</div>
              <div style={{fontSize:12,fontWeight:700,color:s.c,fontFamily:"'Space Mono',monospace"}}>{s.v}</div>
              <div style={{fontSize:9,color:"#475569",marginTop:1}}>{s.l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* TABS */}
      <div style={{display:"flex",gap:4,padding:"0 16px",marginBottom:14,overflowX:"auto",scrollbarWidth:"none"}}>
        {[{id:"dashboard",i:"📊",l:"ภาพรวม"},{id:"debts",i:"💳",l:"หนี้สิน"},{id:"expenses",i:"🧾",l:"ค่าจ่าย"},{id:"add",i:"✏️",l:"บันทึก"},{id:"history",i:"📋",l:"ประวัติ"},{id:"report",i:"📄",l:"Report"}].map(t=>(
          <button key={t.id} className="tab-btn" onClick={()=>setActiveTab(t.id)} style={{background:activeTab===t.id?"#3b82f6":"#111520",color:activeTab===t.id?"white":"#64748b",border:`1px solid ${activeTab===t.id?"#3b82f6":"#1e2535"}`,borderRadius:10,padding:"7px 12px",fontSize:11,fontWeight:600,cursor:"pointer",whiteSpace:"nowrap",fontFamily:"inherit",flexShrink:0}}>{t.i} {t.l}</button>
        ))}
      </div>

      <div style={{padding:"0 16px"}}>

        {/* ===== DASHBOARD ===== */}
        {activeTab==="dashboard" && (
          <div>
            {/* Forecast card */}
            <div style={{...S.card,background:"#0f1827",borderColor:"#1e3a5f"}}>
              <span style={S.label}>🔮 Forecast & Snapshot</span>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                <div style={{background:"#0a1520",borderRadius:10,padding:10}}>
                  <div style={{fontSize:9,color:"#475569",marginBottom:4}}>เงินเหลือ/เดือน</div>
                  <div style={{fontSize:18,fontWeight:700,color:balance>=0?"#4ade80":"#f87171",fontFamily:"'Space Mono',monospace"}}>{balance>=0?"+":""}{fmt(balance)}</div>
                  <div style={{fontSize:10,color:"#64748b",marginTop:2}}>หลังหักทุกอย่าง</div>
                </div>
                <div style={{background:"#0a1520",borderRadius:10,padding:10}}>
                  <div style={{fontSize:9,color:"#475569",marginBottom:4}}>Burn Rate/วัน</div>
                  <div style={{fontSize:18,fontWeight:700,color:"#fbbf24",fontFamily:"'Space Mono',monospace"}}>{fmt(dailyBurn)}</div>
                  <div style={{fontSize:10,color:"#64748b",marginTop:2}}>จากข้อมูลจริงเดือนนี้</div>
                </div>
              </div>
              <div style={{marginTop:10,background:"#071220",borderRadius:10,padding:"10px 14px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <span style={{fontSize:12,color:"#94a3b8"}}>💰 หมดหนี้ทั้งหมด</span>
                <span style={{fontSize:13,fontWeight:700,color:"#a78bfa",fontFamily:"'Space Mono',monospace"}}>{debtFreeDate.toLocaleDateString("th-TH",{month:"long",year:"numeric"})}</span>
              </div>
            </div>

            {/* Projection Chart */}
            <div style={S.card}>
              <span style={S.label}>📈 ยอดสะสม พ.ค.–ธ.ค. 2026</span>
              <div style={{display:"flex",gap:4,alignItems:"flex-end",height:80,marginBottom:6}}>
                {projection.map((s,i)=>{
                  const h = Math.max(4,Math.abs(s.cumulative)/maxBar*68);
                  return (
                    <div key={i} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:2}}>
                      <div style={{fontSize:8,color:s.cumulative>=0?"#4ade80":"#f87171",fontFamily:"'Space Mono',monospace",textAlign:"center",lineHeight:1}}>{s.cumulative>=0?"+":""}{Math.round(s.cumulative/100)*100}</div>
                      <div style={{width:"100%",height:h,background:s.cumulative>=0?"linear-gradient(180deg,#22c55e88,#16a34a)":"linear-gradient(180deg,#ef444488,#dc2626)",borderRadius:"4px 4px 0 0",border:`1px solid ${s.cumulative>=0?"#22c55e44":"#ef444444"}`}}/>
                      <div style={{fontSize:8,color:"#374151"}}>{s.month}</div>
                    </div>
                  );
                })}
              </div>
              <div style={{background:"#0d1520",borderRadius:8,padding:"8px 12px",display:"flex",justifyContent:"space-between",fontSize:12}}>
                <span style={{color:"#64748b"}}>สิ้นปี 2026</span>
                <span style={{color:yearEndSavings>=0?"#fde68a":"#f87171",fontWeight:700,fontFamily:"'Space Mono',monospace"}}>{yearEndSavings>=0?"+":""}{fmt(yearEndSavings)}</span>
              </div>
            </div>

            {/* Timeline */}
            <div style={S.card}>
              <span style={S.label}>🗓️ Timeline หมดหนี้</span>
              {debts.filter(d=>!d.isRolling&&d.remaining>0).sort((a,b)=>a.remaining-b.remaining).slice(0,6).map(d=>{
                const pct=Math.round(((d.totalInstallments-d.remaining)/Math.max(d.totalInstallments,1))*100);
                const fin=new Date(2026,4); fin.setMonth(fin.getMonth()+d.remaining);
                return (
                  <div key={d.id} style={{marginBottom:12}}>
                    <div style={{display:"flex",justifyContent:"space-between",fontSize:12,marginBottom:3}}>
                      <span style={{color:"#cbd5e1"}}>{d.icon} {d.name}</span>
                      <span style={{color:"#64748b",fontSize:11}}>{MONTHS[fin.getMonth()]} {fin.getFullYear()}</span>
                    </div>
                    <div style={S.prog}><div style={{height:"100%",borderRadius:3,width:`${pct}%`,background:pct>=75?"#22c55e":pct>=40?"#f59e0b":"#3b82f6"}}/></div>
                    <div style={{fontSize:9,color:"#475569",marginTop:2}}>{pct}% ชำระแล้ว • เหลือ {d.remaining} งวด</div>
                  </div>
                );
              })}
            </div>

            {/* Financial score */}
            <div style={{...S.card,background:"#0d1520",borderColor:"#1e3a5f"}}>
              <span style={S.label}>🏆 Financial Health Score</span>
              <div style={{display:"flex",alignItems:"center",gap:16,marginBottom:12}}>
                <div style={{width:72,height:72,borderRadius:"50%",border:`4px solid ${financialScore.color}`,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                  <div style={{fontSize:22,fontWeight:700,color:financialScore.color,fontFamily:"'Space Mono',monospace",lineHeight:1}}>{financialScore.score}</div>
                  <div style={{fontSize:10,color:financialScore.color,fontWeight:700}}>{financialScore.grade}</div>
                </div>
                <div>
                  <div style={{fontSize:15,fontWeight:700,color:financialScore.color,marginBottom:4}}>{financialScore.label}</div>
                  <div style={{fontSize:12,color:"#64748b",lineHeight:1.6}}>
                    สัดส่วนหนี้: <span style={{color:"#cbd5e1"}}>{(financialScore.debtRatio*100).toFixed(1)}%</span><br/>
                    เงินเหลือ/เดือน: <span style={{color:financialScore.balance>=0?"#4ade80":"#f87171"}}>{fmt(financialScore.balance)}</span>
                  </div>
                </div>
              </div>
              <button style={{...S.btn,background:"#1e3a5f",fontSize:12,padding:"8px"}} onClick={()=>{ setActiveTab("ai"); runAI("score"); }}>🤖 วิเคราะห์ละเอียดด้วย AI →</button>
            </div>

            {/* Settings */}
            <div style={S.card}>
              <span style={S.label}>⚙️ ตั้งค่า</span>
              {[
                {l:"รายรับ/เดือน (€)",key:"monthlyIncome",w:100},
                {l:"อัตราแลกเปลี่ยน (฿/€)",key:"exchangeRate",w:70},
                {l:"เตือนเมื่อเหลือน้อยกว่า (€)",key:"budgetWarning",w:80}
              ].map(f=>(
                <div key={f.key} style={{display:"flex",gap:8,alignItems:"center",marginBottom:8}}>
                  <span style={{fontSize:12,color:"#64748b",flex:1}}>{f.l}</span>
                  <input className="inp-focus" style={{...S.inpSm,width:f.w}} value={settings[f.key]} onChange={e=>saveSettings({...settings,[f.key]:parseFloat(e.target.value)||0})}/>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ===== AI TAB ===== */}
        {/* ===== DEBTS ===== */}
        {activeTab==="debts" && (
          <div>
            <div style={{...S.card,background:"#0a1f0a",borderColor:"#14532d55",padding:"12px 14px",marginBottom:12}}>
              <div style={{display:"flex",justifyContent:"space-between",fontSize:12}}>
                <span style={{color:"#64748b"}}>หนี้ EUR รวม</span><span style={{color:"#f87171",fontFamily:"'Space Mono',monospace",fontWeight:700}}>{fmt(debts.filter(d=>d.category==="eur").reduce((s,d)=>s+d.amount,0))}/เดือน</span>
              </div>
              <div style={{display:"flex",justifyContent:"space-between",fontSize:12,marginTop:4}}>
                <span style={{color:"#64748b"}}>หนี้ไทย รวม</span><span style={{color:"#fb923c",fontFamily:"'Space Mono',monospace",fontWeight:700}}>{fmtTHB(debts.filter(d=>d.category==="thai").reduce((s,d)=>s+(d.amountTHB||d.amount*settings.exchangeRate),0))}/เดือน</span>
              </div>
            </div>

            <span style={S.label}>หนี้ EUR (NL)</span>
            {debts.filter(d=>d.category==="eur").map(d=>(
              <div key={d.id} style={{...S.card,padding:14}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
                  <div style={{display:"flex",gap:10,alignItems:"center",flex:1}}>
                    <span style={{fontSize:20}}>{d.icon}</span>
                    <div style={{flex:1}}>
                      <input className="inp-focus" style={{marginBottom:4,fontSize:13,fontWeight:600,background:"transparent",border:"none",borderBottom:"1px solid #1e2535",borderRadius:0,padding:"2px 0",color:"#e2e8f0",width:"100%"}} value={d.name} onChange={e=>updateDebt(d.id,"name",e.target.value)}/>
                      <div style={{fontSize:10,color:"#475569"}}>{d.isRolling?"จ่ายยอดเต็มสิ้นเดือน":`เหลือ ${d.remaining} งวด`}</div>
                    </div>
                  </div>
                  <div style={{textAlign:"right"}}>
                    <input style={S.inpSm} value={d.amount.toFixed(2)} onChange={e=>updateDebt(d.id,"amount",e.target.value)}/>
                    <div style={{fontSize:9,color:"#374151"}}>€/เดือน</div>
                  </div>
                </div>
                {!d.isRolling && (
                  <div style={{display:"flex",gap:8,marginTop:8,alignItems:"center"}}>
                    <span style={{fontSize:11,color:"#475569"}}>เหลือ</span>
                    <input style={{...S.inpSm,width:55}} value={d.remaining} onChange={e=>updateDebt(d.id,"remaining",e.target.value)}/>
                    <span style={{fontSize:11,color:"#475569"}}>/</span>
                    <input style={{...S.inpSm,width:55}} value={d.totalInstallments} onChange={e=>updateDebt(d.id,"totalInstallments",e.target.value)}/>
                    <span style={{fontSize:11,color:"#475569"}}>งวด</span>
                    <button style={S.btnDanger} onClick={()=>removeDebt(d.id)}>🗑️</button>
                  </div>
                )}
                {d.isRolling && <button style={{...S.btnDanger,marginTop:8}} onClick={()=>removeDebt(d.id)}>🗑️ ลบ</button>}
                {!d.isRolling && <div style={S.prog}><div style={{height:"100%",borderRadius:3,width:`${Math.round(((d.totalInstallments-d.remaining)/Math.max(d.totalInstallments,1))*100)}%`,background:"#3b82f6"}}/></div>}
              </div>
            ))}

            <span style={{...S.label,marginTop:8,display:"block"}}>หนี้ไทย (THB)</span>
            <button style={{...S.btn,marginBottom:12,background:"#92400e",color:"#fde68a"}} onClick={()=>setShowTransfer(true)}>🇹🇭 โอนเงินกลับไทย (Auto-Split)</button>
            {debts.filter(d=>d.category==="thai").map(d=>(
              <div key={d.id} style={{...S.card,padding:14}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
                  <div style={{display:"flex",gap:10,alignItems:"center",flex:1}}>
                    <span style={{fontSize:20}}>{d.icon}</span>
                    <div style={{flex:1}}>
                      <input className="inp-focus" style={{marginBottom:4,fontSize:13,fontWeight:600,background:"transparent",border:"none",borderBottom:"1px solid #1e2535",borderRadius:0,padding:"2px 0",color:"#e2e8f0",width:"100%"}} value={d.name} onChange={e=>updateDebt(d.id,"name",e.target.value)}/>
                      <div style={{fontSize:10,color:"#475569"}}>เหลือ {d.remaining} งวด</div>
                    </div>
                  </div>
                  <div style={{textAlign:"right"}}>
                    <input style={{...S.inpSm,color:"#fb923c"}} value={d.amountTHB||Math.round(d.amount*settings.exchangeRate)} onChange={e=>updateDebt(d.id,"amountTHB",e.target.value)}/>
                    <div style={{fontSize:10,color:"#475569"}}>฿/เดือน</div>
                    <div style={{fontSize:9,color:"#374151"}}>{fmt(d.amount)}</div>
                  </div>
                </div>
                <div style={{display:"flex",gap:8,marginTop:8,alignItems:"center"}}>
                  <span style={{fontSize:11,color:"#475569"}}>เหลือ</span>
                  <input style={{...S.inpSm,width:55}} value={d.remaining} onChange={e=>updateDebt(d.id,"remaining",e.target.value)}/>
                  <span style={{fontSize:11,color:"#475569"}}>/</span>
                  <input style={{...S.inpSm,width:55}} value={d.totalInstallments} onChange={e=>updateDebt(d.id,"totalInstallments",e.target.value)}/>
                  <span style={{fontSize:11,color:"#475569"}}>งวด</span>
                  <button style={S.btnDanger} onClick={()=>removeDebt(d.id)}>🗑️</button>
                </div>
                <div style={S.prog}><div style={{height:"100%",borderRadius:3,width:`${Math.round(((d.totalInstallments-d.remaining)/Math.max(d.totalInstallments,1))*100)}%`,background:"#f59e0b"}}/></div>
              </div>
            ))}

            <button style={{...S.btn,background:"#14532d",color:"#86efac",marginTop:4}} onClick={()=>setShowAddDebt(true)}>➕ เพิ่มหนี้ใหม่</button>
          </div>
        )}

        {/* ===== EXPENSES ===== */}
        {activeTab==="expenses" && (
          <div>
            <span style={S.label}>ค่าใช้จ่ายประจำ</span>
            {expenses.map(e=>(
              <div key={e.id} style={{...S.card,padding:"12px 14px"}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <div style={{display:"flex",gap:8,alignItems:"center",flex:1}}>
                    <span style={{fontSize:18}}>{e.icon}</span>
                    <input className="inp-focus" style={{background:"transparent",border:"none",borderBottom:"1px solid #1e2535",borderRadius:0,padding:"2px 0",fontSize:13,fontWeight:500,color:"#e2e8f0",width:"100%"}} value={e.name} onChange={ev=>updateExpense(e.id,"name",ev.target.value)}/>
                  </div>
                  <div style={{display:"flex",gap:6,alignItems:"center",marginLeft:8}}>
                    <input style={{...S.inpSm,color:"#e2e8f0",background:"#1a1e2a",border:"1px solid #252a3a",width:90}} value={e.amountTHB||e.amount.toFixed(2)} onChange={ev=>updateExpense(e.id,e.amountTHB?"amountTHB":"amount",ev.target.value)}/>
                    <span style={{fontSize:10,color:"#475569"}}>{e.amountTHB?"฿":"€"}</span>
                    <button style={S.btnDanger} onClick={()=>removeExpense(e.id)}>🗑️</button>
                  </div>
                </div>
              </div>
            ))}
            <button style={{...S.btn,background:"#14532d",color:"#86efac",marginTop:4}} onClick={()=>setShowAddExpense(true)}>➕ เพิ่มค่าใช้จ่ายใหม่</button>
            <div style={{...S.card,marginTop:12,background:"#0a1520",borderColor:"#1e3a5f"}}>
              <div style={{display:"flex",justifyContent:"space-between",fontSize:14}}>
                <span style={{color:"#64748b"}}>รวมค่าใช้จ่ายประจำ</span>
                <span style={{fontFamily:"'Space Mono',monospace",color:"#fb923c",fontWeight:700}}>{fmt(monthlyFixed)}</span>
              </div>
            </div>
          </div>
        )}

        {/* ===== ADD ===== */}
        {activeTab==="add" && (
          <div>
            <div style={S.card}>
              <span style={S.label}>✏️ บันทึกรายการ</span>
              <div style={{display:"flex",flexDirection:"column",gap:10}}>
                <input className="inp-focus" style={S.inp} placeholder="ชื่อรายการ..." value={qName} onChange={e=>setQName(e.target.value)}/>
                <div style={{display:"flex",gap:8,alignItems:"center"}}>
                  <input className="inp-focus" style={{...S.inp,flex:1}} type="number" placeholder={qIsThb?"ยอด (บาท)":"ยอด (EUR)"} value={qAmt} onChange={e=>setQAmt(e.target.value)}/>
                  <button onClick={()=>setQIsThb(!qIsThb)} style={{...S.btnSm,flexShrink:0,background:qIsThb?"#78350f":"#1e2535",color:qIsThb?"#fde68a":"#94a3b8",whiteSpace:"nowrap"}}>
                    {qIsThb?"฿ บาท":"€ EUR"}
                  </button>
                </div>
                {qIsThb && qAmt && <div style={{fontSize:11,color:"#64748b",textAlign:"right"}}>≈ {fmt(parseFloat(qAmt)/settings.exchangeRate)}</div>}
                <div style={{display:"flex",gap:8,alignItems:"center"}}>
                  <span style={{fontSize:12,color:"#64748b",whiteSpace:"nowrap"}}>📅</span>
                  <input className="inp-focus" style={S.inp} type="date" value={qDate} onChange={e=>setQDate(e.target.value)}/>
                </div>
                <div style={{display:"flex",gap:8}}>
                  <select className="inp-focus" style={{...S.inp,flex:1}} value={qCat} onChange={e=>setQCat(e.target.value)}>
                    {categories.map(c=><option key={c} style={{background:"#1a1e2a"}}>{c}</option>)}
                  </select>
                  <button style={{...S.btnSm,flexShrink:0}} onClick={()=>setShowAddCat(true)}>+ หมวด</button>
                </div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr",gap:6}}>
                  {["Debit","Amex","Shopee","Income"].map(m=>(
                    <button key={m} onClick={()=>setQMethod(m)} style={{background:qMethod===m?"#1e3a5f":"#111520",color:qMethod===m?"#93c5fd":"#64748b",border:`1px solid ${qMethod===m?"#3b82f6":"#1e2535"}`,borderRadius:8,padding:"8px 4px",fontSize:11,cursor:"pointer",fontFamily:"inherit"}}>{m}</button>
                  ))}
                </div>
                <div style={{fontSize:10,color:"#374151",background:"#0d1117",borderRadius:8,padding:"6px 10px"}}>
                  💡 หมวดหนี้ (เช่น "Bondora", "หนี้บ้านไทย ABN") จะลดงวดอัตโนมัติ
                </div>
                <button style={S.btn} onClick={addQuickEntry}>💾 บันทึก</button>
              </div>
            </div>

            <div style={{...S.card,background:"#1a110a",borderColor:"#78350f55"}}>
              <span style={{...S.label,color:"#f59e0b"}}>🔔 รายการประจำวันที่ 27</span>
              {[{n:"เงินเดือน Greenfood",v:`+${fmt(settings.monthlyIncome)}`,c:"#4ade80"},{n:"หนี้บ้านไทย ABN",v:`-${fmt(260)}`,c:"#f87171"},{n:"โอนหนี้ไทย",v:`~${fmtTHB(debts.filter(d=>d.category==="thai"&&d.remaining>0).reduce((s,d)=>s+(d.amountTHB||d.amount*settings.exchangeRate),0))}`,c:"#fbbf24"},{n:"ประกันสุขภาพ VGZ",v:`-${fmt(149.9)}`,c:"#f87171"}].map((item,i)=>(
                <div key={i} style={{display:"flex",justifyContent:"space-between",padding:"7px 0",borderBottom:"1px solid #1f1208",fontSize:12}}>
                  <span style={{color:"#94a3b8"}}>{item.n}</span><span style={{color:item.c,fontFamily:"'Space Mono',monospace",fontWeight:700}}>{item.v}</span>
                </div>
              ))}
              <button style={{...S.btn,marginTop:12,background:"#92400e",color:"#fde68a"}} onClick={()=>{
                const t=today();
                const newTxns = [{id:uid(),date:t,name:"เงินเดือน Greenfood",category:"รายรับ",amount:settings.monthlyIncome,method:"Income"},{id:uid(),date:t,name:"หนี้บ้านไทย ABN",category:"หนี้บ้านไทย ABN",amount:-260,method:"Debit"},{id:uid(),date:t,name:"ประกันสุขภาพ VGZ",category:"ประกัน",amount:-149.9,method:"Debit"},...transactions];
                // Reduce ABN home debt
                const newDebts = debts.map(d => d.id==="abn_home" && d.remaining>0 ? {...d,remaining:d.remaining-1} : d);
                setTxnsState(newTxns); setDebtsState(newDebts);
                saveAll(newDebts, expenses, newTxns, settings, categories);
                toast("✅ บันทึกรายการประจำเดือนแล้ว!");
              }}>✅ ยืนยันรายการประจำเดือน</button>
            </div>
            <button style={{...S.btn,background:"#4c1d95",color:"#c4b5fd",marginTop:8}} onClick={()=>setShowTransfer(true)}>🇹🇭 โอนเงินกลับไทย (Auto-Split)</button>
          </div>
        )}

        {/* ===== HISTORY ===== */}
        {activeTab==="history" && (
          <div>
            {/* Search & Filter */}
            <div style={{...S.card,padding:"12px 14px",marginBottom:12}}>
              <input className="inp-focus" style={{...S.inp,marginBottom:8}} placeholder="🔍 ค้นหาชื่อ หรือ หมวดหมู่..." value={histSearch} onChange={e=>{setHistSearch(e.target.value);setHistPage(1);}}/>
              <div style={{display:"flex",gap:6}}>
                <select className="inp-focus" style={{...S.inp,flex:1,fontSize:12}} value={histMonth} onChange={e=>{setHistMonth(e.target.value);setHistPage(1);}}>
                  <option value="">ทุกเดือน</option>
                  {MONTHS.map((m,i)=><option key={i} value={i} style={{background:"#1a1e2a"}}>{m}</option>)}
                </select>
                <select className="inp-focus" style={{...S.inp,width:90,fontSize:12}} value={histYear} onChange={e=>{setHistYear(e.target.value);setHistPage(1);}}>
                  <option value="">ทุกปี</option>
                  {[2025,2026,2027].map(y=><option key={y} value={y} style={{background:"#1a1e2a"}}>{y}</option>)}
                </select>
                {(histSearch||histMonth||histYear) && <button style={S.btnSm} onClick={()=>{setHistSearch("");setHistMonth("");setHistYear("");setHistPage(1);}}>✕</button>}
              </div>
              <div style={{fontSize:11,color:"#374151",marginTop:6}}>พบ {filteredTxns.length} รายการ</div>
            </div>

            {pagedTxns.map((tx,i)=>(
              <div key={tx.id||i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 0",borderBottom:"1px solid #111827"}}>
                <div style={{display:"flex",gap:10,alignItems:"center",flex:1}}>
                  <div style={{width:34,height:34,borderRadius:10,display:"flex",alignItems:"center",justifyContent:"center",fontSize:15,background:tx.amount>0?"#052e0a":"#1f0808",flexShrink:0,border:`1px solid ${tx.amount>0?"#14532d44":"#7f1d1d33"}`}}>
                    {tx.amount>0?"💵":tx.category?.includes("หนี้")?"💸":"🛒"}
                  </div>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontSize:13,fontWeight:500,color:"#cbd5e1",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{tx.name}</div>
                    <div style={{fontSize:10,color:"#374151"}}>{tx.date} · <span style={{color:"#475569"}}>{tx.category}</span></div>
                  </div>
                </div>
                <div style={{display:"flex",gap:6,alignItems:"center",flexShrink:0}}>
                  <div style={{textAlign:"right"}}>
                    <div style={{fontSize:13,fontWeight:700,fontFamily:"'Space Mono',monospace",color:tx.amount>0?"#4ade80":"#f87171"}}>{tx.amount>0?"+":""}{fmt(tx.amount)}</div>
                  </div>
                  <button style={{...S.btnSm,padding:"4px 8px",fontSize:11}} onClick={()=>setEditingTx({...tx})}>✏️</button>
                  <button style={S.btnDanger} onClick={()=>deleteTx(tx.id)}>🗑️</button>
                </div>
              </div>
            ))}

            {/* Pagination */}
            {totalPages > 1 && (
              <div style={{display:"flex",justifyContent:"center",gap:6,marginTop:16,flexWrap:"wrap"}}>
                <button style={S.btnSm} onClick={()=>setHistPage(p=>Math.max(1,p-1))} disabled={histPage===1}>◀</button>
                {Array.from({length:totalPages},(_, i)=>i+1).filter(p=>p===1||p===totalPages||Math.abs(p-histPage)<=1).map((p,idx,arr)=>(
                  <>
                    {idx>0 && arr[idx-1] !== p-1 && <span style={{color:"#374151",alignSelf:"center"}}>…</span>}
                    <button key={p} style={{...S.btnSm,background:p===histPage?"#3b82f6":"#111520",color:p===histPage?"white":"#94a3b8",minWidth:32}} onClick={()=>setHistPage(p)}>{p}</button>
                  </>
                ))}
                <button style={S.btnSm} onClick={()=>setHistPage(p=>Math.min(totalPages,p+1))} disabled={histPage===totalPages}>▶</button>
              </div>
            )}
          </div>
        )}

        {/* ===== REPORT ===== */}
        {activeTab==="report" && (
          <div>
            <div style={{...S.card,padding:"12px 14px"}}>
              <div style={{display:"flex",gap:8,alignItems:"center"}}>
                <select className="inp-focus" style={{...S.inp,flex:1}} value={reportMonth} onChange={e=>setReportMonth(parseInt(e.target.value))}>
                  {MONTHS.map((m,i)=><option key={i} value={i} style={{background:"#1a1e2a"}}>{m}</option>)}
                </select>
                <select className="inp-focus" style={{...S.inp,width:90}} value={reportYear} onChange={e=>setReportYear(parseInt(e.target.value))}>
                  {[2025,2026,2027].map(y=><option key={y} value={y} style={{background:"#1a1e2a"}}>{y}</option>)}
                </select>
              </div>
            </div>

            <div style={{background:"linear-gradient(135deg,#0f2041,#1565c0)",borderRadius:16,padding:"16px 20px",marginBottom:12}}>
              <div style={{fontSize:11,color:"rgba(255,255,255,0.4)",fontWeight:700,letterSpacing:"0.1em"}}>MONTHLY REPORT</div>
              <div style={{fontSize:20,fontWeight:700,color:"white",marginTop:4}}>{MONTHS[reportMonth]} {reportYear}</div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10,marginTop:12}}>
                {[["รายรับ",reportInc,"#86efac"],["รายจ่าย",reportExp,"#fca5a5"],["คงเหลือ",reportBal,reportBal>=0?"#86efac":"#fca5a5"]].map(([l,v,c])=>(
                  <div key={l} style={{textAlign:"center",background:"rgba(255,255,255,0.07)",borderRadius:10,padding:"10px 6px"}}>
                    <div style={{fontSize:9,color:"rgba(255,255,255,0.4)",marginBottom:4}}>{l}</div>
                    <div style={{fontSize:13,fontWeight:700,color:c,fontFamily:"'Space Mono',monospace"}}>{(v>0?"+":"")+fmt(v)}</div>
                  </div>
                ))}
              </div>
              <div style={{marginTop:12,background:"rgba(0,0,0,0.2)",borderRadius:10,padding:"8px 12px",display:"flex",justifyContent:"space-between",fontSize:12}}>
                <span style={{color:"rgba(255,255,255,0.4)"}}>ยอดสะสม</span>
                <span style={{fontFamily:"'Space Mono',monospace",fontWeight:700,color:monthlyBals[reportMonth]?.cumulative>=0?"#86efac":"#fca5a5"}}>
                  {(monthlyBals[reportMonth]?.cumulative>=0?"+":"")+fmt(monthlyBals[reportMonth]?.cumulative||0)}
                </span>
              </div>
            </div>

            <div style={S.card}>
              <span style={S.label}>รายจ่ายตามหมวด</span>
              {Object.entries(reportByCat).sort((a,b)=>b[1]-a[1]).map(([cat,amt])=>{
                const pct=Math.round((amt/Math.max(Math.abs(reportExp),1))*100);
                return (
                  <div key={cat} style={{marginBottom:10}}>
                    <div style={{display:"flex",justifyContent:"space-between",fontSize:12,marginBottom:3}}>
                      <span style={{color:"#94a3b8"}}>{cat}</span>
                      <span style={{fontFamily:"'Space Mono',monospace",color:"#f87171",fontSize:11}}>{fmt(amt)} ({pct}%)</span>
                    </div>
                    <div style={S.prog}><div style={{height:"100%",borderRadius:3,width:`${pct}%`,background:"#3b82f6"}}/></div>
                  </div>
                );
              })}
              {Object.keys(reportByCat).length===0&&<div style={{color:"#374151",fontSize:12,textAlign:"center",padding:"16px 0"}}>ยังไม่มีข้อมูลเดือนนี้</div>}
            </div>

            <div style={S.card}>
              <span style={S.label}>สรุปรายปี {reportYear}</span>
              <div style={{display:"flex",justifyContent:"space-between",fontSize:9,color:"#374151",marginBottom:6,paddingBottom:4,borderBottom:"1px solid #111827"}}>
                <span style={{width:36}}>เดือน</span>
                <span>รายรับ</span><span>รายจ่าย</span><span>เดือนนี้</span><span style={{color:"#fde68a"}}>สะสม</span>
              </div>
              {MONTHS.map((m,mi)=>{
                const txs=transactions.filter(t=>{const d=new Date(t.date);return d.getMonth()===mi&&d.getFullYear()===reportYear;});
                const inc=txs.filter(t=>t.amount>0).reduce((s,t)=>s+t.amount,0);
                const exp=txs.filter(t=>t.amount<0).reduce((s,t)=>s+t.amount,0);
                const bal=inc+exp;
                const cum=monthlyBals[mi]?.cumulative||0;
                const hasData=txs.length>0;
                return (
                  <div key={m} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"6px 0",borderBottom:"1px solid #0f1219",fontSize:11,opacity:hasData?1:0.3}}>
                    <span style={{color:"#64748b",width:36}}>{m}</span>
                    <span style={{color:"#4ade80",fontFamily:"'Space Mono',monospace",fontSize:10}}>{hasData?fmt(inc):"-"}</span>
                    <span style={{color:"#f87171",fontFamily:"'Space Mono',monospace",fontSize:10}}>{hasData?fmt(exp):"-"}</span>
                    <span style={{color:bal>=0?"#86efac":"#fca5a5",fontFamily:"'Space Mono',monospace",fontSize:10}}>{hasData?(bal>=0?"+":"")+fmt(bal):"-"}</span>
                    <span style={{color:cum>=0?"#fde68a":"#f87171",fontFamily:"'Space Mono',monospace",fontSize:10,fontWeight:700}}>{hasData?(cum>=0?"+":"")+fmt(cum):"-"}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* ===== MODALS ===== */}

      {/* Transfer */}
      {showTransfer&&(
        <div className="modal-bg" onClick={e=>e.target===e.currentTarget&&(setShowTransfer(false),setTransferSplit(null))}>
          <div className="modal">
            <div style={{fontSize:17,fontWeight:700,marginBottom:4,color:"#e2e8f0"}}>🇹🇭 โอนเงินกลับไทย</div>
            <div style={{fontSize:11,color:"#64748b",marginBottom:12}}>ระบบแบ่งจ่ายหนี้ไทย + ลดงวดอัตโนมัติ</div>
            <div style={{display:"flex",gap:8,alignItems:"center",marginBottom:10}}>
              <span style={{fontSize:12,color:"#64748b",whiteSpace:"nowrap"}}>📅</span>
              <input className="inp-focus" style={S.inp} type="date" value={transferDate} onChange={e=>setTransferDate(e.target.value)}/>
            </div>
            <div style={{display:"flex",gap:8,marginBottom:12}}>
              <input className="inp-focus" style={S.inp} type="number" placeholder="ยอดโอน (บาท)" value={transferAmt} onChange={e=>setTransferAmt(e.target.value)}/>
              <button style={{...S.btnSm,whiteSpace:"nowrap"}} onClick={handleThaiTransfer}>คำนวณ</button>
            </div>
            {/* Quick THB amounts */}
            <div style={{display:"flex",gap:6,marginBottom:12,flexWrap:"wrap"}}>
              {[20000,25000,30000].map(v=>(
                <button key={v} style={{...S.btnSm,fontSize:11}} onClick={()=>setTransferAmt(v.toString())}>฿{v.toLocaleString()}</button>
              ))}
            </div>
            {transferSplit&&(
              <div>
                <div style={{fontSize:11,color:"#64748b",marginBottom:8}}>จะลดงวด {transferSplit.split.length} รายการ:</div>
                {transferSplit.split.map(d=>(
                  <div key={d.id} style={{display:"flex",justifyContent:"space-between",padding:"7px 0",borderBottom:"1px solid #1a1f2e",fontSize:13}}>
                    <span style={{color:"#94a3b8"}}>{d.icon} {d.name}</span>
                    <span style={{color:"#f87171",fontFamily:"'Space Mono',monospace"}}>฿{d.paidTHB.toLocaleString()}</span>
                  </div>
                ))}
                {transferSplit.remaining>0&&<div style={{display:"flex",justifyContent:"space-between",padding:"7px 0",fontSize:13,color:"#86efac"}}><span>👩 ให้แม่</span><span>฿{Math.round(transferSplit.remaining).toLocaleString()}</span></div>}
                <button style={{...S.btn,marginTop:12}} onClick={confirmTransfer}>✅ ยืนยัน + ลดงวดอัตโนมัติ</button>
              </div>
            )}
            <button onClick={()=>{setShowTransfer(false);setTransferSplit(null);}} style={{width:"100%",marginTop:8,background:"none",border:"none",color:"#475569",fontSize:13,cursor:"pointer",fontFamily:"inherit",padding:8}}>ยกเลิก</button>
          </div>
        </div>
      )}

      {/* Add Debt */}
      {showAddDebt&&(
        <div className="modal-bg" onClick={e=>e.target===e.currentTarget&&setShowAddDebt(false)}>
          <div className="modal">
            <div style={{fontSize:17,fontWeight:700,marginBottom:16,color:"#e2e8f0"}}>➕ เพิ่มหนี้ใหม่</div>
            <div style={{display:"flex",flexDirection:"column",gap:10}}>
              <input className="inp-focus" style={S.inp} placeholder="ชื่อหนี้" value={newDebt.name} onChange={e=>setNewDebt({...newDebt,name:e.target.value})}/>
              <select className="inp-focus" style={S.inp} value={newDebt.currency} onChange={e=>setNewDebt({...newDebt,currency:e.target.value,category:e.target.value==="THB"?"thai":"eur"})}>
                <option value="EUR" style={{background:"#1a1e2a"}}>EUR (หนี้ NL)</option>
                <option value="THB" style={{background:"#1a1e2a"}}>THB (หนี้ไทย)</option>
              </select>
              {newDebt.currency==="EUR"
                ?<input className="inp-focus" style={S.inp} type="number" placeholder="ยอด/เดือน (EUR)" value={newDebt.amount} onChange={e=>setNewDebt({...newDebt,amount:e.target.value})}/>
                :<input className="inp-focus" style={S.inp} type="number" placeholder="ยอด/เดือน (บาท)" value={newDebt.amountTHB} onChange={e=>setNewDebt({...newDebt,amountTHB:e.target.value,amount:parseFloat(e.target.value)/settings.exchangeRate})}/>}
              <div style={{display:"flex",gap:8}}>
                <input className="inp-focus" style={S.inp} type="number" placeholder="งวดทั้งหมด" value={newDebt.totalInstallments} onChange={e=>setNewDebt({...newDebt,totalInstallments:e.target.value})}/>
                <input className="inp-focus" style={S.inp} type="number" placeholder="งวดที่เหลือ" value={newDebt.remaining} onChange={e=>setNewDebt({...newDebt,remaining:e.target.value})}/>
              </div>
              <label style={{display:"flex",gap:8,alignItems:"center",fontSize:13,color:"#94a3b8",cursor:"pointer"}}>
                <input type="checkbox" checked={newDebt.isRolling} onChange={e=>setNewDebt({...newDebt,isRolling:e.target.checked})}/> จ่ายยอดเต็มสิ้นเดือน (เช่น Amex)
              </label>
              <button style={S.btn} onClick={addDebt}>💾 เพิ่มหนี้</button>
            </div>
            <button onClick={()=>setShowAddDebt(false)} style={{width:"100%",marginTop:8,background:"none",border:"none",color:"#475569",fontSize:13,cursor:"pointer",fontFamily:"inherit",padding:8}}>ยกเลิก</button>
          </div>
        </div>
      )}

      {/* Add Expense */}
      {showAddExpense&&(
        <div className="modal-bg" onClick={e=>e.target===e.currentTarget&&setShowAddExpense(false)}>
          <div className="modal">
            <div style={{fontSize:17,fontWeight:700,marginBottom:16,color:"#e2e8f0"}}>➕ เพิ่มค่าใช้จ่ายประจำ</div>
            <div style={{display:"flex",flexDirection:"column",gap:10}}>
              <input className="inp-focus" style={S.inp} placeholder="ชื่อรายการ" value={newExpense.name} onChange={e=>setNewExpense({...newExpense,name:e.target.value})}/>
              <label style={{display:"flex",gap:8,alignItems:"center",fontSize:13,color:"#94a3b8",cursor:"pointer"}}>
                <input type="checkbox" checked={newExpense.isTHB} onChange={e=>setNewExpense({...newExpense,isTHB:e.target.checked})}/> เป็นสกุลเงินบาท (THB)
              </label>
              {newExpense.isTHB
                ?<input className="inp-focus" style={S.inp} type="number" placeholder="ยอด (บาท)" value={newExpense.amountTHB} onChange={e=>setNewExpense({...newExpense,amountTHB:e.target.value})}/>
                :<input className="inp-focus" style={S.inp} type="number" placeholder="ยอด (EUR)" value={newExpense.amount} onChange={e=>setNewExpense({...newExpense,amount:e.target.value})}/>}
              <button style={S.btn} onClick={addExpense}>💾 เพิ่ม</button>
            </div>
            <button onClick={()=>setShowAddExpense(false)} style={{width:"100%",marginTop:8,background:"none",border:"none",color:"#475569",fontSize:13,cursor:"pointer",fontFamily:"inherit",padding:8}}>ยกเลิก</button>
          </div>
        </div>
      )}

      {/* Add Category */}
      {showAddCat&&(
        <div className="modal-bg" onClick={e=>e.target===e.currentTarget&&setShowAddCat(false)}>
          <div className="modal">
            <div style={{fontSize:17,fontWeight:700,marginBottom:16,color:"#e2e8f0"}}>➕ จัดการหมวดหมู่</div>
            <div style={{display:"flex",gap:8,marginBottom:16}}>
              <input className="inp-focus" style={S.inp} placeholder="ชื่อหมวดใหม่..." value={newCat} onChange={e=>setNewCat(e.target.value)}/>
              <button style={{...S.btn,width:"auto",padding:"8px 16px"}} onClick={addCategory}>เพิ่ม</button>
            </div>
            <div style={{maxHeight:300,overflowY:"auto"}}>
              {categories.map(c=>(
                <div key={c} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"7px 0",borderBottom:"1px solid #111827",fontSize:13}}>
                  <span style={{color:"#94a3b8"}}>{c}</span>
                  <button style={S.btnDanger} onClick={()=>saveCats(categories.filter(x=>x!==c))}>🗑️</button>
                </div>
              ))}
            </div>
            <button onClick={()=>setShowAddCat(false)} style={{width:"100%",marginTop:12,background:"none",border:"none",color:"#475569",fontSize:13,cursor:"pointer",fontFamily:"inherit",padding:8}}>ปิด</button>
          </div>
        </div>
      )}

      {/* Edit Transaction */}
      {editingTx&&(
        <div className="modal-bg" onClick={e=>e.target===e.currentTarget&&setEditingTx(null)}>
          <div className="modal">
            <div style={{fontSize:17,fontWeight:700,marginBottom:16,color:"#e2e8f0"}}>✏️ แก้ไขรายการ</div>
            <div style={{display:"flex",flexDirection:"column",gap:10}}>
              <input className="inp-focus" style={S.inp} placeholder="ชื่อรายการ" value={editingTx.name} onChange={e=>setEditingTx({...editingTx,name:e.target.value})}/>
              <input className="inp-focus" style={S.inp} type="number" placeholder="ยอด (บวก=รายรับ, ลบ=รายจ่าย)" value={editingTx.amount} onChange={e=>setEditingTx({...editingTx,amount:parseFloat(e.target.value)||0})}/>
              <input className="inp-focus" style={S.inp} type="date" value={editingTx.date} onChange={e=>setEditingTx({...editingTx,date:e.target.value})}/>
              <select className="inp-focus" style={S.inp} value={editingTx.category} onChange={e=>setEditingTx({...editingTx,category:e.target.value})}>
                {categories.map(c=><option key={c} style={{background:"#1a1e2a"}}>{c}</option>)}
              </select>
              <button style={S.btn} onClick={saveEditTx}>💾 บันทึก</button>
            </div>
            <button onClick={()=>setEditingTx(null)} style={{width:"100%",marginTop:8,background:"none",border:"none",color:"#475569",fontSize:13,cursor:"pointer",fontFamily:"inherit",padding:8}}>ยกเลิก</button>
          </div>
        </div>
      )}

      {/* BOTTOM NAV */}
      <div style={{position:"fixed",bottom:0,left:"50%",transform:"translateX(-50%)",width:"100%",maxWidth:480,background:"#080a10",borderTop:"1px solid #111827",display:"flex",padding:"8px 0 10px"}}>
        {[{id:"dashboard",i:"📊",l:"ภาพรวม"},{id:"debts",i:"💳",l:"หนี้สิน"},{id:"add",i:"✏️",l:"บันทึก"},{id:"history",i:"📋",l:"ประวัติ"},{id:"report",i:"📄",l:"Report"}].map(t=>(
          <button key={t.id} onClick={()=>setActiveTab(t.id)} style={{flex:1,background:"none",border:"none",color:activeTab===t.id?"#60a5fa":"#374151",cursor:"pointer",fontFamily:"inherit",display:"flex",flexDirection:"column",alignItems:"center",gap:1,padding:"4px 0"}}>
            <span style={{fontSize:16}}>{t.i}</span>
            <span style={{fontSize:8,fontWeight:activeTab===t.id?700:400}}>{t.l}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
