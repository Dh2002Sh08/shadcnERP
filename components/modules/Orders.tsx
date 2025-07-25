import React, { useEffect, useState } from 'react';
import { Search, Filter, Plus, Edit2, X, CheckCircle } from 'lucide-react';
import { dbService } from '../../lib/supabase';
import { Order, OrderItem } from '../../types';

export const Orders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [orderData, setOrderData] = useState<Partial<Omit<Order, 'id' | 'created_at'>>>({
    customerId: '',
    customerName: '',
    orderDate: new Date(),
    requiredDate: new Date(),
    status: 'pending',
    items: [],
    totalAmount: 0,
    paymentStatus: 'pending',
    priority: 'medium'
  });
  const [newItem, setNewItem] = useState<Partial<OrderItem>>({
    productId: '',
    productName: '',
    quantity: 0,
    unitPrice: 0,
    totalPrice: 0,
    batchNumber: '',
    expiryDate: new Date()
  });

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const data = await dbService.getOrders();
      setOrders(data);
    } catch (error) {
      console.error('Error fetching orders:', error);
      setFormError('Failed to fetch orders. Please try again.');
    }
  };

  const validateForm = () => {
    if (!orderData.customerId?.trim()) return 'Customer ID is required';
    if (!orderData.customerName?.trim()) return 'Customer name is required';
    if (!orderData.orderDate || isNaN(new Date(orderData.orderDate).getTime())) return 'Valid order date is required';
    if (!orderData.requiredDate || isNaN(new Date(orderData.requiredDate).getTime())) return 'Valid required date is required';
    if (!orderData.items || orderData.items.length === 0) return 'At least one item is required';
    if (orderData.totalAmount === undefined || orderData.totalAmount < 0) return 'Total amount must be non-negative';
    return null;
  };

  const handleAddItem = () => {
    if (!newItem.productId || !newItem.productName || !newItem.quantity || !newItem.unitPrice || !newItem.batchNumber || !newItem.expiryDate) {
      setFormError('All item fields are required');
      return;
    }
    const totalPrice = newItem.quantity! * newItem.unitPrice!;
    const updatedItems = [
      ...(orderData.items || []),
      {
        ...newItem,
        totalPrice,
        expiryDate: new Date(newItem.expiryDate!)
      } as OrderItem
    ];
    setOrderData({
      ...orderData,
      items: updatedItems,
      totalAmount: updatedItems.reduce((sum, item) => sum + item.totalPrice, 0)
    });
    setNewItem({
      productId: '',
      productName: '',
      quantity: 0,
      unitPrice: 0,
      totalPrice: 0,
      batchNumber: '',
      expiryDate: new Date()
    });
    setFormError(null);
  };

  const handleRemoveItem = (index: number) => {
    const updatedItems = (orderData.items || []).filter((_, i) => i !== index);
    setOrderData({
      ...orderData,
      items: updatedItems,
      totalAmount: updatedItems.reduce((sum, item) => sum + item.totalPrice, 0)
    });
  };

  const handleAddOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const validationError = validateForm();
    if (validationError) {
      setFormError(validationError);
      return;
    }

    try {
      const newOrder: Omit<Order, 'id' | 'created_at'> = {
        customerId: orderData.customerId!,
        customerName: orderData.customerName!,
        orderDate: new Date(orderData.orderDate!),
        requiredDate: new Date(orderData.requiredDate!),
        status: orderData.status!,
        items: orderData.items!.map(item => ({
          ...item,
          expiryDate: new Date(item.expiryDate)
        })),
        totalAmount: orderData.totalAmount!,
        paymentStatus: orderData.paymentStatus!,
        priority: orderData.priority!
      };

      console.log('New Order:', newOrder);
      await dbService.createOrder(newOrder);
      await fetchOrders(); // Refresh all orders to match inventory behavior
      resetForm();
    } catch (error: any) {
      console.error('Error adding order:', error);
      setFormError(error.message || 'Failed to add order. Please try again.');
    }
  };

  const handleEditOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!selectedOrderId) {
      setFormError('No order selected for editing');
      return;
    }

    const validationError = validateForm();
    if (validationError) {
      setFormError(validationError);
      return;
    }

    try {
      const updatedOrder: Partial<Omit<Order, 'id' | 'created_at'>> = {
        customerId: orderData.customerId!,
        customerName: orderData.customerName!,
        orderDate: new Date(orderData.orderDate!),
        requiredDate: new Date(orderData.requiredDate!),
        status: orderData.status!,
        items: orderData.items!.map(item => ({
          ...item,
          expiryDate: new Date(item.expiryDate)
        })),
        totalAmount: orderData.totalAmount!,
        paymentStatus: orderData.paymentStatus!,
        priority: orderData.priority!
      };

      console.log('Updated Order:', updatedOrder);
      await dbService.updateOrderStatus(selectedOrderId, updatedOrder);
      await fetchOrders(); // Refresh all orders to match inventory behavior
      resetForm();
    } catch (error: any) {
      console.error('Error updating order:', error);
      setFormError(error.message || 'Failed to update order. Please try again.');
    }
  };

  const resetForm = () => {
    setIsModalOpen(false);
    setIsEditing(false);
    setSelectedOrderId(null);
    setOrderData({
      customerId: '',
      customerName: '',
      orderDate: new Date(),
      requiredDate: new Date(),
      status: 'pending',
      items: [],
      totalAmount: 0,
      paymentStatus: 'pending',
      priority: 'medium'
    });
    setNewItem({
      productId: '',
      productName: '',
      quantity: 0,
      unitPrice: 0,
      totalPrice: 0,
      batchNumber: '',
      expiryDate: new Date()
    });
    setFormError(null);
  };

  const openEditModal = (order: Order) => {
    setIsEditing(true);
    setSelectedOrderId(order.id);
    setOrderData({
      customerId: order.customerId,
      customerName: order.customerName,
      orderDate: new Date(order.orderDate),
      requiredDate: new Date(order.requiredDate),
      status: order.status,
      items: order.items.map(item => ({
        ...item,
        expiryDate: new Date(item.expiryDate)
      })),
      totalAmount: order.totalAmount,
      paymentStatus: order.paymentStatus,
      priority: order.priority
    });
    setIsModalOpen(true);
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.customerName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'confirmed': return 'bg-blue-100 text-blue-800';
      case 'processing': return 'bg-purple-100 text-purple-800';
      case 'shipped': return 'bg-indigo-100 text-indigo-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">{isEditing ? 'Edit Order' : 'Add New Order'}</h2>
              <button onClick={resetForm} className="text-gray-500 hover:text-gray-700">
                <X className="h-6 w-6" />
              </button>
            </div>
            {formError && (
              <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm">
                {formError}
              </div>
            )}
            <form onSubmit={isEditing ? handleEditOrder : handleAddOrder} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Customer ID</label>
                <input
                  type="text"
                  value={orderData.customerId || ''}
                  onChange={(e) => setOrderData({ ...orderData, customerId: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-lg p-2"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Customer Name</label>
                <input
                  type="text"
                  value={orderData.customerName || ''}
                  onChange={(e) => setOrderData({ ...orderData, customerName: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-lg p-2"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Order Date</label>
                <input
                  type="date"
                  value={orderData.orderDate ? new Date(orderData.orderDate).toISOString().split('T')[0] : ''}
                  onChange={(e) => setOrderData({ ...orderData, orderDate: new Date(e.target.value) })}
                  className="mt-1 block w-full border border-gray-300 rounded-lg p-2"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Required Date</label>
                <input
                  type="date"
                  value={orderData.requiredDate ? new Date(orderData.requiredDate).toISOString().split('T')[0] : ''}
                  onChange={(e) => setOrderData({ ...orderData, requiredDate: new Date(e.target.value) })}
                  className="mt-1 block w-full border border-gray-300 rounded-lg p-2"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Status</label>
                <select
                  value={orderData.status || 'pending'}
                  onChange={(e) => setOrderData({ ...orderData, status: e.target.value as 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' })}
                  className="mt-1 block w-full border border-gray-300 rounded-lg p-2"
                >
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="processing">Processing</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Payment Status</label>
                <select
                  value={orderData.paymentStatus || 'pending'}
                  onChange={(e) => setOrderData({ ...orderData, paymentStatus: e.target.value as 'pending' | 'partial' | 'paid' })}
                  className="mt-1 block w-full border border-gray-300 rounded-lg p-2"
                >
                  <option value="pending">Pending</option>
                  <option value="partial">Partial</option>
                  <option value="paid">Paid</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Priority</label>
                <select
                  value={orderData.priority || 'medium'}
                  onChange={(e) => setOrderData({ ...orderData, priority: e.target.value as 'urgent' | 'high' | 'medium' | 'low' })}
                  className="mt-1 block w-full border border-gray-300 rounded-lg p-2"
                >
                  <option value="urgent">Urgent</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>
              <div className="border-t pt-4">
                <h3 className="text-lg font-medium mb-2">Order Items</h3>
                {(orderData.items || []).map((item, index) => (
                  <div key={index} className="flex items-center space-x-2 mb-2">
                    <span className="text-sm">{item.productName} (Qty: {item.quantity}, Total: ${item.totalPrice.toFixed(2)})</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(index)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
                <div className="space-y-2 border p-4 rounded-lg">
                  <h4 className="text-sm font-medium">Add New Item</h4>
                  <input
                    type="text"
                    placeholder="Product ID"
                    value={newItem.productId || ''}
                    onChange={(e) => setNewItem({ ...newItem, productId: e.target.value })}
                    className="block w-full border border-gray-300 rounded-lg p-2"
                  />
                  <input
                    type="text"
                    placeholder="Product Name"
                    value={newItem.productName || ''}
                    onChange={(e) => setNewItem({ ...newItem, productName: e.target.value })}
                    className="block w-full border border-gray-300 rounded-lg p-2"
                  />
                  <input
                    type="number"
                    placeholder="Quantity"
                    value={newItem.quantity || 0}
                    onChange={(e) => setNewItem({ ...newItem, quantity: parseInt(e.target.value) || 0 })}
                    className="block w-full border border-gray-300 rounded-lg p-2"
                  />
                  <input
                    type="number"
                    step="0.01"
                    placeholder="Unit Price"
                    value={newItem.unitPrice || 0}
                    onChange={(e) => setNewItem({ ...newItem, unitPrice: parseFloat(e.target.value) || 0 })}
                    className="block w-full border border-gray-300 rounded-lg p-2"
                  />
                  <input
                    type="text"
                    placeholder="Batch Number"
                    value={newItem.batchNumber || ''}
                    onChange={(e) => setNewItem({ ...newItem, batchNumber: e.target.value })}
                    className="block w-full border border-gray-300 rounded-lg p-2"
                  />
                  <input
                    type="date"
                    value={newItem.expiryDate ? new Date(newItem.expiryDate).toISOString().split('T')[0] : ''}
                    onChange={(e) => setNewItem({ ...newItem, expiryDate: new Date(e.target.value) })}
                    className="block w-full border border-gray-300 rounded-lg p-2"
                  />
                  <button
                    type="button"
                    onClick={handleAddItem}
                    className="mt-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    Add Item
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Total Amount</label>
                <input
                  type="number"
                  step="0.01"
                  value={orderData.totalAmount || 0}
                  readOnly
                  className="mt-1 block w-full border border-gray-300 rounded-lg p-2 bg-gray-100"
                />
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  {isEditing ? 'Update Order' : 'Add Order'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex flex-col sm:flex-row gap-4 flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search customers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          <span>New Order</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Orders</p>
              <p className="text-2xl font-bold text-gray-900">{orders.length}</p>
            </div>
            <div className="p-2 bg-blue-50 rounded-lg">
              <CheckCircle className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-yellow-600">
                {orders.filter(o => o.status === 'pending').length}
              </p>
            </div>
            <div className="p-2 bg-yellow-50 rounded-lg">
              <CheckCircle className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Processing</p>
              <p className="text-2xl font-bold text-purple-600">
                {orders.filter(o => o.status === 'processing').length}
              </p>
            </div>
            <div className="p-2 bg-purple-50 rounded-lg">
              <CheckCircle className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">This Month Revenue</p>
              <p className="text-2xl font-bold text-green-600">
                ${orders.reduce((sum, o) => sum + o.totalAmount, 0).toLocaleString()}
              </p>
            </div>
            <div className="p-2 bg-green-50 rounded-lg">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Order Management</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Required Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Items</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Priority</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created At</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredOrders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{order.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{order.customerId}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{order.customerName}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(order.orderDate).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(order.requiredDate).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {order.items.length} item(s): {order.items.map(item => item.productName).join(', ')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    ${order.totalAmount.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(order.status)}`}>
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(order.priority)}`}>
                      {order.priority.charAt(0).toUpperCase() + order.priority.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                      order.paymentStatus === 'paid' ? 'bg-green-100 text-green-800' :
                      order.paymentStatus === 'partial' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {order.created_at ? new Date(order.created_at).toLocaleDateString() : 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      className="text-blue-600 hover:text-blue-900"
                      onClick={() => openEditModal(order)}
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};