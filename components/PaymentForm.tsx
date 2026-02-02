
import React, { useState, useEffect } from 'react';
import { PaymentRecord } from '../types';
import { X, Save, AlertCircle } from 'lucide-react';

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...formData as PaymentRecord,
      id: payment?.id || Date.now().toString(),
    });
  };

  const inputClass = "w-full px-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all text-lg font-medium";
  const labelClass = "block text-sm font-bold text-slate-600 mb-2 ml-1";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-md transition-opacity"
        onClick={onClose}
      ></div>
      
      <div className="relative bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl shadow-slate-900/20 overflow-hidden animate-in fade-in zoom-in duration-300">
        <div className="flex items-center justify-between p-8 border-b border-slate-100 bg-slate-50/50">
          <div>
            <h2 className="text-2xl font-black text-slate-800">
              {payment ? 'Edit Record' : 'Add New Payment'}
            </h2>
            <p className="text-slate-500 font-medium">Please fill in the payment details below.</p>
          </div>
          <button 
            onClick={onClose}
            className="p-3 bg-white border border-slate-200 rounded-2xl text-slate-400 hover:text-slate-600 shadow-sm transition-all active:scale-90"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-8 max-h-[70vh] overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-6">
              <div>
                <label className={labelClass}>Payment Date</label>
                <input 
                  type="date" 
                  required
                  className={inputClass}
                  value={formData.paymentDate}
                  onChange={(e) => setFormData(f => ({ ...f, paymentDate: e.target.value }))}
                />
              </div>

              <div>
                <label className={labelClass}>Check Number</label>
                <input 
                  type="text" 
                  className={inputClass}
                  placeholder="e.g., 1234"
                  value={formData.checkNumber}
                  onChange={(e) => setFormData(f => ({ ...f, checkNumber: e.target.value }))}
                />
              </div>

              <div>
                <label className={labelClass}>Total Paid ($)</label>
                <input 
                  type="number" 
                  step="0.01"
                  required
                  className={inputClass}
                  value={formData.totalPayment}
                  onChange={(e) => setFormData(f => ({ ...f, totalPayment: parseFloat(e.target.value) }))}
                />
              </div>
            </div>

            <div className="space-y-6">
               <div>
                <label className={labelClass}>Principal Paid ($)</label>
                <input 
                  type="number" 
                  step="0.01"
                  className={inputClass}
                  value={formData.principalPaid}
                  onChange={(e) => setFormData(f => ({ ...f, principalPaid: parseFloat(e.target.value) }))}
                />
              </div>

              <div>
                <label className={labelClass}>Interest Rate (%)</label>
                <input 
                  type="number" 
                  step="0.001"
                  className={inputClass}
                  value={formData.interestRate}
                  onChange={(e) => setFormData(f => ({ ...f, interestRate: parseFloat(e.target.value) }))}
                />
              </div>

              <div>
                <label className={labelClass}>Remaining Balance ($)</label>
                <input 
                  type="number" 
                  step="0.01"
                  className={inputClass}
                  value={formData.principalBalance}
                  onChange={(e) => setFormData(f => ({ ...f, principalBalance: parseFloat(e.target.value) }))}
                />
              </div>
            </div>
          </div>

          <div className="bg-blue-50 p-6 rounded-3xl border border-blue-100 flex gap-4">
            <AlertCircle className="text-blue-500 shrink-0" />
            <p className="text-blue-700 text-sm font-medium">
              Calculations for taxes and interest paid are automatically logged in the system. 
              Double check the "Principal Paid" to ensure accuracy of the balance.
            </p>
          </div>

          <div className="flex gap-4 pt-4 sticky bottom-0 bg-white">
            <button 
              type="button"
              onClick={onClose}
              className="flex-1 py-5 rounded-2xl text-slate-600 font-bold border border-slate-200 hover:bg-slate-50 transition-all"
            >
              Cancel
            </button>
            <button 
              type="submit"
              className="flex-1 py-5 rounded-2xl bg-blue-600 text-white font-bold shadow-lg shadow-blue-200 hover:bg-blue-700 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
            >
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
