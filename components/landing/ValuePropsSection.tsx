import React from 'react';
import { motion, Variants } from 'framer-motion';
import { GridIcon, ReceiptIcon, TrendingUpIcon, ReportsIcon, ShieldIcon, DollarSignIcon } from '../Icons';

const valueProps = [
    { icon: <GridIcon className="w-8 h-8" />, title: "All-in-One Dashboard", description: "Get a complete, real-time overview of your business's financial health from a single, intuitive dashboard." },
    { icon: <ReceiptIcon className="w-8 h-8" />, title: "Effortless Bookkeeping", description: "Automate recurring invoices, bills, and expenses. Reduce manual entry and save valuable time." },
    { icon: <TrendingUpIcon className="w-8 h-8" />, title: "Data-Driven Decisions", description: "Leverage AI forecasting and deep insights to plan for the future with confidence and accuracy." },
    { icon: <ReportsIcon className="w-8 h-8" />, title: "Simplified Reporting", description: "Instantly generate and export key financial reports for your accountant, investors, or internal analysis." },
    { icon: <ShieldIcon className="w-8 h-8" />, title: "Secure & Private", description: "Your financial data is processed and stored securely, ensuring your sensitive information remains confidential." },
    { icon: <DollarSignIcon className="w-8 h-8" />, title: "Simple, Flat-Rate Pricing", description: "No surprises. One low monthly fee gives you access to every feature, with no hidden costs." },
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


const ValuePropsSection: React.FC = () => {
    return (
        <section className="py-20 bg-black/70 backdrop-blur-sm">
            <div className="container mx-auto px-6">
                <div className="text-center mb-12">
                    <h2 className="text-4xl font-plex font-bold text-white">More Than Just Accounting Software</h2>
                    <p className="text-lg text-gray-400 mt-3 max-w-2xl mx-auto">We're a partner in your business's financial health, with features built to save you time and provide peace of mind.</p>
                </div>
                <motion.div
                    variants={sectionVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.2 }}
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12"
                >
                    {valueProps.map((prop, index) => (
                         <motion.div 
                            key={index}
                            variants={itemVariants}
                            className="flex items-start gap-4"
                        >
                            <div className="mt-1 flex-shrink-0 text-orange-500">
                                {prop.icon}
                            </div>
                            <div>
                                <h3 className="text-lg font-plex font-bold mb-1 text-white">{prop.title}</h3>
                                <p className="text-gray-400">{prop.description}</p>
                            </div>
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </section>
    );
};

export default ValuePropsSection;