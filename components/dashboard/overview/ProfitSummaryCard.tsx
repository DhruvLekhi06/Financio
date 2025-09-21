import React from 'react';
import Card from '../../shared/Card';
import { EditIcon } from '../../Icons';
import { formatCurrency } from '../../../utils/helpers';
import { LineChart, Line, ResponsiveContainer } from 'recharts';

const incomeData = [
  { name: 'Page A', uv: 4000, pv: 2400, amt: 2400 },
  { name: 'Page B', uv: 3000, pv: 1398, amt: 2210 },
  { name: 'Page C', uv: 2000, pv: 9800, amt: 2290 },
  { name: 'Page D', uv: 2780, pv: 3908, amt: 2000 },
  { name: 'Page E', uv: 1890, pv: 4800, amt: 2181 },
];
const outcomeData = [
  { name: 'Page A', uv: 2000, pv: 2400, amt: 2400 },
  { name: 'Page B', uv: 4000, pv: 1398, amt: 2210 },
  { name: 'Page C', uv: 1500, pv: 9800, amt: 2290 },
  { name: 'Page D', uv: 3780, pv: 3908, amt: 2000 },
  { name: 'Page E', uv: 2890, pv: 4800, amt: 2181 },
];


const ProfitSummaryCard: React.FC = () => {
    return (
        <Card className="flex flex-col h-full">
            <div className="bg-dark-purple p-4 rounded-xl text-white flex-grow">
                 <div className="flex justify-between items-center text-sm mb-4">
                     <div className="flex gap-2">
                        <span className="font-bold">02</span>
                        <span>june</span>
                     </div>
                     <div className="flex gap-4">
                        <span>M</span>
                        <span className="font-bold p-1 bg-white/20 rounded-sm leading-none">W</span>
                        <span>T</span>
                        <span>F</span>
                        <span>S</span>
                        <span>S</span>
                     </div>
                 </div>
                 <div className="w-full h-24">
                    {/* Placeholder for the complex chart */}
                 </div>
            </div>
            <div className="pt-4">
                 <div className="flex justify-between items-center mb-4">
                    <div>
                        <p className="text-sm text-gray-500">Taxable Profit</p>
                        <p className="text-2xl font-bold">{formatCurrency(12625)}</p>
                    </div>
                    <button className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 dark:bg-primary-700 hover:bg-gray-200">
                        <EditIcon className="w-4 h-4"/>
                    </button>
                 </div>
                <div className="space-y-2">
                    <div className="flex justify-between items-center p-3 rounded-lg border border-gray-100 dark:border-primary-700">
                        <span className="text-sm">Total Income</span>
                        <div className="w-20 h-5">
                             <ResponsiveContainer>
                                <LineChart data={incomeData}>
                                <Line type="monotone" dataKey="uv" stroke="#F97316" strokeWidth={2} dot={false} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                        <span className="text-sm font-semibold font-mono">{formatCurrency(23316)}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 rounded-lg border border-gray-100 dark:border-primary-700">
                        <span className="text-sm">Total Outcome</span>
                         <div className="w-20 h-5">
                            <ResponsiveContainer>
                                <LineChart data={outcomeData}>
                                <Line type="monotone" dataKey="uv" stroke="#14B8A6" strokeWidth={2} dot={false} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                        <span className="text-sm font-semibold font-mono">{formatCurrency(12100)}</span>
                    </div>
                </div>
            </div>
        </Card>
    );
};

export default ProfitSummaryCard;
