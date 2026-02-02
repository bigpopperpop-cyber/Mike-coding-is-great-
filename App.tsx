
import React, { useState, useEffect, useMemo } from 'react';
import { PlusCircle, History, LayoutDashboard, Settings, Save, Trash2, Download, Upload, Home } from 'lucide-react';
import { MortgagePayment, MortgageStats } from './types.ts';
import { DATA_KEY, SETTINGS_KEY, AppSettings } from './data.ts';
import { formatCurrency, formatDate, calculateInterestSplit } from './utils.ts';

const App: React.FC = () => {
  const [payments, setPayments] = useState<MortgagePayment[]>([]);
  const [settings, setSettings] = useState<AppSettings>({ initialBalance: 230000, houseNickName: "Family Home" });
  const [activeTab, setActiveTab] = useState<'dash' | 'history' | 'admin'>('dash');
  const [isFormOpen, setIsFormOpen] = useState(false);
  
  // Load data
  useEffect(() => {
    const savedData = localStorage.getItem(DATA_KEY);
    const savedSettings = localStorage.getItem(SETTINGS_KEY);
    if (savedData) setPayments(JSON.parse(savedData));
    if (savedSettings) setSettings(JSON.parse(savedSettings));
  }, []);

  // Save data
  useEffect(() => {
    localStorage.setItem(DATA_KEY, JSON.stringify(payments));
  }, [payments]);

  useEffect(() => {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  }, [settings]);

  const stats: MortgageStats = useMemo(() => {
    const sorted = [...payments].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    const latestBalance = sorted.length > 0 ? sorted[sorted.length - 1].remainingBalance : settings.initialBalance;
    
    return payments.reduce((acc, p) => {
      acc.totalPaid += p.amountPaid;
      acc.totalInterest += p.interestPart;
      acc.totalTaxesAndInsurance += (p.taxesPart + p.insurancePart);
      return acc;
    }, {
      originalBalance: settings.initialBalance,
      currentBalance: latestBalance,
      totalPaid: 0,
      totalInterest: 0,
      totalTaxesAndInsurance: 0
    });
  }, [payments, settings]);

  const addPayment = (e: any) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const date = formData.get('date') as string;
    const amount = Number(formData.get('amount'));
    const rate = Number(formData.get('rate'));
    const taxes = Number(formData.get('taxes'));
    const insurance = Number(formData.get('insurance'));
    
    // Sort existing to find current balance
    const sorted = [...payments].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    const currentBal = sorted.length > 0 ? sorted[sorted.length - 1].remainingBalance : settings.initialBalance;
    
    const netPayment = amount - taxes - insurance;
    const split = calculateInterestSplit(currentBal, rate, netPayment);
    
    const newPayment: MortgagePayment = {
      id: Date.now().toString(),
      date,
      amountPaid: amount,
      interestRate: rate,
      interestPart: split.interest,
      principalPart: split.principal,
      taxesPart: taxes,
      insurancePart: insurance,
      remainingBalance: currentBal - split.principal,
      note: formData.get('note') as string
    };

    setPayments(prev => [...prev, newPayment].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    setIsFormOpen(false);
  };

  const deletePayment = (id: string) => {
    if (confirm("Delete this record permanently?")) {
      setPayments(prev => prev.filter(p => p.id !== id));
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-50">
      {/* Sidebar */}
      <nav className="w-full md:w-64 bg-white border-b md:border-r border-slate-200 p-4 flex flex-row md:flex-col gap-2 sticky top-0 z-30">
        <div className="hidden md:flex items-center gap-3 p-4 mb-6">
          <div className="bg-blue-600 p-2 rounded-lg text-white"><Home size={24} /></div>
          <span className="font-bold text-xl tracking-tight">HomeTracker</span>
        </div>
        
        <button onClick={() => setActiveTab('dash')} className={`flex-1 md:flex-none flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all ${activeTab === 'dash' ? 'bg-blue-50 text-blue-700' : 'text-slate-500 hover:bg-slate-50'}`}>
          <LayoutDashboard size={20} /> <span className="hidden md:inline">Summary</span>
        </button>
        <button onClick={() => setActiveTab('history')} className={`flex-1 md:flex-none flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all ${activeTab === 'history' ? 'bg-blue-50 text-blue-700' : 'text-slate-500 hover:bg-slate-50'}`}>
          <History size={20} /> <span className="hidden md:inline">Payments</span>
        </button>
        <button onClick={() => setActiveTab('admin')} className={`flex-1 md:flex-none flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all ${activeTab === 'admin' ? 'bg-blue-50 text-blue-700' : 'text-slate-500 hover:bg-slate-50'}`}>
          <Settings size={20} /> <span className="hidden md:inline">Setup</span>
        </button>
        
        <button 
          onClick={() => setIsFormOpen(true)}
          className="md:mt-auto bg-blue-600 text-white p-3 md:p-4 rounded-xl md:rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all active:scale-95"
        >
          <PlusCircle size={24} /> <span className="hidden md:inline">Add Payment</span>
        </button>
      </nav>

      {/* Content */}
      <main className="flex-1 p-4 md:p-10 max-w-6xl mx-auto w-full">
        <div className="mb-8">
          <h1 className="text-4xl font-black text-slate-900">{settings.houseNickName}</h1>
          <p className="text-slate-500 font-medium">Mortgage Tracker for Ma'am</p>
        </div>

        {activeTab === 'dash' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
                <p className="text-slate-500 text-sm font-bold uppercase tracking-wider mb-1">Remaining Balance</p>
                <p className="text-4xl font-black text-blue-600">{formatCurrency(stats.currentBalance)}</p>
              </div>
              <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
                <p className="text-slate-500 text-sm font-bold uppercase tracking-wider mb-1">Total Paid to Date</p>
                <p className="text-4xl font-black text-slate-900">{formatCurrency(stats.totalPaid)}</p>
              </div>
              <div className="bg-emerald-50 p-8 rounded-3xl shadow-sm border border-emerald-100">
                <p className="text-emerald-700 text-sm font-bold uppercase tracking-wider mb-1">Interest Paid</p>
                <p className="text-4xl font-black text-emerald-600">{formatCurrency(stats.totalInterest)}</p>
              </div>
            </div>
            
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
              <h2 className="text-2xl font-bold mb-6">Payment Progress</h2>
              <div className="w-full bg-slate-100 h-6 rounded-full overflow-hidden">
                <div 
                  className="bg-blue-600 h-full transition-all duration-1000" 
                  style={{ width: `${Math.min(100, (1 - stats.currentBalance / stats.originalBalance) * 100)}%` }}
                />
              </div>
              <p className="mt-4 text-slate-600 font-medium">You have paid off {((1 - stats.currentBalance / stats.originalBalance) * 100).toFixed(1)}% of the mortgage.</p>
            </div>
          </div>
        )}

        {activeTab === 'history' && (
          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50 border-b border-slate-100">
                  <tr>
                    <th className="px-6 py-4 text-sm font-bold text-slate-500">Date</th>
                    <th className="px-6 py-4 text-sm font-bold text-slate-500">Paid</th>
                    <th className="px-6 py-4 text-sm font-bold text-slate-500">Principal</th>
                    <th className="px-6 py-4 text-sm font-bold text-slate-500">Balance</th>
                    <th className="px-6 py-4 text-sm font-bold text-slate-500 text-right">Delete</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {payments.length === 0 ? (
                    <tr><td colSpan={5} className="px-6 py-20 text-center text-slate-400 font-medium">No payments recorded yet.</td></tr>
                  ) : payments.map(p => (
                    <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-5 font-bold text-slate-800">{formatDate(p.date)}</td>
                      <td className="px-6 py-5 font-bold text-blue-600">{formatCurrency(p.amountPaid)}</td>
                      <td className="px-6 py-5 text-emerald-600 font-medium">{formatCurrency(p.principalPart)}</td>
                      <td className="px-6 py-5 text-slate-500 font-medium">{formatCurrency(p.remainingBalance)}</td>
                      <td className="px-6 py-5 text-right">
                        <button onClick={() => deletePayment(p.id)} className="text-slate-300 hover:text-red-500 transition-colors p-2"><Trash2 size={20}/></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'admin' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2"><Settings size={20}/> Mortgage Settings</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-slate-600 mb-1">House Name</label>
                  <input 
                    type="text" 
                    value={settings.houseNickName} 
                    onChange={e => setSettings({...settings, houseNickName: e.target.value})}
                    className="w-full p-4 bg-slate-50 border rounded-2xl focus:ring-4 focus:ring-blue-100 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-600 mb-1">Starting Balance ($)</label>
                  <input 
                    type="number" 
                    value={settings.initialBalance} 
                    onChange={e => setSettings({...settings, initialBalance: Number(e.target.value)})}
                    className="w-full p-4 bg-slate-50 border rounded-2xl focus:ring-4 focus:ring-blue-100 outline-none transition-all"
                  />
                </div>
              </div>
            </div>

            <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2"><Download size={20}/> Data Tools</h3>
              <div className="space-y-3">
                <button 
                  onClick={() => {
                    const blob = new Blob([JSON.stringify(payments)], {type: 'application/json'});
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url; a.download = 'mortgage-backup.json'; a.click();
                  }}
                  className="w-full p-4 bg-slate-100 text-slate-700 font-bold rounded-2xl flex items-center justify-center gap-2 hover:bg-slate-200 transition-all"
                >
                  <Download size={20}/> Download Backup
                </button>
                <label className="w-full p-4 bg-blue-50 text-blue-700 font-bold rounded-2xl flex items-center justify-center gap-2 hover:bg-blue-100 transition-all cursor-pointer">
                  <Upload size={20}/> Restore from File
                  <input type="file" className="hidden" onChange={e => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = (ev) => {
                        const data = JSON.parse(ev.target?.result as string);
                        if (Array.isArray(data)) setPayments(data);
                      };
                      reader.readAsText(file);
                    }
                  }}/>
                </label>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Add Payment Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-8 border-b border-slate-100 flex justify-between items-center">
              <h2 className="text-2xl font-black">Record Payment</h2>
              <button onClick={() => setIsFormOpen(false)} className="text-slate-400 hover:text-slate-600 font-bold text-2xl">×</button>
            </div>
            <form onSubmit={addPayment} className="p-8 space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-600 mb-1">Date</label>
                  <input name="date" type="date" required className="w-full p-4 bg-slate-50 border rounded-2xl focus:ring-4 focus:ring-blue-100 outline-none transition-all" defaultValue={new Date().toISOString().split('T')[0]} />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-600 mb-1">Total Paid ($)</label>
                  <input name="amount" type="number" step="0.01" required placeholder="0.00" className="w-full p-4 bg-slate-50 border rounded-2xl focus:ring-4 focus:ring-blue-100 outline-none transition-all" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-600 mb-1">Interest Rate (%)</label>
                  <input name="rate" type="number" step="0.001" defaultValue="2.8" required className="w-full p-4 bg-slate-50 border rounded-2xl focus:ring-4 focus:ring-blue-100 outline-none transition-all" />
                </div>
                <div>
                   <label className="block text-sm font-bold text-slate-600 mb-1">Tax/Escrow ($)</label>
                   <input name="taxes" type="number" step="0.01" defaultValue="0" className="w-full p-4 bg-slate-50 border rounded-2xl focus:ring-4 focus:ring-blue-100 outline-none transition-all" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-600 mb-1">Insurance ($)</label>
                <input name="insurance" type="number" step="0.01" defaultValue="0" className="w-full p-4 bg-slate-50 border rounded-2xl focus:ring-4 focus:ring-blue-100 outline-none transition-all" />
              </div>
              <div className="pt-4 flex gap-4">
                <button type="button" onClick={() => setIsFormOpen(false)} className="flex-1 py-4 bg-slate-100 text-slate-600 font-bold rounded-2xl hover:bg-slate-200 transition-all">Cancel</button>
                <button type="submit" className="flex-1 py-4 bg-blue-600 text-white font-bold rounded-2xl shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all flex items-center justify-center gap-2">
                  <Save size={20}/> Save Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
