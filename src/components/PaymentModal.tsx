import { useState } from 'react';
import { X, Banknote, CreditCard, Smartphone, Calculator, CheckCircle } from 'lucide-react';
import { PaymentMethod, CartItem } from '../types/product';

interface PaymentModalProps {
  items: CartItem[];
  total: number;
  onClose: () => void;
  onComplete: (paymentMethod: PaymentMethod, amountPaid: number) => void;
}

/**
 * Payment Modal Component
 * Handles payment processing with multiple payment methods
 */
export function PaymentModal({ items, total, onClose, onComplete }: PaymentModalProps) {
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [amountPaid, setAmountPaid] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);

  const change = parseFloat(amountPaid || '0') - total;
  const isValidPayment = parseFloat(amountPaid || '0') >= total;

  const paymentMethods = [
    { id: 'cash' as PaymentMethod, label: 'Cash', icon: Banknote, color: 'bg-green-100 text-green-700' },
    { id: 'mobile_money' as PaymentMethod, label: 'Mobile Money', icon: Smartphone, color: 'bg-blue-100 text-blue-700' },
    { id: 'card' as PaymentMethod, label: 'Card', icon: CreditCard, color: 'bg-purple-100 text-purple-700' },
  ];

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Allow only numbers and decimal point
    if (value === '' || /^\d*\.?\d{0,2}$/.test(value)) {
      setAmountPaid(value);
    }
  };

  const handleQuickAmount = (amount: number) => {
    setAmountPaid(amount.toFixed(2));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValidPayment) return;

    setIsProcessing(true);
    // Simulate processing delay
    await new Promise((resolve) => setTimeout(resolve, 1000));
    onComplete(paymentMethod, parseFloat(amountPaid));
  };

  // Quick amount buttons for cash payments
  const quickAmounts = [5, 10, 20, 50, 100].filter((amt) => amt >= total || amt === Math.ceil(total / 5) * 5);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={onClose} />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-2 sm:p-4">
        <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full mx-2 sm:mx-0 max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200 sticky top-0 bg-white rounded-t-lg">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900">Payment</h3>
            <button onClick={onClose} disabled={isProcessing} className="text-gray-400 hover:text-gray-600 p-1">
              <X className="h-5 w-5 sm:h-6 sm:w-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 sm:space-y-6">
            {/* Order Summary */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-600">Items:</span>
                <span className="font-medium">{items.reduce((sum, item) => sum + item.quantity, 0)}</span>
              </div>
              <div className="flex justify-between items-center text-lg font-bold">
                <span className="text-gray-900">Total Amount:</span>
                <span className="text-blue-600">${total.toFixed(2)}</span>
              </div>
            </div>

            {/* Payment Method Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">Select Payment Method</label>
              <div className="grid grid-cols-3 gap-2 sm:gap-3">
                {paymentMethods.map((method) => {
                  const Icon = method.icon;
                  return (
                    <button
                      key={method.id}
                      type="button"
                      onClick={() => setPaymentMethod(method.id)}
                      disabled={isProcessing}
                      className={`flex flex-col items-center p-2 sm:p-3 rounded-lg border-2 transition-all ${
                        paymentMethod === method.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className={`p-1.5 sm:p-2 rounded-full mb-1 sm:mb-2 ${method.color}`}>
                        <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
                      </div>
                      <span className="text-xs sm:text-sm font-medium text-center leading-tight">{method.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Amount Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {paymentMethod === 'cash' ? 'Amount Received' : 'Payment Amount'}
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-lg">$</span>
                <input
                  type="text"
                  value={amountPaid}
                  onChange={handleAmountChange}
                  disabled={isProcessing}
                  className="block w-full pl-10 pr-4 py-3 text-lg border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="0.00"
                />
              </div>

              {/* Quick Amount Buttons (Cash only) */}
              {paymentMethod === 'cash' && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {quickAmounts.map((amount) => (
                    <button
                      key={amount}
                      type="button"
                      onClick={() => handleQuickAmount(amount)}
                      disabled={isProcessing}
                      className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
                    >
                      ${amount}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => handleQuickAmount(total)}
                    disabled={isProcessing}
                    className="px-3 py-1 text-sm bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-full transition-colors"
                  >
                    Exact
                  </button>
                </div>
              )}
            </div>

            {/* Change Display (Cash only) */}
            {paymentMethod === 'cash' && (
              <div className={`p-4 rounded-lg ${change >= 0 ? 'bg-green-50' : 'bg-red-50'}`}>
                <div className="flex justify-between items-center">
                  <span className="font-medium">Change:</span>
                  <span className={`text-xl font-bold ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    ${change.toFixed(2)}
                  </span>
                </div>
              </div>
            )}

            {/* Error Message */}
            {!isValidPayment && amountPaid && (
              <div className="text-red-600 text-sm flex items-center">
                <Calculator className="h-4 w-4 mr-2" />
                Insufficient amount. Please enter at least ${total.toFixed(2)}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={!isValidPayment || isProcessing}
              className="w-full flex items-center justify-center space-x-2 py-3 px-4 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-bold rounded-lg transition-colors"
            >
              {isProcessing ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <CheckCircle className="h-5 w-5" />
                  <span>Complete Payment</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
