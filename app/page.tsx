"use client";
import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { AuthPage } from '../components/auth/AuthPage';
import { Sidebar } from '../components/common/Sidebar';
import { Header } from '../components/common/Header';
import { Dashboard } from '../components/modules/Dashboard';
import { Inventory } from '../components/modules/Inventory';
import { Orders } from '../components/modules/Orders';
import { Customers } from '../components/modules/Customers';
import { Suppliers } from '../components/modules/Suppliers';
import { Invoices } from '../components/modules/Invoices';
// import { Reports } from './components/modules/Reports';
// import { Settings } from './components/modules/Settings';

function App() {
  const { user, loading } = useAuth();
  const [activeModule, setActiveModule] = useState('dashboard');

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-white">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <AuthPage onAuthSuccess={() => {}} />;
  }

  const getModuleTitle = (module: string) => {
    switch (module) {
      case 'dashboard': return 'Dashboard';
      case 'inventory': return 'Inventory Management';
      case 'orders': return 'Order Management';
      case 'customers': return 'Customer Management';
      case 'suppliers': return 'Supplier Management';
      case 'invoices': return 'Invoice Management';
      // case 'reports': return 'Reports & Analytics';
      // case 'settings': return 'System Settings';
      default: return 'Dashboard';
    }
  };

  const renderModule = () => {
    switch (activeModule) {
      case 'dashboard':
        return <Dashboard />;
      case 'inventory':
        return <Inventory />;
      case 'orders':
        return <Orders />;
      case 'customers':
        return <Customers />;
      case 'suppliers':
        return <Suppliers />;
      case 'invoices':
        return <Invoices />;
      // case 'reports':
        // return <Reports />;
      // case 'settings':
        // return <Settings />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar activeModule={activeModule} onModuleChange={setActiveModule} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title={getModuleTitle(activeModule)} />
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-6">
          {renderModule()}
        </main>
      </div>
    </div>
  );
}

export default App;