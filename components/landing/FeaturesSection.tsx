import React from 'react';
import { motion, Variants } from 'framer-motion';
import { SalesIcon, PurchasesIcon, BankingIcon, BrainCircuitIcon, ForecastIcon, TaxIcon } from '../Icons';

const features = [
    { icon: <SalesIcon className="w-8 h-8" />, title: "Comprehensive Sales Suite", description: "Manage customers, create sales orders, and send professional invoices. Track payments and automate recurring billing." },
    { icon: <PurchasesIcon className="w-8 h-8" />, title: "Purchase & Expense Management", description: "Keep track of vendors, purchase orders, and bills. Log expenses and manage recurring costs to stay on top of your spending." },
    { icon: <BankingIcon className="w-8 h-8" />, title: "Unified Banking", description: "Connect your bank accounts to see a real-time overview of your finances. All transactions in one place for easy reconciliation." },
    { icon: <BrainCircuitIcon className="w-8 h-8" />, title: "AI Financial Assistant", description: "Ask complex questions about your financial data in plain English. Get instant insights and summaries to make informed decisions." },
    { icon: <ForecastIcon className="w-8 h-8" />, title: "AI-Powered Forecasting", description: "Project your future cash flow with our intelligent forecasting tool. Adjust assumptions to model different scenarios and plan for growth." },
    { icon: <TaxIcon className="w-8 h-8" />, title: "Simplified Tax Prep", description: "Use the AI Tax Estimator to get a clear picture of your potential tax liability, helping you prepare for tax season with confidence." },
];

const sectionVariants: Variants = {
  hidden: { opacity: 0, y: 50 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { duration: 0.6, staggerChildren: 0.1 } 
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const FeaturesSection: React.FC = () => {
    return (
        <section className="py-20 bg-black/70 backdrop-blur-sm">
            <div className="container mx-auto px-6">
                <div className="text-center mb-12">
                    <h2 className="text-4xl font-plex font-bold text-white">AI-Powered Features for Financial Clarity</h2>
                    <p className="text-lg text-gray-400 mt-3 max-w-2xl mx-auto">Our AI-powered features are designed to be simple and intuitive, helping you manage your finances with confidence.</p>
                </div>
                <motion.div 
                    variants={sectionVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.2 }}
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                >
                    {features.map((feature, index) => (
                        <motion.div 
                            key={index}
                            variants={itemVariants}
                            className="bg-gray-900/50 p-8 rounded-xl border border-white/10"
                        >
                            <div className="mb-4 inline-block text-orange-500">
                                {feature.icon}
                            </div>
                            <h3 className="text-xl font-plex font-bold mb-2 text-white">{feature.title}</h3>
                            <p className="text-gray-400">{feature.description}</p>
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </section>
    );
};

export default FeaturesSection;