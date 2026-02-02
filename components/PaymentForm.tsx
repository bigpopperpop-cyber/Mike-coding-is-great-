
import React, { useState, useEffect, useMemo } from 'react';
import { PaymentRecord } from '../types.ts';
import { X, Save, Calculator, Landmark, ShieldCheck } from 'lucide-react';
import { formatCurrency } from '../utils.ts';

interface PaymentFormProps {
  payment?: PaymentRecord;
  onSave: (payment: PaymentRecord) => void;
  onClose: () => void;
}

const PaymentForm: React.FC<PaymentFormProps> = ({ payment, onSave, onClose }) => {
  const [formData, setFormData] = useState<Partial<PaymentRecord>>({
    paymentDate: new Date().toISOString().split('T')[0],
    totalPayment: 1800,
    interestRate: 0.028,
    principalPaid: 0,
    interestPaid: 0,
    taxesPaid: 0,
    insurancePaid: 0,
    principalBalance: 0,
    checkNumber: '',
  });

  useEffect(() => {
    if (payment) {
      setFormData(payment);
    }
  }, [payment]);

  // This calculates "The Rest" - Total minus Taxes and Insurance
  const netForLoan = useMemo(() => {
    const total = Number(formData.totalPayment) || 0;
    const taxes = Number(formData.taxesPaid) || 0;
    const insurance = Number(formData.insurancePaid) || 0;
    return Math.max(0, total - taxes - insurance);
  }, [formData.totalPayment, formData.taxesPaid, formData.insurancePaid]);

  const suggestSplit = () => {
    const balance = Number(formData.principalBalance) || 0;
    const rate = Number(formData.interestRate) || 0.028;
    const estimatedInterest = (balance * rate) / 12;
    const suggestedPrincipal = netForLoan - estimatedInterest;
    
    setFormData(prev => ({
      ...prev,
      interestPaid: -Math.abs(estimatedInterest), 
      principalPaid: Number(suggestedPrincipal.toFixed(2))
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalData: PaymentRecord = {
      id: payment?.id || Date.now().toString(),
      rowNumber: payment?.rowNumber || 0,
      paymentDate: formData.paymentDate || new Date().toISOString().split('T')[0],
      interestRate: Number(formData.interestRate) || 0.028,
      principalBalance: Number(formData.principalBalance) || 0,
      principalPaid: Number(formData.principalPaid) || 0,
      interestPaid: Number(formData.interestPaid) || 0,
      taxesPaid: Number(formData.taxesPaid) || 0,
      insurancePaid: Number(formData.insurancePaid) || 0,
      totalPayment: Number(formData.totalPayment) || 0,
      checkNumber: String(formData.checkNumber || ''),
    };
    onSave(finalData);
  };

  const inputClass = "w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all text-lg font-medium";
  const labelClass = "block text-sm font-bold text-slate-600 mb-1.5 ml-1";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-md" onClick={onClose} />
      
      <div className="relative bg-white w-full max-w-3xl rounded-[2.5rem] shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-slate-50/50">
          <div>
            <h2 className="text-2xl font-black text-slate-800">{payment ? 'Edit Record' : 'Add New Payment'}</h2>
            <p className="text-slate-500 font-medium">Record monthly house payment details.</p>
          </div>
          <button onClick={onClose} type="button" className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-slate-600 shadow-sm transition-all active:scale-90">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[85vh] overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Payment Date</label>
              <input type="date" required className={inputClass} value={formData.paymentDate ?? ''} onChange={(e) => setFormData(f => ({ ...f, paymentDate: e.target.value }))} />
            </div>
            <div>
              <label className={labelClass}>Check Number</label>
              <input type="text" className={inputClass} placeholder="e.g., 4943" value={formData.checkNumber ?? ''} onChange={(e) => setFormData(f => ({ ...f, checkNumber: e.target.value }))} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <h3 className="font-bold text-slate-700 flex items-center gap-2">
                <Landmark size={18} className="text-blue-500" />
                Payment Breakdown
              </h3>
              <div>
                <label className={labelClass}>Total Paid ($)</label>
                <input type="number" step="0.01" required className={inputClass} value={formData.totalPayment ?? ''} onChange={(e) => setFormData(f => ({ ...f, totalPayment: parseFloat(e.target.value) || 0 }))} />
              </div>
              <div className="pt-2">
                <div className="flex justify-between items-center mb-1 px-1">
                   <label className="text-sm font-bold text-slate-600 italic">Net for Mortgage Loan</label>
                   <span className="text-blue-600 font-black text-lg">{formatCurrency(netForLoan)}</span>
                </div>
                <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 transition-all duration-500" style={{ width: `${Math.min(100, (netForLoan / (Number(formData.totalPayment) || 1)) * 100)}%` }} />
                </div>
              </div>
            </div>

            <div className="space-y-4 p-4 bg-rose-50/30 rounded-2xl border border-rose-100">
              <h3 className="font-bold text-rose-700 flex items-center gap-2">
                <ShieldCheck size={18} className="text-rose-500" />
                Taxes & Insurance
              </h3>
              <div>
                <label className={labelClass}>Amount to Taxes ($)</label>
                <input type="number" step="0.01" className={inputClass} placeholder="0.00" value={formData.taxesPaid ?? ''} onChange={(e) => setFormData(f => ({ ...f, taxesPaid: parseFloat(e.target.value) || 0 }))} />
              </div>
              <div>
                <label className={labelClass}>Amount to Insurance ($)</label>
                <input type="number" step="0.01" className={inputClass} placeholder="0.00" value={formData.insurancePaid ?? ''} onChange={(e) => setFormData(f => ({ ...f, insurancePaid: parseFloat(e.target.value) || 0 }))} />
              </div>
            </div>
          </div>

          <div className="space-y-4 p-5 bg-emerald-50/30 rounded-2xl border border-emerald-100">
             <div className="flex justify-between items-center">
                <h3 className="font-bold text-emerald-700">Principal & Balance</h3>
                <button type="button" onClick={suggestSplit} className="text-xs bg-emerald-600 text-white px-3 py-1.5 rounded-lg font-bold flex items-center gap-1 hover:bg-emerald-700 transition-colors">
                  <Calculator size={14} />
                  Calculate Principal
                </button>
             </div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Principal Paid ($)</label>
                  <input type="number" step="0.01" className={inputClass} value={formData.principalPaid ?? ''} onChange={(e) => setFormData(f => ({ ...f, principalPaid: parseFloat(e.target.value) || 0 }))} />
                </div>
                <div>
                  <label className={labelClass}>Remaining Balance ($)</label>
                  <input type="number" step="0.01" className={inputClass} value={formData.principalBalance ?? ''} onChange={(e) => setFormData(f => ({ ...f, principalBalance: parseFloat(e.target.value) || 0 }))} />
                </div>
             </div>
          </div>

          <div className="flex gap-4 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-4 rounded-xl text-slate-600 font-bold border border-slate-200 hover:bg-slate-50 transition-all">Cancel</button>
            <button type="submit" className="flex-1 py-4 rounded-xl bg-blue-600 text-white font-bold shadow-lg shadow-blue-200 hover:bg-blue-700 active:scale-[0.98] transition-all flex items-center justify-center gap-2">
              <Save size={20} />
              Save Record
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PaymentForm;
