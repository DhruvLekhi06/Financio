



import React, { useState, useMemo } from 'react';
import Card from '../../../components/shared/Card';
import Button from '../../../components/shared/Button';
import Modal from '../../../components/shared/Modal';
import Spinner from '../../../components/shared/Spinner';
import ActionsDropdown from '../../../components/shared/ActionsDropdown';
import { useData } from '../../../hooks/useData';
import { formatCurrency, formatDate } from '../../../utils/helpers';
import type { RecurringBill, Vendor, LineItem } from '../../../types';
import Dropdown, { DropdownOption } from '../../../components/shared/Dropdown';
import LineItemEditor from '../../../components/shared/LineItemEditor';
import ConfirmationModal from '../../../components/shared/ConfirmationModal';
import DatePicker from '../../../components/shared/DatePicker';

const getStatusPill = (status: RecurringBill['status']) => {
    const baseClasses = "px-2.5 py-0.5 text-xs font-medium rounded-full";
    switch (status) {
        case 'Active': return <span className={`${baseClasses} bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300`}>Active</span>;
        case 'Paused': return <span className={`${baseClasses} bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300`}>Paused</span>;
        default: return null;
    }
};

const RecurringBillsPage: React.FC = () => {
    const { recurringBills, vendors, addItem, updateItem, deleteItem, isLoading } = useData();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingBill, setEditingBill] = useState<RecurringBill | null>(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [deletingBillId, setDeletingBillId] = useState<string | null>(null);

    const openModal = (bill: RecurringBill | null = null) => {
        setEditingBill(bill);
        setIsModalOpen(true);
    };

    const handleFormSubmit = (formData: any) => {
        const newItem: Omit<RecurringBill, 'id' | 'nextDate'> = {
            vendorId: formData.vendorId,
            frequency: formData.frequency,
            startDate: formData.startDate,
            status: 'Active',
            lineItems: formData.lineItems,
            total: formData.totals.total
        };

        if (editingBill) {
            updateItem<RecurringBill>('recurringBills', editingBill.id, newItem);
        } else {
            addItem<RecurringBill>('recurringBills', { ...newItem, nextDate: formData.startDate });
        }
        setIsModalOpen(false);
        setEditingBill(null);
    };

    const handleDelete = (id: string) => {
        setDeletingBillId(id);
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = () => {
        if (deletingBillId) {
            deleteItem('recurringBills', deletingBillId);
        }
        setIsDeleteModalOpen(false);
        setDeletingBillId(null);
    };
    
    const vendorNameMap = useMemo(() => 
        vendors.reduce((acc, vendor) => {
            acc[vendor.id] = vendor.name;
            return acc;
        }, {} as Record<string, string>), 
    [vendors]);

    return (
        <>
            <Card>
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-lg font-plex font-bold text-gray-800 dark:text-white">Recurring Bills</h2>
                    <Button onClick={() => openModal()} disabled={vendors.length === 0}>New Recurring Bill</Button>
                </div>
                {isLoading ? (
                    <div className="flex justify-center items-center h-48"><Spinner /></div>
                ) : recurringBills.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-gray-700 dark:text-gray-400 uppercase bg-gray-50 dark:bg-gray-700">
                                <tr>
                                    <th scope="col" className="px-6 py-3">Vendor</th>
                                    <th scope="col" className="px-6 py-3">Frequency</th>
                                    <th scope="col" className="px-6 py-3">Next Bill Date</th>
                                    <th scope="col" className="px-6 py-3">Status</th>
                                    <th scope="col" className="px-6 py-3 text-right">Amount</th>
                                    <th scope="col" className="px-6 py-3 text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recurringBills.map((bill) => (
                                    <tr key={bill.id} className="bg-white dark:bg-gray-800 border-b dark:border-gray-700">
                                        <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{vendorNameMap[bill.vendorId]}</td>
                                        <td className="px-6 py-4">{bill.frequency}</td>
                                        <td className="px-6 py-4">{formatDate(bill.nextDate)}</td>
                                        <td className="px-6 py-4">{getStatusPill(bill.status)}</td>
                                        <td className="px-6 py-4 text-right font-mono">{formatCurrency(bill.total)}</td>
                                        <td className="px-6 py-4 text-center">
                                            <ActionsDropdown onEdit={() => openModal(bill)} onDelete={() => handleDelete(bill.id)} />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <h3 className="text-lg font-plex font-bold text-gray-900 dark:text-white">No recurring bills yet</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Set up automated bills for your vendors.</p>
                        <Button className="mt-4" onClick={() => openModal()}>Create Recurring Bill</Button>
                    </div>
                )}
            </Card>
            {isModalOpen && <UpsertRecurringBillModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSubmit={handleFormSubmit} vendors={vendors} bill={editingBill} />}
            <ConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={confirmDelete}
                title="Delete Recurring Bill Profile"
                confirmButtonText="Delete"
                confirmButtonVariant="danger"
            >
                Are you sure you want to delete this recurring bill profile? This action cannot be undone.
            </ConfirmationModal>
        </>
    );
};

const UpsertRecurringBillModal: React.FC<{
    isOpen: boolean; onClose: () => void; onSubmit: (data: any) => void; vendors: Vendor[]; bill: RecurringBill | null;
}> = ({ isOpen, onClose, onSubmit, vendors, bill }) => {
    const [vendorId, setVendorId] = useState(bill?.vendorId || (vendors[0]?.id || ''));
    const [frequency, setFrequency] = useState<RecurringBill['frequency']>(bill?.frequency || 'Monthly');
    const [startDate, setStartDate] = useState(bill?.startDate || new Date().toISOString().split('T')[0]);
    const [lineItems, setLineItems] = useState<LineItem[]>(bill?.lineItems || []);
    const [totals, setTotals] = useState({ total: bill?.total || 0 });

    const vendorOptions: DropdownOption[] = vendors.map(v => ({ value: v.id, label: v.name }));
    const frequencyOptions: DropdownOption[] = [
        { value: 'Weekly', label: 'Weekly' },
        { value: 'Monthly', label: 'Monthly' },
        { value: 'Yearly', label: 'Yearly' },
    ];

    const handleSubmit = () => {
        onSubmit({ vendorId, frequency, startDate, lineItems, totals });
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={bill ? 'Edit Recurring Bill' : 'New Recurring Bill'}>
            <div className="space-y-4">
                 <div>
                    <label className="block text-sm font-medium">Vendor</label>
                    <Dropdown options={vendorOptions} value={vendorId} onChange={setVendorId} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium">Frequency</label>
                        <Dropdown options={frequencyOptions} value={frequency} onChange={(v) => setFrequency(v as RecurringBill['frequency'])} />
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
                    <Button onClick={handleSubmit}>{bill ? 'Save Changes' : 'Create Profile'}</Button>
                </div>
            </div>
        </Modal>
    );
};

export default RecurringBillsPage;
