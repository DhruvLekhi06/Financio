
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Card from '../../components/shared/Card';
import Button from '../../components/shared/Button';
import Spinner from '../../components/shared/Spinner';
import Modal from '../../components/shared/Modal';
import { useData } from '../../hooks/useData';
import { formatCurrency, formatDate, exportToCsv } from '../../utils/helpers';
import { DownloadIcon } from '../../components/Icons';
import { generateClientReportSummary } from '../../services/geminiService';
// FIX: Renamed non-existent 'Client' type to 'Customer'
import type { Customer, Transaction } from '../../types';

const ClientReliabilityScore: React.FC<{ score: number }> = ({ score }) => {
    const circumference = 2 * Math.PI * 18;
    const offset = circumference - (score / 100) * circumference;
    const color = score > 90 ? 'text-green-500' : score > 75 ? 'text-yellow-500' : 'text-red-500';

    return (
        <div className="relative w-10 h-10">
            <svg className="w-full h-full" viewBox="0 0 40 40">
                <circle className="text-gray-200 dark:text-primary-700" strokeWidth="4" stroke="currentColor" fill="transparent" r="18" cx="20" cy="20" />
                <circle
                    className={color}
                    strokeWidth="4"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="transparent"
                    r="18"
                    cx="20"
                    cy="20"
                    transform="rotate(-90 20 20)"
                />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-xs font-bold">{score}</span>
        </div>
    );
}

