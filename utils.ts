
export const formatUSD = (val: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(val);
};

// Added for compatibility with components
export const formatCurrency = formatUSD;

// Added for compatibility with components
export const formatDate = (dateStr: string) => {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

// Added for compatibility with components/Maintenance.tsx
export const downloadFile = (content: string, fileName: string, contentType: string) => {
  const a = document.createElement("a");
  const file = new Blob([content], { type: contentType });
  const url = URL.createObjectURL(file);
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

// Added for compatibility with components/Maintenance.tsx
export const convertToCSV = (data: any[]) => {
  if (data.length === 0) return '';
  const headers = Object.keys(data[0]);
  const rows = data.map(obj => 
    headers.map(header => {
      const val = obj[header as keyof typeof obj];
      return JSON.stringify(val === null || val === undefined ? "" : val);
    }).join(',')
  );
  return [headers.join(','), ...rows].join('\n');
};

export const calculateSuggestedSplit = (balance: number, annualRate: number, netPayment: number) => {
  const monthlyRate = (annualRate / 100) / 12;
  const interest = balance * monthlyRate;
  const principal = netPayment - interest;
  return {
    interest: Math.round(interest * 100) / 100,
    principal: Math.round(principal * 100) / 100
  };
};

export const downloadCSV = (data: any[], filename: string) => {
  if (data.length === 0) return;
  const csv = convertToCSV(data);
  downloadFile(csv, filename, 'text/csv');
};
