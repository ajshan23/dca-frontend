import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { apiGetProductById } from '@/services/ProductService';
import { Badge, Card, Notification, toast } from '@/components/ui';
import { HiOutlineArrowLeft } from 'react-icons/hi';
import { useNavigate } from 'react-router-dom';
import { ClipLoader } from 'react-spinners';

interface ProductDetails {
  id: number;
  name: string;
  model: string;
  category: {
    id: number;
    name: string;
  };
  branch: {
    id: number;
    name: string;
  };
  department?: {
    id: number;
    name: string;
  };
  warrantyDate?: string;
  complianceStatus: boolean;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  isAssigned?: boolean;
  currentAssignment?: {
    id: number;
    employee: {
      id: number;
      name: string;
      empId?: string;
    };
    assignedAt: string;
    expectedReturnAt?: string;
  } | null;
}

const ProductViewPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { 
    data: productData, 
    isLoading: isLoadingProduct,
    error: productError
  } = useQuery({
    queryKey: ['product', id],
    queryFn: () => apiGetProductById(Number(id)),
    enabled: !!id,
    select: (response) => ({
      ...response,
      data: {
        ...response.data,
        data: {
          ...response.data.data,
          isAssigned: response.data.data.currentAssignment !== null
        }
      }
    })
  });

  if (productError) {
    toast.push(
      <Notification title="Error" type="danger">
        {productError.message || 'Failed to load product details'}
      </Notification>
    );
  }

  if (isLoadingProduct) {
    return (
      <div className="flex items-center justify-center h-screen">
        <ClipLoader color="#3B82F6" size={40} />
      </div>
    );
  }

  if (!productData?.data?.data) {
    return <div className="p-4 text-center">Product not found</div>;
  }

  const product = productData.data.data;
  const isAssigned = product.isAssigned;
  const currentAssignment = product.currentAssignment;

  return (
    <div className="container mx-auto p-4">
      <div className="mb-4">
      
      </div>

      <Card className="mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h2 className="text-2xl font-bold mb-2">{product.name}</h2>
            <p className="text-gray-600 mb-4">{product.model}</p>
            
            <div className="space-y-3">
              <div>
                <span className="font-semibold">Category:</span> 
                <span className="ml-2">{product.category?.name || '-'}</span>
              </div>
              <div>
                <span className="font-semibold">Branch:</span> 
                <span className="ml-2">{product.branch?.name || '-'}</span>
              </div>
              {product.department && (
                <div>
                  <span className="font-semibold">Department:</span> 
                  <span className="ml-2">{product.department.name}</span>
                </div>
              )}
              {product.warrantyDate && (
                <div>
                  <span className="font-semibold">Warranty Until:</span> 
                  <span className="ml-2">
                    {new Date(product.warrantyDate).toLocaleDateString()}
                  </span>
                </div>
              )}
              <div>
                <span className="font-semibold">Created At:</span> 
                <span className="ml-2">
                  {new Date(product.createdAt).toLocaleDateString()}
                </span>
              </div>
              <div>
                <span className="font-semibold">Last Updated:</span> 
                <span className="ml-2">
                  {new Date(product.updatedAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>

          <div>
            <div className="flex items-center gap-4 mb-4">
              <Badge className={isAssigned ? 'text-white bg-blue-500' : 'text-white bg-emerald-500'}>
                {isAssigned ? 'Assigned' : 'Available'}
              </Badge>
              <Badge className={product.complianceStatus ? 'text-white bg-green-500' : 'text-white bg-red-500'}>
                {product.complianceStatus ? 'Compliant' : 'Non-compliant'}
              </Badge>
            </div>

            {isAssigned && currentAssignment && (
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg mb-4">
                <h3 className="font-semibold mb-2">Currently Assigned To</h3>
                <p className="text-gray-800 dark:text-gray-200">
                  {currentAssignment.employee.name}
                  {currentAssignment.employee.empId && ` (${currentAssignment.employee.empId})`}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Assigned on: {new Date(currentAssignment.assignedAt).toLocaleDateString()}
                </p>
                {currentAssignment.expectedReturnAt && (
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Expected return: {new Date(currentAssignment.expectedReturnAt).toLocaleDateString()}
                  </p>
                )}
              </div>
            )}

            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
              <h3 className="font-semibold mb-2">Notes</h3>
              <p className="text-gray-600 dark:text-gray-300">
                {product.notes || 'No notes available'}
              </p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default ProductViewPage;