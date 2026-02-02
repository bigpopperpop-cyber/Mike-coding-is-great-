
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

export const parseRawCSV = (csvText: string) => {
  const lines = csvText.trim().split('\n');
  // Skip the header and the title line if it exists
  const dataLines = lines.slice(2); 

  return dataLines.map((line, index) => {
    const parts = line.split(',');
    return {
      id: `initial-${index}`,
      rowNumber: parseFloat(parts[0]) || 0,
      paymentDate: parts[17] || parts[18] || '', // Using the cleaned date columns
      interestRate: parseFloat(parts[2]) || 0,
      principalBalance: parseFloat(parts[3]) || 0,
      principalPaid: parseFloat(parts[4]) || 0,
      interestPaid: parseFloat(parts[6]) || 0,
      taxesPaid: parseFloat(parts[10]) || 0,
      insurancePaid: parseFloat(parts[13]) || 0,
      totalPayment: parseFloat(parts[14]) || 0,
      checkNumber: parts[16] || '',
    };
  }).filter(record => record.paymentDate !== '');
};
