// src/components/ui/Tabs.tsx
import React, { useState } from 'react';

export const Tabs = ({ children, defaultValue }: { children: React.ReactNode; defaultValue: string }) => {
  const [activeTab, setActiveTab] = useState(defaultValue);
  
  return (
    <div className="tabs">
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child, { activeTab, setActiveTab } as any);
        }
        return child;
      })}
    </div>
  );
};

export const TabsList = ({ children, activeTab, setActiveTab }: { children: React.ReactNode; activeTab: string; setActiveTab: (tab: string) => void }) => {
  return (
    <div className="flex border-b border-gray-200 mb-4">
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child, { activeTab, setActiveTab } as any);
        }
        return child;
      })}
    </div>
  );
};

export const TabsTrigger = ({ 
  value, 
  children, 
  activeTab, 
  setActiveTab 
}: { 
  value: string; 
  children: React.ReactNode; 
  activeTab: string; 
  setActiveTab: (tab: string) => void 
}) => {
  return (
    <button
      className={`px-4 py-2 font-medium text-sm ${activeTab === value ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
      onClick={() => setActiveTab(value)}
    >
      {children}
    </button>
  );
};

export const TabsContent = ({ value, children, activeTab }: { value: string; children: React.ReactNode; activeTab: string }) => {
  return activeTab === value ? <div className="py-4">{children}</div> : null;
};