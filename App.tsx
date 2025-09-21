import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';

// Public Pages
import LandingPage from './pages/LandingPage';
import SignInPage from './pages/SignInPage';
import SignUpPage from './SignUpPage';
import OtpPage from './pages/OtpPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';

// Dashboard Layout & Pages
import DashboardLayout from './pages/dashboard/DashboardLayout';
import OverviewPage from './pages/dashboard/OverviewPage';
import ChatPage from './pages/dashboard/ChatPage';
import ReportsPage from './pages/dashboard/ReportsPage';
import SettingsPage from './pages/dashboard/SettingsPage';
import BankingPage from './pages/dashboard/BankingPage';
import TaxEstimationPage from './pages/dashboard/TaxEstimationPage';

// Sales Pages
import CustomersPage from './pages/dashboard/sales/CustomersPage';
import CustomerDetailPage from './pages/dashboard/sales/CustomerDetailPage';
import SalesOrdersPage from './pages/dashboard/sales/SalesOrdersPage';
import InvoicesPage from './pages/dashboard/sales/InvoicesPage';
import PrintableInvoice from './pages/dashboard/sales/PrintableInvoice';
import RecurringInvoicesPage from './pages/dashboard/sales/RecurringInvoicesPage';
import PaymentsReceivablePage from './pages/dashboard/sales/PaymentsReceivablePage';

// Purchases Pages
import VendorsPage from './pages/dashboard/purchases/VendorsPage';
import VendorDetailPage from './pages/dashboard/purchases/VendorDetailPage';
import ExpensesPage from './pages/dashboard/purchases/ExpensesPage';
import RecurringExpensesPage from './pages/dashboard/purchases/RecurringExpensesPage';
import PurchaseOrdersPage from './pages/dashboard/purchases/PurchaseOrdersPage';
import BillsPage from './pages/dashboard/purchases/BillsPage';
import RecurringBillsPage from './pages/dashboard/purchases/RecurringBillsPage';
import PaymentsMadePage from './pages/dashboard/purchases/PaymentsMadePage';


const App: React.FC = () => {
  const { isAuthenticated } = useAuth();

  return (
    <HashRouter>
      <Routes>
        <Route path="/*" element={isAuthenticated ? <PrivateRoutes /> : <PublicRoutes />} />
      </Routes>
    </HashRouter>
  );
};

const PublicRoutes = () => (
    <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/signin" element={<SignInPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/otp-verify" element={<OtpPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="*" element={<Navigate to="/" />} />
    </Routes>
)

const PrivateRoutes = () => (
    <Routes>
        <Route path="/invoice/print/:id" element={<PrintableInvoice />} />
        <Route element={<DashboardLayout />}>
            <Route path="/" element={<OverviewPage />} />
            
            {/* Sales Routes */}
            <Route path="/sales/customers" element={<CustomersPage />} />
            <Route path="/sales/customers/:id" element={<CustomerDetailPage />} />
            <Route path="/sales/orders" element={<SalesOrdersPage />} />
            <Route path="/sales/invoices" element={<InvoicesPage />} />
            <Route path="/sales/recurring-invoices" element={<RecurringInvoicesPage />} />
            <Route path="/sales/payments" element={<PaymentsReceivablePage />} />

            {/* Purchases Routes */}
            <Route path="/purchases/vendors" element={<VendorsPage />} />
            <Route path="/purchases/vendors/:id" element={<VendorDetailPage />} />
            <Route path="/purchases/expenses" element={<ExpensesPage />} />
            <Route path="/purchases/recurring-expenses" element={<RecurringExpensesPage />} />
            <Route path="/purchases/orders" element={<PurchaseOrdersPage />} />
            <Route path="/purchases/bills" element={<BillsPage />} />
            <Route path="/purchases/recurring-bills" element={<RecurringBillsPage />} />
            <Route path="/purchases/payments" element={<PaymentsMadePage />} />
            
            {/* Other Main Routes */}
            <Route path="/reports" element={<ReportsPage />} />
            <Route path="/chat" element={<ChatPage />} />
            <Route path="/banking" element={<BankingPage />} />
            <Route path="/tax-estimation" element={<TaxEstimationPage />} />
            <Route path="/settings" element={<SettingsPage />} />

            <Route path="*" element={<Navigate to="/" />} />
        </Route>
    </Routes>
)

export default App;
