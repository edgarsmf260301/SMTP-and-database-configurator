// Tipos de usuario
export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'staff';
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserLogin {
  email: string;
  password: string;
}

export interface UserRegister extends UserLogin {
  name: string;
  role?: 'admin' | 'manager' | 'staff';
}

// Tipos de respuesta de API
export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

// Tipos de autenticación
export interface AuthContextType {
  user: User | null;
  login: (credentials: UserLogin) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

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