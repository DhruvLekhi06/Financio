




import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../../../components/shared/Card';
import Button from '../../../components/shared/Button';
import Modal from '../../../components/shared/Modal';
import Spinner from '../../../components/shared/Spinner';
import ActionsDropdown from '../../../components/shared/ActionsDropdown';
import LineItemEditor from '../../../components/shared/LineItemEditor';
import { useData } from '../../../hooks/useData';
import { formatCurrency, formatDate } from '../../../utils/helpers';
import type { SalesOrder, LineItem, Customer } from '../../../types';
import Dropdown, { DropdownOption } from '../../../components/shared/Dropdown';
import ConfirmationModal from '../../../components/shared/ConfirmationModal';
import DatePicker from '../../../components/shared/DatePicker';

const getStatusPill = (status: SalesOrder['status']) => {
    const baseClasses = "px-2.5 py-0.5 text-xs font-medium rounded-full";
    switch (status) {
        case 'Draft': return <span className={`${baseClasses} bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300`}>Draft</span>;
        case 'Sent': return <span className={`${baseClasses} bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300`}>Sent</span>;
        case 'Fulfilled': return <span className={`${baseClasses} bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-300`}>Fulfilled</span>;
        case 'Invoiced': return <span className={`${baseClasses} bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300`}>Invoiced</span>;
        case 'Cancelled': return <span className={`${baseClasses} bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300`}>Cancelled</span>;
        default: return null;
    }
};

const SalesOrdersPage: React.FC = () => {
    const { salesOrders, customers, addItem, updateItem, deleteItem, convertSalesOrderToInvoice, isLoading } = useData();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingOrder, setEditingOrder] = useState<SalesOrder | null>(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [deletingOrderId, setDeletingOrderId] = useState<string | null>(null);
    const [isConvertModalOpen, setIsConvertModalOpen] = useState(false);
    const [convertingOrderId, setConvertingOrderId] = useState<string | null>(null);
    const navigate = useNavigate();

    const openModal = (order: SalesOrder | null = null) => {
        setEditingOrder(order);
        setIsModalOpen(true);
    };

    const handleFormSubmit = (formData: { customerId: string; date: string; lineItems: LineItem[]; totals: { subTotal: number, tax: number, total: number } }) => {
        const customer = customers.find(c => c.id === formData.customerId);
        // FIX: Added missing 'notes' and 'shippingAddress' properties to satisfy the SalesOrder type.
        const orderData = {
            orderId: `#SO-${salesOrders.length + 103}`,
            customerId: formData.customerId,
            date: formData.date,
            lineItems: formData.lineItems,
            status: 'Draft' as const,
            shippingAddress: customer?.shippingAddress || '',
            notes: '',
            ...formData.totals
        };
        
        if (editingOrder) {
            updateItem<SalesOrder>('salesOrders', editingOrder.id, { ...orderData, orderId: editingOrder.orderId, status: editingOrder.status });
        } else {
            addItem<SalesOrder>('salesOrders', orderData);
        }
        setIsModalOpen(false);
        setEditingOrder(null);
    };

    const handleDelete = (id: string) => {
        setDeletingOrderId(id);
        setIsDeleteModalOpen(true);
    };
    
    const confirmDelete = () => {
        if (deletingOrderId) {
            deleteItem('salesOrders', deletingOrderId);
        }
        setIsDeleteModalOpen(false);
        setDeletingOrderId(null);
    };

    const handleConvert = (id: string) => {
        setConvertingOrderId(id);
        setIsConvertModalOpen(true);
    };
    
    const confirmConvert = () => {
        if (convertingOrderId) {
            convertSalesOrderToInvoice(convertingOrderId);
            navigate('/sales/invoices');
        }
        setIsConvertModalOpen(false);
        setConvertingOrderId(null);
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
                    <h2 className="text-lg font-plex font-bold text-gray-800 dark:text-white">Sales Orders</h2>
                    <Button onClick={() => openModal()} disabled={customers.length === 0}>New Sales Order</Button>
                </div>
                {isLoading ? (
                    <div className="flex justify-center items-center h-48"><Spinner /></div>
                ) : salesOrders.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-gray-700 dark:text-gray-400 uppercase bg-gray-50 dark:bg-gray-700">
                                <tr>
                                    <th scope="col" className="px-6 py-3">Order ID</th>
                                    <th scope="col" className="px-6 py-3">Customer</th>
                                    <th scope="col" className="px-6 py-3">Date</th>
                                    <th scope="col" className="px-6 py-3">Status</th>
                                    <th scope="col" className="px-6 py-3 text-right">Amount</th>
                                    <th scope="col" className="px-6 py-3 text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {salesOrders.map((order) => (
                                    <tr key={order.id} className="bg-white dark:bg-gray-800 border-b dark:border-gray-700">
                                        <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{order.orderId}</td>
                                        <td className="px-6 py-4">{customerNameMap[order.customerId] || 'N/A'}</td>
                                        <td className="px-6 py-4">{formatDate(order.date)}</td>
                                        <td className="px-6 py-4">{getStatusPill(order.status)}</td>
                                        <td className="px-6 py-4 text-right font-mono">{formatCurrency(order.total)}</td>
                                        <td className="px-6 py-4 text-center">
                                            <div className="flex items-center justify-center gap-2">
                                                {order.status !== 'Invoiced' && order.status !== 'Cancelled' && (
                                                    <Button size="sm" onClick={() => handleConvert(order.id)}>Convert to Invoice</Button>
                                                )}
                                                <ActionsDropdown
                                                    onEdit={() => openModal(order)}
                                                    onDelete={() => handleDelete(order.id)}
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
                        <h3 className="text-lg font-plex font-bold text-gray-900 dark:text-white">No sales orders yet</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            {customers.length > 0 ? "Create your first sales order to track customer agreements." : "Please add a customer before creating a sales order."}
                        </p>
                        {customers.length > 0 && <Button className="mt-4" onClick={() => openModal()}>Create Sales Order</Button>}
                    </div>
                )}
            </Card>

            {isModalOpen && (
                <UpsertSalesOrderModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onSubmit={handleFormSubmit}
                    customers={customers}
                    order={editingOrder}
                />
            )}
            <ConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={confirmDelete}
                title="Delete Sales Order"
                confirmButtonText="Delete"
                confirmButtonVariant="danger"
            >
                Are you sure you want to delete this sales order? This action cannot be undone.
            </ConfirmationModal>
            <ConfirmationModal
                isOpen={isConvertModalOpen}
                onClose={() => setIsConvertModalOpen(false)}
                onConfirm={confirmConvert}
                title="Convert to Invoice"
                confirmButtonText="Convert"
            >
                Are you sure you want to convert this sales order to an invoice? This will create a new draft invoice.
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
    order: SalesOrder | null;
}

