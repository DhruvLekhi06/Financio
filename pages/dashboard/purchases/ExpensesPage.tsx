import React, { useState, useMemo, useEffect, useCallback } from 'react';
import Card from '../../../components/shared/Card';
import Spinner from '../../../components/shared/Spinner';
import Button from '../../../components/shared/Button';
import Modal from '../../../components/shared/Modal';
import Dropdown, { DropdownOption } from '../../../components/shared/Dropdown';
import ActionsDropdown from '../../../components/shared/ActionsDropdown';
import AddCategoryModal from '../../../components/shared/AddCategoryModal';
import { useData } from '../../../hooks/useData';
import { suggestCategory } from '../../../services/geminiService';
import { formatCurrency, formatDate } from '../../../utils/helpers';
import type { Transaction } from '../../../types';
import ConfirmationModal from '../../../components/shared/ConfirmationModal';
import DatePicker from '../../../components/shared/DatePicker';

const ExpensesPage: React.FC = () => {
    const { transactions, budgets, accounts, addItem, updateItem, deleteItem, addBudgetCategory, isLoading } = useData();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
    const [isSuggesting, setIsSuggesting] = useState(false);
    const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [deletingTransactionId, setDeletingTransactionId] = useState<string | null>(null);
    
    const [formData, setFormData] = useState({
        description: '',
        accountId: '',
        amount: '',
        date: new Date().toISOString().split('T')[0],
        category: ''
    });

    const expenses = useMemo(() => 
        transactions
            .filter(t => t.type === 'outflow')
            .sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
        [transactions]
    );

    const openModal = (transaction: Transaction | null = null) => {
        setEditingTransaction(transaction);
        if (transaction) {
            setFormData({
                description: transaction.description,
                accountId: transaction.accountId || '',
                amount: String(transaction.amount),
                date: transaction.date,
                category: transaction.category
            });
        } else {
            setFormData({
                description: '',
                accountId: accounts[0]?.id || '',
                amount: '',
                date: new Date().toISOString().split('T')[0],
                category: ''
            });
        }
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setEditingTransaction(null);
        setIsModalOpen(false);
    };

    const handleDescriptionBlur = useCallback(async () => {
        if (formData.description.trim().length > 3 && !editingTransaction) {
            setIsSuggesting(true);
            const categoryList = budgets.map(b => b.category).filter(c => c !== 'Uncategorized');
            const suggestion = await suggestCategory(formData.description, categoryList);
            setFormData(prev => ({...prev, category: suggestion}));
            setIsSuggesting(false);
        }
    }, [formData.description, budgets, editingTransaction]);

    const handleFormSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const transactionData = {
            date: formData.date,
            description: formData.description,
            amount: parseFloat(formData.amount),
            type: 'outflow' as const,
            category: formData.category as Transaction['category'],
            accountId: formData.accountId,
        };
        
        if (editingTransaction) {
            updateItem<Transaction>('transactions', editingTransaction.id, transactionData);
        } else {
            addItem<Transaction>('transactions', transactionData);
        }
        closeModal();
    };

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
    
    const accountNameMap = useMemo(() => accounts.reduce((map, acc) => {
        map[acc.id] = acc.name;
        return map;
    }, {} as Record<string, string>), [accounts]);

    const categoryOptions = useMemo(() => [
        ...budgets.map(b => ({ value: b.category, label: b.category })),
        { value: '__add_new__', label: '+ Add New Category' }
    ], [budgets]);
    
    const handleCategoryChange = (value: string) => {
        if (value === '__add_new__') {
            setIsCategoryModalOpen(true);
        } else {
            setFormData(prev => ({...prev, category: value}));
        }
    };

    const handleAddNewCategory = (name: string, budget: number) => {
        if (name.trim() && !budgets.some(b => b.category.toLowerCase() === name.trim().toLowerCase())) {
            addBudgetCategory({
                category: name.trim(),
                budget: budget || 0
            });
            setFormData(prev => ({...prev, category: name.trim()}));
            setIsCategoryModalOpen(false);
        } else {
            alert('Category name cannot be empty or already exist.');
        }
    };

  return (
    <>
    <div className="space-y-8">
        <Card>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-plex font-bold text-gray-800 dark:text-white">Expense History</h2>
                <Button onClick={() => openModal()} disabled={accounts.length === 0}>Add Expense</Button>
            </div>
             {isLoading ? <div className="flex justify-center items-center h-48"><Spinner /></div>
           : expenses.length > 0 ? (
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-gray-700 dark:text-gray-400 uppercase bg-gray-50 dark:bg-gray-700">
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
                            {expenses.map((t) => (
                                <tr key={t.id} className="bg-white dark:bg-gray-800 border-b dark:border-gray-700">
                                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-white whitespace-nowrap">{t.description}</td>
                                    <td className="px-6 py-4 text-gray-500 dark:text-gray-400">{formatDate(t.date)}</td>
                                    <td className="px-6 py-4 text-gray-500 dark:text-gray-400">{t.accountId ? accountNameMap[t.accountId] : 'N/A'}</td>
                                    <td className="px-6 py-4"><span className="bg-primary-100 text-primary-800 text-xs font-medium px-2.5 py-0.5 rounded-full dark:bg-primary-900 dark:text-primary-300">{t.category}</span></td>
                                    <td className="px-6 py-4 text-right font-semibold font-mono text-red-500">{formatCurrency(t.amount)}</td>
                                    <td className="px-6 py-4 text-right">
                                        <ActionsDropdown onEdit={() => openModal(t)} onDelete={() => handleDelete(t.id)} />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
           ) : (
                 <div className="text-center py-12">
                    <h3 className="font-plex font-bold text-lg text-gray-900 dark:text-white">No expenses recorded</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        {accounts.length > 0 ? "Add your first expense to see your activity." : "Please add an account before adding expenses."}
                    </p>
                    {accounts.length > 0 && <Button className="mt-4" onClick={() => openModal()}>Add an Expense</Button>}
                </div>
           )}
        </Card>

        <Modal isOpen={isModalOpen} onClose={closeModal} title={editingTransaction ? 'Edit Expense' : 'Add Expense'}>
            <form onSubmit={handleFormSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
                    <input 
                        type="text" 
                        name="description" 
                        required 
                        value={formData.description}
                        onChange={(e) => setFormData(prev => ({...prev, description: e.target.value}))}
                        onBlur={handleDescriptionBlur}
                        className="mt-1 block w-full input-style" 
                    />
                </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Account</label>
                    <Dropdown
                        options={accounts.map(a => ({ value: a.id, label: a.name }))}
                        value={formData.accountId}
                        onChange={(value) => setFormData(prev => ({...prev, accountId: value}))}
                    />
                </div>
                <div className="grid grid-cols-2 gap-4">
                     <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Amount</label>
                        <input type="number" name="amount" step="0.01" required value={formData.amount} onChange={(e) => setFormData(prev => ({...prev, amount: e.target.value}))} className="mt-1 block w-full input-style" />
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Date</label>
                        <DatePicker value={formData.date} onChange={date => setFormData(prev => ({...prev, date}))} />
                    </div>
                </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Category</label>
                    {isSuggesting && <div className="text-xs text-gray-500 flex items-center gap-1 mt-1"><Spinner className="w-3 h-3" /> Suggesting category...</div>}
                    <Dropdown
                        options={categoryOptions}
                        value={formData.category}
                        onChange={handleCategoryChange}
                        className="mt-1"
                    />
                </div>
                <div className="pt-4 flex justify-end gap-2">
                    <Button type="button" variant="secondary" onClick={closeModal}>Cancel</Button>
                    <Button type="submit">{editingTransaction ? 'Save Changes' : 'Add Expense'}</Button>
                </div>
            </form>
        </Modal>
        
        <AddCategoryModal 
            isOpen={isCategoryModalOpen}
            onClose={() => setIsCategoryModalOpen(false)}
            onAdd={handleAddNewCategory}
        />
    </div>
    <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        title="Delete Expense"
        confirmButtonText="Delete"
        confirmButtonVariant="danger"
    >
        Are you sure you want to delete this expense? This action cannot be undone.
    </ConfirmationModal>
    </>
  );
};

export default ExpensesPage;
