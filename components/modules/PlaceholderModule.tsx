import React from 'react';
import { DivideIcon as LucideIcon } from 'lucide-react';

interface PlaceholderModuleProps {
  title: string;
  description: string;
  icon: typeof LucideIcon;
}

export const PlaceholderModule: React.FC<PlaceholderModuleProps> = ({ 
  title, 
  description, 
  icon: Icon 
}) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-96 bg-white rounded-lg border border-gray-200 p-8">
      <div className="p-4 bg-blue-50 rounded-full mb-4">
        <Icon className="h-12 w-12 text-blue-600" />
      </div>
      <h2 className="text-2xl font-semibold text-gray-900 mb-2">{title}</h2>
      <p className="text-gray-600 text-center max-w-md">{description}</p>
      <button className="mt-6 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">
        Coming Soon
      </button>
    </div>
  );
};