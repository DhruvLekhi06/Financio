

import React from 'react';
import Card from '../../components/shared/Card';
import Button from '../../components/shared/Button';
import { DownloadIcon } from '../../components/Icons';
// FIX: Import `calculateCashFlow` and remove import for `demoData` which is an empty file.
import { exportToCsv, calculateCashFlow } from '../../utils/helpers';
import { useData } from '../../hooks/useData';

const ReportsPage: React.FC = () => {
  // FIX: Use data from the useData hook instead of static demoData.
  const { transactions } = useData();
  const cashFlow = calculateCashFlow(transactions);

  const handleExportTransactions = () => {
    exportToCsv('transactions_summary.csv', transactions);
  };
  
  const handleExportCashFlow = () => {
    exportToCsv('cash_flow_summary.csv', cashFlow);
  };

  const handleExportProfitLoss = () => {
    const profitAndLoss = cashFlow.map(cf => ({
        Month: cf.month,
        Inflow: cf.inflow,
        Outflow: cf.outflow,
        'Net Profit': cf.net
    }));
    exportToCsv('profit_and_loss.csv', profitAndLoss);
  };

  return (
    <div className="max-w-4xl mx-auto">
    <Card>
      <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-6">Export Financial Reports</h2>
      <p className="text-gray-600 dark:text-gray-400 mb-8">Download your financial data in CSV format for your accounting needs. Your accountant will thank you.</p>

      <div className="space-y-4">
        <ReportItem
          title="Profit & Loss Summary"
          description="A monthly breakdown of your revenue, expenses, and net profit."
          onExport={handleExportProfitLoss}
        />
        <ReportItem
          title="All Transactions"
          description="A detailed list of every transaction recorded in your account."
          onExport={handleExportTransactions}
        />
        <ReportItem
          title="Cash Flow Data"
          description="The underlying data for your cash flow charts."
          onExport={handleExportCashFlow}
        />
      </div>
    </Card>
    </div>
  );
};

interface ReportItemProps {
    title: string;
    description: string;
    onExport: () => void;
}

const ReportItem: React.FC<ReportItemProps> = ({ title, description, onExport }) => (
    <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg flex items-center justify-between">
        <div>
            <h3 className="font-semibold text-gray-900 dark:text-white">{title}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">{description}</p>
        </div>
        <Button onClick={onExport} variant="secondary">
            <DownloadIcon className="w-4 h-4 mr-2"/>
            Download
        </Button>
    </div>
)

export default ReportsPage;
