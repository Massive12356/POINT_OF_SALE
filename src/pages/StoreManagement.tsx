import { useState, useEffect } from 'react';
import {
  Store,
  Plus,
  Edit2,
  MapPin,
  Phone,
  Mail,
  User,
  Power,
  PowerOff,
  AlertCircle,
  Search,
  Building2,
  ArrowRightLeft,
} from 'lucide-react';
import { Store as StoreType } from '../types/product';
import { StoreService, StockTransferService, ProductService } from '../services/localStorageService';

/**
 * Store Management Page
 * Admin can manage multiple store locations and stock transfers
 */
export function StoreManagement() {
  const [stores, setStores] = useState<StoreType[]>([]);
  const [currentStore, setCurrentStore] = useState<StoreType | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [stats, setStats] = useState({ total: 0, active: 0, inactive: 0 });
  const [activeTab, setActiveTab] = useState<'stores' | 'transfers'>('stores');

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [selectedStore, setSelectedStore] = useState<StoreType | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    address: '',
    phone: '',
    email: '',
    managerName: '',
    isActive: true,
  });
  const [formError, setFormError] = useState('');

  // Transfer form
  const [transferForm, setTransferForm] = useState({
    fromStoreId: '',
    toStoreId: '',
    barcode: '',
    quantity: 1,
  });

  // Notification
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Load stores on mount
  useEffect(() => {
    loadStores();
  }, []);

  const loadStores = () => {
    const allStores = StoreService.getAll();
    setStores(allStores);
    setCurrentStore(StoreService.getCurrentStore() || null);
    setStats(StoreService.getStats());
  };

  const showNotification = (message: string, type: 'success' | 'error') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  // Filter stores based on search
  const filteredStores = stores.filter(
    (s) =>
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.address.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAdd = () => {
    setFormData({
      name: '',
      code: '',
      address: '',
      phone: '',
      email: '',
      managerName: '',
      isActive: true,
    });
    setFormError('');
    setIsAddModalOpen(true);
  };

  const handleEdit = (store: StoreType) => {
    setSelectedStore(store);
    setFormData({
      name: store.name,
      code: store.code,
      address: store.address,
      phone: store.phone,
      email: store.email,
      managerName: store.managerName,
      isActive: store.isActive,
    });
    setFormError('');
    setIsEditModalOpen(true);
  };

  const handleSwitchStore = (store: StoreType) => {
    StoreService.setCurrentStore(store.id);
    setCurrentStore(store);
    showNotification(`Switched to ${store.name}`, 'success');
  };

  const handleToggleActive = (store: StoreType) => {
    const result = StoreService.toggleActive(store.id);
    if (result.success) {
      loadStores();
      showNotification(
        `Store ${store.isActive ? 'deactivated' : 'activated'} successfully`,
        'success'
      );
    } else {
      showNotification(result.error || 'Failed to update status', 'error');
    }
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    const result = StoreService.add(formData);

    if (result.success) {
      loadStores();
      setIsAddModalOpen(false);
      showNotification('Store added successfully', 'success');
    } else {
      setFormError(result.error || 'Failed to add store');
    }
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStore) return;
    setFormError('');

    const result = StoreService.update(selectedStore.id, formData);

    if (result.success) {
      loadStores();
      setIsEditModalOpen(false);
      setSelectedStore(null);
      showNotification('Store updated successfully', 'success');
    } else {
      setFormError(result.error || 'Failed to update store');
    }
  };

  const handleTransferSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const fromStore = stores.find(s => s.id === transferForm.fromStoreId);
    const toStore = stores.find(s => s.id === transferForm.toStoreId);
    const product = ProductService.findByBarcode(transferForm.barcode);

    if (!fromStore || !toStore) {
      showNotification('Please select both stores', 'error');
      return;
    }

    if (!product) {
      showNotification('Product not found', 'error');
      return;
    }

    const result = StockTransferService.create({
      fromStoreId: transferForm.fromStoreId,
      toStoreId: transferForm.toStoreId,
      fromStoreName: fromStore.name,
      toStoreName: toStore.name,
      barcode: transferForm.barcode,
      productName: product.name,
      quantity: transferForm.quantity,
      status: 'pending',
      requestedBy: 'Admin',
    });

    if (result.success) {
      setIsTransferModalOpen(false);
      setTransferForm({ fromStoreId: '', toStoreId: '', barcode: '', quantity: 1 });
      showNotification('Stock transfer initiated', 'success');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Store Management</h1>
          <p className="text-gray-600 mt-1">Manage multiple store locations</p>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => setIsTransferModalOpen(true)}
            className="inline-flex items-center justify-center px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-medium"
          >
            <ArrowRightLeft className="h-5 w-5 mr-2" />
            Transfer Stock
          </button>
          <button
            onClick={handleAdd}
            className="inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            <Plus className="h-5 w-5 mr-2" />
            Add Store
          </button>
        </div>
      </div>

      {/* Current Store Badge */}
      {currentStore && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center justify-between">
          <div className="flex items-center">
            <Building2 className="h-5 w-5 text-blue-600 mr-2" />
            <span className="text-sm text-blue-800">
              Currently managing: <strong>{currentStore.name}</strong> ({currentStore.code})
            </span>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Stores</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.total}</p>
            </div>
            <div className="p-3 rounded-full bg-blue-100">
              <Store className="h-6 w-6 text-blue-600" />
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
            placeholder="Search by name, code, or address..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          />
        </div>
      </div>

      {/* Stores Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredStores.length === 0 ? (
          <div className="col-span-full text-center py-12 bg-white rounded-lg shadow-md">
            <Store className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">
              {searchQuery ? 'No stores found matching your search' : 'No stores available'}
            </p>
          </div>
        ) : (
          filteredStores.map((store) => (
            <div
              key={store.id}
              className={`bg-white rounded-lg shadow-md p-6 border-2 transition-all ${
                currentStore?.id === store.id ? 'border-blue-500' : 'border-transparent'
              }`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Building2 className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-lg font-semibold text-gray-900">{store.name}</h3>
                    <p className="text-sm text-gray-500">{store.code}</p>
                  </div>
                </div>
                <button
                  onClick={() => handleToggleActive(store)}
                  className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    store.isActive
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {store.isActive ? 'Active' : 'Inactive'}
                </button>
              </div>

              <div className="space-y-2 text-sm text-gray-600 mb-4">
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                  {store.address}
                </div>
                <div className="flex items-center">
                  <Phone className="h-4 w-4 mr-2 text-gray-400" />
                  {store.phone}
                </div>
                <div className="flex items-center">
                  <Mail className="h-4 w-4 mr-2 text-gray-400" />
                  {store.email}
                </div>
                <div className="flex items-center">
                  <User className="h-4 w-4 mr-2 text-gray-400" />
                  Manager: {store.managerName}
                </div>
              </div>

              <div className="flex space-x-2">
                <button
                  onClick={() => handleEdit(store)}
                  className="flex-1 inline-flex items-center justify-center px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <Edit2 className="h-4 w-4 mr-1" />
                  Edit
                </button>
                {currentStore?.id !== store.id && store.isActive && (
                  <button
                    onClick={() => handleSwitchStore(store)}
                    className="flex-1 inline-flex items-center justify-center px-3 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                  >
                    Switch
                  </button>
                )}
                {currentStore?.id === store.id && (
                  <span className="flex-1 inline-flex items-center justify-center px-3 py-2 bg-green-100 text-green-700 rounded-lg text-sm font-medium">
                    Current
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add/Edit Modal */}
      {(isAddModalOpen || isEditModalOpen) && (
        <StoreModal
          title={isAddModalOpen ? 'Add New Store' : 'Edit Store'}
          formData={formData}
          setFormData={setFormData}
          formError={formError}
          onSubmit={isAddModalOpen ? handleAddSubmit : handleEditSubmit}
          onClose={() => {
            setIsAddModalOpen(false);
            setIsEditModalOpen(false);
            setSelectedStore(null);
          }}
        />
      )}

      {/* Transfer Modal */}
      {isTransferModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setIsTransferModalOpen(false)} />
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full">
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Transfer Stock</h3>
                <button onClick={() => setIsTransferModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                  ×
                </button>
              </div>

              <form onSubmit={handleTransferSubmit} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">From Store</label>
                  <select
                    value={transferForm.fromStoreId}
                    onChange={(e) => setTransferForm({ ...transferForm, fromStoreId: e.target.value })}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select store...</option>
                    {stores.filter(s => s.isActive).map((s) => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">To Store</label>
                  <select
                    value={transferForm.toStoreId}
                    onChange={(e) => setTransferForm({ ...transferForm, toStoreId: e.target.value })}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select store...</option>
                    {stores.filter(s => s.isActive && s.id !== transferForm.fromStoreId).map((s) => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Product Barcode</label>
                  <input
                    type="text"
                    value={transferForm.barcode}
                    onChange={(e) => setTransferForm({ ...transferForm, barcode: e.target.value })}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter barcode"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                  <input
                    type="number"
                    min="1"
                    value={transferForm.quantity}
                    onChange={(e) => setTransferForm({ ...transferForm, quantity: parseInt(e.target.value) || 1 })}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setIsTransferModalOpen(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
                  >
                    Initiate Transfer
                  </button>
                </div>
              </form>
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
 * Store Modal Component
 */
interface StoreModalProps {
  title: string;
  formData: {
    name: string;
    code: string;
    address: string;
    phone: string;
    email: string;
    managerName: string;
    isActive: boolean;
  };
  setFormData: (data: any) => void;
  formError: string;
  onSubmit: (e: React.FormEvent) => void;
  onClose: () => void;
}

function StoreModal({ title, formData, setFormData, formError, onSubmit, onClose }: StoreModalProps) {
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
              <label className="block text-sm font-medium text-gray-700 mb-1">Store Name</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Main Branch"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Store Code</label>
              <input
                type="text"
                required
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="STORE001"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
              <textarea
                required
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="123 Main Street, City"
                rows={2}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="+1234567890"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="store@email.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Manager Name</label>
              <input
                type="text"
                required
                value={formData.managerName}
                onChange={(e) => setFormData({ ...formData, managerName: e.target.value })}
                className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="John Doe"
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
                Active (can process sales)
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
                {title.includes('Add') ? 'Add Store' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
