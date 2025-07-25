import React, { useEffect, useState } from 'react';
import { Search, Filter, Plus, Edit2, MapPin, Phone, Mail, X } from 'lucide-react';
import { dbService } from '../../lib/supabase';
import { Customer } from '../../types';

export const Customers: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [customerData, setCustomerData] = useState<Partial<Omit<Customer, 'id' | 'created_at'>>>({
    name: '',
    type: 'hospital',
    contactPerson: '',
    email: '',
    phone: '',
    address: '',
    licenseNumber: '',
    creditLimit: 0,
    outstandingBalance: 0,
    status: 'active'
  });

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const data = await dbService.getCustomers();
      console.log('Fetched Customers:', data);
      setCustomers(data);
    } catch (error: any) {
      console.error('Error fetching customers:', error);
      setFormError('Failed to fetch customers. Please try again.');
    }
  };

  const validateForm = () => {
    if (!customerData.name?.trim()) return 'Customer name is required';
    if (!customerData.contactPerson?.trim()) return 'Contact person is required';
    if (!customerData.email?.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerData.email)) return 'Valid email is required';
    if (!customerData.phone?.trim()) return 'Phone number is required';
    if (!customerData.address?.trim()) return 'Address is required';
    if (!customerData.licenseNumber?.trim()) return 'License number is required';
    if (customerData.creditLimit === undefined || customerData.creditLimit < 0) return 'Credit limit must be non-negative';
    if (customerData.outstandingBalance === undefined || customerData.outstandingBalance < 0) return 'Outstanding balance must be non-negative';
    return null;
  };

  const handleAddCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const validationError = validateForm();
    if (validationError) {
      setFormError(validationError);
      return;
    }

    try {
      const newCustomer: Omit<Customer, 'id' | 'created_at'> = {
        name: customerData.name!,
        type: customerData.type!,
        contactPerson: customerData.contactPerson!,
        email: customerData.email!,
        phone: customerData.phone!,
        address: customerData.address!,
        licenseNumber: customerData.licenseNumber!,
        creditLimit: customerData.creditLimit!,
        outstandingBalance: customerData.outstandingBalance!,
        status: customerData.status!
      };

      console.log('New Customer:', newCustomer);
      await dbService.createCustomer(newCustomer);
      await fetchCustomers(); // Refresh all customers to match Orders.tsx
      resetForm();
    } catch (error: any) {
      console.error('Error adding customer:', error);
      setFormError(error.message || 'Failed to add customer. Please try again.');
    }
  };

  const handleEditCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!selectedCustomerId) {
      setFormError('No customer selected for editing');
      return;
    }

    const validationError = validateForm();
    if (validationError) {
      setFormError(validationError);
      return;
    }

    try {
      const updatedCustomer: Partial<Omit<Customer, 'id' | 'created_at'>> = {
        name: customerData.name!,
        type: customerData.type!,
        contactPerson: customerData.contactPerson!,
        email: customerData.email!,
        phone: customerData.phone!,
        address: customerData.address!,
        licenseNumber: customerData.licenseNumber!,
        creditLimit: customerData.creditLimit!,
        outstandingBalance: customerData.outstandingBalance!,
        status: customerData.status!
      };

      console.log('Updated Customer:', updatedCustomer);
      await dbService.updateCustomer(selectedCustomerId, updatedCustomer);
      await fetchCustomers(); // Refresh all customers to match Orders.tsx
      resetForm();
    } catch (error: any) {
      console.error('Error updating customer:', error);
      setFormError(error.message || 'Failed to update customer. Please try again.');
    }
  };

  const resetForm = () => {
    setIsModalOpen(false);
    setIsEditing(false);
    setSelectedCustomerId(null);
    setCustomerData({
      name: '',
      type: 'hospital',
      contactPerson: '',
      email: '',
      phone: '',
      address: '',
      licenseNumber: '',
      creditLimit: 0,
      outstandingBalance: 0,
      status: 'active'
    });
    setFormError(null);
  };

  const openEditModal = (customer: Customer) => {
    setIsEditing(true);
    setSelectedCustomerId(customer.id);
    setCustomerData({
      name: customer.name,
      type: customer.type,
      contactPerson: customer.contactPerson,
      email: customer.email,
      phone: customer.phone,
      address: customer.address,
      licenseNumber: customer.licenseNumber,
      creditLimit: customer.creditLimit,
      outstandingBalance: customer.outstandingBalance,
      status: customer.status
    });
    setIsModalOpen(true);
  };

  const filteredCustomers = customers.filter(customer => {
    const matchesSearch = customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         customer.contactPerson.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         customer.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'all' || customer.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'hospital': return 'bg-blue-100 text-blue-800';
      case 'pharmacy': return 'bg-green-100 text-green-800';
      case 'clinic': return 'bg-purple-100 text-purple-800';
      case 'wholesaler': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      case 'suspended': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">{isEditing ? 'Edit Customer' : 'Add New Customer'}</h2>
              <button onClick={resetForm} className="text-gray-500 hover:text-gray-700">
                <X className="h-6 w-6" />
              </button>
            </div>
            {formError && (
              <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm">
                {formError}
              </div>
            )}
            <form onSubmit={isEditing ? handleEditCustomer : handleAddCustomer} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Customer Name</label>
                <input
                  type="text"
                  value={customerData.name || ''}
                  onChange={(e) => setCustomerData({ ...customerData, name: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-lg p-2"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Type</label>
                <select
                  value={customerData.type || 'hospital'}
                  onChange={(e) => setCustomerData({ ...customerData, type: e.target.value as 'hospital' | 'pharmacy' | 'clinic' | 'wholesaler' })}
                  className="mt-1 block w-full border border-gray-300 rounded-lg p-2"
                >
                  <option value="hospital">Hospital</option>
                  <option value="pharmacy">Pharmacy</option>
                  <option value="clinic">Clinic</option>
                  <option value="wholesaler">Wholesaler</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Contact Person</label>
                <input
                  type="text"
                  value={customerData.contactPerson || ''}
                  onChange={(e) => setCustomerData({ ...customerData, contactPerson: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-lg p-2"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <input
                  type="email"
                  value={customerData.email || ''}
                  onChange={(e) => setCustomerData({ ...customerData, email: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-lg p-2"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Phone</label>
                <input
                  type="text"
                  value={customerData.phone || ''}
                  onChange={(e) => setCustomerData({ ...customerData, phone: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-lg p-2"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Address</label>
                <textarea
                  value={customerData.address || ''}
                  onChange={(e) => setCustomerData({ ...customerData, address: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-lg p-2"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">License Number</label>
                <input
                  type="text"
                  value={customerData.licenseNumber || ''}
                  onChange={(e) => setCustomerData({ ...customerData, licenseNumber: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-lg p-2"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Credit Limit</label>
                <input
                  type="number"
                  step="0.01"
                  value={customerData.creditLimit || 0}
                  onChange={(e) => setCustomerData({ ...customerData, creditLimit: parseFloat(e.target.value) || 0 })}
                  className="mt-1 block w-full border border-gray-300 rounded-lg p-2"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Outstanding Balance</label>
                <input
                  type="number"
                  step="0.01"
                  value={customerData.outstandingBalance || 0}
                  onChange={(e) => setCustomerData({ ...customerData, outstandingBalance: parseFloat(e.target.value) || 0 })}
                  className="mt-1 block w-full border border-gray-300 rounded-lg p-2"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Status</label>
                <select
                  value={customerData.status || 'active'}
                  onChange={(e) => setCustomerData({ ...customerData, status: e.target.value as 'active' | 'inactive' | 'suspended' })}
                  className="mt-1 block w-full border border-gray-300 rounded-lg p-2"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="suspended">Suspended</option>
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
                  {isEditing ? 'Update Customer' : 'Add Customer'}
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
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
            >
              <option value="all">All Types</option>
              <option value="hospital">Hospital</option>
              <option value="pharmacy">Pharmacy</option>
              <option value="clinic">Clinic</option>
              <option value="wholesaler">Wholesaler</option>
            </select>
          </div>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          <span>Add Customer</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Customers</p>
              <p className="text-2xl font-bold text-gray-900">{customers.length}</p>
            </div>
            <div className="p-2 bg-blue-50 rounded-lg">
              <MapPin className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active Customers</p>
              <p className="text-2xl font-bold text-green-600">
                {customers.filter(c => c.status === 'active').length}
              </p>
            </div>
            <div className="p-2 bg-green-50 rounded-lg">
              <Phone className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Credit Limit</p>
              <p className="text-2xl font-bold text-purple-600">
                ${customers.reduce((sum, c) => sum + c.creditLimit, 0).toLocaleString()}
              </p>
            </div>
            <div className="p-2 bg-purple-50 rounded-lg">
              <Mail className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Outstanding Balance</p>
              <p className="text-2xl font-bold text-orange-600">
                ${customers.reduce((sum, c) => sum + c.outstandingBalance, 0).toLocaleString()}
              </p>
            </div>
            <div className="p-2 bg-orange-50 rounded-lg">
              <MapPin className="h-6 w-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Customer Directory</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact Person</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact Info</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">License</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Credit Limit</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Outstanding</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredCustomers.map((customer) => (
                <tr key={customer.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{customer.name}</div>
                      <div className="text-sm text-gray-500 flex items-center">
                        <MapPin className="h-3 w-3 mr-1" />
                        {customer.address.slice(0, 30)}...
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getTypeColor(customer.type)}`}>
                      {customer.type.charAt(0).toUpperCase() + customer.type.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {customer.contactPerson}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 flex items-center">
                      <Mail className="h-3 w-3 mr-1" />
                      {customer.email}
                    </div>
                    <div className="text-sm text-gray-500 flex items-center">
                      <Phone className="h-3 w-3 mr-1" />
                      {customer.phone}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {customer.licenseNumber}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    ${customer.creditLimit.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <span className={customer.outstandingBalance > 0 ? 'text-red-600' : 'text-green-600'}>
                      ${customer.outstandingBalance.toLocaleString()}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(customer.status)}`}>
                      {customer.status.charAt(0).toUpperCase() + customer.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      className="text-blue-600 hover:text-blue-900"
                      onClick={() => openEditModal(customer)}
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