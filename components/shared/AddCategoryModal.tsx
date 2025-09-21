import React, { useState } from 'react';
import Modal from './Modal';
import Button from './Button';

interface AddCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (name: string, budget: number) => void;
}

const AddCategoryModal: React.FC<AddCategoryModalProps> = ({ isOpen, onClose, onAdd }) => {
  const [name, setName] = useState('');
  const [budget, setBudget] = useState('');

  const handleAdd = () => {
    if (name.trim()) {
      onAdd(name.trim(), Number(budget) || 0);
      // Reset state and close
      setName('');
      setBudget('');
      onClose();
    }
  };
  
  const handleClose = () => {
      setName('');
      setBudget('');
      onClose();
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Add New Category">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Category Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 dark:border-primary-600 bg-primary-50 dark:bg-primary-700 shadow-sm focus:ring-secondary-500 focus:border-secondary-500"
            placeholder="e.g. Office Supplies"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Monthly Budget (Optional)</label>
          <input
            type="number"
            value={budget}
            onChange={(e) => setBudget(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 dark:border-primary-600 bg-primary-50 dark:bg-primary-700 shadow-sm focus:ring-secondary-500 focus:border-secondary-500"
            placeholder="e.g. 250"
          />
        </div>
        <div className="pt-4 flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={handleClose}>Cancel</Button>
          <Button onClick={handleAdd}>Add Category</Button>
        </div>
      </div>
    </Modal>
  );
};

export default AddCategoryModal;
