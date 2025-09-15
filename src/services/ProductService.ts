import ApiService from './ApiService';

// Updated interfaces to match new backend structure
interface Product {
  id: number;
  name: string;
  model: string;
  categoryId: number;
  branchId: number;
  departmentId?: number;
  warrantyDuration?: number; // Changed from warrantyDate to warrantyDuration (months)
  complianceStatus: boolean;
  description?: string; // Changed from notes to description
  minStockLevel: number;
  createdAt: string;
  updatedAt: string;
  category?: { id: number; name: string };
  branch?: { id: number; name: string };
  department?: { id: number; name: string };
  inventory?: InventoryItem[];
  stockInfo?: StockInfo;
}

interface InventoryItem {
  id: number;
  serialNumber?: string;
  status: 'AVAILABLE' | 'ASSIGNED' | 'MAINTENANCE' | 'DAMAGED' | 'RETIRED';
  condition: 'NEW' | 'GOOD' | 'FAIR' | 'POOR' | 'DAMAGED';
  purchaseDate?: string;
  purchasePrice?: number;
  warrantyExpiry?: string;
  location?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

interface StockInfo {
  totalStock: number;
  availableStock: number;
  assignedStock: number;
  damagedStock: number;
  maintenanceStock: number;
  stockStatus: 'AVAILABLE' | 'LOW_STOCK' | 'OUT_OF_STOCK';
}

interface Assignment {
  id: number;
  productId: number;
  inventoryId: number; // New: specific inventory item
  employeeId: number;
  assignedById: number;
  assignedAt: string;
  returnedAt?: string;
  expectedReturnAt?: string;
  status: 'ASSIGNED' | 'RETURNED' | 'OVERDUE';
  returnCondition?: string;
  notes?: string;
  product?: Product;
  inventory?: InventoryItem;
  employee?: { id: number; name: string; empId: string };
  assignedBy?: { id: number; username: string };
}

// Product CRUD operations
export const apiGetProducts = async (params?: Record<string, any>) => {
  return ApiService.fetchData({
    url: '/products',
    method: 'get',
    params
  });
};

export const apiGetProductById = async (productId: number) => {
  return ApiService.fetchData({
    url: `/products/${productId}`,
    method: 'get'
  });
};

export const apiCreateProduct = async (data: {
  name: string;
  model: string;
  categoryId: number;
  branchId: number;
  departmentId?: number;
  warrantyDuration?: number;
  complianceStatus: boolean;
  description?: string;
  minStockLevel?: number;
  initialStock?: number;
  serialNumbers?: string[];
  purchaseDate?: string;
  purchasePrice?: number;
  location?: string;
}) => {
  return ApiService.fetchData({
    url: '/products',
    method: 'post',
    data
  });
};

export const apiUpdateProduct = async (productId: number, data: Partial<Product>) => {
  return ApiService.fetchData({
    url: `/products/${productId}`,
    method: 'put',
    data
  });
};

export const apiDeleteProduct = async (productId: number) => {
  return ApiService.fetchData({
    url: `/products/${productId}`,
    method: 'delete'
  });
};

// Stock management
export const apiAddStock = async (productId: number, data: {
  quantity?: number;
  serialNumbers?: string[];
  purchaseDate?: string;
  purchasePrice?: number;
  location?: string;
  condition?: string;
  reference?: string;
  reason?: string;
}) => {
  return ApiService.fetchData({
    url: `/products/${productId}/add-stock`,
    method: 'post',
    data
  });
};

export const apiGetAvailableInventory = async (productId: number) => {
  return ApiService.fetchData({
    url: `/products/${productId}/available-inventory`,
    method: 'get'
  });
};

export const apiUpdateInventoryItem = async (inventoryId: number, data: {
  status?: string;
  condition?: string;
  location?: string;
  notes?: string;
  serialNumber?: string;
  warrantyExpiry?: string;
  reason?: string;
}) => {
  return ApiService.fetchData({
    url: `/products/inventory/${inventoryId}`,
    method: 'put',
    data
  });
};

export const apiDeleteInventoryItem = async (inventoryId: number, data?: {
  reason?: string;
  permanent?: boolean;
}) => {
  return ApiService.fetchData({
    url: `/products/inventory/${inventoryId}`,
    method: 'delete',
    data
  });
};

// Assignment operations (updated for inventory-based assignments)
export const apiAssignProduct = async (data: {
  productId: number;
  employeeId: number;
  inventoryId?: number; // Optional - for specific inventory item
  expectedReturnAt?: string;
  notes?: string;
  autoSelect?: boolean; // Default true - auto-select available inventory
}) => {
  return ApiService.fetchData({
    url: '/product-assignments/assign',
    method: 'post',
    data: {
      autoSelect: true, // Default to auto-select unless specific inventory is chosen
      ...data
    }
  });
};

export const apiReturnProduct = async (assignmentId: number, data?: {
  condition?: string;
  notes?: string;
  inventoryStatus?: 'AVAILABLE' | 'DAMAGED' | 'MAINTENANCE';
}) => {
  return ApiService.fetchData({
    url: `/product-assignments/return/${assignmentId}`,
    method: 'post',
    data
  });
};

// Assignment queries
export const apiGetActiveAssignments = async (params?: {
  page?: number;
  limit?: number;
  search?: string;
  employeeId?: number;
  productId?: number;
  overdue?: boolean;
}) => {
  return ApiService.fetchData({
    url: '/product-assignments/active',
    method: 'get',
    params
  });
};

export const apiGetAssignmentHistory = async (params?: {
  page?: number;
  limit?: number;
  fromDate?: string;
  toDate?: string;
  employeeId?: number;
  productId?: number;
}) => {
  return ApiService.fetchData({
    url: '/product-assignments/history',
    method: 'get',
    params
  });
};

export const apiGetProductAssignments = async (productId: number) => {
  return ApiService.fetchData({
    url: `/product-assignments/product/${productId}`,
    method: 'get'
  });
};

export const apiGetEmployeeAssignments = async (employeeId: number, active = true) => {
  return ApiService.fetchData({
    url: `/product-assignments/employee/${employeeId}`,
    method: 'get',
    params: { active }
  });
};

export const apiUpdateAssignment = async (assignmentId: number, data: {
  expectedReturnAt?: string;
  notes?: string;
}) => {
  return ApiService.fetchData({
    url: `/product-assignments/${assignmentId}`,
    method: 'put',
    data
  });
};

// Analytics and reporting
export const apiGetAssignmentAnalytics = async (params?: {
  fromDate?: string;
  toDate?: string;
}) => {
  return ApiService.fetchData({
    url: '/product-assignments/analytics',
    method: 'get',
    params
  });
};

export const apiGetStockSummary = async () => {
  return ApiService.fetchData({
    url: '/products/stock-summary',
    method: 'get'
  });
};

export const apiGetStockTransactions = async (params?: {
  page?: number;
  limit?: number;
  productId?: number;
  inventoryId?: number;
  type?: string;
  fromDate?: string;
  toDate?: string;
}) => {
  return ApiService.fetchData({
    url: '/products/transactions/history',
    method: 'get',
    params
  });
};

// QR Code generation
export const apiGenerateProductQrCode = async (productId: number) => {
  const response = await ApiService.fetchData({
    url: `/products/${productId}/generate-qr`,
    method: 'post'
  });
  
  if (!response || !response.data?.qrCode) {
    throw new Error('Invalid response from server');
  }
  
  return response.data;
};

export const apiGenerateInventoryQrCode = async (inventoryId: number) => {
  const response = await ApiService.fetchData({
    url: `/products/inventory/${inventoryId}/generate-qr`,
    method: 'post'
  });
  
  if (!response || !response.data?.qrCode) {
    throw new Error('Invalid response from server');
  }
  
  return response.data;
};

// Legacy support - keep these for backward compatibility
export const apiGetAssignedProducts = async (params?: Record<string, any>) => {
  return ApiService.fetchData({
    url: '/products/assigned',
    method: 'get',
    params
  });
};

export const apiGenerateAssignmentQrCode = async (assignmentId: number) => {
    return ApiService.fetchData({
        url: `/product-assignments/${assignmentId}/qr-code`,
        method: 'get'
    })
}
export const apiExportProductsToExcel = async (params?: Record<string, any>) => {
  return ApiService.fetchData({
    url: '/products/export/excel',
    method: 'get',
    params,
    responseType: 'blob' // Important for file downloads
  });
};
export const apiExportAssignmentsToExcel = async (params?: Record<string, any>) => {
  return ApiService.fetchData({
    url: '/product-assignments/export/excel',
    method: 'get',
    params,
    responseType: 'blob' // Important for file downloads
  });
};
export default {
  apiGetProducts,
  apiGetProductById,
  apiCreateProduct,
  apiUpdateProduct,
  apiDeleteProduct,
  apiAddStock,
  apiGetAvailableInventory,
  apiUpdateInventoryItem,
  apiDeleteInventoryItem,
  apiAssignProduct,
  apiReturnProduct,
  apiGetActiveAssignments,
  apiGetAssignmentHistory,
  apiGetProductAssignments,
  apiGetEmployeeAssignments,
  apiUpdateAssignment,
  apiGetAssignmentAnalytics,
  apiGetStockSummary,
  apiGetStockTransactions,
  apiGenerateProductQrCode,
  apiGenerateInventoryQrCode,
  apiGetAssignedProducts,
  apiGenerateAssignmentQrCode
};