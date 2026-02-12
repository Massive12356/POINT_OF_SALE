import { useState, useEffect } from 'react';
import {
  Users,
  Plus,
  Edit2,
  Trash2,
  Search,
  Mail,
  Phone,
  User,
  Power,
  PowerOff,
  AlertCircle,
} from 'lucide-react';
import { Cashier } from '../types/product';
import { CashierService } from '../services/localStorageService';

/**
 * Cashier Management Page
 * Admin can view, add, edit, delete, and manage cashier accounts
 */
export function CashierManagement() {
  const [cashiers, setCashiers] = useState<Cashier[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [stats, setStats] = useState({ total: 0, active: 0, inactive: 0 });

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedCashier, setSelectedCashier] = useState<Cashier | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    cashierId: '',
    name: '',
    email: '',
    phone: '',
    password: '',
    isActive: true,
  });
  const [formError, setFormError] = useState('');

  // Notification
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Load cashiers on mount
  useEffect(() => {
    loadCashiers();
  }, []);

  const loadCashiers = () => {
    const allCashiers = CashierService.getAll();
    setCashiers(allCashiers);
    setStats(CashierService.getStats());
  };

  const showNotification = (message: string, type: 'success' | 'error') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  // Filter cashiers based on search
  const filteredCashiers = cashiers.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.cashierId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Handle add cashier
  const handleAdd = () => {
    setFormData({
      cashierId: '',
      name: '',
      email: '',
      phone: '',
      password: '',
      isActive: true,
    });
    setFormError('');
    setIsAddModalOpen(true);
  };

  // Handle edit cashier
  const handleEdit = (cashier: Cashier) => {
    setSelectedCashier(cashier);
    setFormData({
      cashierId: cashier.cashierId,
      name: cashier.name,
      email: cashier.email,
      phone: cashier.phone,
      password: '',
      isActive: cashier.isActive,
    });
    setFormError('');
    setIsEditModalOpen(true);
  };

  // Handle delete cashier
  const handleDeleteClick = (cashier: Cashier) => {
    setSelectedCashier(cashier);
    setIsDeleteModalOpen(true);
  };

  // Toggle active status
  const handleToggleActive = (cashier: Cashier) => {
    const result = CashierService.toggleActive(cashier.id);
    if (result.success) {
      loadCashiers();
      showNotification(
        `Cashier ${cashier.isActive ? 'deactivated' : 'activated'} successfully`,
        'success'
      );
    } else {
      showNotification(result.error || 'Failed to update status', 'error');
    }
  };

  // Submit add form
  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    const result = CashierService.add({
      ...formData,
      role: 'cashier',
    });

    if (result.success) {
      loadCashiers();
      setIsAddModalOpen(false);
      showNotification('Cashier added successfully', 'success');
    } else {
      setFormError(result.error || 'Failed to add cashier');
    }
  };

  // Submit edit form
  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCashier) return;
    setFormError('');

    const updates: Partial<Cashier> = {
      cashierId: formData.cashierId,
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      isActive: formData.isActive,
    };

    if (formData.password) {
      updates.password = formData.password;
    }

    const result = CashierService.update(selectedCashier.id, updates);

    if (result.success) {
      loadCashiers();
      setIsEditModalOpen(false);
      setSelectedCashier(null);
      showNotification('Cashier updated successfully', 'success');
    } else {
      setFormError(result.error || 'Failed to update cashier');
    }
  };

  // Confirm delete
  const handleConfirmDelete = () => {
    if (!selectedCashier) return;

    const result = CashierService.delete(selectedCashier.id);
    if (result.success) {
      loadCashiers();
      setIsDeleteModalOpen(false);
      setSelectedCashier(null);
      showNotification('Cashier deleted successfully', 'success');
    } else {
      showNotification(result.error || 'Failed to delete cashier', 'error');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Cashier Management</h1>
          <p className="text-gray-600 mt-1">Manage cashier accounts and permissions</p>
        </div>
        <button
          onClick={handleAdd}
          className="inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          <Plus className="h-5 w-5 mr-2" />
          Add Cashier
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Cashiers</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.total}</p>
            </div>
            <div className="p-3 rounded-full bg-blue-100">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active</p>
              <p className="text-3xl font-bold text-green-600 mt-2">{stats.active}</p>
            </div>
            <div className="p-3 rounded-full bg-green-100">
              <Power className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Inactive</p>
              <p className="text-3xl font-bold text-red-600 mt-2">{stats.inactive}</p>
            </div>
            <div className="p-3 rounded-full bg-red-100">
              <PowerOff className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-lg shadow-md p-4">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search by name, ID, or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          />
        </div>
      </div>

      {/* Cashiers Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cashier
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Login
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredCashiers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <Users className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">
                      {searchQuery ? 'No cashiers found matching your search' : 'No cashiers available'}
                    </p>
                  </td>
                </tr>
              ) : (
                filteredCashiers.map((cashier) => (
                  <tr key={cashier.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <User className="h-5 w-5 text-blue-600" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{cashier.name}</div>
                          <div className="text-sm text-gray-500">{cashier.cashierId}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 flex items-center">
                        <Mail className="h-4 w-4 mr-1 text-gray-400" />
                        {cashier.email}
                      </div>
                      <div className="text-sm text-gray-500 flex items-center mt-1">
                        <Phone className="h-4 w-4 mr-1 text-gray-400" />
                        {cashier.phone}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => handleToggleActive(cashier)}
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          cashier.isActive
                            ? 'bg-green-100 text-green-800 hover:bg-green-200'
                            : 'bg-red-100 text-red-800 hover:bg-red-200'
                        }`}
                      >
                        {cashier.isActive ? (
                          <>
                            <Power className="h-3 w-3 mr-1" />
                            Active
                          </>
                        ) : (
                          <>
                            <PowerOff className="h-3 w-3 mr-1" />
                            Inactive
                          </>
                        )}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {cashier.lastLogin
                        ? new Date(cashier.lastLogin).toLocaleDateString()
                        : 'Never'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => handleEdit(cashier)}
                          className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50 transition-colors"
                          title="Edit"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(cashier)}
                          className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Modal */}
      {isAddModalOpen && (
        <CashierModal
          title="Add New Cashier"
          formData={formData}
          setFormData={setFormData}
          formError={formError}
          onSubmit={handleAddSubmit}
          onClose={() => setIsAddModalOpen(false)}
          isEdit={false}
        />
      )}

      {/* Edit Modal */}
      {isEditModalOpen && selectedCashier && (
        <CashierModal
          title="Edit Cashier"
          formData={formData}
          setFormData={setFormData}
          formError={formError}
          onSubmit={handleEditSubmit}
          onClose={() => {
            setIsEditModalOpen(false);
            setSelectedCashier(null);
          }}
          isEdit={true}
        />
      )}

      {/* Delete Modal */}
      {isDeleteModalOpen && selectedCashier && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setIsDeleteModalOpen(false)} />
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full p-6">
              <div className="flex items-center justify-center mb-4">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                  <AlertCircle className="h-6 w-6 text-red-600" />
                </div>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 text-center mb-2">
                Delete Cashier
              </h3>
              <p className="text-gray-600 text-center mb-6">
                Are you sure you want to delete <strong>{selectedCashier.name}</strong>? This action cannot be undone.
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={() => setIsDeleteModalOpen(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmDelete}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Notification */}
      {notification && (
        <div
          className={`fixed bottom-4 right-4 px-6 py-3 rounded-lg shadow-lg transition-all ${
            notification.type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
          }`}
        >
          {notification.message}
        </div>
      )}
    </div>
  );
}

