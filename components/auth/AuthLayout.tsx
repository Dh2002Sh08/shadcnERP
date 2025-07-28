import React from 'react';
import { Building2 } from 'lucide-react';

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle: string;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({ children, title, subtitle }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8">
        {/* Logo and Header */}
        <div className="text-center">
          <div className="flex items-center justify-center space-x-3 mb-6">
            <div className="p-3 bg-blue-600 rounded-xl">
              <Building2 className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">UNKNOWN</h1>
              <p className="text-sm text-blue-200">Pharma Distribution</p>
            </div>
          </div>
          <h2 className="text-2xl font-bold text-white">{title}</h2>
          <p className="mt-2 text-blue-200">{subtitle}</p>
        </div>

        {/* Auth Form */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          {children}
        </div>

        {/* Footer */}
        <div className="text-center">
          <p className="text-sm text-blue-200">
            © 2024 UNKNOWN Pharmaceutical Distribution. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
};