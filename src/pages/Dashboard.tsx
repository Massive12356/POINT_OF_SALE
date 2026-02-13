import { useEffect, useState } from 'react';
import {
  Package,
  CheckCircle,
  XCircle,
  AlertTriangle,
  TrendingUp,
  ArrowRight,
  Store,
} from 'lucide-react';
import { DashboardStats, Product } from '../types/product';
import { DashboardService, LOW_STOCK_THRESHOLD, SaleService, StoreService } from '../services/localStorageService';
import { useStore } from '../contexts/StoreContext';
import { SalesLineChart } from '../components/charts/SalesLineChart';
import { BestSellingChart } from '../components/charts/BestSellingChart';

/**
 * Generate mock sales data for the current day
 */
function generateTodaySalesData() {
  const hours = ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'];
  return hours.map((time) => ({
    time,
    total: Math.floor(Math.random() * 500) + 50,
  }));
}

/**
 * Generate mock best-selling items data
 */
function generateBestSellingData() {
  return [
    { name: 'African Black Soap', sold: 45, revenue: 450 },
    { name: 'Shea Body Butter', sold: 38, revenue: 760 },
    { name: 'Coconut Oil', sold: 32, revenue: 384 },
    { name: 'Hair Growth Serum', sold: 28, revenue: 840 },
    { name: 'Face Moisturizer', sold: 25, revenue: 625 },
    { name: 'Lip Balm Set', sold: 22, revenue: 220 },
    { name: 'Bath Bombs', sold: 18, revenue: 270 },
    { name: 'Essential Oil Blend', sold: 15, revenue: 450 },
  ];
}

/**
 * Dashboard Page Component
 * Displays overview statistics and key metrics for admin
 */
export function Dashboard() {
  const { currentStore } = useStore();
  const [stats, setStats] = useState<DashboardStats>({
    totalProducts: 0,
    inStockProducts: 0,
    outOfStockProducts: 0,
    lowStockProducts: 0,
  });
  const [lowStockItems, setLowStockItems] = useState<Product[]>([]);
  const [todaySalesData, setTodaySalesData] = useState(generateTodaySalesData());
  const [bestSellingData, setBestSellingData] = useState(generateBestSellingData());
  const [todayRevenue, setTodayRevenue] = useState(0);
  const [todaySales, setTodaySales] = useState(0);

  /**
   * Load dashboard data - defined before useEffect
   */
  const loadDashboardData = () => {
    // Get all products and filter by store if needed
    // For now, we show all products but in a real implementation,
    // products would be filtered by store ID
    setStats(DashboardService.getStats());
    setLowStockItems(DashboardService.getLowStockProducts(LOW_STOCK_THRESHOLD));
    
    // Get today's sales for current store
    const storeId = StoreService.getCurrentStore()?.id;
    const todaySalesList = storeId 
      ? SaleService.getTodaySales(storeId)
      : SaleService.getTodaySales();
    const totalRevenue = todaySalesList.reduce((sum, sale) => sum + sale.total, 0);
    setTodayRevenue(totalRevenue);
    setTodaySales(todaySalesList.length);
  };

  // Load dashboard data on mount and when store changes
  useEffect(() => {
    loadDashboardData();
    
    // Listen for store change events
    const handleStoreChange = () => {
      loadDashboardData();
    };
    window.addEventListener('storeChanged', handleStoreChange);
    
    // Also reload when window gains focus (in case user switched tabs)
    const handleFocus = () => {
      loadDashboardData();
    };
    window.addEventListener('focus', handleFocus);
    
    // Simulate real-time updates every 30 seconds
    const interval = setInterval(() => {
      setTodaySalesData(generateTodaySalesData());
      setBestSellingData(generateBestSellingData());
    }, 30000);

    return () => {
      clearInterval(interval);
      window.removeEventListener('storeChanged', handleStoreChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, [currentStore]);

  /**
   * Stat Card Component
   */
  const StatCard = ({
    title,
    value,
    icon: Icon,
    color,
    subtitle,
  }: {
    title: string;
    value: number;
    icon: React.ElementType;
    color: string;
    subtitle?: string;
  }) => (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
          {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
        </div>
        <div className={`p-3 rounded-full ${color}`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">
            {currentStore ? (
              <span className="flex items-center gap-2">
                <Store className="h-4 w-4" />
                Overview of {currentStore.name}
              </span>
            ) : (
              'Overview of your store inventory'
            )}
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-right">
            <p className="text-xs text-gray-500">Today's Sales</p>
            <p className="text-lg font-bold text-green-600">${todayRevenue.toFixed(2)}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-500">Transactions</p>
            <p className="text-lg font-bold text-blue-600">{todaySales}</p>
          </div>
        </div>
      </div>

      {/* Statistics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Products"
          value={stats.totalProducts}
          icon={Package}
          color="bg-blue-600"
          subtitle="All products in system"
        />
        <StatCard
          title="In Stock"
          value={stats.inStockProducts}
          icon={CheckCircle}
          color="bg-green-600"
          subtitle="Available for sale"
        />
        <StatCard
          title="Out of Stock"
          value={stats.outOfStockProducts}
          icon={XCircle}
          color="bg-red-600"
          subtitle="Need restocking"
        />
        <StatCard
          title="Low Stock"
          value={stats.lowStockProducts}
          icon={AlertTriangle}
          color="bg-yellow-500"
          subtitle={`Less than ${LOW_STOCK_THRESHOLD} units`}
        />
      </div>

      {/* Low Stock Alert Section */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Low Stock Alerts</h2>
                <p className="text-sm text-gray-600">
                  Products with less than {LOW_STOCK_THRESHOLD} units in stock
                </p>
              </div>
            </div>
            {lowStockItems.length > 0 && (
              <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                {lowStockItems.length} items
              </span>
            )}
          </div>
        </div>

        <div className="p-6">
          {lowStockItems.length === 0 ? (
            <div className="text-center py-8">
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-3" />
              <p className="text-gray-600">All products have sufficient stock!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {lowStockItems.map((product) => (
                <div
                  key={product.barcode}
                  className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg border border-yellow-200"
                >
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      <Package className="h-5 w-5 text-yellow-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{product.name}</p>
                      <p className="text-sm text-gray-600">
                        Barcode: {product.barcode} • {product.category}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">
                        {product.stock} units
                      </p>
                      <p className="text-xs text-yellow-700">Low stock warning</p>
                    </div>
                    <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {lowStockItems.length > 0 && (
          <div className="px-6 py-4 bg-gray-50 rounded-b-lg border-t border-gray-200">
            <button
              onClick={() => {
                // Navigate to products page - will be handled by parent
                const event = new CustomEvent('navigateToProducts');
                window.dispatchEvent(event);
              }}
              className="flex items-center text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              Manage Products
              <ArrowRight className="h-4 w-4 ml-1" />
            </button>
          </div>
        )}
      </div>

      {/* Sales Analytics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SalesLineChart data={todaySalesData} />
        <BestSellingChart data={bestSellingData} />
      </div>

      {/* Quick Tips */}
      <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
        <h3 className="text-sm font-semibold text-blue-900 mb-2">Quick Tips</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Use the Products page to add, edit, or restock items</li>
          <li>• Barcodes must be unique for each product</li>
          <li>• Stock changes are automatically logged for tracking</li>
          <li>• Products with 0 stock will show as &quot;Out of Stock&quot;</li>
        </ul>
      </div>
    </div>
  );
}
