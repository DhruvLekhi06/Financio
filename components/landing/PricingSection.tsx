import React from 'react';
import { motion } from 'framer-motion';
import Button from '../shared/Button';
import { useNavigate } from 'react-router-dom';
import { CheckIcon } from '../Icons';

const features = [
    "Unlimited Invoices & Bills",
    "AI Financial Assistant",
    "Cash Flow Forecasting",
    "Bank Account Sync",
    "Expense & Income Tracking",
    "No Hidden Fees or Contracts"
];

const PricingSection: React.FC = () => {
    const navigate = useNavigate();

    return (
        <section className="py-20 bg-black/70 backdrop-blur-sm">
            <div className="container mx-auto px-6 text-center">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.5 }}
                    transition={{ duration: 0.6 }}
                >
                    <h2 className="text-4xl font-plex font-bold text-white">Simple, Transparent Pricing</h2>
                    <p className="text-lg text-gray-400 mt-3 max-w-2xl mx-auto">One plan. Everything you need. No surprises.</p>
                </motion.div>
                
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true, amount: 0.5 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="max-w-md mx-auto mt-12 bg-gray-900/50 p-8 rounded-xl border border-white/10"
                >
                    <h3 className="text-2xl font-plex font-bold text-white">Standard Plan</h3>
                    <p className="mt-4 text-5xl font-plex font-bold text-white">
                        $15
                        <span className="text-lg font-medium text-gray-400">/ month</span>
                    </p>
                    <p className="mt-2 text-gray-400">Billed monthly. Cancel anytime.</p>
                    
                    <Button
                        type="button"
                        onClick={() => navigate('/signup')}
                        className="w-full mt-8 px-8 py-3 text-base font-semibold text-white bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg hover:from-orange-600 hover:to-orange-500 shadow-lg shadow-orange-500/20 hover:shadow-orange-400/40 transition-all duration-300"
                    >
                        Get Started
                    </Button>
                    
                    <ul className="mt-8 space-y-4 text-left">
                        {features.map((feature, index) => (
                            <li key={index} className="flex items-center gap-3">
                                <CheckIcon className="w-5 h-5 text-green-500 flex-shrink-0" />
                                <span className="text-gray-300">{feature}</span>
                            </li>
                        ))}
                    </ul>
                </motion.div>
            </div>
        </section>
    );
};

export default PricingSection;