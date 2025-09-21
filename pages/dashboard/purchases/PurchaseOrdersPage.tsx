


import React, { useState, useMemo } from 'react';
import Card from '../../../components/shared/Card';
import Button from '../../../components/shared/Button';
import Modal from '../../../components/shared/Modal';
import Spinner from '../../../components/shared/Spinner';
import ActionsDropdown from '../../../components/shared/ActionsDropdown';
import LineItemEditor from '../../../components/shared/LineItemEditor';
import { useData } from '../../../hooks/useData';
import { formatCurrency, formatDate } from '../../../utils/helpers';
import type { PurchaseOrder, LineItem, Vendor } from '../../../types';
import Dropdown, { DropdownOption } from '../../../components/shared/Dropdown';
import { useNavigate } from 'react-router-dom';
import ConfirmationModal from '../../../components/shared/ConfirmationModal';
import DatePicker from '../../../components/shared/DatePicker';

const getStatusPill = (status: PurchaseOrder['status']) => {
    const baseClasses = "px-2.5 py-0.5 text-xs font-medium rounded-full";
    switch (status) {
        case 'Draft': return <span className={`${baseClasses} bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300`}>Draft</span>;
        case 'Sent': return <span className={`${baseClasses} bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300`}>Sent</span>;
        case 'Received': return <span className={`${baseClasses} bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-300`}>Received</span>;
        case 'Billed': return <span className={`${baseClasses} bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300`}>Billed</span>;
        case 'Cancelled': return <span className={`${baseClasses} bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300`}>Cancelled</span>;
        default: return null;
    }
};

const PurchaseOrdersPage: React.FC = () => {
    const { purchaseOrders, vendors, addItem, updateItem, deleteItem, convertPurchaseOrderToBill, isLoading } = useData();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingOrder, setEditingOrder] = useState<PurchaseOrder | null>(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [deletingOrderId, setDeletingOrderId] = useState<string | null>(null);
    const [isConvertModalOpen, setIsConvertModalOpen] = useState(false);
    const [convertingOrderId, setConvertingOrderId] = useState<string | null>(null);
    const navigate = useNavigate();

    const openModal = (order: PurchaseOrder | null = null) => {
        setEditingOrder(order);
        setIsModalOpen(true);
    };

    const handleFormSubmit = (formData: any) => {
        const orderData = {
            orderId: `#PO-${purchaseOrders.length + 503}`,
            vendorId: formData.vendorId,
            date: formData.date,
            deliveryDate: formData.deliveryDate,
            lineItems: formData.lineItems,
            status: 'Draft' as const,
            shippingAddress: '',
            notes: '',
            ...formData.totals
        };
        
        if (editingOrder) {
            updateItem<PurchaseOrder>('purchaseOrders', editingOrder.id, { ...orderData, orderId: editingOrder.orderId, status: editingOrder.status });
        } else {
            addItem<PurchaseOrder>('purchaseOrders', orderData);
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
            deleteItem('purchaseOrders', deletingOrderId);
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
            convertPurchaseOrderToBill(convertingOrderId);
            navigate('/purchases/bills');
        }
        setIsConvertModalOpen(false);
        setConvertingOrderId(null);
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
                    <h2 className="text-lg font-plex font-bold text-gray-800 dark:text-white">Purchase Orders</h2>
                    <Button onClick={() => openModal()} disabled={vendors.length === 0}>New Purchase Order</Button>
                </div>
                {isLoading ? (
                    <div className="flex justify-center items-center h-48"><Spinner /></div>
                ) : purchaseOrders.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-gray-700 dark:text-gray-400 uppercase bg-gray-50 dark:bg-gray-700">
                                <tr>
                                    <th scope="col" className="px-6 py-3">Order ID</th>
                                    <th scope="col" className="px-6 py-3">Vendor</th>
                                    <th scope="col" className="px-6 py-3">Date</th>
                                    <th scope="col" className="px-6 py-3">Status</th>
                                    <th scope="col" className="px-6 py-3 text-right">Amount</th>
                                    <th scope="col" className="px-6 py-3 text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {purchaseOrders.map((order) => (
                                    <tr key={order.id} className="bg-white dark:bg-gray-800 border-b dark:border-gray-700">
                                        <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{order.orderId}</td>
                                        <td className="px-6 py-4">{vendorNameMap[order.vendorId] || 'N/A'}</td>
                                        <td className="px-6 py-4">{formatDate(order.date)}</td>
                                        <td className="px-6 py-4">{getStatusPill(order.status)}</td>
                                        <td className="px-6 py-4 text-right font-mono">{formatCurrency(order.total)}</td>
                                        <td className="px-6 py-4 text-center">
                                            <div className="flex items-center justify-center gap-2">
                                                {order.status !== 'Billed' && order.status !== 'Cancelled' && (
                                                    <Button size="sm" onClick={() => handleConvert(order.id)}>Convert to Bill</Button>
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
                        <h3 className="text-lg font-plex font-bold text-gray-900 dark:text-white">No purchase orders yet</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            {vendors.length > 0 ? "Create your first PO to track agreements with vendors." : "Please add a vendor before creating a PO."}
                        </p>
                        {vendors.length > 0 && <Button className="mt-4" onClick={() => openModal()}>Create Purchase Order</Button>}
                    </div>
                )}
            </Card>
            {isModalOpen && (
                <UpsertPOModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSubmit={handleFormSubmit} vendors={vendors} order={editingOrder} />
            )}
            <ConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={confirmDelete}
                title="Delete Purchase Order"
                confirmButtonText="Delete"
                confirmButtonVariant="danger"
            >
                Are you sure you want to delete this purchase order? This action cannot be undone.
            </ConfirmationModal>
            <ConfirmationModal
                isOpen={isConvertModalOpen}
                onClose={() => setIsConvertModalOpen(false)}
                onConfirm={confirmConvert}
                title="Convert to Bill"
                confirmButtonText="Convert"
            >
                Are you sure you want to convert this PO to a bill? This will create a new draft bill.
            </ConfirmationModal>
        </>
    );
};

interface UpsertModalProps { isOpen: boolean; onClose: () => void; onSubmit: (data: any) => void; vendors: Vendor[]; order: PurchaseOrder | null; }

const UpsertPOModal: React.FC<UpsertModalProps> = ({ isOpen, onClose, onSubmit, vendors, order }) => {
    const [vendorId, setVendorId] = useState(order?.vendorId || (vendors.length > 0 ? vendors[0].id : ''));
    const [date, setDate] = useState(order?.date || new Date().toISOString().split('T')[0]);
    const [deliveryDate, setDeliveryDate] = useState(order?.deliveryDate || new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
    const [lineItems, setLineItems] = useState<LineItem[]>(order?.lineItems || []);
    const [totals, setTotals] = useState({ subTotal: order?.subTotal || 0, tax: order?.tax || 0, total: order?.total || 0 });

    const vendorOptions: DropdownOption[] = vendors.map(v => ({ value: v.id, label: v.name }));

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={order ? "Edit Purchase Order" : "New Purchase Order"}>
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
                     <label className="block text-sm font-medium">Expected Delivery Date</label>
                     <DatePicker value={deliveryDate} onChange={setDeliveryDate} />
                </div>
                <LineItemEditor items={lineItems} onItemsChange={setLineItems} onTotalsChange={setTotals} />
                <div className="pt-4 flex justify-end gap-2">
                    <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
                    <Button onClick={() => onSubmit({ vendorId, date, deliveryDate, lineItems, totals })}>{order ? 'Save Changes' : 'Create Order'}</Button>
                </div>
            </div>
        </Modal>
    );
};

export default PurchaseOrdersPage;
