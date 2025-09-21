
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import Card from '../../components/shared/Card';
import Button from '../../components/shared/Button';
import Spinner from '../../components/shared/Spinner';
import Modal from '../../components/shared/Modal';
import { useData } from '../../hooks/useData';
import { formatCurrency, exportToCsv } from '../../utils/helpers';
import { DownloadIcon } from '../../components/Icons';
import type { Vendor } from '../../types';

const COLORS = ['#334155', '#0d9488', '#f59e0b', '#2dd4bf', '#64748b'];

const DependencyRiskBar: React.FC<{ risk: number }> = ({ risk }) => {
    const colorClass = risk > 40 ? 'bg-red-500' : risk > 20 ? 'bg-yellow-500' : 'bg-green-500';
    return (
        <div className="w-full bg-gray-200 dark:bg-primary-700 rounded-full h-2.5">
            <div className={`${colorClass} h-2.5 rounded-full`} style={{ width: `${risk}%` }}></div>
        </div>
    );
}

const VendorAvatar: React.FC<{ vendor: Vendor }> = ({ vendor }) => {
    // FIX: Replaced non-existent 'logoUrl' with 'avatarUrl'.
    if (vendor.avatarUrl) {
        return <img src={vendor.avatarUrl} alt={vendor.name} className="w-10 h-10 object-contain rounded-full bg-white p-1" />;
    }
    
    const initial = vendor.name ? vendor.name.charAt(0).toUpperCase() : '?';
    const colors = ['bg-red-500', 'bg-green-500', 'bg-blue-500', 'bg-yellow-500', 'bg-indigo-500', 'bg-pink-500', 'bg-purple-500'];
    const colorIndex = (vendor.name.charCodeAt(0) || 0) % colors.length;
    const bgColor = colors[colorIndex];
    
    return (
        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${bgColor} text-white font-bold text-lg`}>
            {initial}
        </div>
    );
};


const VendorsPage: React.FC = () => {
    // FIX: Replaced non-existent `addVendor` with the generic `addItem` from `useData`.
    const { vendors, addItem, isLoading } = useData();
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [logoPreview, setLogoPreview] = useState<string | null>(null);

    const handleExport = () => {
        if(vendors.length > 0) {
            // FIX: Replaced non-existent 'logoUrl' with 'avatarUrl'.
            exportToCsv('vendors.csv', vendors.map(({avatarUrl, ...rest}) => rest));
        }
    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onloadend = () => {
                setLogoPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        } else {
            setLogoPreview(null);
        }
    };

    const handleAddVendor = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        const newVendor: Omit<Vendor, 'id'> = {
            name: formData.get('name') as string,
            // FIX: Property 'dependencyRisk' does not exist on type 'Omit<Vendor, "id">'.
            dependencyRisk: parseInt(formData.get('dependencyRisk') as string, 10),
            // FIX: Property 'totalSpent' does not exist on type 'Omit<Vendor, "id">'.
            totalSpent: parseInt(formData.get('totalSpent') as string, 10),
            // FIX: Replaced non-existent 'logoUrl' with 'avatarUrl'.
            avatarUrl: logoPreview || undefined,
            email: '', // Added default values for required fields
            phone: '',
            address: '',
            paymentTerms: 'Net 30',
        };
        // FIX: Use the generic `addItem` function with the correct key and type.
        addItem<Vendor>('vendors', newVendor);
        closeAddModal();
    };
    
    const closeAddModal = () => {
        setIsAddModalOpen(false);
        setLogoPreview(null);
    };

  return (
    <>
    <div className="space-y-8">
        <Card>
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Vendor Spending Distribution</h2>
            {isLoading ? (
                 <div className="flex justify-center items-center h-[300px]"><Spinner /></div>
            ) : vendors.length > 0 ? (
                 <div style={{ width: '100%', height: 300 }}>
                    <ResponsiveContainer>
                        <BarChart data={vendors} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
                            <XAxis dataKey="name" stroke="currentColor" fontSize={12} />
                            <YAxis stroke="currentColor" fontSize={12} tickFormatter={(value) => formatCurrency(Number(value))} />
                            <Tooltip
                              contentStyle={{
                                backgroundColor: 'rgba(30, 41, 59, 0.9)',
                                borderColor: '#334155',
                                borderRadius: '0.5rem',
                                color: '#f1f5f9',
                              }}
                               formatter={(value) => formatCurrency(Number(value))}
                               cursor={{fill: 'rgba(100, 116, 139, 0.1)'}}
                            />
                            <Bar dataKey="totalSpent" name="Total Spent">
                                {vendors.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                 </div>
            ) : (
                <div className="h-[300px] flex items-center justify-center text-center">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Your spending chart will appear here once you add vendors.</p>
                </div>
            )}
        </Card>
        <Card>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Your Vendors</h2>
                <div className="flex gap-2">
                    <Button onClick={handleExport} variant="secondary" disabled={vendors.length === 0}>
                        <DownloadIcon className="w-4 h-4 mr-2" />
                        Export CSV
                    </Button>
                    <Button onClick={() => setIsAddModalOpen(true)}>Add Vendor</Button>
                </div>
            </div>
            {isLoading ? (
                <div className="flex justify-center items-center h-48"><Spinner /></div>
            ) : vendors.length > 0 ? (
              <div className="space-y-4">
                {vendors.map((vendor, index) => (
                  <motion.div
                    key={vendor.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className="p-4 bg-primary-50 dark:bg-primary-900/50 rounded-lg grid grid-cols-3 items-center gap-4"
                  >
                    <div className="flex items-center gap-4 col-span-1">
                      <VendorAvatar vendor={vendor} />
                      <p className="font-semibold text-gray-900 dark:text-white">{vendor.name}</p>
                    </div>
                    <div className="col-span-1">
                        <div className="flex items-center gap-2">
                            {/* FIX: Property 'dependencyRisk' does not exist on type 'Vendor'. */}
                            <DependencyRiskBar risk={vendor.dependencyRisk} />
                            {/* FIX: Property 'dependencyRisk' does not exist on type 'Vendor'. */}
                            <span className="text-sm font-semibold">{vendor.dependencyRisk}%</span>
                        </div>
                         <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Dependency Risk</p>
                    </div>
                    <div className="text-right col-span-1">
                        {/* FIX: Property 'totalSpent' does not exist on type 'Vendor'. */}
                        <p className="font-semibold font-mono text-gray-900 dark:text-white">{formatCurrency(vendor.totalSpent)}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Total Spent</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
                <div className="text-center py-12">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">No vendors yet</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Add a vendor to track your spending and dependency.</p>
                    <Button className="mt-4" onClick={() => setIsAddModalOpen(true)}>Add a Vendor</Button>
                </div>
            )}
        </Card>
    </div>

    {/* Add Vendor Modal */}
    <Modal isOpen={isAddModalOpen} onClose={closeAddModal} title="Add New Vendor">
        <form onSubmit={handleAddVendor} className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Vendor Name</label>
                <input type="text" name="name" required className="mt-1 block w-full rounded-md border-gray-300 dark:border-primary-600 bg-primary-50 dark:bg-primary-700 shadow-sm focus:ring-secondary-500 focus:border-secondary-500" />
            </div>
             <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Dependency Risk (0-100)</label>
                <input type="number" name="dependencyRisk" required min="0" max="100" defaultValue="20" className="mt-1 block w-full rounded-md border-gray-300 dark:border-primary-600 bg-primary-50 dark:bg-primary-700 shadow-sm focus:ring-secondary-500 focus:border-secondary-500" />
            </div>
             <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Total Spent ($)</label>
                <input type="number" name="totalSpent" required min="0" defaultValue="0" className="mt-1 block w-full rounded-md border-gray-300 dark:border-primary-600 bg-primary-50 dark:bg-primary-700 shadow-sm focus:ring-secondary-500 focus:border-secondary-500" />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Logo (Optional)</label>
                <input 
                    type="file" 
                    name="logo" 
                    accept="image/*" 
                    onChange={handleFileChange} 
                    className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-secondary-50 dark:file:bg-secondary-900/40 file:text-secondary-700 dark:file:text-secondary-300 hover:file:bg-secondary-100 dark:hover:file:bg-secondary-900/60" 
                />
            </div>
            {logoPreview && (
                <div>
                    <span className="block text-sm font-medium text-gray-700 dark:text-gray-300">Preview</span>
                    <img src={logoPreview} alt="Logo preview" className="mt-2 w-16 h-16 object-contain rounded-full bg-gray-100 dark:bg-primary-700 p-1" />
                </div>
            )}
            <div className="pt-4 flex justify-end gap-2">
                <Button type="button" variant="secondary" onClick={closeAddModal}>Cancel</Button>
                <Button type="submit">Add Vendor</Button>
            </div>
        </form>
    </Modal>
    </>
  );
};

export default VendorsPage;
