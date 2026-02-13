import { useState, useEffect } from 'react';
import {
  Receipt,
  Search,
  Calendar,
  User,
  CreditCard,
  Banknote,
  Smartphone,
  Package,
  CheckCircle,
  XCircle,
  RotateCcw,
  AlertCircle,
  DollarSign,
  TrendingUp,
  Store,
} from 'lucide-react';
import { SaleRecord, PaymentMethod } from '../types/product';
import { SaleService, StoreService } from '../services/localStorageService';
import { useStore } from '../contexts/StoreContext';

/**
 * Sales History Page
 * Admin can view all sales, search by receipt number, and verify returns
 */
export function SalesHistory() {
  const { currentStore } = useStore();
  const [sales, setSales] = useState<SaleRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSale, setSelectedSale] = useState<SaleRecord | null>(null);
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'week' | 'month'>('all');
  const [stats, setStats] = useState({
    totalSales: 0,
    totalRevenue: 0,
    totalItems: 0,
    averageSale: 0,
  });

  // Notification
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Load sales function - defined before useEffect
  const loadSales = () => {
    // Get current store from service to ensure fresh data
    const currentStoreId = StoreService.getCurrentStore()?.id;
    // Filter sales by current store if one is selected
    const allSales = currentStoreId 
      ? SaleService.getByStore(currentStoreId)
      : SaleService.getAll();
    setSales(allSales);
    updateStats(allSales);
  };

  // Load sales on mount and when store changes
  useEffect(() => {
    loadSales();
    
    // Listen for store change events
    const handleStoreChange = () => {
      loadSales();
    };
    window.addEventListener('storeChanged', handleStoreChange);
    
    // Also reload when window gains focus
    const handleFocus = () => {
      loadSales();
    };
    window.addEventListener('focus', handleFocus);
    
    return () => {
      window.removeEventListener('storeChanged', handleStoreChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, [currentStore]);

  const updateStats = (salesData: SaleRecord[]) => {
    const totalRevenue = salesData.reduce((sum, sale) => sum + sale.total, 0);
    const totalItems = salesData.reduce((sum, sale) => 
      sum + sale.items.reduce((itemSum, item) => itemSum + item.quantity, 0), 0
    );
    setStats({
      totalSales: salesData.length,
      totalRevenue,
      totalItems,
      averageSale: salesData.length > 0 ? totalRevenue / salesData.length : 0,
    });
  };

  const showNotification = (message: string, type: 'success' | 'error') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  // Filter sales based on search and date
  const filteredSales = sales.filter((sale) => {
    // Search filter
    const matchesSearch = 
      sale.receiptNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sale.cashierName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sale.items.some(item => item.name.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesSearch) return false;

    // Date filter
    if (dateFilter === 'all') return true;
    
    const saleDate = new Date(sale.timestamp);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    switch (dateFilter) {
      case 'today':
        const saleDay = new Date(saleDate);
        saleDay.setHours(0, 0, 0, 0);
        return saleDay.getTime() === today.getTime();
      case 'week':
        const weekAgo = new Date(today);
        weekAgo.setDate(weekAgo.getDate() - 7);
        return saleDate >= weekAgo;
      case 'month':
        const monthAgo = new Date(today);
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        return saleDate >= monthAgo;
      default:
        return true;
    }
  }).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  const getPaymentIcon = (method: PaymentMethod) => {
    switch (method) {
      case 'cash':
        return <Banknote className="h-4 w-4" />;
      case 'card':
        return <CreditCard className="h-4 w-4" />;
      case 'mobile_money':
        return <Smartphone className="h-4 w-4" />;
    }
  };

  const getPaymentLabel = (method: PaymentMethod) => {
    switch (method) {
      case 'cash':
        return 'Cash';
      case 'card':
        return 'Card';
      case 'mobile_money':
        return 'Mobile Money';
    }
  };

  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleVerifyReturn = (sale: SaleRecord) => {
    setSelectedSale(sale);
  };

  const handleProcessReturn = (itemBarcode: string, quantity: number) => {
    // In a real app, this would process the return and update inventory
    showNotification(`Return processed for ${quantity} item(s)`, 'success');
    setSelectedSale(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Sales History</h1>
          <p className="text-gray-600 mt-1">
            {currentStore ? (
              <span className="flex items-center gap-2">
                <Store className="h-4 w-4" />
                Viewing sales for {currentStore.name}
              </span>
            ) : (
              'View sales and verify returns by receipt'
            )}
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-600">Total Sales</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalSales}</p>
            </div>
            <div className="p-2 rounded-full bg-blue-100">
              <Receipt className="h-5 w-5 text-blue-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-600">Revenue</p>
              <p className="text-2xl font-bold text-green-600">${stats.totalRevenue.toFixed(0)}</p>
            </div>
            <div className="p-2 rounded-full bg-green-100">
              <DollarSign className="h-5 w-5 text-green-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-600">Items Sold</p>
              <p className="text-2xl font-bold text-purple-600">{stats.totalItems}</p>
            </div>
            <div className="p-2 rounded-full bg-purple-100">
              <Package className="h-5 w-5 text-purple-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-600">Avg Sale</p>
              <p className="text-2xl font-bold text-orange-600">${stats.averageSale.toFixed(0)}</p>
            </div>
            <div className="p-2 rounded-full bg-orange-100">
              <TrendingUp className="h-5 w-5 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search by receipt #, cashier, or product..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            />
          </div>
          
          {/* Date Filter */}
          <div className="flex items-center space-x-2">
            <Calendar className="h-5 w-5 text-gray-400" />
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value as any)}
              className="block w-40 py-2 px-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">Last 7 Days</option>
              <option value="month">Last 30 Days</option>
            </select>
          </div>
        </div>
      </div>

      {/* Sales List */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Receipt
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Store
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cashier
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Items
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Payment
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredSales.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center">
                    <Receipt className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">
                      {searchQuery ? 'No sales found matching your search' : 'No sales recorded yet'}
                    </p>
                  </td>
                </tr>
              ) : (
                filteredSales.map((sale) => (
                  <tr key={sale.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center">
                        <Receipt className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="text-sm font-medium text-gray-900">{sale.receiptNumber}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                      {formatDate(sale.timestamp)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center text-sm text-blue-600">
                        <Store className="h-4 w-4 mr-1" />
                        {sale.storeName}
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-900">
                        <User className="h-4 w-4 text-gray-400 mr-1" />
                        {sale.cashierName}
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                      {sale.items.reduce((sum, item) => sum + item.quantity, 0)} items
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-600">
                        {getPaymentIcon(sale.paymentMethod)}
                        <span className="ml-1">{getPaymentLabel(sale.paymentMethod)}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-bold text-gray-900">
                      ${sale.total.toFixed(2)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-center">
                      <button
                        onClick={() => handleVerifyReturn(sale)}
                        className="inline-flex items-center px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-medium hover:bg-orange-200 transition-colors"
                        title="Verify for Return"
                      >
                        <RotateCcw className="h-3 w-3 mr-1" />
                        Return
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Sale Detail / Return Verification Modal */}
      {selectedSale && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setSelectedSale(null)} />
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="relative bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 sticky top-0 bg-white">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                  <h3 className="text-lg font-semibold text-gray-900">Verify Receipt</h3>
                </div>
                <button onClick={() => setSelectedSale(null)} className="text-gray-400 hover:text-gray-600">
                  <XCircle className="h-6 w-6" />
                </button>
              </div>

              <div className="p-6 space-y-4">
                {/* Receipt Info */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Receipt:</span>
                      <p className="font-semibold">{selectedSale.receiptNumber}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Date:</span>
                      <p className="font-semibold">{formatDate(selectedSale.timestamp)}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Store:</span>
                      <p className="font-semibold">{selectedSale.storeName}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Cashier:</span>
                      <p className="font-semibold">{selectedSale.cashierName}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Payment:</span>
                      <p className="font-semibold flex items-center">
                        {getPaymentIcon(selectedSale.paymentMethod)}
                        <span className="ml-1">{getPaymentLabel(selectedSale.paymentMethod)}</span>
                      </p>
                    </div>
                  </div>
                </div>

                {/* Items List */}
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 mb-3">Items Purchased</h4>
                  <div className="space-y-2">
                    {selectedSale.items.map((item, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">{item.name}</p>
                          <p className="text-xs text-gray-600">
                            {item.quantity} x ${item.price.toFixed(2)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold text-gray-900">${item.total.toFixed(2)}</p>
                          <button
                            onClick={() => handleProcessReturn(item.barcode, item.quantity)}
                            className="text-xs text-orange-600 hover:text-orange-700 font-medium"
                          >
                            Process Return
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Totals */}
                <div className="border-t pt-4">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-600">Subtotal:</span>
                    <span>${selectedSale.subtotal.toFixed(2)}</span>
                  </div>
                  {selectedSale.tax > 0 && (
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-600">Tax:</span>
                      <span>${selectedSale.tax.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total:</span>
                    <span className="text-blue-600">${selectedSale.total.toFixed(2)}</span>
                  </div>
                  {selectedSale.change > 0 && (
                    <div className="flex justify-between text-sm mt-2 text-green-600">
                      <span>Change Given:</span>
                      <span>${selectedSale.change.toFixed(2)}</span>
                    </div>
                  )}
                </div>

                {/* Verification Status */}
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-green-800">Receipt Verified</p>
                      <p className="text-xs text-green-700 mt-1">
                        This receipt is valid. You can process returns for individual items above.
                      </p>
                    </div>
                  </div>
                </div>
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
