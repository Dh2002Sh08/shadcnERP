import React, { useState } from 'react';
import { 
  Settings as SettingsIcon, 
  User, 
  Shield, 
  Bell, 
  Database, 
  Mail, 
  Globe, 
  Save,
  Eye,
  EyeOff
} from 'lucide-react';

export const Settings: React.FC = () => {
  const [activeTab, setActiveTab] = useState('general');
  const [showPassword, setShowPassword] = useState(false);
  const [settings, setSettings] = useState({
    general: {
      companyName: 'UNKNOWN Pharmaceutical Distribution',
      companyEmail: 'admin@unknown.com',
      companyPhone: '+1-555-0123',
      companyAddress: '123 Pharma Street, Medical District',
      timezone: 'UTC-5',
      currency: 'USD',
      language: 'en'
    },
    notifications: {
      emailNotifications: true,
      smsNotifications: false,
      lowStockAlerts: true,
      expiryAlerts: true,
      orderUpdates: true,
      systemMaintenance: true
    },
    security: {
      twoFactorAuth: false,
      sessionTimeout: 30,
      passwordExpiry: 90,
      loginAttempts: 5
    },
    system: {
      autoBackup: true,
      backupFrequency: 'daily',
      dataRetention: 365,
      auditLogging: true
    }
  });

  const tabs = [
    { id: 'general', label: 'General', icon: SettingsIcon },
    { id: 'users', label: 'User Management', icon: User },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'system', label: 'System', icon: Database },
    { id: 'integrations', label: 'Integrations', icon: Globe }
  ];

  const handleSave = () => {
    // In a real implementation, this would save to the database
    console.log('Settings saved:', settings);
    alert('Settings saved successfully!');
  };

  const renderGeneralSettings = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Company Name</label>
          <input
            type="text"
            value={settings.general.companyName}
            onChange={(e) => setSettings({
              ...settings,
              general: { ...settings.general, companyName: e.target.value }
            })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Company Email</label>
          <input
            type="email"
            value={settings.general.companyEmail}
            onChange={(e) => setSettings({
              ...settings,
              general: { ...settings.general, companyEmail: e.target.value }
            })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
          <input
            type="tel"
            value={settings.general.companyPhone}
            onChange={(e) => setSettings({
              ...settings,
              general: { ...settings.general, companyPhone: e.target.value }
            })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Timezone</label>
          <select
            value={settings.general.timezone}
            onChange={(e) => setSettings({
              ...settings,
              general: { ...settings.general, timezone: e.target.value }
            })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="UTC-5">UTC-5 (Eastern)</option>
            <option value="UTC-6">UTC-6 (Central)</option>
            <option value="UTC-7">UTC-7 (Mountain)</option>
            <option value="UTC-8">UTC-8 (Pacific)</option>
          </select>
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Company Address</label>
        <textarea
          value={settings.general.companyAddress}
          onChange={(e) => setSettings({
            ...settings,
            general: { ...settings.general, companyAddress: e.target.value }
          })}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>
    </div>
  );

  const renderUserManagement = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900">User Accounts</h3>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
          Add User
        </button>
      </div>
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            <tr>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Admin User</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">admin@unknown.com</td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-purple-100 text-purple-800">
                  Administrator
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                  Active
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <button className="text-blue-600 hover:text-blue-900 mr-3">Edit</button>
                <button className="text-red-600 hover:text-red-900">Disable</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderSecuritySettings = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={settings.security.twoFactorAuth}
              onChange={(e) => setSettings({
                ...settings,
                security: { ...settings.security, twoFactorAuth: e.target.checked }
              })}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="ml-2 text-sm text-gray-700">Enable Two-Factor Authentication</span>
          </label>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Session Timeout (minutes)</label>
          <input
            type="number"
            value={settings.security.sessionTimeout}
            onChange={(e) => setSettings({
              ...settings,
              security: { ...settings.security, sessionTimeout: parseInt(e.target.value) }
            })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Password Expiry (days)</label>
          <input
            type="number"
            value={settings.security.passwordExpiry}
            onChange={(e) => setSettings({
              ...settings,
              security: { ...settings.security, passwordExpiry: parseInt(e.target.value) }
            })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Max Login Attempts</label>
          <input
            type="number"
            value={settings.security.loginAttempts}
            onChange={(e) => setSettings({
              ...settings,
              security: { ...settings.security, loginAttempts: parseInt(e.target.value) }
            })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>
      <div className="border-t pt-6">
        <h4 className="text-md font-medium text-gray-900 mb-4">Change Password</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Current Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                {showPassword ? <EyeOff className="h-4 w-4 text-gray-400" /> : <Eye className="h-4 w-4 text-gray-400" />}
              </button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
            <input
              type="password"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderNotificationSettings = () => (
    <div className="space-y-6">
      <div className="space-y-4">
        {Object.entries(settings.notifications).map(([key, value]) => (
          <div key={key} className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-700">
                {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
              </label>
              <p className="text-xs text-gray-500">
                {key === 'emailNotifications' && 'Receive notifications via email'}
                {key === 'smsNotifications' && 'Receive notifications via SMS'}
                {key === 'lowStockAlerts' && 'Get alerted when inventory is low'}
                {key === 'expiryAlerts' && 'Get alerted about expiring products'}
                {key === 'orderUpdates' && 'Receive updates about order status changes'}
                {key === 'systemMaintenance' && 'Get notified about system maintenance'}
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={value}
                onChange={(e) => setSettings({
                  ...settings,
                  notifications: { ...settings.notifications, [key]: e.target.checked }
                })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        ))}
      </div>
    </div>
  );

  const renderSystemSettings = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={settings.system.autoBackup}
              onChange={(e) => setSettings({
                ...settings,
                system: { ...settings.system, autoBackup: e.target.checked }
              })}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="ml-2 text-sm text-gray-700">Enable Automatic Backups</span>
          </label>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Backup Frequency</label>
          <select
            value={settings.system.backupFrequency}
            onChange={(e) => setSettings({
              ...settings,
              system: { ...settings.system, backupFrequency: e.target.value }
            })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="hourly">Hourly</option>
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Data Retention (days)</label>
          <input
            type="number"
            value={settings.system.dataRetention}
            onChange={(e) => setSettings({
              ...settings,
              system: { ...settings.system, dataRetention: parseInt(e.target.value) }
            })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={settings.system.auditLogging}
              onChange={(e) => setSettings({
                ...settings,
                system: { ...settings.system, auditLogging: e.target.checked }
              })}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="ml-2 text-sm text-gray-700">Enable Audit Logging</span>
          </label>
        </div>
      </div>
    </div>
  );

  const renderIntegrations = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center">
              <Mail className="h-8 w-8 text-blue-600 mr-3" />
              <div>
                <h4 className="font-medium text-gray-900">Email Service</h4>
                <p className="text-sm text-gray-600">SMTP configuration for notifications</p>
              </div>
            </div>
            <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
              Connected
            </span>
          </div>
          <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">Configure</button>
        </div>
        
        <div className="border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center">
              <Database className="h-8 w-8 text-purple-600 mr-3" />
              <div>
                <h4 className="font-medium text-gray-900">Database Backup</h4>
                <p className="text-sm text-gray-600">External backup service integration</p>
              </div>
            </div>
            <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">
              Pending
            </span>
          </div>
          <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">Setup</button>
        </div>
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'general': return renderGeneralSettings();
      case 'users': return renderUserManagement();
      case 'security': return renderSecuritySettings();
      case 'notifications': return renderNotificationSettings();
      case 'system': return renderSystemSettings();
      case 'integrations': return renderIntegrations();
      default: return renderGeneralSettings();
    }
  };

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8 overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">
            {tabs.find(tab => tab.id === activeTab)?.label} Settings
          </h2>
          <button
            onClick={handleSave}
            className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Save className="h-4 w-4" />
            <span>Save Changes</span>
          </button>
        </div>
        {renderTabContent()}
      </div>
    </div>
  );
};