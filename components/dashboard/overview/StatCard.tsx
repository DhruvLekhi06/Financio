import React from 'react';
import type { ReactNode } from 'react';
import Card from '../../shared/Card';
import { motion } from 'framer-motion';

interface StatCardProps {
    title: string;
    value: string;
    icon: ReactNode;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon }) => {
    return (
        <motion.div whileHover={{ y: -5, boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)"}}>
            <Card className="p-4 h-full">
                 <div className="flex justify-between items-start">
                    <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
                     <div className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                        {icon}
                     </div>
                </div>
                <p className="text-4xl font-bold font-mono text-gray-900 dark:text-white mt-2">{value}</p>
            </Card>
        </motion.div>
    );
}

export default StatCard;
