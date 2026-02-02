
import React from 'react';
import { PaymentRecord } from '../types.ts';
import { formatCurrency, formatDate } from '../utils.ts';
import { Edit2, Trash2, CheckCircle2, ReceiptText } from 'lucide-react';

interface PaymentTableProps {
  payments: PaymentRecord[];
  onEdit: (payment: PaymentRecord) => void;
  onDelete: (id: string) => void;
}

const PaymentTable: React.FC<PaymentTableProps> = ({ payments, onEdit, onDelete }) => {
  if (payments.length === 0) {
    return (
      <div className="p-20 text-center">
        <div className="bg-slate-50 inline-block p-6 rounded-full mb-4">
           <ReceiptText className="text-slate-300" size={48} />
        </div>
        <p className="text-slate-500 text-xl font-medium">No records found matching your search.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead className="bg-slate-50 border-b border-slate-100">
          <tr>
            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Date</th>
            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Payment</th>
            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Principal</th>
            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Remaining</th>
            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider hidden md:table-cell">Check #</th>
            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50">
          {payments.map((p) => (
            <tr key={p.id} className="hover:bg-blue-50/50 transition-colors group">
              <td className="px-6 py-5">
                <div className="flex items-center gap-3">
                  <CheckCircle2 size={18} className="text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <span className="font-bold text-slate-800 text-lg">{formatDate(p.paymentDate)}</span>
                </div>
              </td>
              <td className="px-6 py-5">
                <span className="font-bold text-slate-900">{formatCurrency(p.totalPayment)}</span>
                <div className="md:hidden text-xs text-slate-400">CH: {p.checkNumber || 'N/A'}</div>
              </td>
              <td className="px-6 py-5">
                <div className="flex flex-col">
                  <span className="text-emerald-600 font-bold">+{formatCurrency(p.principalPaid)}</span>
                  <span className="text-[10px] text-slate-400">Principal</span>
                </div>
              </td>
              <td className="px-6 py-5">
                <span className="text-slate-600 font-medium">{formatCurrency(p.principalBalance)}</span>
              </td>
              <td className="px-6 py-5 hidden md:table-cell">
                <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-sm font-medium">
                  {p.checkNumber || '-'}
                </span>
              </td>
              <td className="px-6 py-5 text-right">
                <div className="flex justify-end gap-2">
                  <button 
                    onClick={() => onEdit(p)}
                    className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                    title="Edit Record"
                  >
                    <Edit2 size={20} />
                  </button>
                  <button 
                    onClick={() => onDelete(p.id)}
                    className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                    title="Delete Record"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PaymentTable;
