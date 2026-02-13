import { useState, useEffect } from 'react';
import { Store, Lock, User, Eye, EyeOff, Shield, Building2 } from 'lucide-react';
import { CashierService } from '../services/localStorageService';

interface CashierLoginProps {
  onLogin: (cashierName: string, assignedStoreId?: string, assignedStoreName?: string) => void;
  onSwitchToAdmin: () => void;
}

/**
 * Cashier Login Page
 * Simple login for cashiers to start their shift
 */
export function CashierLogin({ onLogin, onSwitchToAdmin }: CashierLoginProps) {
  const [cashierId, setCashierId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Initialize cashiers on mount
  useEffect(() => {
    CashierService.initialize();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    const cashier = CashierService.validateLogin(cashierId.trim(), password);

    if (cashier) {
      onLogin(cashier.name, cashier.assignedStoreId, cashier.assignedStoreName);
    } else {
      setError('Invalid cashier ID, password, or account is inactive');
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100 py-6 sm:py-12 px-3 sm:px-4 lg:px-8">
      <div className="max-w-md w-full space-y-6 sm:space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto h-12 w-12 sm:h-16 sm:w-16 bg-green-600 rounded-full flex items-center justify-center mb-3 sm:mb-4">
            <Store className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900">Cashier Login</h2>
          <p className="mt-1 sm:mt-2 text-sm text-gray-600">
            Sign in to start your shift
          </p>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-lg shadow-lg p-4 sm:p-8">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            {/* Cashier ID Field */}
            <div>
              <label htmlFor="cashierId" className="block text-sm font-medium text-gray-700 mb-1">
                Cashier ID
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="cashierId"
                  name="cashierId"
                  type="text"
                  required
                  value={cashierId}
                  onChange={(e) => setCashierId(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors uppercase"
                  placeholder="Enter cashier ID"
                  disabled={isLoading}
                  autoFocus
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                  placeholder="Enter password"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Signing in...</span>
                </div>
              ) : (
                'Start Shift'
              )}
            </button>
          </form>

          {/* Demo Credentials */}
          <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-gray-200">
            <p className="text-xs text-gray-500 text-center mb-2">Demo Credentials</p>
            <div className="bg-gray-50 rounded-lg p-2 sm:p-3 text-xs sm:text-sm space-y-1">
              <div className="flex justify-between">
                <span className="text-gray-600">Cashier ID:</span>
                <code className="bg-white px-2 py-0.5 rounded border">CASHIER001</code>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Password:</span>
                <code className="bg-white px-2 py-0.5 rounded border">pos123</code>
              </div>
            </div>
            <p className="text-xs text-gray-400 text-center mt-2">
              Cashiers can be assigned to stores by admin
            </p>
          </div>
        </div>

        {/* Admin Access */}
        <div className="text-center space-y-2 px-2 sm:px-0">
          <button
            onClick={onSwitchToAdmin}
            className="flex items-center justify-center space-x-2 w-full px-4 py-2 bg-white text-gray-700 rounded-lg shadow hover:shadow-md transition-shadow font-medium text-sm sm:text-base"
          >
            <Shield className="h-4 w-4" />
            <span>Admin Login</span>
          </button>
        </div>
      </div>
    </div>
  );
}
