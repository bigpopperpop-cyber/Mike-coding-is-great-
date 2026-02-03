
import React, { useState, useEffect, useMemo } from 'react';
import { 
  Home, 
  PlusCircle, 
  History, 
  Settings, 
  TrendingDown, 
  Wallet, 
  Calendar,
  FileDown,
  Trash2,
  AlertCircle,
  Save,
  ChevronRight,
  Calculator,
  ShieldCheck,
  Landmark,
  X,
  Upload,
  Download,
  Receipt,
  Pencil,
  Hash,
  Scale,
  FileText,
  MinusCircle
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend
} from 'recharts';

// --- Types ---
interface PaymentRecord {
  id: string;
  date: string;
  totalPaid: number;
  principalPart: number;
  interestPart: number;
  taxPart: number;
  insurancePart: number;
  remainingBalance: number;
  checkNumber?: string;
  isTaxBill?: boolean;
}

interface MortgageConfig {
  nickname: string;
  initialBalance: number;
  annualRate: number;
  initialTaxBalance: number;
}

// --- Utilities ---
const formatUSD = (val: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(val);
};

const downloadFile = (content: string, fileName: string, contentType: string) => {
  const a = document.createElement("a");
  const file = new Blob([content], { type: contentType });
  a.href = URL.createObjectURL(file);
  a.download = fileName;
  a.click();
};

// --- Sub-Components ---

const StatCard = ({ label, value, icon: Icon, colorClass, subValue }: any) => (
  <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 flex flex-col justify-between h-56 transition-all hover:shadow-md">
    <div className="flex justify-between items-start">
      <div className={`p-3 rounded-2xl ${colorClass}`}>
        <Icon size={28} />
      </div>
      <span className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">Metric</span>
    </div>
    <div>
      <p className="text-slate-500 font-bold mb-1">{label}</p>
      <p className="text-3xl font-black text-slate-900 leading-none">{value}</p>
      {subValue && <p className="text-xs font-bold mt-2 text-slate-400 uppercase tracking-widest">{subValue}</p>}
    </div>
  </div>
);

