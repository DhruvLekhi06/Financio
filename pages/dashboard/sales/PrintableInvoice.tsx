import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useData } from '../../../hooks/useData';
import { useAuth } from '../../../hooks/useAuth';
import { Logo } from '../../../components/Icons';
import { formatCurrency, formatDate } from '../../../utils/helpers';
import Spinner from '../../../components/shared/Spinner';
import Button from '../../../components/shared/Button';

const PrintableInvoice: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const { user } = useAuth();
    const { invoices, customers, isLoading } = useData();

    const invoice = invoices.find(inv => inv.id === id);
    const customer = invoice ? customers.find(c => c.id === invoice.customerId) : null;

    useEffect(() => {
        if (invoice) {
            document.title = `Invoice ${invoice.invoiceId}`;
        }
    }, [invoice]);

    if (isLoading) {
        return <div className="flex h-screen items-center justify-center bg-gray-100"><Spinner /></div>;
    }

    if (!invoice || !customer) {
        return <div className="p-8 text-center text-red-500">Invoice not found.</div>;
    }
    
    const getStatusInfo = () => {
        switch (invoice.status) {
            case 'Paid':
                return { text: 'PAID', color: 'text-green-600', bg: 'bg-green-100' };
            case 'Overdue':
                return { text: 'OVERDUE', color: 'text-red-600', bg: 'bg-red-100' };
            default:
                return { text: invoice.status.toUpperCase(), color: 'text-gray-600', bg: 'bg-gray-100' };
        }
    };
    const statusInfo = getStatusInfo();

    return (
        <div className="bg-white text-gray-800 font-sans min-h-screen">
            <Button className="print:hidden fixed top-4 right-4 z-50" onClick={() => window.print()}>Print / Save as PDF</Button>
            <div className="max-w-4xl mx-auto p-8 md:p-12 border-x border-gray-200">
                {/* Header */}
                <header className="flex justify-between items-start pb-8 border-b">
                    <div>
                        <div className="flex items-center gap-3 mb-4">
                            <Logo className="h-10 w-10 text-black" />
                            <span className="text-2xl font-plex font-bold">{user?.companyName || 'FinancioAI'}</span>
                        </div>
                        <div className="text-sm text-gray-600">
                            <p>{user?.email}</p>
                            <p>{user?.phoneNumber}</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <h1 className="text-4xl font-plex font-bold uppercase text-gray-400">Invoice</h1>
                        <p className="text-sm text-gray-600 mt-2">Invoice #: <span className="font-medium text-gray-800">{invoice.invoiceId}</span></p>
                        <p className="text-sm text-gray-600">Date: <span className="font-medium text-gray-800">{formatDate(invoice.date)}</span></p>
                    </div>
                </header>

                {/* Billing Info */}
                <section className="grid grid-cols-2 gap-8 my-8">
                    <div>
                        <h2 className="text-sm font-semibold uppercase text-gray-500 mb-2">Bill To</h2>
                        <p className="font-bold text-lg">{customer.name}</p>
                        <p className="text-sm text-gray-600 whitespace-pre-wrap">{customer.billingAddress || 'N/A'}</p>
                        <p className="text-sm text-gray-600">{customer.email}</p>
                    </div>
                    <div className="text-right">
                        <div className={`inline-block px-4 py-2 rounded-md ${statusInfo.bg}`}>
                            <p className={`font-bold text-lg ${statusInfo.color}`}>{statusInfo.text}</p>
                        </div>
                         <p className="text-sm text-gray-600 mt-4">Due Date: <span className="font-medium text-gray-800">{formatDate(invoice.dueDate)}</span></p>
                    </div>
                </section>

                {/* Line Items Table */}
                <section>
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="p-3 font-semibold text-gray-600">Description</th>
                                <th className="p-3 font-semibold text-gray-600 text-center">Qty</th>
                                <th className="p-3 font-semibold text-gray-600 text-right">Unit Price</th>
                                <th className="p-3 font-semibold text-gray-600 text-right">Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            {invoice.lineItems.map(item => (
                                <tr key={item.id} className="border-b">
                                    <td className="p-3">{item.description}</td>
                                    <td className="p-3 text-center">{item.quantity}</td>
                                    <td className="p-3 text-right">{formatCurrency(item.price)}</td>
                                    <td className="p-3 text-right">{formatCurrency(item.total)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </section>

                {/* Totals */}
                <section className="flex justify-end mt-8">
                    <div className="w-full max-w-xs space-y-2">
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Subtotal</span>
                            <span className="font-medium">{formatCurrency(invoice.subTotal)}</span>
                        </div>
                         <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Tax</span>
                            <span className="font-medium">{formatCurrency(invoice.tax)}</span>
                        </div>
                         <div className="flex justify-between font-bold text-lg border-t pt-2 mt-2">
                            <span>Amount Due</span>
                            <span>{formatCurrency(invoice.total)}</span>
                        </div>
                    </div>
                </section>
                
                {/* Footer */}
                <footer className="mt-12 pt-8 border-t text-center text-sm text-gray-500">
                     <h3 className="font-semibold text-gray-700">Payment Details</h3>
                     <p>Please make payment by the due date. {invoice.paymentTerms}.</p>
                    <p className="mt-4">Thank you for your business!</p>
                </footer>
            </div>
        </div>
    );
};

export default PrintableInvoice;