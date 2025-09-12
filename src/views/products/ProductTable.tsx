import { useState, useMemo, useRef } from 'react';
import DataTable from '@/components/shared/DataTable';
import { HiOutlineEye, HiOutlinePencil, HiOutlineUserAdd, HiOutlineRefresh, HiOutlinePlus } from 'react-icons/hi';
import useThemeClass from '@/utils/hooks/useThemeClass';
import { useNavigate } from 'react-router-dom';
import type { DataTableResetHandle, ColumnDef } from '@/components/shared/DataTable';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import debounce from 'lodash/debounce';
import Input from '@/components/ui/Input';
import { 
  apiGetProducts, 
  apiAssignProduct,
  apiReturnProduct,
  apiGetAvailableInventory,
  apiAddStock
} from '@/services/ProductService';
import { apiGetEmployees } from '@/services/EmployeeService.ts';
import type { ApiResponse } from '@/@types';
import Badge from '@/components/ui/Badge';
import { Button, Select, Dialog, Notification, toast, DatePicker, Card } from '@/components/ui';
import { HiOutlineCheckCircle } from 'react-icons/hi';
import { MdAssignmentReturn } from 'react-icons/md';
import { BiBox } from 'react-icons/bi';

interface StockInfo {
  totalStock: number;
  availableStock: number;
  assignedStock: number;
  damagedStock: number;
  maintenanceStock: number;
  stockStatus: 'AVAILABLE' | 'LOW_STOCK' | 'OUT_OF_STOCK';
}

interface Product {
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
  warrantyDuration?: number;
  complianceStatus: boolean;
  description?: string;
  minStockLevel: number;
  createdAt: string;
  stockInfo: StockInfo;
}

interface InventoryItem {
  id: number;
  serialNumber?: string;
  status: string;
  condition: string;
  product: {
    id: number;
    name: string;
    model: string;
  };
}

