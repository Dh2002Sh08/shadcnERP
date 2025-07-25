// import { Product, Customer, Supplier, Order, Invoice, DashboardMetrics } from '../types';

// export const mockProducts: Product[] = [
//   {
//     id: '1',
//     name: 'Amoxicillin 500mg',
//     genericName: 'Amoxicillin',
//     manufacturer: 'PharmaCorp Ltd',
//     category: 'Antibiotics',
//     sku: 'AMX-500-100',
//     batchNumber: 'BT2024001',
//     expiryDate: new Date('2025-06-15'),
//     quantity: 1200,
//     unitPrice: 0.85,
//     reorderLevel: 200,
//     status: 'active',
//     regulatoryInfo: {
//       licenseNumber: 'LIC-2024-001',
//       drugCode: 'DRG-AMX-001',
//       schedule: 'Schedule H'
//     }
//   },
//   {
//     id: '2',
//     name: 'Paracetamol 650mg',
//     genericName: 'Acetaminophen',
//     manufacturer: 'MediGen Industries',
//     category: 'Analgesics',
//     sku: 'PAR-650-50',
//     batchNumber: 'BT2024002',
//     expiryDate: new Date('2025-12-30'),
//     quantity: 75,
//     unitPrice: 0.12,
//     reorderLevel: 500,
//     status: 'active',
//     regulatoryInfo: {
//       licenseNumber: 'LIC-2024-002',
//       drugCode: 'DRG-PAR-001',
//       schedule: 'Schedule G'
//     }
//   },
//   {
//     id: '3',
//     name: 'Insulin Glargine 100U/ml',
//     genericName: 'Insulin Glargine',
//     manufacturer: 'BioPharma Solutions',
//     category: 'Diabetes Care',
//     sku: 'INS-GLR-10',
//     batchNumber: 'BT2024003',
//     expiryDate: new Date('2025-03-22'),
//     quantity: 340,
//     unitPrice: 45.50,
//     reorderLevel: 100,
//     status: 'active',
//     regulatoryInfo: {
//       licenseNumber: 'LIC-2024-003',
//       drugCode: 'DRG-INS-001',
//       schedule: 'Schedule X'
//     }
//   }
// ];

// export const mockCustomers: Customer[] = [
//   {
//     id: '1',
//     name: 'City General Hospital',
//     type: 'hospital',
//     contactPerson: 'Dr. Sarah Johnson',
//     email: 'procurement@citygeneral.com',
//     phone: '+1-555-0123',
//     address: '123 Healthcare Ave, Medical District',
//     licenseNumber: 'HOSP-2024-001',
//     creditLimit: 100000,
//     outstandingBalance: 15750,
//     status: 'active'
//   },
//   {
//     id: '2',
//     name: 'MediCare Pharmacy Chain',
//     type: 'pharmacy',
//     contactPerson: 'Mike Chen',
//     email: 'orders@medicare-pharma.com',
//     phone: '+1-555-0124',
//     address: '456 Pharmacy Blvd, Commerce Center',
//     licenseNumber: 'PHAR-2024-002',
//     creditLimit: 50000,
//     outstandingBalance: 8950,
//     status: 'active'
//   },
//   {
//     id: '3',
//     name: 'Regional Medical Clinic',
//     type: 'clinic',
//     contactPerson: 'Dr. Emily Rodriguez',
//     email: 'supplies@regionalmedic.com',
//     phone: '+1-555-0125',
//     address: '789 Medical Plaza, Suburban Area',
//     licenseNumber: 'CLIN-2024-003',
//     creditLimit: 25000,
//     outstandingBalance: 0,
//     status: 'active'
//   }
// ];

