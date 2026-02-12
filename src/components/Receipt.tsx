import { useRef } from 'react';
import { Printer, X, CheckCircle, Store, Calendar, User, CreditCard, Banknote, Smartphone } from 'lucide-react';
import { SaleRecord, PaymentMethod } from '../types/product';

interface ReceiptProps {
  sale: SaleRecord;
  onClose: () => void;
  onNewSale: () => void;
}

/**
 * Receipt Component
 * Displays and prints sale receipt
 */
export function Receipt({ sale, onClose, onNewSale }: ReceiptProps) {
  const receiptRef = useRef<HTMLDivElement>(null);

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

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

  const handlePrint = () => {
    const printContent = receiptRef.current;
    if (!printContent) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Receipt - ${sale.receiptNumber}</title>
          <style>
            @media print {
              body { margin: 0; padding: 20px; font-family: 'Courier New', monospace; }
              .receipt { max-width: 300px; margin: 0 auto; }
            }
            body { font-family: 'Courier New', monospace; background: white; }
            .receipt { max-width: 300px; margin: 0 auto; padding: 20px; }
            .header { text-align: center; border-bottom: 2px dashed #000; padding-bottom: 10px; margin-bottom: 10px; }
            .store-name { font-size: 18px; font-weight: bold; margin-bottom: 5px; }
            .receipt-number { font-size: 12px; color: #666; }
            .info { font-size: 11px; margin: 5px 0; }
            .divider { border-top: 1px dashed #000; margin: 10px 0; }
            .items { margin: 10px 0; }
            .item { display: flex; justify-content: space-between; font-size: 11px; margin: 3px 0; }
            .item-name { flex: 1; }
            .item-qty { width: 30px; text-align: center; }
            .item-price { width: 60px; text-align: right; }
            .totals { margin-top: 10px; border-top: 1px dashed #000; padding-top: 10px; }
            .total-row { display: flex; justify-content: space-between; font-size: 11px; margin: 3px 0; }
            .grand-total { font-size: 14px; font-weight: bold; margin-top: 5px; }
            .footer { text-align: center; margin-top: 20px; font-size: 10px; }
            .thank-you { font-size: 12px; font-weight: bold; margin-bottom: 5px; }
          </style>
        </head>
        <body>
          ${printContent.innerHTML}
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={onClose} />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-2 sm:p-4">
        <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full mx-2 sm:mx-0 max-h-[95vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200 sticky top-0 bg-white rounded-t-lg">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
              <h3 className="text-base sm:text-lg font-semibold text-gray-900">Payment Successful</h3>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1">
              <X className="h-5 w-5 sm:h-6 sm:w-6" />
            </button>
          </div>

          <div className="p-4 sm:p-6">
            {/* Receipt Preview */}
            <div
              ref={receiptRef}
              className="bg-white border-2 border-gray-200 rounded-lg p-6 mb-6 font-mono text-sm"
            >
              {/* Store Header */}
              <div className="text-center border-b-2 border-dashed border-gray-300 pb-4 mb-4">
                <div className="flex items-center justify-center mb-2">
                  <Store className="h-6 w-6 text-blue-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">POS STORE</h2>
                <p className="text-gray-500 text-xs mt-1">123 Main Street, City</p>
                <p className="text-gray-500 text-xs">Tel: (555) 123-4567</p>
              </div>

              {/* Receipt Info */}
              <div className="space-y-1 text-xs mb-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 flex items-center">
                    <span className="font-medium">Receipt:</span>
                  </span>
                  <span className="font-mono">{sale.receiptNumber}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 flex items-center">
                    <Calendar className="h-3 w-3 mr-1" />
                    Date:
                  </span>
                  <span>{formatDate(sale.timestamp)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 flex items-center">
                    <User className="h-3 w-3 mr-1" />
                    Cashier:
                  </span>
                  <span>{sale.cashierName}</span>
                </div>
              </div>

              {/* Divider */}
              <div className="border-t border-dashed border-gray-300 my-3" />

              {/* Items */}
              <div className="space-y-2 mb-4">
                {sale.items.map((item, index) => (
                  <div key={index} className="flex justify-between text-xs">
                    <div className="flex-1">
                      <span className="font-medium">{item.name}</span>
                      <span className="text-gray-500 ml-2">x{item.quantity}</span>
                    </div>
                    <div className="text-right">
                      <div>${item.total.toFixed(2)}</div>
                      <div className="text-gray-400">@${item.price.toFixed(2)}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Divider */}
              <div className="border-t border-dashed border-gray-300 my-3" />

              {/* Totals */}
              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal:</span>
                  <span>${sale.subtotal.toFixed(2)}</span>
                </div>
                {sale.tax > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tax:</span>
                    <span>${sale.tax.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between items-center pt-2 border-t border-gray-200 mt-2">
                  <span className="font-bold text-base">TOTAL:</span>
                  <span className="font-bold text-lg">${sale.total.toFixed(2)}</span>
                </div>
              </div>

              {/* Payment Info */}
              <div className="mt-4 pt-3 border-t border-dashed border-gray-300">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-600 flex items-center">
                    {getPaymentIcon(sale.paymentMethod)}
                    <span className="ml-1">{getPaymentLabel(sale.paymentMethod)}:</span>
                  </span>
                  <span>${sale.amountPaid.toFixed(2)}</span>
                </div>
                {sale.change > 0 && (
                  <div className="flex justify-between text-xs mt-1">
                    <span className="text-gray-600">Change:</span>
                    <span className="text-green-600 font-medium">${sale.change.toFixed(2)}</span>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="text-center mt-6 pt-4 border-t-2 border-dashed border-gray-300">
                <p className="font-bold text-sm mb-1">Thank You!</p>
                <p className="text-xs text-gray-500">Please come again</p>
                <p className="text-xs text-gray-400 mt-2">Keep this receipt for returns</p>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-2 sm:space-y-3">
              <button
                onClick={handlePrint}
                className="w-full flex items-center justify-center space-x-2 py-2.5 sm:py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-colors text-sm sm:text-base"
              >
                <Printer className="h-4 w-4 sm:h-5 sm:w-5" />
                <span>Print Receipt</span>
              </button>

              <button
                onClick={onNewSale}
                className="w-full py-2.5 sm:py-3 px-4 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg transition-colors text-sm sm:text-base"
              >
                Start New Sale
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
