
export interface Account {
  id: string;
  name: string;
  type: 'Bank' | 'Credit Card' | 'Cash';
  last4: string;
  balance: number;
}

export interface Transaction {
  id: string;
  accountId?: string;
  date: string;
  description: string;
  amount: number;
  type: 'inflow' | 'outflow';
  category: string;
}

export interface LineItem {
  id: string;
  description: string;
  quantity: number;
  price: number;
  total: number;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  billingAddress: string;
  shippingAddress: string;
  reliabilityScore: number;
  overduePayments: number;
  avatarUrl?: string;
}

export interface Vendor {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  paymentTerms: string;
  avatarUrl?: string;
  dependencyRisk: number;
  totalSpent: number;
}

export interface Budget {
  category: string;
  budget: number;
  spent: number;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  unlocked: boolean;
}

export interface CashFlow {
  month: string;
  inflow: number;
  outflow: number;
  net: number;
}

export interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: number;
}

export interface TaxEstimation {
  estimatedTax: number;
  effectiveRate: number;
  breakdown: { bracket: string; tax: number }[];
  notes: string;
}

export interface Invoice {
  id: string;
  invoiceId: string;
  customerId: string;
  salesOrderId?: string;
  lineItems: LineItem[];
  subTotal: number;
  tax: number;
  total: number;
  status: 'Draft' | 'Sent' | 'Paid' | 'Overdue' | 'Cancelled';
  date: string;
  dueDate: string;
  paymentTerms: string;
  notes: string;
}

export interface SalesOrder {
  id: string;
  orderId: string;
  customerId: string;
  lineItems: LineItem[];
  subTotal: number;
  tax: number;
  total: number;
  status: 'Draft' | 'Sent' | 'Fulfilled' | 'Invoiced' | 'Cancelled';
  date: string;
  shippingAddress: string;
  notes: string;
}

export interface PurchaseOrder {
  id: string;
  orderId: string;
  vendorId: string;
  lineItems: LineItem[];
  subTotal: number;
  tax: number;
  total: number;
  status: 'Draft' | 'Sent' | 'Received' | 'Billed' | 'Cancelled';
  date: string;
  deliveryDate: string;
  shippingAddress: string;
  notes: string;
}

export interface Bill {
  id: string;
  billId: string;
  vendorId: string;
  purchaseOrderId?: string;
  lineItems: LineItem[];
  subTotal: number;
  tax: number;
  total: number;
  status: 'Draft' | 'Unpaid' | 'Paid' | 'Overdue';
  date: string;
  dueDate: string;
  notes: string;
}

export interface RecurringInvoice {
  id: string;
  customerId: string;
  lineItems: LineItem[];
  frequency: 'Weekly' | 'Monthly' | 'Yearly';
  startDate: string;
  nextDate: string;
  status: 'Active' | 'Paused';
  total: number;
}

export interface RecurringExpense {
  id: string;
  description: string;
  category: string;
  accountId: string;
  frequency: 'Weekly' | 'Monthly' | 'Yearly';
  startDate: string;
  nextDate: string;
  status: 'Active' | 'Paused';
  amount: number;
}

export interface RecurringBill {
    id: string;
    vendorId: string;
    lineItems: LineItem[];
    frequency: 'Weekly' | 'Monthly' | 'Yearly';
    startDate: string;
    nextDate: string;
    status: 'Active' | 'Paused';
    total: number;
}

export interface PaymentReceived {
  id: string;
  paymentId: string;
  customerId: string;
  customerName: string;
  invoiceId: string;
  date: string;
  method: 'Credit Card' | 'Bank Transfer' | 'PayPal';
  amount: number;
}

export interface PaymentMade {
    id: string;
    paymentId: string;
    vendorId: string;
    billId: string;
    date: string;
    method: 'Credit Card' | 'Bank Transfer' | 'PayPal';
    amount: number;
}


export interface DemoData {
  transactions: Transaction[];
  customers: Customer[];
  vendors: Vendor[];
  budgets: Budget[];
  achievements: Achievement[];
  accounts: Account[];
  invoices: Invoice[];
  salesOrders: SalesOrder[];
  purchaseOrders: PurchaseOrder[];
  bills: Bill[];
  recurringInvoices: RecurringInvoice[];
  recurringExpenses: RecurringExpense[];
  recurringBills: RecurringBill[];
  paymentsMade: PaymentMade[];
  paymentsReceived: PaymentReceived[];
}