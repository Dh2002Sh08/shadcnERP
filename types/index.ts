export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'operator' | 'viewer';
  department: string;
  lastLogin: Date;
}

export interface Product {
  id?: string;
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
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  type: 'hospital' | 'pharmacy' | 'clinic' | 'wholesaler';
  licenseNumber: string;
  creditLimit: number;
  outstandingBalance: number;
  status: 'active' | 'inactive' | 'suspended';
}

// Type for creating/updating customers without ID
export type CustomerInput = Omit<Customer, 'id'>;


export interface Supplier {
  id?: string;
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
  customer_id: string;
  customer_name: string;
  order_date: string;
  required_date: string;
  total_amount: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  payment_status: 'pending' | 'partially_paid' | 'paid';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  created_at: string;
  order_items?: OrderItem[];
}

export interface OrderItem {
  id?: string;
  product_id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  batch_number?: string;
  expiry_date?: string;
  products?: { name: string }; // Optional, for joined product data
}

export type OrderInput = Omit<Order, 'id' | 'created_at' | 'order_items'>;

export interface Invoice {
  id: string;
  order_id: string;
  customer_id: string;
  customer_name: string;
  invoice_date: Date;
  due_date: Date;
  amount: number;
  paid_amount: number;
  status: 'draft' | 'sent' | 'overdue' | 'paid' | 'cancelled';
  subtotal: number;
  tax_amount: number;
  total_amount: number;
  payment_terms: number;
  notes: String;
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

export interface InvoiceItem {
  product_id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}