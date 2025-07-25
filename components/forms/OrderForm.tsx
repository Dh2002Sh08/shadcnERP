import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { dbService } from '../../lib/supabase';
import { Plus, Trash2 } from 'lucide-react';
import { Customer, Product, Order, OrderItem } from '@/types';

interface OrderFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  order?: Order;
}

interface FormData {
  customerId: string;
  customerName: string;
  orderDate: string;
  requiredDate: string;
  status: Order['status'];
  paymentStatus: Order['payment_status'];
  priority: Order['priority'];
}

export const OrderForm: React.FC<OrderFormProps> = ({
  isOpen,
  onClose,
  onSuccess,
  order,
}) => {
  const [loading, setLoading] = useState(false);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [formData, setFormData] = useState<FormData>({
    customerId: order?.customer_id || '',
    customerName: order?.customer_name || '',
    orderDate: order?.order_date || new Date().toISOString().split('T')[0],
    requiredDate: order?.required_date || '',
    status: order?.status || 'pending',
    paymentStatus: order?.payment_status || 'pending',
    priority: order?.priority || 'medium',
  });
  const [items, setItems] = useState<OrderItem[]>([]);
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      loadCustomers();
      loadProducts();
      if (order?.order_items) {
        setItems(order.order_items);
      } else {
        setItems([]);
      }
    }
  }, [isOpen, order]);

  const loadCustomers = async () => {
    try {
      const data = await dbService.getCustomers();
      setCustomers(data || []);
    } catch (error: unknown) {
      console.error('Error loading customers:', error instanceof Error ? error.message : error);
      setErrorMessage('Failed to load customers.');
    }
  };

  const loadProducts = async () => {
    try {
      const data = await dbService.getProducts();
      setProducts(data || []);
    } catch (error: unknown) {
      console.error('Error loading products:', error instanceof Error ? error.message : error);
      setErrorMessage('Failed to load products.');
    }
  };

  const handleCustomerChange = (customerId: string) => {
    const customer = customers.find((c) => c.id === customerId);
    setFormData((prev) => ({
      ...prev,
      customerId,
      customerName: customer?.name || '',
    }));
  };

  const addItem = () => {
    setItems((prev) => [
      ...prev,
      {
        product_id: '',
        product_name: '',
        quantity: 1,
        unit_price: 0,
        total_price: 0,
        batch_number: '',
        expiry_date: '',
      },
    ]);
  };

  const removeItem = (index: number) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, field: keyof OrderItem, value: string | number) => {
    setItems((prev) =>
      prev.map((item, i) => {
        if (i === index) {
          const updatedItem = { ...item, [field]: value };

          if (field === 'product_id') {
            const product = products.find((p) => p.id === value);
            if (product) {
              updatedItem.product_name = product.name || '';
              updatedItem.unit_price = product.unitPrice || 0;
              updatedItem.batch_number = product.batchNumber || '';
              updatedItem.expiry_date = product.expiryDate
                ? typeof product.expiryDate === 'string'
                  ? product.expiryDate
                  : product.expiryDate.toISOString().split('T')[0]
                : '';
            }
          }

          if (field === 'quantity' || field === 'unit_price') {
            updatedItem.total_price = updatedItem.quantity * updatedItem.unit_price;
          }

          return updatedItem;
        }
        return item;
      })
    );
  };

  const getTotalAmount = () => {
    return items.reduce((sum, item) => sum + item.total_price, 0);
  };

  const validateForm = (): string => {
    if (!formData.customerId) return 'Please select a customer.';
    if (!formData.orderDate) return 'Please select an order date.';
    if (!formData.requiredDate) return 'Please select a required date.';
    if (items.length === 0) return 'Please add at least one order item.';
    for (const item of items) {
      if (!item.product_id) return 'Please select a product for all items.';
      if (item.quantity <= 0) return 'Quantity must be greater than 0 for all items.';
      if (item.unit_price < 0) return 'Unit price cannot be negative.';
      if (item.total_price < 0) return 'Total price cannot be negative.';
    }
    return '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');

    const validationError = validateForm();
    if (validationError) {
      setErrorMessage(validationError);
      setLoading(false);
      return;
    }

    try {
      const orderData = {
              ...formData,
              totalAmount: getTotalAmount(),
              created_at: new Date().toISOString(),
              customer_id: formData.customerId,
              customer_name: formData.customerName,
              order_date: formData.orderDate,
              required_date: formData.requiredDate,
              status: formData.status,
              payment_status: formData.paymentStatus,
              priority: formData.priority,
              total_amount: getTotalAmount(),
            };

      console.log('Submitting order:', { orderData, items });

      if (order?.id) {
        await dbService.updateOrderStatus(order.id, formData.status);
      } else {
        await dbService.createOrderWithItems(orderData, items);
      }
      onSuccess();
      onClose();
    } catch (error: unknown) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      console.error('Error saving order:', {
        message: errorMsg,
        code: error instanceof Error && 'code' in error ? error.code : undefined,
        details: error instanceof Error && 'details' in error ? error.details : undefined,
        hint: error instanceof Error && 'hint' in error ? error.hint : undefined,
        error,
      });
      setErrorMessage(`Error saving order: ${errorMsg}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={order ? 'Edit Order' : 'Create New Order'}
      size="xl"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {errorMessage && (
          <div className="p-4 bg-red-100 text-red-700 rounded-lg">{errorMessage}</div>
        )}

        {/* Order Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Customer *</label>
            <select
              value={formData.customerId}
              onChange={(e) => handleCustomerChange(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select Customer</option>
              {customers.map((customer) => (
                <option key={customer.id} value={customer.id}>
                  {customer.name} - {customer.type}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Order Date *</label>
            <input
              type="date"
              value={formData.orderDate}
              onChange={(e) => setFormData((prev) => ({ ...prev, orderDate: e.target.value }))}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Required Date *</label>
            <input
              type="date"
              value={formData.requiredDate}
              onChange={(e) => setFormData((prev) => ({ ...prev, requiredDate: e.target.value }))}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
            <select
              value={formData.priority}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  priority: e.target.value as Order['priority'],
                }))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={formData.status}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  status: e.target.value as Order['status'],
                }))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Payment Status</label>
            <select
              value={formData.paymentStatus}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  paymentStatus: e.target.value as Order['payment_status'],
                }))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="pending">Pending</option>
              <option value="partially_paid">Partially Paid</option>
              <option value="paid">Paid</option>
            </select>
          </div>
        </div>

        {/* Order Items */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-medium text-gray-900">Order Items</h4>
            <button
              type="button"
              onClick={addItem}
              className="flex items-center space-x-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Plus className="h-4 w-4" />
              <span>Add Item</span>
            </button>
          </div>

          <div className="space-y-4">
            {items.map((item, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Product</label>
                    <select
                      value={item.product_id}
                      onChange={(e) => updateItem(index, 'product_id', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select Product</option>
                      {products.map((product) => (
                        <option key={product.id} value={product.id}>
                          {product.name} - {product.sku}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                    <input
                      type="number"
                      value={item.quantity}
                      onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 0)}
                      min="1"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Unit Price</label>
                    <input
                      type="number"
                      value={item.unit_price.toFixed(2)}
                      onChange={(e) => updateItem(index, 'unit_price', parseFloat(e.target.value) || 0)}
                      step="0.01"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Total</label>
                    <input
                      type="text"
                      value={`$${item.total_price.toFixed(2)}`}
                      readOnly
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                    />
                  </div>
                  <div className="flex items-end">
                    <button
                      type="button"
                      onClick={() => removeItem(index)}
                      className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Batch Number</label>
                    <input
                      type="text"
                      value={item.batch_number || ''}
                      onChange={(e) => updateItem(index, 'batch_number', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date</label>
                    <input
                      type="date"
                      value={item.expiry_date || ''}
                      onChange={(e) => updateItem(index, 'expiry_date', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {items.length > 0 && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="text-lg font-medium text-gray-900">Total Amount:</span>
                <span className="text-xl font-bold text-blue-600">${getTotalAmount().toFixed(2)}</span>
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end space-x-3 pt-4 border-t">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading || items.length === 0}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {loading ? 'Saving...' : order ? 'Update Order' : 'Create Order'}
          </button>
        </div>
      </form>
    </Modal>
  );
};