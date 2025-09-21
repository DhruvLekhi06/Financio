import React, { useMemo, useState } from 'react';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import Card from '../../shared/Card';
import { useData } from '../../../hooks/useData';
import { formatCurrency } from '../../../utils/helpers';
import Dropdown, { DropdownOption } from '../../shared/Dropdown';

const timePeriodOptions: DropdownOption[] = [
    { value: '7d', label: 'Last 7 Days' },
    { value: '1m', label: 'Last 30 Days' },
    { value: '3m', label: 'Last 3 Months' },
    { value: '6m', label: 'Last 6 Months' },
    { value: '12m', label: 'Last 12 Months' },
];

const CashFlowCard: React.FC = () => {
  const { transactions } = useData();
  const [period, setPeriod] = useState('7d');

  const { chartData, totalIncome } = useMemo(() => {
    const now = new Date();
    const dataMap = new Map<string, number>();
    let startDate = new Date();
    const endDate = new Date(now);

    // Set start date based on period
    switch (period) {
        case '7d':
            startDate.setDate(now.getDate() - 6);
            break;
        case '1m':
            startDate.setDate(now.getDate() - 29);
            break;
        case '3m':
            startDate = new Date(now.getFullYear(), now.getMonth() - 2, 1);
            break;
        case '6m':
            startDate = new Date(now.getFullYear(), now.getMonth() - 5, 1);
            break;
        case '12m':
            startDate = new Date(now.getFullYear() - 1, now.getMonth() + 1, 1);
            break;
    }

    const relevantTransactions = transactions.filter(t => {
        const tDate = new Date(t.date);
        // Adjust for timezone offset to prevent date shifting
        const tzOffset = tDate.getTimezoneOffset() * 60000;
        const adjustedTDate = new Date(tDate.getTime() - tzOffset);
        return t.type === 'inflow' && adjustedTDate >= startDate && adjustedTDate <= endDate;
    });

    const totalIncome = relevantTransactions.reduce((sum, t) => sum + t.amount, 0);

    let finalChartData: { name: string, income: number }[] = [];

    if (period === '7d' || period === '1m') {
        // Daily aggregation
        for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
            const key = d.toISOString().split('T')[0];
            dataMap.set(key, 0);
        }
        relevantTransactions.forEach(t => {
            const tDate = new Date(t.date);
            const tzOffset = tDate.getTimezoneOffset() * 60000;
            const key = new Date(tDate.getTime() - tzOffset).toISOString().split('T')[0];
            if (dataMap.has(key)) {
                dataMap.set(key, dataMap.get(key)! + t.amount);
            }
        });
        finalChartData = Array.from(dataMap.entries()).map(([date, income]) => ({
            name: period === '7d' ? new Date(date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short' }) : new Date(date + 'T00:00:00').getDate().toString(),
            income
        }));
    } else {
        // Monthly aggregation
        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        let dateIter = new Date(startDate);
        while(dateIter <= endDate) {
            const key = `${monthNames[dateIter.getMonth()]} '${String(dateIter.getFullYear()).slice(2)}`;
            dataMap.set(key, 0);
            dateIter.setMonth(dateIter.getMonth() + 1);
        }

        relevantTransactions.forEach(t => {
            const tDate = new Date(t.date);
            const key = `${monthNames[tDate.getMonth()]} '${String(tDate.getFullYear()).slice(2)}`;
            if (dataMap.has(key)) {
                dataMap.set(key, dataMap.get(key)! + t.amount);
            }
        });
        finalChartData = Array.from(dataMap.entries()).map(([name, income]) => ({ name, income }));
    }
    
    return { chartData: finalChartData, totalIncome };
  }, [transactions, period]);

  return (
    <Card className="bg-dark-purple text-white">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-plex font-bold">Cash Flow</h2>
        <div className="w-40">
            <Dropdown 
                options={timePeriodOptions} 
                value={period} 
                onChange={setPeriod} 
                buttonClassName="!bg-white/10 !border-white/20 hover:!bg-white/20 !text-white"
            />
        </div>
      </div>
      <div className="mb-4">
          <p className="text-sm text-gray-400">Income</p>
          <p className="text-3xl font-bold">{formatCurrency(totalIncome)}</p>
      </div>
      <div style={{ width: '100%', height: 150 }}>
        <ResponsiveContainer>
          <BarChart data={chartData} margin={{ top: 20, right: 0, left: 0, bottom: 0 }}>
            <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fill: '#A1A1AA', fontSize: 12 }} />
            <Tooltip
              cursor={{ fill: 'rgba(255, 255, 255, 0.1)' }}
              contentStyle={{
                backgroundColor: '#1E293B',
                borderColor: '#334155',
                color: '#FFFFFF',
                borderRadius: '0.5rem'
              }}
              formatter={(value: number) => [formatCurrency(value), 'Income']}
            />
            <Bar dataKey="income" radius={[4, 4, 0, 0]}>
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={'rgba(255, 255, 255, 0.3)'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};

export default CashFlowCard;