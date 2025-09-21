
import React, { useState } from 'react';
import Modal from '../shared/Modal';
import Button from '../shared/Button';
import Spinner from '../shared/Spinner';
import Dropdown, { DropdownOption } from '../shared/Dropdown';
import { useData } from '../../hooks/useData';
import { parseCsv } from '../../utils/helpers';
import type { DemoData } from '../../types';

// FIX: Changed 'clients' to 'customers' to match the DemoData keys
type ImportableKey = 'transactions' | 'customers' | 'vendors';

const dataTypeOptions: DropdownOption[] = [
    { value: 'transactions', label: 'Transactions' },
    // FIX: Changed value from 'clients' to 'customers'
    { value: 'customers', label: 'Customers' },
    { value: 'vendors', label: 'Vendors' },
];

const ImportDataModal: React.FC<{ isOpen: boolean, onClose: () => void }> = ({ isOpen, onClose }) => {
    const { importData } = useData();
    const [dataType, setDataType] = useState<ImportableKey>('transactions');
    const [file, setFile] = useState<File | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setFile(e.target.files[0]);
            setError(null);
            setSuccess(null);
        }
    };

    const handleImport = async () => {
        if (!file) {
            setError('Please select a file to import.');
            return;
        }
        setIsLoading(true);
        setError(null);
        setSuccess(null);
        
        try {
            const text = await file.text();
            const data = parseCsv(text);
            
            if (data.length === 0) {
                throw new Error("CSV is empty or couldn't be parsed.");
            }
            
            importData(dataType, data);
            setSuccess(`${data.length} records imported successfully!`);
            setFile(null);

        } catch (err: any) {
            setError(err.message || 'An error occurred during import.');
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleClose = () => {
        setFile(null);
        setError(null);
        setSuccess(null);
        setIsLoading(false);
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={handleClose} title="Import Data from CSV">
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Data Type</label>
                    <Dropdown
                        options={dataTypeOptions}
                        value={dataType}
                        onChange={(v) => setDataType(v as ImportableKey)}
                    />
                </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">CSV File</label>
                    <input 
                        type="file" 
                        accept=".csv"
                        onChange={handleFileChange}
                        className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-secondary-50 dark:file:bg-secondary-900/40 file:text-secondary-700 dark:file:text-secondary-300 hover:file:bg-secondary-100 dark:hover:file:bg-secondary-900/60" 
                        disabled={isLoading}
                    />
                     <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                        Ensure your CSV has a header row matching the data structure (e.g., date, description, amount, type, category).
                    </p>
                </div>
                
                {error && <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 text-sm rounded-md">{error}</div>}
                {success && <div className="p-3 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 text-sm rounded-md">{success}</div>}

                <div className="pt-4 flex justify-end gap-2">
                    <Button type="button" variant="secondary" onClick={handleClose} disabled={isLoading}>
                        Close
                    </Button>
                    <Button onClick={handleImport} disabled={!file || isLoading}>
                        {isLoading ? <Spinner /> : 'Import'}
                    </Button>
                </div>
            </div>
        </Modal>
    );
};

export default ImportDataModal;
