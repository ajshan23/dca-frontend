import React, { useState, useMemo } from 'react';
import { 
  Button, 
  Dialog, 
  Select, 
  DatePicker, 
  Card, 
  Input,
  Checkbox,
  Notification,
  toast,
  FormItem,
  FormContainer
} from '@/components/ui';
import { HiOutlineDownload, HiOutlineFilter, HiOutlineX } from 'react-icons/hi';
import { useQuery } from '@tanstack/react-query';
import { apiGetCategories } from '@/services/CategoryService';
import { apiGetBranches } from '@/services/BranchService';
import { apiGetDepartments } from '@/services/DepartmentService';
import { apiGetEmployees } from '@/services/EmployeeService.ts';
import { apiExportProductsToExcel } from '@/services/ProductService';
import { apiExportAssignmentsToExcel } from '@/services/ProductService';

interface ExcelExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'assignments' | 'products';
}

const ExcelExportModal: React.FC<ExcelExportModalProps> = ({ isOpen, onClose, type }) => {
  const [filters, setFilters] = useState({
    // Date filters
    fromDate: null as Date | null,
    toDate: null as Date | null,
    month: '',
    year: '',
    
    // Entity filters
    employeeId: '',
    productId: '',
    categoryId: '',
    branchId: '',
    departmentId: '',
    
    // Status filters
    status: '',
    stockStatus: '',
    complianceStatus: '',
    
    // Format options (for assignments)
    format: 'all', // 'active', 'history', 'all'
    
    // Additional options
    includeInventory: false,
  });

  const [isExporting, setIsExporting] = useState(false);

  // Fetch dropdown data
  const { data: categoriesResponse } = useQuery({
    queryKey: ['categories-for-export'],
    queryFn: () => apiGetCategories({ page: 1, limit: 100 })
  });

  const { data: branchesResponse } = useQuery({
    queryKey: ['branches-for-export'],
    queryFn: () => apiGetBranches({ page: 1, limit: 100 })
  });

  const { data: departmentsResponse } = useQuery({
    queryKey: ['departments-for-export'],
    queryFn: () => apiGetDepartments({ page: 1, limit: 100 })
  });

  const { data: employeesResponse } = useQuery({
    queryKey: ['employees-for-export'],
    queryFn: () => apiGetEmployees({ page: 1, limit: 100, status: 'active' }),
    enabled: type === 'assignments'
  });

  // Prepare dropdown options
  const categoryOptions = useMemo(() => 
    categoriesResponse?.data?.data?.map((cat: any) => ({
      value: cat.id,
      label: cat.name
    })) || [], [categoriesResponse]);

  const branchOptions = useMemo(() => 
    branchesResponse?.data?.data?.map((branch: any) => ({
      value: branch.id,
      label: branch.name
    })) || [], [branchesResponse]);

  const departmentOptions = useMemo(() => 
    departmentsResponse?.data?.data?.map((dept: any) => ({
      value: dept.id,
      label: dept.name
    })) || [], [departmentsResponse]);

  const employeeOptions = useMemo(() => 
    employeesResponse?.data?.data?.map((emp: any) => ({
      value: emp.id,
      label: `${emp.name} (${emp.empId})`
    })) || [], [employeesResponse]);

  // Year options (current year and past 5 years)
  const yearOptions = useMemo(() => {
    const currentYear = new Date().getFullYear();
    return Array.from({ length: 6 }, (_, i) => ({
      value: (currentYear - i).toString(),
      label: (currentYear - i).toString()
    }));
  }, []);

  // Month options
  const monthOptions = [
    { value: '1', label: 'January' },
    { value: '2', label: 'February' },
    { value: '3', label: 'March' },
    { value: '4', label: 'April' },
    { value: '5', label: 'May' },
    { value: '6', label: 'June' },
    { value: '7', label: 'July' },
    { value: '8', label: 'August' },
    { value: '9', label: 'September' },
    { value: '10', label: 'October' },
    { value: '11', label: 'November' },
    { value: '12', label: 'December' }
  ];

  const formatOptions = [
    { value: 'all', label: 'All Assignments' },
    { value: 'active', label: 'Active Assignments Only' },
    { value: 'history', label: 'Returned Assignments Only' }
  ];

  const statusOptions = [
    { value: '', label: 'All Statuses' },
    { value: 'ASSIGNED', label: 'Assigned' },
    { value: 'RETURNED', label: 'Returned' },
    { value: 'OVERDUE', label: 'Overdue' }
  ];

  const stockStatusOptions = [
    { value: '', label: 'All Stock Levels' },
    { value: 'available', label: 'Available Stock' },
    { value: 'low', label: 'Low Stock' },
    { value: 'out', label: 'Out of Stock' }
  ];

  const handleFilterChange = (key: string, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const clearAllFilters = () => {
    setFilters({
      fromDate: null,
      toDate: null,
      month: '',
      year: '',
      employeeId: '',
      productId: '',
      categoryId: '',
      branchId: '',
      departmentId: '',
      status: '',
      stockStatus: '',
      complianceStatus: '',
      format: 'all',
      includeInventory: false
    });
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      // Prepare query parameters
      const params: Record<string, any> = {};
      
      // Date filters
      if (filters.fromDate) {
        params.fromDate = filters.fromDate.toISOString().split('T')[0];
      }
      if (filters.toDate) {
        params.toDate = filters.toDate.toISOString().split('T')[0];
      }
      if (filters.month && filters.year) {
        params.month = filters.month;
        params.year = filters.year;
      }
      
      // Entity filters
      if (filters.employeeId) params.employeeId = filters.employeeId;
      if (filters.categoryId) params.categoryId = filters.categoryId;
      if (filters.branchId) params.branchId = filters.branchId;
      if (filters.departmentId) params.departmentId = filters.departmentId;
      
      // Status filters
      if (filters.status) params.status = filters.status;
      if (filters.stockStatus) params.stockStatus = filters.stockStatus;
      if (filters.complianceStatus) params.complianceStatus = filters.complianceStatus;
      
      // Format and options
      if (type === 'assignments' && filters.format) params.format = filters.format;
      if (type === 'products' && filters.includeInventory) {
        params.includeInventory = filters.includeInventory.toString();
      }
      
      // Call the appropriate export API
      let response;
      if (type === 'products') {
        response = await apiExportProductsToExcel(params);
      } else {
        response = await apiExportAssignmentsToExcel(params);
      }
      
      // Create download link
      const blob = new Blob([response.data], { 
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      // Generate filename
      const timestamp = new Date().toISOString().split('T')[0];
      const prefix = type === 'products' ? 'products-report' : 'assignments-report';
      link.download = `${prefix}-${timestamp}.xlsx`;
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.push(
        <Notification title="Success" type="success">
          {type === 'products' ? 'Products' : 'Assignments'} exported successfully!
        </Notification>
      );
      
      onClose();
    } catch (error: any) {
      console.error('Export error:', error);
      toast.push(
        <Notification title="Error" type="danger">
          {error.response?.data?.message || `Failed to export ${type}`}
        </Notification>
      );
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      width={600}
      height={700}
      closable={!isExporting}
    >
      <div className="flex justify-between items-center mb-4">
        <h4 className="text-lg font-semibold">
          Export {type === 'products' ? 'Products' : 'Assignments'} to Excel
        </h4>
       
      </div>
      
      <FormContainer>
        <div className="max-h-96 overflow-y-auto pr-2 space-y-4">
          {/* Date Range Filters */}
          <div className="grid grid-cols-2 gap-3">
            <FormItem label="From Date">
              <DatePicker
                value={filters.fromDate}
                onChange={(date) => handleFilterChange('fromDate', date)}
                placeholder="Select start date"
                disabled={isExporting}
              />
            </FormItem>
            <FormItem label="To Date">
              <DatePicker
                value={filters.toDate}
                onChange={(date) => handleFilterChange('toDate', date)}
                placeholder="Select end date"
                disabled={isExporting}
              />
            </FormItem>
          </div>
          
          {/* Month/Year Selection */}
          <div className="grid grid-cols-2 gap-3">
            <FormItem label="Month">
              <Select
                options={monthOptions}
                value={monthOptions.find(opt => opt.value === filters.month) || null}
                onChange={(option) => handleFilterChange('month', option?.value || '')}
                placeholder="Select month"
                isDisabled={isExporting}
              />
            </FormItem>
            <FormItem label="Year">
              <Select
                options={yearOptions}
                value={yearOptions.find(opt => opt.value === filters.year) || null}
                onChange={(option) => handleFilterChange('year', option?.value || '')}
                placeholder="Select year"
                isDisabled={isExporting}
              />
            </FormItem>
          </div>
          
          {/* Entity Filters */}
          <FormItem label="Category">
            <Select
              options={categoryOptions}
              value={categoryOptions.find(opt => opt.value === filters.categoryId) || null}
              onChange={(option) => handleFilterChange('categoryId', option?.value || '')}
              placeholder="Select category"
              isDisabled={isExporting}
            />
          </FormItem>
          
          <FormItem label="Branch">
            <Select
              options={branchOptions}
              value={branchOptions.find(opt => opt.value === filters.branchId) || null}
              onChange={(option) => handleFilterChange('branchId', option?.value || '')}
              placeholder="Select branch"
              isDisabled={isExporting}
            />
          </FormItem>
          
          <FormItem label="Department">
            <Select
              options={departmentOptions}
              value={departmentOptions.find(opt => opt.value === filters.departmentId) || null}
              onChange={(option) => handleFilterChange('departmentId', option?.value || '')}
              placeholder="Select department"
              isDisabled={isExporting}
            />
          </FormItem>
          
          {type === 'assignments' && (
            <FormItem label="Employee">
              <Select
                options={employeeOptions}
                value={employeeOptions.find(opt => opt.value === filters.employeeId) || null}
                onChange={(option) => handleFilterChange('employeeId', option?.value || '')}
                placeholder="Select employee"
                isDisabled={isExporting}
              />
            </FormItem>
          )}
          
          {/* Status Filters */}
          {type === 'assignments' ? (
            <FormItem label="Assignment Status">
              <Select
                options={statusOptions}
                value={statusOptions.find(opt => opt.value === filters.status) || null}
                onChange={(option) => handleFilterChange('status', option?.value || '')}
                placeholder="Select status"
                isDisabled={isExporting}
              />
            </FormItem>
          ) : (
            <FormItem label="Stock Status">
              <Select
                options={stockStatusOptions}
                value={stockStatusOptions.find(opt => opt.value === filters.stockStatus) || null}
                onChange={(option) => handleFilterChange('stockStatus', option?.value || '')}
                placeholder="Select stock status"
                isDisabled={isExporting}
              />
            </FormItem>
          )}
          
          {/* Format Options */}
          {type === 'assignments' && (
            <FormItem label="Export Format">
              <Select
                options={formatOptions}
                value={formatOptions.find(opt => opt.value === filters.format) || null}
                onChange={(option) => handleFilterChange('format', option?.value || 'all')}
                isDisabled={isExporting}
              />
            </FormItem>
          )}
          
          {/* Additional Options */}
          {type === 'products' && (
            <FormItem>
              <Checkbox
                checked={filters.includeInventory}
                onChange={(checked) => handleFilterChange('includeInventory', checked)}
                disabled={isExporting}
              >
                Include Inventory Details
              </Checkbox>
            </FormItem>
          )}
        </div>
        
        <div className="flex justify-between items-center mt-6 pt-4 border-t">
          <Button
            variant="plain"
            onClick={clearAllFilters}
            disabled={isExporting}
          >
            Clear All
          </Button>
          
          <div className="flex gap-2">
            <Button
              variant="plain"
              onClick={onClose}
              disabled={isExporting}
            >
              Cancel
            </Button>
            <Button
              variant="solid"
              icon={<HiOutlineDownload />}
              loading={isExporting}
              onClick={handleExport}
            >
              Export to Excel
            </Button>
          </div>
        </div>
      </FormContainer>
    </Dialog>
  );
};

export default ExcelExportModal;