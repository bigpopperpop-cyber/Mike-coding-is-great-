
export const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};

export const formatDate = (dateStr: string) => {
  if (!dateStr) return 'N/A';
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
};

export const calculateInterestSplit = (balance: number, annualRate: number, netPayment: number) => {
  // annualRate is expected as a percentage (e.g. 2.8 for 2.8%)
  const monthlyRate = (annualRate / 100) / 12;
  const interest = balance * monthlyRate;
  const principal = netPayment - interest;
  return {
    interest: Number(interest.toFixed(2)),
    principal: Number(principal.toFixed(2))
  };
};

export const downloadFile = (content: string, fileName: string, contentType: string) => {
  const blob = new Blob([content], { type: contentType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

export const convertToCSV = (data: any[]) => {
  if (!data || data.length === 0) return '';
  const headers = Object.keys(data[0]);
  const rows = data.map(obj => 
    headers.map(header => {
      const val = obj[header];
      if (val === null || val === undefined) return '';
      return typeof val === 'string' ? `"${val.replace(/"/g, '""')}"` : val;
    }).join(',')
  );
  return [headers.join(','), ...rows].join('\r\n');
};
