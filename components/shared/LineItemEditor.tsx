import React, { useEffect } from 'react';
import type { LineItem } from '../../types';
import { TrashIcon } from '../Icons';
import { formatCurrency } from '../../utils/helpers';
import Button from './Button';

interface LineItemEditorProps {
  items: LineItem[];
  onItemsChange: (items: LineItem[]) => void;
  onTotalsChange: (totals: { subTotal: number; tax: number; total: number }) => void;
}

const inputStyle = "block w-full rounded-md border-gray-300 dark:border-primary-600 bg-gray-50 dark:bg-primary-700/50 shadow-sm focus:border-secondary-500 focus:ring focus:ring-secondary-500 focus:ring-opacity-50 transition-colors duration-200 p-2 text-sm";


const LineItemEditor: React.FC<LineItemEditorProps> = ({ items, onItemsChange, onTotalsChange }) => {
    
    useEffect(() => {
        const subTotal = items.reduce((sum, item) => sum + item.total, 0);
        const tax = subTotal * 0.0; // Assuming 0% tax for now
        const total = subTotal + tax;
        onTotalsChange({ subTotal, tax, total });
    }, [items, onTotalsChange]);
    
    const handleItemChange = (index: number, field: keyof LineItem, value: string | number) => {
        const newItems = [...items];
        const item = { ...newItems[index] };
        (item[field] as any) = value;

        if (field === 'quantity' || field === 'price') {
            item.total = item.quantity * item.price;
        }
        
        newItems[index] = item;
        onItemsChange(newItems);
    };

    const addItem = () => {
        onItemsChange([...items, { id: `line-${Date.now()}`, description: '', quantity: 1, price: 0, total: 0 }]);
    };

    const removeItem = (index: number) => {
        onItemsChange(items.filter((_, i) => i !== index));
    };

    const totals = items.reduce((acc, item) => ({
        subTotal: acc.subTotal + item.total,
        total: acc.total + item.total // Simplified total
    }), { subTotal: 0, total: 0 });

    return (
        <div className="space-y-4 pt-4 border-t dark:border-primary-700">
            <h3 className="text-md font-semibold text-gray-800 dark:text-white">Items</h3>
            <div className="space-y-3">
                {items.map((item, index) => (
                    <div key={item.id} className="grid grid-cols-12 gap-2 items-center">
                        <input
                            type="text"
                            placeholder="Description"
                            value={item.description}
                            onChange={e => handleItemChange(index, 'description', e.target.value)}
                            className={`col-span-5 ${inputStyle}`}
                        />
                         <input
                            type="number"
                            placeholder="Qty"
                            value={item.quantity}
                            onChange={e => handleItemChange(index, 'quantity', Number(e.target.value))}
                            className={`col-span-2 ${inputStyle}`}
                        />
                         <input
                            type="number"
                            step="0.01"
                            placeholder="Price"
                            value={item.price}
                            onChange={e => handleItemChange(index, 'price', Number(e.target.value))}
                            className={`col-span-2 ${inputStyle}`}
                        />
                        <div className="col-span-2 p-2 text-sm text-right font-mono">{formatCurrency(item.total)}</div>
                        <button type="button" onClick={() => removeItem(index)} className="col-span-1 text-gray-400 hover:text-red-500">
                            <TrashIcon className="w-4 h-4" />
                        </button>
                    </div>
                ))}
            </div>
            <Button type="button" variant="secondary" onClick={addItem}>Add Item</Button>

            <div className="flex justify-end pt-4">
                <div className="w-full max-w-xs space-y-2">
                    <div className="flex justify-between">
                        <span className="text-sm font-medium">Subtotal</span>
                        <span className="text-sm font-mono">{formatCurrency(totals.subTotal)}</span>
                    </div>
                    <div className="flex justify-between font-bold text-lg">
                        <span>Total</span>
                        <span className="font-mono">{formatCurrency(totals.total)}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LineItemEditor;