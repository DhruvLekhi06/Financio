




import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../../../components/shared/Card';
import Button from '../../../components/shared/Button';
import Modal from '../../../components/shared/Modal';
import Spinner from '../../../components/shared/Spinner';
import ActionsDropdown from '../../../components/shared/ActionsDropdown';
import RecordPaymentModal from '../../../components/shared/RecordPaymentModal';
import LineItemEditor from '../../../components/shared/LineItemEditor';
import { useData } from '../../../hooks/useData';
import { formatCurrency, formatDate } from '../../../utils/helpers';
import type { Invoice, Customer, LineItem } from '../../../types';
import Dropdown, { DropdownOption } from '../../../components/shared/Dropdown';
import ConfirmationModal from '../../../components/shared/ConfirmationModal';
import DatePicker from '../../../components/shared/DatePicker';

const getStatusPill = (status: Invoice['status']) => {
    const baseClasses = "px-2.5 py-0.5 text-xs font-medium rounded-full";
    switch (status) {
        case 'Paid': return <span className={`${baseClasses} bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300`}>Paid</span>;
        case 'Sent': return <span className={`${baseClasses} bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300`}>Sent</span>;
        case 'Draft': return <span className={`${baseClasses} bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300`}>Draft</span>;
        case 'Overdue': return <span className={`${baseClasses} bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300`}>Overdue</span>;
        case 'Cancelled': return <span className={`${baseClasses} bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300`}>Cancelled</span>;
        default: return null;
    }
};

const InvoicesPage: React.FC = () => {
    const { invoices, customers, addItem, updateItem, deleteItem, recordPayment, isLoading } = useData();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);
    const [paymentInvoice, setPaymentInvoice] = useState<Invoice | null>(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [deletingInvoiceId, setDeletingInvoiceId] = useState<string | null>(null);
    const navigate = useNavigate();

    const openModal = (invoice: Invoice | null = null) => {
        setEditingInvoice(invoice);
        setIsModalOpen(true);
    };

    const handleFormSubmit = (formData: { customerId: string; date: string; dueDate: string; lineItems: LineItem[]; totals: { subTotal: number, tax: number, total: number } }) => {
        const invoiceData = {
            invoiceId: `#INV-${invoices.length + 1004}`,
            customerId: formData.customerId,
            date: formData.date,
            dueDate: formData.dueDate,
            lineItems: formData.lineItems,
            status: 'Draft' as const,
            paymentTerms: 'Net 30',
            notes: '',
            ...formData.totals
        };
        
        if (editingInvoice) {
            updateItem<Invoice>('invoices', editingInvoice.id, { ...invoiceData, invoiceId: editingInvoice.invoiceId, status: editingInvoice.status });
        } else {
            addItem<Invoice>('invoices', invoiceData);
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
            deleteItem('invoices', deletingInvoiceId);
        }
        setIsDeleteModalOpen(false);
        setDeletingInvoiceId(null);
    };
    
    const handleDownload = (invoiceId: string) => {
        const url = `/#/invoice/print/${invoiceId}`;
        window.open(url, '_blank');
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
                    <h2 className="text-lg font-plex font-bold text-gray-800 dark:text-white">Invoices</h2>
                    <Button onClick={() => openModal()} disabled={customers.length === 0}>New Invoice</Button>
                </div>
                {isLoading ? (
                    <div className="flex justify-center items-center h-48"><Spinner /></div>
                ) : invoices.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-gray-700 dark:text-gray-400 uppercase bg-gray-50 dark:bg-gray-700">
                                <tr>
                                    <th scope="col" className="px-6 py-3">Invoice ID</th>
                                    <th scope="col" className="px-6 py-3">Customer</th>
                                    <th scope="col" className="px-6 py-3">Date</th>
                                    <th scope="col" className="px-6 py-3">Due Date</th>
                                    <th scope="col" className="px-6 py-3">Status</th>
                                    <th scope="col" className="px-6 py-3 text-right">Amount</th>
                                    <th scope="col" className="px-6 py-3 text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {invoices.map((invoice) => (
                                    <tr key={invoice.id} className="bg-white dark:bg-gray-800 border-b dark:border-gray-700">
                                        <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{invoice.invoiceId}</td>
                                        <td className="px-6 py-4">{customerNameMap[invoice.customerId] || 'N/A'}</td>
                                        <td className="px-6 py-4">{formatDate(invoice.date)}</td>
                                        <td className="px-6 py-4">{formatDate(invoice.dueDate)}</td>
                                        <td className="px-6 py-4">{getStatusPill(invoice.status)}</td>
                                        <td className="px-6 py-4 text-right font-mono">{formatCurrency(invoice.total)}</td>
                                        <td className="px-6 py-4 text-center">
                                            <div className="flex items-center justify-center gap-2">
                                                 {invoice.status !== 'Paid' && invoice.status !== 'Cancelled' && (
                                                    <Button size="sm" onClick={() => setPaymentInvoice(invoice)}>Record Payment</Button>
                                                )}
                                                <ActionsDropdown
                                                    onEdit={() => openModal(invoice)}
                                                    onDelete={() => handleDelete(invoice.id)}
                                                    onDownload={() => handleDownload(invoice.id)}
                                                />
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <h3 className="text-lg font-plex font-bold text-gray-900 dark:text-white">No invoices yet</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            {customers.length > 0 ? "Send your first invoice to get paid." : "Please add a customer before creating an invoice."}
                        </p>
                        {customers.length > 0 && <Button className="mt-4" onClick={() => openModal()}>Create Invoice</Button>}
                    </div>
                )}
            </Card>

            {isModalOpen && (
                <UpsertInvoiceModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onSubmit={handleFormSubmit}
                    customers={customers}
                    invoice={editingInvoice}
                />
            )}

            {paymentInvoice && (
                <RecordPaymentModal
                    isOpen={!!paymentInvoice}
                    onClose={() => setPaymentInvoice(null)}
                    invoice={paymentInvoice}
                    onRecordPayment={recordPayment}
                />
            )}

            <ConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={confirmDelete}
                title="Delete Invoice"
                confirmButtonText="Delete"
                confirmButtonVariant="danger"
            >
                Are you sure you want to delete this invoice? This action cannot be undone.
            </ConfirmationModal>
        </>
    );
};