// export const mockOrders: Order[] = [
//   {
//     id: 'ORD-2024-001',
//     customer_id: '1',
//     customer_name: 'City General Hospital',
//     order_date: new Date('2024-01-15'),
//     requiredDate: new Date('2024-01-20'),
//     status: 'processing',
//     items: [
//       {
//         productId: '1',
//         productName: 'Amoxicillin 500mg',
//         quantity: 500,
//         unitPrice: 0.85,
//         totalPrice: 425,
//         batchNumber: 'BT2024001',
//         expiryDate: new Date('2025-06-15')
//       }
//     ],
//     totalAmount: 425,
//     paymentStatus: 'pending',
//     priority: 'high'
//   },
//   {
//     id: 'ORD-2024-002',
//     customerId: '2',
//     customerName: 'MediCare Pharmacy Chain',
//     orderDate: new Date('2024-01-16'),
//     requiredDate: new Date('2024-01-18'),
//     status: 'shipped',
//     items: [
//       {
//         productId: '2',
//         productName: 'Paracetamol 650mg',
//         quantity: 1000,
//         unitPrice: 0.12,
//         totalPrice: 120,
//         batchNumber: 'BT2024002',
//         expiryDate: new Date('2025-12-30')
//       }
//     ],
//     totalAmount: 120,
//     paymentStatus: 'paid',
//     priority: 'medium'
//   }
// ];

// export const mockDashboardMetrics: DashboardMetrics = {
//   totalRevenue: 2850000,
//   totalOrders: 1847,
//   pendingOrders: 23,
//   lowStockItems: 12,
//   expiringItems: 5,
//   activeCustomers: 156,
//   revenueGrowth: 12.5,
//   orderGrowth: 8.3
// };

// export const mockSuppliers: Supplier[] = [
//   {
//     id: '1',
//     name: 'PharmaCorp Ltd',
//     contactPerson: 'John Smith',
//     email: 'john.smith@pharmacorp.com',
//     phone: '+1-555-0200',
//     address: '456 Industrial Blvd, Manufacturing District',
//     licenseNumber: 'SUP-2024-001',
//     rating: 5,
//     paymentTerms: 'Net 30',
//     status: 'active'
//   },
//   {
//     id: '2',
//     name: 'MediGen Industries',
//     contactPerson: 'Sarah Wilson',
//     email: 'sarah.wilson@medigen.com',
//     phone: '+1-555-0201',
//     address: '789 Pharma Ave, Research Park',
//     licenseNumber: 'SUP-2024-002',
//     rating: 4,
//     paymentTerms: 'Net 45',
//     status: 'active'
//   },
//   {
//     id: '3',
//     name: 'BioPharma Solutions',
//     contactPerson: 'Dr. Michael Chen',
//     email: 'michael.chen@biopharma.com',
//     phone: '+1-555-0202',
//     address: '321 Biotech Circle, Innovation Hub',
//     licenseNumber: 'SUP-2024-003',
//     rating: 5,
//     paymentTerms: 'Net 30',
//     status: 'active'
//   }
// ];

// export const mockInvoices: Invoice[] = [
//   {
//     id: 'INV-2024-001',
//     orderId: 'ORD-2024-001',
//     customerId: '1',
//     customerName: 'City General Hospital',
//     invoiceDate: new Date('2024-01-15'),
//     dueDate: new Date('2024-02-14'),
//     amount: 425,
//     paidAmount: 425,
//     status: 'paid'
//   },
//   {
//     id: 'INV-2024-002',
//     orderId: 'ORD-2024-002',
//     customerId: '2',
//     customerName: 'MediCare Pharmacy Chain',
//     invoiceDate: new Date('2024-01-16'),
//     dueDate: new Date('2024-02-15'),
//     amount: 120,
//     paidAmount: 0,
//     status: 'sent'
//   },
//   {
//     id: 'INV-2024-003',
//     orderId: 'ORD-2024-003',
//     customerId: '3',
//     customerName: 'Regional Medical Clinic',
//     invoiceDate: new Date('2024-01-10'),
//     dueDate: new Date('2024-02-09'),
//     amount: 850,
//     paidAmount: 400,
//     status: 'overdue'
//   }
// ];