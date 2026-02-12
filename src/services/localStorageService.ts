import { Product, AdminUser, StockLog, Category, DashboardStats, SaleRecord, SaleItem, PaymentMethod, Cashier } from '../types/product';

// Storage keys
const STORAGE_KEYS = {
  PRODUCTS: 'pos_products',
  ADMIN_USERS: 'pos_admin_users',
  STOCK_LOGS: 'pos_stock_logs',
  CURRENT_USER: 'pos_current_user',
  SALES: 'pos_sales',
  CASHIER_SESSION: 'pos_cashier_session',
  CASHIERS: 'pos_cashiers',
} as const;

// Default admin credentials
const DEFAULT_ADMIN: AdminUser = {
  id: 'admin-001',
  username: 'admin',
  password: 'admin123', // In production, use hashed passwords
  role: 'admin',
  createdAt: new Date().toISOString(),
};

// Initial sample products with categories
const INITIAL_PRODUCTS: Product[] = [
  {
    barcode: '1234567890',
    name: 'Laptop Computer',
    price: 899.99,
    stock: 5,
    category: 'Electronics',
  },
  {
    barcode: '2345678901',
    name: 'Wireless Mouse',
    price: 29.99,
    stock: 15,
    category: 'Peripherals',
  },
  {
    barcode: '3456789012',
    name: 'USB-C Cable',
    price: 12.99,
    stock: 30,
    category: 'Accessories',
  },
  {
    barcode: '4567890123',
    name: 'Mechanical Keyboard',
    price: 149.99,
    stock: 8,
    category: 'Peripherals',
  },
  {
    barcode: '5678901234',
    name: 'Monitor 27"',
    price: 299.99,
    stock: 4,
    category: 'Electronics',
  },
  {
    barcode: '6789012345',
    name: 'Webcam HD',
    price: 79.99,
    stock: 12,
    category: 'Electronics',
  },
  {
    barcode: '7890123456',
    name: 'Headphones',
    price: 59.99,
    stock: 20,
    category: 'Accessories',
  },
  {
    barcode: '8901234567',
    name: 'Phone Charger',
    price: 19.99,
    stock: 25,
    category: 'Accessories',
  },
  {
    barcode: '9012345678',
    name: 'External SSD 1TB',
    price: 129.99,
    stock: 10,
    category: 'Storage',
  },
  {
    barcode: '0123456789',
    name: 'Gaming Chair',
    price: 249.99,
    stock: 3,
    category: 'Furniture',
  },
];

/**
 * Initialize localStorage with default data if empty
 */
export function initializeStorage(): void {
  // Initialize admin users
  if (!localStorage.getItem(STORAGE_KEYS.ADMIN_USERS)) {
    localStorage.setItem(STORAGE_KEYS.ADMIN_USERS, JSON.stringify([DEFAULT_ADMIN]));
  }

  // Initialize products
  if (!localStorage.getItem(STORAGE_KEYS.PRODUCTS)) {
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(INITIAL_PRODUCTS));
  }

  // Initialize stock logs
  if (!localStorage.getItem(STORAGE_KEYS.STOCK_LOGS)) {
    localStorage.setItem(STORAGE_KEYS.STOCK_LOGS, JSON.stringify([]));
  }

  // Initialize sales
  if (!localStorage.getItem(STORAGE_KEYS.SALES)) {
    localStorage.setItem(STORAGE_KEYS.SALES, JSON.stringify([]));
  }
}

/**
 * Authentication Service
 */
export const AuthService = {
  /**
   * Login admin user
   */
  login(username: string, password: string): AdminUser | null {
    const users = JSON.parse(localStorage.getItem(STORAGE_KEYS.ADMIN_USERS) || '[]') as AdminUser[];
    const user = users.find((u) => u.username === username && u.password === password);

    if (user) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
      return user;
    }
    return null;
  },

  /**
   * Logout current user
   */
  logout(): void {
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
  },

  /**
   * Get current logged in user
   */
  getCurrentUser(): AdminUser | null {
    const userJson = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    return userJson ? JSON.parse(userJson) : null;
  },

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return !!this.getCurrentUser();
  },
};

/**
 * Product Service
 */
