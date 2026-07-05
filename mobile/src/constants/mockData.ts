export interface Investment {
  id: string;
  name: string;
  amount: number;
  expectedROI: number;
  duration: number; // in months
  status: 'active' | 'approved' | 'reviewing' | 'liquidated' | 'declined';
  startDate?: string;
  createdAt: string;
  paymentReceipt?: string;
  receiptUploadedAt?: string;
  ceoPaymentAccount?: {
    bankName: string;
    accountNumber: string;
    accountName: string;
  };
}

export interface Transaction {
  id: string;
  type: 'deposit' | 'roi' | 'payout' | 'investment';
  amount: number;
  date: string;
  status: 'completed' | 'pending' | 'failed';
  title: string;
  description: string;
}

export const MOCK_INVESTMENTS: Investment[] = [
  {
    id: "LVP-582910",
    name: "Yield Max Land Banking",
    amount: 5000000,
    expectedROI: 7250000,
    duration: 12,
    status: 'active',
    startDate: new Date(Date.now() - 4 * 30 * 24 * 60 * 60 * 1000).toISOString(), // 4 months ago
    createdAt: new Date(Date.now() - 4 * 30 * 24 * 60 * 60 * 1000).toISOString(),
    ceoPaymentAccount: {
      bankName: "Zenith Bank",
      accountNumber: "1019283746",
      accountName: "Living Vine Properties Ltd"
    }
  },
  {
    id: "LVP-910283",
    name: "Wealth Builder Plan",
    amount: 1500000,
    expectedROI: 1950000,
    duration: 6,
    status: 'approved',
    createdAt: new Date().toISOString(),
    ceoPaymentAccount: {
      bankName: "Zenith Bank",
      accountNumber: "1019283746",
      accountName: "Living Vine Properties Ltd"
    }
  },
  {
    id: "LVP-102934",
    name: "Short-Term Yield Plan",
    amount: 800000,
    expectedROI: 920000,
    duration: 3,
    status: 'reviewing',
    createdAt: new Date().toISOString(),
  },
  {
    id: "LVP-382910",
    name: "Yield Max Land Banking",
    amount: 3000000,
    expectedROI: 4350000,
    duration: 12,
    status: 'liquidated',
    startDate: new Date(Date.now() - 13 * 30 * 24 * 60 * 60 * 1000).toISOString(), // 13 months ago
    createdAt: new Date(Date.now() - 13 * 30 * 24 * 60 * 60 * 1000).toISOString(),
  }
];

export const MOCK_TRANSACTIONS: Transaction[] = [
  {
    id: "TXN-882901",
    type: "deposit",
    amount: 5000000,
    date: new Date(Date.now() - 4 * 30 * 24 * 60 * 60 * 1000).toISOString(),
    status: "completed",
    title: "Investment Capital Deposit",
    description: "Paid into Zenith Bank for Yield Max Land Banking"
  },
  {
    id: "TXN-882902",
    type: "roi",
    amount: 187500,
    date: new Date(Date.now() - 3 * 30 * 24 * 60 * 60 * 1000).toISOString(),
    status: "completed",
    title: "Monthly ROI Payout",
    description: "Yield Max Land Banking - Month 1 ROI distribution"
  },
  {
    id: "TXN-882903",
    type: "roi",
    amount: 187500,
    date: new Date(Date.now() - 2 * 30 * 24 * 60 * 60 * 1000).toISOString(),
    status: "completed",
    title: "Monthly ROI Payout",
    description: "Yield Max Land Banking - Month 2 ROI distribution"
  },
  {
    id: "TXN-882904",
    type: "roi",
    amount: 187500,
    date: new Date(Date.now() - 1 * 30 * 24 * 60 * 60 * 1000).toISOString(),
    status: "completed",
    title: "Monthly ROI Payout",
    description: "Yield Max Land Banking - Month 3 ROI distribution"
  },
  {
    id: "TXN-901293",
    type: "investment",
    amount: 1500000,
    date: new Date().toISOString(),
    status: "pending",
    title: "Wealth Builder Plan Setup",
    description: "Pending verification of payment receipt"
  }
];

export const COMPANY_ACCOUNTS = [
  { bankName: "Zenith Bank", accountNumber: "1019283746", accountName: "Living Vine Properties Ltd" },
  { bankName: "Guaranty Trust Bank", accountNumber: "0123984756", accountName: "Living Vine Properties Ltd" }
];
