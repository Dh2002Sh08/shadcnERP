// import React, { useState, useEffect } from 'react';
// import { BarChart3, TrendingUp, DollarSign, Package, Users, Calendar, Download, Filter } from 'lucide-react';
// // import { dbService } from '../../lib/supabase';

// export const Reports: React.FC = () => {
//   const [loading, setLoading] = useState(true);
//   const [dateRange, setDateRange] = useState('30');
//   const [reportType, setReportType] = useState('overview');
//   const [metrics, setMetrics] = useState({
//     totalRevenue: 0,
//     totalOrders: 0,
//     totalProducts: 0,
//     totalCustomers: 0,
//     revenueGrowth: 0,
//     orderGrowth: 0
//   });

//   useEffect(() => {
//     loadReportData();
//   }, [dateRange, reportType]);

//   const loadReportData = async () => {
//     try {
//       setLoading(true);
//       // In a real implementation, you would fetch data based on dateRange and reportType
//       // For now, we'll use mock data
//       setMetrics({
//         totalRevenue: 2850000,
//         totalOrders: 1847,
//         totalProducts: 450,
//         totalCustomers: 156,
//         revenueGrowth: 12.5,
//         orderGrowth: 8.3
//       });
//     } catch (error) {
//       console.error('Error loading report data:', error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const reportCards = [
//     {
//       title: 'Revenue Analytics',
//       description: 'Track revenue trends, growth patterns, and financial performance metrics.',
//       icon: DollarSign,
//       color: 'bg-green-50 text-green-600',
//       value: `$${(metrics.totalRevenue / 1000000).toFixed(1)}M`,
//       change: `+${metrics.revenueGrowth}%`
//     },
//     {
//       title: 'Sales Performance',
//       description: 'Monitor order volumes, conversion rates, and sales team performance.',
//       icon: TrendingUp,
//       color: 'bg-blue-50 text-blue-600',
//       value: metrics.totalOrders.toLocaleString(),
//       change: `+${metrics.orderGrowth}%`
//     },
//     {
//       title: 'Inventory Analysis',
//       description: 'Analyze stock levels, turnover rates, and inventory optimization.',
//       icon: Package,
//       color: 'bg-purple-50 text-purple-600',
//       value: metrics.totalProducts.toLocaleString(),
//       change: '+5.2%'
//     },
//     {
//       title: 'Customer Insights',
//       description: 'Understand customer behavior, retention, and satisfaction metrics.',
//       icon: Users,
//       color: 'bg-orange-50 text-orange-600',
//       value: metrics.totalCustomers.toLocaleString(),
//       change: '+3.8%'
//     }
//   ];

//   if (loading) {
//     return (
//       <div className="flex items-center justify-center min-h-96">
//         <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
//       </div>
//     );
//   }

//   return (
//     <div className="space-y-6">
//       {/* Header Controls */}
//       <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
//         <div className="flex flex-col sm:flex-row gap-4">
//           <div className="relative">
//             <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
//             <select
//               value={reportType}
//               onChange={(e) => setReportType(e.target.value)}
//               className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
//             >
//               <option value="overview">Overview Report</option>
//               <option value="sales">Sales Report</option>
//               <option value="inventory">Inventory Report</option>
//               <option value="financial">Financial Report</option>
//               <option value="customer">Customer Report</option>
//             </select>
//           </div>
//           <div className="relative">
//             <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
//             <select
//               value={dateRange}
//               onChange={(e) => setDateRange(e.target.value)}
//               className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
//             >
//               <option value="7">Last 7 days</option>
//               <option value="30">Last 30 days</option>
//               <option value="90">Last 90 days</option>
//               <option value="365">Last year</option>
//             </select>
//           </div>
//         </div>
//         <button className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
//           <Download className="h-4 w-4" />
//           <span>Export Report</span>
//         </button>
//       </div>

