
import { PaymentRecord } from './types.ts';

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};

export const formatDate = (dateString: string): string => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

export const convertToCSV = (payments: PaymentRecord[]): string => {
  const headers = ['Date', 'Total Payment', 'Principal Paid', 'Interest Paid', 'Taxes', 'Insurance', 'Balance', 'Check #'];
  const rows = payments.map(p => [
    p.paymentDate,
    p.totalPayment,
    p.principalPaid,
    p.interestPaid,
    p.taxesPaid,
    p.insurancePaid,
    p.principalBalance,
    `"${p.checkNumber}"`
  ]);
  
  return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
};

export const downloadFile = (content: string, fileName: string, contentType: string) => {
  const a = document.createElement('a');
  const file = new Blob([content], { type: contentType });
  a.href = URL.createObjectURL(file);
  a.download = fileName;
  a.click();
  URL.revokeObjectURL(a.href);
};
