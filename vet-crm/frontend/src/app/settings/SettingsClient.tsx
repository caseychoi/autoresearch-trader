'use client';
import React, { useState } from 'react';
import ServiceCatalog from './ServiceCatalog';
import GeneralProfileTab from './GeneralProfileTab';
import StaffManagementTab from './StaffManagementTab';
import SystemDataTab from './SystemDataTab';
import { Building2, Users, List, Database } from 'lucide-react';

export default function SettingsClient({ initialServices }: { initialServices: any[] }) {
  const [activeTab, setActiveTab] = useState('profile');

  const tabs = [
    { id: 'profile', label: 'General Profile', icon: <Building2 className="w-4 h-4 mr-2" /> },
    { id: 'staff', label: 'Staff Management', icon: <Users className="w-4 h-4 mr-2" /> },
    { id: 'catalog', label: 'Service Catalog', icon: <List className="w-4 h-4 mr-2" /> },
    { id: 'system', label: 'System & Data', icon: <Database className="w-4 h-4 mr-2" /> }
  ];

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="p-4 bg-slate-50 border-b border-slate-200">
        <nav className="flex space-x-1 overflow-x-auto bg-slate-200/60 p-1 rounded-xl">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-1 justify-center items-center py-3 px-4 rounded-lg font-bold text-sm transition-all duration-200 whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-indigo-600 text-white shadow-md transform scale-[1.02]'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              {React.cloneElement(tab.icon, { className: `w-5 h-5 mr-2 ${activeTab === tab.id ? 'text-white' : 'text-slate-500'}` })}
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      <div className="p-6">
        {activeTab === 'profile' && <GeneralProfileTab />}
        {activeTab === 'staff' && <StaffManagementTab />}
        {activeTab === 'catalog' && (
          <div>
            <div className="mb-6">
              <h2 className="text-xl font-bold text-slate-800">Service Catalog</h2>
              <p className="text-sm text-slate-500 mt-1">Standardized services and base prices for invoicing.</p>
            </div>
            <ServiceCatalog initialServices={initialServices} />
          </div>
        )}
        {activeTab === 'system' && <SystemDataTab />}
      </div>
    </div>
  );
}
