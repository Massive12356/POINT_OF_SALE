import { ShoppingCart, Trash2, AlertTriangle } from 'lucide-react';
import { CartItem as CartItemType } from '../types/product';
import { CartItem } from './CartItem';
import { LOW_STOCK_THRESHOLD } from '../services/localStorageService';

interface CartProps {
  items: CartItemType[];
  onUpdateQuantity: (barcode: string, delta: number) => void;
  onRemove: (barcode: string) => void;
  onClear: () => void;
  onCheckout: () => void;
  disabled?: boolean;
}

/**
 * Cart Component
 * Displays cart items with stock indicators and totals
 */
export function Cart({
  items,
  onUpdateQuantity,
  onRemove,
  onClear,
  onCheckout,
  disabled = false,
}: CartProps) {
  const grandTotal = items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  // Check for low stock items in cart
  const lowStockItems = items.filter(
    (item) =>
      item.product.stock > 0 && item.product.stock < LOW_STOCK_THRESHOLD
  );

  // Check for items at stock limit
  const atStockLimit = items.filter(
    (item) => item.quantity >= item.product.stock
  );

  if (items.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-8">
        <div className="flex flex-col items-center justify-center text-gray-400 py-12">
          <ShoppingCart className="h-16 w-16 mb-4" />
          <p className="text-lg">Cart is empty</p>
          <p className="text-sm mt-2">Scan a barcode to add items</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      {/* Stock Warnings */}
      {(lowStockItems.length > 0 || atStockLimit.length > 0) && (
        <div className="bg-yellow-50 border-b border-yellow-200 px-3 sm:px-4 py-2 sm:py-3">
          {lowStockItems.length > 0 && (
            <div className="flex items-start space-x-2">
              <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div className="text-xs sm:text-sm">
                <span className="font-medium text-yellow-800">Low Stock:</span>{' '}
                <span className="text-yellow-700">
                  {lowStockItems.map((i) => i.product.name).join(', ')}
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Desktop Table View */}
      <div className="hidden sm:block overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Item Name
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Unit Price
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Quantity
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Total Price
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {items.map((item) => (
              <CartItem
                key={item.product.barcode}
                item={item}
                onUpdateQuantity={onUpdateQuantity}
                onRemove={onRemove}
                disabled={disabled}
                isAtStockLimit={item.quantity >= item.product.stock}
              />
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="sm:hidden divide-y divide-gray-200">
        {items.map((item) => (
          <CartItem
            key={item.product.barcode}
            item={item}
            onUpdateQuantity={onUpdateQuantity}
            onRemove={onRemove}
            disabled={disabled}
            isAtStockLimit={item.quantity >= item.product.stock}
            isMobile={true}
          />
        ))}
      </div>

      <div className="bg-gray-50 px-3 sm:px-4 py-3 sm:py-4 border-t-2 border-gray-200">
        {/* Summary */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 space-y-2 sm:space-y-0">
          <div className="flex items-center justify-between sm:justify-start sm:space-x-4">
            <span className="text-sm sm:text-lg font-semibold text-gray-700">
              Items: {totalItems}
            </span>
            <button
              onClick={onClear}
              disabled={disabled}
              className="text-xs sm:text-sm text-red-600 hover:text-red-700 flex items-center space-x-1 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
              <span>Clear</span>
            </button>
          </div>
          <span className="text-xl sm:text-2xl font-bold text-gray-900 text-right">
            Total: ${grandTotal.toFixed(2)}
          </span>
        </div>

        {/* Checkout Button */}
        <button
          onClick={onCheckout}
          disabled={disabled || items.length === 0}
          className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-bold py-3 sm:py-4 px-4 sm:px-6 rounded-lg transition-colors shadow-md hover:shadow-lg text-sm sm:text-base"
        >
          {disabled ? 'Processing...' : 'Proceed to Payment'}
        </button>
      </div>
    </div>
  );
}
