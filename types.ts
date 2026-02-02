
export interface MortgagePayment {
  id: string;
  date: string;
  amountPaid: number;
  interestRate: number;
  principalPart: number;
  interestPart: number;
  taxesPart: number;
  insurancePart: number;
  remainingBalance: number;
  note: string;
}

export interface MortgageStats {
  originalBalance: number;
  currentBalance: number;
  totalPaid: number;
  totalInterest: number;
  totalTaxesAndInsurance: number;
}

// Added to fix component errors
export interface PaymentRecord {
  id: string;
  rowNumber: number;
  paymentDate: string;
  interestRate: number;
  principalBalance: number;
  principalPaid: number;
  interestPaid: number;
  taxesPaid: number;
  insurancePaid: number;
  totalPayment: number;
  checkNumber: string;
}

// Added to fix component errors
export interface SummaryStats {
  remainingBalance: number;
  totalPrincipalPaid: number;
  totalInterestPaid: number;
  totalTaxesPaid: number;
  totalInsurancePaid: number;
}
