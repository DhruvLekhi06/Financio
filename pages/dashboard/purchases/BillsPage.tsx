


import React, { useState, useMemo } from 'react';
import Card from '../../../components/shared/Card';
import Button from '../../../components/shared/Button';
import Modal from '../../../components/shared/Modal';
import Spinner from '../../../components/shared/Spinner';
import ActionsDropdown from '../../../components/shared/ActionsDropdown';
import LineItemEditor from '../../../components/shared/LineItemEditor';
import { useData } from '../../../hooks/useData';
import { formatCurrency, formatDate } from '../../../utils/helpers';
import type { Bill, Vendor, LineItem, PaymentMade } from '../../../types';
import Dropdown, { DropdownOption } from '../../../components/shared/Dropdown';
import ConfirmationModal from '../../../components/shared/ConfirmationModal';
import DatePicker from '../../../components/shared/DatePicker';

const getStatusPill = (status: Bill['status']) => {
    const baseClasses = "px-2.5 py-0.5 text-xs font-medium rounded-full";
    switch (status) {
        case 'Paid': return <span className={`${baseClasses} bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300`}>Paid</span>;
        case 'Unpaid': return <span className={`${baseClasses} bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300`}>Unpaid</span>;
        case 'Draft': return <span className={`${baseClasses} bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300`}>Draft</span>;
        case 'Overdue': return <span className={`${baseClasses} bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300`}>Overdue</span>;
        default: return null;
    }
};

const BillsPage: React.FC = () => {
    const { bills, vendors, addItem, updateItem, deleteItem, recordBillPayment, isLoading } = useData();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingBill, setEditingBill] = useState<Bill | null>(null);
    const [paymentBill, setPaymentBill] = useState<Bill | null>(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [deletingBillId, setDeletingBillId] = useState<string | null>(null);

    const openModal = (bill: Bill | null = null) => {
        setEditingBill(bill);
        setIsModalOpen(true);
    };

    const handleFormSubmit = (formData: any) => {
        const billData = {
            billId: `#BILL-${bills.length + 1004}`,
            vendorId: formData.vendorId,
            date: formData.date,
            dueDate: formData.dueDate,
            lineItems: formData.lineItems,
            status: 'Draft' as const,
            notes: '',
            ...formData.totals
        };
        
        if (editingBill) {
            updateItem<Bill>('bills', editingBill.id, { ...billData, billId: editingBill.billId, status: editingBill.status });
        } else {
            addItem<Bill>('bills', billData);
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
            deleteItem('bills', deletingBillId);
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
                    <h2 className="text-lg font-plex font-bold text-gray-800 dark:text-white">Bills</h2>
                    <Button onClick={() => openModal()} disabled={vendors.length === 0}>New Bill</Button>
                </div>
                {isLoading ? (
                    <div className="flex justify-center items-center h-48"><Spinner /></div>
                ) : bills.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-gray-700 dark:text-gray-400 uppercase bg-gray-50 dark:bg-gray-700">
                                <tr>
                                    <th scope="col" className="px-6 py-3">Bill ID</th>
                                    <th scope="col" className="px-6 py-3">Vendor</th>
                                    <th scope="col" className="px-6 py-3">Due Date</th>
                                    <th scope="col" className="px-6 py-3">Status</th>
                                    <th scope="col" className="px-6 py-3 text-right">Amount</th>
                                    <th scope="col" className="px-6 py-3 text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {bills.map((bill) => (
                                    <tr key={bill.id} className="bg-white dark:bg-gray-800 border-b dark:border-gray-700">
                                        <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{bill.billId}</td>
                                        <td className="px-6 py-4">{vendorNameMap[bill.vendorId] || 'N/A'}</td>
                                        <td className="px-6 py-4">{formatDate(bill.dueDate)}</td>
                                        <td className="px-6 py-4">{getStatusPill(bill.status)}</td>
                                        <td className="px-6 py-4 text-right font-mono">{formatCurrency(bill.total)}</td>
                                        <td className="px-6 py-4 text-center">
                                            <div className="flex items-center justify-center gap-2">
                                                 {bill.status !== 'Paid' && (
                                                    <Button size="sm" onClick={() => setPaymentBill(bill)}>Record Payment</Button>
                                                )}
                                                <ActionsDropdown onEdit={() => openModal(bill)} onDelete={() => handleDelete(bill.id)} />
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <h3 className="text-lg font-plex font-bold text-gray-900 dark:text-white">No bills yet</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                           {vendors.length > 0 ? "Add your first bill to track payables." : "Please add a vendor before creating a bill."}
                        </p>
                        {vendors.length > 0 && <Button className="mt-4" onClick={() => openModal()}>Create Bill</Button>}
                    </div>
                )}
            </Card>

            {isModalOpen && <UpsertBillModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSubmit={handleFormSubmit} vendors={vendors} bill={editingBill} />}
            {paymentBill && <RecordBillPaymentModal isOpen={!!paymentBill} onClose={() => setPaymentBill(null)} bill={paymentBill} onRecordPayment={recordBillPayment} />}
            <ConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={confirmDelete}
                title="Delete Bill"
                confirmButtonText="Delete"
                confirmButtonVariant="danger"
            >
                Are you sure you want to delete this bill? This action cannot be undone.
            </ConfirmationModal>
        </>
    );
};

