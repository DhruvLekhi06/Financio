import React from 'react';
import { useParams, Link } from 'react-router-dom';
import Card from '../../../components/shared/Card';
import Spinner from '../../../components/shared/Spinner';
import { useData } from '../../../hooks/useData';
import { formatCurrency, formatDate } from '../../../utils/helpers';
import { VendorsIcon, DocumentIcon, ReceiptIcon, InvoiceIcon } from '../../../components/Icons';

const Stat: React.FC<{ title: string; value: string | number }> = ({ title, value }) => (
    <div>
        <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
        <p className="text-2xl font-bold font-mono text-gray-900 dark:text-white">{value}</p>
    </div>
)

const VendorDetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const { vendors, purchaseOrders, bills, paymentsMade, isLoading } = useData();

    const vendor = vendors.find(v => v.id === id);
    const vendorPOs = purchaseOrders.filter(po => po.vendorId === id);
    const vendorBills = bills.filter(b => b.vendorId === id);
    const vendorPayments = paymentsMade.filter(p => p.vendorId === id);

    if (isLoading) {
        return <div className="flex justify-center items-center h-64"><Spinner /></div>;
    }

    if (!vendor) {
        return <Card><p>Vendor not found.</p></Card>;
    }

    const totalBilled = vendorBills.reduce((sum, bill) => sum + bill.total, 0);
    const totalPaid = vendorPayments.reduce((sum, pay) => sum + pay.amount, 0);
    const outstanding = totalBilled - totalPaid;

    return (
        <div className="space-y-6">
            <Card>
                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-full bg-secondary-100 dark:bg-secondary-900/30 flex items-center justify-center flex-shrink-0">
                            <VendorsIcon className="w-8 h-8 text-secondary-600 dark:text-secondary-400" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-plex font-bold text-gray-900 dark:text-white">{vendor.name}</h1>
                            <p className="text-gray-500 dark:text-gray-400 break-all">{vendor.email} &bull; {vendor.phone}</p>
                        </div>
                    </div>
                     <div className="flex gap-x-8 gap-y-4 mt-6 md:mt-0 border-t md:border-t-0 pt-4 md:pt-0">
                        <Stat title="Total Billed" value={formatCurrency(totalBilled)} />
                        <Stat title="Outstanding" value={formatCurrency(outstanding)} />
                    </div>
                </div>
                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6 border-t dark:border-primary-700 pt-6">
                    <div>
                        <h3 className="font-semibold text-gray-700 dark:text-gray-300">Address</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-wrap mt-1">{vendor.address || 'Not provided'}</p>
                    </div>
                    <div>
                        <h3 className="font-semibold text-gray-700 dark:text-gray-300">Default Payment Terms</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{vendor.paymentTerms || 'Not provided'}</p>
                    </div>
                </div>
            </Card>

            <Card>
                <div className="flex items-center gap-3 mb-4">
                    <DocumentIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                    <h2 className="text-lg font-plex font-bold text-gray-800 dark:text-white">Purchase Orders</h2>
                </div>
                {vendorPOs.length > 0 ? (
                     <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                           <thead className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase bg-gray-100 dark:bg-primary-800">
                                <tr>
                                    <th className="px-4 py-2">PO #</th>
                                    <th className="px-4 py-2">Date</th>
                                    <th className="px-4 py-2 hidden sm:table-cell">Status</th>
                                    <th className="px-4 py-2 text-right">Amount</th>
                                </tr>
                           </thead>
                           <tbody>
                                {vendorPOs.map(po => (
                                    <tr key={po.id} className="border-b dark:border-primary-700 hover:bg-gray-50 dark:hover:bg-primary-800/50 transition-colors">
                                        <td className="px-4 py-3 font-medium text-gray-800 dark:text-gray-100">{po.orderId}</td>
                                        <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{formatDate(po.date)}</td>
                                        <td className="px-4 py-3 text-gray-600 dark:text-gray-300 hidden sm:table-cell">{po.status}</td>
                                        <td className="px-4 py-3 text-right font-mono text-gray-800 dark:text-gray-100">{formatCurrency(po.total)}</td>
                                    </tr>
                                ))}
                           </tbody>
                        </table>
                    </div>
                ) : <p className="text-sm text-gray-500 dark:text-gray-400 py-4">No purchase orders for this vendor.</p>}
            </Card>
            
            <Card>
                <div className="flex items-center gap-3 mb-4">
                    <InvoiceIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                    <h2 className="text-lg font-plex font-bold text-gray-800 dark:text-white">Bills</h2>
                </div>
                {vendorBills.length > 0 ? (
                     <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                           <thead className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase bg-gray-100 dark:bg-primary-800">
                                <tr>
                                    <th className="px-4 py-2">Bill #</th>
                                    <th className="px-4 py-2">Due Date</th>
                                    <th className="px-4 py-2 hidden sm:table-cell">Status</th>
                                    <th className="px-4 py-2 text-right">Amount</th>
                                </tr>
                           </thead>
                           <tbody>
                                {vendorBills.map(bill => (
                                    <tr key={bill.id} className="border-b dark:border-primary-700 hover:bg-gray-50 dark:hover:bg-primary-800/50 transition-colors">
                                        <td className="px-4 py-3 font-medium text-gray-800 dark:text-gray-100">{bill.billId}</td>
                                        <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{formatDate(bill.dueDate)}</td>
                                        <td className="px-4 py-3 text-gray-600 dark:text-gray-300 hidden sm:table-cell">{bill.status}</td>
                                        <td className="px-4 py-3 text-right font-mono text-gray-800 dark:text-gray-100">{formatCurrency(bill.total)}</td>
                                    </tr>
                                ))}
                           </tbody>
                        </table>
                    </div>
                ) : <p className="text-sm text-gray-500 dark:text-gray-400 py-4">No bills from this vendor.</p>}
            </Card>

            <Card>
                <div className="flex items-center gap-3 mb-4">
                    <ReceiptIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                    <h2 className="text-lg font-plex font-bold text-gray-800 dark:text-white">Payments Made</h2>
                </div>
                {vendorPayments.length > 0 ? (
                     <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                           <thead className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase bg-gray-100 dark:bg-primary-800">
                                <tr>
                                    <th className="px-4 py-2">Payment #</th>
                                    <th className="px-4 py-2">Date</th>
                                    <th className="px-4 py-2 hidden sm:table-cell">Applied to Bill</th>
                                    <th className="px-4 py-2 text-right">Amount</th>
                                </tr>
                           </thead>
                            <tbody>
                                {vendorPayments.map(payment => (
                                    <tr key={payment.id} className="border-b dark:border-primary-700 hover:bg-gray-50 dark:hover:bg-primary-800/50 transition-colors">
                                        <td className="px-4 py-3 font-medium text-gray-800 dark:text-gray-100">{payment.paymentId}</td>
                                        <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{formatDate(payment.date)}</td>
                                        <td className="px-4 py-3 text-gray-600 dark:text-gray-300 hidden sm:table-cell">
                                            <Link to="/purchases/bills" className="text-secondary-500 hover:underline">
                                                {bills.find(b => b.id === payment.billId)?.billId}
                                            </Link>
                                        </td>
                                        <td className="px-4 py-3 text-right font-mono text-red-500">{formatCurrency(payment.amount)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : <p className="text-sm text-gray-500 dark:text-gray-400 py-4">No payments made to this vendor.</p>}
            </Card>
        </div>
    );
};

export default VendorDetailPage;