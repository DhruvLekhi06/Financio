import React, { useState } from 'react';
import Card from '../../components/shared/Card';
import Button from '../../components/shared/Button';
import Modal from '../../components/shared/Modal';
import ConfirmationModal from '../../components/shared/ConfirmationModal';
import { useAuth } from '../../hooks/useAuth';
import { useData } from '../../hooks/useData';

const SettingsPage: React.FC = () => {
  const { user, updateUser, logout } = useAuth();
  const { budgets, addBudgetCategory, deleteBudgetCategory, resetData } = useData();

  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryBudget, setNewCategoryBudget] = useState('');
  const [isCategoryDeleteModalOpen, setIsCategoryDeleteModalOpen] = useState(false);
  const [deletingCategory, setDeletingCategory] = useState<string | null>(null);

  const [profile, setProfile] = useState({
      fullName: user?.fullName || '',
      companyName: user?.companyName || ''
  });

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: value }));
  };

  const handleProfileSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateUser(profile);
    alert('Profile updated!');
  };

  const handleAddCategory = () => {
      if (newCategoryName.trim() && !budgets.some(b => b.category.toLowerCase() === newCategoryName.trim().toLowerCase())) {
          addBudgetCategory({
              category: newCategoryName.trim(),
              budget: Number(newCategoryBudget) || 0
          });
          setNewCategoryName('');
          setNewCategoryBudget('');
          setIsCategoryModalOpen(false);
      } else {
          alert('Category name cannot be empty or already exist.');
      }
  };

  const handleResetData = () => {
    resetData();
    setIsResetModalOpen(false);
    logout();
  }

  const handleDeleteCategory = (categoryName: string) => {
    setDeletingCategory(categoryName);
    setIsCategoryDeleteModalOpen(true);
  };

  const confirmDeleteCategory = () => {
    if (deletingCategory) {
        deleteBudgetCategory(deletingCategory);
    }
    setIsCategoryDeleteModalOpen(false);
    setDeletingCategory(null);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <Card>
        <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 border-b dark:border-gray-700 pb-4">Profile Settings</h2>
        <form className="space-y-6" onSubmit={handleProfileSave}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Full Name</label>
              <input type="text" name="fullName" value={profile.fullName} onChange={handleProfileChange} className="mt-1 block w-full input-style" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email Address</label>
              <input type="email" defaultValue={user?.email || ''} disabled className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 dark:text-gray-400 shadow-sm cursor-not-allowed" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Company Name</label>
            <input type="text" name="companyName" value={profile.companyName} onChange={handleProfileChange} className="mt-1 block w-full input-style" />
          </div>
          <div className="text-right">
            <Button type="submit">Save Changes</Button>
          </div>
        </form>
      </Card>
      
       <Card>
        <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 border-b dark:border-gray-700 pb-4">Manage Categories</h2>
        <div className="space-y-3 mb-4">
            {budgets.map(budget => (
                <div key={budget.category} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                    <span className="font-medium">{budget.category}</span>
                    <Button variant="ghost" size="sm" onClick={() => handleDeleteCategory(budget.category)}>Delete</Button>
                </div>
            ))}
        </div>
        <Button variant="secondary" onClick={() => setIsCategoryModalOpen(true)}>Add New Category</Button>
      </Card>

      <Card>
        <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 border-b dark:border-gray-700 pb-4">Data Management</h2>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
                <h3 className="font-medium text-gray-900 dark:text-white">Reset Account Data</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Permanently delete all financial data from your account.</p>
            </div>
            <Button variant="secondary" className="border-red-500 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/40" onClick={() => setIsResetModalOpen(true)}>Reset Data</Button>
        </div>
      </Card>

      <Modal isOpen={isCategoryModalOpen} onClose={() => setIsCategoryModalOpen(false)} title="Add New Category">
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium">Category Name</label>
                    <input 
                        type="text" 
                        value={newCategoryName} 
                        onChange={(e) => setNewCategoryName(e.target.value)}
                        className="mt-1 block w-full input-style"
                        placeholder="e.g. Office Supplies"
                    />
                </div>
                 <div>
                    <label className="block text-sm font-medium">Monthly Budget (Optional)</label>
                    <input 
                        type="number" 
                        value={newCategoryBudget} 
                        onChange={(e) => setNewCategoryBudget(e.target.value)}
                        className="mt-1 block w-full input-style"
                        placeholder="e.g. 250"
                    />
                </div>
                <div className="pt-4 flex justify-end gap-2">
                    <Button variant="secondary" onClick={() => setIsCategoryModalOpen(false)}>Cancel</Button>
                    <Button onClick={handleAddCategory}>Add Category</Button>
                </div>
            </div>
        </Modal>

        <ConfirmationModal
            isOpen={isResetModalOpen}
            onClose={() => setIsResetModalOpen(false)}
            onConfirm={handleResetData}
            title="Are you absolutely sure?"
            confirmText="RESET"
            confirmButtonText="Reset Data"
            confirmButtonVariant="danger"
        >
            This action cannot be undone. This will permanently delete all your financial data, including transactions, clients, and settings. To confirm, please type <strong>RESET</strong> in the box below.
        </ConfirmationModal>

        <ConfirmationModal
            isOpen={isCategoryDeleteModalOpen}
            onClose={() => setIsCategoryDeleteModalOpen(false)}
            onConfirm={confirmDeleteCategory}
            title="Delete Category"
            confirmButtonText="Delete"
            confirmButtonVariant="danger"
        >
            Are you sure you want to delete the "{deletingCategory}" category? All associated transactions will be moved to "Uncategorized".
        </ConfirmationModal>

    </div>
  );
};

export default SettingsPage;
