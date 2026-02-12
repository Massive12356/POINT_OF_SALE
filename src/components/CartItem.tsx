import { Minus, Plus, Trash2, AlertCircle } from 'lucide-react';
import { CartItem as CartItemType } from '../types/product';
import { LOW_STOCK_THRESHOLD } from '../services/localStorageService';

interface CartItemProps {
  item: CartItemType;
  onUpdateQuantity: (barcode: string, delta: number) => void;
  onRemove: (barcode: string) => void;
  disabled?: boolean;
  isAtStockLimit?: boolean;
  isMobile?: boolean;
}

/**
 * CartItem Component
 * Displays a single cart item with stock-aware controls
 * Supports both desktop (table row) and mobile (card) views
 */
export function CartItem({
  item,
  onUpdateQuantity,
  onRemove,
  disabled = false,
  isAtStockLimit = false,
  isMobile = false,
}: CartItemProps) {
  const totalPrice = item.product.price * item.quantity;
  const canIncrease = item.quantity < item.product.stock && !disabled;
  const isLowStock = item.product.stock > 0 && item.product.stock < LOW_STOCK_THRESHOLD;

  // Mobile Card View
  if (isMobile) {
    return (
      <div className="p-3 bg-white hover:bg-gray-50 transition-colors animate-fadeIn">
        <div className="flex justify-between items-start mb-2">
          <div className="flex-1 pr-2">
            <span className="text-sm font-medium text-gray-900">{item.product.name}</span>
            <div className="flex flex-wrap gap-1 mt-1">
              {isLowStock && (
                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                  <AlertCircle className="h-2.5 w-2.5 mr-0.5" />
                  Low
                </span>
              )}
              {isAtStockLimit && (
                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                  Max
                </span>
              )}
            </div>
          </div>
          <button
            onClick={() => onRemove(item.product.barcode)}
            disabled={disabled}
            className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors disabled:opacity-50"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>

        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">
            ${item.product.price.toFixed(2)} each
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => onUpdateQuantity(item.product.barcode, -1)}
              disabled={disabled}
              className="p-1.5 rounded bg-gray-100 hover:bg-gray-200 transition-colors disabled:opacity-50"
            >
              <Minus className="h-3.5 w-3.5 text-gray-600" />
            </button>
            <span className="w-8 text-center font-semibold text-sm">{item.quantity}</span>
            <button
              onClick={() => onUpdateQuantity(item.product.barcode, 1)}
              disabled={!canIncrease}
              className={`p-1.5 rounded transition-colors ${
                canIncrease ? 'bg-gray-100 hover:bg-gray-200' : 'bg-gray-50 opacity-50'
              }`}
            >
              <Plus className="h-3.5 w-3.5 text-gray-600" />
            </button>
          </div>

          <div className="text-sm font-semibold text-gray-900 min-w-[60px] text-right">
            ${totalPrice.toFixed(2)}
          </div>
        </div>
      </div>
    );
  }

  // Desktop Table Row View
  return (
    <tr className="border-b border-gray-200 hover:bg-gray-50 transition-colors animate-fadeIn">
      <td className="px-4 py-3">
        <div className="flex items-center space-x-2">
          <span className="text-gray-900">{item.product.name}</span>
          {isLowStock && (
            <span
              className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800"
              title={`Only ${item.product.stock} left in stock`}
            >
              <AlertCircle className="h-3 w-3 mr-1" />
              Low Stock
            </span>
          )}
          {isAtStockLimit && (
            <span
              className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800"
              title="Maximum stock reached"
            >
              Max
            </span>
          )}
        </div>
      </td>
      <td className="px-4 py-3 text-gray-700">${item.product.price.toFixed(2)}</td>
      <td className="px-4 py-3">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => onUpdateQuantity(item.product.barcode, -1)}
            disabled={disabled}
            className="p-1 rounded hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title="Decrease quantity"
          >
            <Minus className="h-4 w-4 text-gray-600" />
          </button>
          <span className="w-12 text-center font-semibold">{item.quantity}</span>
          <button
            onClick={() => onUpdateQuantity(item.product.barcode, 1)}
            disabled={!canIncrease}
            className={`p-1 rounded transition-colors ${
              canIncrease
                ? 'hover:bg-gray-200 text-gray-600'
                : 'opacity-50 cursor-not-allowed text-gray-400'
            }`}
            title={canIncrease ? 'Increase quantity' : 'Out of stock'}
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
      </td>
      <td className="px-4 py-3 font-semibold text-gray-900">
        ${totalPrice.toFixed(2)}
      </td>
      <td className="px-4 py-3">
        <button
          onClick={() => onRemove(item.product.barcode)}
          disabled={disabled}
          className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          title="Remove item"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </td>
    </tr>
  );
}