export const ProductService = {
  /**
   * Get all products
   */
  getAll(): Product[] {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.PRODUCTS) || '[]');
  },

  /**
   * Find product by barcode
   */
  findByBarcode(barcode: string): Product | undefined {
    const products = this.getAll();
    return products.find((p) => p.barcode === barcode);
  },

  /**
   * Check if barcode is unique
   */
  isBarcodeUnique(barcode: string, excludeBarcode?: string): boolean {
    const products = this.getAll();
    return !products.some((p) => p.barcode === barcode && p.barcode !== excludeBarcode);
  },

  /**
   * Add new product
   */
  add(product: Product): { success: boolean; error?: string } {
    // Validate barcode uniqueness
    if (!this.isBarcodeUnique(product.barcode)) {
      return { success: false, error: 'Barcode already exists' };
    }

    // Validate price is positive
    if (product.price <= 0) {
      return { success: false, error: 'Price must be positive' };
    }

    // Validate stock is not negative
    if (product.stock < 0) {
      return { success: false, error: 'Stock cannot be negative' };
    }

    const products = this.getAll();
    products.push(product);
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
    return { success: true };
  },

  /**
   * Update existing product
   */
  update(barcode: string, updates: Partial<Omit<Product, 'barcode'>>): { success: boolean; error?: string } {
    const products = this.getAll();
    const index = products.findIndex((p) => p.barcode === barcode);

    if (index === -1) {
      return { success: false, error: 'Product not found' };
    }

    // Validate price if provided
    if (updates.price !== undefined && updates.price <= 0) {
      return { success: false, error: 'Price must be positive' };
    }

    // Validate stock if provided
    if (updates.stock !== undefined && updates.stock < 0) {
      return { success: false, error: 'Stock cannot be negative' };
    }

    products[index] = { ...products[index], ...updates };
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
    return { success: true };
  },

  /**
   * Delete product
   */
  delete(barcode: string): { success: boolean; error?: string } {
    const products = this.getAll();
    const filtered = products.filter((p) => p.barcode !== barcode);

    if (filtered.length === products.length) {
      return { success: false, error: 'Product not found' };
    }

    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(filtered));
    return { success: true };
  },

  /**
   * Restock product (add stock)
   */
  restock(barcode: string, quantity: number, performedBy: string): { success: boolean; error?: string } {
    if (quantity <= 0) {
      return { success: false, error: 'Quantity must be positive' };
    }

    const products = this.getAll();
    const product = products.find((p) => p.barcode === barcode);

    if (!product) {
      return { success: false, error: 'Product not found' };
    }

    const previousStock = product.stock;
    const newStock = previousStock + quantity;

    // Update product stock
    product.stock = newStock;
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));

    // Log the stock change
    const log: StockLog = {
      id: `log-${Date.now()}`,
      barcode,
      productName: product.name,
      previousStock,
      newStock,
      quantityAdded: quantity,
      timestamp: new Date().toISOString(),
      performedBy,
    };

    const logs = JSON.parse(localStorage.getItem(STORAGE_KEYS.STOCK_LOGS) || '[]') as StockLog[];
    logs.unshift(log); // Add to beginning
    localStorage.setItem(STORAGE_KEYS.STOCK_LOGS, JSON.stringify(logs));

    return { success: true };
  },

  /**
   * Search and filter products
   */
  search(query: string): Product[] {
    const products = this.getAll();
    const lowerQuery = query.toLowerCase().trim();

    if (!lowerQuery) return products;

    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(lowerQuery) ||
        p.barcode.toLowerCase().includes(lowerQuery)
    );
  },

  /**
   * Sort products
   */
  sort(products: Product[], field: 'price' | 'stock' | 'name' | 'category', order: 'asc' | 'desc'): Product[] {
    const sorted = [...products].sort((a, b) => {
      let comparison = 0;

      switch (field) {
        case 'price':
        case 'stock':
          comparison = a[field] - b[field];
          break;
        case 'name':
        case 'category':
          comparison = a[field].localeCompare(b[field]);
          break;
      }

      return order === 'asc' ? comparison : -comparison;
    });

    return sorted;
  },
};

/**
 * Stock Log Service
 */
export const StockLogService = {
  /**
   * Get all stock logs
   */
  getAll(): StockLog[] {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.STOCK_LOGS) || '[]');
  },

  /**
   * Get logs for specific product
   */
  getByBarcode(barcode: string): StockLog[] {
    const logs = this.getAll();
    return logs.filter((log) => log.barcode === barcode);
  },

  /**
   * Get recent logs (limited count)
   */
  getRecent(limit: number = 10): StockLog[] {
    const logs = this.getAll();
    return logs.slice(0, limit);
  },
};

/**
 * Dashboard Service
 */
export const DashboardService = {
  /**
   * Get dashboard statistics
   */
  getStats(): DashboardStats {
    const products = ProductService.getAll();
    const LOW_STOCK_THRESHOLD = 5;

    return {
      totalProducts: products.length,
      inStockProducts: products.filter((p) => p.stock > 0).length,
      outOfStockProducts: products.filter((p) => p.stock === 0).length,
      lowStockProducts: products.filter((p) => p.stock > 0 && p.stock < LOW_STOCK_THRESHOLD).length,
    };
  },

  /**
   * Get low stock products
   */
  getLowStockProducts(threshold: number = 5): Product[] {
    const products = ProductService.getAll();
    return products.filter((p) => p.stock > 0 && p.stock < threshold);
  },

  /**
   * Get out of stock products
   */
  getOutOfStockProducts(): Product[] {
    const products = ProductService.getAll();
    return products.filter((p) => p.stock === 0);
  },
};

