
import React from 'react';
import { motion } from 'framer-motion';
import Card from '../../components/shared/Card';
import { useData } from '../../hooks/useData';
import Spinner from '../../components/shared/Spinner';
import { AchievementsIcon } from '../../components/Icons';
import type { Achievement } from '../../types';

const AchievementCard: React.FC<{ item: Achievement, index: number }> = ({ item, index }) => (
    <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3, delay: index * 0.05 }}
        className={`p-6 rounded-lg border flex flex-col items-center text-center ${item.unlocked 
            ? 'bg-primary-50 dark:bg-primary-900/30 border-primary-200 dark:border-primary-800' 
            : 'bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700'
        }`}
    >
        <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${item.unlocked 
            ? 'bg-primary-500 text-white' 
            : 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400'
        }`}>
            <AchievementsIcon className="w-8 h-8" />
        </div>
        <h3 className={`font-bold ${item.unlocked ? 'text-primary-800 dark:text-primary-200' : 'text-gray-800 dark:text-gray-200'}`}>{item.title}</h3>
        <p className={`text-sm mt-1 ${item.unlocked ? 'text-primary-600 dark:text-primary-400' : 'text-gray-500 dark:text-gray-400'}`}>{item.description}</p>
        {!item.unlocked && <div className="mt-4 text-xs font-semibold text-gray-400 dark:text-gray-500">LOCKED</div>}
    </motion.div>
);


const AchievementsPage: React.FC = () => {
    const { achievements, isLoading } = useData();

  return (
    <div className="space-y-8">
      
        <Card>
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-6">Your Milestones</h2>
            {isLoading ? (
                <div className="flex justify-center items-center h-48"><Spinner /></div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                    {achievements.map((item, index) => (
                        <AchievementCard key={item.id} item={item} index={index} />
                    ))}
                </div>
            )}
        </Card>
    </div>
  );
};

export default AchievementsPage;
