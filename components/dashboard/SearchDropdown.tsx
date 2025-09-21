
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useData } from '../../hooks/useData';
import { Link } from 'react-router-dom';
import { formatCurrency } from '../../utils/helpers';
import Spinner from '../shared/Spinner';
import { DocumentIcon, UsersIcon, VendorsIcon } from '../Icons';

interface SearchResults {
    transactions: any[];
    customers: any[];
    vendors: any[];
}

const SearchDropdown: React.FC<{ query: string, onClose: () => void }> = ({ query, onClose }) => {
    // FIX: Changed `clients` to `customers` to match useData hook.
    const { transactions, customers, vendors, isLoading } = useData();
    const [results, setResults] = useState<SearchResults>({ transactions: [], customers: [], vendors: [] });
    const [isSearching, setIsSearching] = useState(true);

    useEffect(() => {
        setIsSearching(true);
        const lowerCaseQuery = query.toLowerCase();

        // Basic debouncing
        const handler = setTimeout(() => {
            if (query.trim() === '' || isLoading) {
                setResults({ transactions: [], customers: [], vendors: [] });
                setIsSearching(false);
                return;
            }

            const filteredTransactions = transactions.filter(t => 
                t.description.toLowerCase().includes(lowerCaseQuery) ||
                t.category.toLowerCase().includes(lowerCaseQuery)
            ).slice(0, 3);
            
            const filteredClients = customers.filter(c => 
                c.name.toLowerCase().includes(lowerCaseQuery)
            ).slice(0, 3);

            const filteredVendors = vendors.filter(v => 
                v.name.toLowerCase().includes(lowerCaseQuery)
            ).slice(0, 3);
            
            setResults({
                transactions: filteredTransactions,
                customers: filteredClients,
                vendors: filteredVendors
            });
            setIsSearching(false);
        }, 300);

        return () => {
            clearTimeout(handler);
        };
    }, [query, transactions, customers, vendors, isLoading]);

    const totalResults = results.transactions.length + results.customers.length + results.vendors.length;

    return (
        <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full mt-2 w-80 bg-white dark:bg-primary-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 z-50 overflow-hidden"
        >
            <div className="max-h-96 overflow-y-auto">
                {isSearching ? (
                    <div className="p-4 flex justify-center items-center"><Spinner /></div>
                ) : totalResults === 0 ? (
                    <div className="p-4 text-center text-sm text-gray-500 dark:text-gray-400">No results found for "{query}"</div>
                ) : (
                    <div className="divide-y divide-gray-100 dark:divide-gray-700">
                        {results.customers.length > 0 && (
                            <ResultSection title="Customers" icon={<UsersIcon className="w-4 h-4" />}>
                                {results.customers.map(client => (
                                    <ResultItem key={client.id} to="/sales/customers" onClick={onClose}>
                                        <p className="font-medium truncate">{client.name}</p>
                                        <p className="text-xs text-gray-500">Reliability: {client.reliabilityScore}</p>
                                    </ResultItem>
                                ))}
                            </ResultSection>
                        )}
                         {results.vendors.length > 0 && (
                            <ResultSection title="Vendors" icon={<VendorsIcon className="w-4 h-4" />}>
                                {results.vendors.map(vendor => (
                                    <ResultItem key={vendor.id} to="/purchases/vendors" onClick={onClose}>
                                        <p className="font-medium truncate">{vendor.name}</p>
                                        <p className="text-xs text-gray-500">Spent: {formatCurrency(vendor.totalSpent)}</p>
                                    </ResultItem>
                                ))}
                            </ResultSection>
                        )}
                        {results.transactions.length > 0 && (
                             <ResultSection title="Transactions" icon={<DocumentIcon className="w-4 h-4" />}>
                                {results.transactions.map(t => (
                                    <ResultItem key={t.id} to="/banking" onClick={onClose}>
                                        <p className="font-medium truncate">{t.description}</p>
                                        <p className={`text-xs ${t.type === 'inflow' ? 'text-green-500' : 'text-red-500'}`}>{formatCurrency(t.amount)}</p>
                                    </ResultItem>
                                ))}
                            </ResultSection>
                        )}
                    </div>
                )}
            </div>
        </motion.div>
    );
};

const ResultSection: React.FC<{ title: string; icon: React.ReactNode; children: React.ReactNode }> = ({ title, icon, children }) => (
    <div>
        <h3 className="px-3 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-2 bg-gray-50 dark:bg-gray-900/50">{icon} {title}</h3>
        <ul className="py-1">{children}</ul>
    </div>
);

const ResultItem: React.FC<{ to: string; onClick: () => void; children: React.ReactNode }> = ({ to, onClick, children }) => (
    <li>
        <Link to={to} onClick={onClick} className="px-3 py-2 flex justify-between items-center text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700">
            {children}
        </Link>
    </li>
)


export default SearchDropdown;
