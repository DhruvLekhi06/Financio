import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import Button from './Button';
import Dropdown, { DropdownOption } from './Dropdown';
import { useData } from '../../hooks/useData';
import type { Invoice, PaymentReceived } from '../../types';
import DatePicker from './DatePicker';

const inputStyle = "block w-full rounded-md border-gray-300 dark:border-primary-600 bg-gray-50 dark:bg-primary-700/50 shadow-sm focus:border-secondary-500 focus:ring focus:ring-secondary-500 focus:ring-opacity-50 transition-colors duration-200";

interface RecordPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: Invoice;
  onRecordPayment: (invoiceId: string, paymentDetails: Omit<PaymentReceived, 'id' | 'invoiceId' | 'customerId' | 'customerName' | 'paymentId'>) => void;
  allowInvoiceChange?: boolean;
}

const RecordPaymentModal: React.FC<RecordPaymentModalProps> = ({ isOpen, onClose, invoice, onRecordPayment, allowInvoiceChange = false }) => {
    const { invoices } = useData();
    const [selectedInvoiceId, setSelectedInvoiceId] = useState(invoice.id);
    const [amount, setAmount] = useState(String(invoice.total));
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [method, setMethod] = useState<'Credit Card' | 'Bank Transfer' | 'PayPal'>('Bank Transfer');
    
    useEffect(() => {
        // Update form if the initial invoice prop changes
        setSelectedInvoiceId(invoice.id);
        setAmount(String(invoice.total));
    }, [invoice]);
    
    const unpaidInvoices = invoices.filter(inv => inv.status !== 'Paid' && inv.status !== 'Cancelled');
    const invoiceOptions = unpaidInvoices.map(inv => ({ value: inv.id, label: `${inv.invoiceId} - ${inv.total}` }));
    const methodOptions: DropdownOption[] = [
        { value: 'Bank Transfer', label: 'Bank Transfer' },
        { value: 'Credit Card', label: 'Credit Card' },
        { value: 'PayPal', label: 'PayPal' },
    ];
    
    const handleSubmit = () => {
        onRecordPayment(selectedInvoiceId, {
            amount: parseFloat(amount),
            date,
            method
        });
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Record Payment">
            <div className="space-y-4">
                {allowInvoiceChange && (
                    <div>
                        <label className="block text-sm font-medium">For Invoice</label>
                        <Dropdown options={invoiceOptions} value={selectedInvoiceId} onChange={setSelectedInvoiceId} />
                    </div>
                )}
                <div className="grid grid-cols-2 gap-4">
                     <div>
                        <label className="block text-sm font-medium">Amount</label>
                        <input type="number" value={amount} onChange={e => setAmount(e.target.value)} className={`mt-1 ${inputStyle}`} />
                    </div>
                     <div>
                        <label className="block text-sm font-medium">Payment Date</label>
                        <DatePicker value={date} onChange={setDate} />
                    </div>
                </div>
                 <div>
                    <label className="block text-sm font-medium">Payment Method</label>
                    <Dropdown options={methodOptions} value={method} onChange={(v) => setMethod(v as any)} />
                </div>
                <div className="pt-4 flex justify-end gap-2">
                    <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
                    <Button onClick={handleSubmit}>Record Payment</Button>
                </div>
            </div>
        </Modal>
    );
};

export default RecordPaymentModal;
