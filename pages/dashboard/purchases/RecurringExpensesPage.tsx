


import React, { useState, useMemo } from 'react';
import Card from '../../../components/shared/Card';
import Button from '../../../components/shared/Button';
import Modal from '../../../components/shared/Modal';
import Spinner from '../../../components/shared/Spinner';
import ActionsDropdown from '../../../components/shared/ActionsDropdown';
import { useData } from '../../../hooks/useData';
import { formatCurrency, formatDate } from '../../../utils/helpers';
import type { RecurringExpense, Account } from '../../../types';
import Dropdown, { DropdownOption } from '../../../components/shared/Dropdown';
import ConfirmationModal from '../../../components/shared/ConfirmationModal';
import DatePicker from '../../../components/shared/DatePicker';

const getStatusPill = (status: RecurringExpense['status']) => {
    const baseClasses = "px-2.5 py-0.5 text-xs font-medium rounded-full";
    switch (status) {
        case 'Active': return <span className={`${baseClasses} bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300`}>Active</span>;
        case 'Paused': return <span className={`${baseClasses} bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300`}>Paused</span>;
        default: return null;
    }
};

const RecurringExpensesPage: React.FC = () => {
    const { recurringExpenses, accounts, budgets, addItem, updateItem, deleteItem, isLoading } = useData();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingExpense, setEditingExpense] = useState<RecurringExpense | null>(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [deletingExpenseId, setDeletingExpenseId] = useState<string | null>(null);

    const openModal = (expense: RecurringExpense | null = null) => {
        setEditingExpense(expense);
        setIsModalOpen(true);
    };

    const handleFormSubmit = (formData: any) => {
        const newItem: Omit<RecurringExpense, 'id' | 'nextDate'> = {
            description: formData.description,
            category: formData.category,
            accountId: formData.accountId,
            frequency: formData.frequency,
            startDate: formData.startDate,
            status: 'Active',
            amount: formData.amount,
        };

        if (editingExpense) {
            updateItem<RecurringExpense>('recurringExpenses', editingExpense.id, newItem);
        } else {
            addItem<RecurringExpense>('recurringExpenses', { ...newItem, nextDate: formData.startDate });
        }
        setIsModalOpen(false);
        setEditingExpense(null);
    };

    const handleDelete = (id: string) => {
        setDeletingExpenseId(id);
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = () => {
        if (deletingExpenseId) {
            deleteItem('recurringExpenses', deletingExpenseId);
        }
        setIsDeleteModalOpen(false);
        setDeletingExpenseId(null);
    };
    
    const accountNameMap = useMemo(() => 
        accounts.reduce((acc, account) => {
            acc[account.id] = account.name;
            return acc;
        }, {} as Record<string, string>), 
    [accounts]);

    return (
        <>
            <Card>
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-lg font-plex font-bold text-gray-800 dark:text-white">Recurring Expenses</h2>
                    <Button onClick={() => openModal()} disabled={accounts.length === 0}>New Recurring Expense</Button>
                </div>
                {isLoading ? (
                    <div className="flex justify-center items-center h-48"><Spinner /></div>
                ) : recurringExpenses.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-gray-700 dark:text-gray-400 uppercase bg-gray-50 dark:bg-gray-700">
                                <tr>
                                    <th scope="col" className="px-6 py-3">Description</th>
                                    <th scope="col" className="px-6 py-3">Category</th>
                                    <th scope="col" className="px-6 py-3">Next Payment</th>
                                    <th scope="col" className="px-6 py-3">Status</th>
                                    <th scope="col" className="px-6 py-3 text-right">Amount</th>
                                    <th scope="col" className="px-6 py-3 text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recurringExpenses.map((expense) => (
                                    <tr key={expense.id} className="bg-white dark:bg-gray-800 border-b dark:border-gray-700">
                                        <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{expense.description}</td>
                                        <td className="px-6 py-4">{expense.category}</td>
                                        <td className="px-6 py-4">{formatDate(expense.nextDate)}</td>
                                        <td className="px-6 py-4">{getStatusPill(expense.status)}</td>
                                        <td className="px-6 py-4 text-right font-mono">{formatCurrency(expense.amount)}</td>
                                        <td className="px-6 py-4 text-center">
                                            <ActionsDropdown onEdit={() => openModal(expense)} onDelete={() => handleDelete(expense.id)} />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <h3 className="text-lg font-plex font-bold text-gray-900 dark:text-white">No recurring expenses yet</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Track your subscriptions and other recurring costs.</p>
                        <Button className="mt-4" onClick={() => openModal()}>Add Recurring Expense</Button>
                    </div>
                )}
            </Card>

            {isModalOpen && <UpsertModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSubmit={handleFormSubmit} accounts={accounts} budgets={budgets} expense={editingExpense} />}
            <ConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={confirmDelete}
                title="Delete Recurring Expense"
                confirmButtonText="Delete"
                confirmButtonVariant="danger"
            >
                Are you sure you want to delete this recurring expense profile? This action cannot be undone.
            </ConfirmationModal>
        </>
    );
};