const ClientsPage: React.FC = () => {
    // FIX: Replaced non-existent `clients` with `customers` from `useData`.
    const { customers, transactions, addItem, isLoading } = useData();
    const [isReportModalOpen, setIsReportModalOpen] = useState(false);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    // FIX: Changed selectedClient type from Client to Customer
    const [selectedClient, setSelectedClient] = useState<Customer | null>(null);
    const [reportSummary, setReportSummary] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [selectedClientTransactions, setSelectedClientTransactions] = useState<Transaction[]>([]);
    
    const handleExport = () => {
        if (customers.length > 0) {
            exportToCsv('clients.csv', customers.map(({avatarUrl, ...rest}) => rest));
        }
    }

    const handleGenerateReport = async (client: Customer) => {
        setSelectedClient(client);
        setIsReportModalOpen(true);
        setIsGenerating(true);
        setReportSummary('');
        setSelectedClientTransactions([]);

        const clientTransactions = transactions
            .filter(t => t.type === 'inflow' && t.description.toLowerCase().includes(client.name.split(' ')[0].toLowerCase()))
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        
        setSelectedClientTransactions(clientTransactions.slice(0, 5));

        const summary = await generateClientReportSummary(client, transactions);
        setReportSummary(summary);
        setIsGenerating(false);
    };

    const closeReportModal = () => {
        setIsReportModalOpen(false);
        setSelectedClient(null);
        setSelectedClientTransactions([]);
    };

    const handleAddClient = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        const newClient: Omit<Customer, 'id'> = {
            name: formData.get('name') as string,
            email: 'new.customer@example.com', // Added default value
            phone: '+15550001111', // Added default value
            billingAddress: 'N/A', // Added default value
            shippingAddress: 'N/A', // Added default value
            reliabilityScore: parseInt(formData.get('reliabilityScore') as string, 10),
            overduePayments: parseInt(formData.get('overduePayments') as string, 10),
            avatarUrl: `https://i.pravatar.cc/150?u=${Date.now()}` // Random avatar
        };
        // FIX: Use the 'customers' key instead of 'clients'.
        addItem<Customer>('customers', newClient);
        setIsAddModalOpen(false);
    };

  return (
    <>
    <Card>
        <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Your Customers</h2>
            <div className="flex gap-2">
                <Button onClick={handleExport} variant="secondary" disabled={customers.length === 0}>
                    <DownloadIcon className="w-4 h-4 mr-2" />
                    Export CSV
                </Button>
                <Button onClick={() => setIsAddModalOpen(true)}>Add Customer</Button>
            </div>
        </div>
        {isLoading ? (
            <div className="flex justify-center items-center h-48"><Spinner /></div>
        ) : customers.length > 0 ? (
          <div className="space-y-4">
            {customers.map((client, index) => (
              <motion.div
                key={client.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="p-4 bg-primary-50 dark:bg-primary-900/50 rounded-lg flex items-center justify-between"
              >
                <div className="flex items-center gap-4">
                  <img src={client.avatarUrl} alt={client.name} className="w-12 h-12 rounded-full" />
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">{client.name}</p>
                     <button onClick={() => handleGenerateReport(client)} className="text-xs text-secondary-600 dark:text-secondary-400 hover:underline">Generate AI Summary</button>
                  </div>
                  <ClientReliabilityScore score={client.reliabilityScore} />
                </div>
                <div className="text-right">
                  {client.overduePayments > 0 ? (
                    <>
                      <p className="font-semibold font-mono text-red-500">{formatCurrency(client.overduePayments)}</p>
                      <p className="text-sm text-red-400">Overdue</p>
                    </>
                  ) : (
                    <>
                       <p className="font-semibold text-green-500">All Paid Up</p>
                       <p className="text-sm text-gray-500 dark:text-gray-400">No overdue payments</p>
                    </>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
            <div className="text-center py-12">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">No customers yet</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Add your first client to see their details here.</p>
                <Button className="mt-4" onClick={() => setIsAddModalOpen(true)}>Add a Customer</Button>
            </div>
        )}
    </Card>

    {/* AI Report Modal */}
    <AnimatePresence>
        {isReportModalOpen && selectedClient && (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
                onClick={closeReportModal}
            >
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    className="bg-white dark:bg-primary-800 rounded-xl shadow-xl w-full max-w-lg border border-primary-200 dark:border-primary-700"
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="p-6 border-b dark:border-primary-700">
                        <h3 className="text-lg font-bold font-display text-gray-900 dark:text-white">AI Report for {selectedClient.name}</h3>
                    </div>
                    <div className="p-6 max-h-[60vh] overflow-y-auto">
                        {isGenerating ? (
                            <div className="flex flex-col items-center justify-center h-48">
                                <Spinner className="w-8 h-8 text-secondary-500" />
                                <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">Generating summary...</p>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                <div>
                                    <h4 className="font-semibold text-gray-800 dark:text-gray-100 mb-2">AI Summary</h4>
                                    <p className="text-sm text-gray-600 dark:text-gray-300 whitespace-pre-wrap">{reportSummary}</p>
                                </div>
                                {selectedClientTransactions.length > 0 && (
                                    <div>
                                        <h4 className="font-semibold text-gray-800 dark:text-gray-100 mb-2">Recent Transactions</h4>
                                        <div className="space-y-2">
                                            {selectedClientTransactions.map(t => (
                                                <div key={t.id} className="flex justify-between items-center p-2 bg-primary-50 dark:bg-primary-700/50 rounded-md">
                                                    <div>
                                                        <p className="font-medium text-sm text-gray-800 dark:text-gray-200">{t.description}</p>
                                                        <p className="text-xs text-gray-500 dark:text-gray-400">{formatDate(t.date)}</p>
                                                    </div>
                                                    <p className="font-semibold font-mono text-sm text-green-500">{formatCurrency(t.amount)}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                    <div className="px-6 py-4 bg-primary-50 dark:bg-primary-800/50 border-t dark:border-primary-700 text-right">
                        <Button variant="secondary" onClick={closeReportModal}>Close</Button>
                    </div>
                </motion.div>
            </motion.div>
        )}
    </AnimatePresence>

    {/* Add Client Modal */}
    <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Add New Customer">
        <form onSubmit={handleAddClient} className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Customer Name</label>
                <input type="text" name="name" required className="mt-1 block w-full rounded-md border-gray-300 dark:border-primary-600 bg-primary-50 dark:bg-primary-700 shadow-sm focus:ring-secondary-500 focus:border-secondary-500" />
            </div>
             <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Reliability Score (0-100)</label>
                <input type="number" name="reliabilityScore" required min="0" max="100" defaultValue="90" className="mt-1 block w-full rounded-md border-gray-300 dark:border-primary-600 bg-primary-50 dark:bg-primary-700 shadow-sm focus:ring-secondary-500 focus:border-secondary-500" />
            </div>
             <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Overdue Payments ($)</label>
                <input type="number" name="overduePayments" required min="0" defaultValue="0" className="mt-1 block w-full rounded-md border-gray-300 dark:border-primary-600 bg-primary-50 dark:bg-primary-700 shadow-sm focus:ring-secondary-500 focus:border-secondary-500" />
            </div>
            <div className="pt-4 flex justify-end gap-2">
                <Button type="button" variant="secondary" onClick={() => setIsAddModalOpen(false)}>Cancel</Button>
                <Button type="submit">Add Customer</Button>
            </div>
        </form>
    </Modal>
    </>
  );
};

export default ClientsPage;
