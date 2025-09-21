import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import Card from '../../components/shared/Card';
import Spinner from '../../components/shared/Spinner';
import { useData } from '../../hooks/useData';
import { calculateCashFlow } from '../../utils/helpers';
import { getAIForecast } from '../../services/geminiService';
import type { CashFlow } from '../../types';
import { useTheme } from '../../hooks/useTheme';

const ForecastPage: React.FC = () => {
  const [revenueGrowth, setRevenueGrowth] = useState(5); // %
  const [expenseChange, setExpenseChange] = useState(2); // %
  const [forecastData, setForecastData] = useState<CashFlow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const debounceTimeout = useRef<number | null>(null);
  const { theme } = useTheme();
  
  const { transactions, isLoading: isDataLoading } = useData();
  const historicalData = useMemo(() => calculateCashFlow(transactions), [transactions]);
  
  const fetchForecast = useCallback(async (growth: number, expenses: number) => {
    setIsLoading(true);
    const aiProjectedData = await getAIForecast(historicalData, growth, expenses);
    if (aiProjectedData) {
      setForecastData([...historicalData, ...aiProjectedData]);
    } else {
      console.warn("AI forecast failed. Displaying only historical data.");
      setForecastData([...historicalData]);
    }
    setIsLoading(false);
  }, [historicalData]);

  useEffect(() => {
    if (!isDataLoading) {
        fetchForecast(revenueGrowth, expenseChange);
    }
  }, [fetchForecast, isDataLoading]);
  
  useEffect(() => {
    if (isDataLoading) return;
      
    if (debounceTimeout.current) {
        clearTimeout(debounceTimeout.current);
    }
    debounceTimeout.current = window.setTimeout(() => {
        fetchForecast(revenueGrowth, expenseChange);
    }, 500);

    return () => {
        if(debounceTimeout.current) {
            clearTimeout(debounceTimeout.current);
        }
    }
  }, [revenueGrowth, expenseChange, fetchForecast, isDataLoading]);


  return (
    <div className="space-y-8">
      <Card>
        <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Interactive AI Cash Flow Forecast</h2>
        <div className="relative" style={{ width: '100%', height: 400 }}>
          {(isLoading || isDataLoading) && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/50 dark:bg-primary-800/50 z-10 rounded-xl">
              <div className="flex flex-col items-center gap-2">
                 <Spinner className="w-8 h-8 text-secondary-500" />
                 <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                    {isDataLoading ? 'Loading data...' : 'Generating AI Forecast...'}
                 </span>
              </div>
            </div>
          )}
          {historicalData.length > 0 ? (
          <ResponsiveContainer>
            <LineChart data={forecastData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2}/>
              <XAxis dataKey="month" stroke="currentColor"/>
              <YAxis stroke="currentColor" tickFormatter={(value) => `$${Number(value) / 1000}k`} />
              <Tooltip
                  contentStyle={{
                    backgroundColor: theme === 'dark' ? '#1e293b' : '#ffffff',
                    borderColor: theme === 'dark' ? '#334155' : '#e2e8f0',
                    borderRadius: '0.5rem',
                  }}
              />
              <Legend />
              <Line type="monotone" dataKey="inflow" name="Inflow" stroke="#0d9488" strokeWidth={2} dot={{r: 3}} />
              <Line type="monotone" dataKey="outflow" name="Outflow" stroke="#e11d48" strokeWidth={2} dot={{r: 3}} />
              <Line type="monotone" dataKey="net" name="Net Flow" stroke="#f59e0b" strokeWidth={2} strokeDasharray="5 5" dot={{r: 3}}/>
            </LineChart>
          </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-center">
                 <p className="text-sm text-gray-500 dark:text-gray-400">Add transactions to generate a forecast.</p>
            </div>
          )}
        </div>
      </Card>
      
      <Card>
        <h3 className="text-md font-semibold text-gray-800 dark:text-white mb-4">Forecast Assumptions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
                <label className="flex justify-between font-medium text-sm mb-2">
                    <span>Monthly Revenue Growth</span>
                    <span className="font-bold text-secondary-600 dark:text-secondary-400">{revenueGrowth}%</span>
                </label>
                <input
                    type="range"
                    min="-10"
                    max="20"
                    step="1"
                    value={revenueGrowth}
                    onChange={(e) => setRevenueGrowth(Number(e.target.value))}
                    disabled={isLoading || isDataLoading}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
                />
            </div>
            <div>
                 <label className="flex justify-between font-medium text-sm mb-2">
                    <span>Monthly Expense Change</span>
                    <span className="font-bold text-secondary-600 dark:text-secondary-400">{expenseChange}%</span>
                </label>
                <input
                    type="range"
                    min="-10"
                    max="10"
                    step="1"
                    value={expenseChange}
                    onChange={(e) => setExpenseChange(Number(e.target.value))}
                    disabled={isLoading || isDataLoading}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
                />
            </div>
        </div>
      </Card>
    </div>
  );
};

export default ForecastPage;