const UpsertSalesOrderModal: React.FC<UpsertModalProps> = ({ isOpen, onClose, onSubmit, customers, order }) => {
    const [customerId, setCustomerId] = useState(order?.customerId || (customers.length > 0 ? customers[0].id : ''));
    const [date, setDate] = useState(order?.date || new Date().toISOString().split('T')[0]);
    const [lineItems, setLineItems] = useState<LineItem[]>(order?.lineItems || []);
    const [totals, setTotals] = useState({ subTotal: order?.subTotal || 0, tax: order?.tax || 0, total: order?.total || 0 });

    const customerOptions: DropdownOption[] = customers.map(c => ({ value: c.id, label: c.name }));

    const handleSubmit = () => {
        onSubmit({ customerId, date, lineItems, totals });
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={order ? "Edit Sales Order" : "New Sales Order"}>
            <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium">Customer</label>
                        <Dropdown options={customerOptions} value={customerId} onChange={setCustomerId} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium">Date</label>
                        <DatePicker value={date} onChange={setDate} />
                    </div>
                </div>
                <LineItemEditor 
                    items={lineItems} 
                    onItemsChange={setLineItems} 
                    onTotalsChange={setTotals} 
                />
                <div className="pt-4 flex justify-end gap-2">
                    <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
                    <Button onClick={handleSubmit}>{order ? 'Save Changes' : 'Create Order'}</Button>
                </div>
            </div>
        </Modal>
    );
};


export default SalesOrdersPage;
