
export interface PaymentRecord {
  id: string;
  paymentDate: string;
  interestRate: number; // e.g., 2.8
  principalBalance: number;
  principalPaid: number;
  interestPaid: number;
  taxesPaid: number;
  insurancePaid: number;
  totalPayment: number;
  checkNumber: string;
  note?: string;
}

export interface SummaryStats {
  remainingBalance: number;
  totalPrincipalPaid: number;
  totalInterestPaid: number;
  totalTaxesPaid: number;
  totalInsurancePaid: number;
  originalBalance: number;
}

export interface AppSettings {
  initialBalance: number;
  houseNickName: string;
}
