
export const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};

export const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
    day: 'numeric'
  });
};

export const calculateInterestSplit = (balance: number, rate: number, payment: number) => {
  const monthlyRate = (rate / 100) / 12;
  const interest = balance * monthlyRate;
  const principal = payment - interest;
  return {
    interest: Number(interest.toFixed(2)),
    principal: Number(principal.toFixed(2))
  };
};

// Added to fix component errors
/**
 * Triggers a file download in the browser.
 */
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

// Added to fix component errors
/**
 * Converts an array of objects into a CSV string.
 */
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
