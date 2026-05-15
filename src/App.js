import { useState, useEffect } from "react";

// ===== DEFAULT DATA =====
const DEFAULT_SETTINGS = { exchangeRate: 35, monthlyIncome: 3020 };

const DEFAULT_DEBTS = [
  { id: "abn_home", name: "หนี้บ้านไทย ABN", amount: 260, currency: "EUR", totalInstallments: 81, remaining: 79, category: "eur", icon: "🏠" },
  { id: "health_ins", name: "ประกันสุขภาพสะสม", amount: 66, currency: "EUR", totalInstallments: 12, remaining: 11, category: "eur", icon: "🏥" },
  { id: "abn_credit", name: "บัตรเครดิต ABN", amount: 40, currency: "EUR", totalInstallments: 29, remaining: 29, category: "eur", icon: "💳" },
  { id: "bondora", name: "Bondora", amount: 22.74, currency: "EUR", totalInstallments: 28, remaining: 26, category: "eur", icon: "📊" },
  { id: "amex", name: "Amex (จ่ายยอดเต็ม)", amount: 50, currency: "EUR", totalInstallments: 33, remaining: 32, category: "eur", icon: "💳", isRolling: true },
  { id: "coop_loan", name: "กู้สหกรณ์ (คิก)", amountTHB: 3722, amount: 3722/35, currency: "THB", totalInstallments: 166, remaining: 163, category: "thai", icon: "🤝" },
  { id: "car_kik", name: "ไฟแนนซ์รถคิก", amountTHB: 3555, amount: 3555/35, currency: "THB", totalInstallments: 70, remaining: 67, category: "thai", icon: "🚗" },
  { id: "car_kot", name: "ไฟแนนซ์รถคอท", amountTHB: 5400, amount: 5400/35, currency: "THB", totalInstallments: 50, remaining: 48, category: "thai", icon: "🚗" },
  { id: "true_debt", name: "หนี้ทรู", amountTHB: 2830, amount: 2830/35, currency: "THB", totalInstallments: 4, remaining: 1, category: "thai", icon: "📱" },
  { id: "shopee1", name: "Shopee 1", amountTHB: 1822, amount: 1822/35, currency: "THB", totalInstallments: 6, remaining: 4, category: "thai", icon: "🛍️" },
  { id: "shopee2", name: "Shopee 2", amountTHB: 1470, amount: 1470/35, currency: "THB", totalInstallments: 6, remaining: 4, category: "thai", icon: "🛍️" },
  { id: "shopee3", name: "Shopee 3", amountTHB: 3200, amount: 3200/35, currency: "THB", totalInstallments: 10, remaining: 8, category: "thai", icon: "🛍️" },
  { id: "shopee4", name: "Shopee 4", amountTHB: 2900, amount: 2900/35, currency: "THB", totalInstallments: 10, remaining: 9, category: "thai", icon: "🛍️" },
  { id: "shopee2870", name: "Shopee 2870", amountTHB: 2870, amount: 2870/35, currency: "THB", totalInstallments: 4, remaining: 2, category: "thai", icon: "🛍️" },
];

const DEFAULT_EXPENSES = [
  { id: "health", name: "ประกันสุขภาพ VGZ", amount: 149.9, icon: "🏥", category: "fixed" },
  { id: "car_ins", name: "ประกันรถ", amount: 40, icon: "🚗", category: "fixed" },
  { id: "phone", name: "ค่าโทรศัพท์", amount: 50, icon: "📱", category: "fixed" },
  { id: "duo", name: "DUO (กยศ)", amount: 48, icon: "🎓", category: "fixed" },
  { id: "fuel", name: "น้ำมันรถ", amount: 200, icon: "⛽", category: "fixed" },
  { id: "grocery", name: "ค่ากับข้าว/ของใช้", amount: 800, icon: "🛒", category: "fixed" },
  { id: "lottery", name: "หวย", amount: 21, icon: "🎰", category: "fixed" },
  { id: "personal", name: "ช้อปส่วนตัว", amount: 100, icon: "👜", category: "fixed" },
  { id: "misc", name: "อื่นๆ", amount: 100, icon: "💰", category: "fixed" },
  { id: "mom", name: "ให้แม่", amountTHB: 5000, amount: 5000/35, icon: "👩", category: "thai_fixed" },
  { id: "electricity", name: "ค่าไฟที่ไทย (Amex/Shopee)", amountTHB: 2000, amount: 2000/35, icon: "💡", category: "thai_fixed" },
];

const DEFAULT_TRANSACTIONS = [
  { id: "t1", date: "2026-04-27", name: "Greenfood เงินเดือน", category: "รายรับ", amount: 3032.96, method: "Income" },
  { id: "t2", date: "2026-04-27", name: "Thai home (ABN)", category: "หนี้บ้านไทย", amount: -260, method: "Debit" },
  { id: "t3", date: "2026-04-27", name: "ให้แม่", category: "ให้แม่", amount: -137.14, method: "Debit" },
  { id: "t4", date: "2026-04-27", name: "ไฟแนนซ์รถคิก", category: "หนี้ไทย", amount: -101.57, method: "Debit" },
  { id: "t5", date: "2026-04-27", name: "กู้สหกรณ์", category: "หนี้ไทย", amount: -106.34, method: "Debit" },
  { id: "t6", date: "2026-04-17", name: "VGZ ประกันสุขภาพ", category: "ประกัน", amount: -149.9, method: "Debit" },
  { id: "t7", date: "2026-04-12", name: "DUO", category: "หนี้ DUO", amount: -46.23, method: "Debit" },
  { id: "t8", date: "2026-04-06", name: "Amex ยอดเต็ม", category: "บัตร Amex", amount: -1685.7, method: "Debit" },
];

// ===== localStorage STORAGE =====
const KEYS = { debts: "fin_debts", expenses: "fin_expenses", transactions: "fin_txns", settings: "fin_settings" };

function load(key, fallback) {
  try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; }
  catch { return fallback; }
}
function save(key, data) {
  try { localStorage.setItem(key, JSON.stringify(data)); } catch {}
}

