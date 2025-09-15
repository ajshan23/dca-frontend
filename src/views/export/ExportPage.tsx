// pages/ExportPage.tsx
import React, { useState } from 'react';
import { Card, Button, Tabs, Notification, toast } from '@/components/ui';
import { HiOutlineDocumentReport, HiOutlineDownload, HiOutlineTable } from 'react-icons/hi';
import ExcelExportModal from './ExcelExportModal';

const ExportPage = () => {
  const [activeTab, setActiveTab] = useState('assignments');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Data Export
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Export your product and assignment data to Excel format for reporting and analysis.
        </p>
      </div>

      <Card>
        <Tabs value={activeTab} onChange={setActiveTab}>
          <Tabs.TabList>
            <Tabs.TabNav value="assignments" icon={<HiOutlineTable />}>
              Assignments
            </Tabs.TabNav>
            <Tabs.TabNav value="products" icon={<HiOutlineDocumentReport />}>
              Products
            </Tabs.TabNav>
          </Tabs.TabList>
          
          <Tabs.TabContent value="assignments" className="p-6">
            <div className="text-center py-8">
              <HiOutlineTable className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                Export Assignment Data
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-6">
                Export assignment records with detailed information including employee assignments, 
                product details, dates, and status information.
              </p>
              <Button
                variant="solid"
                icon={<HiOutlineDownload />}
                onClick={handleOpenModal}
              >
                Export Assignments
              </Button>
            </div>
          </Tabs.TabContent>
          
          <Tabs.TabContent value="products" className="p-6">
            <div className="text-center py-8">
              <HiOutlineDocumentReport className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                Export Product Data
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-6">
                Export product information including stock levels, inventory details, 
                and product specifications.
              </p>
              <Button
                variant="solid"
                icon={<HiOutlineDownload />}
                onClick={handleOpenModal}
              >
                Export Products
              </Button>
            </div>
          </Tabs.TabContent>
        </Tabs>
      </Card>

      <ExcelExportModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        type={activeTab as 'assignments' | 'products'}
      />
    </div>
  );
};

export default ExportPage;