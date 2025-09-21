



import React, { useState } from 'react';
import Card from '../../../components/shared/Card';
import Button from '../../../components/shared/Button';
import Modal from '../../../components/shared/Modal';
import Spinner from '../../../components/shared/Spinner';
import ActionsDropdown from '../../../components/shared/ActionsDropdown';
import { useData } from '../../../hooks/useData';
import { formatCurrency, formatDate } from '../../../utils/helpers';
import type { RecurringInvoice, Customer, LineItem } from '../../../types';
import Dropdown, { DropdownOption } from '../../../components/shared/Dropdown';
import LineItemEditor from '../../../components/shared/LineItemEditor';
import ConfirmationModal from '../../../components/shared/ConfirmationModal';
import DatePicker from '../../../components/shared/DatePicker';

const getStatusPill = (status: RecurringInvoice['status']) => {
    const baseClasses = "px-2.5 py-0.5 text-xs font-medium rounded-full";
    switch (status) {
        case 'Active': return <span className={`${baseClasses} bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300`}>Active</span>;
        case 'Paused': return <span className={`${baseClasses} bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300`}>Paused</span>;
        default: return null;
    }
};

const RecurringInvoicesPage: React.FC = () => {
    const { recurringInvoices, customers, addItem, updateItem, deleteItem, isLoading } = useData();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingInvoice, setEditingInvoice] = useState<RecurringInvoice | null>(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [deletingInvoiceId, setDeletingInvoiceId] = useState<string | null>(null);

    const openModal = (invoice: RecurringInvoice | null = null) => {
        setEditingInvoice(invoice);
        setIsModalOpen(true);
    };

    const handleFormSubmit = (formData: any) => {
        const newItem: Omit<RecurringInvoice, 'id' | 'nextDate'> = {
            customerId: formData.customerId,
            frequency: formData.frequency,
            startDate: formData.startDate,
            status: 'Active',
            lineItems: formData.lineItems,
            total: formData.totals.total
        };

        if (editingInvoice) {
            updateItem<RecurringInvoice>('recurringInvoices', editingInvoice.id, newItem);
        } else {
            addItem<RecurringInvoice>('recurringInvoices', { ...newItem, nextDate: formData.startDate });
        }
        setIsModalOpen(false);
        setEditingInvoice(null);
    };

    const handleDelete = (id: string) => {
        setDeletingInvoiceId(id);
        setIsDeleteModalOpen(true);
    };
    
    const confirmDelete = () => {
        if (deletingInvoiceId) {
            deleteItem('recurringInvoices', deletingInvoiceId);
        }
        setIsDeleteModalOpen(false);
        setDeletingInvoiceId(null);
    };

    const customerNameMap = React.useMemo(() => 
        customers.reduce((acc, customer) => {
            acc[customer.id] = customer.name;
            return acc;
        }, {} as Record<string, string>), 
    [customers]);

    return (
        <>
            <Card>
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-lg font-plex font-bold text-gray-800 dark:text-white">Recurring Invoices</h2>
                    <Button onClick={() => openModal()} disabled={customers.length === 0}>New Recurring Invoice</Button>
                </div>
                {isLoading ? (
                    <div className="flex justify-center items-center h-48"><Spinner /></div>
                ) : recurringInvoices.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-gray-700 dark:text-gray-400 uppercase bg-gray-50 dark:bg-gray-700">
                                <tr>
                                    <th scope="col" className="px-6 py-3">Customer</th>
                                    <th scope="col" className="px-6 py-3">Frequency</th>
                                    <th scope="col" className="px-6 py-3">Next Invoice Date</th>
                                    <th scope="col" className="px-6 py-3">Status</th>
                                    <th scope="col" className="px-6 py-3 text-right">Amount</th>
                                    <th scope="col" className="px-6 py-3 text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recurringInvoices.map((invoice) => (
                                    <tr key={invoice.id} className="bg-white dark:bg-gray-800 border-b dark:border-gray-700">
                                        <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{customerNameMap[invoice.customerId]}</td>
                                        <td className="px-6 py-4">{invoice.frequency}</td>
                                        <td className="px-6 py-4">{formatDate(invoice.nextDate)}</td>
                                        <td className="px-6 py-4">{getStatusPill(invoice.status)}</td>
                                        <td className="px-6 py-4 text-right font-mono">{formatCurrency(invoice.total)}</td>
                                        <td className="px-6 py-4 text-center">
                                            <ActionsDropdown
                                                onEdit={() => openModal(invoice)}
                                                onDelete={() => handleDelete(invoice.id)}
                                            />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <h3 className="text-lg font-plex font-bold text-gray-900 dark:text-white">No recurring invoices yet</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Set up automated billing for your clients.</p>
                        <Button className="mt-4" onClick={() => openModal()}>Create Recurring Invoice</Button>
                    </div>
                )}
            </Card>

            {isModalOpen && (
                <UpsertRecurringInvoiceModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onSubmit={handleFormSubmit}
                    customers={customers}
                    invoice={editingInvoice}
                />
            )}
            <ConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={confirmDelete}
                title="Delete Recurring Profile"
                confirmButtonText="Delete"
                confirmButtonVariant="danger"
            >
                Are you sure you want to delete this recurring invoice profile? This action cannot be undone.
            </ConfirmationModal>
        </>
    );
};

const UpsertRecurringInvoiceModal: React.FC<{
    isOpen: boolean; onClose: () => void; onSubmit: (data: any) => void; customers: Customer[]; invoice: RecurringInvoice | null;
}> = ({ isOpen, onClose, onSubmit, customers, invoice }) => {
    const [customerId, setCustomerId] = useState(invoice?.customerId || (customers[0]?.id || ''));
    const [frequency, setFrequency] = useState<RecurringInvoice['frequency']>(invoice?.frequency || 'Monthly');
    const [startDate, setStartDate] = useState(invoice?.startDate || new Date().toISOString().split('T')[0]);
    const [lineItems, setLineItems] = useState<LineItem[]>(invoice?.lineItems || []);
    const [totals, setTotals] = useState({ total: invoice?.total || 0 });

    const customerOptions: DropdownOption[] = customers.map(c => ({ value: c.id, label: c.name }));
    const frequencyOptions: DropdownOption[] = [
        { value: 'Weekly', label: 'Weekly' },
        { value: 'Monthly', label: 'Monthly' },
        { value: 'Yearly', label: 'Yearly' },
    ];

    const handleSubmit = () => {
        onSubmit({ customerId, frequency, startDate, lineItems, totals });
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={invoice ? 'Edit Recurring Invoice' : 'New Recurring Invoice'}>
            <div className="space-y-4">
                 <div>
                    <label className="block text-sm font-medium">Customer</label>
                    <Dropdown options={customerOptions} value={customerId} onChange={setCustomerId} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium">Frequency</label>
                        {/* FIX: Wrapped state setter in a function to match Dropdown's onChange prop type and cast the value. */}
                        <Dropdown options={frequencyOptions} value={frequency} onChange={(v) => setFrequency(v as RecurringInvoice['frequency'])} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium">Start Date</label>
                        <DatePicker value={startDate} onChange={setStartDate} />
                    </div>
                </div>
                <LineItemEditor 
                    items={lineItems} 
                    onItemsChange={setLineItems} 
                    onTotalsChange={(t) => setTotals({ total: t.total })}
                />
                <div className="pt-4 flex justify-end gap-2">
                    <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
                    <Button onClick={handleSubmit}>{invoice ? 'Save Changes' : 'Create Profile'}</Button>
                </div>
            </div>
        </Modal>
    );
};

export default RecurringInvoicesPage;
