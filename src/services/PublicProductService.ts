// services/PublicProductService.ts
import axios from 'axios';
import appConfig from '@/configs/app.config';

// Create a separate axios instance for public API calls (no auth required)
const PublicApiService = axios.create({
  timeout: 60000,
  baseURL: appConfig.apiPrefix,
});

// Interfaces for public assignment data
interface AssignmentInfo {
  id: number;
  assignedAt: string;
  returnedAt?: string;
  expectedReturnAt?: string;
  status: string;
  returnCondition?: string;
  notes?: string;
  isOverdue: boolean;
  daysOverdue: number;
}

interface EmployeeInfo {
  id: number;
  empId: string;
  name: string;
  email?: string;
  department?: string;
  position?: string;
  branch: string;
}

interface AssignedByInfo {
  id: number;
  username: string;
}

interface InventoryInfo {
  id: number;
  serialNumber?: string;
  status: string;
  condition: string;
  purchaseDate?: string;
  warrantyExpiry?: string;
  location?: string;
  notes?: string;
}

interface ProductInfo {
  id: number;
  name: string;
  model: string;
  category: string;
  branch: string;
  department: string;
  warrantyDuration?: number;
  minStockLevel: number;
  createdAt: string;
}

interface PublicAssignmentInfo {
  assignment: AssignmentInfo;
  employee: EmployeeInfo;
  assignedBy: AssignedByInfo;
  inventory: InventoryInfo;
  product: ProductInfo;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
}

// Public assignment API calls
export const apiGetPublicAssignmentInfo = async (assignmentId: number): Promise<ApiResponse<PublicAssignmentInfo>> => {
  try {
    const response = await PublicApiService.get(`/public/assignment/${assignmentId}`);
    return response.data;
  } catch (error: any) {
    throw new Error(error?.response?.data?.message || 'Failed to fetch assignment information');
  }
};

export default {
  apiGetPublicAssignmentInfo
};