import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import type { ReactNode } from 'react';
import { Transaction, Customer, Vendor, Budget, Achievement, DemoData, Account, Invoice, SalesOrder, PurchaseOrder, Bill, RecurringInvoice, RecurringExpense, RecurringBill, PaymentReceived, PaymentMade, LineItem } from '../types';

type DataKey = keyof DemoData;

interface DataContextType extends Omit<DemoData, 'clients'> {
  customers: Customer[];
  // Generic CRUD
  addItem: <T extends { id: string }>(key: DataKey, item: Omit<T, 'id'>) => void;
  updateItem: <T extends { id: string }>(key: DataKey, itemId: string, updatedData: Partial<T>) => void;
  deleteItem: (key: DataKey, itemId: string) => void;
  deleteAccountAndTransactions: (accountId: string) => void;
  
  // Specific Actions
  addBudgetCategory: (newCategory: Omit<Budget, 'spent'>) => void;
  deleteBudgetCategory: (categoryName: string) => void;
  importData: (key: DataKey, data: any[]) => void;
  recordPayment: (invoiceId: string, paymentDetails: Omit<PaymentReceived, 'id' | 'invoiceId' | 'customerId' | 'customerName' | 'paymentId'>) => void;
  convertSalesOrderToInvoice: (salesOrderId: string) => void;
  recordBillPayment: (billId: string, paymentDetails: Omit<PaymentMade, 'id' | 'billId' | 'vendorId' | 'paymentId'>) => void;
  convertPurchaseOrderToBill: (purchaseOrderId: string) => void;