const UpsertModal: React.FC<{ isOpen: boolean; onClose: () => void; onSubmit: (data: any) => void; accounts: Account[]; budgets: any[]; expense: RecurringExpense | null; }> = ({ isOpen, onClose, onSubmit, accounts, budgets, expense }) => {
    const [description, setDescription] = useState(expense?.description || '');
    const [category, setCategory] = useState(expense?.category || budgets[0]?.category || '');
    const [accountId, setAccountId] = useState(expense?.accountId || accounts[0]?.id || '');
    const [frequency, setFrequency] = useState<RecurringExpense['frequency']>(expense?.frequency || 'Monthly');
    const [startDate, setStartDate] = useState(expense?.startDate || new Date().toISOString().split('T')[0]);
    const [amount, setAmount] = useState(expense?.amount || '');
    
    const accountOptions: DropdownOption[] = accounts.map(a => ({ value: a.id, label: a.name }));
    const categoryOptions: DropdownOption[] = budgets.map(b => ({ value: b.category, label: b.category }));
    const frequencyOptions: DropdownOption[] = [{ value: 'Weekly', label: 'Weekly' }, { value: 'Monthly', label: 'Monthly' }, { value: 'Yearly', label: 'Yearly' }];

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={expense ? 'Edit Recurring Expense' : 'New Recurring Expense'}>
            <div className="space-y-4">
                 <div>
                    <label className="block text-sm font-medium">Description</label>
                    <input type="text" value={description} onChange={e => setDescription(e.target.value)} required placeholder="e.g. Figma Subscription" className="mt-1 block w-full input-style" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium">Category</label>
                        <Dropdown options={categoryOptions} value={category} onChange={setCategory} />
                    </div>
                     <div>
                        <label className="block text-sm font-medium">Payment Account</label>
                        <Dropdown options={accountOptions} value={accountId} onChange={setAccountId} />
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium">Frequency</label>
                        <Dropdown options={frequencyOptions} value={frequency} onChange={(v) => setFrequency(v as RecurringExpense['frequency'])} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium">Start Date</label>
                        <DatePicker value={startDate} onChange={setStartDate} />
                    </div>
                </div>
                 <div>
                    <label className="block text-sm font-medium">Amount</label>
                    <input type="number" value={amount} onChange={e => setAmount(Number(e.target.value))} step="0.01" required placeholder="0.00" className="mt-1 block w-full input-style" />
                </div>
                <div className="pt-4 flex justify-end gap-2">
                    <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
                    <Button onClick={() => onSubmit({ description, category, accountId, frequency, startDate, amount })}>
                        {expense ? 'Save Changes' : 'Create Profile'}
                    </Button>
                </div>
            </div>
        </Modal>
    );
};

export default RecurringExpensesPage;
