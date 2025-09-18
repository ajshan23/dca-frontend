import { useState, useMemo, useRef } from 'react';
import DataTable from '@/components/shared/DataTable';
import { HiOutlineEye, HiOutlineRefresh, HiOutlineQrcode, HiOutlineTrash } from 'react-icons/hi';
import { useNavigate } from 'react-router-dom';
import type { DataTableResetHandle, ColumnDef } from '@/components/shared/DataTable';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import debounce from 'lodash/debounce';
import Input from '@/components/ui/Input';
import { 
  apiGetActiveAssignments, 
  apiReturnProduct, 
  apiGenerateAssignmentQrCode, 
  apiDeleteAssignment 
} from '@/services/ProductService';
import { Button, Dialog, Notification, toast, Select } from '@/components/ui';
import { HiOutlineCheckCircle } from 'react-icons/hi';
import { MdAssignmentReturn } from 'react-icons/md';

interface Assignment {
  id: number;
  assignedAt: string;
  expectedReturnAt?: string;
  status: string;
  returnedAt?: string;
  condition?: string;
  notes?: string;
  isOverdue?: boolean;
  daysOverdue?: number;
  product: {
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
  };
  inventory: {
    id: number;
    serialNumber?: string;
    condition: string;
  };
  employee: {
    id: number;
    name: string;
    empId: string;
  };
  assignedBy: {
    id: number;
    username: string;
  };
}