// Upsert Modal Component
interface UpsertModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: any) => void;
    customers: Customer[];
    invoice: Invoice | null;
}

const UpsertInvoiceModal: React.FC<UpsertModalProps> = ({ isOpen, onClose, onSubmit, customers, invoice }) => {
    const [customerId, setCustomerId] = useState(invoice?.customerId || (customers.length > 0 ? customers[0].id : ''));
    const [date, setDate] = useState(invoice?.date || new Date().toISOString().split('T')[0]);
    const [dueDate, setDueDate] = useState(invoice?.dueDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
    const [lineItems, setLineItems] = useState<LineItem[]>(invoice?.lineItems || []);
    const [totals, setTotals] = useState({ subTotal: invoice?.subTotal || 0, tax: invoice?.tax || 0, total: invoice?.total || 0 });

    const customerOptions: DropdownOption[] = customers.map(c => ({ value: c.id, label: c.name }));

    const handleSubmit = () => {
        onSubmit({ customerId, date, dueDate, lineItems, totals });
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={invoice ? "Edit Invoice" : "New Invoice"}>
            <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                    <div className="col-span-2">
                        <label className="block text-sm font-medium">Customer</label>
                        <Dropdown options={customerOptions} value={customerId} onChange={setCustomerId} />
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
                <LineItemEditor 
                    items={lineItems} 
                    onItemsChange={setLineItems} 
                    onTotalsChange={setTotals} 
                />
                <div className="pt-4 flex justify-end gap-2">
                    <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
                    <Button onClick={handleSubmit}>{invoice ? 'Save Changes' : 'Create Invoice'}</Button>
                </div>
            </div>
        </Modal>
    );
};

export default InvoicesPage;
