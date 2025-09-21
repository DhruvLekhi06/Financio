import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Card from '../../components/shared/Card';
import Button from '../../components/shared/Button';
import Spinner from '../../components/shared/Spinner';
import Dropdown, { DropdownOption } from '../../components/shared/Dropdown';
import { getTaxEstimation } from '../../services/geminiService';
import { formatCurrency } from '../../utils/helpers';
import type { TaxEstimation } from '../../types';

const filingStatusOptions: DropdownOption[] = [
    { value: 'Single', label: 'Single' },
    { value: 'Married filing jointly', label: 'Married Filing Jointly' },
];

const TaxEstimationPage: React.FC = () => {
    const [income, setIncome] = useState('120000');
    const [deductions, setDeductions] = useState('13850');
    const [filingStatus, setFilingStatus] = useState('Single');
    const [estimation, setEstimation] = useState<TaxEstimation | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);
        setEstimation(null);

        const incomeNum = parseFloat(income);
        const deductionsNum = parseFloat(deductions);

        if (isNaN(incomeNum) || isNaN(deductionsNum)) {
            setError("Please enter valid numbers for income and deductions.");
            setIsLoading(false);
            return;
        }

        const result = await getTaxEstimation(incomeNum, filingStatus, deductionsNum);
        if (result) {
            setEstimation(result);
        } else {
            setError("Failed to generate tax estimation. Please try again.");
        }
        setIsLoading(false);
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <Card>
                <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-1">AI Tax Estimator</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Estimate your U.S. federal income tax liability. This is for informational purposes only and is not tax advice.</p>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label htmlFor="income" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Estimated Annual Gross Income</label>
                            <div className="mt-1 relative rounded-md shadow-sm">
                                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                    <span className="text-gray-500 sm:text-sm">$</span>
                                </div>
                                <input type="text" name="income" id="income" value={income} onChange={e => setIncome(e.target.value)} className="w-full pl-7 pr-12 bg-primary-50 dark:bg-primary-700 border-gray-300 dark:border-primary-600 rounded-md focus:ring-secondary-500 focus:border-secondary-500" placeholder="0.00" />
                            </div>
                        </div>
                        <div>
                            <label htmlFor="filingStatus" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Filing Status</label>
                            <Dropdown
                                options={filingStatusOptions}
                                value={filingStatus}
                                onChange={setFilingStatus}
                                className="mt-1"
                            />
                        </div>
                    </div>
                    <div>
                        <label htmlFor="deductions" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Total Deductions</label>
                         <div className="mt-1 relative rounded-md shadow-sm">
                            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                <span className="text-gray-500 sm:text-sm">$</span>
                            </div>
                            <input type="text" name="deductions" id="deductions" value={deductions} onChange={e => setDeductions(e.target.value)} className="w-full pl-7 pr-12 bg-primary-50 dark:bg-primary-700 border-gray-300 dark:border-primary-600 rounded-md focus:ring-secondary-500 focus:border-secondary-500" placeholder="0.00" />
                        </div>
                        <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">Enter your standard or itemized deductions. (e.g., $13,850 for single filers in 2023)</p>
                    </div>
                    <div className="text-right pt-2">
                        <Button type="submit" disabled={isLoading}>
                            {isLoading ? <Spinner /> : 'Estimate Tax'}
                        </Button>
                    </div>
                </form>
            </Card>

            <AnimatePresence>
                {isLoading && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="flex justify-center"
                    >
                        <Card className="w-full flex flex-col items-center justify-center p-8">
                            <Spinner className="w-8 h-8 text-secondary-500" />
                            <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">Generating your tax estimation with AI...</p>
                        </Card>
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                    >
                        <Card className="bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800/50">
                            <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
                        </Card>
                    </motion.div>
                )}
            </AnimatePresence>
            
            <AnimatePresence>
                {estimation && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                    >
                        <Card>
                             <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Estimation Results</h2>
                             <div className="bg-primary-50 dark:bg-primary-800/50 rounded-lg p-6 mb-6">
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-600 dark:text-gray-300">Estimated Federal Tax</span>
                                    <span className="text-3xl font-bold font-mono text-secondary-600 dark:text-secondary-400">{formatCurrency(estimation.estimatedTax)}</span>
                                </div>
                                <div className="flex justify-between items-center mt-2">
                                    <span className="text-gray-600 dark:text-gray-300">Effective Tax Rate</span>
                                    <span className="text-lg font-semibold font-mono text-secondary-600 dark:text-secondary-400">{estimation.effectiveRate.toFixed(2)}%</span>
                                </div>
                             </div>

                             <div>
                                 <h3 className="font-semibold text-gray-800 dark:text-white mb-3">Tax Bracket Breakdown</h3>
                                 <div className="space-y-2">
                                     {estimation.breakdown.map((item, index) => (
                                         <div key={index} className="flex justify-between items-center p-3 bg-gray-100 dark:bg-primary-700/50 rounded-md">
                                             <span className="text-sm text-gray-700 dark:text-gray-300">{item.bracket}</span>
                                             <span className="text-sm font-mono font-medium text-gray-800 dark:text-gray-200">{formatCurrency(item.tax)}</span>
                                         </div>
                                     ))}
                                 </div>
                             </div>
                             
                             <div className="mt-6 p-4 bg-gray-50 dark:bg-primary-700/30 rounded-lg border border-gray-200 dark:border-primary-600/50">
                                 <p className="text-xs text-gray-500 dark:text-gray-400 italic">{estimation.notes}</p>
                             </div>
                        </Card>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default TaxEstimationPage;