// Categories list for dropdowns
export const CATEGORIES: Category[] = [
  'Electronics',
  'Accessories',
  'Peripherals',
  'Storage',
  'Furniture',
  'Other',
];

// Low stock threshold constant
export const LOW_STOCK_THRESHOLD = 5;

/**
 * Sale Service
 * Handles sales transactions and receipt generation
 */
export const SaleService = {
  /**
   * Generate unique receipt number
   */
  generateReceiptNumber(): string {
    const date = new Date();
    const prefix = 'RCP';
    const timestamp = date.getTime().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 5).toUpperCase();
    return `${prefix}-${timestamp}-${random}`;
  },

  /**
   * Process a sale transaction
   */
  processSale(
    items: SaleItem[],
    paymentMethod: PaymentMethod,
    amountPaid: number,
    cashierName: string
  ): { success: boolean; sale?: SaleRecord; error?: string; change?: number } {
    // Validate items
    if (items.length === 0) {
      return { success: false, error: 'No items in cart' };
    }

    // Calculate totals
    const subtotal = items.reduce((sum, item) => sum + item.total, 0);
    const taxRate = 0; // No tax for now, can be configured
    const tax = subtotal * taxRate;
    const total = subtotal + tax;

    // Validate payment
    if (amountPaid < total) {
      return { success: false, error: 'Insufficient payment amount' };
    }

    const change = amountPaid - total;

    // Check stock availability for all items
    const products = ProductService.getAll();
    for (const item of items) {
      const product = products.find((p) => p.barcode === item.barcode);
      if (!product) {
        return { success: false, error: `Product ${item.name} not found` };
      }
      if (product.stock < item.quantity) {
        return {
          success: false,
          error: `Insufficient stock for ${item.name}. Available: ${product.stock}`,
        };
      }
    }

    // Deduct stock for all items
    for (const item of items) {
      const productIndex = products.findIndex((p) => p.barcode === item.barcode);
      if (productIndex !== -1) {
        products[productIndex].stock -= item.quantity;
      }
    }
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));

    // Create sale record
    const sale: SaleRecord = {
      id: `sale-${Date.now()}`,
      receiptNumber: this.generateReceiptNumber(),
      items: [...items],
      subtotal,
      tax,
      total,
      paymentMethod,
      amountPaid,
      change,
      cashierName,
      timestamp: new Date().toISOString(),
    };

    // Save sale record
    const sales = JSON.parse(localStorage.getItem(STORAGE_KEYS.SALES) || '[]') as SaleRecord[];
    sales.unshift(sale);
    localStorage.setItem(STORAGE_KEYS.SALES, JSON.stringify(sales));

    return { success: true, sale, change };
  },

  /**
   * Get all sales
   */
  getAll(): SaleRecord[] {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.SALES) || '[]');
  },

  /**
   * Get sale by receipt number
   */
  getByReceiptNumber(receiptNumber: string): SaleRecord | undefined {
    const sales = this.getAll();
    return sales.find((s) => s.receiptNumber === receiptNumber);
  },

  /**
   * Get sales by date range
   */
  getByDateRange(startDate: Date, endDate: Date): SaleRecord[] {
    const sales = this.getAll();
    return sales.filter((sale) => {
      const saleDate = new Date(sale.timestamp);
      return saleDate >= startDate && saleDate <= endDate;
    });
  },

  /**
   * Get today's sales
   */
  getTodaySales(): SaleRecord[] {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    return this.getByDateRange(today, tomorrow);
  },

  /**
   * Calculate daily totals
   */
  getDailyTotals(date: Date = new Date()): {
    totalSales: number;
    totalRevenue: number;
    totalItems: number;
    byPaymentMethod: Record<PaymentMethod, { count: number; amount: number }>;
  } {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const sales = this.getByDateRange(startOfDay, endOfDay);

    const byPaymentMethod: Record<PaymentMethod, { count: number; amount: number }> = {
      cash: { count: 0, amount: 0 },
      mobile_money: { count: 0, amount: 0 },
      card: { count: 0, amount: 0 },
    };

    let totalItems = 0;

    for (const sale of sales) {
      byPaymentMethod[sale.paymentMethod].count += 1;
      byPaymentMethod[sale.paymentMethod].amount += sale.total;
      totalItems += sale.items.reduce((sum, item) => sum + item.quantity, 0);
    }

    return {
      totalSales: sales.length,
      totalRevenue: sales.reduce((sum, sale) => sum + sale.total, 0),
      totalItems,
      byPaymentMethod,
    };
  },
};

