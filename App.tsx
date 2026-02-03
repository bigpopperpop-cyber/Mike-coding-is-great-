
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
  Calculator
} from 'lucide-react';
import { PaymentRecord, MortgageConfig, SummaryStats } from './types.ts';
import { formatUSD, calculateSuggestedSplit, downloadCSV } from './utils.ts';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'dash' | 'entry' | 'history' | 'settings'>('dash');
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [config, setConfig] = useState<MortgageConfig>({
    nickname: "Family Home",
    initialBalance: 250000,
    annualRate: 3.5,
    startDate: new Date().toISOString().split('T')[0]
  });

  // Load Data
  useEffect(() => {
    const saved = localStorage.getItem('mortgage_db');
    const savedConfig = localStorage.getItem('mortgage_cfg');
    if (saved) setPayments(JSON.parse(saved));
    if (savedConfig) setConfig(JSON.parse(savedConfig));
  }, []);

  // Save Data
  useEffect(() => {
    localStorage.setItem('mortgage_db', JSON.stringify(payments));
    localStorage.setItem('mortgage_cfg', JSON.stringify(config));
  }, [payments, config]);

  const stats: SummaryStats = useMemo(() => {
    const sorted = [...payments].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    const currentBalance = sorted.length > 0 ? sorted[sorted.length - 1].remainingBalance : config.initialBalance;
    const totalPaidToDate = payments.reduce((sum, p) => sum + p.totalPaid, 0);
    const totalInterestPaid = payments.reduce((sum, p) => sum + p.interestPart, 0);
    const totalPrincipalPaid = payments.reduce((sum, p) => sum + p.principalPart, 0);
    const totalTaxesPaid = payments.reduce((sum, p) => sum + p.taxPart, 0);
    const totalInsurancePaid = payments.reduce((sum, p) => sum + p.insurancePart, 0);
    const totalEquityGained = config.initialBalance - currentBalance;
    const percentComplete = (totalEquityGained / config.initialBalance) * 100;

    return {
      currentBalance,
      totalPaidToDate,
      totalInterestPaid,
      totalEquityGained,
      percentComplete,
      totalPrincipalPaid,
      totalTaxesPaid,
      totalInsurancePaid
    };
  }, [payments, config]);

  const handleAddPayment = (p: Omit<PaymentRecord, 'id' | 'lastModified'>) => {
    const newPayment: PaymentRecord = {
      ...p,
      id: crypto.randomUUID(),
      lastModified: Date.now()
    };
    setPayments(prev => [...prev, newPayment].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()));
    setActiveTab('dash');
  };

  const deletePayment = (id: string) => {
    if (confirm("Are you sure you want to delete this payment?")) {
      setPayments(prev => prev.filter(p => p.id !== id));
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Sidebar Navigation */}
      <nav className="w-full lg:w-72 bg-slate-900 text-white p-6 flex flex-col">
        <div className="flex items-center gap-3 mb-10">
          <div className="bg-blue-600 p-2 rounded-xl">
            <Home size={28} />
          </div>
          <div>
            <h1 className="font-bold text-xl leading-tight">{config.nickname}</h1>
            <p className="text-slate-400 text-xs font-semibold tracking-widest uppercase">Tracker</p>
          </div>
        </div>

        <div className="flex-1 space-y-2">
          {[
            { id: 'dash', label: 'Overview', icon: Home },
            { id: 'entry', label: 'New Payment', icon: PlusCircle },
            { id: 'history', label: 'History', icon: History },
            { id: 'settings', label: 'Settings', icon: Settings },
          ].map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as any)}
              className={`w-full flex items-center gap-4 px-4 py-4 rounded-2xl font-bold transition-all ${
                activeTab === item.id ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/40' : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <item.icon size={22} />
              {item.label}
            </button>
          ))}
        </div>

        <div className="mt-auto pt-6 border-t border-slate-800">
          <button 
            onClick={() => downloadCSV(payments, 'mortgage_export.csv')}
            className="w-full flex items-center justify-center gap-2 py-3 bg-slate-800 rounded-xl text-sm font-bold hover:bg-slate-700 transition-colors"
          >
            <FileDown size={18} />
            Export to Excel
          </button>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 bg-[#F8FAFC] p-4 lg:p-10 overflow-y-auto">
        {activeTab === 'dash' && (
          <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <header>
              <h2 className="text-4xl font-extrabold tracking-tight text-slate-900">Mortgage Summary</h2>
              <p className="text-slate-500 font-medium text-lg mt-1">Real-time status of your home loan.</p>
            </header>

            {/* Hero Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 flex flex-col justify-between h-56 transition-transform hover:scale-[1.01]">
                <div className="flex justify-between items-start">
                  <div className="bg-blue-50 text-blue-600 p-3 rounded-2xl"><TrendingDown size={28} /></div>
                  <span className="text-slate-400 text-xs font-bold uppercase tracking-widest">Balance</span>
                </div>
                <div>
                  <p className="text-slate-500 font-bold mb-1">Remaining Balance</p>
                  <p className="text-4xl font-black text-slate-900">{formatUSD(stats.currentBalance)}</p>
                </div>
              </div>

              <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 flex flex-col justify-between h-56 transition-transform hover:scale-[1.01]">
                <div className="flex justify-between items-start">
                  <div className="bg-emerald-50 text-emerald-600 p-3 rounded-2xl"><Wallet size={28} /></div>
                  <span className="text-slate-400 text-xs font-bold uppercase tracking-widest">Progress</span>
                </div>
                <div>
                  <div className="flex justify-between items-end mb-2">
                    <p className="text-slate-500 font-bold">Equity Gained</p>
                    <p className="text-emerald-600 font-black">{Math.round(stats.percentComplete)}%</p>
                  </div>
                  <div className="h-4 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${stats.percentComplete}%` }}></div>
                  </div>
                </div>
              </div>

              <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 flex flex-col justify-between h-56 transition-transform hover:scale-[1.01]">
                <div className="flex justify-between items-start">
                  <div className="bg-rose-50 text-rose-600 p-3 rounded-2xl"><History size={28} /></div>
                  <span className="text-slate-400 text-xs font-bold uppercase tracking-widest">Activity</span>
                </div>
                <div>
                  <p className="text-slate-500 font-bold mb-1">Total Paid to Date</p>
                  <p className="text-4xl font-black text-slate-900">{formatUSD(stats.totalPaidToDate)}</p>
                </div>
              </div>
            </div>

            {/* Recent Activity Mini-Table */}
            <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
              <div className="p-8 border-b border-slate-50 flex justify-between items-center">
                <h3 className="text-xl font-bold">Recent Payments</h3>
                <button onClick={() => setActiveTab('history')} className="text-blue-600 font-bold text-sm flex items-center gap-1 hover:underline">
                  View full history <ChevronRight size={16} />
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 text-slate-400 text-xs font-bold uppercase tracking-widest">
                    <tr>
                      <th className="px-8 py-4">Date</th>
                      <th className="px-8 py-4">Amount</th>
                      <th className="px-8 py-4">Principal</th>
                      <th className="px-8 py-4">Balance</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {payments.slice(-5).reverse().map(p => (
                      <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-8 py-5 font-bold text-slate-700">{p.date}</td>
                        <td className="px-8 py-5 font-black text-slate-900">{formatUSD(p.totalPaid)}</td>
                        <td className="px-8 py-5 font-semibold text-emerald-600">+{formatUSD(p.principalPart)}</td>
                        <td className="px-8 py-5 font-medium text-slate-500">{formatUSD(p.remainingBalance)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'entry' && (
          <PaymentForm onSave={handleAddPayment} config={config} lastBalance={stats.currentBalance} />
        )}

        {activeTab === 'history' && (
          <div className="max-w-5xl mx-auto space-y-6">
            <header className="flex justify-between items-center mb-8">
              <div>
                <h2 className="text-3xl font-black text-slate-900">Payment Ledger</h2>
                <p className="text-slate-500 font-medium">Full record of all payments made.</p>
              </div>
              <button 
                onClick={() => downloadCSV(payments, 'mortgage_history.csv')}
                className="bg-white border border-slate-200 px-6 py-3 rounded-2xl font-bold text-slate-700 flex items-center gap-2 hover:bg-slate-50 transition-all shadow-sm"
              >
                <FileDown size={20} /> Download CSV
              </button>
            </header>

            <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden">
               <table className="w-full text-left border-collapse">
                  <thead className="bg-slate-50 text-slate-500 text-xs font-bold uppercase tracking-widest">
                    <tr>
                      <th className="px-6 py-4">Date</th>
                      <th className="px-6 py-4">Total Paid</th>
                      <th className="px-6 py-4">Principal</th>
                      <th className="px-6 py-4">Interest</th>
                      <th className="px-6 py-4">Taxes/Ins</th>
                      <th className="px-6 py-4">Ending Balance</th>
                      <th className="px-6 py-4 text-center">Delete</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {[...payments].reverse().map(p => (
                      <tr key={p.id} className="hover:bg-slate-50/50">
                        <td className="px-6 py-4 font-bold">{p.date}</td>
                        <td className="px-6 py-4 font-black">{formatUSD(p.totalPaid)}</td>
                        <td className="px-6 py-4 text-emerald-600 font-bold">{formatUSD(p.principalPart)}</td>
                        <td className="px-6 py-4 text-rose-500 font-medium">{formatUSD(p.interestPart)}</td>
                        <td className="px-6 py-4 text-slate-400 font-medium">{formatUSD(p.taxPart + p.insurancePart)}</td>
                        <td className="px-6 py-4 font-bold text-slate-700">{formatUSD(p.remainingBalance)}</td>
                        <td className="px-6 py-4 text-center">
                          <button onClick={() => deletePayment(p.id)} className="text-slate-300 hover:text-rose-600 transition-colors">
                            <Trash2 size={20} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
               </table>
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="max-w-2xl mx-auto space-y-8">
            <header>
              <h2 className="text-3xl font-black">Mortgage Configuration</h2>
              <p className="text-slate-500">Update loan terms or original balance.</p>
            </header>

            <div className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-slate-100 space-y-8">
              <div className="grid grid-cols-1 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-600 block uppercase tracking-wider ml-1">House Nickname</label>
                  <input 
                    type="text" 
                    value={config.nickname}
                    onChange={(e) => setConfig({...config, nickname: e.target.value})}
                    className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-xl focus:ring-4 focus:ring-blue-100 outline-none transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-600 block uppercase tracking-wider ml-1">Original Loan Balance ($)</label>
                  <input 
                    type="number" 
                    value={config.initialBalance}
                    onChange={(e) => setConfig({...config, initialBalance: parseFloat(e.target.value) || 0})}
                    className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-xl focus:ring-4 focus:ring-blue-100 outline-none transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-600 block uppercase tracking-wider ml-1">Interest Rate (%)</label>
                  <input 
                    type="number" 
                    step="0.01"
                    value={config.annualRate}
                    onChange={(e) => setConfig({...config, annualRate: parseFloat(e.target.value) || 0})}
                    className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-xl focus:ring-4 focus:ring-blue-100 outline-none transition-all"
                  />
                </div>
              </div>

              <div className="p-6 bg-blue-50 rounded-2xl flex gap-4 items-start border border-blue-100">
                <AlertCircle className="text-blue-600 shrink-0" size={24} />
                <p className="text-blue-900 text-sm font-medium">
                  Changing the initial balance or interest rate will update the equity calculations on your dashboard instantly.
                </p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

const PaymentForm: React.FC<{
  onSave: (p: any) => void; 
  config: MortgageConfig;
  lastBalance: number;
}> = ({ onSave, config, lastBalance }) => {
  const [data, setData] = useState({
    date: new Date().toISOString().split('T')[0],
    totalPaid: 0,
    principalPart: 0,
    interestPart: 0,
    taxPart: 0,
    insurancePart: 0,
    remainingBalance: lastBalance,
    note: "",
    checkNumber: ""
  });

  const handleAutoSplit = () => {
    // Standard split: Total - Taxes - Insurance = Net. Net is split between P and I.
    const netPayment = data.totalPaid - data.taxPart - data.insurancePart;
    const { principal, interest } = calculateSuggestedSplit(lastBalance, config.annualRate, netPayment);
    setData({
      ...data,
      principalPart: principal,
      interestPart: interest,
      remainingBalance: Math.round((lastBalance - principal) * 100) / 100
    });
  };

  const inputGroup = "space-y-2";
  const labelStyle = "text-xs font-bold text-slate-500 uppercase tracking-widest ml-1";
  const inputStyle = "w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-xl focus:ring-4 focus:ring-blue-100 outline-none transition-all placeholder:text-slate-300";

  return (
    <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-right-8 duration-500">
      <header className="mb-10">
        <h2 className="text-3xl font-black text-slate-900">Add Monthly Payment</h2>
        <p className="text-slate-500 font-medium">Enter the details from your statement below.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Left Side: Main Inputs */}
        <div className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-slate-100 space-y-6">
          <div className={inputGroup}>
            <label className={labelStyle}>Payment Date</label>
            <div className="relative">
              <Calendar className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
              <input type="date" className={`${inputStyle} pl-16`} value={data.date} onChange={e => setData({...data, date: e.target.value})} />
            </div>
          </div>

          <div className={inputGroup}>
            <label className={labelStyle}>Total Amount Paid ($)</label>
            <input 
              type="number" 
              placeholder="0.00"
              className={inputStyle} 
              value={data.totalPaid || ''} 
              onChange={e => setData({...data, totalPaid: parseFloat(e.target.value) || 0})} 
            />
          </div>

          <div className="grid grid-cols-2 gap-4 pt-4">
            <div className={inputGroup}>
              <label className={labelStyle}>Taxes ($)</label>
              <input 
                type="number" 
                placeholder="0.00"
                className={inputStyle} 
                value={data.taxPart || ''} 
                onChange={e => setData({...data, taxPart: parseFloat(e.target.value) || 0})} 
              />
            </div>
            <div className={inputGroup}>
              <label className={labelStyle}>Insurance ($)</label>
              <input 
                type="number" 
                placeholder="0.00"
                className={inputStyle} 
                value={data.insurancePart || ''} 
                onChange={e => setData({...data, insurancePart: parseFloat(e.target.value) || 0})} 
              />
            </div>
          </div>

          <button 
            onClick={handleAutoSplit}
            className="w-full bg-blue-50 text-blue-700 py-5 rounded-2xl font-black text-lg flex items-center justify-center gap-3 hover:bg-blue-100 transition-all border-2 border-dashed border-blue-200"
          >
            <Calculator size={24} />
            Calculate Principal Split
          </button>
        </div>

        {/* Right Side: Calculated Split & Save */}
        <div className="space-y-6">
          <div className="bg-emerald-600 text-white p-10 rounded-[2.5rem] shadow-xl shadow-emerald-900/10 space-y-6">
             <div className="flex justify-between items-center">
                <h3 className="text-xl font-black">Calculated Result</h3>
                <Save size={24} />
             </div>
             <div className="grid grid-cols-2 gap-6">
                <div>
                   <p className="text-emerald-200 text-xs font-bold uppercase tracking-widest mb-1">To Principal</p>
                   <p className="text-3xl font-black">{formatUSD(data.principalPart)}</p>
                </div>
                <div>
                   <p className="text-emerald-200 text-xs font-bold uppercase tracking-widest mb-1">To Interest</p>
                   <p className="text-3xl font-black">{formatUSD(data.interestPart)}</p>
                </div>
             </div>
             <div className="pt-6 border-t border-emerald-500/50">
                <p className="text-emerald-200 text-xs font-bold uppercase tracking-widest mb-1">New Remaining Balance</p>
                <p className="text-4xl font-black">{formatUSD(data.remainingBalance)}</p>
             </div>
          </div>

          <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 space-y-4">
            <div className={inputGroup}>
              <label className={labelStyle}>Check / Ref Number (Optional)</label>
              <input type="text" className={inputStyle} value={data.checkNumber} onChange={e => setData({...data, checkNumber: e.target.value})} />
            </div>
            <button 
              disabled={!data.totalPaid || data.remainingBalance < 0}
              onClick={() => onSave(data)}
              className="w-full bg-slate-900 text-white py-6 rounded-2xl font-black text-xl hover:bg-black transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-2xl shadow-slate-200"
            >
              Add to History
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
