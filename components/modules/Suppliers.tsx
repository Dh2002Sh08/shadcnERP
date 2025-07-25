import React, { useEffect, useState } from 'react';
import { Search, Filter, Plus, Edit2, Phone, Mail, MapPin, Star, X } from 'lucide-react';
import { dbService } from '../../lib/supabase';
import { Supplier } from '../../types';

export const Suppliers: React.FC = () => {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedSupplierId, setSelectedSupplierId] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [supplierData, setSupplierData] = useState<Partial<Omit<Supplier, 'id' | 'created_at'>>>({
    name: '',
    contactPerson: '',
    email: '',
    phone: '',
    address: '',
    licenseNumber: '',
    rating: 0,
    paymentTerms: '',
    status: 'active'
  });

  useEffect(() => {
    loadSuppliers();
  }, []);

  const loadSuppliers = async () => {
    try {
      const data = await dbService.getSuppliers();
      console.log('Fetched Suppliers:', data);
      setSuppliers(data || []);
    } catch (error: any) {
      console.error('Error loading suppliers:', error);
      setFormError('Failed to load suppliers. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    if (!supplierData.name?.trim()) return 'Supplier name is required';
    if (!supplierData.contactPerson?.trim()) return 'Contact person is required';
    if (!supplierData.email?.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(supplierData.email)) return 'Valid email is required';
    if (!supplierData.phone?.trim()) return 'Phone number is required';
    if (!supplierData.address?.trim()) return 'Address is required';
    if (!supplierData.licenseNumber?.trim()) return 'License number is required';
    if (supplierData.rating === undefined || supplierData.rating < 0 || supplierData.rating > 5) return 'Rating must be between 0 and 5';
    if (!supplierData.paymentTerms?.trim()) return 'Payment terms are required';
    return null;
  };

  const handleAddSupplier = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const validationError = validateForm();
    if (validationError) {
      setFormError(validationError);
      return;
    }

    try {
      const newSupplier: Omit<Supplier, 'id' | 'created_at'> = {
        name: supplierData.name!,
        contactPerson: supplierData.contactPerson!,
        email: supplierData.email!,
        phone: supplierData.phone!,
        address: supplierData.address!,
        licenseNumber: supplierData.licenseNumber!,
        rating: supplierData.rating!,
        paymentTerms: supplierData.paymentTerms!,
        status: supplierData.status!
      };

      console.log('New Supplier:', newSupplier);
      await dbService.createSupplier(newSupplier);
      await loadSuppliers(); // Refresh all suppliers
      resetForm();
    } catch (error: any) {
      console.error('Error adding supplier:', error);
      setFormError(error.message || 'Failed to add supplier. Please try again.');
    }
  };

  const handleEditSupplier = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!selectedSupplierId) {
      setFormError('No supplier selected for editing');
      return;
    }

    const validationError = validateForm();
    if (validationError) {
      setFormError(validationError);
      return;
    }

    try {
      const updatedSupplier: Partial<Omit<Supplier, 'id' | 'created_at'>> = {
        name: supplierData.name!,
        contactPerson: supplierData.contactPerson!,
        email: supplierData.email!,
        phone: supplierData.phone!,
        address: supplierData.address!,
        licenseNumber: supplierData.licenseNumber!,
        rating: supplierData.rating!,
        paymentTerms: supplierData.paymentTerms!,
        status: supplierData.status!
      };

      console.log('Updated Supplier:', updatedSupplier);
      await dbService.updateSupplier(selectedSupplierId, updatedSupplier);
      await loadSuppliers(); // Refresh all suppliers
      resetForm();
    } catch (error: any) {
      console.error('Error updating supplier:', error);
      setFormError(error.message || 'Failed to update supplier. Please try again.');
    }
  };

  const resetForm = () => {
    setIsModalOpen(false);
    setIsEditing(false);
    setSelectedSupplierId(null);
    setSupplierData({
      name: '',
      contactPerson: '',
      email: '',
      phone: '',
      address: '',
      licenseNumber: '',
      rating: 0,
      paymentTerms: '',
      status: 'active'
    });
    setFormError(null);
  };

  const openEditModal = (supplier: Supplier) => {
    setIsEditing(true);
    setSelectedSupplierId(supplier.id);
    setSupplierData({
      name: supplier.name,
      contactPerson: supplier.contactPerson,
      email: supplier.email,
      phone: supplier.phone,
      address: supplier.address,
      licenseNumber: supplier.licenseNumber,
      rating: supplier.rating,
      paymentTerms: supplier.paymentTerms,
      status: supplier.status
    });
    setIsModalOpen(true);
  };

  const filteredSuppliers = suppliers.filter(supplier => {
    const matchesSearch = supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         supplier.contactPerson.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         supplier.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || supplier.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
      />
    ));
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
              <h2 className="text-xl font-semibold">{isEditing ? 'Edit Supplier' : 'Add New Supplier'}</h2>
              <button onClick={resetForm} className="text-gray-500 hover:text-gray-700">
                <X className="h-6 w-6" />
              </button>
            </div>
            {formError && (
              <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm">
                {formError}
              </div>
            )}
            <form onSubmit={isEditing ? handleEditSupplier : handleAddSupplier} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Supplier Name</label>
                <input
                  type="text"
                  value={supplierData.name || ''}
                  onChange={(e) => setSupplierData({ ...supplierData, name: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-lg p-2"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Contact Person</label>
                <input
                  type="text"
                  value={supplierData.contactPerson || ''}
                  onChange={(e) => setSupplierData({ ...supplierData, contactPerson: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-lg p-2"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <input
                  type="email"
                  value={supplierData.email || ''}
                  onChange={(e) => setSupplierData({ ...supplierData, email: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-lg p-2"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Phone</label>
                <input
                  type="text"
                  value={supplierData.phone || ''}
                  onChange={(e) => setSupplierData({ ...supplierData, phone: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-lg p-2"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Address</label>
                <textarea
                  value={supplierData.address || ''}
                  onChange={(e) => setSupplierData({ ...supplierData, address: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-lg p-2"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">License Number</label>
                <input
                  type="text"
                  value={supplierData.licenseNumber || ''}
                  onChange={(e) => setSupplierData({ ...supplierData, licenseNumber: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-lg p-2"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Rating (0-5)</label>
                <input
                  type="number"
                  min="0"
                  max="5"
                  step="1"
                  value={supplierData.rating || 0}
                  onChange={(e) => setSupplierData({ ...supplierData, rating: parseInt(e.target.value) || 0 })}
                  className="mt-1 block w-full border border-gray-300 rounded-lg p-2"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Payment Terms</label>
                <input
                  type="text"
                  value={supplierData.paymentTerms || ''}
                  onChange={(e) => setSupplierData({ ...supplierData, paymentTerms: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-lg p-2"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Status</label>
                <select
                  value={supplierData.status || 'active'}
                  onChange={(e) => setSupplierData({ ...supplierData, status: e.target.value as 'active' | 'inactive' })}
                  className="mt-1 block w-full border border-gray-300 rounded-lg p-2"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
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
                  {isEditing ? 'Update Supplier' : 'Add Supplier'}
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
              placeholder="Search suppliers..."
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
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          <span>Add Supplier</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Suppliers</p>
              <p className="text-2xl font-bold text-gray-900">{suppliers.length}</p>
            </div>
            <div className="p-2 bg-blue-50 rounded-lg">
              <MapPin className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active Suppliers</p>
              <p className="text-2xl font-bold text-green-600">
                {suppliers.filter(s => s.status === 'active').length}
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
              <p className="text-sm text-gray-600">Average Rating</p>
              <p className="text-2xl font-bold text-yellow-600">
                {suppliers.length > 0 ? (suppliers.reduce((sum, s) => sum + s.rating, 0) / suppliers.length).toFixed(1) : '0.0'}
              </p>
            </div>
            <div className="p-2 bg-yellow-50 rounded-lg">
              <Star className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Top Rated (5★)</p>
              <p className="text-2xl font-bold text-purple-600">
                {suppliers.filter(s => s.rating === 5).length}
              </p>
            </div>
            <div className="p-2 bg-purple-50 rounded-lg">
              <Mail className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Supplier Directory</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Supplier</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact Person</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact Info</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">License</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rating</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment Terms</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredSuppliers.map((supplier) => (
                <tr key={supplier.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{supplier.name}</div>
                      <div className="text-sm text-gray-500 flex items-center">
                        <MapPin className="h-3 w-3 mr-1" />
                        {supplier.address.slice(0, 30)}...
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {supplier.contactPerson}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 flex items-center">
                      <Mail className="h-3 w-3 mr-1" />
                      {supplier.email}
                    </div>
                    <div className="text-sm text-gray-500 flex items-center">
                      <Phone className="h-3 w-3 mr-1" />
                      {supplier.phone}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {supplier.licenseNumber}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-1">
                      {renderStars(supplier.rating)}
                      <span className="text-sm text-gray-600 ml-2">{supplier.rating}.0</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {supplier.paymentTerms}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(supplier.status)}`}>
                      {supplier.status.charAt(0).toUpperCase() + supplier.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      className="text-blue-600 hover:text-blue-900"
                      onClick={() => openEditModal(supplier)}
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