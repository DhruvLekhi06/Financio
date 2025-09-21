
// FIX: Import `useEffect` from React to resolve 'Cannot find name' error.
import React, { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import Card from '../../components/shared/Card';
import Button from '../../components/shared/Button';
import Modal from '../../components/shared/Modal';
import Spinner from '../../components/shared/Spinner';
import ActionsDropdown from '../../components/shared/ActionsDropdown';
import { useData } from '../../hooks/useData';
import { formatCurrency, formatDate } from '../../utils/helpers';
import { BankIcon, CreditCardIcon, CashIcon, DocumentIcon } from '../../components/Icons';
import type { Account, Transaction } from '../../types';
import Dropdown, { DropdownOption } from '../../components/shared/Dropdown';
import AddCategoryModal from '../../components/shared/AddCategoryModal';
import ConfirmationModal from '../../components/shared/ConfirmationModal';
import DatePicker from '../../components/shared/DatePicker';

const getAccountIcon = (type: Account['type']) => {
    switch (type) {
        case 'Bank': return <BankIcon className="w-6 h-6 text-gray-500 dark:text-gray-400" />;
        case 'Credit Card': return <CreditCardIcon className="w-6 h-6 text-gray-500 dark:text-gray-400" />;
        case 'Cash': return <CashIcon className="w-6 h-6 text-gray-500 dark:text-gray-400" />;
        default: return null;
    }
};

const inputStyle = "block w-full rounded-md border-gray-300 dark:border-primary-600 bg-gray-50 dark:bg-primary-700/50 shadow-sm focus:border-secondary-500 focus:ring focus:ring-secondary-500 focus:ring-opacity-50 transition-colors duration-200";


interface AccountsViewProps {
    setActiveTab: (tab: 'accounts' | 'transactions') => void;
    setFilterAccountId: (id: string) => void;
}

const AccountsView: React.FC<AccountsViewProps> = ({ setActiveTab, setFilterAccountId }) => {
    const { accounts, transactions, addItem, updateItem, deleteAccountAndTransactions, isLoading } = useData();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingAccount, setEditingAccount] = useState<Account | null>(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [deletingAccountId, setDeletingAccountId] = useState<string | null>(null);

    const openModal = (account: Account | null = null) => {
        setEditingAccount(account);
        setIsModalOpen(true);
    };

    const handleFormSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        const accountData = {
            name: formData.get('name') as string,
            type: formData.get('type') as Account['type'],
            last4: formData.get('last4') as string,
            balance: parseFloat(formData.get('balance') as string),
        };
        
        if (editingAccount) {
            updateItem<Account>('accounts', editingAccount.id, accountData);
        } else {
            addItem<Account>('accounts', accountData);
        }
        setIsModalOpen(false);
        setEditingAccount(null);
    };
    
    const handleDelete = (id: string) => {
        setDeletingAccountId(id);
        setIsDeleteModalOpen(true);
    }
    
    const confirmDelete = () => {
        if (deletingAccountId) {
            deleteAccountAndTransactions(deletingAccountId);
        }
        setIsDeleteModalOpen(false);
        setDeletingAccountId(null);
    };

    const getCurrentBalance = (account: Account) => {
        const accountTransactions = transactions.filter(t => t.accountId === account.id);
        const netTransactions = accountTransactions.reduce((acc, t) => {
            return t.type === 'inflow' ? acc + t.amount : acc - t.amount;
        }, 0);
        return account.balance + netTransactions;
    };
    
    return (
        <>
        <Card>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-plex font-bold text-gray-800 dark:text-white">Active Accounts</h2>
                <div className="flex gap-2">
                    <Button onClick={() => openModal()}>Add Account</Button>
                </div>
            </div>
            {isLoading ? <div className="flex justify-center items-center h-48"><Spinner/></div> :
             accounts.length > 0 ? (
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase bg-gray-100 dark:bg-primary-800">
                            <tr>
                                <th scope="col" className="px-6 py-3">Account Details</th>
                                <th scope="col" className="px-6 py-3">Transactions</th>
                                <th scope="col" className="px-6 py-3 text-right">Opening Balance</th>
                                <th scope="col" className="px-6 py-3 text-right">Current Balance</th>
                                <th scope="col" className="px-6 py-3 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {accounts.map(account => {
                                const transactionCount = transactions.filter(t => t.accountId === account.id).length;
                                return (
                                    <tr key={account.id} className="bg-white dark:bg-primary-900 border-b dark:border-primary-800 hover:bg-gray-50 dark:hover:bg-primary-800/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                {getAccountIcon(account.type)}
                                                <div>
                                                    <p className="font-semibold text-gray-900 dark:text-white">{account.name}</p>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400">{account.type} ending in {account.last4}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <button 
                                                onClick={() => {
                                                    setFilterAccountId(account.id);
                                                    setActiveTab('transactions');
                                                }} 
                                                className="text-secondary-600 dark:text-secondary-400 font-medium hover:underline focus:outline-none"
                                            >
                                                {transactionCount} transaction{transactionCount !== 1 ? 's' : ''}
                                            </button>
                                        </td>
                                        <td className="px-6 py-4 text-right font-mono text-gray-600 dark:text-gray-300">{formatCurrency(account.balance)}</td>
                                        <td className="px-6 py-4 text-right font-mono font-semibold text-gray-800 dark:text-gray-100">{formatCurrency(getCurrentBalance(account))}</td>
                                        <td className="px-6 py-4 text-right">
                                            <ActionsDropdown
                                                onEdit={() => openModal(account)}
                                                onDelete={() => handleDelete(account.id)}
                                            />
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
             ) : (
                <div className="text-center py-16">
                    <BankIcon className="mx-auto w-12 h-12 text-gray-400 dark:text-gray-500" />
                    <h3 className="font-plex font-bold text-lg text-gray-900 dark:text-white mt-4">No accounts yet</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Add your bank, credit card, or cash accounts to get started.</p>
                    <Button className="mt-6" onClick={() => openModal()}>Add an Account</Button>
                </div>
            )}
        </Card>
        <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingAccount ? "Edit Account" : "Add New Account"}>
            <form onSubmit={handleFormSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Account Name</label>
                    <input type="text" name="name" required defaultValue={editingAccount?.name} placeholder="e.g., Chase Business Checking" className={`mt-1 input-style`} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Account Type</label>
                        <Dropdown 
                           options={[{value: 'Bank', label: 'Bank'}, {value: 'Credit Card', label: 'Credit Card'}, {value: 'Cash', label: 'Cash'}]}
                           value={editingAccount?.type || 'Bank'}
                           onChange={(value) => {
                               const event = { target: { name: 'type', value } } as any;
                               setEditingAccount(prev => ({...prev, type: value } as Account));
                           }}
                        />
                         <input type="hidden" name="type" value={editingAccount?.type || 'Bank'} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Last 4 Digits</label>
                        <input type="text" name="last4" required defaultValue={editingAccount?.last4} maxLength={4} pattern="\d{4}" placeholder="1234" className={`mt-1 input-style`} />
                    </div>
                </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Opening Balance</label>
                    <input type="number" name="balance" step="0.01" required defaultValue={editingAccount?.balance} placeholder="For credit cards, use a negative number" className={`mt-1 input-style`} />
                </div>
                <div className="pt-4 flex justify-end gap-2">
                    <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                    <Button type="submit">{editingAccount ? "Save Changes" : "Add Account"}</Button>
                </div>
            </form>
        </Modal>
        <ConfirmationModal
            isOpen={isDeleteModalOpen}
            onClose={() => setIsDeleteModalOpen(false)}
            onConfirm={confirmDelete}
            title="Delete Account"
            confirmButtonText="Delete"
            confirmButtonVariant="danger"
        >
            Are you sure you want to delete this account and all its associated transactions? This action cannot be undone.
        </ConfirmationModal>
        </>
    );
};

interface TransactionsViewProps {
    filterAccountId: string | null;
    clearFilter: () => void;
}

const TransactionsView: React.FC<TransactionsViewProps> = ({ filterAccountId, clearFilter }) => {
    const { transactions, accounts, budgets, addItem, updateItem, deleteItem, addBudgetCategory, isLoading } = useData();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
    const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [deletingTransactionId, setDeletingTransactionId] = useState<string | null>(null);
    
    // Form state for new/editing transaction
    const [formData, setFormData] = useState<Omit<Transaction, 'id' | 'type' | 'amount'> & { amount: string, type: 'inflow' | 'outflow'}>({
      date: new Date().toISOString().split('T')[0],
      description: '',
      amount: '',
      type: 'outflow',
      category: '',
      accountId: filterAccountId || ''
    });

    useEffect(() => {
        if (filterAccountId) {
            setFormData(prev => ({...prev, accountId: filterAccountId}));
        }
    }, [filterAccountId]);

    const openModal = (transaction: Transaction | null = null) => {
        setEditingTransaction(transaction);
        if (transaction) {
            setFormData({ ...transaction, amount: String(transaction.amount) });
        } else {
            setFormData({
                date: new Date().toISOString().split('T')[0],
                description: '',
                amount: '',
                type: 'outflow',
                category: '',
                accountId: filterAccountId || accounts[0]?.id || ''
            });
        }
        setIsModalOpen(true);
    };

    const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const transactionData: Omit<Transaction, 'id'> = {
            ...formData,
            amount: parseFloat(formData.amount),
        };
        if (editingTransaction) {
            updateItem<Transaction>('transactions', editingTransaction.id, transactionData);
        } else {
            addItem<Transaction>('transactions', transactionData);
        }
        setIsModalOpen(false);
        setEditingTransaction(null);
    }
    
    const handleDelete = (id: string) => {
        setDeletingTransactionId(id);
        setIsDeleteModalOpen(true);
    }

    const confirmDelete = () => {
        if (deletingTransactionId) {
            deleteItem('transactions', deletingTransactionId);
        }
        setIsDeleteModalOpen(false);
        setDeletingTransactionId(null);
    };
    
    const sortedTransactions = useMemo(() => 
        [...transactions].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
        [transactions]
    );

    const accountNameMap = useMemo(() => accounts.reduce((map, acc) => {
        map[acc.id] = acc.name;
        return map;
    }, {} as Record<string, string>), [accounts]);
    
    const displayedTransactions = useMemo(() => 
        filterAccountId 
            ? sortedTransactions.filter(t => t.accountId === filterAccountId) 
            : sortedTransactions,
        [filterAccountId, sortedTransactions]
    );

    const filteredAccountName = filterAccountId ? accountNameMap[filterAccountId] : null;
    
    const categoryOptions = useMemo(() => {
        const baseCategories = ['Sales', ...budgets.map(b => b.category)];
        return [...baseCategories.map(c => ({ value: c, label: c })), { value: '__add_new__', label: '+ Add New Category' }];
    }, [budgets]);
    
    const handleCategoryChange = (value: string) => {
        if (value === '__add_new__') {
            setIsCategoryModalOpen(true);
        } else {
            setFormData(prev => ({ ...prev, category: value }));
        }
    };

    const handleAddNewCategory = (name: string, budget: number) => {
        if (name.trim() && !budgets.some(b => b.category.toLowerCase() === name.trim().toLowerCase())) {
            addBudgetCategory({
                category: name.trim(),
                budget: budget || 0
            });
            setFormData(prev => ({ ...prev, category: name.trim() }));
            setIsCategoryModalOpen(false);
        } else {
            alert('Category name cannot be empty or already exist.');
        }
    };

    return (
        <>
        <Card>
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-lg font-plex font-bold text-gray-800 dark:text-white">
                        {filteredAccountName ? `Transactions for ${filteredAccountName}` : 'All Transactions'}
                    </h2>
                    {filteredAccountName && (
                        <Button variant="ghost" onClick={clearFilter} className="h-auto p-0 text-xs">Show all transactions</Button>
                    )}
                </div>
                <Button onClick={() => openModal()} disabled={accounts.length === 0}>Add Transaction</Button>
            </div>
             {isLoading ? <div className="flex justify-center items-center h-48"><Spinner /></div>
           : displayedTransactions.length > 0 ? (
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase bg-gray-100 dark:bg-primary-800">
                            <tr>
                                <th scope="col" className="px-6 py-3">Description</th>
                                <th scope="col" className="px-6 py-3">Date</th>
                                <th scope="col" className="px-6 py-3">Account</th>
                                <th scope="col" className="px-6 py-3">Category</th>
                                <th scope="col" className="px-6 py-3 text-right">Amount</th>
                                <th scope="col" className="px-6 py-3 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {displayedTransactions.map((t) => (
                                <tr key={t.id} className="bg-white dark:bg-primary-900 border-b dark:border-primary-800 hover:bg-gray-50 dark:hover:bg-primary-800/50 transition-colors">
                                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-white whitespace-nowrap">{t.description}</td>
                                    <td className="px-6 py-4 text-gray-600 dark:text-gray-300">{formatDate(t.date)}</td>
                                    <td className="px-6 py-4 text-gray-600 dark:text-gray-300">{t.accountId ? accountNameMap[t.accountId] : 'N/A'}</td>
                                    <td className="px-6 py-4"><span className="bg-primary-100 text-primary-800 text-xs font-medium px-2.5 py-0.5 rounded-full dark:bg-primary-700 dark:text-primary-200">{t.category}</span></td>
                                    <td className={`px-6 py-4 text-right font-semibold font-mono ${t.type === 'inflow' ? 'text-green-500' : 'text-red-500'}`}>
                                        {t.type === 'inflow' ? '+' : '-'} {formatCurrency(t.amount)}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <ActionsDropdown
                                            onEdit={() => openModal(t)}
                                            onDelete={() => handleDelete(t.id)}
                                        />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
           ) : (
                 <div className="text-center py-16">
                    <DocumentIcon className="mx-auto w-12 h-12 text-gray-400 dark:text-gray-500" />
                    <h3 className="font-plex font-bold text-lg text-gray-900 dark:text-white mt-4">{filterAccountId ? 'No transactions for this account' : 'No transactions yet'}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        {accounts.length > 0 ? "Add your first transaction to see your activity." : "Please add an account before adding transactions."}
                    </p>
                    {accounts.length > 0 && <Button className="mt-6" onClick={() => openModal()}>Add a Transaction</Button>}
                </div>
           )}
        </Card>
        <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingTransaction ? "Edit Transaction" : "Add New Transaction"}>
            <form onSubmit={handleFormSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
                    <input type="text" name="description" required value={formData.description} onChange={e => setFormData(prev => ({...prev, description: e.target.value}))} className={`mt-1 input-style`} />
                </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Account</label>
                    <Dropdown 
                        options={accounts.map(a => ({ value: a.id, label: a.name }))}
                        value={formData.accountId || ''}
                        onChange={(value) => setFormData(prev => ({...prev, accountId: value}))}
                    />
                </div>
                <div className="grid grid-cols-2 gap-4">
                     <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Amount</label>
                        <input type="number" name="amount" step="0.01" required value={formData.amount} onChange={e => setFormData(prev => ({...prev, amount: e.target.value}))} className={`mt-1 input-style`} />
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Date</label>
                        <DatePicker value={formData.date} onChange={date => setFormData(prev => ({...prev, date}))} />
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Type</label>
                        <Dropdown 
                            options={[{value: 'outflow', label: 'Outflow (Expense)'}, {value: 'inflow', label: 'Inflow (Revenue)'}]}
                            value={formData.type}
                            onChange={(value) => setFormData(prev => ({...prev, type: value as 'inflow' | 'outflow'}))}
                        />
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Category</label>
                        <Dropdown 
                            options={categoryOptions}
                            value={formData.category}
                            onChange={handleCategoryChange}
                        />
                    </div>
                </div>
                <div className="pt-4 flex justify-end gap-2">
                    <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                    <Button type="submit">{editingTransaction ? 'Save Changes' : 'Add Transaction'}</Button>
                </div>
            </form>
        </Modal>
        <AddCategoryModal 
            isOpen={isCategoryModalOpen}
            onClose={() => setIsCategoryModalOpen(false)}
            onAdd={handleAddNewCategory}
        />
        <ConfirmationModal
            isOpen={isDeleteModalOpen}
            onClose={() => setIsDeleteModalOpen(false)}
            onConfirm={confirmDelete}
            title="Delete Transaction"
            confirmButtonText="Delete"
            confirmButtonVariant="danger"
        >
            Are you sure you want to delete this transaction? This action cannot be undone.
        </ConfirmationModal>
        </>
    )
}

const BankingPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'accounts' | 'transactions'>('accounts');
  const [filterAccountId, setFilterAccountId] = useState<string | null>(null);

  const handleTabClick = (tab: 'accounts' | 'transactions') => {
      setActiveTab(tab);
      if (tab === 'accounts') {
        setFilterAccountId(null);
      }
  }

  const tabClasses = (isActive: boolean) => 
      `px-4 py-2.5 text-sm font-medium rounded-t-lg border-b-2 transition-colors duration-200 focus:outline-none ${
        isActive
          ? 'border-secondary-500 text-secondary-600 dark:text-secondary-300'
          : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:border-gray-300 dark:hover:border-gray-600'
      }`;

  return (
    <div className="space-y-6">
        <div className="flex border-b border-gray-200 dark:border-primary-700">
            <button className={tabClasses(activeTab === 'accounts')} onClick={() => handleTabClick('accounts')}>
                Accounts
            </button>
            <button className={tabClasses(activeTab === 'transactions')} onClick={() => handleTabClick('transactions')}>
                Transactions
            </button>
        </div>
        
        {activeTab === 'accounts' ? (
            <AccountsView setActiveTab={setActiveTab} setFilterAccountId={setFilterAccountId} /> 
        ) : (
            <TransactionsView filterAccountId={filterAccountId} clearFilter={() => setFilterAccountId(null)} />
        )}

    </div>
  );
};

export default BankingPage;
