import React from 'react';
import { MetricCard } from '../common/MetricCard';
import { 
  DollarSign, 
  ShoppingCart, 
  Clock, 
  Package, 
  AlertTriangle, 
  Users,
  TrendingUp,
  BarChart3
} from 'lucide-react';
import { mockDashboardMetrics, mockOrders, mockProducts } from '../../data/mockData';

export const Dashboard: React.FC = () => {
  const metrics = mockDashboardMetrics;
  const recentOrders = mockOrders.slice(0, 5);
  const lowStockProducts = mockProducts.filter(p => p.quantity <= p.reorderLevel);

  return (
    <div className="space-y-6">
      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Revenue"
          value={`$${(metrics.totalRevenue / 1000000).toFixed(1)}M`}
          change={metrics.revenueGrowth}
          changeLabel="vs last month"
          icon={DollarSign}
          color="green"
        />
        <MetricCard
          title="Total Orders"
          value={metrics.totalOrders.toLocaleString()}
          change={metrics.orderGrowth}
          changeLabel="vs last month"
          icon={ShoppingCart}
          color="blue"
        />
        <MetricCard
          title="Pending Orders"
          value={metrics.pendingOrders}
          icon={Clock}
          color="yellow"
        />
        <MetricCard
          title="Active Customers"
          value={metrics.activeCustomers}
          icon={Users}
          color="purple"
        />
      </div>

      {/* Alerts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <AlertTriangle className="h-5 w-5 text-yellow-500 mr-2" />
              Low Stock Alerts
            </h3>
            <span className="text-sm text-gray-500">{metrics.lowStockItems} items</span>
          </div>
          <div className="space-y-3">
            {lowStockProducts.slice(0, 4).map((product) => (
              <div key={product.id} className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-gray-900">{product.name}</p>
                  <p className="text-xs text-gray-600">SKU: {product.sku}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-yellow-700">{product.quantity} units</p>
                  <p className="text-xs text-gray-500">Reorder: {product.reorderLevel}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <Package className="h-5 w-5 text-red-500 mr-2" />
              Expiring Soon
            </h3>
            <span className="text-sm text-gray-500">{metrics.expiringItems} items</span>
          </div>
          <div className="space-y-3">
            {mockProducts.filter(p => {
              const daysUntilExpiry = Math.floor((p.expiryDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
              return daysUntilExpiry <= 90 && daysUntilExpiry > 0;
            }).slice(0, 4).map((product) => {
              const daysUntilExpiry = Math.floor((product.expiryDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
              return (
                <div key={product.id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{product.name}</p>
                    <p className="text-xs text-gray-600">Batch: {product.batchNumber}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-red-700">{daysUntilExpiry} days</p>
                    <p className="text-xs text-gray-500">{product.expiryDate.toLocaleDateString()}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <BarChart3 className="h-5 w-5 text-blue-500 mr-2" />
            Recent Orders
          </h3>
          <button className="text-sm text-blue-600 hover:text-blue-800 font-medium">
            View All Orders
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-medium text-gray-700">Order ID</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Customer</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Date</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Amount</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Status</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Priority</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map((order) => (
                <tr key={order.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4 text-sm font-medium text-blue-600">{order.id}</td>
                  <td className="py-3 px-4 text-sm text-gray-900">{order.customerName}</td>
                  <td className="py-3 px-4 text-sm text-gray-600">{order.orderDate.toLocaleDateString()}</td>
                  <td className="py-3 px-4 text-sm font-medium text-gray-900">${order.totalAmount}</td>
                  <td className="py-3 px-4">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                      order.status === 'shipped' ? 'bg-blue-100 text-blue-800' :
                      order.status === 'processing' ? 'bg-yellow-100 text-yellow-800' :
                      order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                      order.priority === 'urgent' ? 'bg-red-100 text-red-800' :
                      order.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                      order.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {order.priority.charAt(0).toUpperCase() + order.priority.slice(1)}
                    </span>
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