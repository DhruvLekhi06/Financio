
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../../shared/Card';
import Button from '../../shared/Button';
import Spinner from '../../shared/Spinner';
import { useData } from '../../../hooks/useData';
import { getFinancialInsight } from '../../../services/geminiService';
import { calculateCashFlow } from '../../../utils/helpers';
import { BrainCircuitIcon, ArrowRightIcon } from '../../Icons';
import { motion } from 'framer-motion';

const AIInsightCard: React.FC = () => {
    // FIX: Renamed 'clients' to 'customers' to align with useData hook.
    const { transactions, customers, budgets, isLoading: isDataLoading } = useData();
    const [insight, setInsight] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();

    const generateInsight = useCallback(async () => {
        if (isDataLoading) return;

        setIsLoading(true);
        const cashFlow = calculateCashFlow(transactions);
        const prompt = "Provide a concise, actionable financial insight for today based on my recent activity. Highlight one positive trend or one potential issue I should be aware of. Keep it to 2-3 sentences.";
        
        try {
            // FIX: Passed 'customers' instead of 'clients'
            const result = await getFinancialInsight(prompt, transactions, customers, budgets, cashFlow);
            setInsight(result);
        } catch (error) {
            console.error("Failed to generate AI insight:", error);
            setInsight("There was an error generating your daily insight. Please try again.");
        } finally {
            setIsLoading(false);
        }
    }, [isDataLoading, transactions, customers, budgets]);

    useEffect(() => {
        generateInsight();
    }, [generateInsight]);

    const handleLearnMore = () => {
        if (insight) {
            navigate('/chat', {
                state: {
                    prompt: `Tell me more about this insight: "${insight}"`
                }
            });
        }
    };

    return (
        <Card className="lg:col-span-3 bg-secondary-50 dark:bg-secondary-900/20 border border-secondary-200 dark:border-secondary-800/50">
            <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-secondary-100 dark:bg-secondary-900/50 rounded-lg flex items-center justify-center">
                        <BrainCircuitIcon className="w-6 h-6 text-secondary-600 dark:text-secondary-300"/>
                    </div>
                    <div>
                        <h2 className="text-lg font-plex font-bold text-gray-800 dark:text-white">Today's AI Insight</h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Powered by Gemini</p>
                    </div>
                </div>
                 <Button variant="ghost" onClick={generateInsight} disabled={isLoading}>
                    Refresh
                </Button>
            </div>
            <div className="min-h-[60px] flex items-center">
                {isLoading ? (
                    <div className="flex items-center gap-2">
                        <Spinner className="w-4 h-4 text-secondary-500"/>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Analyzing your data...</p>
                    </div>
                ) : (
                    <motion.p 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-gray-700 dark:text-gray-300"
                    >
                        {insight}
                    </motion.p>
                )}
            </div>
            {!isLoading && insight && (
                <div className="mt-4">
                    <button
                        onClick={handleLearnMore}
                        className="flex items-center gap-1 text-sm font-semibold text-secondary-600 dark:text-secondary-400 hover:underline focus:outline-none focus:ring-2 focus:ring-secondary-500 focus:ring-offset-2 dark:focus:ring-offset-secondary-900/20 rounded-md"
                    >
                        Learn More <ArrowRightIcon className="w-4 h-4" />
                    </button>
                </div>
            )}
        </Card>
    );
};

export default AIInsightCard;
