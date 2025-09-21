import React from 'react';
import { useParams, Link } from 'react-router-dom';
import Card from '../../../components/shared/Card';
import Spinner from '../../../components/shared/Spinner';
import { useData } from '../../../hooks/useData';
import { formatCurrency, formatDate } from '../../../utils/helpers';
import { UsersIcon, InvoiceIcon, ReceiptIcon } from '../../../components/Icons';

const Stat: React.FC<{ title: string; value: string | number }> = ({ title, value }) => (
    <div>
        <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
        <p className="text-2xl font-bold font-mono text-gray-900 dark:text-white">{value}</p>
    </div>
)

const CustomerDetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const { customers, invoices, paymentsReceived, isLoading } = useData();

    const customer = customers.find(c => c.id === id);
    const customerInvoices = invoices.filter(i => i.customerId === id);
    const customerPayments = paymentsReceived.filter(p => p.customerId === id);

    if (isLoading) {
        return <div className="flex justify-center items-center h-64"><Spinner /></div>;
    }

    if (!customer) {
        return <Card><p>Customer not found.</p></Card>;
    }
    
    const totalBilled = customerInvoices.reduce((sum, inv) => sum + inv.total, 0);
    const totalPaid = customerPayments.reduce((sum, pay) => sum + pay.amount, 0);
    const outstanding = totalBilled - totalPaid;

    return (
        <div className="space-y-6">
            <Card>
                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                     <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-full bg-secondary-100 dark:bg-secondary-900/30 flex items-center justify-center flex-shrink-0">
                            <UsersIcon className="w-8 h-8 text-secondary-600 dark:text-secondary-400" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-plex font-bold text-gray-900 dark:text-white">{customer.name}</h1>
                            <p className="text-gray-500 dark:text-gray-400 break-all">{customer.email} &bull; {customer.phone}</p>
                        </div>
                    </div>
                    <div className="flex gap-x-8 gap-y-4 mt-6 md:mt-0 border-t md:border-t-0 pt-4 md:pt-0">
                        <Stat title="Total Billed" value={formatCurrency(totalBilled)} />
                        <Stat title="Outstanding" value={formatCurrency(outstanding)} />
                    </div>
                </div>
                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6 border-t dark:border-primary-700 pt-6">
                    <div>
                        <h3 className="font-semibold text-gray-700 dark:text-gray-300">Billing Address</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-wrap mt-1">{customer.billingAddress || 'Not provided'}</p>
                    </div>
                    <div>
                        <h3 className="font-semibold text-gray-700 dark:text-gray-300">Shipping Address</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-wrap mt-1">{customer.shippingAddress || 'Not provided'}</p>
                    </div>
                </div>
            </Card>

            <Card>
                <div className="flex items-center gap-3 mb-4">
                    <InvoiceIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                    <h2 className="text-lg font-plex font-bold text-gray-800 dark:text-white">Invoices</h2>
                </div>
                {customerInvoices.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                           <thead className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase bg-gray-100 dark:bg-primary-800">
                                <tr>
                                    <th className="px-4 py-2">Invoice #</th>
                                    <th className="px-4 py-2">Date</th>
                                    <th className="px-4 py-2 hidden sm:table-cell">Status</th>
                                    <th className="px-4 py-2 text-right">Amount</th>
                                </tr>
                           </thead>
                           <tbody>
                                {customerInvoices.map(invoice => (
                                    <tr key={invoice.id} className="border-b dark:border-primary-700 hover:bg-gray-50 dark:hover:bg-primary-800/50 transition-colors">
                                        <td className="px-4 py-3 font-medium text-gray-800 dark:text-gray-100">{invoice.invoiceId}</td>
                                        <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{formatDate(invoice.date)}</td>
                                        <td className="px-4 py-3 text-gray-600 dark:text-gray-300 hidden sm:table-cell">{invoice.status}</td>
                                        <td className="px-4 py-3 text-right font-mono text-gray-800 dark:text-gray-100">{formatCurrency(invoice.total)}</td>
                                    </tr>
                                ))}
                           </tbody>
                        </table>
                    </div>
                ) : <p className="text-sm text-gray-500 dark:text-gray-400 py-4">No invoices for this customer.</p>}
            </Card>

            <Card>
                <div className="flex items-center gap-3 mb-4">
                    <ReceiptIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                    <h2 className="text-lg font-plex font-bold text-gray-800 dark:text-white">Payments Received</h2>
                </div>
                {customerPayments.length > 0 ? (
                    <div className="overflow-x-auto">
                         <table className="w-full text-sm text-left">
                           <thead className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase bg-gray-100 dark:bg-primary-800">
                                <tr>
                                    <th className="px-4 py-2">Payment #</th>
                                    <th className="px-4 py-2">Date</th>
                                    <th className="px-4 py-2 hidden sm:table-cell">Applied to Invoice</th>
                                    <th className="px-4 py-2 text-right">Amount</th>
                                </tr>
                           </thead>
                            <tbody>
                                {customerPayments.map(payment => (
                                    <tr key={payment.id} className="border-b dark:border-primary-700 hover:bg-gray-50 dark:hover:bg-primary-800/50 transition-colors">
                                        <td className="px-4 py-3 font-medium text-gray-800 dark:text-gray-100">{payment.paymentId}</td>
                                        <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{formatDate(payment.date)}</td>
                                        <td className="px-4 py-3 text-gray-600 dark:text-gray-300 hidden sm:table-cell">
                                            <Link to={`/sales/invoices`} className="text-secondary-500 hover:underline">
                                                {invoices.find(i => i.id === payment.invoiceId)?.invoiceId}
                                            </Link>
                                        </td>
                                        <td className="px-4 py-3 text-right font-mono text-green-500">{formatCurrency(payment.amount)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : <p className="text-sm text-gray-500 dark:text-gray-400 py-4">No payments recorded for this customer.</p>}
            </Card>
        </div>
    );
};

export default CustomerDetailPage;