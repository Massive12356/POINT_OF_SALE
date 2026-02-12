import { CheckCircle, X } from 'lucide-react';
import { CartItem } from '../types/product';

interface CheckoutModalProps {
  items: CartItem[];
  total: number;
  onClose: () => void;
}

export function CheckoutModal({ items, total, onClose }: CheckoutModalProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 animate-fadeIn">
      <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-slideUp">
        <div className="bg-green-600 text-white px-6 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <CheckCircle className="h-8 w-8" />
            <h2 className="text-2xl font-bold">Checkout Complete</h2>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:bg-green-700 rounded-full p-1 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Order Summary
          </h3>

          <div className="space-y-3 mb-6">
            {items.map((item) => (
              <div
                key={item.product.barcode}
                className="flex justify-between items-center py-3 border-b border-gray-200"
              >
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{item.product.name}</p>
                  <p className="text-sm text-gray-600">
                    ${item.product.price.toFixed(2)} × {item.quantity}
                  </p>
                </div>
                <p className="font-semibold text-gray-900">
                  ${(item.product.price * item.quantity).toFixed(2)}
                </p>
              </div>
            ))}
          </div>

          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="flex justify-between items-center">
              <span className="text-xl font-bold text-gray-900">Total Amount:</span>
              <span className="text-3xl font-bold text-green-600">
                ${total.toFixed(2)}
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
