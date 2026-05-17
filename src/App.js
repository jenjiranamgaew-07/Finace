import { useState, useEffect } from "react";
import { initializeApp } from "firebase/app";
import { getFirestore, doc, getDoc, setDoc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCZDHBslv9KRiTwtmm8dyzgMgz1YAZeV3E",
  authDomain: "finance-tracker-5b8de.firebaseapp.com",
  projectId: "finance-tracker-5b8de",
  storageBucket: "finance-tracker-5b8de.firebasestorage.app",
  messagingSenderId: "103568432665",
  appId: "1:103568432665:web:35673a69f8ebf7f3d11488"
};

const fbApp = initializeApp(firebaseConfig);
const db = getFirestore(fbApp);

// ===== DEFAULT DATA =====
const DEFAULT_SETTINGS = { exchangeRate: 35, monthlyIncome: 3020 };

const DEFAULT_CATEGORIES = [
  "รายรับ",
  "หนี้บ้านไทย ABN","บัตรเครดิต ABN","Bondora","บัตร Amex","ประกันสุขภาพสะสม","หนี้ DUO",
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

const DEFAULT_TRANSACTIONS = [
  { id:"t1", date:"2026-04-27", name:"Greenfood เงินเดือน", category:"รายรับ", amount:3032.96, method:"Income" },
  { id:"t2", date:"2026-04-27", name:"Thai home (ABN)", category:"หนี้บ้านไทย ABN", amount:-260, method:"Debit" },
  { id:"t3", date:"2026-04-27", name:"ให้แม่", category:"ให้แม่", amount:-137.14, method:"Debit" },
  { id:"t4", date:"2026-04-27", name:"ไฟแนนซ์รถคิก", category:"หนี้ไทย", amount:-101.57, method:"Debit" },
  { id:"t5", date:"2026-04-27", name:"กู้สหกรณ์", category:"หนี้ไทย", amount:-106.34, method:"Debit" },
  { id:"t6", date:"2026-04-17", name:"VGZ ประกันสุขภาพ", category:"ประกัน", amount:-149.9, method:"Debit" },
  { id:"t7", date:"2026-04-12", name:"DUO", category:"หนี้ DUO", amount:-46.23, method:"Debit" },
  { id:"t8", date:"2026-04-06", name:"Amex ยอดเต็ม", category:"บัตร Amex", amount:-1685.7, method:"Debit" },
];

// ===== FIREBASE =====
async function fbLoad() {
  try { const s = await getDoc(doc(db,"finance","user_data")); return s.exists()?s.data():null; } catch { return null; }
}
async function fbSave(data) {
  try { await setDoc(doc(db,"finance","user_data"), data); } catch(e) { console.error(e); }
}

// ===== HELPERS =====
const fmt = n => `€${Math.abs(n).toLocaleString("nl-NL",{minimumFractionDigits:2,maximumFractionDigits:2})}`;
const fmtTHB = n => `฿${Math.round(Math.abs(n)).toLocaleString("th-TH")}`;
const MONTHS = ["ม.ค.","ก.พ.","มี.ค.","เม.ย.","พ.ค.","มิ.ย.","ก.ค.","ส.ค.","ก.ย.","ต.ค.","พ.ย.","ธ.ค."];
const uid = () => "id"+Date.now()+Math.random().toString(36).slice(2,6);
const today = () => new Date().toISOString().slice(0,10);

// คำนวณยอดทบเดือน (cumulative balance)
function calcMonthlyBalances(transactions, year=2026) {
  const months = {};
  transactions.forEach(t => {
    const d = new Date(t.date);
    if (d.getFullYear() !== year) return;
    const key = d.getMonth();
    months[key] = (months[key]||0) + t.amount;
  });
  // ทบยอดสะสม
  const result = {};
  let carry = 0;
  for (let m = 0; m < 12; m++) {
    const bal = (months[m]||0) + carry;
    result[m] = { monthly: months[m]||0, cumulative: bal };
    carry = bal;
  }
  return result;
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
  const [synced, setSynced] = useState(false);

  // Modals
  const [showAddDebt, setShowAddDebt] = useState(false);
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [showTransfer, setShowTransfer] = useState(false);
  const [showAddCat, setShowAddCat] = useState(false);
  const [editingTx, setEditingTx] = useState(null); // transaction being edited

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
  const [newCat, setNewCat] = useState("");

  // New debt/expense forms
  const [newDebt, setNewDebt] = useState({name:"",amount:"",currency:"EUR",totalInstallments:"",remaining:"",category:"eur",icon:"💳",amountTHB:"",isRolling:false});
  const [newExpense, setNewExpense] = useState({name:"",amount:"",amountTHB:"",isTHB:false,icon:"💰"});

  // Report
  const [reportMonth, setReportMonth] = useState(new Date().getMonth());
  const [reportYear, setReportYear] = useState(2026);

  useEffect(() => {
    (async () => {
      const data = await fbLoad();
      if (data) {
        if (data.debts) setDebtsState(data.debts);
        if (data.expenses) setExpensesState(data.expenses);
        if (data.transactions) setTxnsState(data.transactions);
        if (data.settings) setSettingsState(data.settings);
        if (data.categories) setCategoriesState(data.categories);
      }
      setLoaded(true);
    })();
  }, []);

  const toast = (msg, color="#22c55e") => { setNotif({msg,color}); setTimeout(()=>setNotif(null),3000); };

  const sync = async (d,e,t,s,c) => {
    setSyncing(true);
    await fbSave({debts:d,expenses:e,transactions:t,settings:s,categories:c});
    setSyncing(false); setSynced(true); setTimeout(()=>setSynced(false),2000);
  };

  const saveDebts = d => { setDebtsState(d); sync(d,expenses,transactions,settings,categories); };
  const saveExpenses = e => { setExpensesState(e); sync(debts,e,transactions,settings,categories); };
  const saveTxns = t => { setTxnsState(t); sync(debts,expenses,t,settings,categories); };
  const saveSettings = s => { setSettingsState(s); sync(debts,expenses,transactions,s,categories); };
  const saveCats = c => { setCategoriesState(c); sync(debts,expenses,transactions,settings,c); };

  // Stats
  const monthlyDebt = debts.reduce((s,d)=>s+d.amount,0);
  const monthlyFixed = expenses.reduce((s,e)=>s+e.amount,0);
  const totalMonthly = monthlyDebt+monthlyFixed;
  const balance = settings.monthlyIncome - totalMonthly;
  const totalDebtEUR = debts.filter(d=>!d.isRolling).reduce((s,d)=>s+d.amount*d.remaining,0);
  const maxMonths = Math.max(...debts.filter(d=>!d.isRolling).map(d=>d.remaining),0);
  const debtFreeDate = new Date(2026,4); debtFreeDate.setMonth(debtFreeDate.getMonth()+maxMonths);

  // Cumulative monthly balance
  const monthlyBalances = calcMonthlyBalances(transactions, reportYear);
  const currentMonthBal = monthlyBalances[new Date().getMonth()];

  // Projection with carryover
  const projection = (() => {
    const fixedExp = expenses.reduce((s,e)=>s+e.amount,0);
    let carry = 0; const res = [];
    for (let m=4; m<12; m++) {
      const activeDebt = debts.filter(d=>d.remaining-(m-4)>0).reduce((s,d)=>s+d.amount,0);
      const bal = settings.monthlyIncome - activeDebt - fixedExp;
      carry += bal;
      res.push({month:MONTHS[m], balance:bal, cumulative:carry});
    }
    return res;
  })();
  const yearEndSavings = projection[projection.length-1]?.cumulative||0;
  const maxBar = Math.max(...projection.map(s=>Math.abs(s.cumulative)),1);

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
    saveTxns([...txs,...transactions]);
    setShowTransfer(false); setTransferAmt(""); setTransferSplit(null);
    toast(`✅ บันทึกโอน ${fmtTHB(parseFloat(transferAmt))} แล้ว`);
  };

  // Quick entry
  const addQuickEntry = () => {
    if(!qAmt||!qName) return;
    const isInc = qCat==="รายรับ";
    saveTxns([{id:uid(),date:qDate,name:qName,category:qCat,amount:isInc?parseFloat(qAmt):-parseFloat(qAmt),method:qMethod},...transactions]);
    setQName(""); setQAmt(""); toast(`✅ บันทึก "${qName}" แล้ว`);
  };

  // Edit transaction
  const saveEditTx = () => {
    if(!editingTx) return;
    saveTxns(transactions.map(t=>t.id===editingTx.id?editingTx:t));
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
  const removeCategory = cat => { saveCats(categories.filter(c=>c!==cat)); };

  // Report data
  const reportTxns = transactions.filter(t=>{const d=new Date(t.date);return d.getMonth()===reportMonth&&d.getFullYear()===reportYear;});
  const reportInc = reportTxns.filter(t=>t.amount>0).reduce((s,t)=>s+t.amount,0);
  const reportExp = reportTxns.filter(t=>t.amount<0).reduce((s,t)=>s+t.amount,0);
  const reportBal = reportInc+reportExp;
  const reportByCat = reportTxns.filter(t=>t.amount<0).reduce((acc,t)=>{acc[t.category]=(acc[t.category]||0)+Math.abs(t.amount);return acc;},{});
  const monthlyBals = calcMonthlyBalances(transactions, reportYear);

  const S = { // Styles shorthand
    card: {background:"#161921",border:"1px solid #1e2230",borderRadius:16,padding:16,marginBottom:12},
    cardSm: {background:"#1a1e2a",border:"1px solid #252a3a",borderRadius:12,padding:12},
    inp: {background:"#1a1e2a",border:"1px solid #252a3a",borderRadius:8,padding:"8px 12px",color:"#e8eaf0",fontFamily:"inherit",fontSize:13,width:"100%",outline:"none"},
    inpSm: {background:"#0d1117",border:"1px solid #2563eb44",borderRadius:6,padding:"4px 8px",color:"#93c5fd",fontFamily:"'Space Mono',monospace",fontSize:13,width:80,outline:"none",textAlign:"right"},
    btn: {background:"#3b82f6",color:"white",border:"none",borderRadius:10,padding:"11px 18px",fontFamily:"inherit",fontSize:14,fontWeight:600,cursor:"pointer",width:"100%"},
    btnSm: {background:"#1e2230",color:"#94a3b8",border:"1px solid #252a3a",borderRadius:8,padding:"6px 12px",fontFamily:"inherit",fontSize:12,cursor:"pointer"},
    btnDanger: {background:"#7f1d1d",color:"#fca5a5",border:"none",borderRadius:6,padding:"4px 10px",fontFamily:"inherit",fontSize:11,cursor:"pointer"},
    label: {fontSize:10,fontWeight:700,letterSpacing:"0.12em",color:"#4b5563",textTransform:"uppercase",marginBottom:8},
    prog: {height:5,background:"#1e2230",borderRadius:3,overflow:"hidden",marginTop:8},
  };

  if(!loaded) return (
    <div style={{background:"#0d0f14",minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",color:"#64748b",fontFamily:"Sarabun,sans-serif",flexDirection:"column",gap:12}}>
      <div style={{fontSize:48}}>💰</div>
      <div>กำลังโหลดข้อมูลจาก Cloud...</div>
      <div style={{fontSize:11}}>🔥 Firebase Sync</div>
    </div>
  );

  return (
    <div style={{fontFamily:"'Sarabun',sans-serif",background:"#0d0f14",minHeight:"100vh",color:"#e8eaf0",maxWidth:480,margin:"0 auto",paddingBottom:80}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sarabun:wght@300;400;500;600;700&family=Space+Mono:wght@400;700&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;}::-webkit-scrollbar{width:0;}
        .inp:focus{border-color:#3b82f6!important;}
        .btn:hover{opacity:0.88;}
        .modal-bg{position:fixed;inset:0;background:rgba(0,0,0,0.78);backdrop-filter:blur(6px);z-index:100;display:flex;align-items:flex-end;justify-content:center;}
        .modal{background:#161921;border:1px solid #1e2230;border-radius:20px 20px 0 0;padding:24px;width:100%;max-width:480px;max-height:90vh;overflow-y:auto;}
        .pill{display:inline-block;padding:2px 8px;border-radius:20px;font-size:10px;font-weight:700;}
        input[type="date"]{color-scheme:dark;}
        @media print{.no-print{display:none!important;}}
        @keyframes slideIn{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
      `}</style>

      {/* Sync bar */}
      {syncing && <div style={{position:"fixed",top:0,left:0,right:0,height:3,background:"linear-gradient(90deg,#3b82f6,#22c55e,#3b82f6)",backgroundSize:"200%",zIndex:999,animation:"wave 1s linear infinite"}}/>}
      {synced && <div style={{position:"fixed",top:0,left:0,right:0,height:3,background:"#22c55e",zIndex:999}}/>}
      {notif && <div style={{position:"fixed",top:20,left:"50%",transform:"translateX(-50%)",background:notif.color,color:"white",padding:"10px 20px",borderRadius:12,fontWeight:600,fontSize:13,zIndex:999,boxShadow:"0 4px 20px rgba(0,0,0,0.4)",whiteSpace:"nowrap",animation:"slideIn 0.3s ease"}}>{notif.msg}</div>}

      {/* HEADER */}
      <div style={{padding:"20px 20px 0",background:"linear-gradient(180deg,#0d1117,#0d0f14)"}}>
        <div style={{marginBottom:16,paddingTop:8,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div>
            <div style={{fontSize:10,color:"#4b5563",fontWeight:700,letterSpacing:"0.1em",textTransform:"uppercase"}}>Finance Tracker</div>
            <div style={{fontSize:20,fontWeight:700,color:"#f1f5f9"}}>สวัสดี 👋</div>
          </div>
          <div style={{fontSize:10,color:"#22c55e",background:"#0f2a1a",padding:"4px 10px",borderRadius:20}}>🔥 Cloud Sync</div>
        </div>

        {/* Hero */}
        <div style={{background:"linear-gradient(135deg,#1e3a5f,#1565c0,#0288d1)",borderRadius:20,padding:20,marginBottom:16,boxShadow:"0 8px 32px rgba(37,99,235,0.25)",position:"relative",overflow:"hidden"}}>
          <div style={{position:"absolute",top:-20,right:-20,width:100,height:100,background:"rgba(255,255,255,0.06)",borderRadius:"50%"}}/>
          <div style={{fontSize:10,color:"rgba(255,255,255,0.55)",fontWeight:700,letterSpacing:"0.1em",textTransform:"uppercase"}}>รายรับ/เดือน</div>
          <div style={{fontSize:34,fontWeight:700,color:"white",fontFamily:"'Space Mono',monospace",lineHeight:1.2,marginTop:4}}>{fmt(settings.monthlyIncome)}</div>
          <div style={{display:"flex",gap:12,marginTop:14,flexWrap:"wrap"}}>
            {[{l:"รายจ่ายรวม",v:fmt(totalMonthly),c:"#fca5a5"},{l:"คงเหลือ/เดือน",v:(balance>=0?"+":"")+fmt(balance),c:balance>=0?"#86efac":"#fca5a5"},{l:"เก็บได้ปีนี้",v:fmt(yearEndSavings),c:"#fde68a"}].map(s=>(
              <div key={s.l}><div style={{fontSize:9,color:"rgba(255,255,255,0.45)",marginBottom:2}}>{s.l}</div><div style={{fontSize:13,fontWeight:700,color:s.c,fontFamily:"'Space Mono',monospace"}}>{s.v}</div></div>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:16}}>
          {[{l:"หนี้ทั้งหมด",v:fmt(totalDebtEUR),c:"#f87171",i:"💸"},{l:"จ่าย/เดือน",v:fmt(monthlyDebt),c:"#fb923c",i:"📅"},{l:"หมดหนี้ใหญ่",v:debtFreeDate.getFullYear()+"",c:"#a78bfa",i:"🎯"}].map(s=>(
            <div key={s.l} style={{...S.cardSm,textAlign:"center",padding:10}}>
              <div style={{fontSize:16,marginBottom:2}}>{s.i}</div>
              <div style={{fontSize:12,fontWeight:700,color:s.c,fontFamily:"'Space Mono',monospace"}}>{s.v}</div>
              <div style={{fontSize:9,color:"#4b5563",marginTop:1}}>{s.l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* TABS */}
      <div style={{display:"flex",gap:4,padding:"0 20px",marginBottom:14,overflowX:"auto"}} className="no-print">
        {[{id:"dashboard",i:"📊",l:"ภาพรวม"},{id:"debts",i:"💳",l:"หนี้สิน"},{id:"expenses",i:"🧾",l:"ค่าใช้จ่าย"},{id:"add",i:"✏️",l:"บันทึก"},{id:"history",i:"📋",l:"ประวัติ"},{id:"report",i:"📄",l:"Report"}].map(t=>(
          <button key={t.id} onClick={()=>setActiveTab(t.id)} style={{background:activeTab===t.id?"#3b82f6":"#161921",color:activeTab===t.id?"white":"#64748b",border:`1px solid ${activeTab===t.id?"#3b82f6":"#1e2230"}`,borderRadius:10,padding:"7px 12px",fontSize:11,fontWeight:600,cursor:"pointer",whiteSpace:"nowrap",fontFamily:"inherit"}}>{t.i} {t.l}</button>
        ))}
      </div>

      <div style={{padding:"0 20px"}}>

        {/* ===== DASHBOARD ===== */}
        {activeTab==="dashboard" && (
          <div>
            <div style={S.card}>
              <div style={S.label}>📈 ยอดสะสม พ.ค.–ธ.ค. 2026 (ทบจากเดือนก่อน)</div>
              <div style={{display:"flex",gap:5,alignItems:"flex-end",height:80}}>
                {projection.map((s,i)=>{
                  const h = Math.max(4,Math.abs(s.cumulative)/maxBar*64);
                  return (
                    <div key={i} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:3}}>
                      <div style={{fontSize:8,color:s.cumulative>=0?"#22c55e":"#f87171",fontFamily:"'Space Mono',monospace",textAlign:"center"}}>{s.cumulative>=0?"+":""}{Math.round(s.cumulative)}</div>
                      <div style={{width:"100%",height:h,background:s.cumulative>=0?"linear-gradient(180deg,#22c55e,#16a34a)":"linear-gradient(180deg,#ef4444,#dc2626)",borderRadius:"4px 4px 0 0"}}/>
                      <div style={{fontSize:8,color:"#4b5563"}}>{s.month}</div>
                    </div>
                  );
                })}
              </div>
              <div style={{marginTop:10,background:"#1a1e2a",borderRadius:8,padding:"8px 12px",display:"flex",justifyContent:"space-between",fontSize:12}}>
                <span style={{color:"#64748b"}}>ยอดสะสมสิ้นปี 2026</span>
                <span style={{color:yearEndSavings>=0?"#fde68a":"#f87171",fontWeight:700,fontFamily:"'Space Mono',monospace"}}>{yearEndSavings>=0?"+":""}{fmt(yearEndSavings)}</span>
              </div>
            </div>

            <div style={S.card}>
              <div style={S.label}>🗓️ Timeline หมดหนี้</div>
              {debts.filter(d=>!d.isRolling&&d.remaining>0).sort((a,b)=>a.remaining-b.remaining).slice(0,6).map(d=>{
                const pct=Math.round(((d.totalInstallments-d.remaining)/Math.max(d.totalInstallments,1))*100);
                const fin=new Date(2026,4); fin.setMonth(fin.getMonth()+d.remaining);
                return (
                  <div key={d.id} style={{marginBottom:10}}>
                    <div style={{display:"flex",justifyContent:"space-between",fontSize:12,marginBottom:3}}>
                      <span>{d.icon} {d.name}</span>
                      <span style={{color:"#64748b",fontSize:11}}>{MONTHS[fin.getMonth()]} {fin.getFullYear()}</span>
                    </div>
                    <div style={S.prog}><div style={{height:"100%",borderRadius:3,width:`${pct}%`,background:pct>=75?"#22c55e":pct>=40?"#f59e0b":"#3b82f6"}}/></div>
                    <div style={{fontSize:9,color:"#4b5563",marginTop:2}}>{pct}% ชำระแล้ว • เหลือ {d.remaining} งวด</div>
                  </div>
                );
              })}
            </div>

            <div style={{...S.card,background:"#0f1a0f",borderColor:"#22c55e22"}}>
              <div style={{fontSize:11,color:"#22c55e",fontWeight:700,marginBottom:6}}>💡 Insight</div>
              <div style={{fontSize:12,color:"#d1d5db",lineHeight:1.7}}>
                หนี้สั้นที่จะหมดเร็วๆ นี้ รวม ~{fmt(debts.filter(d=>d.remaining<=4&&d.category==="thai").reduce((s,d)=>s+d.amount,0))}/เดือน<br/>
                <span style={{color:"#86efac"}}>หมดหนี้ทั้งหมด: {debtFreeDate.toLocaleDateString("th-TH",{month:"long",year:"numeric"})}</span>
              </div>
            </div>

            {/* Settings inline */}
            <div style={S.card}>
              <div style={S.label}>⚙️ ตั้งค่า</div>
              <div style={{display:"flex",gap:8,alignItems:"center",marginBottom:8}}>
                <span style={{fontSize:12,color:"#64748b",flex:1}}>รายรับ/เดือน (€)</span>
                <input className="inp" style={{...S.inpSm,width:100}} value={settings.monthlyIncome} onChange={e=>saveSettings({...settings,monthlyIncome:parseFloat(e.target.value)||0})}/>
              </div>
              <div style={{display:"flex",gap:8,alignItems:"center"}}>
                <span style={{fontSize:12,color:"#64748b",flex:1}}>อัตราแลกเปลี่ยน (THB/EUR)</span>
                <input className="inp" style={{...S.inpSm,width:70}} value={settings.exchangeRate} onChange={e=>saveSettings({...settings,exchangeRate:parseFloat(e.target.value)||35})}/>
              </div>
            </div>
          </div>
        )}

        {/* ===== DEBTS ===== */}
        {activeTab==="debts" && (
          <div>
            <div style={S.label}>หนี้ EUR (NL)</div>
            {debts.filter(d=>d.category==="eur").map(d=>(
              <div key={d.id} style={{...S.card,padding:14}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
                  <div style={{display:"flex",gap:10,alignItems:"center",flex:1}}>
                    <span style={{fontSize:20}}>{d.icon}</span>
                    <div style={{flex:1}}>
                      <input className="inp" style={{marginBottom:4,fontSize:13,fontWeight:600,background:"transparent",border:"none",borderBottom:"1px solid #1e2230",borderRadius:0,padding:"2px 0"}} value={d.name} onChange={e=>updateDebt(d.id,"name",e.target.value)}/>
                      <div style={{fontSize:10,color:"#64748b"}}>{d.isRolling?"จ่ายยอดเต็มสิ้นเดือน":`เหลือ ${d.remaining} งวด`}</div>
                    </div>
                  </div>
                  <div style={{textAlign:"right"}}>
                    <input style={{...S.inpSm}} value={d.amount.toFixed(2)} onChange={e=>updateDebt(d.id,"amount",e.target.value)}/>
                    <div style={{fontSize:9,color:"#4b5563"}}>€/เดือน</div>
                  </div>
                </div>
                {!d.isRolling && (
                  <div style={{display:"flex",gap:8,marginTop:8,alignItems:"center"}}>
                    <span style={{fontSize:11,color:"#64748b"}}>เหลือ</span>
                    <input style={{...S.inpSm,width:55}} value={d.remaining} onChange={e=>updateDebt(d.id,"remaining",e.target.value)}/>
                    <span style={{fontSize:11,color:"#64748b"}}>/</span>
                    <input style={{...S.inpSm,width:55}} value={d.totalInstallments} onChange={e=>updateDebt(d.id,"totalInstallments",e.target.value)}/>
                    <span style={{fontSize:11,color:"#64748b"}}>งวด</span>
                    <button style={S.btnDanger} onClick={()=>removeDebt(d.id)}>🗑️</button>
                  </div>
                )}
                {d.isRolling && <button style={{...S.btnDanger,marginTop:8}} onClick={()=>removeDebt(d.id)}>🗑️ ลบ</button>}
                {!d.isRolling && <div style={S.prog}><div style={{height:"100%",borderRadius:3,width:`${Math.round(((d.totalInstallments-d.remaining)/Math.max(d.totalInstallments,1))*100)}%`,background:"#3b82f6"}}/></div>}
              </div>
            ))}

            <div style={{...S.label,marginTop:8}}>หนี้ไทย (THB)</div>
            <button style={{...S.btn,marginBottom:12,background:"#f59e0b"}} onClick={()=>setShowTransfer(true)}>🇹🇭 โอนเงินกลับไทย (Auto-Split)</button>
            {debts.filter(d=>d.category==="thai").map(d=>(
              <div key={d.id} style={{...S.card,padding:14}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
                  <div style={{display:"flex",gap:10,alignItems:"center",flex:1}}>
                    <span style={{fontSize:20}}>{d.icon}</span>
                    <div style={{flex:1}}>
                      <input className="inp" style={{marginBottom:4,fontSize:13,fontWeight:600,background:"transparent",border:"none",borderBottom:"1px solid #1e2230",borderRadius:0,padding:"2px 0"}} value={d.name} onChange={e=>updateDebt(d.id,"name",e.target.value)}/>
                      <div style={{fontSize:10,color:"#64748b"}}>เหลือ {d.remaining} งวด</div>
                    </div>
                  </div>
                  <div style={{textAlign:"right"}}>
                    <input style={{...S.inpSm,color:"#fb923c"}} value={d.amountTHB||Math.round(d.amount*settings.exchangeRate)} onChange={e=>updateDebt(d.id,"amountTHB",e.target.value)}/>
                    <div style={{fontSize:10,color:"#64748b"}}>฿/เดือน</div>
                  </div>
                </div>
                <div style={{display:"flex",gap:8,marginTop:8,alignItems:"center"}}>
                  <span style={{fontSize:11,color:"#64748b"}}>เหลือ</span>
                  <input style={{...S.inpSm,width:55}} value={d.remaining} onChange={e=>updateDebt(d.id,"remaining",e.target.value)}/>
                  <span style={{fontSize:11,color:"#64748b"}}>/</span>
                  <input style={{...S.inpSm,width:55}} value={d.totalInstallments} onChange={e=>updateDebt(d.id,"totalInstallments",e.target.value)}/>
                  <span style={{fontSize:11,color:"#64748b"}}>งวด</span>
                  <button style={S.btnDanger} onClick={()=>removeDebt(d.id)}>🗑️</button>
                </div>
                <div style={S.prog}><div style={{height:"100%",borderRadius:3,width:`${Math.round(((d.totalInstallments-d.remaining)/Math.max(d.totalInstallments,1))*100)}%`,background:"#f59e0b"}}/></div>
              </div>
            ))}

            <button style={{...S.btn,background:"#22c55e",marginTop:4}} onClick={()=>setShowAddDebt(true)}>➕ เพิ่มหนี้ใหม่</button>
            <div style={{...S.card,background:"#0f1a0f",borderColor:"#22c55e22",marginTop:12}}>
              <div style={{fontSize:11,color:"#22c55e",fontWeight:700,marginBottom:8}}>💰 รวมต้องจ่าย/เดือน</div>
              {[["หนี้สิน",monthlyDebt,"#f87171"],["ค่าใช้จ่ายประจำ",monthlyFixed,"#fb923c"]].map(([l,v,c])=>(
                <div key={l} style={{display:"flex",justifyContent:"space-between",marginBottom:4,fontSize:13}}>
                  <span style={{color:"#64748b"}}>{l}</span>
                  <span style={{fontFamily:"'Space Mono',monospace",color:c}}>{fmt(v)}</span>
                </div>
              ))}
              <div style={{display:"flex",justifyContent:"space-between",borderTop:"1px solid #1e2230",paddingTop:8,fontSize:15}}>
                <span style={{fontWeight:700}}>รวม</span>
                <span style={{fontFamily:"'Space Mono',monospace",fontWeight:700}}>{fmt(totalMonthly)}</span>
              </div>
            </div>
          </div>
        )}

        {/* ===== EXPENSES ===== */}
        {activeTab==="expenses" && (
          <div>
            <div style={S.label}>ค่าใช้จ่ายประจำ (แก้ได้เลย)</div>
            {expenses.map(e=>(
              <div key={e.id} style={{...S.card,padding:"12px 14px"}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <div style={{display:"flex",gap:8,alignItems:"center",flex:1}}>
                    <span style={{fontSize:18}}>{e.icon}</span>
                    <input className="inp" style={{background:"transparent",border:"none",borderBottom:"1px solid #1e2230",borderRadius:0,padding:"2px 0",fontSize:13,fontWeight:500}} value={e.name} onChange={ev=>updateExpense(e.id,"name",ev.target.value)}/>
                  </div>
                  <div style={{display:"flex",gap:6,alignItems:"center"}}>
                    <input style={{...S.inpSm,color:e.amountTHB?"#fb923c":"#f87171"}} value={e.amountTHB||e.amount.toFixed(2)} onChange={ev=>updateExpense(e.id,e.amountTHB?"amountTHB":"amount",ev.target.value)}/>
                    <span style={{fontSize:10,color:"#4b5563"}}>{e.amountTHB?"฿":"€"}</span>
                    <button style={S.btnDanger} onClick={()=>removeExpense(e.id)}>🗑️</button>
                  </div>
                </div>
              </div>
            ))}
            <button style={{...S.btn,background:"#22c55e",marginTop:4}} onClick={()=>setShowAddExpense(true)}>➕ เพิ่มค่าใช้จ่ายใหม่</button>
            <div style={{...S.card,marginTop:12,background:"#0f1a0f",borderColor:"#22c55e22"}}>
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
              <div style={S.label}>✏️ บันทึกรายการ</div>
              <div style={{display:"flex",flexDirection:"column",gap:10}}>
                <input className="inp" placeholder="ชื่อรายการ..." value={qName} onChange={e=>setQName(e.target.value)}/>
                <input className="inp" type="number" placeholder="ยอดเงิน (EUR)" value={qAmt} onChange={e=>setQAmt(e.target.value)}/>
                <div style={{display:"flex",gap:8,alignItems:"center"}}>
                  <span style={{fontSize:12,color:"#64748b",whiteSpace:"nowrap"}}>📅 วันที่</span>
                  <input className="inp" type="date" value={qDate} onChange={e=>setQDate(e.target.value)}/>
                </div>
                {/* Category dropdown */}
                <div style={{display:"flex",gap:8}}>
                  <select className="inp" value={qCat} onChange={e=>setQCat(e.target.value)} style={{flex:1}}>
                    {categories.map(c=><option key={c}>{c}</option>)}
                  </select>
                  <button style={{...S.btnSm,whiteSpace:"nowrap"}} onClick={()=>setShowAddCat(true)}>+ หมวด</button>
                </div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr",gap:6}}>
                  {["Debit","Amex","Shopee","Income"].map(m=>(
                    <button key={m} onClick={()=>setQMethod(m)} style={{background:qMethod===m?"#3b82f6":"#1a1e2a",color:qMethod===m?"white":"#64748b",border:`1px solid ${qMethod===m?"#3b82f6":"#252a3a"}`,borderRadius:8,padding:"8px 4px",fontSize:11,cursor:"pointer",fontFamily:"inherit"}}>{m}</button>
                  ))}
                </div>
                <button style={S.btn} onClick={addQuickEntry}>💾 บันทึก</button>
              </div>
            </div>

            <div style={{...S.card,background:"#1a110d",borderColor:"#f59e0b33"}}>
              <div style={{...S.label,color:"#f59e0b"}}>🔔 รายการประจำวันที่ 27</div>
              {[{n:"เงินเดือน Greenfood",v:`+${fmt(settings.monthlyIncome)}`,c:"#22c55e"},{n:"หนี้บ้านไทย ABN",v:`-${fmt(260)}`,c:"#f87171"},{n:"โอนหนี้ไทยทั้งหมด",v:`~${fmtTHB(debts.filter(d=>d.category==="thai"&&d.remaining>0).reduce((s,d)=>s+(d.amountTHB||d.amount*settings.exchangeRate),0))}`,c:"#f59e0b"},{n:"ประกันสุขภาพ VGZ",v:`-${fmt(149.9)}`,c:"#f87171"}].map((item,i)=>(
                <div key={i} style={{display:"flex",justifyContent:"space-between",padding:"7px 0",borderBottom:"1px solid #1e2230",fontSize:12}}>
                  <span>{item.n}</span><span style={{color:item.c,fontFamily:"'Space Mono',monospace",fontWeight:700}}>{item.v}</span>
                </div>
              ))}
              <button style={{...S.btn,marginTop:12,background:"#f59e0b"}} onClick={()=>{
                const t=today();
                saveTxns([{id:uid(),date:t,name:"เงินเดือน Greenfood",category:"รายรับ",amount:settings.monthlyIncome,method:"Income"},{id:uid(),date:t,name:"หนี้บ้านไทย ABN",category:"หนี้บ้านไทย ABN",amount:-260,method:"Debit"},{id:uid(),date:t,name:"ประกันสุขภาพ VGZ",category:"ประกัน",amount:-149.9,method:"Debit"},...transactions]);
                toast("✅ บันทึกรายการประจำเดือนแล้ว!");
              }}>✅ ยืนยันรายการประจำเดือน</button>
            </div>
            <button style={{...S.btn,background:"#7c3aed"}} onClick={()=>setShowTransfer(true)}>🇹🇭 โอนเงินกลับไทย (Auto-Split)</button>
          </div>
        )}

        {/* ===== HISTORY ===== */}
        {activeTab==="history" && (
          <div>
            <div style={S.label}>ประวัติ ({transactions.length} รายการ)</div>
            {transactions.map((tx,i)=>(
              <div key={tx.id||i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 0",borderBottom:"1px solid #1e2230"}}>
                <div style={{display:"flex",gap:10,alignItems:"center",flex:1}}>
                  <div style={{width:34,height:34,borderRadius:10,display:"flex",alignItems:"center",justifyContent:"center",fontSize:15,background:tx.amount>0?"#0f2a1a":"#1a0f0f",flexShrink:0}}>
                    {tx.amount>0?"💵":tx.category?.includes("หนี้")?"💸":"🛒"}
                  </div>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontSize:13,fontWeight:500,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{tx.name}</div>
                    <div style={{fontSize:10,color:"#4b5563"}}>{tx.date} · {tx.method} · {tx.category}</div>
                  </div>
                </div>
                <div style={{display:"flex",gap:6,alignItems:"center",flexShrink:0}}>
                  <div style={{textAlign:"right"}}>
                    <div style={{fontSize:13,fontWeight:700,fontFamily:"'Space Mono',monospace",color:tx.amount>0?"#22c55e":"#f87171"}}>{tx.amount>0?"+":""}{fmt(tx.amount)}</div>
                  </div>
                  <button style={{...S.btnSm,padding:"4px 8px"}} onClick={()=>setEditingTx({...tx})}>✏️</button>
                  <button style={S.btnDanger} onClick={()=>deleteTx(tx.id)}>🗑️</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ===== REPORT ===== */}
        {activeTab==="report" && (
          <div>
            <div style={{...S.card,padding:"12px 14px"}} className="no-print">
              <div style={{display:"flex",gap:8,alignItems:"center"}}>
                <select className="inp" style={{flex:1}} value={reportMonth} onChange={e=>setReportMonth(parseInt(e.target.value))}>
                  {MONTHS.map((m,i)=><option key={i} value={i}>{m}</option>)}
                </select>
                <select className="inp" style={{width:90}} value={reportYear} onChange={e=>setReportYear(parseInt(e.target.value))}>
                  {[2025,2026,2027].map(y=><option key={y} value={y}>{y}</option>)}
                </select>
                <button style={S.btnSm} onClick={()=>window.print()}>🖨️</button>
              </div>
            </div>

            <div style={{...S.card,background:"linear-gradient(135deg,#1e3a5f,#1565c0)",padding:"16px 20px"}}>
              <div style={{fontSize:11,color:"rgba(255,255,255,0.5)",fontWeight:700,letterSpacing:"0.1em"}}>MONTHLY REPORT</div>
              <div style={{fontSize:20,fontWeight:700,color:"white",marginTop:4}}>{MONTHS[reportMonth]} {reportYear}</div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10,marginTop:12}}>
                {[["รายรับ",reportInc,"#86efac"],["รายจ่าย",reportExp,"#fca5a5"],["คงเหลือ",reportBal,reportBal>=0?"#86efac":"#fca5a5"]].map(([l,v,c])=>(
                  <div key={l} style={{textAlign:"center",background:"rgba(255,255,255,0.08)",borderRadius:10,padding:"10px 6px"}}>
                    <div style={{fontSize:9,color:"rgba(255,255,255,0.45)",marginBottom:4}}>{l}</div>
                    <div style={{fontSize:13,fontWeight:700,color:c,fontFamily:"'Space Mono',monospace"}}>{(v>0?"+":"")+fmt(v)}</div>
                  </div>
                ))}
              </div>
              {/* Cumulative */}
              <div style={{marginTop:12,background:"rgba(0,0,0,0.2)",borderRadius:10,padding:"8px 12px",display:"flex",justifyContent:"space-between",fontSize:12}}>
                <span style={{color:"rgba(255,255,255,0.5)"}}>ยอดสะสม (ทบจากก่อน)</span>
                <span style={{fontFamily:"'Space Mono',monospace",fontWeight:700,color:monthlyBals[reportMonth]?.cumulative>=0?"#86efac":"#fca5a5"}}>
                  {(monthlyBals[reportMonth]?.cumulative>=0?"+":"")+fmt(monthlyBals[reportMonth]?.cumulative||0)}
                </span>
              </div>
            </div>

            <div style={S.card}>
              <div style={S.label}>รายจ่ายตามหมวด</div>
              {Object.entries(reportByCat).sort((a,b)=>b[1]-a[1]).map(([cat,amt])=>{
                const pct=Math.round((amt/Math.abs(reportExp||1))*100);
                return (
                  <div key={cat} style={{marginBottom:10}}>
                    <div style={{display:"flex",justifyContent:"space-between",fontSize:12,marginBottom:3}}>
                      <span>{cat}</span>
                      <span style={{fontFamily:"'Space Mono',monospace",color:"#f87171"}}>{fmt(amt)} ({pct}%)</span>
                    </div>
                    <div style={S.prog}><div style={{height:"100%",borderRadius:3,width:`${pct}%`,background:"#3b82f6"}}/></div>
                  </div>
                );
              })}
              {Object.keys(reportByCat).length===0&&<div style={{color:"#4b5563",fontSize:12,textAlign:"center",padding:"16px 0"}}>ยังไม่มีข้อมูลเดือนนี้</div>}
            </div>

            {/* Yearly with cumulative */}
            <div style={S.card}>
              <div style={S.label}>สรุปรายปี {reportYear} (พร้อมยอดทบ)</div>
              <div style={{display:"flex",justifyContent:"space-between",fontSize:9,color:"#4b5563",marginBottom:6,paddingBottom:4,borderBottom:"1px solid #1e2230"}}>
                <span style={{width:36}}>เดือน</span>
                <span>รายรับ</span><span>รายจ่าย</span><span>เดือนนี้</span><span style={{color:"#fde68a"}}>ยอดสะสม</span>
              </div>
              {MONTHS.map((m,mi)=>{
                const txs=transactions.filter(t=>{const d=new Date(t.date);return d.getMonth()===mi&&d.getFullYear()===reportYear;});
                const inc=txs.filter(t=>t.amount>0).reduce((s,t)=>s+t.amount,0);
                const exp=txs.filter(t=>t.amount<0).reduce((s,t)=>s+t.amount,0);
                const bal=inc+exp;
                const cum=monthlyBals[mi]?.cumulative||0;
                const hasData=txs.length>0;
                return (
                  <div key={m} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"6px 0",borderBottom:"1px solid #1e2230",fontSize:11,opacity:hasData?1:0.35}}>
                    <span style={{color:"#94a3b8",width:36}}>{m}</span>
                    <span style={{color:"#22c55e",fontFamily:"'Space Mono',monospace",fontSize:10}}>{hasData?fmt(inc):"-"}</span>
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
            <div style={{fontSize:17,fontWeight:700,marginBottom:4}}>🇹🇭 โอนเงินกลับไทย</div>
            <div style={{fontSize:11,color:"#64748b",marginBottom:12}}>ระบบแบ่งจ่ายหนี้ไทยให้อัตโนมัติ</div>
            <div style={{display:"flex",gap:8,alignItems:"center",marginBottom:10}}>
              <span style={{fontSize:12,color:"#64748b",whiteSpace:"nowrap"}}>📅 วันที่</span>
              <input className="inp" type="date" value={transferDate} onChange={e=>setTransferDate(e.target.value)}/>
            </div>
            <div style={{display:"flex",gap:8,marginBottom:12}}>
              <input className="inp" type="number" placeholder="ยอดโอน (บาท)" value={transferAmt} onChange={e=>setTransferAmt(e.target.value)}/>
              <button style={S.btnSm} onClick={handleThaiTransfer}>คำนวณ</button>
            </div>
            {transferSplit&&(
              <div>
                {transferSplit.split.map(d=>(
                  <div key={d.id} style={{display:"flex",justifyContent:"space-between",padding:"7px 0",borderBottom:"1px solid #1e2230",fontSize:13}}>
                    <span>{d.icon} {d.name}</span>
                    <span style={{color:"#f87171",fontFamily:"'Space Mono',monospace"}}>฿{d.paidTHB.toLocaleString()}</span>
                  </div>
                ))}
                {transferSplit.remaining>0&&<div style={{display:"flex",justifyContent:"space-between",padding:"7px 0",fontSize:13,color:"#86efac"}}><span>👩 ให้แม่</span><span>฿{Math.round(transferSplit.remaining).toLocaleString()}</span></div>}
                <button style={{...S.btn,marginTop:12}} onClick={confirmTransfer}>✅ ยืนยัน</button>
              </div>
            )}
            <button onClick={()=>{setShowTransfer(false);setTransferSplit(null);}} style={{width:"100%",marginTop:8,background:"none",border:"none",color:"#64748b",fontSize:13,cursor:"pointer",fontFamily:"inherit",padding:8}}>ยกเลิก</button>
          </div>
        </div>
      )}

      {/* Add Debt */}
      {showAddDebt&&(
        <div className="modal-bg" onClick={e=>e.target===e.currentTarget&&setShowAddDebt(false)}>
          <div className="modal">
            <div style={{fontSize:17,fontWeight:700,marginBottom:16}}>➕ เพิ่มหนี้ใหม่</div>
            <div style={{display:"flex",flexDirection:"column",gap:10}}>
              <input className="inp" placeholder="ชื่อหนี้" value={newDebt.name} onChange={e=>setNewDebt({...newDebt,name:e.target.value})}/>
              <select className="inp" value={newDebt.currency} onChange={e=>setNewDebt({...newDebt,currency:e.target.value,category:e.target.value==="THB"?"thai":"eur"})}>
                <option value="EUR">EUR (หนี้ NL)</option>
                <option value="THB">THB (หนี้ไทย)</option>
              </select>
              {newDebt.currency==="EUR"
                ?<input className="inp" type="number" placeholder="ยอด/เดือน (EUR)" value={newDebt.amount} onChange={e=>setNewDebt({...newDebt,amount:e.target.value})}/>
                :<input className="inp" type="number" placeholder="ยอด/เดือน (บาท)" value={newDebt.amountTHB} onChange={e=>setNewDebt({...newDebt,amountTHB:e.target.value,amount:parseFloat(e.target.value)/settings.exchangeRate})}/>}
              <div style={{display:"flex",gap:8}}>
                <input className="inp" type="number" placeholder="งวดทั้งหมด" value={newDebt.totalInstallments} onChange={e=>setNewDebt({...newDebt,totalInstallments:e.target.value})}/>
                <input className="inp" type="number" placeholder="งวดที่เหลือ" value={newDebt.remaining} onChange={e=>setNewDebt({...newDebt,remaining:e.target.value})}/>
              </div>
              <label style={{display:"flex",gap:8,alignItems:"center",fontSize:13,color:"#94a3b8"}}>
                <input type="checkbox" checked={newDebt.isRolling} onChange={e=>setNewDebt({...newDebt,isRolling:e.target.checked})}/> จ่ายยอดเต็มสิ้นเดือน (เช่น Amex)
              </label>
              <button style={S.btn} onClick={addDebt}>💾 เพิ่มหนี้</button>
            </div>
            <button onClick={()=>setShowAddDebt(false)} style={{width:"100%",marginTop:8,background:"none",border:"none",color:"#64748b",fontSize:13,cursor:"pointer",fontFamily:"inherit",padding:8}}>ยกเลิก</button>
          </div>
        </div>
      )}

      {/* Add Expense */}
      {showAddExpense&&(
        <div className="modal-bg" onClick={e=>e.target===e.currentTarget&&setShowAddExpense(false)}>
          <div className="modal">
            <div style={{fontSize:17,fontWeight:700,marginBottom:16}}>➕ เพิ่มค่าใช้จ่ายประจำ</div>
            <div style={{display:"flex",flexDirection:"column",gap:10}}>
              <input className="inp" placeholder="ชื่อรายการ" value={newExpense.name} onChange={e=>setNewExpense({...newExpense,name:e.target.value})}/>
              <label style={{display:"flex",gap:8,alignItems:"center",fontSize:13,color:"#94a3b8"}}>
                <input type="checkbox" checked={newExpense.isTHB} onChange={e=>setNewExpense({...newExpense,isTHB:e.target.checked})}/> เป็นสกุลเงินบาท (THB)
              </label>
              {newExpense.isTHB
                ?<input className="inp" type="number" placeholder="ยอด (บาท)" value={newExpense.amountTHB} onChange={e=>setNewExpense({...newExpense,amountTHB:e.target.value})}/>
                :<input className="inp" type="number" placeholder="ยอด (EUR)" value={newExpense.amount} onChange={e=>setNewExpense({...newExpense,amount:e.target.value})}/>}
              <button style={S.btn} onClick={addExpense}>💾 เพิ่ม</button>
            </div>
            <button onClick={()=>setShowAddExpense(false)} style={{width:"100%",marginTop:8,background:"none",border:"none",color:"#64748b",fontSize:13,cursor:"pointer",fontFamily:"inherit",padding:8}}>ยกเลิก</button>
          </div>
        </div>
      )}

      {/* Add Category */}
      {showAddCat&&(
        <div className="modal-bg" onClick={e=>e.target===e.currentTarget&&setShowAddCat(false)}>
          <div className="modal">
            <div style={{fontSize:17,fontWeight:700,marginBottom:16}}>➕ เพิ่มหมวดหมู่</div>
            <div style={{display:"flex",gap:8,marginBottom:16}}>
              <input className="inp" placeholder="ชื่อหมวดใหม่..." value={newCat} onChange={e=>setNewCat(e.target.value)}/>
              <button style={{...S.btn,width:"auto",padding:"8px 16px"}} onClick={addCategory}>เพิ่ม</button>
            </div>
            <div style={S.label}>หมวดที่มีอยู่</div>
            <div style={{maxHeight:300,overflowY:"auto"}}>
              {categories.map(c=>(
                <div key={c} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"7px 0",borderBottom:"1px solid #1e2230",fontSize:13}}>
                  <span>{c}</span>
                  <button style={S.btnDanger} onClick={()=>removeCategory(c)}>🗑️</button>
                </div>
              ))}
            </div>
            <button onClick={()=>setShowAddCat(false)} style={{width:"100%",marginTop:12,background:"none",border:"none",color:"#64748b",fontSize:13,cursor:"pointer",fontFamily:"inherit",padding:8}}>ปิด</button>
          </div>
        </div>
      )}

      {/* Edit Transaction */}
      {editingTx&&(
        <div className="modal-bg" onClick={e=>e.target===e.currentTarget&&setEditingTx(null)}>
          <div className="modal">
            <div style={{fontSize:17,fontWeight:700,marginBottom:16}}>✏️ แก้ไขรายการ</div>
            <div style={{display:"flex",flexDirection:"column",gap:10}}>
              <input className="inp" placeholder="ชื่อรายการ" value={editingTx.name} onChange={e=>setEditingTx({...editingTx,name:e.target.value})}/>
              <input className="inp" type="number" placeholder="ยอด (บวก=รายรับ, ลบ=รายจ่าย)" value={editingTx.amount} onChange={e=>setEditingTx({...editingTx,amount:parseFloat(e.target.value)||0})}/>
              <input className="inp" type="date" value={editingTx.date} onChange={e=>setEditingTx({...editingTx,date:e.target.value})}/>
              <select className="inp" value={editingTx.category} onChange={e=>setEditingTx({...editingTx,category:e.target.value})}>
                {categories.map(c=><option key={c}>{c}</option>)}
              </select>
              <button style={S.btn} onClick={saveEditTx}>💾 บันทึก</button>
            </div>
            <button onClick={()=>setEditingTx(null)} style={{width:"100%",marginTop:8,background:"none",border:"none",color:"#64748b",fontSize:13,cursor:"pointer",fontFamily:"inherit",padding:8}}>ยกเลิก</button>
          </div>
        </div>
      )}

      {/* BOTTOM NAV */}
      <div className="no-print" style={{position:"fixed",bottom:0,left:"50%",transform:"translateX(-50%)",width:"100%",maxWidth:480,background:"#0d0f14",borderTop:"1px solid #1e2230",display:"flex",padding:"8px 0"}}>
        {[{id:"dashboard",i:"📊",l:"ภาพรวม"},{id:"debts",i:"💳",l:"หนี้สิน"},{id:"expenses",i:"🧾",l:"ค่าจ่าย"},{id:"add",i:"✏️",l:"บันทึก"},{id:"history",i:"📋",l:"ประวัติ"},{id:"report",i:"📄",l:"Report"}].map(t=>(
          <button key={t.id} onClick={()=>setActiveTab(t.id)} style={{flex:1,background:"none",border:"none",color:activeTab===t.id?"#3b82f6":"#4b5563",cursor:"pointer",fontFamily:"inherit",display:"flex",flexDirection:"column",alignItems:"center",gap:1}}>
            <span style={{fontSize:16}}>{t.i}</span>
            <span style={{fontSize:8,fontWeight:activeTab===t.id?700:400}}>{t.l}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