//       {/* Report Cards Grid */}
//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
//         {reportCards.map((card, index) => {
//           const Icon = card.icon;
//           return (
//             <div key={index} className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow cursor-pointer">
//               <div className="flex items-center justify-between mb-4">
//                 <div className={`p-3 rounded-lg ${card.color}`}>
//                   <Icon className="h-6 w-6" />
//                 </div>
//                 <span className="text-sm font-medium text-green-600">{card.change}</span>
//               </div>
//               <h3 className="text-lg font-semibold text-gray-900 mb-2">{card.title}</h3>
//               <p className="text-sm text-gray-600 mb-3">{card.description}</p>
//               <div className="text-2xl font-bold text-gray-900">{card.value}</div>
//             </div>
//           );
//         })}
//       </div>

//       {/* Detailed Analytics Section */}
//       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//         {/* Revenue Trend Chart Placeholder */}
//         <div className="bg-white rounded-lg border border-gray-200 p-6">
//           <div className="flex items-center justify-between mb-4">
//             <h3 className="text-lg font-semibold text-gray-900 flex items-center">
//               <BarChart3 className="h-5 w-5 text-blue-500 mr-2" />
//               Revenue Trend
//             </h3>
//             <span className="text-sm text-gray-500">Last {dateRange} days</span>
//           </div>
//           <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
//             <div className="text-center">
//               <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-2" />
//               <p className="text-gray-500">Chart visualization would appear here</p>
//               <p className="text-sm text-gray-400">Integration with charting library needed</p>
//             </div>
//           </div>
//         </div>

//         {/* Top Products */}
//         <div className="bg-white rounded-lg border border-gray-200 p-6">
//           <div className="flex items-center justify-between mb-4">
//             <h3 className="text-lg font-semibold text-gray-900 flex items-center">
//               <Package className="h-5 w-5 text-green-500 mr-2" />
//               Top Performing Products
//             </h3>
//           </div>
//           <div className="space-y-4">
//             {[
//               { name: 'Amoxicillin 500mg', sales: 1250, revenue: 1062.50 },
//               { name: 'Paracetamol 650mg', sales: 980, revenue: 117.60 },
//               { name: 'Insulin Glargine 100U/ml', sales: 340, revenue: 15470.00 },
//               { name: 'Aspirin 75mg', sales: 750, revenue: 225.00 },
//               { name: 'Metformin 500mg', sales: 620, revenue: 372.00 }
//             ].map((product, index) => (
//               <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
//                 <div>
//                   <p className="text-sm font-medium text-gray-900">{product.name}</p>
//                   <p className="text-xs text-gray-600">{product.sales} units sold</p>
//                 </div>
//                 <div className="text-right">
//                   <p className="text-sm font-semibold text-green-600">${product.revenue.toLocaleString()}</p>
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div>
//       </div>

//       {/* Key Performance Indicators */}
//       <div className="bg-white rounded-lg border border-gray-200 p-6">
//         <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
//           <TrendingUp className="h-5 w-5 text-purple-500 mr-2" />
//           Key Performance Indicators
//         </h3>
//         <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//           <div className="text-center">
//             <div className="text-3xl font-bold text-blue-600 mb-2">94.5%</div>
//             <div className="text-sm text-gray-600">Order Fulfillment Rate</div>
//             <div className="text-xs text-green-600 mt-1">+2.3% from last month</div>
//           </div>
//           <div className="text-center">
//             <div className="text-3xl font-bold text-green-600 mb-2">2.8 days</div>
//             <div className="text-sm text-gray-600">Average Delivery Time</div>
//             <div className="text-xs text-green-600 mt-1">-0.5 days improvement</div>
//           </div>
//           <div className="text-center">
//             <div className="text-3xl font-bold text-purple-600 mb-2">98.2%</div>
//             <div className="text-sm text-gray-600">Customer Satisfaction</div>
//             <div className="text-xs text-green-600 mt-1">+1.2% from last month</div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };