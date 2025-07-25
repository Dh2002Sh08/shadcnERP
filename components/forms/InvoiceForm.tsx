import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { dbService } from '../../lib/supabase';
import { Invoice, Order, InvoiceItem, OrderItem } from '@/types';

interface InvoiceFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  invoice?: Invoice;
}

interface FormData {
  orderId: string;
  customerId: string;
  customerName: string;
  invoiceDate: string;
  dueDate: string;
  subtotal: number;
  taxAmount: number;
  totalAmount: number;
  paidAmount: number;
  status: Invoice['status'];
  paymentTerms: string;
  notes: string;
}

export const InvoiceForm: React.FC<InvoiceFormProps> = ({
  isOpen,
  onClose,
  onSuccess,
  invoice,
}) => {
  const [loading, setLoading] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [formData, setFormData] = useState<FormData>({
    orderId: invoice?.order_id || '',
    customerId: invoice?.customer_id || '',
    customerName: invoice?.customer_name || '',
    invoiceDate: typeof invoice?.invoice_date === 'string'
      ? invoice.invoice_date
      : (invoice?.invoice_date instanceof Date
          ? invoice.invoice_date.toISOString().split('T')[0]
          : new Date().toISOString().split('T')[0]),
    dueDate: typeof invoice?.due_date === 'string'
      ? invoice.due_date
      : (invoice?.due_date instanceof Date
          ? invoice.due_date.toISOString().split('T')[0]
          : ''),
    subtotal: invoice?.subtotal || 0,
    taxAmount: invoice?.tax_amount || 0,
    totalAmount: invoice?.total_amount || 0,
    paidAmount: typeof invoice?.paid_amount === 'number'
      ? invoice.paid_amount
      : (typeof invoice?.paid_amount === 'string'
          ? parseFloat(invoice.paid_amount) || 0
          : 0),
    status: invoice?.status || 'draft',
    paymentTerms: typeof invoice?.payment_terms === 'string' ? invoice.payment_terms : 'Net 30',
    notes: typeof invoice?.notes === 'string'
      ? invoice.notes
      : (typeof invoice?.notes === 'object' && invoice?.notes !== null && 'toString' in invoice.notes
          ? String(invoice.notes)
          : ''),
  });
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (isOpen) {
      loadOrders();
    }
  }, [isOpen]);

  useEffect(() => {
    if (formData.orderId) {
      const order = orders.find((o) => o.id === formData.orderId);
      setSelectedOrder(order || null);
      if (order) {
        const subtotal = order.total_amount || 0;
        const taxAmount = subtotal * 0.1; // 10% tax
        const totalAmount = subtotal + taxAmount;

        setFormData((prev) => ({
          ...prev,
          customerId: order.customer_id,
          customerName: order.customer_name,
          subtotal,
          taxAmount,
          totalAmount,
        }));
      }
    } else {
      setSelectedOrder(null);
    }
  }, [formData.orderId, orders]);

  const loadOrders = async () => {
    try {
      const data = await dbService.getOrders();
      setOrders(data || []);
    } catch (error: unknown) {
      console.error('Error loading orders:', error instanceof Error ? error.message : error);
      setErrorMessage('Failed to load orders.');
    }
  };

  const calculateDueDate = (invoiceDate: string, paymentTerms: string): string => {
    const date = new Date(invoiceDate);
    const days = parseInt(paymentTerms.replace(/^Net\s*/, '')) || 30;
    date.setDate(date.getDate() + days);
    return date.toISOString().split('T')[0];
  };

  const validateForm = (): string => {
    if (!formData.orderId) return 'Please select an order.';
    if (!formData.invoiceDate) return 'Please select an invoice date.';
    if (!formData.dueDate) return 'Please select a due date.';
    if (formData.subtotal <= 0) return 'Subtotal must be greater than 0.';
    if (formData.totalAmount <= 0) return 'Total amount must be greater than 0.';
    if (formData.paidAmount < 0) return 'Paid amount cannot be negative.';
    return '';
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;

    setFormData((prev) => {
      const updatedData: Partial<FormData> = {
        [name]:
          name === 'subtotal' ||
          name === 'taxAmount' ||
          name === 'totalAmount' ||
          name === 'paidAmount'
            ? parseFloat(value) || 0
            : value,
      };

      if (name === 'invoiceDate' || name === 'paymentTerms') {
        const invoiceDate = name === 'invoiceDate' ? value : prev.invoiceDate;
        const paymentTerms = name === 'paymentTerms' ? value : prev.paymentTerms;
        updatedData.dueDate = calculateDueDate(invoiceDate, paymentTerms);
      }

      return { ...prev, ...updatedData };
    });
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
      const invoiceItems: InvoiceItem[] =
        selectedOrder?.order_items?.map((item: OrderItem) => ({
          product_id: item.product_id,
          product_name: item.products?.name || item.product_name || 'Unknown Product',
          quantity: item.quantity,
          unit_price: item.unit_price,
          total_price: item.total_price,
        })) || [];

      console.log('Submitting invoice:', { formData, invoiceItems });

      if (invoice?.id) {
        await dbService.updateInvoiceStatus(invoice.id, formData.status, formData.paidAmount);
      } else {
        // Map formData to the required fields for createInvoice
        const invoiceData = {
          customer_id: formData.customerId,
          customer_name: formData.customerName,
          order_id: formData.orderId,
          invoice_date: new Date(formData.invoiceDate), // Convert to Date
          due_date: new Date(formData.dueDate), // Convert to Date
          payment_terms: formData.paymentTerms,
          status: formData.status,
          subtotal: formData.subtotal,
          tax_amount: formData.taxAmount,
          total_amount: formData.totalAmount,
          amount: formData.totalAmount,
          paid_amount: formData.paidAmount,
          notes: formData.notes,
        };

        // Fix: Ensure payment_terms is a number, not a string
        const invoiceDataFixed = {
          ...invoiceData,
          payment_terms: Number(invoiceData.payment_terms),
        };

        await dbService.createInvoice(invoiceDataFixed, invoiceItems);
      }

      onSuccess();
      onClose();
    } catch (error: unknown) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      console.error('Error saving invoice:', {
        message: errorMsg,
        error,
      });
      setErrorMessage(`Error saving invoice: ${errorMsg}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={invoice ? 'Edit Invoice' : 'Create New Invoice'}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {errorMessage && (
          <div className="p-4 bg-red-100 text-red-700 rounded-lg">{errorMessage}</div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Order *</label>
            <select
              name="orderId"
              value={formData.orderId}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select Order</option>
              {orders.map((order) => (
                <option key={order.id} value={order.id}>
                  {order.id} - {order.customer_name} (${order.total_amount.toFixed(2)})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Customer</label>
            <input
              type="text"
              value={formData.customerName}
              readOnly
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Invoice Date *</label>
            <input
              type="date"
              name="invoiceDate"
              value={formData.invoiceDate}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
            <input
              type="date"
              name="dueDate"
              value={formData.dueDate}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Payment Terms</label>
            <select
              name="paymentTerms"
              value={formData.paymentTerms}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="Net 15">Net 15</option>
              <option value="Net 30">Net 30</option>
              <option value="Net 45">Net 45</option>
              <option value="Net 60">Net 60</option>
              <option value="COD">Cash on Delivery</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="draft">Draft</option>
              <option value="sent">Sent</option>
              <option value="paid">Paid</option>
              <option value="overdue">Overdue</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        {/* Financial Details */}
        <div className="border-t pt-4">
          <h4 className="text-md font-medium text-gray-900 mb-3">Financial Details</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Subtotal</label>
              <input
                type="number"
                name="subtotal"
                value={formData.subtotal.toFixed(2)}
                onChange={handleChange}
                step="0.01"
                readOnly={!!formData.orderId}
                className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  formData.orderId ? 'bg-gray-50' : ''
                }`}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tax Amount</label>
              <input
                type="number"
                name="taxAmount"
                value={formData.taxAmount.toFixed(2)}
                onChange={handleChange}
                step="0.01"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Total Amount</label>
              <input
                type="number"
                name="totalAmount"
                value={formData.totalAmount.toFixed(2)}
                onChange={handleChange}
                step="0.01"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Paid Amount</label>
              <input
                type="number"
                name="paidAmount"
                value={formData.paidAmount.toFixed(2)}
                onChange={handleChange}
                step="0.01"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Order Items Preview */}
        {selectedOrder?.order_items && selectedOrder.order_items.length > 0 && (
          <div className="border-t pt-4">
            <h4 className="text-md font-medium text-gray-900 mb-3">Order Items</h4>
            <div className="space-y-2">
              {selectedOrder.order_items.map((item: OrderItem, index: number) => (
                <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                  <span className="text-sm">{item.products?.name || item.product_name || 'Unknown Product'}</span>
                  <span className="text-sm">
                    Qty: {item.quantity} × ${item.unit_price.toFixed(2)} = ${item.total_price.toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

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
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {loading ? 'Saving...' : invoice ? 'Update Invoice' : 'Create Invoice'}
          </button>
        </div>
      </form>
    </Modal>
  );
};