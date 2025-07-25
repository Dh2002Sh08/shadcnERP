export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'operator' | 'viewer';
  department: string;
  lastLogin: Date;
}

export interface Product {
  id: string;
  name: string;
  genericName: string;
  manufacturer: string;
  category: string;
  sku: string;
  batchNumber: string;
  expiryDate: Date;
  quantity: number;
  unitPrice: number;
  reorderLevel: number;
  status: 'active' | 'discontinued' | 'recalled';
  regulatoryInfo: {
    licenseNumber: string;
    drugCode: string;
    schedule: string;
  };
}

export interface Customer {
  id: string;
  name: string;
  type: 'hospital' | 'pharmacy' | 'clinic' | 'wholesaler';
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  licenseNumber: string;
  creditLimit: number;
  outstandingBalance: number;
  status: 'active' | 'inactive' | 'suspended';
}

export interface Supplier {
  id: string;
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  licenseNumber: string;
  rating: number;
  paymentTerms: string;
  status: 'active' | 'inactive';
}

export interface Order {
  id: string;
  customerId: string;
  customerName: string;
  orderDate: Date;
  requiredDate: Date;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  items: OrderItem[];
  totalAmount: number;
  paymentStatus: 'pending' | 'partial' | 'paid';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  created_at?: Date | null;
}

export interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  batchNumber: string;
  expiryDate: Date;
}

export interface Invoice {
  id: string;
  orderId: string;
  customerId: string;
  customerName: string;
  invoiceDate: Date;
  dueDate: Date;
  amount: number;
  paidAmount: number;
  status: 'draft' | 'sent' | 'overdue' | 'paid' | 'cancelled';
}

export interface DashboardMetrics {
  totalRevenue: number;
  totalOrders: number;
  pendingOrders: number;
  lowStockItems: number;
  expiringItems: number;
  activeCustomers: number;
  revenueGrowth: number;
  orderGrowth: number;
}