const ProductTable = () => {
  const tableRef = useRef<DataTableResetHandle>(null);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { textTheme } = useThemeClass();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
  });
  const [stockFilter, setStockFilter] = useState('');
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [returnDialogOpen, setReturnDialogOpen] = useState(false);
  const [addStockDialogOpen, setAddStockDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<{
    id: number;
    name: string;
  } | null>(null);
  const [selectedAssignment, setSelectedAssignment] = useState<{
    id: number;
    productName: string;
  } | null>(null);
  const [selectedEmployee, setSelectedEmployee] = useState<number | null>(null);
  const [expectedReturnDate, setExpectedReturnDate] = useState<Date | null>(null);
  const [notes, setNotes] = useState('');
  const [returnCondition, setReturnCondition] = useState<'EXCELLENT' | 'GOOD' | 'FAIR' | 'POOR'>('GOOD');
  const [availableInventory, setAvailableInventory] = useState<InventoryItem[]>([]);
  const [selectedInventoryId, setSelectedInventoryId] = useState<number | null>(null);
  const [stockQuantity, setStockQuantity] = useState(1);
  const [stockSerialNumbers, setStockSerialNumbers] = useState<string[]>(['']);

  const { 
    data: productsResponse, 
    isLoading, 
    error,
    refetch
  } = useQuery<ApiResponse<Product[]>>({
    queryKey: ['products', pagination, searchTerm, stockFilter],
    queryFn: () => apiGetProducts({
      page: pagination.page,
      limit: pagination.limit,
      search: searchTerm,
      stockStatus: stockFilter || undefined,
    }),
  });

  const { data: employeesResponse } = useQuery<ApiResponse<any>>({
    queryKey: ['employees-for-assignment'],
    queryFn: () => apiGetEmployees({ 
      page: 1, 
      limit: 100,
      status: 'active'
    })
  });

  const assignMutation = useMutation({
    mutationFn: apiAssignProduct,
    onSuccess: () => {
      toast.push(
        <Notification title="Success" type="success">
          Product assigned successfully
        </Notification>
      );
      queryClient.invalidateQueries(['products']);
      resetAssignmentForm();
    },
    onError: (error: any) => {
      toast.push(
        <Notification title="Error" type="danger">
          {error.response?.data?.message || 'Failed to assign product'}
        </Notification>
      );
    }
  });

  const returnMutation = useMutation({
    mutationFn: (data: {assignmentId: number, condition?: string, notes?: string}) => 
      apiReturnProduct(data.assignmentId, {
        condition: data.condition,
        notes: data.notes,
        inventoryStatus: data.condition === 'POOR' ? 'DAMAGED' : 'AVAILABLE'
      }),
    onSuccess: () => {
      toast.push(
        <Notification title="Success" type="success">
          Product returned successfully
        </Notification>
      );
      queryClient.invalidateQueries(['products']);
      resetReturnForm();
    },
    onError: (error: any) => {
      toast.push(
        <Notification title="Error" type="danger">
          {error.response?.data?.message || 'Failed to return product'}
        </Notification>
      );
    }
  });

  const addStockMutation = useMutation({
    mutationFn: (data: {productId: number, stockData: any}) => 
      apiAddStock(data.productId, data.stockData),
    onSuccess: (response) => {
      toast.push(
        <Notification title="Success" type="success">
          {response.data?.message || 'Stock added successfully'}
        </Notification>
      );
      queryClient.invalidateQueries(['products']);
      resetAddStockForm();
    },
    onError: (error: any) => {
      toast.push(
        <Notification title="Error" type="danger">
          {error.response?.data?.message || 'Failed to add stock'}
        </Notification>
      );
    }
  });

  const debouncedSearch = useMemo(
    () => debounce((value: string) => {
      setSearchTerm(value);
      setPagination(prev => ({ ...prev, page: 1 }));
    }, 500),
    []
  );

  const resetAssignmentForm = () => {
    setSelectedProduct(null);
    setSelectedEmployee(null);
    setSelectedInventoryId(null);
    setExpectedReturnDate(null);
    setNotes('');
    setAvailableInventory([]);
    setAssignDialogOpen(false);
  };

  const resetReturnForm = () => {
    setSelectedAssignment(null);
    setReturnCondition('GOOD');
    setReturnDialogOpen(false);
  };

  const resetAddStockForm = () => {
    setSelectedProduct(null);
    setStockQuantity(1);
    setStockSerialNumbers(['']);
    setAddStockDialogOpen(false);
  };

  const handleAssignClick = async (product: Product) => {
    setSelectedProduct({
      id: product.id,
      name: product.name
    });
    
    // Fetch available inventory for this product
    try {
      const inventoryResponse = await apiGetAvailableInventory(product.id);
      setAvailableInventory(inventoryResponse.data?.data || []);
    } catch (error) {
      console.error('Failed to fetch available inventory:', error);
      setAvailableInventory([]);
    }
    
    setAssignDialogOpen(true);
  };

  const handleAddStockClick = (product: Product) => {
    setSelectedProduct({
      id: product.id,
      name: product.name
    });
    setAddStockDialogOpen(true);
  };

  const handleReturnClick = (assignment: any) => {
    if (!assignment) return;
    
    setSelectedAssignment({
      id: assignment.id,
      productName: assignment.product?.name || 'Unknown Product'
    });
    setReturnDialogOpen(true);
  };

  const handleAssignSubmit = async () => {
    if (!selectedProduct || !selectedEmployee) return;
    
    await assignMutation.mutateAsync({
      productId: selectedProduct.id,
      employeeId: selectedEmployee,
      inventoryId: selectedInventoryId || undefined, // Specific inventory item if selected
      expectedReturnAt: expectedReturnDate?.toISOString(),
      notes,
      autoSelect: !selectedInventoryId // Auto-select if no specific inventory chosen
    });
  };

  const handleReturnSubmit = async () => {
    if (!selectedAssignment?.id) {
      toast.push(
        <Notification title="Error" type="danger">
          No valid assignment selected
        </Notification>
      );
      return;
    }
    
    await returnMutation.mutateAsync({
      assignmentId: selectedAssignment.id,
      condition: returnCondition,
      notes: `Returned in ${returnCondition.toLowerCase()} condition`
    });
  };

  const handleAddStockSubmit = async () => {
    if (!selectedProduct) return;
    
    const stockData = {
      quantity: stockQuantity,
      serialNumbers: stockSerialNumbers.filter(sn => sn.trim()),
      reason: 'Stock replenishment'
    };
    
    await addStockMutation.mutateAsync({
      productId: selectedProduct.id,
      stockData
    });
  };

  const employeeOptions = useMemo(() => {
    return employeesResponse?.data?.data?.map((emp: any) => ({
      value: emp.id,
      label: `${emp.name} (${emp.empId})`
    })) || [];
  }, [employeesResponse]);

  const inventoryOptions = useMemo(() => {
    return availableInventory.map((item: InventoryItem) => ({
      value: item.id,
      label: item.serialNumber || `Item #${item.id}`,
      extra: `${item.condition} condition`
    }));
  }, [availableInventory]);

  const stockFilterOptions = [
    { value: '', label: 'All Products' },
    { value: 'available', label: 'Available' },
    { value: 'low', label: 'Low Stock' },
    { value: 'out', label: 'Out of Stock' }
  ];

  const getStockBadge = (stockInfo: StockInfo) => {
    const { stockStatus, availableStock } = stockInfo;
    
    switch (stockStatus) {
      case 'OUT_OF_STOCK':
        return <div className="text-red-600 bg-red-50 px-2 py-1 rounded text-sm">Out of Stock</div>;
      case 'LOW_STOCK':
        return <div className="text-yellow-600 bg-yellow-50 px-2 py-1 rounded text-sm">Low Stock ({availableStock})</div>;
      default:
        return <div className="text-green-600 bg-green-50 px-2 py-1 rounded text-sm">Available ({availableStock})</div>;
    }
  };

  const columns: ColumnDef<Product>[] = useMemo(() => [
    {
      header: 'Product',
      accessorKey: 'name',
      cell: (props) => (
        <div>
          <span className="font-semibold">{props.row.original.name}</span>
          <div className="text-xs text-gray-500">{props.row.original.model}</div>
        </div>
      ),
    },
    {
      header: 'Category',
      cell: (props) => props.row.original.category?.name || '-',
    },
    {
      header: 'Branch',
      cell: (props) => props.row.original.branch?.name || '-',
    },
    {
      header: 'Stock Status',
      cell: (props) => {
        const stockInfo = props.row.original.stockInfo;
        return (
          <div>
            {getStockBadge(stockInfo)}
            <div className="text-xs text-gray-500 mt-1">
              Total: {stockInfo?.totalStock} | 
              Assigned: {stockInfo.assignedStock}
            </div>
          </div>
        );
      },
    },
    {
      header: 'Min Stock',
      cell: (props) => props.row.original.minStockLevel,
    },
    {
      header: 'Compliance',
      cell: (props) => (
        <div className={props.row.original.complianceStatus ? 'text-green-600 bg-green-50 px-2 py-1 rounded text-sm' : 'text-red-600 bg-red-50 px-2 py-1 rounded text-sm'}>
          {props.row.original.complianceStatus ? 'Compliant' : 'Non-compliant'}
        </div>
      ),
    },
    {
      header: 'Actions',
      id: 'action',
      cell: (props) => {
        const product = props.row.original;
        const hasAvailableStock = product.stockInfo.availableStock > 0;

        return (
          <div className="flex justify-end text-lg gap-2">
            <Button
              size="xs"
              icon={<HiOutlineEye />}
              onClick={() => navigate(`/products/view/${product.id}`)}
            />
            <Button
              size="xs"
              icon={<HiOutlinePencil />}
              onClick={() => navigate(`/products/edit/${product.id}`)}
            />
            <Button
              size="xs"
              icon={<HiOutlinePlus />}
              onClick={() => handleAddStockClick(product)}
              variant="twoTone"
            >
              Stock
            </Button>
            {hasAvailableStock ? (
              <Button
                size="xs"
                icon={<HiOutlineUserAdd />}
                onClick={() => handleAssignClick(product)}
                variant="solid"
              >
                Assign
              </Button>
            ) : (
              <Button
                size="xs"
                disabled
                variant="plain"
              >
                No Stock
              </Button>
            )}
          </div>
        );
      },
    },
  ], [navigate, textTheme]);

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <span className="text-red-500">
          Error: {error.message}
        </span>
      </div>
    );
  }

  return (
    <>
      <div className="flex justify-between items-center mb-4 gap-4">
        <div className="flex gap-4 flex-1">
          <Input
            placeholder="Search products..."
            onChange={(e) => debouncedSearch(e.target.value)}
            className="max-w-md"
          />
          <Select
            placeholder="Filter by stock"
            options={stockFilterOptions}
            value={stockFilter ? { value: stockFilter, label: stockFilterOptions.find(opt => opt.value === stockFilter)?.label } : null}
            onChange={(option: any) => setStockFilter(option?.value || '')}
            className="min-w-[200px]"
            isClearable
          />
        </div>
        <Button
          icon={<HiOutlineRefresh />}
          onClick={() => refetch()}
        >
          Refresh
        </Button>
      </div>

      <DataTable
        ref={tableRef}
        columns={columns}
        data={productsResponse?.data?.data || []}
        loading={isLoading}
        pagingData={{
          total: productsResponse?.data?.total || 0,
          pageIndex: pagination.page,
          pageSize: pagination.limit,
        }}
        onPaginationChange={(page) => setPagination(prev => ({ ...prev, page }))}
        onSelectChange={(limit) => setPagination({ page: 1, limit })}
      />

      {/* Assign Product Dialog */}
      <Dialog
        isOpen={assignDialogOpen}
        onClose={resetAssignmentForm}
        onRequestClose={resetAssignmentForm}
        width={500}
      >
        <h4 className="mb-4">Assign Product</h4>
        {selectedProduct && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Product</label>
              <p className="font-semibold">{selectedProduct.name}</p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Employee</label>
              <Select
                placeholder="Select Employee"
                options={employeeOptions}
                value={selectedEmployee ? 
                  { 
                    value: selectedEmployee, 
                    label: employeeOptions.find(e => e.value === selectedEmployee)?.label 
                  } : null}
                onChange={(option: any) => setSelectedEmployee(option?.value)}
              />
            </div>

            {availableInventory.length > 0 && (
              <div>
                <label className="block text-sm font-medium mb-1">
                  Specific Item (Optional - Auto-select if not chosen)
                </label>
                <Select
                  placeholder="Auto-select available item"
                  options={inventoryOptions}
                  value={selectedInventoryId ? 
                    { 
                      value: selectedInventoryId, 
                      label: inventoryOptions.find(i => i.value === selectedInventoryId)?.label 
                    } : null}
                  onChange={(option: any) => setSelectedInventoryId(option?.value)}
                  isClearable
                />
                <p className="text-xs text-gray-500 mt-1">
                  Leave empty to auto-assign the next available item (FIFO)
                </p>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium mb-1">Expected Return Date (Optional)</label>
              <DatePicker
                placeholder="Select date"
                value={expectedReturnDate}
                onChange={(date) => setExpectedReturnDate(date)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Notes (Optional)</label>
              <Input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Additional notes"
              />
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <Button
                variant="plain"
                onClick={resetAssignmentForm}
              >
                Cancel
              </Button>
              <Button
                variant="solid"
                onClick={handleAssignSubmit}
                loading={assignMutation.isLoading}
                disabled={!selectedEmployee}
              >
                Confirm Assignment
              </Button>
            </div>
          </div>
        )}
      </Dialog>

      {/* Add Stock Dialog - Fixed with proper scrolling */}
      <Dialog
        isOpen={addStockDialogOpen}
        onClose={resetAddStockForm}
        onRequestClose={resetAddStockForm}
        width={500}
      >
        <div className="max-h-[80vh] flex flex-col">
          <h4 className="mb-4 flex-shrink-0">Add Stock</h4>
          
          {selectedProduct && (
            <>
              {/* Scrollable content area */}
              <div className="flex-1 overflow-y-auto pr-2">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Product</label>
                    <p className="font-semibold">{selectedProduct.name}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Quantity</label>
                    <Input
                      type="number"
                      min="1"
                      max="100"
                      value={stockQuantity}
                      onChange={(e) => {
                        const qty = Number(e.target.value);
                        setStockQuantity(qty);
                        // Adjust serial numbers array to match quantity
                        const newSerialNumbers = Array.from({ length: qty }, (_, i) => 
                          stockSerialNumbers[i] || ''
                        );
                        setStockSerialNumbers(newSerialNumbers);
                      }}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Serial Numbers (Optional - {stockSerialNumbers.filter(sn => sn.trim()).length} of {stockQuantity} filled)
                    </label>
                    
                    {/* Show warning if many items */}
                    {stockQuantity > 10 && (
                      <div className="bg-yellow-50 border border-yellow-200 rounded p-2 mb-2">
                        <p className="text-sm text-yellow-700">
                          Large quantity detected. Consider using batch serial number format or leave empty for auto-generation.
                        </p>
                      </div>
                    )}
                    
                    {/* Container for serial inputs with its own scroll */}
                    <div 
                      className="max-h-60 overflow-y-auto border rounded p-3 bg-gray-50"
                      style={{ 
                        scrollbarWidth: 'thin',
                        scrollbarColor: '#cbd5e1 #f1f5f9'
                      }}
                    >
                      <div className="space-y-2">
                        {Array.from({ length: stockQuantity }, (_, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <span className="text-xs text-gray-500 w-8 flex-shrink-0">#{index + 1}</span>
                            <Input
                              type="text"
                              placeholder={`Serial number ${index + 1}`}
                              value={stockSerialNumbers[index] || ''}
                              onChange={(e) => {
                                const newSerialNumbers = [...stockSerialNumbers];
                                newSerialNumbers[index] = e.target.value;
                                setStockSerialNumbers(newSerialNumbers);
                              }}
                              className="flex-1"
                              size="sm"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      Leave empty for non-serialized items. Scroll within the box above for many items.
                    </p>
                  </div>
                </div>
              </div>

              {/* Fixed action buttons */}
              <div className="flex justify-end gap-2 mt-6 pt-4 border-t flex-shrink-0">
                <Button
                  variant="plain"
                  onClick={resetAddStockForm}
                >
                  Cancel
                </Button>
                <Button
                  variant="solid"
                  onClick={handleAddStockSubmit}
                  loading={addStockMutation.isLoading}
                  icon={<BiBox />}
                >
                  Add Stock
                </Button>
              </div>
            </>
          )}
        </div>
      </Dialog>

      {/* Return Product Dialog */}
      <Dialog
        isOpen={returnDialogOpen}
        onClose={resetReturnForm}
        onRequestClose={resetReturnForm}
        width={400}
      >
        <h4 className="mb-4">Return Product</h4>
        {selectedAssignment && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Product</label>
              <p className="font-semibold">{selectedAssignment.productName}</p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Condition</label>
              <Select
                value={{ value: returnCondition, label: returnCondition.charAt(0).toUpperCase() + returnCondition.slice(1).toLowerCase() }}
                options={[
                  { value: 'EXCELLENT', label: 'Excellent' },
                  { value: 'GOOD', label: 'Good' },
                  { value: 'FAIR', label: 'Fair' },
                  { value: 'POOR', label: 'Poor' }
                ]}
                onChange={(option: any) => setReturnCondition(option.value)}
              />
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <Button
                variant="plain"
                onClick={resetReturnForm}
              >
                Cancel
              </Button>
              <Button
                variant="solid"
                onClick={handleReturnSubmit}
                loading={returnMutation.isLoading}
                icon={<HiOutlineCheckCircle />}
              >
                Confirm Return
              </Button>
            </div>
          </div>
        )}
      </Dialog>
    </>
  );
};

export default ProductTable;