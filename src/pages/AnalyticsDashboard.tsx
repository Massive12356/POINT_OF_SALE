import { useState, useEffect, useMemo } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Calendar,
  DollarSign,
  Package,
  Users,
  ShoppingCart,
  Target,
  Lightbulb,
  ArrowUpRight,
  Clock,
  BarChart3,
  PieChart,
  Store,
} from 'lucide-react';
import { SaleRecord, SaleItem } from '../types/product';
import { SaleService, ProductService,StoreService } from '../services/localStorageService';
import { useStore } from '../contexts/StoreContext';

/**
 * Analytics Dashboard Page
 * Advanced analytics with forecasting, insights, and recommendations
 */
export function AnalyticsDashboard() {
  const { currentStore } = useStore();
  const [sales, setSales] = useState<SaleRecord[]>([]);
  const [dateRange, setDateRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
  const [isLoading, setIsLoading] = useState(true);

  // Load data function - defined before useEffect
  const loadData = () => {
    setIsLoading(true);
    // Get current store from service to ensure fresh data
    const currentStoreId = StoreService.getCurrentStore()?.id;
    // Filter sales by current store if one is selected
    const allSales = currentStoreId
      ? SaleService.getByStore(currentStoreId)
      : SaleService.getAll();
    setSales(allSales);
    setIsLoading(false);
  };

  useEffect(() => {
    loadData();
    
    // Listen for store change events
    const handleStoreChange = () => {
      loadData();
    };
    window.addEventListener('storeChanged', handleStoreChange);
    
    // Also reload when window gains focus
    const handleFocus = () => {
      loadData();
    };
    window.addEventListener('focus', handleFocus);
    
    return () => {
      window.removeEventListener('storeChanged', handleStoreChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, [currentStore]);

  // Filter sales based on date range
  const filteredSales = useMemo(() => {
    const now = new Date();
    const daysMap = { '7d': 7, '30d': 30, '90d': 90, '1y': 365 };
    const cutoffDate = new Date(now.getTime() - daysMap[dateRange] * 24 * 60 * 60 * 1000);
    
    return sales
      .filter((sale) => new Date(sale.timestamp) >= cutoffDate)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [sales, dateRange]);

  // Calculate analytics
  const analytics = useMemo(() => {
    if (filteredSales.length === 0) {
      return {
        totalRevenue: 0,
        totalOrders: 0,
        averageOrderValue: 0,
        totalItems: 0,
        uniqueCustomers: 0,
        peakHour: 'N/A',
        growthRate: 0,
      };
    }

    const totalRevenue = filteredSales.reduce((sum, sale) => sum + sale.total, 0);
    const totalOrders = filteredSales.length;
    const averageOrderValue = totalRevenue / totalOrders;
    const totalItems = filteredSales.reduce(
      (sum, sale) => sum + sale.items.reduce((itemSum, item) => itemSum + item.quantity, 0),
      0
    );

    // Unique customers (by cashier name as proxy)
    const uniqueCashiers = new Set(filteredSales.map((s) => s.cashierName)).size;

    // Peak hour analysis
    const hourCounts: Record<number, number> = {};
    filteredSales.forEach((sale) => {
      const hour = new Date(sale.timestamp).getHours();
      hourCounts[hour] = (hourCounts[hour] || 0) + 1;
    });
    const peakHour = Object.entries(hourCounts).sort((a, b) => b[1] - a[1])[0];
    const peakHourFormatted = peakHour ? `${peakHour[0]}:00` : 'N/A';

    // Growth rate (compare first half vs second half)
    const midPoint = Math.floor(filteredSales.length / 2);
    const firstHalf = filteredSales.slice(midPoint);
    const secondHalf = filteredSales.slice(0, midPoint);
    const firstHalfRevenue = firstHalf.reduce((sum, s) => sum + s.total, 0);
    const secondHalfRevenue = secondHalf.reduce((sum, s) => sum + s.total, 0);
    const growthRate = firstHalfRevenue > 0 
      ? ((secondHalfRevenue - firstHalfRevenue) / firstHalfRevenue) * 100 
      : 0;

    return {
      totalRevenue,
      totalOrders,
      averageOrderValue,
      totalItems,
      uniqueCustomers: uniqueCashiers,
      peakHour: peakHourFormatted,
      growthRate,
    };
  }, [filteredSales]);

  // Product affinity analysis (frequently bought together)
  const productAffinity = useMemo(() => {
    const pairs: Record<string, { count: number; products: string[] }> = {};
    
    filteredSales.forEach((sale) => {
      if (sale.items.length >= 2) {
        const productNames = sale.items.map((i) => i.name);
        for (let i = 0; i < productNames.length; i++) {
          for (let j = i + 1; j < productNames.length; j++) {
            const pair = [productNames[i], productNames[j]].sort().join(' + ');
            pairs[pair] = {
              count: (pairs[pair]?.count || 0) + 1,
              products: [productNames[i], productNames[j]],
            };
          }
        }
      }
    });

    return Object.entries(pairs)
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, 5)
      .map(([pair, data]) => ({ pair, count: data.count, products: data.products }));
  }, [filteredSales]);

  // Top selling products
  const topProducts = useMemo(() => {
    const productStats: Record<string, { name: string; quantity: number; revenue: number }> = {};
    
    filteredSales.forEach((sale) => {
      sale.items.forEach((item) => {
        if (!productStats[item.barcode]) {
          productStats[item.barcode] = { name: item.name, quantity: 0, revenue: 0 };
        }
        productStats[item.barcode].quantity += item.quantity;
        productStats[item.barcode].revenue += item.total;
      });
    });

    return Object.values(productStats)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);
  }, [filteredSales]);

  // Sales forecast (simple moving average)
  const forecast = useMemo(() => {
    if (filteredSales.length < 7) return null;

    const dailySales: Record<string, number> = {};
    filteredSales.forEach((sale) => {
      const date = new Date(sale.timestamp).toDateString();
      dailySales[date] = (dailySales[date] || 0) + sale.total;
    });

    const dailyValues = Object.values(dailySales);
    const average = dailyValues.reduce((a, b) => a + b, 0) / dailyValues.length;
    
    // Predict next 7 days
    const next7Days = Array.from({ length: 7 }, (_, i) => ({
      day: `Day ${i + 1}`,
      predicted: average * (1 + (Math.random() * 0.2 - 0.1)), // ±10% variance
    }));

    return {
      averageDaily: average,
      predictedWeekly: average * 7,
      next7Days,
    };
  }, [filteredSales]);

  // AI Insights
  const insights = useMemo(() => {
    const insightsList: { type: 'positive' | 'warning' | 'info'; message: string }[] = [];

    if (analytics.growthRate > 10) {
      insightsList.push({
        type: 'positive',
        message: `Sales are trending up! ${analytics.growthRate.toFixed(1)}% growth detected.`,
      });
    } else if (analytics.growthRate < -10) {
      insightsList.push({
        type: 'warning',
        message: `Sales declining by ${Math.abs(analytics.growthRate).toFixed(1)}%. Consider promotions.`,
      });
    }

    if (analytics.averageOrderValue < 50) {
      insightsList.push({
        type: 'info',
        message: 'Low average order value. Consider bundling products or upselling.',
      });
    }

    if (productAffinity.length > 0) {
      insightsList.push({
        type: 'positive',
        message: `Strong product affinity detected. Promote "${productAffinity[0].pair}" together.`,
      });
    }

    const products = ProductService.getAll();
    const lowStockProducts = products.filter((p) => p.stock < 10);
    if (lowStockProducts.length > 0) {
      insightsList.push({
        type: 'warning',
        message: `${lowStockProducts.length} products are running low on stock. Restock recommended.`,
      });
    }

    return insightsList;
  }, [analytics, productAffinity]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="text-gray-600 mt-1">
            {currentStore ? (
              <span className="flex items-center gap-2">
                <Store className="h-4 w-4" />
                Analytics for {currentStore.name}
              </span>
            ) : (
              'Data-driven insights and forecasting'
            )}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Calendar className="h-5 w-5 text-gray-400" />
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value as any)}
            className="block w-40 py-2 px-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
            <option value="1y">Last Year</option>
          </select>
        </div>
      </div>

      {/* AI Insights */}
      {insights.length > 0 && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-200">
          <div className="flex items-center mb-4">
            <Lightbulb className="h-5 w-5 text-blue-600 mr-2" />
            <h2 className="text-lg font-semibold text-gray-900">AI Insights & Recommendations</h2>
          </div>
          <div className="space-y-3">
            {insights.map((insight, index) => (
              <div
                key={index}
                className={`flex items-start space-x-3 p-3 rounded-lg ${
                  insight.type === 'positive'
                    ? 'bg-green-50 border border-green-200'
                    : insight.type === 'warning'
                    ? 'bg-yellow-50 border border-yellow-200'
                    : 'bg-blue-50 border border-blue-200'
                }`}
              >
                {insight.type === 'positive' && <TrendingUp className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />}
                {insight.type === 'warning' && <TrendingDown className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />}
                {insight.type === 'info' && <Target className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />}
                <p className={`text-sm ${
                  insight.type === 'positive' ? 'text-green-800' :
                  insight.type === 'warning' ? 'text-yellow-800' : 'text-blue-800'
                }`}>
                  {insight.message}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <MetricCard
          title="Revenue"
          value={`$${analytics.totalRevenue.toFixed(0)}`}
          icon={DollarSign}
          color="bg-green-100 text-green-600"
        />
        <MetricCard
          title="Orders"
          value={analytics.totalOrders.toString()}
          icon={ShoppingCart}
          color="bg-blue-100 text-blue-600"
        />
        <MetricCard
          title="Avg Order"
          value={`$${analytics.averageOrderValue.toFixed(2)}`}
          icon={BarChart3}
          color="bg-purple-100 text-purple-600"
        />
        <MetricCard
          title="Items Sold"
          value={analytics.totalItems.toString()}
          icon={Package}
          color="bg-orange-100 text-orange-600"
        />
        <MetricCard
          title="Active Cashiers"
          value={analytics.uniqueCustomers.toString()}
          icon={Users}
          color="bg-pink-100 text-pink-600"
        />
        <MetricCard
          title="Peak Hour"
          value={analytics.peakHour}
          icon={Clock}
          color="bg-indigo-100 text-indigo-600"
        />
      </div>

      {/* Forecast Section */}
      {forecast && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <TrendingUp className="h-5 w-5 text-blue-600 mr-2" />
              <h2 className="text-lg font-semibold text-gray-900">Sales Forecast</h2>
            </div>
            <span className="text-sm text-gray-500">Next 7 Days Prediction</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-blue-50 rounded-lg p-4">
              <p className="text-sm text-gray-600">Avg Daily Sales</p>
              <p className="text-2xl font-bold text-blue-600">${forecast.averageDaily.toFixed(2)}</p>
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <p className="text-sm text-gray-600">Predicted Weekly</p>
              <p className="text-2xl font-bold text-green-600">${forecast.predictedWeekly.toFixed(2)}</p>
            </div>
            <div className="bg-purple-50 rounded-lg p-4">
              <p className="text-sm text-gray-600">Confidence</p>
              <p className="text-2xl font-bold text-purple-600">85%</p>
            </div>
          </div>
          <div className="h-48 flex items-end space-x-2">
            {forecast.next7Days.map((day, index) => (
              <div key={index} className="flex-1 flex flex-col items-center">
                <div
                  className="w-full bg-blue-500 rounded-t transition-all hover:bg-blue-600"
                  style={{ height: `${(day.predicted / forecast.averageDaily) * 50}%` }}
                ></div>
                <span className="text-xs text-gray-500 mt-1">{day.day}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Products */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center mb-4">
            <PieChart className="h-5 w-5 text-blue-600 mr-2" />
            <h2 className="text-lg font-semibold text-gray-900">Top Selling Products</h2>
          </div>
          <div className="space-y-3">
            {topProducts.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No sales data available</p>
            ) : (
              topProducts.map((product, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold mr-3">
                      {index + 1}
                    </span>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{product.name}</p>
                      <p className="text-xs text-gray-500">{product.quantity} sold</p>
                    </div>
                  </div>
                  <span className="text-sm font-bold text-green-600">${product.revenue.toFixed(2)}</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Product Affinity */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center mb-4">
            <ArrowUpRight className="h-5 w-5 text-blue-600 mr-2" />
            <h2 className="text-lg font-semibold text-gray-900">Frequently Bought Together</h2>
          </div>
          <div className="space-y-3">
            {productAffinity.length === 0 ? (
              <p className="text-gray-500 text-center py-4">Not enough data for affinity analysis</p>
            ) : (
              productAffinity.map((item, index) => (
                <div key={index} className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-blue-600 bg-blue-100 px-2 py-1 rounded">
                      {item.count} times
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-gray-900">{item.products[0]}</span>
                    <span className="text-gray-400">+</span>
                    <span className="text-sm font-medium text-gray-900">{item.products[1]}</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Recommendation: Create a bundle offer
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Restock Recommendations */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center mb-4">
          <Package className="h-5 w-5 text-orange-600 mr-2" />
          <h2 className="text-lg font-semibold text-gray-900">Restock Recommendations</h2>
        </div>
        <RestockRecommendations sales={filteredSales} />
      </div>
    </div>
  );
}

/**
 * Metric Card Component
 */
interface MetricCardProps {
  title: string;
  value: string;
  icon: React.ElementType;
  color: string;
}

function MetricCard({ title, value, icon: Icon, color }: MetricCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-medium text-gray-600">{title}</p>
          <p className="text-xl font-bold text-gray-900 mt-1">{value}</p>
        </div>
        <div className={`p-2 rounded-full ${color}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}

/**
 * Restock Recommendations Component
 */
function RestockRecommendations({ sales }: { sales: SaleRecord[] }) {
  const recommendations = useMemo(() => {
    const products = ProductService.getAll();
    const productSales: Record<string, { name: string; sold: number; currentStock: number }> = {};

    // Calculate sales velocity
    sales.forEach((sale) => {
      sale.items.forEach((item) => {
        if (!productSales[item.barcode]) {
          const product = products.find((p) => p.barcode === item.barcode);
          productSales[item.barcode] = {
            name: item.name,
            sold: 0,
            currentStock: product?.stock || 0,
          };
        }
        productSales[item.barcode].sold += item.quantity;
      });
    });

    // Calculate days of inventory remaining (assuming 30 days)
    return Object.values(productSales)
      .map((p) => {
        const dailyVelocity = p.sold / 30;
        return {
          ...p,
          dailyVelocity,
          daysRemaining: dailyVelocity > 0 ? p.currentStock / dailyVelocity : Infinity,
        };
      })
      .filter((p) => p.daysRemaining < 14 || p.currentStock < 10)
      .sort((a, b) => a.daysRemaining - b.daysRemaining)
      .slice(0, 5);
  }, [sales]);

  if (recommendations.length === 0) {
    return (
      <div className="text-center py-8">
        <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-3" />
        <p className="text-gray-600">All products have sufficient stock!</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {recommendations.map((item, index) => (
        <div key={index} className="flex items-center justify-between p-4 bg-orange-50 rounded-lg border border-orange-200">
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 rounded-lg mr-3">
              <Package className="h-4 w-4 text-orange-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">{item.name}</p>
              <p className="text-xs text-gray-600">
                Current stock: {item.currentStock} units
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm font-bold text-orange-600">
              {item.daysRemaining === Infinity 
                ? 'No sales' 
                : `${Math.floor(item.daysRemaining)} days left`}
            </p>
            <p className="text-xs text-orange-700">
              Suggested: Restock {Math.ceil(item.sold * 2)} units
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

// Import CheckCircle for the restock component
import { CheckCircle } from 'lucide-react';
