import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import Card from '../../shared/Card';
import { DotsHorizontalIcon } from '../../Icons';
import { formatCurrency } from '../../../utils/helpers';
import { useData } from '../../../hooks/useData';

const COLORS = ['#2B2B3E', '#F97316', '#14B8A6', '#6366F1', '#EC4899'];

const ExpensesCard: React.FC = () => {
    const { budgets } = useData();

    // FIX: Map budget data to new objects to satisfy recharts' data prop typing.
    // The `Budget` interface is too strict and lacks the index signature recharts expects.
    const chartData = useMemo(() => budgets.filter(b => b.spent > 0).map(b => ({ ...b })), [budgets]);
    const totalExpenses = useMemo(() => chartData.reduce((sum, item) => sum + item.spent, 0), [chartData]);

    return (
        <Card>
            <div className="flex justify-between items-center mb-2">
                <h2 className="text-lg font-plex font-bold text-gray-800 dark:text-white">Expenses</h2>
                <button className="text-gray-400 hover:text-gray-600">
                    <DotsHorizontalIcon className="w-5 h-5" />
                </button>
            </div>
            <div className="w-full h-40 relative">
                 {totalExpenses > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                             <Tooltip
                                formatter={(value: number) => [formatCurrency(value), 'Spent']}
                                contentStyle={{
                                    backgroundColor: 'rgba(30, 41, 59, 0.9)',
                                    borderColor: '#334155',
                                    borderRadius: '0.5rem',
                                    color: '#f1f5f9',
                                }}
                            />
                            <Pie
                                data={chartData}
                                cx="50%"
                                cy="50%"
                                dataKey="spent"
                                nameKey="category"
                                innerRadius={45}
                                outerRadius={60}
                                paddingAngle={5}
                                cornerRadius={8}
                            >
                                {chartData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                        </PieChart>
                    </ResponsiveContainer>
                 ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                         <p className="text-sm text-gray-500 dark:text-gray-400">No expenses recorded yet.</p>
                    </div>
                 )}
                 <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <p className="text-xs text-gray-500 dark:text-gray-400">Total Spent</p>
                    <p className="text-2xl font-bold text-gray-800 dark:text-white">{formatCurrency(totalExpenses)}</p>
                </div>
            </div>
             <div className="mt-4 flex flex-wrap justify-center gap-x-4 gap-y-1 text-xs">
                {chartData.map((entry, index) => (
                    <div key={`legend-${index}`} className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></span>
                        <span className="text-gray-600 dark:text-gray-400">{entry.category}</span>
                    </div>
                ))}
            </div>
        </Card>
    );
};

export default ExpensesCard;