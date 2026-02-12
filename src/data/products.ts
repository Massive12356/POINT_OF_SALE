import { Product } from '../types/product';

/**
 * Initial products data with categories
 * Note: This is the static fallback data.
 * The application now uses localStorage for persistent data storage.
 * See services/localStorageService.ts for the active data management.
 */
export const products: Product[] = [
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
 * Find product by barcode
 * @deprecated Use ProductService.findByBarcode() from localStorageService instead
 */
export function findProductByBarcode(barcode: string): Product | undefined {
  return products.find((p) => p.barcode === barcode);
}
