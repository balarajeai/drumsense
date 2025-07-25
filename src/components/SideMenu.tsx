import { useState } from 'react';

interface SideMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SideMenu({ isOpen, onClose }: SideMenuProps) {
  const [activeTab, setActiveTab] = useState('display');
  const [themeMode, setThemeMode] = useState<'dark' | 'light'>('dark');

  const tabs = [
    { id: 'display', label: 'Display', icon: 'ri-settings-line' },
    { id: 'alerts', label: 'Alerts', icon: 'ri-notification-line' },
    { id: 'export', label: 'Export', icon: 'ri-download-line' }
  ];

  return (
    <div className={`fixed inset-y-0 left-0 w-80 bg-gray-900/95 backdrop-blur-sm border-r border-gray-700 transform transition-transform duration-300 z-50 ${
      isOpen ? 'translate-x-0' : '-translate-x-full'
    }`}>
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <h2 className="text-lg font-semibold text-white">Settings</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center hover:bg-gray-800 rounded-lg transition-colors cursor-pointer"
          >
            <i className="ri-close-line text-gray-400"></i>
          </button>
        </div>

        <div className="flex border-b border-gray-700">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center space-x-2 py-3 text-sm font-medium transition-colors cursor-pointer whitespace-nowrap ${
                activeTab === tab.id
                  ? 'text-blue-400 border-b-2 border-blue-400'
                  : 'text-gray-400 hover:text-gray-300'
              }`}
            >
              <i className={`${tab.icon} text-sm`}></i>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {activeTab === 'display' && (
            <div className="space-y-4">
              <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                <h4 className="text-sm font-medium text-white mb-3">3D View Settings</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-300">Show Grid</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" defaultChecked className="sr-only" />
                      <div className="w-10 h-6 bg-blue-600 rounded-full">
                        <div className="w-4 h-4 bg-white rounded-full shadow-md transform translate-x-5 mt-1"></div>
                      </div>
                    </label>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-300">Auto-rotate</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only" />
                      <div className="w-10 h-6 bg-gray-600 rounded-full">
                        <div className="w-4 h-4 bg-white rounded-full shadow-md transform translate-x-1 mt-1"></div>
                      </div>
                    </label>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-300">Show Labels</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" defaultChecked className="sr-only" />
                      <div className="w-10 h-6 bg-blue-600 rounded-full">
                        <div className="w-4 h-4 bg-white rounded-full shadow-md transform translate-x-5 mt-1"></div>
                      </div>
                    </label>
                  </div>
                </div>
              </div>

              <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                <h4 className="text-sm font-medium text-white mb-3">Theme</h4>
                <div className="space-y-2">
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input 
                      type="radio" 
                      name="theme" 
                      checked={themeMode === 'dark'} 
                      onChange={() => setThemeMode('dark')}
                      className="text-blue-500" 
                    />
                    <span className="text-sm text-gray-300">Dark Mode</span>
                  </label>
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input 
                      type="radio" 
                      name="theme" 
                      checked={themeMode === 'light'}
                      onChange={() => setThemeMode('light')}
                      className="text-blue-500" 
                    />
                    <span className="text-sm text-gray-300">Light Mode</span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'alerts' && (
            <div className="space-y-4">
              <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                <h4 className="text-sm font-medium text-white mb-3">Alert Settings</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-300">Email Notifications</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" defaultChecked className="sr-only" />
                      <div className="w-10 h-6 bg-blue-600 rounded-full">
                        <div className="w-4 h-4 bg-white rounded-full shadow-md transform translate-x-5 mt-1"></div>
                      </div>
                    </label>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-300">Desktop Alerts</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" defaultChecked className="sr-only" />
                      <div className="w-10 h-6 bg-blue-600 rounded-full">
                        <div className="w-4 h-4 bg-white rounded-full shadow-md transform translate-x-5 mt-1"></div>
                      </div>
                    </label>
                  </div>
                </div>
              </div>

              <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                <h4 className="text-sm font-medium text-white mb-3">Alert Thresholds</h4>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Temperature Warning (°C)</label>
                    <input
                      type="number"
                      defaultValue={75}
                      className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Efficiency Warning (%)</label>
                    <input
                      type="number"
                      defaultValue={85}
                      className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white text-sm"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'export' && (
            <div className="space-y-4">
              <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                <h4 className="text-sm font-medium text-white mb-3">Export Format</h4>
                <select className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white text-sm">
                  <option>CSV</option>
                  <option>JSON</option>
                  <option>Excel</option>
                </select>
              </div>

              <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                <h4 className="text-sm font-medium text-white mb-3">Time Range</h4>
                <select className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white text-sm mb-4">
                  <option>Last 24 hours</option>
                  <option>Last 7 days</option>
                  <option>Last 30 days</option>
                  <option>Custom range</option>
                </select>

                <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors">
                  <i className="ri-download-line mr-2"></i>
                  Export Data
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