// --- Main App ---
const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'dash' | 'entry' | 'history' | 'settings'>('dash');
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [entryMode, setEntryMode] = useState<'mortgage' | 'taxBill'>('mortgage');
  
  const [config, setConfig] = useState<MortgageConfig>({
    nickname: "Family Home",
    initialBalance: 230000,
    annualRate: 3.25,
    initialTaxBalance: 0
  });

  // Entry Form State
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    totalPaid: 0,
    taxPart: 0,
    insurancePart: 0,
    principalPart: 0,
    interestPart: 0,
    remainingBalance: 0,
    checkNumber: ""
  });

  // Load Data
  useEffect(() => {
    const saved = localStorage.getItem('house_db_v3');
    const savedCfg = localStorage.getItem('house_cfg_v3');
    if (saved) setPayments(JSON.parse(saved));
    if (savedCfg) setConfig(JSON.parse(savedCfg));
  }, []);

  // Save Data
  useEffect(() => {
    localStorage.setItem('house_db_v3', JSON.stringify(payments));
    localStorage.setItem('house_cfg_v3', JSON.stringify(config));
  }, [payments, config]);

  const stats = useMemo(() => {
    const sorted = [...payments].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    const lastValidBalanceRecord = [...sorted].reverse().find(p => !p.isTaxBill);
    const currentBalance = lastValidBalanceRecord ? lastValidBalanceRecord.remainingBalance : config.initialBalance;
    
    const totalPaid = payments.reduce((sum, p) => sum + p.totalPaid, 0);
    const totalInterest = payments.reduce((sum, p) => sum + p.interestPart, 0);
    const totalTaxNet = payments.reduce((sum, p) => sum + p.taxPart, 0);
    
    // YTD Taxes Collected (Only regular payments)
    const currentYear = new Date().getFullYear();
    const ytdTax = payments
      .filter(p => new Date(p.date).getFullYear() === currentYear && !p.isTaxBill)
      .reduce((sum, p) => sum + p.taxPart, 0);

    const currentTaxFund = config.initialTaxBalance + totalTaxNet;
    const progress = Math.min(100, Math.max(0, ((config.initialBalance - currentBalance) / config.initialBalance) * 100));
    
    return { currentBalance, totalPaid, totalInterest, progress, ytdTax, currentTaxFund };
  }, [payments, config]);

  // Calculate cumulative totals for history table
  const paymentsWithCumulative = useMemo(() => {
    const sorted = [...payments].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    let runningTotal = 0;
    let runningTax = config.initialTaxBalance;
    return sorted.map(p => {
      runningTotal += p.totalPaid;
      runningTax += p.taxPart;
      return { ...p, cumulativePaid: runningTotal, currentTaxFund: runningTax };
    });
  }, [payments, config.initialTaxBalance]);

  const handleMagicSplit = () => {
    if (entryMode === 'taxBill') return;
    
    let targetBalance = config.initialBalance;
    const sorted = [...payments].filter(p => !p.isTaxBill).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    if (editingId) {
        const idx = sorted.findIndex(p => p.id === editingId);
        if (idx > 0) {
            targetBalance = sorted[idx-1].remainingBalance;
        }
    } else {
        if (sorted.length > 0) {
          targetBalance = sorted[sorted.length - 1].remainingBalance;
        }
    }
    
    const monthlyRate = (config.annualRate / 100) / 12;
    const interest = targetBalance * monthlyRate;
    const netForLoan = formData.totalPaid - formData.taxPart - formData.insurancePart;
    const principal = netForLoan - interest;

    setFormData({
      ...formData,
      interestPart: Math.round(interest * 100) / 100,
      principalPart: Math.round(principal * 100) / 100,
      remainingBalance: Math.round((targetBalance - principal) * 100) / 100
    });
  };

  const savePayment = () => {
    if (entryMode === 'mortgage' && (!formData.totalPaid || formData.remainingBalance < 0)) {
      alert("Please ensure the payment details are correct.");
      return;
    }
    
    if (entryMode === 'taxBill' && !formData.taxPart) {
        alert("Please enter the tax bill amount.");
        return;
    }

    const payload: Partial<PaymentRecord> = { ...formData };
    
    if (entryMode === 'taxBill') {
        payload.isTaxBill = true;
        // Total paid for a tax bill is usually zero or the bill itself depending on preference.
        // We'll set totalPaid to 0 as it's a disbursement from existing funds, not new money in.
        payload.totalPaid = 0; 
        payload.taxPart = -Math.abs(formData.taxPart); // Force negative for deduction
        payload.principalPart = 0;
        payload.interestPart = 0;
        payload.insurancePart = 0;
        // Remaining balance stays the same as the last mortgage payment
        const sorted = [...payments].filter(p => !p.isTaxBill).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        payload.remainingBalance = sorted.length > 0 ? sorted[sorted.length-1].remainingBalance : config.initialBalance;
    }

    if (editingId) {
      const updatedPayments = payments.map(p => 
        p.id === editingId ? { ...(payload as PaymentRecord), id: editingId } : p
      );
      setPayments(updatedPayments.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()));
      setEditingId(null);
    } else {
      const newRecord: PaymentRecord = {
        ...(payload as PaymentRecord),
        id: crypto.randomUUID()
      };
      setPayments([...payments, newRecord].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()));
    }

    setActiveTab('history');
    resetForm();
  };

  const resetForm = () => {
    setEditingId(null);
    setEntryMode('mortgage');
    setFormData({
      date: new Date().toISOString().split('T')[0],
      totalPaid: 0,
      taxPart: 0,
      insurancePart: 0,
      principalPart: 0,
      interestPart: 0,
      remainingBalance: 0,
      checkNumber: ""
    });
  };

  const startEditing = (record: PaymentRecord) => {
    setEditingId(record.id);
    setEntryMode(record.isTaxBill ? 'taxBill' : 'mortgage');
    setFormData({
      date: record.date,
      totalPaid: record.totalPaid,
      taxPart: Math.abs(record.taxPart), // Form always shows positive
      insurancePart: record.insurancePart,
      principalPart: record.principalPart,
      interestPart: record.interestPart,
      remainingBalance: record.remainingBalance,
      checkNumber: record.checkNumber || ""
    });
    setActiveTab('entry');
  };

  const deletePayment = (id: string) => {
    if (confirm("Permanently delete this record?")) {
      setPayments(payments.filter(p => p.id !== id));
    }
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const data = JSON.parse(evt.target?.result as string);
        if (Array.isArray(data)) {
          if (confirm("This will replace all current data. Proceed?")) setPayments(data);
        }
      } catch (err) { alert("Invalid file format."); }
    };
    reader.readAsText(file);
  };

  const chartData = useMemo(() => {
    return paymentsWithCumulative.slice(-12).map(p => ({
      name: new Date(p.date).toLocaleDateString('en-US', { month: 'short' }),
      balance: p.remainingBalance,
      taxFund: p.currentTaxFund,
      interest: p.interestPart
    }));
  }, [paymentsWithCumulative]);

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-[#F8FAFC]">
      {/* SIDEBAR */}
      <nav className="w-full lg:w-80 bg-slate-900 text-white p-8 flex flex-col shadow-2xl z-20">
        <div className="flex items-center gap-4 mb-12">
          <div className="bg-blue-600 p-3 rounded-2xl shadow-lg shadow-blue-500/20">
            <Home size={32} />
          </div>
          <div>
            <h1 className="text-xl font-extrabold tracking-tight">{config.nickname}</h1>
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">Family Ledger</p>
          </div>
        </div>

        <div className="flex-1 space-y-3">
          {[
            { id: 'dash', label: 'Dashboard', icon: TrendingDown },
            { id: 'entry', label: editingId ? 'Editing Record' : 'Add Payment', icon: PlusCircle },
            { id: 'history', label: 'View History', icon: History },
            { id: 'settings', label: 'System Settings', icon: Settings },
          ].map(item => (
            <button
              key={item.id}
              onClick={() => {
                  if (item.id !== 'entry') resetForm();
                  setActiveTab(item.id as any);
              }}
              className={`w-full flex items-center gap-4 px-6 py-5 rounded-[1.5rem] font-extrabold transition-all group ${
                activeTab === item.id 
                  ? 'bg-blue-600 text-white shadow-xl shadow-blue-600/30 translate-x-1' 
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <item.icon size={24} className={activeTab === item.id ? 'animate-pulse' : ''} />
              {item.label}
            </button>
          ))}
        </div>

        <div className="mt-12 pt-8 border-t border-slate-800 space-y-3">
          <button 
            onClick={() => downloadFile(JSON.stringify(payments), 'mortgage_backup.json', 'application/json')}
            className="w-full flex items-center justify-between px-5 py-4 bg-slate-800 hover:bg-slate-700 rounded-2xl text-xs font-black uppercase tracking-widest transition-colors"
          >
            Backup Data <Download size={16} />
          </button>
        </div>
      </nav>

      {/* MAIN CONTENT */}
      <main className="flex-1 p-6 lg:p-12 overflow-y-auto">
        <div className="max-w-7xl mx-auto space-y-10">
          
          {activeTab === 'dash' && (
            <div className="animate-in fade-in slide-in-from-bottom-6 duration-700 space-y-10">
              <header>
                <h2 className="text-4xl font-black text-slate-900">Home Overview</h2>
                <p className="text-slate-500 text-lg font-medium mt-2">Checking in on your progress and tax savings.</p>
              </header>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <StatCard 
                  label="Remaining Balance" 
                  value={formatUSD(stats.currentBalance)} 
                  icon={Landmark} 
                  colorClass="bg-blue-50 text-blue-600" 
                  subValue={`${Math.round(stats.progress)}% Paid Off`}
                />
                <StatCard 
                  label="Current Tax Fund" 
                  value={formatUSD(stats.currentTaxFund)} 
                  icon={Scale} 
                  colorClass="bg-amber-50 text-amber-600" 
                  subValue="Total pot for future bills"
                />
                <StatCard 
                  label="YTD Taxes Collected" 
                  value={formatUSD(stats.ytdTax)} 
                  icon={Receipt} 
                  colorClass="bg-orange-50 text-orange-600" 
                  subValue={`Collected in ${new Date().getFullYear()}`}
                />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-slate-100">
                  <h3 className="text-xl font-black mb-8">Loan Paydown</h3>
                  <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={chartData}>
                        <defs>
                          <linearGradient id="colorBal" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                        <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} tickFormatter={(v) => `$${v/1000}k`} />
                        <Tooltip />
                        <Area type="monotone" dataKey="balance" stroke="#3b82f6" strokeWidth={4} fillOpacity={1} fill="url(#colorBal)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-slate-100">
                  <h3 className="text-xl font-black mb-8">Tax Fund Growth</h3>
                  <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={chartData}>
                        <defs>
                          <linearGradient id="colorTax" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.1}/>
                            <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                        <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                        <Tooltip />
                        <Area type="monotone" dataKey="taxFund" name="Fund Balance" stroke="#f59e0b" strokeWidth={4} fillOpacity={1} fill="url(#colorTax)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'entry' && (
            <div className="max-w-5xl mx-auto animate-in fade-in slide-in-from-right-8 duration-500">
              <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h2 className="text-4xl font-black text-slate-900">{editingId ? 'Edit Entry' : 'New Entry'}</h2>
                    <p className="text-slate-500 text-lg font-medium mt-1">
                        Select whether this is a normal house payment or a tax bill.
                    </p>
                </div>
                
                <div className="flex bg-slate-200 p-1 rounded-2xl">
                    <button 
                        onClick={() => setEntryMode('mortgage')}
                        className={`px-8 py-3 rounded-xl font-black text-sm transition-all flex items-center gap-2 ${entryMode === 'mortgage' ? 'bg-white text-blue-600 shadow-md' : 'text-slate-500'}`}
                    >
                        <Home size={18} /> House Payment
                    </button>
                    <button 
                        onClick={() => setEntryMode('taxBill')}
                        className={`px-8 py-3 rounded-xl font-black text-sm transition-all flex items-center gap-2 ${entryMode === 'taxBill' ? 'bg-white text-orange-600 shadow-md' : 'text-slate-500'}`}
                    >
                        <FileText size={18} /> Pay Property Tax Bill
                    </button>
                </div>

                {editingId && (
                    <button 
                        onClick={() => { resetForm(); setActiveTab('history'); }}
                        className="px-6 py-3 bg-slate-100 text-slate-600 rounded-xl font-bold hover:bg-slate-200 transition-all flex items-center gap-2"
                    >
                        <X size={20} /> Cancel Edit
                    </button>
                )}
              </header>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {entryMode === 'mortgage' ? (
                  <>
                    <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-slate-100 space-y-8">
                      <div className="space-y-3">
                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Payment Date</label>
                        <input 
                          type="date" 
                          className="w-full px-6 py-5 bg-slate-50 border border-slate-200 rounded-2xl text-xl font-bold focus:ring-4 focus:ring-blue-100 outline-none transition-all"
                          value={formData.date}
                          onChange={e => setFormData({...formData, date: e.target.value})}
                        />
                      </div>

                      <div className="space-y-3">
                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Total Paid This Month ($)</label>
                        <input 
                          type="number" 
                          placeholder="0.00"
                          className="w-full px-6 py-5 bg-slate-50 border border-slate-200 rounded-2xl text-2xl font-black focus:ring-4 focus:ring-blue-100 outline-none transition-all"
                          value={formData.totalPaid || ''}
                          onChange={e => setFormData({...formData, totalPaid: parseFloat(e.target.value) || 0})}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-3 p-4 bg-amber-50 rounded-2xl border border-amber-100">
                          <label className="text-xs font-black text-amber-600 uppercase tracking-widest ml-1">Taxes ($)</label>
                          <input 
                            type="number" 
                            placeholder="0.00"
                            className="w-full px-4 py-3 bg-white border border-amber-200 rounded-xl font-bold text-lg focus:ring-4 focus:ring-amber-100 outline-none transition-all"
                            value={formData.taxPart || ''}
                            onChange={e => setFormData({...formData, taxPart: parseFloat(e.target.value) || 0})}
                          />
                        </div>
                        <div className="space-y-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                          <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Insurance ($)</label>
                          <input 
                            type="number" 
                            placeholder="0.00"
                            className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl font-bold text-lg focus:ring-4 focus:ring-blue-100 outline-none transition-all"
                            value={formData.insurancePart || ''}
                            onChange={e => setFormData({...formData, insurancePart: parseFloat(e.target.value) || 0})}
                          />
                        </div>
                      </div>

                      <button 
                        onClick={handleMagicSplit}
                        className="w-full py-6 bg-blue-50 text-blue-700 rounded-2xl font-black text-lg flex items-center justify-center gap-3 border-2 border-dashed border-blue-200 hover:bg-blue-100 transition-all active:scale-[0.98]"
                      >
                        <Calculator size={24} /> Magic Calculate Split
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-slate-100 space-y-8 animate-in fade-in slide-in-from-left-4">
                    <div className="flex items-center gap-3 p-4 bg-orange-50 text-orange-700 rounded-2xl border border-orange-100">
                        <AlertCircle size={20} />
                        <p className="text-sm font-bold">This will deduct funds from your Tax Pot balance.</p>
                    </div>
                    
                    <div className="space-y-3">
                      <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Tax Bill Date</label>
                      <input 
                        type="date" 
                        className="w-full px-6 py-5 bg-slate-50 border border-slate-200 rounded-2xl text-xl font-bold focus:ring-4 focus:ring-orange-100 outline-none transition-all"
                        value={formData.date}
                        onChange={e => setFormData({...formData, date: e.target.value})}
                      />
                    </div>

                    <div className="space-y-3">
                      <label className="text-xs font-black text-orange-600 uppercase tracking-widest ml-1">Tax Bill Amount Paid ($)</label>
                      <input 
                        type="number" 
                        placeholder="0.00"
                        className="w-full px-6 py-5 bg-orange-50/30 border border-orange-200 rounded-2xl text-3xl font-black focus:ring-4 focus:ring-orange-100 outline-none transition-all"
                        value={formData.taxPart || ''}
                        onChange={e => setFormData({...formData, taxPart: parseFloat(e.target.value) || 0})}
                      />
                    </div>
                  </div>
                )}

                <div className="space-y-8">
                  <div className={`p-10 rounded-[3rem] shadow-xl space-y-6 ${entryMode === 'mortgage' ? 'bg-slate-900 text-white' : 'bg-orange-600 text-white'}`}>
                    <div className="flex justify-between items-center">
                      <h3 className="text-xl font-black">{entryMode === 'mortgage' ? 'Transaction Summary' : 'Tax Bill Summary'}</h3>
                      {entryMode === 'mortgage' ? <ShieldCheck size={32} className="text-emerald-400" /> : <MinusCircle size={32} className="text-white" />}
                    </div>
                    
                    {entryMode === 'mortgage' ? (
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-slate-800 p-4 rounded-2xl">
                                <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">To Principal</p>
                                <p className="text-xl font-black text-emerald-400">{formatUSD(formData.principalPart)}</p>
                            </div>
                            <div className="bg-slate-800 p-4 rounded-2xl">
                                <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">Increase Tax Fund</p>
                                <p className="text-xl font-black text-amber-400">{formatUSD(formData.taxPart)}</p>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-white/10 p-6 rounded-2xl border border-white/20">
                            <p className="text-orange-200 text-[10px] font-black uppercase tracking-widest mb-1">Decrease Tax Fund By</p>
                            <p className="text-4xl font-black">{formatUSD(formData.taxPart)}</p>
                            <p className="mt-4 text-orange-100 text-xs font-medium">Your tax pot will decrease after saving this record.</p>
                        </div>
                    )}

                    <div className="pt-6 border-t border-white/10 flex justify-between items-center">
                      <div>
                        <p className="text-slate-300 text-[10px] font-black uppercase tracking-widest mb-1">Estimated Fund After</p>
                        <p className="text-2xl font-black">{formatUSD(stats.currentTaxFund + (entryMode === 'mortgage' ? formData.taxPart : -formData.taxPart))}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-slate-300 text-[10px] font-black uppercase tracking-widest mb-1">New Balance</p>
                        <p className="text-2xl font-black">{formatUSD(formData.remainingBalance)}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white p-8 rounded-[3rem] shadow-sm border border-slate-100 space-y-6">
                    <div className="space-y-3">
                      <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-1">
                        <Hash size={12} /> Check / Ref Number
                      </label>
                      <input 
                        type="text" 
                        placeholder="e.g. #4943"
                        className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold focus:ring-4 focus:ring-blue-100 outline-none"
                        value={formData.checkNumber}
                        onChange={e => setFormData({...formData, checkNumber: e.target.value})}
                      />
                    </div>
                    <button 
                      onClick={savePayment}
                      className={`w-full py-6 text-white rounded-2xl font-black text-xl flex items-center justify-center gap-3 shadow-xl transition-all active:scale-[0.98] ${entryMode === 'mortgage' ? 'bg-blue-600 hover:bg-blue-700 shadow-blue-600/20' : 'bg-orange-600 hover:bg-orange-700 shadow-orange-600/20'}`}
                    >
                      <Save size={24} /> {editingId ? 'Update Record' : 'Save to Database'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'history' && (
            <div className="animate-in fade-in slide-in-from-left-6 duration-700 space-y-8">
              <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                  <h2 className="text-4xl font-black text-slate-900">Payment Ledger</h2>
                  <p className="text-slate-500 text-lg font-medium mt-1">Complete history of payments and tax bill disbursements.</p>
                </div>
                <button 
                   onClick={() => downloadFile(JSON.stringify(payments), 'mortgage_export.json', 'application/json')}
                   className="bg-white px-8 py-4 rounded-2xl font-bold border border-slate-200 shadow-sm flex items-center gap-3 hover:bg-slate-50 transition-all"
                >
                  <FileDown size={20} /> Download Backup
                </button>
              </header>

              <div className="bg-white rounded-[3rem] shadow-sm border border-slate-100 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-slate-50 text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">
                      <tr>
                        <th className="px-6 py-6">Date</th>
                        <th className="px-6 py-6">Check #</th>
                        <th className="px-6 py-6">Paid</th>
                        <th className="px-6 py-6">Principal</th>
                        <th className="px-6 py-6">Interest</th>
                        <th className="px-6 py-6">Tax Pot Activity</th>
                        <th className="px-6 py-6">Balance</th>
                        <th className="px-6 py-6 text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {[...paymentsWithCumulative].reverse().map(p => (
                        <tr key={p.id} className={`hover:bg-blue-50/30 transition-colors group ${p.isTaxBill ? 'bg-orange-50/20' : ''}`}>
                          <td className="px-6 py-6 font-extrabold text-slate-900 whitespace-nowrap text-sm">
                            <div className="flex flex-col">
                                {new Date(p.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                {p.isTaxBill && <span className="text-[10px] bg-orange-600 text-white px-2 py-0.5 rounded-full font-black mt-1 w-fit">TAX BILL</span>}
                            </div>
                          </td>
                          <td className="px-6 py-6 font-bold text-slate-400 text-sm">
                            {p.checkNumber ? <span className="bg-slate-100 px-3 py-1 rounded-lg text-slate-600 font-mono">{p.checkNumber}</span> : '-'}
                          </td>
                          <td className="px-6 py-6 font-black text-blue-600 text-sm">
                             {p.totalPaid > 0 ? formatUSD(p.totalPaid) : '-'}
                          </td>
                          <td className="px-6 py-6 text-emerald-600 font-bold text-sm">
                             {p.principalPart > 0 ? formatUSD(p.principalPart) : '-'}
                          </td>
                          <td className="px-6 py-6 text-rose-500 font-medium text-sm">
                             {p.interestPart > 0 ? formatUSD(p.interestPart) : '-'}
                          </td>
                          <td className="px-6 py-6">
                            <div className="flex flex-col">
                                <span className={`font-black text-sm ${p.isTaxBill ? 'text-orange-600' : 'text-amber-600'}`}>
                                    {p.isTaxBill ? `- ${formatUSD(Math.abs(p.taxPart))}` : `+ ${formatUSD(p.taxPart)}`}
                                </span>
                                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">New Pot: {formatUSD(p.currentTaxFund)}</span>
                            </div>
                          </td>
                          <td className="px-6 py-6 font-bold text-slate-500 italic text-sm">{formatUSD(p.remainingBalance)}</td>
                          <td className="px-6 py-6 text-center">
                            <div className="flex items-center justify-center gap-1">
                                <button 
                                    onClick={() => startEditing(p)} 
                                    className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                                >
                                    <Pencil size={18} />
                                </button>
                                <button 
                                    onClick={() => deletePayment(p.id)} 
                                    className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {payments.length === 0 && (
                        <tr>
                          <td colSpan={8} className="px-10 py-20 text-center text-slate-400 font-bold italic">
                            No records found. Add your first payment or tax bill to start tracking.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="max-w-2xl mx-auto animate-in fade-in zoom-in-95 duration-500 space-y-10">
              <header>
                <h2 className="text-4xl font-black text-slate-900">System Setup</h2>
                <p className="text-slate-500 text-lg font-medium">Configure loan terms and tax fund starting balance.</p>
              </header>

              <div className="bg-white p-12 rounded-[3rem] shadow-sm border border-slate-100 space-y-10">
                <div className="space-y-8">
                  <div className="space-y-3">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">House Nickname</label>
                    <input 
                      type="text" 
                      className="w-full px-6 py-5 bg-slate-50 border border-slate-200 rounded-2xl text-xl font-bold focus:ring-4 focus:ring-blue-100 outline-none"
                      value={config.nickname}
                      onChange={e => setConfig({...config, nickname: e.target.value})}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-3">
                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Loan Balance ($)</label>
                        <input 
                        type="number" 
                        className="w-full px-6 py-5 bg-slate-50 border border-slate-200 rounded-2xl text-xl font-bold focus:ring-4 focus:ring-blue-100 outline-none"
                        value={config.initialBalance}
                        onChange={e => setConfig({...config, initialBalance: parseFloat(e.target.value) || 0})}
                        />
                    </div>
                    <div className="space-y-3">
                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Int. Rate (%)</label>
                        <input 
                        type="number" 
                        step="0.01"
                        className="w-full px-6 py-5 bg-slate-50 border border-slate-200 rounded-2xl text-xl font-bold focus:ring-4 focus:ring-blue-100 outline-none"
                        value={config.annualRate}
                        onChange={e => setConfig({...config, annualRate: parseFloat(e.target.value) || 0})}
                        />
                    </div>
                  </div>
                  <div className="space-y-3 p-6 bg-amber-50 rounded-[2rem] border border-amber-100">
                    <label className="text-xs font-black text-amber-600 uppercase tracking-widest ml-1 flex items-center gap-2">
                      <Scale size={14} /> Initial Tax Fund Balance ($)
                    </label>
                    <p className="text-xs text-amber-700/60 mb-3">Set how much money is already saved for taxes before starting this tracker.</p>
                    <input 
                      type="number" 
                      className="w-full px-6 py-5 bg-white border border-amber-200 rounded-2xl text-xl font-black text-amber-700 focus:ring-4 focus:ring-amber-100 outline-none"
                      value={config.initialTaxBalance}
                      onChange={e => setConfig({...config, initialTaxBalance: parseFloat(e.target.value) || 0})}
                    />
                  </div>
                </div>

                <div className="pt-10 border-t border-slate-100 space-y-6">
                  <h3 className="font-black text-lg">Safe-Keep Database</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <label className="flex items-center justify-center gap-3 px-6 py-5 bg-blue-50 text-blue-700 rounded-2xl font-bold cursor-pointer hover:bg-blue-100 transition-all text-sm">
                      <Upload size={20} /> Restore Backup
                      <input type="file" className="hidden" accept=".json" onChange={handleImport} />
                    </label>
                    <button 
                      onClick={() => {
                        if(confirm("DANGER: This will delete everything. Proceed?")) setPayments([]);
                      }}
                      className="flex items-center justify-center gap-3 px-6 py-5 bg-rose-50 text-rose-700 rounded-2xl font-bold hover:bg-rose-100 transition-all text-sm"
                    >
                      <Trash2 size={20} /> Reset All Data
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
};

export default App;