  isLoading: boolean;
  resetData: () => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

const createInitialState = (): DemoData => ({
    transactions: [],
    customers: [],
    vendors: [],
    budgets: [
        { category: 'Software', budget: 500, spent: 0 },
        { category: 'Marketing', budget: 1000, spent: 0 },
        { category: 'Freelancers', budget: 2000, spent: 0 },
        { category: 'Uncategorized', budget: 0, spent: 0 },
    ],
    achievements: [
        { id: 'a1', title: 'First Earning', description: 'Receive your first payment.', unlocked: false },
        { id: 'a2', title: 'Profitability Pro', description: 'Achieve a net positive month.', unlocked: false },
        { id: 'a3', title: '$10k Revenue', description: 'Reach $10,000 in total revenue.', unlocked: false },
        { id: 'a4', title: 'Budget Master', description: 'Stay under budget for all categories in a month.', unlocked: false },
        { id: 'a5', title: 'Customer Magnet', description: 'Onboard 5 customers.', unlocked: false },
        { id: 'a6', title: 'Runway Rockstar', description: 'Maintain a runway of over 90 days.', unlocked: false },
    ],
    accounts: [],
    invoices: [],
    salesOrders: [],
    purchaseOrders: [],
    bills: [],
    recurringInvoices: [],
    recurringExpenses: [],
    recurringBills: [],
    paymentsMade: [],
    paymentsReceived: [],
});

export const DataProvider = ({ children }: { children: ReactNode }) => {
  const [data, setData] = useState<DemoData>(createInitialState());
  const [isLoading, setIsLoading] = useState(true);
  
  const saveData = useCallback((updatedData: DemoData) => {
     try {
       const finalData = { ...updatedData };
       // @ts-ignore
       delete finalData.clients; // Ensure old key is gone
       localStorage.setItem('financioAiData', JSON.stringify(finalData));
     } catch (error) {
       console.error("Failed to save data to localStorage", error);
     }
  }, []);

  const updateAndSave = useCallback((newData: DemoData) => {
    saveData(newData);
    setData(newData);
  }, [saveData]);

  const addItem = useCallback(<T extends { id: string }>(key: DataKey, item: Omit<T, 'id'>) => {
    setData(prevData => {
      const newItem = { ...item, id: `${key.slice(0, 3)}-${Date.now()}` } as T;
      const currentItems = prevData[key] as unknown as T[];
      const updatedItems = [...currentItems, newItem];
      const newData = { ...prevData, [key]: updatedItems };
      saveData(newData);
      return newData;
    });
  }, [saveData]);

  const updateItem = useCallback(<T extends { id: string }>(key: DataKey, itemId: string, updatedData: Partial<T>) => {
    setData(prevData => {
        const currentItems = prevData[key] as unknown as T[];
        const updatedItems = currentItems.map(item => item.id === itemId ? { ...item, ...updatedData } : item);
        const newData = { ...prevData, [key]: updatedItems };
        saveData(newData);
        return newData;
    });
  }, [saveData]);

  const deleteItem = useCallback((key: DataKey, itemId: string) => {
      setData(prevData => {
          const currentItems = prevData[key] as unknown as {id: string}[];
          const updatedItems = currentItems.filter(item => item.id !== itemId);
          const newData = { ...prevData, [key]: updatedItems };
          saveData(newData);
          return newData;
      });
  }, [saveData]);
  
  const deleteAccountAndTransactions = useCallback((accountId: string) => {
    setData(prevData => {
        const updatedAccounts = prevData.accounts.filter(acc => acc.id !== accountId);
        const updatedTransactions = prevData.transactions.filter(t => t.accountId !== accountId);
        const updatedRecurringExpenses = prevData.recurringExpenses.filter(re => re.accountId !== accountId);

        const newData = {
            ...prevData,
            accounts: updatedAccounts,
            transactions: updatedTransactions,
            recurringExpenses: updatedRecurringExpenses,
        };
        saveData(newData);
        return newData;
    });
  }, [saveData]);

  const addBudgetCategory = useCallback((newCategory: Omit<Budget, 'spent'>) => {
    setData(prevData => {
        const newBudgets = [...prevData.budgets, { ...newCategory, spent: 0 }];
        const newData = { ...prevData, budgets: newBudgets };
        saveData(newData);
        return newData;
    });
  }, [saveData]);
  
  const deleteBudgetCategory = useCallback((categoryName: string) => {
      setData(prevData => {
          const newBudgets = prevData.budgets.filter(b => b.category !== categoryName);
          const newTransactions = prevData.transactions.map(t => t.category === categoryName ? {...t, category: 'Uncategorized' as any} : t)
          const newData = { ...prevData, budgets: newBudgets, transactions: newTransactions };
          saveData(newData);
          return newData;
      });
  }, [saveData]);

  const resetData = useCallback(() => {
    const freshState = createInitialState();
    updateAndSave(freshState);
  }, [updateAndSave]);

  const importData = useCallback((key: DataKey, importedItems: any[]) => {
      setData(prevData => {
          const newItems = importedItems.map((item, index) => ({
              ...item,
              id: `${key.slice(0, 3)}-${Date.now()}-${index}`,
          }));
          const currentItems = prevData[key] as unknown as any[];
          const updatedItems = [...currentItems, ...newItems];
          const newData = { ...prevData, [key]: updatedItems };
          saveData(newData);
          return newData;
      });
  }, [saveData]);

  const recordPayment = useCallback((invoiceId: string, paymentDetails: Omit<PaymentReceived, 'id' | 'invoiceId' | 'customerId' | 'customerName' | 'paymentId'>) => {
      setData(prevData => {
          const invoice = prevData.invoices.find(inv => inv.id === invoiceId);
          if (!invoice) return prevData;
          
          const customer = prevData.customers.find(c => c.id === invoice.customerId);

          const newPayment: PaymentReceived = {
              ...paymentDetails,
              id: `pay-${Date.now()}`,
              paymentId: `#PAY-${prevData.paymentsReceived.length + 100}`,
              invoiceId: invoice.id,
              customerId: invoice.customerId,
              customerName: customer?.name || 'Unknown',
          };

          const updatedInvoices = prevData.invoices.map(inv =>
              inv.id === invoiceId ? { ...inv, status: 'Paid' as const } : inv
          );
          
          const newData = {
              ...prevData,
              invoices: updatedInvoices,
              paymentsReceived: [...prevData.paymentsReceived, newPayment]
          };
          saveData(newData);
          return newData;
      });
  }, [saveData]);

  const convertSalesOrderToInvoice = useCallback((salesOrderId: string) => {
      setData(prevData => {
          const salesOrder = prevData.salesOrders.find(so => so.id === salesOrderId);
          if (!salesOrder || salesOrder.status === 'Invoiced') return prevData;

          const newInvoice: Invoice = {
              id: `inv-${Date.now()}`,
              invoiceId: `#INV-${prevData.invoices.length + 1001}`,
              customerId: salesOrder.customerId,
              salesOrderId: salesOrder.id,
              lineItems: salesOrder.lineItems,
              subTotal: salesOrder.subTotal,
              tax: salesOrder.tax,
              total: salesOrder.total,
              status: 'Draft',
              date: new Date().toISOString().split('T')[0],
              dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days from now
              paymentTerms: 'Net 30',
              notes: salesOrder.notes,
          };
          
          const updatedSalesOrders = prevData.salesOrders.map(so => 
              so.id === salesOrderId ? { ...so, status: 'Invoiced' as const } : so
          );
          
          const finalData = { 
              ...prevData, 
              salesOrders: updatedSalesOrders,
              invoices: [...prevData.invoices, newInvoice],
          };
          saveData(finalData);
          return finalData;
      });
  }, [saveData]);
  
  const recordBillPayment = useCallback((billId: string, paymentDetails: Omit<PaymentMade, 'id' | 'billId' | 'vendorId' | 'paymentId'>) => {
    setData(prevData => {
        const bill = prevData.bills.find(b => b.id === billId);
        if (!bill) return prevData;

        const newPayment: PaymentMade = {
            ...paymentDetails,
            id: `pmt-${Date.now()}`,
            paymentId: `#PMT-${prevData.paymentsMade.length + 100}`,
            billId: bill.id,
            vendorId: bill.vendorId,
        };

        const updatedBills = prevData.bills.map(b =>
            b.id === billId ? { ...b, status: 'Paid' as const } : b
        );
        
        const newData = {
            ...prevData,
            bills: updatedBills,
            paymentsMade: [...prevData.paymentsMade, newPayment]
        };
        saveData(newData);
        return newData;
    });
  }, [saveData]);

  const convertPurchaseOrderToBill = useCallback((purchaseOrderId: string) => {
    setData(prevData => {
        const po = prevData.purchaseOrders.find(p => p.id === purchaseOrderId);
        if (!po || po.status === 'Billed') return prevData;

        const newBill: Bill = {
            id: `bill-${Date.now()}`,
            billId: `#BILL-${prevData.bills.length + 1001}`,
            vendorId: po.vendorId,
            purchaseOrderId: po.id,
            lineItems: po.lineItems,
            subTotal: po.subTotal,
            tax: po.tax,
            total: po.total,
            status: 'Draft',
            date: new Date().toISOString().split('T')[0],
            dueDate: po.deliveryDate,
            notes: `From PO ${po.orderId}`,
        };
        
        const updatedPOs = prevData.purchaseOrders.map(p => 
            p.id === purchaseOrderId ? { ...p, status: 'Billed' as const } : p
        );
        
        const finalData = { 
            ...prevData, 
            purchaseOrders: updatedPOs,
            bills: [...prevData.bills, newBill],
        };
        saveData(finalData);
        return finalData;
    });
  }, [saveData]);

  useEffect(() => {
    try {
      const storedData = localStorage.getItem('financioAiData');
      if (storedData) {
        const initialState = createInitialState();
        const parsedData: Partial<DemoData> = JSON.parse(storedData);
        // Migration: handle old 'clients' key
        // @ts-ignore
        if (parsedData.clients && !parsedData.customers) {
          // @ts-ignore
          parsedData.customers = parsedData.clients;
          // @ts-ignore
          delete parsedData.clients;
        }
        const mergedData = { ...initialState, ...parsedData };
        setData(mergedData);
      } else {
        setData(createInitialState());
      }
    } catch (error) {
      console.error("Failed to load data from localStorage", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Effect for background processes like updating statuses
  useEffect(() => {
    if (isLoading) return;
    const today = new Date();
    today.setHours(0,0,0,0);

    let needsUpdate = false;
    const updatedData = { ...data };

    // 1. Check for overdue invoices & bills
    updatedData.invoices = updatedData.invoices.map(invoice => {
        if (invoice.status === 'Sent' && new Date(invoice.dueDate) < today) {
            needsUpdate = true;
            return { ...invoice, status: 'Overdue' };
        }
        return invoice;
    });
    updatedData.bills = updatedData.bills.map(bill => {
        if (bill.status === 'Unpaid' && new Date(bill.dueDate) < today) {
            needsUpdate = true;
            return { ...bill, status: 'Overdue' };
        }
        return bill;
    });

    const calculateNextDate = (current: string, frequency: 'Weekly' | 'Monthly' | 'Yearly') => {
        const next = new Date(current);
        if (frequency === 'Monthly') next.setMonth(next.getMonth() + 1);
        else if (frequency === 'Weekly') next.setDate(next.getDate() + 7);
        else if (frequency === 'Yearly') next.setFullYear(next.getFullYear() + 1);
        return next.toISOString().split('T')[0];
    };

    // 2. Check for recurring items to generate
    const newInvoices: Invoice[] = [];
    updatedData.recurringInvoices = updatedData.recurringInvoices.map(ri => {
        if (ri.status === 'Active' && new Date(ri.nextDate) <= today) {
            needsUpdate = true;
            const subTotal = ri.lineItems.reduce((sum, item) => sum + item.total, 0);
            const tax = ri.total - subTotal;
            newInvoices.push({
                id: `inv-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                invoiceId: `#INV-${data.invoices.length + newInvoices.length + 1001}`,
                customerId: ri.customerId,
                lineItems: ri.lineItems,
                subTotal,
                tax,
                total: ri.total,
                status: 'Draft',
                date: ri.nextDate,
                dueDate: new Date(new Date(ri.nextDate).getTime() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                paymentTerms: 'Net 30',
                notes: `Generated from recurring profile.`
            });
            return { ...ri, nextDate: calculateNextDate(ri.nextDate, ri.frequency) };
        }
        return ri;
    });
    if (newInvoices.length > 0) updatedData.invoices.push(...newInvoices);

    const newBills: Bill[] = [];
    updatedData.recurringBills = updatedData.recurringBills.map(rb => {
        if (rb.status === 'Active' && new Date(rb.nextDate) <= today) {
            needsUpdate = true;
            const subTotal = rb.lineItems.reduce((sum, item) => sum + item.total, 0);
            const tax = rb.total - subTotal;
            newBills.push({
                id: `bill-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                billId: `#BILL-${data.bills.length + newBills.length + 1001}`,
                vendorId: rb.vendorId,
                lineItems: rb.lineItems,
                subTotal,
                tax,
                total: rb.total,
                status: 'Unpaid',
                date: rb.nextDate,
                dueDate: new Date(new Date(rb.nextDate).getTime() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                notes: 'Generated from recurring profile.'
            });
            return { ...rb, nextDate: calculateNextDate(rb.nextDate, rb.frequency) };
        }
        return rb;
    });
    if (newBills.length > 0) updatedData.bills.push(...newBills);
    
    const newTransactions: Transaction[] = [];
    updatedData.recurringExpenses = updatedData.recurringExpenses.map(re => {
        if (re.status === 'Active' && new Date(re.nextDate) <= today) {
            needsUpdate = true;
            newTransactions.push({
                id: `txn-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                accountId: re.accountId, 
                date: re.nextDate,
                description: re.description, 
                amount: re.amount, 
                type: 'outflow', 
                category: re.category
            });
            return { ...re, nextDate: calculateNextDate(re.nextDate, re.frequency) };
        }
        return re;
    });
    if (newTransactions.length > 0) updatedData.transactions.push(...newTransactions);


    if (needsUpdate) {
        updateAndSave(updatedData);
    }
  }, [isLoading, data, updateAndSave]); // Rerun when data changes to catch updates

  const value = useMemo(() => ({
    ...data,
    customers: data.customers,
    isLoading,
    addItem,
    updateItem,
    deleteItem,
    deleteAccountAndTransactions,
    addBudgetCategory,
    deleteBudgetCategory,
    importData,
    recordPayment,
    convertSalesOrderToInvoice,
    recordBillPayment,
    convertPurchaseOrderToBill,
    resetData,
  }), [data, isLoading, addItem, updateItem, deleteItem, deleteAccountAndTransactions, addBudgetCategory, deleteBudgetCategory, importData, recordPayment, convertSalesOrderToInvoice, recordBillPayment, convertPurchaseOrderToBill, resetData]);

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = (): DataContextType => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};