interface UpsertModalProps { isOpen: boolean; onClose: () => void; onSubmit: (data: any) => void; vendors: Vendor[]; bill: Bill | null; }

const UpsertBillModal: React.FC<UpsertModalProps> = ({ isOpen, onClose, onSubmit, vendors, bill }) => {
    const [vendorId, setVendorId] = useState(bill?.vendorId || (vendors[0]?.id || ''));
    const [date, setDate] = useState(bill?.date || new Date().toISOString().split('T')[0]);
    const [dueDate, setDueDate] = useState(bill?.dueDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
    const [lineItems, setLineItems] = useState<LineItem[]>(bill?.lineItems || []);
    const [totals, setTotals] = useState({ subTotal: bill?.subTotal || 0, tax: bill?.tax || 0, total: bill?.total || 0 });

    const vendorOptions: DropdownOption[] = vendors.map(v => ({ value: v.id, label: v.name }));

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={bill ? "Edit Bill" : "New Bill"}>
            <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                    <div className="col-span-2">
                        <label className="block text-sm font-medium">Vendor</label>
                        <Dropdown options={vendorOptions} value={vendorId} onChange={setVendorId} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium">Date</label>
                        <DatePicker value={date} onChange={setDate} />
                    </div>
                </div>
                <div>
                     <label className="block text-sm font-medium">Due Date</label>
                     <DatePicker value={dueDate} onChange={setDueDate} />
                </div>
                <LineItemEditor items={lineItems} onItemsChange={setLineItems} onTotalsChange={setTotals} />
                <div className="pt-4 flex justify-end gap-2">
                    <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
                    <Button onClick={() => onSubmit({ vendorId, date, dueDate, lineItems, totals })}>{bill ? 'Save Changes' : 'Create Bill'}</Button>
                </div>
            </div>
        </Modal>
    );
};

interface RecordPaymentProps { isOpen: boolean; onClose: () => void; bill: Bill; onRecordPayment: (billId: string, details: any) => void; }

const RecordBillPaymentModal: React.FC<RecordPaymentProps> = ({ isOpen, onClose, bill, onRecordPayment }) => {
    const [amount, setAmount] = useState(String(bill.total));
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [method, setMethod] = useState<PaymentMade['method']>('Bank Transfer');
    const methodOptions: DropdownOption[] = [{ value: 'Bank Transfer', label: 'Bank Transfer' }, { value: 'Credit Card', label: 'Credit Card' }, { value: 'PayPal', label: 'PayPal' }];

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`Record Payment for Bill #${bill.billId}`}>
            <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                     <div>
                        <label className="block text-sm font-medium">Amount</label>
                        <input type="number" value={amount} onChange={e => setAmount(e.target.value)} className="mt-1 block w-full input-style" />
                    </div>
                     <div>
                        <label className="block text-sm font-medium">Payment Date</label>
                        <DatePicker value={date} onChange={setDate} />
                    </div>
                </div>
                 <div>
                    <label className="block text-sm font-medium">Payment Method</label>
                    <Dropdown options={methodOptions} value={method} onChange={(v) => setMethod(v as any)} />
                </div>
                <div className="pt-4 flex justify-end gap-2">
                    <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
                    <Button onClick={() => { onRecordPayment(bill.id, { amount: parseFloat(amount), date, method }); onClose(); }}>Record Payment</Button>
                </div>
            </div>
        </Modal>
    );
}


export default BillsPage;
