import React from 'react';
import { motion } from 'framer-motion';
import Card from '../../components/shared/Card';
import Spinner from '../../components/shared/Spinner';
import { useData } from '../../hooks/useData';
import { formatCurrency } from '../../utils/helpers';
import type { Budget } from '../../types';

const BudgetCategory: React.FC<{ item: Budget, index: number }> = ({ item, index }) => {
    const percentage = item.budget > 0 ? Math.round((item.spent / item.budget) * 100) : 0;
    const colorClass = percentage > 95 ? 'bg-red-500' : percentage > 75 ? 'bg-yellow-500' : 'bg-green-500';
    
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            className="space-y-2"
        >
            <div className="flex justify-between items-baseline">
                <p className="font-semibold text-gray-900 dark:text-white">{item.category}</p>
                <p className="text-sm font-mono text-gray-500 dark:text-gray-400">
                    <span className="font-bold text-gray-700 dark:text-gray-200">{formatCurrency(item.spent)}</span> / {formatCurrency(item.budget)}
                </p>
            </div>
            <div className="w-full bg-gray-200 dark:bg-primary-700 rounded-full h-3">
                <motion.div 
                    className={`${colorClass} h-3 rounded-full`} 
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 0.5, ease: 'easeOut', delay: 0.2 + index * 0.1 }}
                />
            </div>
        </motion.div>
    );
};

const BudgetsPage: React.FC = () => {
    const { budgets, isLoading } = useData();

  return (
    <div className="space-y-8">
        <Card>
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-6">Spending vs. Budgets</h2>
           {isLoading ? (
                <div className="flex justify-center items-center h-48"><Spinner /></div>
           ) : budgets.length > 0 ? (
                <div className="space-y-6">
                    {budgets.map((item, index) => (
                        <BudgetCategory key={item.category} item={item} index={index}/>
                    ))}
                </div>
           ): (
                <div className="text-center py-12">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">No budgets yet</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Your budget tracking will appear here.</p>
                </div>
           )}
        </Card>
    </div>
  );
};

export default BudgetsPage;