// ===== HELPERS =====
const fmt = (n) => `€${Math.abs(n).toLocaleString("nl-NL", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const fmtTHB = (n) => `฿${Math.round(Math.abs(n)).toLocaleString("th-TH")}`;
const MONTHS = ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."];
const uid = () => "t" + Date.now() + Math.random().toString(36).slice(2, 6);

function calcStats(debts, expenses, income) {
  const monthlyDebt = debts.reduce((s, d) => s + d.amount, 0);
  const monthlyFixed = expenses.reduce((s, e) => s + e.amount, 0);
  const totalMonthly = monthlyDebt + monthlyFixed;
  const balance = income - totalMonthly;
  const totalDebtEUR = debts.filter(d => !d.isRolling).reduce((s, d) => s + d.amount * d.remaining, 0);
  const maxMonths = Math.max(...debts.filter(d => !d.isRolling).map(d => d.remaining), 0);
  const debtFreeDate = new Date(2026, 4);
  debtFreeDate.setMonth(debtFreeDate.getMonth() + maxMonths);
  return { monthlyDebt, monthlyFixed, totalMonthly, balance, totalDebtEUR, debtFreeDate };
}

function projectSavings(debts, expenses, income) {
  const fixedExpense = expenses.reduce((s, e) => s + e.amount, 0);
  const result = [];
  let cumSavings = 0;
  for (let m = 4; m < 12; m++) {
    const mfn = m - 4;
    const activeDebtPayment = debts.filter(d => d.remaining - mfn > 0).reduce((s, d) => s + d.amount, 0);
    const bal = income - activeDebtPayment - fixedExpense;
    cumSavings += Math.max(0, bal);
    result.push({ month: MONTHS[m], balance: bal, savings: cumSavings });
  }
  return result;
}

export default function App() {
  const [debts, setDebts] = useState(() => load(KEYS.debts, DEFAULT_DEBTS));
  const [expenses, setExpenses] = useState(() => load(KEYS.expenses, DEFAULT_EXPENSES));
  const [transactions, setTransactions] = useState(() => load(KEYS.transactions, DEFAULT_TRANSACTIONS));
  const [settings, setSettings] = useState(() => load(KEYS.settings, DEFAULT_SETTINGS));
  const [activeTab, setActiveTab] = useState("dashboard");
  const [notification, setNotification] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [showAddDebt, setShowAddDebt] = useState(false);
  const [showTransfer, setShowTransfer] = useState(false);
  const [transferAmt, setTransferAmt] = useState("");
  const [transferSplit, setTransferSplit] = useState(null);
  const [transferDate, setTransferDate] = useState(new Date().toISOString().slice(0, 10));
  const [quickName, setQuickName] = useState("");
  const [quickAmt, setQuickAmt] = useState("");
  const [quickCat, setQuickCat] = useState("ค่ากับข้าว/ของใช้");
  const [quickMethod, setQuickMethod] = useState("Debit");
  const [quickDate, setQuickDate] = useState(new Date().toISOString().slice(0, 10));
  const [reportMonth, setReportMonth] = useState(new Date().getMonth());
  const [reportYear, setReportYear] = useState(new Date().getFullYear());
  const [newDebt, setNewDebt] = useState({ name: "", amount: "", currency: "EUR", totalInstallments: "", remaining: "", category: "eur", icon: "💳", amountTHB: "", isRolling: false });

  const showNotif = (msg, color = "#22c55e") => {
    setNotification({ msg, color });
    setTimeout(() => setNotification(null), 3000);
  };

  const saveDebts = (d) => { setDebts(d); save(KEYS.debts, d); };
  const saveExpenses = (e) => { setExpenses(e); save(KEYS.expenses, e); };
  const saveTxns = (t) => { setTransactions(t); save(KEYS.transactions, t); };
  const saveSettings = (s) => { setSettings(s); save(KEYS.settings, s); };

  const { monthlyDebt, monthlyFixed, totalMonthly, balance, totalDebtEUR, debtFreeDate } = calcStats(debts, expenses, settings.monthlyIncome);
  const projection = projectSavings(debts, expenses, settings.monthlyIncome);
  const yearEndSavings = projection[projection.length - 1]?.savings || 0;
  const maxBar = Math.max(...projection.map(s => Math.abs(s.balance)), 1);

  const handleThaiTransfer = () => {
    const total = parseFloat(transferAmt);
    if (!total || total <= 0) return;
    const thaiDebts = debts.filter(d => d.category === "thai" && d.remaining > 0);
    const totalReq = thaiDebts.reduce((s, d) => s + (d.amountTHB || d.amount * settings.exchangeRate), 0);
    const split = thaiDebts.map(d => {
      const req = d.amountTHB || d.amount * settings.exchangeRate;
      const paid = Math.min(req, (req / totalReq) * total);
      return { ...d, paidTHB: Math.round(paid), paidEUR: paid / settings.exchangeRate };
    });
    const remaining = total - split.reduce((s, x) => s + x.paidTHB, 0);
    setTransferSplit({ split, remaining, total });
  };

  const confirmTransfer = () => {
    if (!transferSplit) return;
    const newTxns = transferSplit.split.map(d => ({
      id: uid(), date: transferDate, name: `จ่ายหนี้ ${d.name}`,
      category: "หนี้ไทย", amount: -d.paidEUR, method: "Debit"
    }));
    if (transferSplit.remaining > 0) {
      newTxns.push({ id: uid(), date: transferDate, name: "ส่งให้แม่ (ส่วนที่เหลือ)", category: "ให้แม่", amount: -(transferSplit.remaining / settings.exchangeRate), method: "Debit" });
    }
    saveTxns([...newTxns, ...transactions]);
    setShowTransfer(false); setTransferAmt(""); setTransferSplit(null);
    showNotif(`✅ บันทึกการโอน ${fmtTHB(parseFloat(transferAmt))} แล้ว`);
  };

  const addQuickEntry = () => {
    if (!quickAmt || !quickName) return;
    const isIncome = quickCat === "รายรับ";
    const tx = { id: uid(), date: quickDate, name: quickName, category: quickCat, amount: isIncome ? parseFloat(quickAmt) : -parseFloat(quickAmt), method: quickMethod };
    saveTxns([tx, ...transactions]);
    setQuickName(""); setQuickAmt("");
    showNotif(`✅ บันทึก "${quickName}" (${quickDate}) แล้ว`);
  };

  const updateDebt = (id, field, value) => {
    const updated = debts.map(d => {
      if (d.id !== id) return d;
      const u = { ...d, [field]: field === "name" || field === "icon" || field === "category" ? value : parseFloat(value) || 0 };
      if (field === "amountTHB") u.amount = u.amountTHB / settings.exchangeRate;
      return u;
    });
    saveDebts(updated);
    showNotif("💾 บันทึกแล้ว");
  };

  const updateExpense = (id, field, value) => {
    const updated = expenses.map(e => {
      if (e.id !== id) return e;
      const u = { ...e, [field]: field === "name" || field === "icon" ? value : parseFloat(value) || 0 };
      if (field === "amountTHB") u.amount = u.amountTHB / settings.exchangeRate;
      return u;
    });
    saveExpenses(updated);
    showNotif("💾 บันทึกแล้ว");
  };

  const addDebt = () => {
    if (!newDebt.name || (!newDebt.amount && !newDebt.amountTHB)) return;
    const rate = settings.exchangeRate;
    const d = {
      ...newDebt, id: uid(),
      amount: newDebt.currency === "THB" ? (parseFloat(newDebt.amountTHB) || 0) / rate : parseFloat(newDebt.amount),
      amountTHB: newDebt.currency === "THB" ? parseFloat(newDebt.amountTHB) : undefined,
      totalInstallments: parseInt(newDebt.totalInstallments) || 0,
      remaining: parseInt(newDebt.remaining) || 0,
    };
    saveDebts([...debts, d]);
    setShowAddDebt(false);
    setNewDebt({ name: "", amount: "", currency: "EUR", totalInstallments: "", remaining: "", category: "eur", icon: "💳", amountTHB: "", isRolling: false });
    showNotif(`✅ เพิ่มหนี้ "${d.name}" แล้ว`);
  };

  const removeDebt = (id) => { saveDebts(debts.filter(d => d.id !== id)); showNotif("🗑️ ลบแล้ว", "#f59e0b"); };

  const reportTxns = transactions.filter(t => { const d = new Date(t.date); return d.getMonth() === reportMonth && d.getFullYear() === reportYear; });
  const reportIncome = reportTxns.filter(t => t.amount > 0).reduce((s, t) => s + t.amount, 0);
  const reportExpense = reportTxns.filter(t => t.amount < 0).reduce((s, t) => s + t.amount, 0);
  const reportBalance = reportIncome + reportExpense;
  const reportByCategory = reportTxns.filter(t => t.amount < 0).reduce((acc, t) => { acc[t.category] = (acc[t.category] || 0) + Math.abs(t.amount); return acc; }, {});

  return (
    <div style={{ fontFamily: "'Sarabun', sans-serif", background: "#0d0f14", minHeight: "100vh", color: "#e8eaf0", maxWidth: 480, margin: "0 auto", paddingBottom: 80 }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sarabun:wght@300;400;500;600;700&family=Space+Mono:wght@400;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 0; }
        .card { background: #161921; border: 1px solid #1e2230; border-radius: 16px; padding: 16px; margin-bottom: 12px; }
        .card-sm { background: #1a1e2a; border: 1px solid #252a3a; border-radius: 12px; padding: 12px; }
        .btn { background: #3b82f6; color: white; border: none; border-radius: 10px; padding: 11px 18px; font-family: inherit; font-size: 14px; font-weight: 600; cursor: pointer; width: 100%; transition: all 0.2s; }
        .btn:hover { opacity: 0.9; }
        .btn-sm { background: #1e2230; color: #94a3b8; border: 1px solid #252a3a; border-radius: 8px; padding: 6px 12px; font-family: inherit; font-size: 12px; cursor: pointer; }
        .btn-danger { background: #7f1d1d; color: #fca5a5; border: none; border-radius: 6px; padding: 4px 10px; font-family: inherit; font-size: 11px; cursor: pointer; }
        .inp { background: #1a1e2a; border: 1px solid #252a3a; border-radius: 8px; padding: 8px 12px; color: #e8eaf0; font-family: inherit; font-size: 13px; width: 100%; outline: none; }
        .inp:focus { border-color: #3b82f6; }
        .inp-edit { background: #0d1117; border: 1px solid #2563eb44; border-radius: 6px; padding: 4px 8px; color: #93c5fd; font-family: 'Space Mono', monospace; font-size: 13px; width: 80px; outline: none; text-align: right; }
        .inp-edit:focus { border-color: #3b82f6; }
        .prog { height: 5px; background: #1e2230; border-radius: 3px; overflow: hidden; margin-top: 8px; }
        .prog-fill { height: 100%; border-radius: 3px; }
        .modal-bg { position: fixed; inset: 0; background: rgba(0,0,0,0.75); backdrop-filter: blur(6px); z-index: 100; display: flex; align-items: flex-end; justify-content: center; }
        .modal { background: #161921; border: 1px solid #1e2230; border-radius: 20px 20px 0 0; padding: 24px; width: 100%; max-width: 480px; max-height: 88vh; overflow-y: auto; }
        .label { font-size: 10px; font-weight: 700; letter-spacing: 0.12em; color: #4b5563; text-transform: uppercase; margin-bottom: 8px; }
        .pill { display: inline-block; padding: 2px 8px; border-radius: 20px; font-size: 10px; font-weight: 700; }
        .edit-toggle { position: fixed; top: 16px; right: 16px; z-index: 50; background: ${editMode ? "#7c3aed" : "#1e2230"}; color: ${editMode ? "white" : "#64748b"}; border: 1px solid ${editMode ? "#7c3aed" : "#252a3a"}; border-radius: 20px; padding: 6px 14px; font-size: 12px; font-weight: 700; cursor: pointer; font-family: inherit; }
        @media print { .no-print { display: none !important; } }
        input[type="date"] { color-scheme: dark; }
      `}</style>

      {notification && (
        <div style={{ position: "fixed", top: 20, left: "50%", transform: "translateX(-50%)", background: notification.color, color: "white", padding: "10px 20px", borderRadius: 12, fontWeight: 600, fontSize: 13, zIndex: 999, boxShadow: "0 4px 20px rgba(0,0,0,0.4)", whiteSpace: "nowrap" }}>
          {notification.msg}
        </div>
      )}

      <button className="edit-toggle no-print" onClick={() => setEditMode(!editMode)}>
        {editMode ? "✏️ แก้ไขอยู่" : "⚙️ แก้ไข"}
      </button>

      {/* HEADER */}
      <div style={{ padding: "20px 20px 0", background: "linear-gradient(180deg, #0d1117 0%, #0d0f14 100%)" }}>
        <div style={{ marginBottom: 16, paddingTop: 8 }}>
          <div style={{ fontSize: 10, color: "#4b5563", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" }}>Finance Tracker</div>
          <div style={{ fontSize: 20, fontWeight: 700, color: "#f1f5f9" }}>สวัสดี 👋</div>
        </div>

        <div style={{ background: "linear-gradient(135deg, #1e3a5f 0%, #1565c0 60%, #0288d1 100%)", borderRadius: 20, padding: 20, marginBottom: 16, boxShadow: "0 8px 32px rgba(37,99,235,0.25)", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: -20, right: -20, width: 100, height: 100, background: "rgba(255,255,255,0.06)", borderRadius: "50%" }} />
          <div style={{ fontSize: 10, color: "rgba(255,255,255,0.55)", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" }}>รายรับ/เดือน</div>
          {editMode ? (
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4 }}>
              <span style={{ fontSize: 20, color: "white" }}>€</span>
              <input className="inp" style={{ fontSize: 22, fontWeight: 700, background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)", color: "white", width: 140 }}
                value={settings.monthlyIncome} onChange={e => saveSettings({ ...settings, monthlyIncome: parseFloat(e.target.value) || 0 })} />
            </div>
          ) : (
            <div style={{ fontSize: 34, fontWeight: 700, color: "white", fontFamily: "'Space Mono', monospace", lineHeight: 1.2, marginTop: 4 }}>{fmt(settings.monthlyIncome)}</div>
          )}
          <div style={{ display: "flex", gap: 12, marginTop: 14, flexWrap: "wrap" }}>
            {[
              { label: "รายจ่ายรวม", value: fmt(totalMonthly), color: "#fca5a5" },
              { label: "คงเหลือ", value: (balance >= 0 ? "+" : "") + fmt(balance), color: balance >= 0 ? "#86efac" : "#fca5a5" },
              { label: "เก็บได้ปีนี้", value: fmt(yearEndSavings), color: "#fde68a" },
            ].map(s => (
              <div key={s.label}>
                <div style={{ fontSize: 9, color: "rgba(255,255,255,0.45)", marginBottom: 2 }}>{s.label}</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: s.color, fontFamily: "'Space Mono', monospace" }}>{s.value}</div>
              </div>
            ))}
          </div>
          {editMode && (
            <div style={{ marginTop: 10, display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 10, color: "rgba(255,255,255,0.5)" }}>อัตราแลกเปลี่ยน</span>
              <input className="inp" style={{ width: 70, fontSize: 12, background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)", color: "white" }}
                value={settings.exchangeRate} onChange={e => saveSettings({ ...settings, exchangeRate: parseFloat(e.target.value) || 35 })} />
              <span style={{ fontSize: 10, color: "rgba(255,255,255,0.5)" }}>THB/EUR</span>
            </div>
          )}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 16 }}>
          {[
            { label: "หนี้ทั้งหมด", value: fmt(totalDebtEUR), color: "#f87171", icon: "💸" },
            { label: "จ่าย/เดือน", value: fmt(monthlyDebt), color: "#fb923c", icon: "📅" },
            { label: "หมดหนี้ใหญ่", value: debtFreeDate.getFullYear().toString(), color: "#a78bfa", icon: "🎯" },
          ].map(s => (
            <div key={s.label} className="card-sm" style={{ textAlign: "center", padding: 10 }}>
              <div style={{ fontSize: 16, marginBottom: 2 }}>{s.icon}</div>
              <div style={{ fontSize: 12, fontWeight: 700, color: s.color, fontFamily: "'Space Mono', monospace" }}>{s.value}</div>
              <div style={{ fontSize: 9, color: "#4b5563", marginTop: 1 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* TABS */}
      <div style={{ display: "flex", gap: 4, padding: "0 20px", marginBottom: 14, overflowX: "auto" }} className="no-print">
        {[
          { id: "dashboard", icon: "📊", label: "ภาพรวม" },
          { id: "debts", icon: "💳", label: "หนี้สิน" },
          { id: "add", icon: "✏️", label: "บันทึก" },
          { id: "history", icon: "📋", label: "ประวัติ" },
          { id: "report", icon: "📄", label: "Report" },
        ].map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)} style={{
            background: activeTab === t.id ? "#3b82f6" : "#161921",
            color: activeTab === t.id ? "white" : "#64748b",
            border: `1px solid ${activeTab === t.id ? "#3b82f6" : "#1e2230"}`,
            borderRadius: 10, padding: "7px 12px", fontSize: 11, fontWeight: 600,
            cursor: "pointer", whiteSpace: "nowrap", fontFamily: "inherit",
          }}>{t.icon} {t.label}</button>
        ))}
      </div>

      <div style={{ padding: "0 20px" }}>

        {/* DASHBOARD */}
        {activeTab === "dashboard" && (
          <div>
            <div className="card">
              <div className="label">📈 เงินเหลือแต่ละเดือน (พ.ค.–ธ.ค. 2026)</div>
              <div style={{ display: "flex", gap: 5, alignItems: "flex-end", height: 72 }}>
                {projection.map((s, i) => (
                  <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
                    <div style={{ width: "100%", height: Math.max(4, Math.abs(s.balance) / maxBar * 58), background: s.balance >= 0 ? "linear-gradient(180deg,#22c55e,#16a34a)" : "linear-gradient(180deg,#ef4444,#dc2626)", borderRadius: "4px 4px 0 0" }} />
                    <div style={{ fontSize: 8, color: "#4b5563" }}>{s.month}</div>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: 10, background: "#1a1e2a", borderRadius: 8, padding: "8px 12px", display: "flex", justifyContent: "space-between", fontSize: 12 }}>
                <span style={{ color: "#64748b" }}>เงินออมสะสมสิ้นปี 2026</span>
                <span style={{ color: "#fde68a", fontWeight: 700, fontFamily: "'Space Mono', monospace" }}>{fmt(yearEndSavings)}</span>
              </div>
            </div>
            <div className="card">
              <div className="label">🗓️ Timeline หมดหนี้</div>
              {debts.filter(d => !d.isRolling && d.remaining > 0).sort((a, b) => a.remaining - b.remaining).slice(0, 6).map(d => {
                const pct = Math.round(((d.totalInstallments - d.remaining) / Math.max(d.totalInstallments, 1)) * 100);
                const fin = new Date(2026, 4); fin.setMonth(fin.getMonth() + d.remaining);
                return (
                  <div key={d.id} style={{ marginBottom: 10 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 3 }}>
                      <span>{d.icon} {d.name}</span>
                      <span style={{ color: "#64748b", fontSize: 11 }}>{MONTHS[fin.getMonth()]} {fin.getFullYear()}</span>
                    </div>
                    <div className="prog">
                      <div className="prog-fill" style={{ width: `${pct}%`, background: pct >= 75 ? "#22c55e" : pct >= 40 ? "#f59e0b" : "#3b82f6" }} />
                    </div>
                    <div style={{ fontSize: 9, color: "#4b5563", marginTop: 2 }}>{pct}% ชำระแล้ว • เหลือ {d.remaining} งวด</div>
                  </div>
                );
              })}
            </div>
            <div className="card" style={{ background: "#0f1a0f", borderColor: "#22c55e22" }}>
              <div style={{ fontSize: 11, color: "#22c55e", fontWeight: 700, marginBottom: 6 }}>💡 Insight</div>
              <div style={{ fontSize: 12, color: "#d1d5db", lineHeight: 1.7 }}>
                หนี้ที่หมดเร็วที่สุด (Shopee + ทรู) รวม ~{fmt(debts.filter(d => d.remaining <= 4 && d.category === "thai").reduce((s, d) => s + d.amount, 0))}/เดือน — เมื่อหมดจะกลายเป็นเงินเก็บ 🎉<br />
                <span style={{ color: "#86efac" }}>หมดหนี้ทั้งหมด: {debtFreeDate.toLocaleDateString("th-TH", { month: "long", year: "numeric" })}</span>
              </div>
            </div>
          </div>
        )}

        {/* DEBTS */}
        {activeTab === "debts" && (
          <div>
            <div className="label">หนี้ EUR (NL)</div>
            {debts.filter(d => d.category === "eur").map(d => (
              <div key={d.id} className="card" style={{ padding: 14 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div style={{ display: "flex", gap: 10, alignItems: "center", flex: 1 }}>
                    <span style={{ fontSize: 20 }}>{d.icon}</span>
                    <div style={{ flex: 1 }}>
                      {editMode ? <input className="inp" style={{ marginBottom: 4, fontSize: 13 }} value={d.name} onChange={e => updateDebt(d.id, "name", e.target.value)} />
                        : <div style={{ fontSize: 13, fontWeight: 600 }}>{d.name}</div>}
                      <div style={{ fontSize: 10, color: "#64748b" }}>{d.isRolling ? "จ่ายยอดเต็มสิ้นเดือน" : `เหลือ ${d.remaining} งวด`}</div>
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    {editMode ? <input className="inp-edit" value={d.amount} onChange={e => updateDebt(d.id, "amount", e.target.value)} />
                      : <div style={{ fontSize: 15, fontWeight: 700, color: "#f87171", fontFamily: "'Space Mono', monospace" }}>{fmt(d.amount)}</div>}
                    <div style={{ fontSize: 9, color: "#4b5563" }}>/เดือน</div>
                  </div>
                </div>
                {editMode && !d.isRolling && (
                  <div style={{ display: "flex", gap: 8, marginTop: 8, alignItems: "center" }}>
                    <span style={{ fontSize: 11, color: "#64748b" }}>เหลือ</span>
                    <input className="inp-edit" style={{ width: 60 }} value={d.remaining} onChange={e => updateDebt(d.id, "remaining", e.target.value)} />
                    <span style={{ fontSize: 11, color: "#64748b" }}>/ ทั้งหมด</span>
                    <input className="inp-edit" style={{ width: 60 }} value={d.totalInstallments} onChange={e => updateDebt(d.id, "totalInstallments", e.target.value)} />
                    <button className="btn-danger" onClick={() => removeDebt(d.id)}>🗑️</button>
                  </div>
                )}
                {!d.isRolling && <div className="prog"><div className="prog-fill" style={{ width: `${Math.round(((d.totalInstallments - d.remaining) / Math.max(d.totalInstallments, 1)) * 100)}%`, background: "#3b82f6" }} /></div>}
              </div>
            ))}

            <div className="label" style={{ marginTop: 8 }}>หนี้ไทย (THB)</div>
            <button className="btn" style={{ marginBottom: 12, background: "#f59e0b" }} onClick={() => setShowTransfer(true)}>🇹🇭 โอนเงินกลับไทย (Auto-Split)</button>
            {debts.filter(d => d.category === "thai").map(d => (
              <div key={d.id} className="card" style={{ padding: 14 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div style={{ display: "flex", gap: 10, alignItems: "center", flex: 1 }}>
                    <span style={{ fontSize: 20 }}>{d.icon}</span>
                    <div style={{ flex: 1 }}>
                      {editMode ? <input className="inp" style={{ marginBottom: 4, fontSize: 13 }} value={d.name} onChange={e => updateDebt(d.id, "name", e.target.value)} />
                        : <div style={{ fontSize: 13, fontWeight: 600 }}>{d.name}</div>}
                      <div style={{ fontSize: 10, color: "#64748b" }}>เหลือ {d.remaining} งวด</div>
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    {editMode ? <input className="inp-edit" value={d.amountTHB || Math.round(d.amount * settings.exchangeRate)} onChange={e => updateDebt(d.id, "amountTHB", e.target.value)} />
                      : <div style={{ fontSize: 14, fontWeight: 700, color: "#fb923c", fontFamily: "'Space Mono', monospace" }}>{fmtTHB(d.amountTHB || d.amount * settings.exchangeRate)}</div>}
                    <div style={{ fontSize: 10, color: "#64748b" }}>{fmt(d.amount)}</div>
                  </div>
                </div>
                {editMode && (
                  <div style={{ display: "flex", gap: 8, marginTop: 8, alignItems: "center" }}>
                    <span style={{ fontSize: 11, color: "#64748b" }}>เหลือ</span>
                    <input className="inp-edit" style={{ width: 60 }} value={d.remaining} onChange={e => updateDebt(d.id, "remaining", e.target.value)} />
                    <span style={{ fontSize: 11, color: "#64748b" }}>/ ทั้งหมด</span>
                    <input className="inp-edit" style={{ width: 60 }} value={d.totalInstallments} onChange={e => updateDebt(d.id, "totalInstallments", e.target.value)} />
                    <button className="btn-danger" onClick={() => removeDebt(d.id)}>🗑️</button>
                  </div>
                )}
                <div className="prog"><div className="prog-fill" style={{ width: `${Math.round(((d.totalInstallments - d.remaining) / Math.max(d.totalInstallments, 1)) * 100)}%`, background: "#f59e0b" }} /></div>
              </div>
            ))}
            {editMode && <button className="btn" style={{ background: "#22c55e", marginTop: 4 }} onClick={() => setShowAddDebt(true)}>➕ เพิ่มหนี้ใหม่</button>}
            {!editMode && <button className="btn" style={{ background: "#22c55e", marginTop: 4 }} onClick={() => setShowAddDebt(true)}>➕ เพิ่มหนี้ใหม่</button>}
            {editMode && (
              <div style={{ marginTop: 16 }}>
                <div className="label">ค่าใช้จ่ายประจำ</div>
                {expenses.map(e => (
                  <div key={e.id} className="card" style={{ padding: "10px 14px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: 13 }}>{e.icon} {e.name}</span>
                      <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                        <input className="inp-edit" value={e.amountTHB || e.amount} onChange={ev => updateExpense(e.id, e.amountTHB ? "amountTHB" : "amount", ev.target.value)} />
                        <span style={{ fontSize: 10, color: "#4b5563" }}>{e.amountTHB ? "฿" : "€"}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div className="card" style={{ background: "#0f1a0f", borderColor: "#22c55e22", marginTop: 8 }}>
              <div style={{ fontSize: 11, color: "#22c55e", fontWeight: 700, marginBottom: 8 }}>💰 รวมต้องจ่าย/เดือน</div>
              {[["หนี้สิน", monthlyDebt, "#f87171"], ["ค่าใช้จ่ายประจำ", monthlyFixed, "#fb923c"]].map(([l, v, c]) => (
                <div key={l} style={{ display: "flex", justifyContent: "space-between", marginBottom: 4, fontSize: 13 }}>
                  <span style={{ color: "#64748b" }}>{l}</span>
                  <span style={{ fontFamily: "'Space Mono', monospace", color: c }}>{fmt(v)}</span>
                </div>
              ))}
              <div style={{ display: "flex", justifyContent: "space-between", borderTop: "1px solid #1e2230", paddingTop: 8, fontSize: 15 }}>
                <span style={{ fontWeight: 700 }}>รวมทั้งหมด</span>
                <span style={{ fontFamily: "'Space Mono', monospace", fontWeight: 700 }}>{fmt(totalMonthly)}</span>
              </div>
            </div>
          </div>
        )}

        {/* ADD */}
        {activeTab === "add" && (
          <div>
            <div className="card">
              <div className="label">✏️ บันทึกรายจ่ายด่วน</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <input className="inp" placeholder="ชื่อรายการ เช่น Jumbo, Aldi..." value={quickName} onChange={e => setQuickName(e.target.value)} />
                <input className="inp" type="number" placeholder="ยอดเงิน (EUR)" value={quickAmt} onChange={e => setQuickAmt(e.target.value)} />
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <span style={{ fontSize: 12, color: "#64748b", whiteSpace: "nowrap" }}>📅 วันที่</span>
                  <input className="inp" type="date" value={quickDate} onChange={e => setQuickDate(e.target.value)} />
                </div>
                <select className="inp" value={quickCat} onChange={e => setQuickCat(e.target.value)}>
                  {[
                    "--- รายรับ ---","รายรับ",
                    "--- หนี้ EUR ---","หนี้บ้านไทย ABN","บัตรเครดิต ABN","Bondora","บัตร Amex","ประกันสุขภาพสะสม","หนี้ DUO",
                    "--- หนี้ไทย ---","หนี้ไทย","กู้สหกรณ์","ไฟแนนซ์รถคิก","ไฟแนนซ์รถคอท","หนี้ทรู","Shopee",
                    "--- ค่าใช้จ่าย ---","ค่ากับข้าว/ของใช้","น้ำมันรถ","ช้อปส่วนตัว","ค่าไฟที่ไทย","ประกัน","ให้แม่","อื่นๆ"
                  ].map(o => o.startsWith("---")
                    ? <option key={o} disabled style={{color:"#4b5563"}}>{o}</option>
                    : <option key={o}>{o}</option>
                  )}
                </select>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 6 }}>
                  {["Debit","Amex","Shopee","Income"].map(m => (
                    <button key={m} onClick={() => setQuickMethod(m)} style={{ background: quickMethod === m ? "#3b82f6" : "#1a1e2a", color: quickMethod === m ? "white" : "#64748b", border: `1px solid ${quickMethod === m ? "#3b82f6" : "#252a3a"}`, borderRadius: 8, padding: "8px 4px", fontSize: 11, cursor: "pointer", fontFamily: "inherit" }}>{m}</button>
                  ))}
                </div>
                <button className="btn" onClick={addQuickEntry}>💾 บันทึก</button>
              </div>
            </div>

            <div className="card" style={{ background: "#1a110d", borderColor: "#f59e0b33" }}>
              <div className="label" style={{ color: "#f59e0b" }}>🔔 รายการประจำวันที่ 27</div>
              <div style={{ fontSize: 11, color: "#94a3b8", marginBottom: 10 }}>กดยืนยันครั้งเดียว — ระบบ auto-fill ให้เลย</div>
              {[
                { name: "เงินเดือน Greenfood", value: `+${fmt(settings.monthlyIncome)}`, color: "#22c55e" },
                { name: "หนี้บ้านไทย ABN", value: `-${fmt(260)}`, color: "#f87171" },
                { name: "โอนหนี้ไทยทั้งหมด", value: `~${fmtTHB(debts.filter(d => d.category === "thai" && d.remaining > 0).reduce((s, d) => s + (d.amountTHB || d.amount * settings.exchangeRate), 0))}`, color: "#f59e0b" },
                { name: "ประกันสุขภาพ VGZ", value: `-${fmt(149.9)}`, color: "#f87171" },
              ].map((item, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "7px 0", borderBottom: "1px solid #1e2230", fontSize: 12 }}>
                  <span>{item.name}</span>
                  <span style={{ color: item.color, fontFamily: "'Space Mono', monospace", fontWeight: 700 }}>{item.value}</span>
                </div>
              ))}
              <button className="btn" style={{ marginTop: 12, background: "#f59e0b" }} onClick={() => {
                const today = new Date().toISOString().slice(0, 10);
                saveTxns([
                  { id: uid(), date: today, name: "เงินเดือน Greenfood", category: "รายรับ", amount: settings.monthlyIncome, method: "Income" },
                  { id: uid(), date: today, name: "หนี้บ้านไทย ABN", category: "หนี้บ้านไทย", amount: -260, method: "Debit" },
                  { id: uid(), date: today, name: "ประกันสุขภาพ VGZ", category: "ประกัน", amount: -149.9, method: "Debit" },
                  ...transactions
                ]);
                showNotif("✅ บันทึกรายการประจำเดือนแล้ว!");
              }}>✅ ยืนยันรายการประจำเดือน</button>
            </div>
            <button className="btn" style={{ background: "#7c3aed" }} onClick={() => setShowTransfer(true)}>🇹🇭 โอนเงินกลับไทย (Auto-Split)</button>
          </div>
        )}

        {/* HISTORY */}
        {activeTab === "history" && (
          <div>
            <div className="label">ประวัติทั้งหมด ({transactions.length} รายการ)</div>
            {transactions.map((tx, i) => (
              <div key={tx.id || i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "11px 0", borderBottom: "1px solid #1e2230" }}>
                <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                  <div style={{ width: 34, height: 34, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, background: tx.amount > 0 ? "#0f2a1a" : "#1a0f0f" }}>
                    {tx.amount > 0 ? "💵" : tx.category?.includes("หนี้") ? "💸" : "🛒"}
                  </div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 500 }}>{tx.name}</div>
                    <div style={{ fontSize: 10, color: "#4b5563" }}>{tx.date} · {tx.method}</div>
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 13, fontWeight: 700, fontFamily: "'Space Mono', monospace", color: tx.amount > 0 ? "#22c55e" : "#f87171" }}>
                    {tx.amount > 0 ? "+" : ""}{fmt(tx.amount)}
                  </div>
                  <span className="pill" style={{ background: tx.amount > 0 ? "#0f2a1a" : "#1a0f0f", color: tx.amount > 0 ? "#22c55e" : "#f87171" }}>{tx.category}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* REPORT */}
        {activeTab === "report" && (
          <div>
            <div className="card no-print" style={{ padding: "12px 14px" }}>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <select className="inp" style={{ flex: 1 }} value={reportMonth} onChange={e => setReportMonth(parseInt(e.target.value))}>
                  {MONTHS.map((m, i) => <option key={i} value={i}>{m}</option>)}
                </select>
                <select className="inp" style={{ width: 90 }} value={reportYear} onChange={e => setReportYear(parseInt(e.target.value))}>
                  {[2025, 2026, 2027].map(y => <option key={y} value={y}>{y}</option>)}
                </select>
                <button className="btn-sm" onClick={() => window.print()}>🖨️ ปริ้น</button>
              </div>
            </div>
            <div className="card" style={{ background: "linear-gradient(135deg, #1e3a5f, #1565c0)", padding: "16px 20px" }}>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", fontWeight: 700, letterSpacing: "0.1em" }}>MONTHLY REPORT</div>
              <div style={{ fontSize: 20, fontWeight: 700, color: "white", marginTop: 4 }}>{MONTHS[reportMonth]} {reportYear}</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginTop: 12 }}>
                {[["รายรับ", reportIncome, "#86efac"], ["รายจ่าย", reportExpense, "#fca5a5"], ["คงเหลือ", reportBalance, reportBalance >= 0 ? "#86efac" : "#fca5a5"]].map(([l, v, c]) => (
                  <div key={l} style={{ textAlign: "center", background: "rgba(255,255,255,0.08)", borderRadius: 10, padding: "10px 6px" }}>
                    <div style={{ fontSize: 9, color: "rgba(255,255,255,0.45)", marginBottom: 4 }}>{l}</div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: c, fontFamily: "'Space Mono', monospace" }}>{(v > 0 ? "+" : "") + fmt(v)}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="card">
              <div className="label">รายจ่ายตามหมวด</div>
              {Object.entries(reportByCategory).sort((a, b) => b[1] - a[1]).map(([cat, amt]) => {
                const pct = Math.round((amt / Math.abs(reportExpense || 1)) * 100);
                return (
                  <div key={cat} style={{ marginBottom: 10 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 3 }}>
                      <span>{cat}</span>
                      <span style={{ fontFamily: "'Space Mono', monospace", color: "#f87171" }}>{fmt(amt)} ({pct}%)</span>
                    </div>
                    <div className="prog"><div className="prog-fill" style={{ width: `${pct}%`, background: "#3b82f6" }} /></div>
                  </div>
                );
              })}
              {Object.keys(reportByCategory).length === 0 && <div style={{ color: "#4b5563", fontSize: 12, textAlign: "center", padding: "16px 0" }}>ยังไม่มีข้อมูลเดือนนี้</div>}
            </div>
            <div className="card">
              <div className="label">สรุปรายปี {reportYear}</div>
              {MONTHS.map((m, mi) => {
                const txs = transactions.filter(t => { const d = new Date(t.date); return d.getMonth() === mi && d.getFullYear() === reportYear; });
                if (txs.length === 0) return null;
                const inc = txs.filter(t => t.amount > 0).reduce((s, t) => s + t.amount, 0);
                const exp = txs.filter(t => t.amount < 0).reduce((s, t) => s + t.amount, 0);
                const bal = inc + exp;
                return (
                  <div key={m} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "7px 0", borderBottom: "1px solid #1e2230", fontSize: 12 }}>
                    <span style={{ color: "#94a3b8", width: 36 }}>{m}</span>
                    <span style={{ color: "#22c55e", fontFamily: "'Space Mono', monospace" }}>{fmt(inc)}</span>
                    <span style={{ color: "#f87171", fontFamily: "'Space Mono', monospace" }}>{fmt(exp)}</span>
                    <span style={{ color: bal >= 0 ? "#86efac" : "#fca5a5", fontFamily: "'Space Mono', monospace", fontWeight: 700 }}>{bal >= 0 ? "+" : ""}{fmt(bal)}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* TRANSFER MODAL */}
      {showTransfer && (
        <div className="modal-bg" onClick={e => e.target === e.currentTarget && (setShowTransfer(false), setTransferSplit(null))}>
          <div className="modal">
            <div style={{ fontSize: 17, fontWeight: 700, marginBottom: 4 }}>🇹🇭 โอนเงินกลับไทย</div>
            <div style={{ fontSize: 11, color: "#64748b", marginBottom: 12 }}>ใส่ยอดที่โอน ระบบแบ่งจ่ายหนี้ไทยให้อัตโนมัติ</div>
            <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 10 }}>
              <span style={{ fontSize: 12, color: "#64748b", whiteSpace: "nowrap" }}>📅 วันที่โอน</span>
              <input className="inp" type="date" value={transferDate} onChange={e => setTransferDate(e.target.value)} style={{ flex: 1 }} />
            </div>
            <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
              <input className="inp" type="number" placeholder="ยอดโอน (บาท)" value={transferAmt} onChange={e => setTransferAmt(e.target.value)} />
              <button className="btn-sm" onClick={handleThaiTransfer} style={{ whiteSpace: "nowrap" }}>คำนวณ</button>
            </div>
            {transferSplit && (
              <div>
                <div className="label">BREAKDOWN</div>
                {transferSplit.split.map(d => (
                  <div key={d.id} style={{ display: "flex", justifyContent: "space-between", padding: "7px 0", borderBottom: "1px solid #1e2230", fontSize: 13 }}>
                    <span>{d.icon} {d.name}</span>
                    <span style={{ color: "#f87171", fontFamily: "'Space Mono', monospace" }}>฿{d.paidTHB.toLocaleString()}</span>
                  </div>
                ))}
                {transferSplit.remaining > 0 && (
                  <div style={{ display: "flex", justifyContent: "space-between", padding: "7px 0", fontSize: 13, color: "#86efac" }}>
                    <span>👩 ให้แม่ (ส่วนที่เหลือ)</span>
                    <span style={{ fontFamily: "'Space Mono', monospace" }}>฿{Math.round(transferSplit.remaining).toLocaleString()}</span>
                  </div>
                )}
                <button className="btn" style={{ marginTop: 12 }} onClick={confirmTransfer}>✅ ยืนยัน</button>
              </div>
            )}
            <button onClick={() => { setShowTransfer(false); setTransferSplit(null); }} style={{ width: "100%", marginTop: 8, background: "none", border: "none", color: "#64748b", fontSize: 13, cursor: "pointer", fontFamily: "inherit", padding: 8 }}>ยกเลิก</button>
          </div>
        </div>
      )}

      {/* ADD DEBT MODAL */}
      {showAddDebt && (
        <div className="modal-bg" onClick={e => e.target === e.currentTarget && setShowAddDebt(false)}>
          <div className="modal">
            <div style={{ fontSize: 17, fontWeight: 700, marginBottom: 16 }}>➕ เพิ่มหนี้ใหม่</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <input className="inp" placeholder="ชื่อหนี้" value={newDebt.name} onChange={e => setNewDebt({ ...newDebt, name: e.target.value })} />
              <select className="inp" value={newDebt.currency} onChange={e => setNewDebt({ ...newDebt, currency: e.target.value, category: e.target.value === "THB" ? "thai" : "eur" })}>
                <option value="EUR">EUR (หนี้ NL)</option>
                <option value="THB">THB (หนี้ไทย)</option>
              </select>
              {newDebt.currency === "EUR"
                ? <input className="inp" type="number" placeholder="ยอด/เดือน (EUR)" value={newDebt.amount} onChange={e => setNewDebt({ ...newDebt, amount: e.target.value })} />
                : <input className="inp" type="number" placeholder="ยอด/เดือน (บาท)" value={newDebt.amountTHB} onChange={e => setNewDebt({ ...newDebt, amountTHB: e.target.value, amount: parseFloat(e.target.value) / settings.exchangeRate })} />}
              <div style={{ display: "flex", gap: 8 }}>
                <input className="inp" type="number" placeholder="งวดทั้งหมด" value={newDebt.totalInstallments} onChange={e => setNewDebt({ ...newDebt, totalInstallments: e.target.value })} />
                <input className="inp" type="number" placeholder="งวดที่เหลือ" value={newDebt.remaining} onChange={e => setNewDebt({ ...newDebt, remaining: e.target.value })} />
              </div>
              <button className="btn" onClick={addDebt}>💾 เพิ่มหนี้</button>
            </div>
            <button onClick={() => setShowAddDebt(false)} style={{ width: "100%", marginTop: 8, background: "none", border: "none", color: "#64748b", fontSize: 13, cursor: "pointer", fontFamily: "inherit", padding: 8 }}>ยกเลิก</button>
          </div>
        </div>
      )}

      {/* BOTTOM NAV */}
      <div className="no-print" style={{ position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: 480, background: "#0d0f14", borderTop: "1px solid #1e2230", display: "flex", padding: "8px 0" }}>
        {[
          { id: "dashboard", icon: "📊", label: "ภาพรวม" },
          { id: "debts", icon: "💳", label: "หนี้สิน" },
          { id: "add", icon: "✏️", label: "บันทึก" },
          { id: "history", icon: "📋", label: "ประวัติ" },
          { id: "report", icon: "📄", label: "Report" },
        ].map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)} style={{ flex: 1, background: "none", border: "none", color: activeTab === t.id ? "#3b82f6" : "#4b5563", cursor: "pointer", fontFamily: "inherit", display: "flex", flexDirection: "column", alignItems: "center", gap: 1 }}>
            <span style={{ fontSize: 18 }}>{t.icon}</span>
            <span style={{ fontSize: 9, fontWeight: activeTab === t.id ? 700 : 400 }}>{t.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
