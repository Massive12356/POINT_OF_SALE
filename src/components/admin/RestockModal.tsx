import React, { useState, useEffect, useRef } from 'react';
import { X, RefreshCw, Package, History, AlertCircle } from 'lucide-react';
import { Product, StockLog } from '../../types/product';
import { ProductService, StockLogService } from '../../services/localStorageService';
import { useAuth } from '../../contexts/AuthContext';

/**
 * Props for RestockModal component
 */
interface RestockModalProps {
  product: Product;
  onClose: () => void;
  onSuccess: () => void;
}

/**
 * Restock Modal Component
 * Allows admin to add stock to a product and view recent stock history
 */
export function RestockModal({ product, onClose, onSuccess }: RestockModalProps) {
  const { user } = useAuth();
  const [quantity, setQuantity] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [recentLogs, setRecentLogs] = useState<StockLog[]>([]);

  // Ref for auto-focus
  const quantityInputRef = useRef<HTMLInputElement>(null);

  // Load recent stock logs for this product
  useEffect(() => {
    const logs = StockLogService.getByBarcode(product.barcode);
    setRecentLogs(logs.slice(0, 5)); // Show last 5 entries
  }, [product.barcode]);

  // Auto-focus quantity input
  useEffect(() => {
    setTimeout(() => quantityInputRef.current?.focus(), 100);
  }, []);

  /**
   * Handle quantity change
   */
  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Only allow positive integers
    if (value === '' || (/^\d+$/.test(value) && parseInt(value, 10) > 0)) {
      setQuantity(value);
      setError('');
    }
  };

  /**
   * Handle restock submission
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate
    const qty = parseInt(quantity, 10);
    if (isNaN(qty) || qty <= 0) {
      setError('Please enter a valid positive quantity');
      return;
    }

    setIsSubmitting(true);
    setError('');

    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    const result = ProductService.restock(product.barcode, qty, user?.username || 'admin');

    if (result.success) {
      onSuccess();
    } else {
      setError(result.error || 'Failed to restock product');
      setIsSubmitting(false);
    }
  };

  /**
   * Format timestamp for display
   */
  const formatTimestamp = (timestamp: string): string => {
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-lg shadow-xl max-w-lg w-full">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <RefreshCw className="h-5 w-5 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Restock Product</h3>
            </div>
            <button
              onClick={onClose}
              disabled={isSubmitting}
              className="text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <div className="px-6 py-4 space-y-6">
            {/* Product Info */}
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Package className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">{product.name}</h4>
                  <p className="text-sm text-gray-600">
                    Barcode: {product.barcode}
                  </p>
                  <div className="flex items-center space-x-4 mt-2">
                    <span className="text-sm">
                      <span className="text-gray-500">Current Stock:</span>{' '}
                      <span
                        className={`font-medium ${
                          product.stock === 0
                            ? 'text-red-600'
                            : product.stock < 5
                            ? 'text-yellow-600'
                            : 'text-green-600'
                        }`}
                      >
                        {product.stock} units
                      </span>
                    </span>
                    <span className="text-sm">
                      <span className="text-gray-500">Price:</span>{' '}
                      <span className="font-medium text-gray-900">
                        ${product.price.toFixed(2)}
                      </span>
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Restock Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Error Message */}
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center space-x-2">
                  <AlertCircle className="h-5 w-5 flex-shrink-0" />
                  <span className="text-sm">{error}</span>
                </div>
              )}

              {/* Quantity Input */}
              <div>
                <label
                  htmlFor="quantity"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Quantity to Add <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    ref={quantityInputRef}
                    type="number"
                    id="quantity"
                    value={quantity}
                    onChange={handleQuantityChange}
                    disabled={isSubmitting}
                    min="1"
                    step="1"
                    className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                    placeholder="Enter quantity to add"
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 text-sm">units</span>
                  </div>
                </div>
                <p className="mt-1 text-sm text-gray-500">
                  New stock will be:{' '}
                  <span className="font-medium text-gray-900">
                    {product.stock + (parseInt(quantity, 10) || 0)} units
                  </span>
                </p>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting || !quantity}
                className="w-full flex justify-center items-center px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Updating Stock...
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Add Stock
                  </>
                )}
              </button>
            </form>

            {/* Stock History */}
            {recentLogs.length > 0 && (
              <div className="border-t border-gray-200 pt-4">
                <div className="flex items-center space-x-2 mb-3">
                  <History className="h-4 w-4 text-gray-500" />
                  <h4 className="text-sm font-medium text-gray-900">
                    Recent Stock History
                  </h4>
                </div>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {recentLogs.map((log) => (
                    <div
                      key={log.id}
                      className="flex items-center justify-between text-sm p-2 bg-gray-50 rounded"
                    >
                      <div className="flex items-center space-x-2">
                        <span className="text-green-600 font-medium">
                          +{log.quantityAdded}
                        </span>
                        <span className="text-gray-500">
                          ({log.previousStock} → {log.newStock})
                        </span>
                      </div>
                      <div className="text-right">
                        <p className="text-gray-600">{formatTimestamp(log.timestamp)}</p>
                        <p className="text-xs text-gray-400">by {log.performedBy}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-lg">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="w-full px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
