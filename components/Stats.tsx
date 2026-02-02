
import React from 'react';
import { SummaryStats } from '../types';
import { formatCurrency } from '../utils';
import { Wallet, Landmark, ReceiptText, ShieldAlert } from 'lucide-react';

interface StatsProps {
  stats: SummaryStats;
}

const Stats: React.FC<StatsProps> = ({ stats }) => {
  const cards = [
    {
      label: 'Remaining Balance',
      value: formatCurrency(stats.remainingBalance),
      icon: <Landmark className="text-blue-600" size={28} />,
      bg: 'bg-blue-50',
      border: 'border-blue-100'
    },
    {
      label: 'Principal Paid',
      value: formatCurrency(stats.totalPrincipalPaid),
      icon: <Wallet className="text-emerald-600" size={28} />,
      bg: 'bg-emerald-50',
      border: 'border-emerald-100'
    },
    {
      label: 'Interest Paid',
      value: formatCurrency(stats.totalInterestPaid),
      icon: <ReceiptText className="text-amber-600" size={28} />,
      bg: 'bg-amber-50',
      border: 'border-amber-100'
    },
    {
      label: 'Taxes & Insurance',
      value: formatCurrency(stats.totalTaxesPaid + stats.totalInsurancePaid),
      icon: <ShieldAlert className="text-rose-600" size={28} />,
      bg: 'bg-rose-50',
      border: 'border-rose-100'
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
      {cards.map((card, idx) => (
        <div 
          key={idx} 
          className={`p-6 rounded-3xl border ${card.border} ${card.bg} flex flex-col justify-between transition-transform hover:scale-[1.02] duration-300 shadow-sm`}
        >
          <div className="flex items-center justify-between mb-4">
            <span className="p-3 bg-white rounded-2xl shadow-sm">
              {card.icon}
            </span>
            <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">Metric</span>
          </div>
          <div>
            <p className="text-slate-600 text-sm font-medium mb-1">{card.label}</p>
            <p className="text-2xl font-black text-slate-900">{card.value}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Stats;
