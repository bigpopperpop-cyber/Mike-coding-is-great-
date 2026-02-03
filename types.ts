
export interface PaymentRecord {
  id: string;
  date: string;
  totalPaid: number;
  principalPart: number;
  interestPart: number;
  taxPart: number;
  insurancePart: number;
  remainingBalance: number;
  note: string;
  checkNumber?: string;
  lastModified: number;
  // Added for compatibility with components/PaymentForm.tsx
  interestRate?: number;
}

export interface MortgageConfig {
  nickname: string;
  initialBalance: number;
  annualRate: number;
  startDate: string;
}

export interface SummaryStats {
  currentBalance: number;
  totalPaidToDate: number;
  totalInterestPaid: number;
  totalEquityGained: number;
  percentComplete: number;
  // Added for compatibility with components/Stats.tsx
  totalPrincipalPaid: number;
  totalTaxesPaid: number;
  totalInsurancePaid: number;
}
