

import React, { useState, useMemo } from 'react';
import Card from '../../../components/shared/Card';
import Button from '../../../components/shared/Button';
import Spinner from '../../../components/shared/Spinner';
import ActionsDropdown from '../../../components/shared/ActionsDropdown';
import Modal from '../../../components/shared/Modal';
import Dropdown, { DropdownOption } from '../../../components/shared/Dropdown';
import { useData } from '../../../hooks/useData';
import { formatCurrency, formatDate } from '../../../utils/helpers';
import type { PaymentMade, Bill } from '../../../types';
import ConfirmationModal from '../../../components/shared/ConfirmationModal';

const PaymentsMadePage: React.FC = () => {
    const { paymentsMade, vendors, bills, recordBillPayment, deleteItem, isLoading } = useData();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [deletingPaymentId, setDeletingPaymentId] = useState<string | null>(null);
    
    const unpaidBills = bills.filter(b => b.status !== 'Paid');
    const vendorNameMap = useMemo(() => vendors.reduce((acc, v) => ({ ...acc, [v.id]: v.name }), {} as Record<string, string>), [vendors]);

    const handleDelete = (id: string) => {
        setDeletingPaymentId(id);
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = () => {
        if (deletingPaymentId) {
            deleteItem('paymentsMade', deletingPaymentId);
        }
        setIsDeleteModalOpen(false);
        setDeletingPaymentId(null);
    };

    return (
        <>
            <Card>
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-lg font-plex font-bold text-gray-800 dark:text-white">Payments Made</h2>
                    <Button onClick={() => setIsModalOpen(true)} disabled={unpaidBills.length === 0}>Log Payment</Button>
                </div>
                {isLoading ? (
                    <div className="flex justify-center items-center h-48"><Spinner /></div>
                ) : paymentsMade.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-gray-700 dark:text-gray-400 uppercase bg-gray-50 dark:bg-gray-700">
                                <tr>
                                    <th scope="col" className="px-6 py-3">Payment ID</th>
                                    <th scope="col" className="px-6 py-3">Vendor</th>
                                    <th scope="col" className="px-6 py-3">Date</th>
                                    <th scope="col" className="px-6 py-3">Method</th>
                                    <th scope="col" className="px-6 py-3 text-right">Amount</th>
                                    <th scope="col" className="px-6 py-3 text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {paymentsMade.map((payment) => (
                                    <tr key={payment.id} className="bg-white dark:bg-gray-800 border-b dark:border-gray-700">
                                        <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{payment.paymentId}</td>
                                        <td className="px-6 py-4">{vendorNameMap[payment.vendorId]}</td>
                                        <td className="px-6 py-4">{formatDate(payment.date)}</td>
                                        <td className="px-6 py-4">{payment.method}</td>
                                        <td className="px-6 py-4 text-right font-mono text-red-500">{formatCurrency(payment.amount)}</td>
                                        <td className="px-6 py-4 text-center">
                                            <ActionsDropdown
                                                onEdit={() => alert('Editing payments is not yet supported.')}
                                                onDelete={() => handleDelete(payment.id)}
                                            />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <h3 className="text-lg font-plex font-bold text-gray-900 dark:text-white">No payments made yet</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Log your first outgoing payment to see it here.</p>
                        <Button className="mt-4" onClick={() => setIsModalOpen(true)} disabled={unpaidBills.length === 0}>Log Payment</Button>
                        {unpaidBills.length === 0 && <p className="text-xs text-gray-400 mt-2">You must have an unpaid bill to log a payment.</p>}
                    </div>
                )}
            </Card>

            {isModalOpen && unpaidBills.length > 0 && (
                <RecordPaymentForBillModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    bills={unpaidBills}
                    onRecordPayment={recordBillPayment}
                />
            )}
            <ConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={confirmDelete}
                title="Delete Payment Record"
                confirmButtonText="Delete"
                confirmButtonVariant="danger"
            >
                Deleting this payment will not revert the associated bill's status. Are you sure you want to delete this payment record?
            </ConfirmationModal>
        </>
    );
};

interface RecordPaymentModalProps { isOpen: boolean; onClose: () => void; bills: Bill[]; onRecordPayment: (billId: string, details: any) => void; }

const RecordPaymentForBillModal: React.FC<RecordPaymentModalProps> = ({ isOpen, onClose, bills, onRecordPayment }) => {
    const [selectedBillId, setSelectedBillId] = useState(bills[0].id);
    const selectedBill = useMemo(() => bills.find(b => b.id === selectedBillId) || bills[0], [bills, selectedBillId]);
    
    const [amount, setAmount] = useState(String(selectedBill.total));
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [method, setMethod] = useState<PaymentMade['method']>('Bank Transfer');

    React.useEffect(() => {
        setAmount(String(selectedBill.total));
    }, [selectedBill]);

    const billOptions = bills.map(b => ({ value: b.id, label: `${b.billId} - ${formatCurrency(b.total)}` }));
    const methodOptions: DropdownOption[] = [{ value: 'Bank Transfer', label: 'Bank Transfer' }, { value: 'Credit Card', label: 'Credit Card' }, { value: 'PayPal', label: 'PayPal' }];

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Log Payment Made">
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium">For Bill</label>
                    <Dropdown options={billOptions} value={selectedBillId} onChange={setSelectedBillId} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                     <div>
                        <label className="block text-sm font-medium">Amount</label>
                        <input type="number" value={amount} onChange={e => setAmount(e.target.value)} className="mt-1 block w-full input-style" />
                    </div>
                     <div>
                        <label className="block text-sm font-medium">Payment Date</label>
                        <input type="date" value={date} onChange={e => setDate(e.target.value)} className="mt-1 block w-full input-style" />
                    </div>
                </div>
                 <div>
                    <label className="block text-sm font-medium">Payment Method</label>
                    <Dropdown options={methodOptions} value={method} onChange={(v) => setMethod(v as any)} />
                </div>
                <div className="pt-4 flex justify-end gap-2">
                    <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
                    <Button onClick={() => { onRecordPayment(selectedBillId, { amount: parseFloat(amount), date, method }); onClose(); }}>Log Payment</Button>
                </div>
            </div>
        </Modal>
    );
};

export default PaymentsMadePage;