/**
 * Cashier Modal Component for Add/Edit
 */
interface CashierModalProps {
  title: string;
  formData: {
    cashierId: string;
    name: string;
    email: string;
    phone: string;
    password: string;
    isActive: boolean;
  };
  setFormData: (data: any) => void;
  formError: string;
  onSubmit: (e: React.FormEvent) => void;
  onClose: () => void;
  isEdit: boolean;
}

function CashierModal({ title, formData, setFormData, formError, onSubmit, onClose, isEdit }: CashierModalProps) {
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose} />
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              ×
            </button>
          </div>

          <form onSubmit={onSubmit} className="p-6 space-y-4">
            {formError && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {formError}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Cashier ID</label>
              <input
                type="text"
                required
                value={formData.cashierId}
                onChange={(e) => setFormData({ ...formData, cashierId: e.target.value.toUpperCase() })}
                className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="CASHIER001"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="John Doe"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="john@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <input
                type="tel"
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="+1234567890"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password {isEdit && '(leave blank to keep current)'}
              </label>
              <input
                type="password"
                required={!isEdit}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder={isEdit ? '••••••' : 'Enter password'}
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="isActive"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="isActive" className="ml-2 block text-sm text-gray-700">
                Active (can login and process sales)
              </label>
            </div>

            <div className="flex space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                {isEdit ? 'Save Changes' : 'Add Cashier'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