// Default cashiers
const DEFAULT_CASHIERS: Cashier[] = [
  {
    id: 'cashier-001',
    cashierId: 'CASHIER001',
    name: 'John Doe',
    email: 'john.doe@pos.com',
    phone: '+1234567890',
    password: 'pos123',
    role: 'cashier',
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'cashier-002',
    cashierId: 'CASHIER002',
    name: 'Jane Smith',
    email: 'jane.smith@pos.com',
    phone: '+1234567891',
    password: 'pos123',
    role: 'cashier',
    isActive: true,
    createdAt: new Date().toISOString(),
  },
];

/**
 * Cashier Service
 * Manages cashier users
 */
export const CashierService = {
  /**
   * Initialize cashiers in storage
   */
  initialize(): void {
    if (!localStorage.getItem(STORAGE_KEYS.CASHIERS)) {
      localStorage.setItem(STORAGE_KEYS.CASHIERS, JSON.stringify(DEFAULT_CASHIERS));
    }
  },

  /**
   * Get all cashiers
   */
  getAll(): Cashier[] {
    this.initialize();
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.CASHIERS) || '[]');
  },

  /**
   * Get active cashiers only
   */
  getActive(): Cashier[] {
    return this.getAll().filter((c) => c.isActive);
  },

  /**
   * Find cashier by ID
   */
  findById(id: string): Cashier | undefined {
    return this.getAll().find((c) => c.id === id);
  },

  /**
   * Find cashier by cashierId
   */
  findByCashierId(cashierId: string): Cashier | undefined {
    return this.getAll().find((c) => c.cashierId === cashierId);
  },

  /**
   * Check if cashierId is unique
   */
  isCashierIdUnique(cashierId: string, excludeId?: string): boolean {
    const cashiers = this.getAll();
    return !cashiers.some((c) => c.cashierId === cashierId && c.id !== excludeId);
  },

  /**
   * Add new cashier
   */
  add(cashier: Omit<Cashier, 'id' | 'createdAt'>): { success: boolean; error?: string } {
    // Validate cashierId uniqueness
    if (!this.isCashierIdUnique(cashier.cashierId)) {
      return { success: false, error: 'Cashier ID already exists' };
    }

    // Validate required fields
    if (!cashier.name.trim() || !cashier.email.trim() || !cashier.password) {
      return { success: false, error: 'All fields are required' };
    }

    const newCashier: Cashier = {
      ...cashier,
      id: `cashier-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };

    const cashiers = this.getAll();
    cashiers.push(newCashier);
    localStorage.setItem(STORAGE_KEYS.CASHIERS, JSON.stringify(cashiers));
    return { success: true };
  },

  /**
   * Update cashier
   */
  update(id: string, updates: Partial<Omit<Cashier, 'id' | 'createdAt'>>): { success: boolean; error?: string } {
    const cashiers = this.getAll();
    const index = cashiers.findIndex((c) => c.id === id);

    if (index === -1) {
      return { success: false, error: 'Cashier not found' };
    }

    // Validate cashierId uniqueness if being updated
    if (updates.cashierId && !this.isCashierIdUnique(updates.cashierId, id)) {
      return { success: false, error: 'Cashier ID already exists' };
    }

    cashiers[index] = { ...cashiers[index], ...updates };
    localStorage.setItem(STORAGE_KEYS.CASHIERS, JSON.stringify(cashiers));
    return { success: true };
  },

  /**
   * Delete cashier
   */
  delete(id: string): { success: boolean; error?: string } {
    const cashiers = this.getAll();
    const filtered = cashiers.filter((c) => c.id !== id);

    if (filtered.length === cashiers.length) {
      return { success: false, error: 'Cashier not found' };
    }

    localStorage.setItem(STORAGE_KEYS.CASHIERS, JSON.stringify(filtered));
    return { success: true };
  },

  /**
   * Toggle cashier active status
   */
  toggleActive(id: string): { success: boolean; error?: string } {
    const cashier = this.findById(id);
    if (!cashier) {
      return { success: false, error: 'Cashier not found' };
    }
    return this.update(id, { isActive: !cashier.isActive });
  },

  /**
   * Validate cashier login
   */
  validateLogin(cashierId: string, password: string): Cashier | null {
    const cashier = this.findByCashierId(cashierId);
    if (cashier && cashier.password === password && cashier.isActive) {
      // Update last login
      this.update(cashier.id, { lastLogin: new Date().toISOString() });
      return cashier;
    }
    return null;
  },

  /**
   * Get cashier stats
   */
  getStats(): {
    total: number;
    active: number;
    inactive: number;
  } {
    const cashiers = this.getAll();
    return {
      total: cashiers.length,
      active: cashiers.filter((c) => c.isActive).length,
      inactive: cashiers.filter((c) => !c.isActive).length,
    };
  },
};
