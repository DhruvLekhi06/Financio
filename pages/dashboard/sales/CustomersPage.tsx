


import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Card from '../../../components/shared/Card';
import Button from '../../../components/shared/Button';
import Spinner from '../../../components/shared/Spinner';
import Modal from '../../../components/shared/Modal';
import ActionsDropdown from '../../../components/shared/ActionsDropdown';
import { useData } from '../../../hooks/useData';
import { exportToCsv } from '../../../utils/helpers';
import { DownloadIcon, UsersIcon } from '../../../components/Icons';
import type { Customer } from '../../../types';
import ConfirmationModal from '../../../components/shared/ConfirmationModal';

const CustomersPage: React.FC = () => {
    const { customers, addItem, updateItem, deleteItem, isLoading } = useData();
    const [isUpsertModalOpen, setIsUpsertModalOpen] = useState(false);
    const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [deletingCustomerId, setDeletingCustomerId] = useState<string | null>(null);
    
    const handleExport = () => {
        if (customers.length > 0) {
            exportToCsv('customers.csv', customers);
        }
    }

    const openUpsertModal = (customer: Customer | null = null) => {
        setEditingCustomer(customer);
        setIsUpsertModalOpen(true);
    };

    const handleFormSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        const customerData = {
            name: formData.get('name') as string,
            email: formData.get('email') as string,
            phone: formData.get('phone') as string,
            billingAddress: formData.get('billingAddress') as string,
            shippingAddress: formData.get('shippingAddress') as string,
        };
        
        if (editingCustomer) {
            updateItem<Customer>('customers', editingCustomer.id, customerData);
        } else {
            // FIX: Add missing properties `reliabilityScore` and `overduePayments` with default values for new customers to satisfy the Customer type.
            addItem<Customer>('customers', {
                ...customerData,
                reliabilityScore: 100,
                overduePayments: 0,
            });
        }
        setIsUpsertModalOpen(false);
        setEditingCustomer(null);
    };

    const handleDelete = (id: string) => {
        setDeletingCustomerId(id);
        setIsDeleteModalOpen(true);
    }
    
    const confirmDelete = () => {
        if (deletingCustomerId) {
            deleteItem('customers', deletingCustomerId);
        }
        setIsDeleteModalOpen(false);
        setDeletingCustomerId(null);
    };


  return (
    <>
    <Card>
        <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-plex font-bold text-gray-800 dark:text-white">Your Customers</h2>
            <div className="flex gap-2">
                <Button onClick={handleExport} variant="secondary" disabled={customers.length === 0}>
                    <DownloadIcon className="w-4 h-4 mr-2" />
                    Export CSV
                </Button>
                <Button onClick={() => openUpsertModal()}>Add Customer</Button>
            </div>
        </div>
        {isLoading ? (
            <div className="flex justify-center items-center h-48"><Spinner /></div>
        ) : customers.length > 0 ? (
           <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="text-xs text-gray-700 dark:text-gray-400 uppercase bg-gray-50 dark:bg-gray-700">
                        <tr>
                            <th scope="col" className="px-6 py-3">Name</th>
                            <th scope="col" className="px-6 py-3">Email</th>
                            <th scope="col" className="px-6 py-3">Phone</th>
                            <th scope="col" className="px-6 py-3 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {customers.map((customer) => (
                            <tr key={customer.id} className="bg-white dark:bg-gray-800 border-b dark:border-gray-700">
                                <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                                    <Link to={`/sales/customers/${customer.id}`} className="hover:underline text-secondary-600 dark:text-secondary-400">
                                        {customer.name}
                                    </Link>
                                </td>
                                <td className="px-6 py-4">{customer.email}</td>
                                <td className="px-6 py-4">{customer.phone}</td>
                                <td className="px-6 py-4 text-right">
                                    <ActionsDropdown
                                        onEdit={() => openUpsertModal(customer)}
                                        onDelete={() => handleDelete(customer.id)}
                                    />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        ) : (
            <div className="text-center py-12">
                <UsersIcon className="mx-auto w-12 h-12 text-gray-400" />
                <h3 className="font-plex font-bold text-lg text-gray-900 dark:text-white mt-2">No customers yet</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Add your first customer to see their details here.</p>
                <Button className="mt-4" onClick={() => openUpsertModal()}>Add a Customer</Button>
            </div>
        )}
    </Card>

    <Modal isOpen={isUpsertModalOpen} onClose={() => setIsUpsertModalOpen(false)} title={editingCustomer ? 'Edit Customer' : 'Add New Customer'}>
        <form onSubmit={handleFormSubmit} className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Customer Name</label>
                <input type="text" name="name" required defaultValue={editingCustomer?.name} className="mt-1 block w-full input-style" />
            </div>
            <div className="grid grid-cols-2 gap-4">
                 <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
                    <input type="email" name="email" required defaultValue={editingCustomer?.email} className="mt-1 block w-full input-style" />
                </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Phone</label>
                    <input type="tel" name="phone" defaultValue={editingCustomer?.phone} className="mt-1 block w-full input-style" />
                </div>
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Billing Address</label>
                <textarea name="billingAddress" rows={3} defaultValue={editingCustomer?.billingAddress} className="mt-1 block w-full input-style"></textarea>
            </div>
             <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Shipping Address</label>
                <textarea name="shippingAddress" rows={3} defaultValue={editingCustomer?.shippingAddress} className="mt-1 block w-full input-style"></textarea>
            </div>
            
            <div className="pt-4 flex justify-end gap-2">
                <Button type="button" variant="secondary" onClick={() => setIsUpsertModalOpen(false)}>Cancel</Button>
                <Button type="submit">{editingCustomer ? 'Save Changes' : 'Add Customer'}</Button>
            </div>
        </form>
    </Modal>
    <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        title="Delete Customer"
        confirmButtonText="Delete"
        confirmButtonVariant="danger"
    >
        Are you sure you want to delete this customer? This will not delete their associated invoices or payments.
    </ConfirmationModal>
    </>
  );
};

export default CustomersPage;
