import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDownIcon } from '../Icons';

const faqs = [
    {
        question: "Is my financial data secure with FinancioAI?",
        answer: "Absolutely. We prioritize your security by using industry-standard encryption for all data transmission and storing your information in secure, compliant data centers."
    },
    {
        question: "How can I share my financial data with my accountant?",
        answer: "You can easily export key financial reports, like Profit & Loss summaries and detailed transaction lists, as CSV files directly from the Reports page. This makes it simple to share clean, organized data with your accountant."
    },
    {
        question: "What AI model powers FinancioAI?",
        answer: "FinancioAI leverages Google's powerful Gemini models to provide you with fast, accurate financial insights, cash flow forecasting, and tax estimations. We stay on the cutting edge to give you the best AI-driven tools."
    },
    {
        question: "Who is FinancioAI best for?",
        answer: "FinancioAI is designed for freelancers, agencies, and small businesses that need a simple, powerful tool to gain financial clarity without the complexity of traditional enterprise accounting software."
    },
    {
        question: "Can I cancel my subscription at any time?",
        answer: "Yes, you can cancel your flat-rate monthly subscription at any time. There are no long-term contracts, and you'll retain access to your account until the end of your current billing period."
    }
];

const FaqItem: React.FC<{ faq: typeof faqs[0], isOpen: boolean, onToggle: () => void }> = ({ faq, isOpen, onToggle }) => {
    return (
        <div className="border-b border-white/10">
            <button
                className="w-full flex justify-between items-center text-left py-5 px-1"
                onClick={onToggle}
            >
                <span className={`text-lg font-medium transition-colors ${isOpen ? 'text-orange-500 font-plex font-bold' : 'text-white font-plex font-bold'}`}>{faq.question}</span>
                <motion.span
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                >
                    <ChevronDownIcon className="w-6 h-6 text-gray-400" />
                </motion.span>
            </button>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0, marginTop: 0 }}
                        animate={{ height: 'auto', opacity: 1, marginTop: '0.5rem', marginBottom: '1.25rem' }}
                        exit={{ height: 0, opacity: 0, marginTop: 0 }}
                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                        className="overflow-hidden"
                    >
                        <p className="text-gray-400 pr-8">{faq.answer}</p>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};


const FaqSection: React.FC = () => {
    const [openIndex, setOpenIndex] = useState<number | null>(0);

    const handleToggle = (index: number) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    return (
        <section className="py-20 bg-black/70 backdrop-blur-sm">
            <div className="container mx-auto px-6">
                <div className="text-center mb-12">
                    <h2 className="text-4xl font-plex font-bold text-white">Frequently Asked Questions</h2>
                </div>
                <div className="max-w-3xl mx-auto">
                    {faqs.map((faq, index) => (
                        <FaqItem 
                            key={index} 
                            faq={faq}
                            isOpen={openIndex === index}
                            onToggle={() => handleToggle(index)}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
};

export default FaqSection;