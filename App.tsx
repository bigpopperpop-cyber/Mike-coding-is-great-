
import React, { useState, useEffect, useMemo } from 'react';
import { 
  PlusCircle, 
  History, 
  LayoutDashboard, 
  Settings, 
  Home, 
  Search,
  LineChart
} from 'lucide-react';
import { PaymentRecord, SummaryStats, AppSettings } from './types.ts';
import { DATA_KEY, SETTINGS_KEY } from './data.ts';

// Component Imports
import Stats from './components/Stats.tsx';
import PaymentTable from './components/PaymentTable.tsx';
import PaymentForm from './components/PaymentForm.tsx';
import Charts from './components/Charts.tsx';
import Maintenance from './components/Maintenance.tsx';

// Added default export and completed the component definition
const App: React.FC = () => {
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [settings, setSettings] = useState<AppSettings>({ 
    initialBalance: 230000, 
    houseNickName: "Family Home" 
  });
  const [activeTab, setActiveTab] = useState<'dash' | 'history' | 'charts' | 'admin'>('dash');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingPayment, setEditingPayment] = useState<PaymentRecord | undefined>(undefined);
  const [searchTerm, setSearchTerm] = useState('');

  // Persistence
  useEffect(() => {
    const savedData = localStorage.getItem(DATA_KEY);
    const savedSettings = localStorage.getItem(SETTINGS_KEY);
    if (savedData) setPayments(JSON.parse(savedData));
    if (savedSettings) setSettings(JSON.parse(savedSettings));
  }, []);

  useEffect(() => {
    localStorage.setItem(DATA_KEY, JSON.stringify(payments));
  }, [payments]);

  useEffect(() => {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  }, [settings]);

  // Derived Stats
  const stats: SummaryStats = useMemo(() => {
    const sorted = [...payments].sort((a, b) => new Date(a.paymentDate).getTime() - new Date(b.paymentDate).getTime());
    const latestBalance = sorted.length > 0 ? sorted[sorted.length - 1].principalBalance : settings.initialBalance;
    
    return payments.reduce((acc, p) => {
      acc.totalPrincipalPaid += p.principalPaid;
      acc.totalInterestPaid += Math.abs(p.interestPaid);
      acc.totalTaxesPaid += p.taxesPaid;
      acc.totalInsurancePaid += p.insurancePaid;
      return acc;
    }, {
      remainingBalance: latestBalance,
      totalPrincipalPaid: 0,
      totalInterestPaid: 0,
      totalTaxesPaid: 0,
      totalInsurancePaid: 0,
      originalBalance: settings.initialBalance
    });
  }, [payments, settings]);

  const filteredPayments = useMemo(() => {
    return payments.filter(p => 
      p.paymentDate.includes(searchTerm) || 
      (p.checkNumber && p.checkNumber.includes(searchTerm)) ||
      (p.note || '').toLowerCase().includes(searchTerm.toLowerCase())
    ).sort((a, b) => new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime());
  }, [payments, searchTerm]);

  const handleSavePayment = (data: PaymentRecord) => {
    if (editingPayment) {
      setPayments(prev => prev.map(p => p.id === editingPayment.id ? data : p));
    } else {
      setPayments(prev => [...prev, data]);
    }
    setIsFormOpen(false);
    setEditingPayment(undefined);
  };

  const handleDeletePayment = (id: string) => {
    if (confirm("Permanently delete this payment record?")) {
      setPayments(prev => prev.filter(p => p.id !== id));
    }
  };

  const handleEditPayment = (payment: PaymentRecord) => {
    setEditingPayment(payment);
    setIsFormOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-50 text-slate-900">
      {/* Sidebar */}
      <aside className="w-full md:w-72 bg-white border-r border-slate-200 p-6 flex flex-col">
        <div className="flex items-center gap-3 mb-10 px-2">
          <div className="bg-blue-600 p-2.5 rounded-2xl text-white shadow-lg shadow-blue-200">
            <Home size={24} />
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tight">{settings.houseNickName}</h1>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Mortgage Ledger</p>
          </div>
        </div>

        <nav className="space-y-2 flex-1">
          <button 
            onClick={() => setActiveTab('dash')}
            className={`w-full flex items-center gap-4 px-4 py-4 rounded-2xl font-bold transition-all ${activeTab === 'dash' ? 'bg-blue-50 text-blue-600' : 'text-slate-400 hover:bg-slate-50 hover:text-slate-600'}`}
          >
            <LayoutDashboard size={22} />
            Dashboard
          </button>
          <button 
            onClick={() => setActiveTab('history')}
            className={`w-full flex items-center gap-4 px-4 py-4 rounded-2xl font-bold transition-all ${activeTab === 'history' ? 'bg-blue-50 text-blue-600' : 'text-slate-400 hover:bg-slate-50 hover:text-slate-600'}`}
          >
            <History size={22} />
            Payment History
          </button>
          <button 
            onClick={() => setActiveTab('charts')}
            className={`w-full flex items-center gap-4 px-4 py-4 rounded-2xl font-bold transition-all ${activeTab === 'charts' ? 'bg-blue-50 text-blue-600' : 'text-slate-400 hover:bg-slate-50 hover:text-slate-600'}`}
          >
            <LineChart size={22} />
            Analytics
          </button>
          <button 
            onClick={() => setActiveTab('admin')}
            className={`w-full flex items-center gap-4 px-4 py-4 rounded-2xl font-bold transition-all ${activeTab === 'admin' ? 'bg-blue-50 text-blue-600' : 'text-slate-400 hover:bg-slate-50 hover:text-slate-600'}`}
          >
            <Settings size={22} />
            Settings & Data
          </button>
        </nav>

        <button 
          onClick={() => { setEditingPayment(undefined); setIsFormOpen(true); }}
          className="mt-6 w-full bg-slate-900 text-white py-4 rounded-2xl font-bold shadow-xl shadow-slate-200 hover:bg-slate-800 transition-all flex items-center justify-center gap-2"
        >
          <PlusCircle size={20} />
          New Payment
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-10 overflow-y-auto max-h-screen">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
          <div>
            <h2 className="text-3xl font-black text-slate-900">
              {activeTab === 'dash' && 'Dashboard Overview'}
              {activeTab === 'history' && 'Payment History'}
              {activeTab === 'charts' && 'Financial Insights'}
              {activeTab === 'admin' && 'System Maintenance'}
            </h2>
            <p className="text-slate-500 font-medium">Tracking your path to home ownership.</p>
          </div>

          {(activeTab === 'history' || activeTab === 'dash') && (
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text"
                placeholder="Search payments..."
                className="pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-2xl w-full md:w-64 outline-none focus:ring-4 focus:ring-blue-100 transition-all font-medium"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          )}
        </header>

        {activeTab === 'dash' && (
          <>
            <Stats stats={stats} />
            <div className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
              <div className="p-8 border-b border-slate-50 flex items-center justify-between">
                <h3 className="text-xl font-bold text-slate-800">Recent Payments</h3>
                <button onClick={() => setActiveTab('history')} className="text-blue-600 font-bold text-sm hover:underline">View All</button>
              </div>
              <PaymentTable 
                payments={filteredPayments.slice(0, 5)} 
                onEdit={handleEditPayment}
                onDelete={handleDeletePayment}
              />
            </div>
          </>
        )}

        {activeTab === 'history' && (
          <div className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
             <PaymentTable 
                payments={filteredPayments} 
                onEdit={handleEditPayment}
                onDelete={handleDeletePayment}
              />
          </div>
        )}

        {activeTab === 'charts' && (
          <Charts payments={payments} />
        )}

        {activeTab === 'admin' && (
          <div className="space-y-8">
            <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-slate-100">
               <h3 className="text-xl font-bold text-slate-800 mb-6">General Settings</h3>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div>
                    <label className="block text-sm font-bold text-slate-600 mb-2">House Nickname</label>
                    <input 
                      type="text" 
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                      value={settings.houseNickName}
                      onChange={(e) => setSettings(s => ({...s, houseNickName: e.target.value}))}
                    />
                 </div>
                 <div>
                    <label className="block text-sm font-bold text-slate-600 mb-2">Original Loan Balance ($)</label>
                    <input 
                      type="number" 
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                      value={settings.initialBalance}
                      onChange={(e) => setSettings(s => ({...s, initialBalance: parseFloat(e.target.value) || 0}))}
                    />
                 </div>
               </div>
            </div>
            <Maintenance payments={payments} onRestore={setPayments} />
          </div>
        )}
      </main>

      {isFormOpen && (
        <PaymentForm 
          payment={editingPayment}
          onSave={handleSavePayment}
          onClose={() => { setIsFormOpen(false); setEditingPayment(undefined); }}
        />
      )}
    </div>
  );
};

export default App;
