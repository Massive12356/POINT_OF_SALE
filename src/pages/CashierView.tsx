import { useState } from 'react';
import { Store, Shield, User, LogOut, Building2 } from 'lucide-react';
import { CartItem as CartItemType, SaleRecord, PaymentMethod, SaleItem } from '../types/product';
import { ProductService, SaleService, StoreService } from '../services/localStorageService';
import { BarcodeInput } from '../components/BarcodeInput';
import { Cart } from '../components/Cart';
import { PaymentModal } from '../components/PaymentModal';
import { Receipt } from '../components/Receipt';
import { NotificationToast } from '../components/NotificationToast';

/**
 * Props for CashierView component
 */
interface CashierViewProps {
  cashierName: string;
  assignedStoreId?: string;
  assignedStoreName?: string;
  onLogout: () => void;
  onSwitchToAdmin: () => void;
}

/**
 * Notification type
 */
interface Notification {
  message: string;
  type: 'success' | 'error';
  id: number;
}

/**
 * Cashier View Component
 * Complete POS cashier interface with payment and receipt
 */
export function CashierView({ cashierName, assignedStoreId, assignedStoreName, onLogout, onSwitchToAdmin }: CashierViewProps) {
  const [cart, setCart] = useState<CartItemType[]>([]);
  const [showPayment, setShowPayment] = useState(false);
  const [completedSale, setCompletedSale] = useState<SaleRecord | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  /**
   * Show notification toast
   */
  const showNotification = (message: string, type: 'success' | 'error') => {
    const id = Date.now();
    setNotifications((prev) => [...prev, { message, type, id }]);
    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    }, 3000);
  };

  /**
   * Handle barcode scan
   */
  const handleScan = (barcode: string) => {
    const product = ProductService.findByBarcode(barcode);

    if (!product) {
      showNotification('Product not registered! Please check the barcode.', 'error');
      return;
    }

    const existingItem = cart.find((item) => item.product.barcode === barcode);

    if (existingItem) {
      if (existingItem.quantity >= product.stock) {
        showNotification(
          `Cannot add more ${product.name}. Only ${product.stock} in stock!`,
          'error'
        );
        return;
      }

      setCart((prevCart) =>
        prevCart.map((item) =>
          item.product.barcode === barcode
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      );
      showNotification(`Added one more ${product.name} to cart`, 'success');
    } else {
      if (product.stock === 0) {
        showNotification(`${product.name} is out of stock!`, 'error');
        return;
      }

      setCart((prevCart) => [...prevCart, { product, quantity: 1 }]);
      showNotification(`${product.name} added to cart`, 'success');
    }
  };

  /**
   * Handle quantity update
   */
  const handleUpdateQuantity = (barcode: string, delta: number) => {
    setCart((prevCart) => {
      return prevCart
        .map((item) => {
          if (item.product.barcode === barcode) {
            const newQuantity = item.quantity + delta;

            if (newQuantity <= 0) {
              return null;
            }

            if (newQuantity > item.product.stock) {
              showNotification(
                `Cannot add more ${item.product.name}. Only ${item.product.stock} in stock!`,
                'error'
              );
              return item;
            }

            return { ...item, quantity: newQuantity };
          }
          return item;
        })
        .filter((item): item is CartItemType => item !== null);
    });
  };

  /**
   * Handle item removal
   */
  const handleRemove = (barcode: string) => {
    setCart((prevCart) => prevCart.filter((item) => item.product.barcode !== barcode));
    showNotification('Item removed from cart', 'success');
  };

  /**
   * Handle clear cart
   */
  const handleClearCart = () => {
    if (cart.length === 0) return;
    if (confirm('Are you sure you want to clear the cart?')) {
      setCart([]);
      showNotification('Cart cleared', 'success');
    }
  };

  /**
   * Handle proceed to payment
   */
  const handleProceedToPayment = () => {
    if (cart.length === 0) {
      showNotification('Cart is empty', 'error');
      return;
    }
    setShowPayment(true);
  };

  /**
   * Handle payment completion
   */
  const handlePaymentComplete = async (paymentMethod: PaymentMethod, amountPaid: number) => {
    setIsProcessing(true);

    // Convert cart items to sale items
    const saleItems: SaleItem[] = cart.map((item) => ({
      barcode: item.product.barcode,
      name: item.product.name,
      price: item.product.price,
      quantity: item.quantity,
      total: item.product.price * item.quantity,
    }));

    // Get store info for the sale
    const storeId = assignedStoreId || StoreService.getCurrentStore()?.id || 'store-001';
    const storeName = assignedStoreName || StoreService.getCurrentStore()?.name || 'Main Store';

    // Process the sale
    const result = SaleService.processSale(
      saleItems,
      paymentMethod,
      amountPaid,
      cashierName,
      storeId,
      storeName
    );

    if (result.success && result.sale) {
      setCompletedSale(result.sale);
      setCart([]);
      setShowPayment(false);
      showNotification('Sale completed successfully!', 'success');
    } else {
      showNotification(result.error || 'Payment failed', 'error');
    }

    setIsProcessing(false);
  };

  /**
   * Handle start new sale
   */
  const handleNewSale = () => {
    setCompletedSale(null);
    setCart([]);
  };

  // Calculate cart total
  const cartTotal = cart.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header Bar */}
      <div className="bg-white shadow-sm">
        <div className="container mx-auto px-3 sm:px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center space-x-2">
              <Store className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
              <div>
                <h1 className="text-base sm:text-xl font-bold text-gray-900">POS Store</h1>
                <p className="text-xs text-gray-500 hidden sm:block">Cashier Terminal</p>
              </div>
            </div>

            {/* Cashier Info - Mobile Optimized */}
            <div className="flex items-center space-x-2 sm:space-x-4">
              <div className="flex flex-col items-end">
                <div className="flex items-center space-x-1 sm:space-x-2 text-sm text-gray-600">
                  <User className="h-4 w-4" />
                  <span className="hidden sm:inline">{cashierName}</span>
                  <span className="sm:hidden text-xs">{cashierName.split(' ')[0]}</span>
                </div>
                {assignedStoreName && (
                  <div className="flex items-center text-xs text-blue-600 mt-0.5">
                    <Building2 className="h-3 w-3 mr-1" />
                    <span className="hidden sm:inline">{assignedStoreName}</span>
                    <span className="sm:hidden">{assignedStoreName.split(' ')[0]}</span>
                  </div>
                )}
              </div>
              <button
                onClick={onLogout}
                className="flex items-center space-x-1 sm:space-x-2 px-2 sm:px-3 py-1.5 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-xs sm:text-sm font-medium"
              >
                <LogOut className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">End Shift</span>
              </button>
              <button
                onClick={onSwitchToAdmin}
                className="flex items-center space-x-1 sm:space-x-2 px-2 sm:px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-xs sm:text-sm font-medium"
              >
                <Shield className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Admin</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6">
        <div className="max-w-6xl mx-auto space-y-4 sm:space-y-6">
          {/* Barcode Input Section */}
          <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6">
            <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Scan Products</h2>
            <BarcodeInput onScan={handleScan} disabled={isProcessing || showPayment} />
            <div className="mt-3 sm:mt-4 text-xs sm:text-sm text-gray-600">
              <p className="font-semibold mb-2">Quick Test Barcodes:</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
                <code className="bg-gray-100 px-2 py-1 rounded text-center text-xs sm:text-sm">1234567890</code>
                <code className="bg-gray-100 px-2 py-1 rounded text-center text-xs sm:text-sm">2345678901</code>
                <code className="bg-gray-100 px-2 py-1 rounded text-center text-xs sm:text-sm">3456789012</code>
                <code className="bg-gray-100 px-2 py-1 rounded text-center text-xs sm:text-sm">4567890123</code>
                <code className="bg-gray-100 px-2 py-1 rounded text-center text-xs sm:text-sm">5678901234</code>
              </div>
            </div>
          </div>

          {/* Cart Section */}
          <Cart
            items={cart}
            onUpdateQuantity={handleUpdateQuantity}
            onRemove={handleRemove}
            onClear={handleClearCart}
            onCheckout={handleProceedToPayment}
            disabled={isProcessing}
          />
        </div>
      </div>

      {/* Payment Modal */}
      {showPayment && (
        <PaymentModal
          items={cart}
          total={cartTotal}
          onClose={() => setShowPayment(false)}
          onComplete={handlePaymentComplete}
        />
      )}

      {/* Receipt Modal */}
      {completedSale && (
        <Receipt
          sale={completedSale}
          onClose={() => setCompletedSale(null)}
          onNewSale={handleNewSale}
        />
      )}

      {/* Notifications */}
      {notifications.map((notification) => (
        <NotificationToast
          key={notification.id}
          message={notification.message}
          type={notification.type}
          onClose={() =>
            setNotifications((prev) => prev.filter((n) => n.id !== notification.id))
          }
        />
      ))}
    </div>
  );
}
