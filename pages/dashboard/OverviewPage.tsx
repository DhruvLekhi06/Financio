

import React, { useMemo } from 'react';
import Spinner from '../../components/shared/Spinner';
import { useData } from '../../hooks/useData';
import { Link } from 'react-router-dom';

import AIInsightCard from '../../components/dashboard/overview/AIInsightCard';
import StatCard from '../../components/dashboard/overview/StatCard';
import CashFlowCard from '../../components/dashboard/overview/CashFlowCard';
import BankAccountsCard from '../../components/dashboard/overview/BankAccountsCard';
import ExpensesCard from '../../components/dashboard/overview/ExpensesCard';
import InvoicesCard from '../../components/dashboard/overview/InvoicesCard';
import { DotsHorizontalIcon, TrendingUpIcon, TrendingDownIcon, DollarSignIcon } from '../../components/Icons';
import { formatCurrency } from '../../utils/helpers';

const OverviewPage: React.FC = () => {
  const { isLoading, invoices, bills, budgets, transactions } = useData();

  const { netProfit, revenueGrowth } = useMemo(() => {
      if (isLoading) return { netProfit: 0, revenueGrowth: 0 };

      const today = new Date();
      const last30Days = new Date(today);
      last30Days.setDate(today.getDate() - 30);

      const recentTransactions = transactions.filter(t => new Date(t.date) >= last30Days);
      const netProfit = recentTransactions.reduce((acc, t) => {
          return t.type === 'inflow' ? acc + t.amount : acc - t.amount;
      }, 0);

      const currentMonth = today.getMonth();
      const currentYear = today.getFullYear();
      const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
      const prevMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;

      const currentMonthRevenue = transactions.filter(t => {
          const tDate = new Date(t.date);
          return t.type === 'inflow' && tDate.getMonth() === currentMonth && tDate.getFullYear() === currentYear;
      }).reduce((sum, t) => sum + t.amount, 0);

      const prevMonthRevenue = transactions.filter(t => {
          const tDate = new Date(t.date);
          return t.type === 'inflow' && tDate.getMonth() === prevMonth && tDate.getFullYear() === prevMonthYear;
      }).reduce((sum, t) => sum + t.amount, 0);
      
      const revenueGrowth = prevMonthRevenue > 0 ? ((currentMonthRevenue - prevMonthRevenue) / prevMonthRevenue) * 100 : currentMonthRevenue > 0 ? 100 : 0;

      return { netProfit, revenueGrowth };
  }, [transactions, isLoading]);


  if (isLoading) {
    return <div className="flex justify-center items-center h-64"><Spinner className="w-8 h-8" /></div>;
  }

  const outstandingInvoices = invoices.filter(i => i.status === 'Sent' || i.status === 'Overdue').reduce((acc, i) => acc + i.total, 0);
  // FIX: Changed b.amount to b.total as 'amount' does not exist on the Bill type.
  const outstandingBills = bills.filter(b => b.status === 'Unpaid' || b.status === 'Overdue').reduce((acc, b) => acc + b.total, 0);
  const totalBudget = budgets.reduce((acc, b) => acc + b.budget, 0);
  const totalSpent = budgets.reduce((acc, b) => acc + b.spent, 0);
  const budgetUtilization = totalBudget > 0 ? ((totalSpent / totalBudget) * 100).toFixed(0) : 0;
  
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* AI Insight Card */}
      <AIInsightCard />

      {/* Row 1 */}
      <div className="lg:col-span-2">
        <CashFlowCard />
      </div>
      <div className="lg:col-span-1 space-y-6">
        <BankAccountsCard />
        <ExpensesCard />
      </div>
      
      {/* Row 2 */}
      <Link to="/purchases/expenses">
        <StatCard title="Budget Utilization" value={`${budgetUtilization}%`} icon={<DotsHorizontalIcon />} />
      </Link>
      <Link to="/sales/invoices">
        <StatCard title="Outstanding Invoices" value={formatCurrency(outstandingInvoices)} icon={<DotsHorizontalIcon />} />
      </Link>
      <Link to="/purchases/bills">
        <StatCard title="Outstanding Bills" value={formatCurrency(outstandingBills)} icon={<DotsHorizontalIcon />} />
      </Link>

      {/* Row 3 */}
      <div className="lg:col-span-2">
        <InvoicesCard />
      </div>
       <div className="lg:col-span-1 space-y-6">
            <StatCard title="Net Profit (Last 30d)" value={formatCurrency(netProfit)} icon={<DollarSignIcon />} />
            <StatCard 
                title="Revenue Growth (MoM)" 
                value={`${revenueGrowth.toFixed(1)}%`} 
                icon={revenueGrowth >= 0 ? <TrendingUpIcon className="text-green-500" /> : <TrendingDownIcon className="text-red-500" />} 
            />
        </div>
    </div>
  );
};

export default OverviewPage;
