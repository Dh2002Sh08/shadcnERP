import React, { useEffect, useState } from 'react';
import { Search, Filter, Plus, Edit2, AlertCircle, Calendar, X } from 'lucide-react';
import { dbService } from '../../lib/supabase';
import { Product } from '../../types';

export const Inventory: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [productData, setProductData] = useState<Partial<Product>>({
    name: '',
    sku: '',
    manufacturer: '',
    batchNumber: '',
    quantity: 0,
    unitPrice: 0,
    expiryDate: new Date(),
    reorderLevel: 0,
    status: 'active',
    genericName: '',
    category: '',
    regulatoryInfo: {
      licenseNumber: '',
      drugCode: '',
      schedule: ''
    }
  });
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const data = await dbService.getProducts();
      setProducts(data);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const validateForm = () => {
    if (!productData.name?.trim()) return 'Product name is required';
    if (!productData.sku?.trim()) return 'SKU is required';
    if (productData.quantity === undefined || productData.quantity < 0) return 'Quantity must be a non-negative number';
    if (productData.unitPrice === undefined || productData.unitPrice < 0) return 'Unit price must be a non-negative number';
    if (!productData.expiryDate || isNaN(new Date(productData.expiryDate).getTime())) return 'Valid expiry date is required';
    return null;
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const validationError = validateForm();
    if (validationError) {
      setFormError(validationError);
      return;
    }

    try {
      const newProduct: Omit<Product, 'id'> = {
        ...productData,
        expiryDate: new Date(productData.expiryDate!),
        regulatoryInfo: {
          licenseNumber: productData.regulatoryInfo?.licenseNumber || '',
          drugCode: productData.regulatoryInfo?.drugCode || '',
          schedule: productData.regulatoryInfo?.schedule || ''
        }
      } as Omit<Product, 'id'>;

      const created = await dbService.createProduct(newProduct);
      setProducts(prev => [created, ...prev]);
      resetForm();
    } catch (error: any) {
      console.error('Error adding product:', error);
      setFormError(error.message || 'Failed to add product. Please try again.');
    }
  };

  const handleEditProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!selectedProductId) {
      setFormError('No product selected for editing');
      return;
    }

    const validationError = validateForm();
    if (validationError) {
      setFormError(validationError);
      return;
    }

    try {
      const updatedProduct: Partial<Product> = {
        ...productData,
        expiryDate: new Date(productData.expiryDate!),
        regulatoryInfo: {
          licenseNumber: productData.regulatoryInfo?.licenseNumber || '',
          drugCode: productData.regulatoryInfo?.drugCode || '',
          schedule: productData.regulatoryInfo?.schedule || ''
        }
      };

      const updated = await dbService.updateProduct(selectedProductId, updatedProduct);
      setProducts(prev => prev.map(p => (p.id === selectedProductId ? updated : p)));
      resetForm();
    } catch (error: any) {
      console.error('Error updating product:', error);
      setFormError(error.message || 'Failed to update product. Please try again.');
    }
  };

  const resetForm = () => {
    setIsModalOpen(false);
    setIsEditing(false);
    setSelectedProductId(null);
    setProductData({
      name: '',
      sku: '',
      manufacturer: '',
      batchNumber: '',
      quantity: 0,
      unitPrice: 0,
      expiryDate: new Date(),
      reorderLevel: 0,
      status: 'active',
      genericName: '',
      category: '',
      regulatoryInfo: {
        licenseNumber: '',
        drugCode: '',
        schedule: ''
      }
    });
    setFormError(null);
  };

  const openEditModal = (product: Product) => {
    setIsEditing(true);
    setSelectedProductId(product.id);
    setProductData({
      ...product,
      expiryDate: new Date(product.expiryDate),
      regulatoryInfo: {
        licenseNumber: product.regulatoryInfo?.licenseNumber || '',
        drugCode: product.regulatoryInfo?.drugCode || '',
        schedule: product.regulatoryInfo?.schedule || ''
      }
    });
    setIsModalOpen(true);
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.manufacturer.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || product.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStockStatus = (product: Product) => {
    if (product.quantity <= 0) return { status: 'Out of Stock', color: 'text-red-600 bg-red-100' };
    if (product.quantity <= product.reorderLevel) return { status: 'Low Stock', color: 'text-yellow-600 bg-yellow-100' };
    return { status: 'In Stock', color: 'text-green-600 bg-green-100' };
  };

  const getExpiryStatus = (expiryDate: Date) => {
    const daysUntilExpiry = Math.floor((new Date(expiryDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    if (daysUntilExpiry <= 30) return { status: 'Expires Soon', color: 'text-red-600' };
    if (daysUntilExpiry <= 90) return { status: 'Monitor', color: 'text-yellow-600' };
    return { status: 'Good', color: 'text-green-600' };
  };

  return (
    <div className="space-y-6">
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">{isEditing ? 'Edit Product' : 'Add New Product'}</h2>
              <button onClick={resetForm} className="text-gray-500 hover:text-gray-700">
                <X className="h-6 w-6" />
              </button>
            </div>
            {formError && (
              <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm">
                {formError}
              </div>
            )}
            <form onSubmit={isEditing ? handleEditProduct : handleAddProduct} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Product Name</label>
                <input
                  type="text"
                  value={productData.name}
                  onChange={(e) => setProductData({ ...productData, name: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-lg p-2"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">SKU</label>
                <input
                  type="text"
                  value={productData.sku}
                  onChange={(e) => setProductData({ ...productData, sku: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-lg p-2"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Manufacturer</label>
                <input
                  type="text"
                  value={productData.manufacturer}
                  onChange={(e) => setProductData({ ...productData, manufacturer: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-lg p-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Batch Number</label>
                <input
                  type="text"
                  value={productData.batchNumber}
                  onChange={(e) => setProductData({ ...productData, batchNumber: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-lg p-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Quantity</label>
                <input
                  type="number"
                  value={productData.quantity}
                  onChange={(e) => setProductData({ ...productData, quantity: parseInt(e.target.value) || 0 })}
                  className="mt-1 block w-full border border-gray-300 rounded-lg p-2"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Unit Price</label>
                <input
                  type="number"
                  step="0.01"
                  value={productData.unitPrice}
                  onChange={(e) => setProductData({ ...productData, unitPrice: parseFloat(e.target.value) || 0 })}
                  className="mt-1 block w-full border border-gray-300 rounded-lg p-2"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Expiry Date</label>
                <input
                  type="date"
                  value={productData.expiryDate ? new Date(productData.expiryDate).toISOString().split('T')[0] : ''}
                  onChange={(e) => setProductData({ ...productData, expiryDate: new Date(e.target.value) })}
                  className="mt-1 block w-full border border-gray-300 rounded-lg p-2"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Reorder Level</label>
                <input
                  type="number"
                  value={productData.reorderLevel}
                  onChange={(e) => setProductData({ ...productData, reorderLevel: parseInt(e.target.value) || 0 })}
                  className="mt-1 block w-full border border-gray-300 rounded-lg p-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Status</label>
                <select
                  value={productData.status ?? ''}
                  onChange={(e) =>
                    setProductData({
                      ...productData,
                      status: e.target.value as "active" | "discontinued" | "recalled" | undefined,
                    })
                  }
                  className="mt-1 block w-full border border-gray-300 rounded-lg p-2"
                >
                  <option value="">Select status</option>
                  <option value="active">Active</option>
                  <option value="discontinued">Discontinued</option>
                  <option value="recalled">Recalled</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Generic Name</label>
                <input
                  type="text"
                  value={productData.genericName}
                  onChange={(e) => setProductData({ ...productData, genericName: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-lg p-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Category</label>
                <input
                  type="text"
                  value={productData.category}
                  onChange={(e) => setProductData({ ...productData, category: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-lg p-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">License Number</label>
                <input
                  type="text"
                  value={productData.regulatoryInfo?.licenseNumber}
                  onChange={(e) => setProductData({
                    ...productData,
                    regulatoryInfo: {
                      ...productData.regulatoryInfo,
                      licenseNumber: e.target.value,
                      drugCode: productData.regulatoryInfo?.drugCode ?? '',
                      schedule: productData.regulatoryInfo?.schedule ?? ''
                    }
                  })}
                  className="mt-1 block w-full border border-gray-300 rounded-lg p-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Drug Code</label>
                <input
                  type="text"
                  value={productData.regulatoryInfo?.drugCode}
                  onChange={(e) => setProductData({
                    ...productData,
                    regulatoryInfo: {
                      ...productData.regulatoryInfo,
                      drugCode: e.target.value,
                      licenseNumber: productData.regulatoryInfo?.licenseNumber ?? '',
                      schedule: productData.regulatoryInfo?.schedule ?? ''
                    }
                  })}
                  className="mt-1 block w-full border border-gray-300 rounded-lg p-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Schedule</label>
                <input
                  type="text"
                  value={productData.regulatoryInfo?.schedule}
                  onChange={(e) => setProductData({
                    ...productData,
                    regulatoryInfo: {
                      ...productData.regulatoryInfo,
                      schedule: e.target.value,
                      licenseNumber: productData.regulatoryInfo?.licenseNumber ?? '',
                      drugCode: productData.regulatoryInfo?.drugCode ?? ''
                    }
                  })}
                  className="mt-1 block w-full border border-gray-300 rounded-lg p-2"
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
                  {isEditing ? 'Update Product' : 'Add Product'}
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
              placeholder="Search products, SKU, or manufacturer..."
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
              <option value="discontinued">Discontinued</option>
              <option value="recalled">Recalled</option>
            </select>
          </div>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          <span>Add Product</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Products</p>
              <p className="text-2xl font-bold text-gray-900">{products.length}</p>
            </div>
            <div className="p-2 bg-blue-50 rounded-lg">
              <Calendar className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Low Stock Items</p>
              <p className="text-2xl font-bold text-yellow-600">
                {products.filter(p => p.quantity <= p.reorderLevel && p.quantity > 0).length}
              </p>
            </div>
            <div className="p-2 bg-yellow-50 rounded-lg">
              <AlertCircle className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Out of Stock</p>
              <p className="text-2xl font-bold text-red-600">
                {products.filter(p => p.quantity <= 0).length}
              </p>
            </div>
            <div className="p-2 bg-red-50 rounded-lg">
              <AlertCircle className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Value</p>
              <p className="text-2xl font-bold text-green-600">
                ${products.reduce((sum, p) => sum + (p.quantity * p.unitPrice), 0).toLocaleString()}
              </p>
            </div>
            <div className="p-2 bg-green-50 rounded-lg">
              <Calendar className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Product Inventory</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SKU</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Batch</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Unit Price</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Expiry</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredProducts.map((product) => {
                const stockStatus = getStockStatus(product);
                const expiryStatus = getExpiryStatus(product.expiryDate);
                
                return (
                  <tr key={product.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{product.name}</div>
                        <div className="text-sm text-gray-500">{product.manufacturer}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {product.sku}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {product.batchNumber}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{product.quantity}</div>
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${stockStatus.color}`}>
                        {stockStatus.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ${product.unitPrice.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{new Date(product.expiryDate).toLocaleDateString()}</div>
                      <div className={`text-xs font-medium ${expiryStatus.color}`}>
                        {expiryStatus.status}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                        product.status === 'active' ? 'bg-green-100 text-green-800' :
                        product.status === 'discontinued' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {product.status.charAt(0).toUpperCase() + product.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        className="text-blue-600 hover:text-blue-900 mr-3"
                        onClick={() => openEditModal(product)}
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};