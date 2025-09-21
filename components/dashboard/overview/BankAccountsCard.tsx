import React from 'react';
import Card from '../../shared/Card';
import Button from '../../shared/Button';
import { useNavigate } from 'react-router-dom';
import { DotsHorizontalIcon, BankIcon } from '../../Icons';
import { formatCurrency } from '../../../utils/helpers';
import { useData } from '../../../hooks/useData';

const BankAccountsCard: React.FC = () => {
    const { accounts } = useData();
    const navigate = useNavigate();

    const handleAccountClick = (accountId: string) => {
        navigate('/banking', { state: { accountId } });
    };

    return (
        <Card>
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-plex font-bold text-gray-800 dark:text-white">Bank Accounts</h2>
                <button className="text-gray-400 hover:text-gray-600">
                    <DotsHorizontalIcon className="w-5 h-5" />
                </button>
            </div>
            <div className="space-y-4">
                {accounts.slice(0, 3).map(account => (
                    <button 
                        key={account.id} 
                        onClick={() => handleAccountClick(account.id)}
                        className="w-full flex items-center justify-between text-left p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-primary-700/50"
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gray-100 dark:bg-primary-700 rounded-lg flex items-center justify-center">
                                <BankIcon className="w-5 h-5 text-gray-500" />
                            </div>
                            <div>
                                <p className="font-medium text-sm text-gray-800 dark:text-white">{account.name}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">...{account.last4}</p>
                            </div>
                        </div>
                        <p className="font-semibold font-mono text-sm">{formatCurrency(account.balance)}</p>
                    </button>
                ))}
            </div>
            {accounts.length === 0 && (
                 <p className="text-sm text-center text-gray-500 dark:text-gray-400 py-4">No accounts added yet.</p>
            )}
            <div className="mt-6 pt-4 border-t border-gray-100 dark:border-primary-700">
                <Button variant="primary" className="w-full bg-dark-purple hover:bg-black" onClick={() => navigate('/banking')}>
                    Manage Accounts
                </Button>
            </div>
        </Card>
    );
};

export default BankAccountsCard;