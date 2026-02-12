// Product category options
export type Category =
  | 'Electronics'
  | 'Accessories'
  | 'Peripherals'
  | 'Storage'
  | 'Furniture'
  | 'Other';

// Main Product interface with category support
export interface Product {
  barcode: string;
  name: string;
  price: number;
  stock: number;
  category: Category;
}

// Cart item for cashier side
export interface CartItem {
  product: Product;
  quantity: number;
}

// Admin user for authentication
export interface AdminUser {
  id: string;
  username: string;
  password: string; // In real app, this would be hashed
  role: 'admin';
  createdAt: string;
}

// Stock change log entry for tracking restocks
export interface StockLog {
  id: string;
  barcode: string;
  productName: string;
  previousStock: number;
  newStock: number;
  quantityAdded: number;
  timestamp: string;
  performedBy: string;
}

// Product form data for add/edit operations
export interface ProductFormData {
  name: string;
  barcode: string;
  category: Category;
  price: number;
  stock: number;
}

// Dashboard statistics
export interface DashboardStats {
  totalProducts: number;
  inStockProducts: number;
  outOfStockProducts: number;
  lowStockProducts: number;
}

// Sort options for product list
export type SortField = 'name' | 'price' | 'stock' | 'category';
export type SortOrder = 'asc' | 'desc';

// Search filters for product list
export interface ProductFilters {
  searchQuery: string;
  sortField: SortField;
  sortOrder: SortOrder;
}

// Payment methods supported
export type PaymentMethod = 'cash' | 'mobile_money' | 'card';

// Sale item (part of a sale transaction)
export interface SaleItem {
  barcode: string;
  name: string;
  price: number;
  quantity: number;
  total: number;
}

// Complete sale record
export interface SaleRecord {
  id: string;
  receiptNumber: string;
  items: SaleItem[];
  subtotal: number;
  tax: number;
  total: number;
  paymentMethod: PaymentMethod;
  amountPaid: number;
  change: number;
  cashierName: string;
  timestamp: string;
}

// Cashier session info
export interface CashierSession {
  id: string;
  cashierName: string;
  startTime: string;
  endTime?: string;
  openingBalance: number;
  closingBalance?: number;
}

// Cashier user for authentication
export interface Cashier {
  id: string;
  cashierId: string;
  name: string;
  email: string;
  phone: string;
  password: string; // In real app, this would be hashed
  role: 'cashier';
  isActive: boolean;
  createdAt: string;
  lastLogin?: string;
}
