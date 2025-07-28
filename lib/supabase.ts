import { createClient } from '@supabase/supabase-js';
import { Customer, Order, OrderItem, Product, Supplier, Invoice, InvoiceItem, DashboardMetrics, CustomerInput, OrderInput } from '@/types';
// import type { NextApiRequest, NextApiResponse } from 'next';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database service functions
export const dbService = {
  // Products
  async getProducts(): Promise<Product[]> {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  async createProduct(product: Product): Promise<Product> {
    const { data, error } = await supabase
      .from('products')
      .insert([{
        ...product,
        expiry_date: product.expiryDate instanceof Date ? product.expiryDate.toISOString() : product.expiryDate,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }])
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async updateProduct(id: string, updates: Partial<Product>): Promise<Product> {
    const { data, error } = await supabase
      .from('products')
      .update({
        ...updates,
        expiry_date: updates.expiryDate instanceof Date ? updates.expiryDate.toISOString() : updates.expiryDate,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async deleteProduct(id: string): Promise<void> {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);
    if (error) throw error;
  },

  // Customers
  async getCustomers(): Promise<Customer[]> {
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  async createCustomer(customer: CustomerInput): Promise<Customer> {
    const { data, error } = await supabase
      .from('customers')
      .insert([{
        ...customer,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }])
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async updateCustomer(id: string, updates: Partial<Customer>): Promise<Customer> {
    const { data, error } = await supabase
      .from('customers')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async deleteCustomer(id: string): Promise<void> {
    const { error } = await supabase
      .from('customers')
      .delete()
      .eq('id', id);
    if (error) throw error;
  },

  // Orders
  async getOrders(): Promise<Order[]> {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        customers(name, email),
        order_items(
          *,
          products(name, sku)
        )
      `)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  async createOrder(order: OrderInput): Promise<Order> {
    const { data, error } = await supabase
      .from('orders')
      .insert([{
        ...order,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }])
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async createOrderWithItems(orderData: Omit<Order, 'id' | 'created_at' | 'order_items'>, items: OrderItem[]): Promise<Order> {
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert([{
        customer_id: orderData.customer_id,
        customer_name: orderData.customer_name,
        order_date: orderData.order_date,
        required_date: orderData.required_date,
        status: orderData.status || 'pending',
        total_amount: orderData.total_amount,
        payment_status: orderData.payment_status || 'pending',
        priority: orderData.priority || 'medium',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }])
      .select()
      .single();

    if (orderError) throw orderError;

    const orderItems = items.map((item) => ({
      order_id: order.id,
      product_id: item.product_id,
      product_name: item.product_name,
      quantity: item.quantity,
      unit_price: item.unit_price,
      total_price: item.total_price,
      batch_number: item.batch_number || null,
      expiry_date: item.expiry_date || null,
    }));

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems);

    if (itemsError) throw itemsError;

    return order;
  },

  async updateOrderStatus(id: string, status: Order['status']): Promise<Order> {
    const { data, error } = await supabase
      .from('orders')
      .update({
        status,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  // Suppliers
  async getSuppliers(): Promise<Supplier[]> {
    const { data, error } = await supabase
      .from('suppliers')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  async createSupplier(supplier: Supplier): Promise<Supplier> {
    const { data, error } = await supabase
      .from('suppliers')
      .insert([{
        ...supplier,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }])
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async updateSupplier(id: string, updates: Partial<Supplier>): Promise<Supplier> {
    const { data, error } = await supabase
      .from('suppliers')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async deleteSupplier(id: string): Promise<void> {
    const { error } = await supabase
      .from('suppliers')
      .delete()
      .eq('id', id);
    if (error) throw error;
  },

  // Invoices
  async getInvoices(): Promise<Invoice[]> {
    const { data, error } = await supabase
      .from('invoices')
      .select(`
        *,
        customers(name, email),
        orders(id, status),
        invoice_items(
          *,
          products(name, sku)
        )
      `)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  async createInvoice(invoiceData: Omit<Invoice, 'id' | 'created_at'>, items: InvoiceItem[]): Promise<Invoice> {
    const { data: invoice, error: invoiceError } = await supabase
      .from('invoices')
      .insert([{
        order_id: invoiceData.order_id,
        customer_id: invoiceData.customer_id,
        customer_name: invoiceData.customer_name,
        invoice_date: invoiceData.invoice_date instanceof Date ? invoiceData.invoice_date.toISOString() : invoiceData.invoice_date,
        due_date: invoiceData.due_date instanceof Date ? invoiceData.due_date.toISOString() : invoiceData.due_date,
        subtotal: invoiceData.subtotal,
        tax_amount: invoiceData.tax_amount || 0,
        total_amount: invoiceData.total_amount,
        paid_amount: invoiceData.paid_amount || 0,
        status: invoiceData.status || 'draft',
        payment_terms: String(invoiceData.payment_terms) || 'Net 30', // Convert number to string
        notes: invoiceData.notes || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }])
      .select()
      .single();

    if (invoiceError) throw invoiceError;

    if (items && items.length > 0) {
      const invoiceItems = items.map((item) => ({
        invoice_id: invoice.id,
        product_id: item.product_id,
        product_name: item.product_name,
        quantity: item.quantity,
        unit_price: item.unit_price,
        total_price: item.total_price,
      }));

      const { error: itemsError } = await supabase
        .from('invoice_items')
        .insert(invoiceItems);

      if (itemsError) throw itemsError;
    }

    return invoice;
  },

  async updateInvoiceStatus(id: string, status: Invoice['status'], paidAmount?: number): Promise<Invoice> {
    const updates: Partial<Invoice> = {
      status,
      // @ts-expect-error: updated_at may not be in Invoice type but is present in DB
      updated_at: new Date().toISOString(),
    };

    if (paidAmount !== undefined) {
      updates.paid_amount = paidAmount;
    }

    const { data, error } = await supabase
      .from('invoices')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  // Dashboard metrics
  async getDashboardMetrics(): Promise<DashboardMetrics> {
    try {
      // Get all data in parallel
      const [
        { data: products },
        { data: customers },
        { data: orders },
        { data: invoices },
      ] = await Promise.all([
        supabase.from('products').select('*'),
        supabase.from('customers').select('*'),
        supabase.from('orders').select('*'),
        supabase.from('invoices').select('*'),
      ]);

      // Calculate metrics
      const totalRevenue = invoices?.reduce((sum, inv) => sum + (inv.total_amount || 0), 0) || 0;
      const totalOrders = orders?.length || 0;
      const pendingOrders = orders?.filter((o) => o.status === 'pending').length || 0;
      const lowStockItems = products?.filter((p) => p.quantity <= p.reorder_level).length || 0;
      const expiringItems = products?.filter((p) => {
        if (!p.expiry_date) return false;
        const expiryDate = p.expiry_date instanceof Date ? p.expiry_date : new Date(p.expiry_date);
        const daysUntilExpiry = Math.floor(
          (expiryDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
        );
        return daysUntilExpiry <= 90 && daysUntilExpiry > 0;
      }).length || 0;
      const activeCustomers = customers?.filter((c) => c.status === 'active').length || 0;

      return {
        totalRevenue,
        totalOrders,
        pendingOrders,
        lowStockItems,
        expiringItems,
        activeCustomers,
        revenueGrowth: 12.5, // Placeholder: calculate based on historical data
        orderGrowth: 8.3, // Placeholder: calculate based on historical data
      };
    } catch (error: unknown) {
      console.error('Error fetching dashboard metrics:', error instanceof Error ? error.message : error);
      return {
        totalRevenue: 0,
        totalOrders: 0,
        pendingOrders: 0,
        lowStockItems: 0,
        expiringItems: 0,
        activeCustomers: 0,
        revenueGrowth: 0,
        orderGrowth: 0,
      };
    }
  },

  // Delete user account (auth + related data)
//   async deleteAccount(userId: string): Promise<{ success: boolean; message?: string }> {
//     try {
//       // Clean up related database records in a transaction
//       const [invoicesResult, ordersResult, customersResult, profileResult] = await Promise.all([
//         supabase.from('invoices').delete().eq('customer_id', userId),
//         supabase.from('orders').delete().eq('customer_id', userId),
//         supabase.from('customers').delete().eq('id', userId),
//         supabase.from('profile').delete().eq('id', userId),
//       ]);

//       // Check for errors in table deletions
//       for (const [table, result] of [
//         ['invoices', invoicesResult],
//         ['orders', ordersResult],
//         ['customers', customersResult],
//         ['profile', profileResult],
//       ]) {
//         // Defensive: skip check if result is a string (error property only exists on PostgrestSingleResponse)
//         if (typeof result !== 'string' && result.error) {
//           throw new Error(`Failed to delete from ${table}: ${result.error.message}`);
//         }
//       }

//       // Delete the auth user using Supabase admin API
//       const { error: authError } = await supabase.auth.admin.deleteUser(userId);

//       if (authError) {
//         throw new Error(`Failed to delete auth account: ${authError.message}`);
//       }

//       return { success: true };
//     } catch (error: unknown) {
//       const errorMessage = error instanceof Error ? error.message : String(error);
//       console.error('Error deleting account:', errorMessage, { userId, error });
//       return { success: false, message: errorMessage };
//     }
// }


};