const AssignmentListTable = () => {
  const tableRef = useRef<DataTableResetHandle>(null);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  // State management
  const [searchTerm, setSearchTerm] = useState('');
  const [pagination, setPagination] = useState({ page: 1, limit: 10 });
  const [overdueFilter, setOverdueFilter] = useState(false);
  const [returnDialog, setReturnDialog] = useState({
    open: false,
    assignment: null as { id: number; productName: string; inventoryInfo: string } | null,
    condition: 'GOOD' as 'EXCELLENT' | 'GOOD' | 'FAIR' | 'POOR',
    inventoryStatus: 'AVAILABLE' as 'AVAILABLE' | 'DAMAGED' | 'MAINTENANCE'
  });

  const [deleteDialog, setDeleteDialog] = useState({
    open: false,
    assignment: null as { id: number; productName: string; employeeName: string } | null
  });

  // Data fetching
  const { 
    data: assignmentsResponse, 
    isLoading, 
    error,
    refetch
  } = useQuery({
    queryKey: ['active-assignments', pagination, searchTerm, overdueFilter],
    queryFn: () => apiGetActiveAssignments({
      page: pagination.page,
      limit: pagination.limit,
      search: searchTerm,
      overdue: overdueFilter,
    }),
  });

  // Mutations
  const returnMutation = useMutation({
    mutationFn: (data: { assignmentId: number, condition?: string, notes?: string, inventoryStatus?: string }) => 
      apiReturnProduct(data.assignmentId, {
        condition: data.condition,
        notes: data.notes,
        inventoryStatus: data.inventoryStatus as 'AVAILABLE' | 'DAMAGED' | 'MAINTENANCE'
      }),
    onSuccess: () => {
      showNotification('Product returned successfully', 'success');
      queryClient.invalidateQueries(['active-assignments']);
      resetReturnDialog();
    },
    onError: (error: any) => {
      showNotification(error.response?.data?.message || 'Failed to return product', 'danger');
    }
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: apiDeleteAssignment,
    onSuccess: () => {
      showNotification('Assignment deleted successfully', 'success');
      queryClient.invalidateQueries(['active-assignments']);
      setDeleteDialog({ open: false, assignment: null });
    },
    onError: (error: any) => {
      showNotification(error.response?.data?.message || 'Failed to delete assignment', 'danger');
    }
  });

  // QR Code generation mutation
  const { mutate: generateAssignmentQr, isPending: isGeneratingAssignmentQr } = useMutation({
    mutationFn: async (assignmentId: number) => {
      const response = await apiGenerateAssignmentQrCode(assignmentId);
      if (!response.data?.qrCode) {
        throw new Error('Invalid QR code data received from server');
      }
      return {
        qrCode: response.data.qrCode,
        assignmentInfo: response.data.assignmentInfo
      };
    },
    onSuccess: (data) => {
      handlePrintAssignmentQrCode(data.qrCode, data.assignmentInfo);
    },
    onError: (error: Error) => {
      toast.push(
        <Notification title="Error" type="danger">
          {error.message || 'Failed to generate assignment QR code'}
        </Notification>
      );
    }
  });

  // Helper functions
  const showNotification = (message: string, type: 'success' | 'danger') => {
    toast.push(<Notification title={type === 'success' ? 'Success' : 'Error'} type={type}>{message}</Notification>);
  };

  const debouncedSearch = useMemo(
    () => debounce((value: string) => {
      setSearchTerm(value);
      setPagination(prev => ({ ...prev, page: 1 }));
    }, 500),
    []
  );

  const resetReturnDialog = () => {
    setReturnDialog({
      open: false,
      assignment: null,
      condition: 'GOOD',
      inventoryStatus: 'AVAILABLE'
    });
  };

  const handleReturnClick = (assignment: Assignment) => {
    setReturnDialog({
      ...returnDialog,
      open: true,
      assignment: {
        id: assignment.id,
        productName: assignment.product.name,
        inventoryInfo: assignment.inventory.serialNumber || `Item #${assignment.inventory.id}`
      }
    });
  };

  const handleDeleteClick = (assignment: Assignment) => {
    setDeleteDialog({
      open: true,
      assignment: {
        id: assignment.id,
        productName: assignment.product.name,
        employeeName: assignment.employee.name
      }
    });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteDialog.assignment?.id) return;
    
    await deleteMutation.mutateAsync(deleteDialog.assignment.id);
  };

  const handleReturnSubmit = async () => {
    if (!returnDialog.assignment?.id) {
      showNotification('No valid assignment selected', 'danger');
      return;
    }
    
    await returnMutation.mutateAsync({
      assignmentId: returnDialog.assignment.id,
      condition: returnDialog.condition,
      inventoryStatus: returnDialog.inventoryStatus,
      notes: `Returned in ${returnDialog.condition.toLowerCase()} condition. Inventory status: ${returnDialog.inventoryStatus.toLowerCase()}`
    });
  };

  const handlePrintAssignmentQrCode = (qrCodeData: string, assignmentInfo: any) => {
    const printWindow = window.open('', '_blank', 'width=600,height=700');
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Assignment QR Code - ${assignmentInfo.productName}</title>
            <style>
              body { 
                font-family: Arial, sans-serif;
                text-align: center;
                padding: 20px;
              }
              .qr-container {
                margin: 20px auto;
                width: 300px;
                height: 300px;
              }
              .assignment-info {
                margin-bottom: 20px;
                text-align: left;
              }
              .info-row {
                margin-bottom: 8px;
              }
              img { width: 100%; height: auto; }
            </style>
          </head>
          <body>
            <div class="qr-container">
              <img src="${qrCodeData}" alt="Assignment QR Code" />
            </div>
         
          </body>
        </html>
      `);
      printWindow.document.close();
    }
  };

  const getStatusBadge = (assignment: Assignment) => {
    if (assignment.isOverdue) {
      return <div className="w-fit text-white">Overdue ({assignment.daysOverdue} days)</div>;
    }
    return <div className="w-fit text-white">Assigned</div>;
  };

  const columns: ColumnDef<Assignment>[] = useMemo(() => [
    {
      header: 'Product',
      cell: (props) => (
        <div>
          <span className="font-semibold block">{props.row.original.product.name}</span>
          <span className="text-xs text-gray-500">{props.row.original.product.model}</span>
        </div>
      ),
    },
    {
      header: 'Inventory Item',
      cell: (props) => (
        <div>
          <span className="block">{props.row.original.inventory.serialNumber || `Item #${props.row.original.inventory.id}`}</span>
          <div className="text-xs text-gray-700 mt-1">
            {props.row.original.inventory.condition}
          </div>
        </div>
      ),
    },
    {
      header: 'Category',
      cell: (props) => props.row.original.product.category.name,
    },
    {
      header: 'Branch',
      cell: (props) => props.row.original.product.branch.name,
    },
    {
      header: 'Assigned To',
      cell: (props) => (
        <div>
          <span className="block">{props.row.original.employee.name}</span>
          <span className="text-xs text-gray-500">{props.row.original.employee.empId}</span>
        </div>
      ),
    },
    {
      header: 'Assigned On',
      cell: (props) => new Date(props.row.original.assignedAt).toLocaleDateString(),
    },
    {
      header: 'Actions',
      id: 'action',
      cell: (props) => {
        const assignment = props.row.original;

        return (
          <div className="flex justify-end gap-2">
            <Button
              size="xs"
              icon={<HiOutlineEye />}
              onClick={() => navigate(`/assignments/${assignment.id}`)}
              title="View Product"
            />
            <Button
              size="xs"
              variant="twoTone"
              icon={<HiOutlineQrcode />}
              onClick={() => generateAssignmentQr(assignment.id)}
              loading={isGeneratingAssignmentQr}
              title="Generate QR Code"
            />
            <Button
              size="xs"
              variant="solid"
              icon={<MdAssignmentReturn />}
              onClick={() => handleReturnClick(assignment)}
            >
              Return
            </Button>
            <Button
              size="xs"
              variant="solid"
              color="red"
              icon={<HiOutlineTrash />}
              onClick={() => handleDeleteClick(assignment)}
              title="Delete Assignment"
            />
          </div>
        );
      },
    },
  ], [navigate, generateAssignmentQr, isGeneratingAssignmentQr]);

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
            placeholder="Search assignments..."
            onChange={(e) => debouncedSearch(e.target.value)}
            className="max-w-md"
          />
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="overdue-filter"
              checked={overdueFilter}
              onChange={(e) => setOverdueFilter(e.target.checked)}
              className="rounded"
            />
            <label htmlFor="overdue-filter" className="text-sm">
              Show overdue only
            </label>
          </div>
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
        data={assignmentsResponse?.data?.data || []}
        loading={isLoading}
        pagingData={{
          total: assignmentsResponse?.data?.pagination?.total || 0,
          pageIndex: pagination.page,
          pageSize: pagination.limit,
        }}
        onPaginationChange={(page) => setPagination(prev => ({ ...prev, page }))}
        onSelectChange={(limit) => setPagination({ page: 1, limit })}
      />

      {/* Return Product Dialog */}
      <Dialog
        isOpen={returnDialog.open}
        onClose={resetReturnDialog}
        onRequestClose={resetReturnDialog}
        width={500}
      >
        <h4 className="mb-4">Return Product</h4>
        {returnDialog.assignment && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Product</label>
              <p className="font-semibold">{returnDialog.assignment.productName}</p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Inventory Item</label>
              <p className="text-gray-600">{returnDialog.assignment.inventoryInfo}</p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Return Condition</label>
              <Select
                value={{ 
                  value: returnDialog.condition, 
                  label: returnDialog.condition.charAt(0).toUpperCase() + 
                         returnDialog.condition.slice(1).toLowerCase() 
                }}
                options={[
                  { value: 'EXCELLENT', label: 'Excellent' },
                  { value: 'GOOD', label: 'Good' },
                  { value: 'FAIR', label: 'Fair' },
                  { value: 'POOR', label: 'Poor' }
                ]}
                onChange={(option: any) => setReturnDialog({
                  ...returnDialog, 
                  condition: option.value
                })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Inventory Status After Return</label>
              <Select
                value={{ 
                  value: returnDialog.inventoryStatus, 
                  label: returnDialog.inventoryStatus.charAt(0).toUpperCase() + 
                         returnDialog.inventoryStatus.slice(1).toLowerCase() 
                }}
                options={[
                  { value: 'AVAILABLE', label: 'Available' },
                  { value: 'MAINTENANCE', label: 'Needs Maintenance' },
                  { value: 'DAMAGED', label: 'Damaged' }
                ]}
                onChange={(option: any) => setReturnDialog({
                  ...returnDialog, 
                  inventoryStatus: option.value
                })}
              />
              <p className="text-xs text-gray-500 mt-1">
                Choose the status for the inventory item after return
              </p>
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <Button
                variant="plain"
                onClick={resetReturnDialog}
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

      {/* Delete Confirmation Dialog */}
      <Dialog
        isOpen={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, assignment: null })}
        onRequestClose={() => setDeleteDialog({ open: false, assignment: null })}
        width={400}
      >
        <h4 className="mb-4">Delete Assignment</h4>
        {deleteDialog.assignment && (
          <div className="space-y-4">
            <p className="text-gray-600">
              Are you sure you want to delete this assignment?
            </p>
            <div className="bg-red-50 p-3 rounded-md">
              <p className="font-semibold text-red-700">
                {deleteDialog.assignment.productName}
              </p>
              <p className="text-red-600 text-sm">
                Assigned to: {deleteDialog.assignment.employeeName}
              </p>
            </div>
            <p className="text-sm text-gray-500">
              This action will return the inventory item to available stock and cannot be undone.
            </p>

            <div className="flex justify-end gap-2 mt-6">
              <Button
                variant="plain"
                onClick={() => setDeleteDialog({ open: false, assignment: null })}
              >
                Cancel
              </Button>
              <Button
                variant="solid"
                color="red"
                onClick={handleDeleteConfirm}
                loading={deleteMutation.isLoading}
                icon={<HiOutlineTrash />}
              >
                Delete Assignment
              </Button>
            </div>
          </div>
        )}
      </Dialog>
    </>
  );
};

export default AssignmentListTable;