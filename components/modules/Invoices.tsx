import React, { useEffect, useState } from 'react';
import { Search, Filter, Plus, Eye, Download, DollarSign, Calendar, AlertCircle, X } from 'lucide-react';
import { dbService } from '../../lib/supabase';
import { Customer, Invoice, Order } from '../../types';

export const Invoices: React.FC = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [invoiceData, setInvoiceData] = useState<Partial<Omit<Invoice, 'id' | 'created_at' | 'customerName'>>>({
    customerId: '',
    orderId: '',
    invoiceDate: new Date(),
    dueDate: new Date(),
    amount: 0,
    paidAmount: 0,
    status: 'draft'
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [invoiceData, customerData, orderData] = await Promise.all([
        dbService.getInvoices(),
        dbService.getCustomers(),
        dbService.getOrders() // Assumes getOrders exists in supabase.ts
      ]);
      console.log('Fetched Invoices:', invoiceData);
      setInvoices(invoiceData || []);
      setCustomers(customerData || []);
      setOrders(orderData || []);
    } catch (error: any) {
      console.error('Error loading data:', error);
      setFormError('Failed to load data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    if (!invoiceData.customerId) return 'Customer is required';
    if (!invoiceData.orderId) return 'Order is required';
    if (!invoiceData.invoiceDate) return 'Invoice date is required';
    if (!invoiceData.dueDate) return 'Due date is required';
    if (invoiceData.amount === undefined || invoiceData.amount < 0) return 'Amount must be non-negative';
    if (invoiceData.paidAmount === undefined || invoiceData.paidAmount < 0) return 'Paid amount must be non-negative';
    if (invoiceData.paidAmount > invoiceData.amount) return 'Paid amount cannot exceed total amount';
    return null;
  };

  const handleCreateInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const validationError = validateForm();
    if (validationError) {
      setFormError(validationError);
      return;
    }

    try {
      const newInvoice: Omit<Invoice, 'id' | 'created_at' | 'customerName'> = {
        customerId: invoiceData.customerId!,
        orderId: invoiceData.orderId!,
        invoiceDate: new Date(invoiceData.invoiceDate!),
        dueDate: new Date(invoiceData.dueDate!),
        amount: invoiceData.amount!,
        paidAmount: invoiceData.paidAmount!,
        status: invoiceData.status!
      };

      console.log('New Invoice:', newInvoice);
      await dbService.createInvoice(newInvoice);
      await loadData(); // Refresh all data
      resetForm();
    } catch (error: any) {
      console.error('Error creating invoice:', error);
      setFormError(error.message || 'Failed to create invoice. Please try again.');
    }
  };

  const handleUpdateStatus = async (id: string, status: Invoice['status']) => {
    try {
      await dbService.updateInvoiceStatus(id, status);
      await loadData(); // Refresh all data
    } catch (error: any) {
      console.error('Error updating invoice status:', error);
      setFormError('Failed to update status. Please try again.');
    }
  };

  const resetForm = () => {
    setIsModalOpen(false);
    setInvoiceData({
      customerId: '',
      orderId: '',
      invoiceDate: new Date(),
      dueDate: new Date(),
      amount: 0,
      paidAmount: 0,
      status: 'draft'
    });
    setFormError(null);
  };

  const filteredInvoices = invoices.filter(invoice => {
    const matchesSearch = invoice.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         invoice.customerName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || invoice.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'sent': return 'bg-blue-100 text-blue-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTotalRevenue = () => {
    return invoices.reduce((sum, invoice) => sum + invoice.amount, 0);
  };

  const getPaidAmount = () => {
    return invoices.reduce((sum, invoice) => sum + invoice.paidAmount, 0);
  };

  const getOverdueAmount = () => {
    return invoices
      .filter(invoice => invoice.status === 'overdue')
      .reduce((sum, invoice) => sum + (invoice.amount - invoice.paidAmount), 0);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Create Invoice</h2>
              <button onClick={resetForm} className="text-gray-500 hover:text-gray-700">
                <X className="h-6 w-6" />
              </button>
            </div>
            {formError && (
              <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm">
                {formError}
              </div>
            )}
            <form onSubmit={handleCreateInvoice} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Customer</label>
                <select
                  value={invoiceData.customerId || ''}
                  onChange={(e) => setInvoiceData({ ...invoiceData, customerId: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-lg p-2"
                  required
                >
                  <option value="">Select Customer</option>
                  {customers.map(customer => (
                    <option key={customer.id} value={customer.id}>{customer.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Order</label>
                <select
                  value={invoiceData.orderId || ''}
                  onChange={(e) => setInvoiceData({ ...invoiceData, orderId: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-lg p-2"
                  required
                >
                  <option value="">Select Order</option>
                  {orders.map(order => (
                    <option key={order.id} value={order.id}>{order.id}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Invoice Date</label>
                <input
                  type="date"
                  value={invoiceData.invoiceDate ? new Date(invoiceData.invoiceDate).toISOString().split('T')[0] : ''}
                  onChange={(e) => setInvoiceData({ ...invoiceData, invoiceDate: new Date(e.target.value) })}
                  className="mt-1 block w-full border border-gray-300 rounded-lg p-2"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Due Date</label>
                <input
                  type="date"
                  value={invoiceData.dueDate ? new Date(invoiceData.dueDate).toISOString().split('T')[0] : ''}
                  onChange={(e) => setInvoiceData({ ...invoiceData, dueDate: new Date(e.target.value) })}
                  className="mt-1 block w-full border border-gray-300 rounded-lg p-2"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Amount</label>
                <input
                  type="number"
                  step="0.01"
                  value={invoiceData.amount || 0}
                  onChange={(e) => setInvoiceData({ ...invoiceData, amount: parseFloat(e.target.value) || 0 })}
                  className="mt-1 block w-full border border-gray-300 rounded-lg p-2"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Paid Amount</label>
                <input
                  type="number"
                  step="0.01"
                  value={invoiceData.paidAmount || 0}
                  onChange={(e) => setInvoiceData({ ...invoiceData, paidAmount: parseFloat(e.target.value) || 0 })}
                  className="mt-1 block w-full border border-gray-300 rounded-lg p-2"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Status</label>
                <select
                  value={invoiceData.status || 'draft'}
                  onChange={(e) => setInvoiceData({ ...invoiceData, status: e.target.value as Invoice['status'] })}
                  className="mt-1 block w-full border border-gray-300 rounded-lg p-2"
                >
                  <option value="draft">Draft</option>
                  <option value="sent">Sent</option>
                  <option value="paid">Paid</option>
                  <option value="overdue">Overdue</option>
                  <option value="cancelled">Cancelled</option>
                </select>
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
                  Create Invoice
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
              placeholder="Search invoices or customers..."
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
              <option value="draft">Draft</option>
              <option value="sent">Sent</option>
              <option value="paid">Paid</option>
              <option value="overdue">Overdue</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          <span>Create Invoice</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900">${getTotalRevenue().toLocaleString()}</p>
            </div>
            <div className="p-2 bg-green-50 rounded-lg">
              <DollarSign className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Paid Amount</p>
              <p className="text-2xl font-bold text-green-600">${getPaidAmount().toLocaleString()}</p>
            </div>
            <div className="p-2 bg-blue-50 rounded-lg">
              <Calendar className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Overdue Amount</p>
              <p className="text-2xl font-bold text-red-600">${getOverdueAmount().toLocaleString()}</p>
            </div>
            <div className="p-2 bg-red-50 rounded-lg">
              <AlertCircle className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Invoices</p>
              <p className="text-2xl font-bold text-purple-600">{invoices.length}</p>
            </div>
            <div className="p-2 bg-purple-50 rounded-lg">
              <Calendar className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Invoice Management</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Invoice ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Invoice Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Due Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Paid Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredInvoices.map((invoice) => (
                <tr key={invoice.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-blue-600">{invoice.id}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{invoice.customerName}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {invoice.orderId}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(invoice.invoiceDate).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(invoice.dueDate).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    ${invoice.amount.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <span className={invoice.paidAmount === invoice.amount ? 'text-green-600' : 'text-yellow-600'}>
                      ${invoice.paidAmount.toLocaleString()}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <select
                      value={invoice.status}
                      onChange={(e) => handleUpdateStatus(invoice.id, e.target.value as Invoice['status'])}
                      className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(invoice.status)}`}
                    >
                      <option value="draft">Draft</option>
                      <option value="sent">Sent</option>
                      <option value="paid">Paid</option>
                      <option value="overdue">Overdue</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button className="text-blue-600 hover:text-blue-900">
                        <Eye className="h-4 w-4" />
                      </button>
                      <button className="text-green-600 hover:text-green-900">
                        <Download className="h-4 w-4" />
                      </button>
                    </div>
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