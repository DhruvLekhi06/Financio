


import React, { useState } from 'react';
import Card from '../../../components/shared/Card';
import Button from '../../../components/shared/Button';
import Spinner from '../../../components/shared/Spinner';
import ActionsDropdown from '../../../components/shared/ActionsDropdown';
import RecordPaymentModal from '../../../components/shared/RecordPaymentModal';
import { useData } from '../../../hooks/useData';
import { formatCurrency, formatDate } from '../../../utils/helpers';
import type { PaymentReceived } from '../../../types';
import ConfirmationModal from '../../../components/shared/ConfirmationModal';

const PaymentsReceivablePage: React.FC = () => {
    const { paymentsReceived, invoices, deleteItem, recordPayment, isLoading } = useData();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [deletingPaymentId, setDeletingPaymentId] = useState<string | null>(null);
    
    // We only allow logging payments against an existing invoice.
    const unpaidInvoices = invoices.filter(inv => inv.status !== 'Paid' && inv.status !== 'Cancelled');

    const handleDelete = (id: string) => {
        setDeletingPaymentId(id);
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = () => {
        if (deletingPaymentId) {
            deleteItem('paymentsReceived', deletingPaymentId);
        }
        setIsDeleteModalOpen(false);
        setDeletingPaymentId(null);
    };

    return (
        <>
            <Card>
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-lg font-plex font-bold text-gray-800 dark:text-white">Payments Receivable</h2>
                    <Button onClick={() => setIsModalOpen(true)} disabled={unpaidInvoices.length === 0}>Log Payment</Button>
                </div>
                {isLoading ? (
                    <div className="flex justify-center items-center h-48"><Spinner /></div>
                ) : paymentsReceived.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-gray-700 dark:text-gray-400 uppercase bg-gray-50 dark:bg-gray-700">
                                <tr>
                                    <th scope="col" className="px-6 py-3">Payment ID</th>
                                    <th scope="col" className="px-6 py-3">Customer</th>
                                    <th scope="col" className="px-6 py-3">Date</th>
                                    <th scope="col" className="px-6 py-3">Method</th>
                                    <th scope="col" className="px-6 py-3 text-right">Amount</th>
                                    <th scope="col" className="px-6 py-3 text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {paymentsReceived.map((payment) => (
                                    <tr key={payment.id} className="bg-white dark:bg-gray-800 border-b dark:border-gray-700">
                                        <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{payment.paymentId}</td>
                                        <td className="px-6 py-4">{payment.customerName}</td>
                                        <td className="px-6 py-4">{formatDate(payment.date)}</td>
                                        <td className="px-6 py-4">{payment.method}</td>
                                        <td className="px-6 py-4 text-right font-mono text-green-500">{formatCurrency(payment.amount)}</td>
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
                        <h3 className="text-lg font-plex font-bold text-gray-900 dark:text-white">No payments received yet</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Log your first incoming payment to see it here.</p>
                        <Button className="mt-4" onClick={() => setIsModalOpen(true)} disabled={unpaidInvoices.length === 0}>Log Payment</Button>
                        {unpaidInvoices.length === 0 && <p className="text-xs text-gray-400 mt-2">You must have an unpaid invoice to log a payment.</p>}
                    </div>
                )}
            </Card>

            {isModalOpen && unpaidInvoices.length > 0 && (
                 <RecordPaymentModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    invoice={unpaidInvoices[0]}
                    onRecordPayment={recordPayment}
                    allowInvoiceChange={true}
                />
            )}
            <ConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={confirmDelete}
                title="Delete Payment"
                confirmButtonText="Delete"
                confirmButtonVariant="danger"
            >
                Deleting a payment will not automatically update the invoice status. Are you sure you want to delete this payment record?
            </ConfirmationModal>
        </>
    );
};

export default PaymentsReceivablePage;
