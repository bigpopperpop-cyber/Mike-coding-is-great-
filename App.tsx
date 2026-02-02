
import React, { useState, useMemo, useEffect } from 'react';
import { PaymentRecord, SummaryStats } from './types.ts';
import { INITIAL_DATA } from './data.ts';
import { formatCurrency } from './utils.ts';
import PaymentTable from './components/PaymentTable.tsx';
import PaymentForm from './components/PaymentForm.tsx';
import Stats from './components/Stats.tsx';
import Charts from './components/Charts.tsx';
import Maintenance from './components/Maintenance.tsx';
import { PlusCircle, Search, Home, FileText, BarChart3, Settings } from 'lucide-react';

const App: React.FC = () => {
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingPayment, setEditingPayment] = useState<PaymentRecord | undefined>(undefined);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'table' | 'charts' | 'maintenance'>('table');

  useEffect(() => {
    try {
      const saved = localStorage.getItem('family_payments');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setPayments(parsed);
          return;
        }
      }
    } catch (e) {
      console.error("Failed to load data from storage", e);
    }
    // Default data if nothing in storage
    const sortedInitial = [...INITIAL_DATA].sort((a, b) => 
      new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime()
    );
    setPayments(sortedInitial);
  }, []);

  useEffect(() => {
    if (payments.length > 0) {
      localStorage.setItem('family_payments', JSON.stringify(payments));
    }
  }, [payments]);

  const filteredPayments = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return payments
      .filter(p => {
        const dateMatch = (p.paymentDate || '').toLowerCase().includes(term);
        const checkMatch = p.checkNumber ? String(p.checkNumber).toLowerCase().includes(term) : false;
        return dateMatch || checkMatch;
      })
      .sort((a, b) => new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime());
  }, [payments, searchTerm]);

  const stats: SummaryStats = useMemo(() => {
    const sorted = [...payments].sort((a, b) => new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime());
    const latest = sorted[0];
    
    return payments.reduce((acc, curr) => {
      acc.totalPrincipalPaid += (curr.principalPaid || 0);
      acc.totalInterestPaid += Math.abs(curr.interestPaid || 0);
      acc.totalTaxesPaid += (curr.taxesPaid || 0);
      acc.totalInsurancePaid += (curr.insurancePaid || 0);
      acc.paymentCount += 1;
      return acc;
    }, {
      totalPrincipalPaid: 0,
      totalInterestPaid: 0,
      totalTaxesPaid: 0,
      totalInsurancePaid: 0,
      remainingBalance: latest?.principalBalance || 0,
      paymentCount: 0
    });
  }, [payments]);

  const handleSavePayment = (payment: PaymentRecord) => {
    if (editingPayment) {
      setPayments(prev => prev.map(p => p.id === payment.id ? payment : p));
    } else {
      setPayments(prev => [payment, ...prev]);
    }
    setIsFormOpen(false);
    setEditingPayment(undefined);
  };

  const handleEdit = (payment: PaymentRecord) => {
    setEditingPayment(payment);
    setIsFormOpen(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Are you sure you want to remove this record?")) {
      setPayments(prev => prev.filter(p => p.id !== id));
    }
  };

  return (
    <div className="min-h-screen pb-20 md:pb-0 md:pl-64">
      <aside className="fixed left-0 top-0 hidden h-full w-64 flex-col bg-white border-r border-slate-200 md:flex">
        <div className="p-6 flex items-center gap-3 border-b border-slate-100">
          <div className="bg-blue-600 p-2 rounded-lg text-white">
            <Home size={24} />
          </div>
          <h1 className="text-xl font-bold text-slate-800 leading-tight">Home Payment Tracker</h1>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <button 
            onClick={() => setActiveTab('table')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'table' ? 'bg-blue-50 text-blue-700 font-semibold shadow-sm' : 'text-slate-600 hover:bg-slate-50'}`}
          >
            <FileText size={20} />
            Payment History
          </button>
          <button 
            onClick={() => setActiveTab('charts')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'charts' ? 'bg-blue-50 text-blue-700 font-semibold shadow-sm' : 'text-slate-600 hover:bg-slate-50'}`}
          >
            <BarChart3 size={20} />
            Analytics
          </button>
          <button 
            onClick={() => setActiveTab('maintenance')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'maintenance' ? 'bg-blue-50 text-blue-700 font-semibold shadow-sm' : 'text-slate-600 hover:bg-slate-50'}`}
          >
            <Settings size={20} />
            Data Management
          </button>
        </nav>
        <div className="p-4 mt-auto">
          <button 
            onClick={() => { setEditingPayment(undefined); setIsFormOpen(true); }}
            className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white font-bold py-4 px-6 rounded-2xl shadow-lg shadow-blue-200 hover:bg-blue-700 active:scale-95 transition-all"
          >
            <PlusCircle size={22} />
            Add Payment
          </button>
        </div>
      </aside>

      <header className="md:hidden bg-white border-b border-slate-200 p-4 sticky top-0 z-10 flex justify-between items-center">
        <h1 className="text-lg font-bold text-slate-800">Home Payments</h1>
        <button 
          onClick={() => { setEditingPayment(undefined); setIsFormOpen(true); }}
          className="bg-blue-600 text-white p-2 rounded-full shadow-md"
        >
          <PlusCircle size={24} />
        </button>
      </header>

      <main className="p-4 md:p-8 max-w-7xl mx-auto">
        <div className="mb-8">
          <h2 className="text-3xl font-extrabold text-slate-900">Hello, Ma'am!</h2>
          <p className="text-slate-500 text-lg mt-1">Here is a summary of the house payments and balance.</p>
        </div>

        <Stats stats={stats} />

        <div className="flex md:hidden bg-slate-200 p-1 rounded-xl mb-6">
          <button onClick={() => setActiveTab('table')} className={`flex-1 py-2 px-4 rounded-lg font-bold transition-all ${activeTab === 'table' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-600'}`}>Records</button>
          <button onClick={() => setActiveTab('charts')} className={`flex-1 py-2 px-4 rounded-lg font-bold transition-all ${activeTab === 'charts' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-600'}`}>Charts</button>
          <button onClick={() => setActiveTab('maintenance')} className={`flex-1 py-2 px-4 rounded-lg font-bold transition-all ${activeTab === 'maintenance' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-600'}`}>Data</button>
        </div>

        {activeTab === 'table' && (
          <section className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <h3 className="text-2xl font-bold text-slate-800">Recent Payments</h3>
              <div className="relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={20} />
                <input 
                  type="text" 
                  placeholder="Search dates or checks..." 
                  className="w-full md:w-80 pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all text-lg shadow-sm"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
              <PaymentTable payments={filteredPayments} onEdit={handleEdit} onDelete={handleDelete} />
            </div>
          </section>
        )}

        {activeTab === 'charts' && (
          <section className="space-y-8">
            <h3 className="text-2xl font-bold text-slate-800">Financial Trends</h3>
            <Charts payments={payments} />
          </section>
        )}

        {activeTab === 'maintenance' && (
          <section className="space-y-8">
            <h3 className="text-2xl font-bold text-slate-800">Data Management</h3>
            <Maintenance payments={payments} onRestore={setPayments} />
          </section>
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
