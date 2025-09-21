




import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Card from '../../../components/shared/Card';
import Button from '../../../components/shared/Button';
import Spinner from '../../../components/shared/Spinner';
import Modal from '../../../components/shared/Modal';
import ActionsDropdown from '../../../components/shared/ActionsDropdown';
import { useData } from '../../../hooks/useData';
import { exportToCsv } from '../../../utils/helpers';
import { DownloadIcon, VendorsIcon } from '../../../components/Icons';
import type { Vendor } from '../../../types';
import ConfirmationModal from '../../../components/shared/ConfirmationModal';

const VendorsPage: React.FC = () => {
    const { vendors, addItem, updateItem, deleteItem, isLoading } = useData();
    const [isUpsertModalOpen, setIsUpsertModalOpen] = useState(false);
    const [editingVendor, setEditingVendor] = useState<Vendor | null>(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [deletingVendorId, setDeletingVendorId] = useState<string | null>(null);
    
    const handleExport = () => {
        if (vendors.length > 0) {
            exportToCsv('vendors.csv', vendors);
        }
    }

    const openUpsertModal = (vendor: Vendor | null = null) => {
        setEditingVendor(vendor);
        setIsUpsertModalOpen(true);
    };

    const handleFormSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        const vendorData = {
            name: formData.get('name') as string,
            email: formData.get('email') as string,
            phone: formData.get('phone') as string,
            address: formData.get('address') as string,
            paymentTerms: formData.get('paymentTerms') as string,
        };
        
        if (editingVendor) {
            updateItem<Vendor>('vendors', editingVendor.id, vendorData);
        } else {
            addItem<Vendor>('vendors', { 
              ...vendorData,
              dependencyRisk: 0,
              totalSpent: 0,
            });
        }
        setIsUpsertModalOpen(false);
        setEditingVendor(null);
    };

    const handleDelete = (id: string) => {
        setDeletingVendorId(id);
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = () => {
        if (deletingVendorId) {
            deleteItem('vendors', deletingVendorId);
        }
        setIsDeleteModalOpen(false);
        setDeletingVendorId(null);
    };

  return (
    <>
    <Card>
        <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-plex font-bold text-gray-800 dark:text-white">Your Vendors</h2>
            <div className="flex gap-2">
                <Button onClick={handleExport} variant="secondary" disabled={vendors.length === 0}>
                    <DownloadIcon className="w-4 h-4 mr-2" />
                    Export CSV
                </Button>
                <Button onClick={() => openUpsertModal()}>Add Vendor</Button>
            </div>
        </div>
        {isLoading ? (
            <div className="flex justify-center items-center h-48"><Spinner /></div>
        ) : vendors.length > 0 ? (
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
                        {vendors.map((vendor) => (
                            <tr key={vendor.id} className="bg-white dark:bg-gray-800 border-b dark:border-gray-700">
                                <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                                    <Link to={`/purchases/vendors/${vendor.id}`} className="hover:underline text-secondary-600 dark:text-secondary-400">
                                        {vendor.name}
                                    </Link>
                                </td>
                                <td className="px-6 py-4">{vendor.email}</td>
                                <td className="px-6 py-4">{vendor.phone}</td>
                                <td className="px-6 py-4 text-right">
                                    <ActionsDropdown
                                        onEdit={() => openUpsertModal(vendor)}
                                        onDelete={() => handleDelete(vendor.id)}
                                    />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        ) : (
            <div className="text-center py-12">
                <VendorsIcon className="mx-auto w-12 h-12 text-gray-400" />
                <h3 className="font-plex font-bold text-lg text-gray-900 dark:text-white mt-2">No vendors yet</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Add your first vendor to see their details here.</p>
                <Button className="mt-4" onClick={() => openUpsertModal()}>Add a Vendor</Button>
            </div>
        )}
    </Card>

    <Modal isOpen={isUpsertModalOpen} onClose={() => setIsUpsertModalOpen(false)} title={editingVendor ? 'Edit Vendor' : 'Add New Vendor'}>
        <form onSubmit={handleFormSubmit} className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Vendor Name</label>
                <input type="text" name="name" required defaultValue={editingVendor?.name} className="mt-1 block w-full input-style" />
            </div>
            <div className="grid grid-cols-2 gap-4">
                 <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
                    <input type="email" name="email" required defaultValue={editingVendor?.email} className="mt-1 block w-full input-style" />
                </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Phone</label>
                    <input type="tel" name="phone" defaultValue={editingVendor?.phone} className="mt-1 block w-full input-style" />
                </div>
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Address</label>
                <textarea name="address" rows={3} defaultValue={editingVendor?.address} className="mt-1 block w-full input-style"></textarea>
            </div>
             <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Payment Terms</label>
                <input type="text" name="paymentTerms" defaultValue={editingVendor?.paymentTerms || 'Net 30'} className="mt-1 block w-full input-style" />
            </div>
            
            <div className="pt-4 flex justify-end gap-2">
                <Button type="button" variant="secondary" onClick={() => setIsUpsertModalOpen(false)}>Cancel</Button>
                <Button type="submit">{editingVendor ? 'Save Changes' : 'Add Vendor'}</Button>
            </div>
        </form>
    </Modal>
    <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        title="Delete Vendor"
        confirmButtonText="Delete"
        confirmButtonVariant="danger"
    >
        Are you sure you want to delete this vendor? This will not delete their associated bills or payments.
    </ConfirmationModal>
    </>
  );
};

export default VendorsPage;
