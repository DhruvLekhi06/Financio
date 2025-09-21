
import React from 'react';
import Card from '../../shared/Card';
import Button from '../../shared/Button';
import { useData } from '../../../hooks/useData';
import type { Invoice } from '../../../types';
import { ArrowRightIcon, InvoicePaperIcon } from '../../Icons';
import { useNavigate } from 'react-router-dom';

const getStatusClasses = (status: Invoice['status']) => {
    switch (status) {
        case 'Paid':
            return 'bg-status-completed text-status-completed-text';
        case 'Sent':
             return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
        case 'Overdue':
            return 'bg-status-rejected text-status-rejected-text';
        default:
            return 'bg-gray-200 text-gray-800';
    }
}

const getIconColor = (invoiceId: string) => {
    const charCode = invoiceId.charCodeAt(2) || 0;
    const colors = ['bg-dark-purple', 'bg-icon-pink', 'bg-icon-teal'];
    return colors[charCode % colors.length];
}


const InvoicesCard: React.FC = () => {
    // FIX: Destructure customers to look up names
    const { invoices, customers } = useData();
    const navigate = useNavigate();
    
    // FIX: Create a map for efficient customer name lookup
    const customerNameMap = React.useMemo(() =>
        customers.reduce((acc, customer) => {
            acc[customer.id] = customer.name;
            return acc;
        }, {} as Record<string, string>),
    [customers]);

    return (
        <Card>
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-plex font-bold text-gray-800 dark:text-white">Recent Invoices</h2>
                <Button variant="secondary" onClick={() => navigate('/sales/invoices')}>View All</Button>
            </div>
            <div className="overflow-x-auto">
                 {invoices.length > 0 ? (
                    <table className="w-full text-sm">
                        <tbody>
                            {invoices.slice(0, 3).map((invoice, index) => (
                                <tr key={invoice.id} className={index < invoices.length - 1 ? "border-b border-gray-100 dark:border-primary-700" : ""}>
                                    <td className="py-3 pr-3">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-10 h-10 ${getIconColor(invoice.invoiceId)} rounded-lg flex items-center justify-center`}>
                                                <InvoicePaperIcon className="w-5 h-5 text-white" />
                                            </div>
                                            <div>
                                                <p className="font-semibold">{invoice.invoiceId}</p>
                                                {/* FIX: Use customerNameMap to display customer name */}
                                                <p className="text-xs text-gray-500">{customerNameMap[invoice.customerId] || 'Unknown'}</p>
                                            </div>
                                        </div>
                                    </td>
                                    {/* FIX: Use customerNameMap to display customer name */}
                                    <td className="py-3 px-3 text-gray-500 hidden md:table-cell">{customerNameMap[invoice.customerId] || 'Unknown'}</td>
                                    <td className="py-3 px-3">
                                        <span className={`px-2 py-1 text-xs font-medium rounded-md ${getStatusClasses(invoice.status)}`}>
                                            {invoice.status}
                                        </span>
                                    </td>
                                    <td className="py-3 px-3 text-gray-500 hidden md:table-cell">{new Date(invoice.date).toLocaleDateString('en-GB', { day:'2-digit', month:'2-digit', year:'numeric'})}</td>
                                    <td className="py-3 pl-3">
                                        <button onClick={() => navigate('/sales/invoices')} className="flex items-center gap-2 text-gray-500 hover:text-gray-800 dark:hover:text-white">
                                            Details <ArrowRightIcon className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <div className="text-center py-8">
                        <p className="text-sm text-gray-500 dark:text-gray-400">No invoices created yet.</p>
                        <Button className="mt-4" onClick={() => navigate('/sales/invoices')}>Create First Invoice</Button>
                    </div>
                )}
            </div>
        </Card>
    );
};

export default InvoicesCard;
