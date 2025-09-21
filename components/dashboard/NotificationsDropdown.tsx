
import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useData } from '../../hooks/useData';
import { BellIcon, InvoiceIcon, ReceiptIcon } from '../Icons';
import { formatCurrency } from '../../utils/helpers';

interface Notification {
    id: string;
    icon: React.ReactNode;
    text: string;
    time: string;
}

const NotificationsDropdown: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    // FIX: Added customers to look up names for invoices
    const { invoices, budgets, paymentsReceived, customers } = useData();

    // FIX: Create a map for efficient customer name lookup
    const customerNameMap = useMemo(() =>
        customers.reduce((acc, customer) => {
            acc[customer.id] = customer.name;
            return acc;
        }, {} as Record<string, string>),
    [customers]);

    const notifications: Notification[] = useMemo(() => {
        const generated: Notification[] = [];
        const today = new Date();
        
        // Overdue Invoices
        invoices.forEach(invoice => {
            const dueDate = new Date(invoice.date);
            if (invoice.status === 'Sent' && dueDate < today) {
                const daysOverdue = Math.floor((today.getTime() - dueDate.getTime()) / (1000 * 3600 * 24));
                if (daysOverdue > 0) {
                     generated.push({
                        id: `inv-${invoice.id}`,
                        icon: <InvoiceIcon className="w-5 h-5 text-red-500" />,
                        // FIX: Used customerNameMap to get customer name
                        text: `Invoice #${invoice.invoiceId} for ${customerNameMap[invoice.customerId] || 'a customer'} is ${daysOverdue} day${daysOverdue > 1 ? 's' : ''} overdue.`,
                        time: "Overdue"
                    });
                }
            }
        });
        
        // Recent Payments
        paymentsReceived.slice(0, 2).forEach(p => {
             generated.push({
                id: `pay-${p.id}`,
                icon: <ReceiptIcon className="w-5 h-5 text-green-500" />,
                // FIX: Changed non-existent property 'customerOrVendor' to 'customerName'
                text: `Payment of ${formatCurrency(p.amount)} received from ${p.customerName}.`,
                time: new Date(p.date).toLocaleDateString()
            });
        });
        
        // Budget warnings
        budgets.forEach(b => {
            if (b.budget > 0 && (b.spent / b.budget) > 0.9) {
                 generated.push({
                    id: `bud-${b.category}`,
                    icon: <BellIcon className="w-5 h-5 text-yellow-500" />,
                    text: `Your monthly '${b.category}' budget is at ${((b.spent/b.budget)*100).toFixed(0)}%.`,
                    time: "This month"
                });
            }
        });

        // For demo purposes if no other notifications
        if (generated.length === 0) {
            generated.push({
                id: 'placeholder',
                icon: <BellIcon className="w-5 h-5 text-gray-500"/>,
                text: "You're all caught up! No new notifications.",
                time: "Just now"
            })
        }

        return generated.slice(0, 5); // Limit to 5 notifications

    }, [invoices, budgets, paymentsReceived, customerNameMap]);


    return (
        <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full right-0 mt-2 w-80 bg-white dark:bg-primary-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 z-50 overflow-hidden"
        >
            <div className="p-3 border-b border-gray-100 dark:border-gray-700">
                <h3 className="font-semibold text-sm">Notifications</h3>
            </div>
            <div className="max-h-80 overflow-y-auto">
                {notifications.map(notification => (
                    <div key={notification.id} className="p-3 flex items-start gap-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 border-b border-gray-100 dark:border-gray-700 last:border-b-0">
                        <div className="flex-shrink-0 mt-0.5">{notification.icon}</div>
                        <div>
                            <p className="text-sm text-gray-700 dark:text-gray-200">{notification.text}</p>
                            <p className="text-xs text-gray-400 mt-1">{notification.time}</p>
                        </div>
                    </div>
                ))}
            </div>
             <div className="p-2 bg-gray-50 dark:bg-gray-900/50 text-center">
                <button onClick={onClose} className="text-sm font-medium text-primary-600 dark:text-primary-400 hover:underline">
                    Close
                </button>
            </div>
        </motion.div>
    );
};

export default NotificationsDropdown;
