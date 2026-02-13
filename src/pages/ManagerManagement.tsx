import React, { useState, useMemo } from 'react';
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  Power,
  UserCheck,
  UserX,
  Building2,
  X,
  Check,
  Store as StoreIcon,
} from 'lucide-react';
import { Manager, Store } from '../types/product';
import { ManagerService, StoreService } from '../services/localStorageService';
import { NotificationToast } from '../components/NotificationToast';

/**
 * Manager Management Page
 * Allows admin to create, edit, delete, and assign managers to stores
 */
export function ManagerManagement() {
  const [managers, setManagers] = useState<Manager[]>(ManagerService.getAll());
  const [stores] = useState<Store[]>(StoreService.getAll());
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingManager, setEditingManager] = useState<Manager | null>(null);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [assigningManager, setAssigningManager] = useState<Manager | null>(null);
  const [selectedStoreId, setSelectedStoreId] = useState('');

  // Notification state
  const [notification, setNotification] = useState<{
    message: string;
    type: 'success' | 'error';
  } | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    managerId: '',
    name: '',
    email: '',
    phone: '',
    password: '',
    isActive: true,
  });

  // Filter managers based on search
  const filteredManagers = useMemo(() => {
    if (!searchQuery.trim()) return managers;
    const query = searchQuery.toLowerCase();
    return managers.filter(
      (m) =>
        m.name.toLowerCase().includes(query) ||
        m.managerId.toLowerCase().includes(query) ||
        m.email.toLowerCase().includes(query) ||
        (m.assignedStoreName && m.assignedStoreName.toLowerCase().includes(query))
    );
  }, [managers, searchQuery]);

  // Stats
  const stats = useMemo(() => ManagerService.getStats(), [managers]);

  /**
   * Show notification
   */
  const showNotification = (message: string, type: 'success' | 'error') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  /**
   * Hide notification
   */
  const hideNotification = () => {
    setNotification(null);
  };

  /**
   * Refresh managers list
   */
  const refreshManagers = () => {
    setManagers(ManagerService.getAll());
  };

  /**
   * Open add modal
   */
  const handleAdd = () => {
    setEditingManager(null);
    setFormData({
      managerId: '',
      name: '',
      email: '',
      phone: '',
      password: '',
      isActive: true,
    });
    setIsModalOpen(true);
  };

  /**
   * Open edit modal
   */
  const handleEdit = (manager: Manager) => {
    setEditingManager(manager);
    setFormData({
      managerId: manager.managerId,
      name: manager.name,
      email: manager.email,
      phone: manager.phone,
      password: '',
      isActive: manager.isActive,
    });
    setIsModalOpen(true);
  };

  /**
   * Open assign store modal
   */
  const handleAssignStore = (manager: Manager) => {
    setAssigningManager(manager);
    setSelectedStoreId(manager.assignedStoreId || '');
    setIsAssignModalOpen(true);
  };

  /**
   * Save manager (create or update)
   */
  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    if (editingManager) {
      // Update existing manager
      const updates: Partial<Manager> = {
        managerId: formData.managerId,
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        isActive: formData.isActive,
      };
      if (formData.password) {
        updates.password = formData.password;
      }

      const result = ManagerService.update(editingManager.id, updates);
      if (result.success) {
        showNotification('Manager updated successfully', 'success');
        refreshManagers();
        setIsModalOpen(false);
      } else {
        showNotification(result.error || 'Failed to update manager', 'error');
      }
    } else {
      // Create new manager
      const result = ManagerService.add({
        managerId: formData.managerId,
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        role: 'manager',
        isActive: formData.isActive,
      });

      if (result.success) {
        showNotification('Manager created successfully', 'success');
        refreshManagers();
        setIsModalOpen(false);
      } else {
        showNotification(result.error || 'Failed to create manager', 'error');
      }
    }
  };

  /**
   * Delete manager
   */
  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this manager?')) {
      const result = ManagerService.delete(id);
      if (result.success) {
        showNotification('Manager deleted successfully', 'success');
        refreshManagers();
      } else {
        showNotification(result.error || 'Failed to delete manager', 'error');
      }
    }
  };

  /**
   * Toggle manager active status
   */
  const handleToggleActive = (id: string) => {
    const result = ManagerService.toggleActive(id);
    if (result.success) {
      showNotification('Manager status updated', 'success');
      refreshManagers();
    } else {
      showNotification(result.error || 'Failed to update status', 'error');
    }
  };

  /**
   * Assign manager to store
   */
  const handleAssignConfirm = () => {
    if (!assigningManager) return;

    if (selectedStoreId) {
      const store = stores.find((s) => s.id === selectedStoreId);
      if (store) {
        const result = ManagerService.assignToStore(
          assigningManager.id,
          store.id,
          store.name
        );
        if (result.success) {
          showNotification(`Manager assigned to ${store.name}`, 'success');
        } else {
          showNotification(result.error || 'Failed to assign manager', 'error');
        }
      }
    } else {
      const result = ManagerService.removeFromStore(assigningManager.id);
      if (result.success) {
        showNotification('Manager unassigned from store', 'success');
      } else {
        showNotification(result.error || 'Failed to unassign manager', 'error');
      }
    }

    refreshManagers();
    setIsAssignModalOpen(false);
    setAssigningManager(null);
  };

  return (
    <div className="space-y-6">
      {/* Notification */}
      {notification && (
        <NotificationToast
          message={notification.message}
          type={notification.type}
          onClose={hideNotification}
        />
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Manager Management</h2>
          <p className="text-gray-600 mt-1">Create and manage store managers</p>
        </div>
        <button
          onClick={handleAdd}
          className="flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-5 w-5" />
          <span>Add Manager</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <p className="text-sm text-gray-600">Total</p>
          <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <p className="text-sm text-gray-600">Active</p>
          <p className="text-2xl font-bold text-green-600">{stats.active}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <p className="text-sm text-gray-600">Inactive</p>
          <p className="text-2xl font-bold text-red-600">{stats.inactive}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <p className="text-sm text-gray-600">Assigned</p>
          <p className="text-2xl font-bold text-blue-600">{stats.assigned}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <p className="text-sm text-gray-600">Unassigned</p>
          <p className="text-2xl font-bold text-yellow-600">{stats.unassigned}</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
        <input
          type="text"
          placeholder="Search managers by name, ID, email, or store..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Managers List - Mobile Card View */}
      <div className="sm:hidden space-y-4">
        {filteredManagers.map((manager) => (
          <div key={manager.id} className="bg-white rounded-lg shadow-sm p-4 space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-gray-900">{manager.name}</h3>
                <p className="text-sm text-gray-600">{manager.managerId}</p>
              </div>
              <span
                className={`px-2 py-1 text-xs font-medium rounded-full ${
                  manager.isActive
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }`}
              >
                {manager.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>

            <div className="text-sm space-y-1">
              <p className="text-gray-600">{manager.email}</p>
              <p className="text-gray-600">{manager.phone}</p>
              {manager.assignedStoreName ? (
                <p className="text-blue-600 flex items-center gap-1">
                  <StoreIcon className="h-4 w-4" />
                  {manager.assignedStoreName}
                </p>
              ) : (
                <p className="text-yellow-600 flex items-center gap-1">
                  <Building2 className="h-4 w-4" />
                  Not assigned
                </p>
              )}
            </div>

            <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
              <button
                onClick={() => handleAssignStore(manager)}
                className="flex-1 flex items-center justify-center space-x-1 px-3 py-2 text-sm bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100"
              >
                <Building2 className="h-4 w-4" />
                <span>Assign</span>
              </button>
              <button
                onClick={() => handleEdit(manager)}
                className="flex-1 flex items-center justify-center space-x-1 px-3 py-2 text-sm bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100"
              >
                <Edit2 className="h-4 w-4" />
                <span>Edit</span>
              </button>
              <button
                onClick={() => handleToggleActive(manager.id)}
                className={`flex-1 flex items-center justify-center space-x-1 px-3 py-2 text-sm rounded-lg ${
                  manager.isActive
                    ? 'bg-yellow-50 text-yellow-700 hover:bg-yellow-100'
                    : 'bg-green-50 text-green-700 hover:bg-green-100'
                }`}
              >
                {manager.isActive ? (
                  <>
                    <UserX className="h-4 w-4" />
                    <span>Disable</span>
                  </>
                ) : (
                  <>
                    <UserCheck className="h-4 w-4" />
                    <span>Enable</span>
                  </>
                )}
              </button>
              <button
                onClick={() => handleDelete(manager.id)}
                className="flex items-center justify-center px-3 py-2 text-sm bg-red-50 text-red-700 rounded-lg hover:bg-red-100"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Managers Table - Desktop */}
      <div className="hidden sm:block bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Manager
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Assigned Store
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
            <tbody className="divide-y divide-gray-200">
              {filteredManagers.map((manager) => (
                <tr key={manager.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{manager.name}</p>
                      <p className="text-sm text-gray-500">{manager.managerId}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{manager.email}</div>
                    <div className="text-sm text-gray-500">{manager.phone}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {manager.assignedStoreName ? (
                      <div className="flex items-center text-sm text-blue-600">
                        <StoreIcon className="h-4 w-4 mr-1" />
                        {manager.assignedStoreName}
                      </div>
                    ) : (
                      <div className="flex items-center text-sm text-yellow-600">
                        <Building2 className="h-4 w-4 mr-1" />
                        Not assigned
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${
                        manager.isActive
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {manager.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {manager.lastLogin
                      ? new Date(manager.lastLogin).toLocaleDateString()
                      : 'Never'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        onClick={() => handleAssignStore(manager)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                        title="Assign to Store"
                      >
                        <Building2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleEdit(manager)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                        title="Edit"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleToggleActive(manager.id)}
                        className={`p-2 rounded-lg ${
                          manager.isActive
                            ? 'text-yellow-600 hover:bg-yellow-50'
                            : 'text-green-600 hover:bg-green-50'
                        }`}
                        title={manager.isActive ? 'Disable' : 'Enable'}
                      >
                        <Power className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(manager.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Empty State */}
      {filteredManagers.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg shadow-sm">
          <UserCheck className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No managers found</h3>
          <p className="text-gray-600 mb-4">
            {searchQuery
              ? 'No managers match your search criteria'
              : 'Get started by adding your first manager'}
          </p>
          {!searchQuery && (
            <button
              onClick={handleAdd}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Add Manager
            </button>
          )}
        </div>
      )}

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                {editingManager ? 'Edit Manager' : 'Add Manager'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Manager ID *
                </label>
                <input
                  type="text"
                  required
                  value={formData.managerId}
                  onChange={(e) => setFormData({ ...formData, managerId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., MGR001"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter manager name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email *
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter email address"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter phone number"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password {editingManager && '(leave blank to keep current)'}
                </label>
                <input
                  type="password"
                  required={!editingManager}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder={editingManager ? '••••••••' : 'Enter password'}
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
                <label htmlFor="isActive" className="ml-2 text-sm text-gray-700">
                  Active
                </label>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  {editingManager ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Assign Store Modal */}
      {isAssignModalOpen && assigningManager && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                Assign Manager to Store
              </h3>
              <button
                onClick={() => setIsAssignModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <p className="text-gray-600">
                Assign <strong>{assigningManager.name}</strong> to a store:
              </p>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Store
                </label>
                <select
                  value={selectedStoreId}
                  onChange={(e) => setSelectedStoreId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">-- Not Assigned --</option>
                  {stores
                    .filter((s) => s.isActive)
                    .map((store) => (
                      <option key={store.id} value={store.id}>
                        {store.name} ({store.code})
                      </option>
                    ))}
                </select>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  onClick={() => setIsAssignModalOpen(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAssignConfirm}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center space-x-2"
                >
                  <Check className="h-4 w-4" />
                  <span>Confirm</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
