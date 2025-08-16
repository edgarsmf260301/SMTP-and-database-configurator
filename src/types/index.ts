// Export all types from organized modules
export * from './user';
export * from './auth';
export * from './api';

// Tipos de menú y productos
export interface MenuItem {
  _id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  isAvailable: boolean;
  image?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Order {
  _id: string;
  items: OrderItem[];
  total: number;
  status: 'pending' | 'preparing' | 'ready' | 'delivered' | 'cancelled';
  customerName?: string;
  customerPhone?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface OrderItem {
  menuItem: MenuItem;
  quantity: number;
  price: number;
  notes?: string;
}

// Tipos de dashboard
export interface DashboardStats {
  totalOrders: number;
  totalRevenue: number;
  averageOrderValue: number;
  popularItems: MenuItem[];
  recentOrders: Order[];
}
