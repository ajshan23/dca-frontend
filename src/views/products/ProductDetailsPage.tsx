import { useParams } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import {
  apiGetProductById,
  apiGenerateProductQrCode,
  apiAddStock,
  apiUpdateInventoryItem,
  apiGenerateAssignmentQrCode,
  apiDeleteInventoryItem,
  apiBulkDeleteInventoryItems
} from '@/services/ProductService';
import {
  Button,
  Card,
  Notification,
  toast,
  Dialog,
  Input,
  Select,
  Checkbox
} from '@/components/ui';
import DataTable from '@/components/shared/DataTable';
import type { ColumnDef } from '@/components/shared/DataTable';
import { HiOutlineArrowLeft, HiOutlinePrinter, HiOutlinePlus, HiOutlinePencil, HiOutlineSearch, HiOutlineQrcode, HiOutlineTrash } from 'react-icons/hi';
import { useNavigate } from 'react-router-dom';
import { MdAssignment, MdInventory } from 'react-icons/md';
import { BiBox } from 'react-icons/bi';
import { ClipLoader } from 'react-spinners';
import { useState, useMemo } from 'react';

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
  assignments?: Assignment[];
}

interface Assignment {
  id: number;
  status: string;
  assignedAt: string;
  returnedAt?: string;
  expectedReturnAt?: string;
  returnCondition?: string;
  notes?: string;
  employee: {
    id: number;
    name: string;
    empId?: string;
  };
  assignedBy: {
    id: number;
    username: string;
  };
  inventory?: {
    id: number;
    serialNumber?: string;
    condition: string;
  };
}

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
  warrantyDuration?: number;
  complianceStatus: boolean;
  description?: string;
  minStockLevel: number;
  createdAt: string;
  updatedAt: string;
  inventory: InventoryItem[];
  assignments: Assignment[];
  stockStats: {
    totalStock: number;
    availableStock: number;
    assignedStock: number;
    damagedStock: number;
    maintenanceStock: number;
    retiredStock: number;
  };
}

const statusColorMap: Record<string, string> = {
  AVAILABLE: 'text-green-600 bg-transparent  w-fit',
  ASSIGNED: 'text-blue-600 bg-transparent  w-fit',
  MAINTENANCE: 'text-yellow-600 bg-transparent  w-fit',
  DAMAGED: 'text-red-600 bg-transparent  w-fit',
  RETIRED: 'text-gray-600 bg-transparent  w-fit'
};

const conditionColorMap: Record<string, string> = {
  NEW: 'text-green-600 bg-transparent  w-fit',
  GOOD: 'text-blue-600 bg-transparent  w-fit',
  FAIR: 'text-yellow-600 bg-transparent  w-fit',
  POOR: 'text-orange-600 bg-transparent  w-fit',
  DAMAGED: 'text-red-600 bg-transparent  w-fit'
};

const assignmentStatusColorMap: Record<string, string> = {
  ASSIGNED: 'text-blue-600 bg-transparent   w-fit',
  RETURNED: 'text-emerald-600 bg-transparent   w-fit',
  OVERDUE: 'text-red-600 bg-transparent  w-fit'
};

const ProductDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // Dialog states
  const [addStockDialog, setAddStockDialog] = useState(false);
  const [editInventoryDialog, setEditInventoryDialog] = useState(false);
  const [deleteInventoryDialog, setDeleteInventoryDialog] = useState(false);
  const [bulkDeleteDialog, setBulkDeleteDialog] = useState(false);
  const [selectedInventory, setSelectedInventory] = useState<InventoryItem | null>(null);
  const [selectedInventoryIds, setSelectedInventoryIds] = useState<number[]>([]);
  const [stockForm, setStockForm] = useState({
    quantity: 1,
    serialNumbers: [''],
    purchasePrice: '',
    location: ''
  });

  // Search state for inventory items
  const [inventorySearch, setInventorySearch] = useState('');

  const {
    data: productResponse,
    isLoading: isLoadingProduct,
    error: productError,
    refetch
  } = useQuery({
    queryKey: ['product', id],
    queryFn: () => apiGetProductById(Number(id)),
    enabled: !!id
  });

  const { mutate: generateQrCode, isPending: isGeneratingQr } = useMutation({
    mutationFn: async (productId: number) => {
      const response = await apiGenerateProductQrCode(productId);
      if (!response?.qrCode) {
        throw new Error('Invalid QR code data received from server');
      }
      return response.qrCode;
    },
    onSuccess: (qrCodeData) => {
      handlePrintQrCode(qrCodeData);
    },
    onError: (error: Error) => {
      toast.push(
        <Notification title="Error" type="danger">
          {error.message || 'Failed to generate QR code'}
        </Notification>
      );
    }
  });

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

  const { mutate: addStock, isPending: isAddingStock } = useMutation({
    mutationFn: (stockData: any) => apiAddStock(Number(id), stockData),
    onSuccess: (response) => {
      toast.push(
        <Notification title="Success" type="success">
          {response.data?.message || 'Stock added successfully'}
        </Notification>
      );
      refetch();
      setAddStockDialog(false);
      resetStockForm();
    },
    onError: (error: any) => {
      toast.push(
        <Notification title="Error" type="danger">
          {error.response?.data?.message || 'Failed to add stock'}
        </Notification>
      );
    }
  });

  const { mutate: updateInventory, isPending: isUpdatingInventory } = useMutation({
    mutationFn: (data: { inventoryId: number; updateData: any }) =>
      apiUpdateInventoryItem(data.inventoryId, data.updateData),
    onSuccess: (response) => {
      toast.push(
        <Notification title="Success" type="success">
          {response.data?.message || 'Inventory updated successfully'}
        </Notification>
      );
      refetch();
      setEditInventoryDialog(false);
      setSelectedInventory(null);
    },
    onError: (error: any) => {
      toast.push(
        <Notification title="Error" type="danger">
          {error.response?.data?.message || 'Failed to update inventory'}
        </Notification>
      );
    }
  });

  const { mutate: deleteInventory, isPending: isDeletingInventory } = useMutation({
    mutationFn: (inventoryId: number) => apiDeleteInventoryItem(inventoryId),
    onSuccess: (response) => {
      toast.push(
        <Notification title="Success" type="success">
          {response.data?.message || 'Inventory item deleted successfully'}
        </Notification>
      );
      refetch();
      setDeleteInventoryDialog(false);
      setSelectedInventory(null);
    },
    onError: (error: any) => {
      toast.push(
        <Notification title="Error" type="danger">
          {error.response?.data?.message || 'Failed to delete inventory item'}
        </Notification>
      );
    }
  });

  const { mutate: bulkDeleteInventory, isPending: isBulkDeletingInventory } = useMutation({
    mutationFn: (inventoryIds: number[]) => apiBulkDeleteInventoryItems({ inventoryIds }),
    onSuccess: (response) => {
      toast.push(
        <Notification title="Success" type="success">
          {response.data?.message || 'Selected inventory items deleted successfully'}
        </Notification>
      );
      refetch();
      setBulkDeleteDialog(false);
      setSelectedInventoryIds([]);
    },
    onError: (error: any) => {
      toast.push(
        <Notification title="Error" type="danger">
          {error.response?.data?.message || 'Failed to delete inventory items'}
        </Notification>
      );
    }
  });

  const handlePrintQrCode = (qrCodeData: string) => {
    const printWindow = window.open('', '_blank', 'width=600,height=600');
    if (printWindow && product) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Product QR Code - ${product.name}</title>
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
              .product-info {
                margin-bottom: 20px;
              }
              img { width: 100%; height: auto; }
            </style>
          </head>
          <body>
            
            <div class="qr-container">
              <img src="${qrCodeData}" alt="QR Code" />
            </div>
            
          </body>
        </html>
      `);
      printWindow.document.close();
    }
  };

  const handlePrintAssignmentQrCode = (qrCodeData: string, assignmentInfo: any) => {
    const printWindow = window.open('', '_blank', 'width=600,height=700');
    if (printWindow && product) {
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

  const resetStockForm = () => {
    setStockForm({
      quantity: 1,
      serialNumbers: [''],
      purchasePrice: '',
      location: ''
    });
  };

  const handleAddStockSubmit = () => {
    const stockData = {
      quantity: stockForm.quantity,
      serialNumbers: stockForm.serialNumbers.filter(sn => sn.trim()),
      purchasePrice: stockForm.purchasePrice ? Number(stockForm.purchasePrice) : undefined,
      location: stockForm.location.trim() || undefined,
      reason: 'Manual stock addition'
    };

    addStock(stockData);
  };

  const handleEditInventory = (item: InventoryItem) => {
    setSelectedInventory(item);
    setEditInventoryDialog(true);
  };

  const handleDeleteInventory = (item: InventoryItem) => {
    setSelectedInventory(item);
    setDeleteInventoryDialog(true);
  };

  const handleBulkDeleteInventory = () => {
    if (selectedInventoryIds.length === 0) {
      toast.push(
        <Notification title="Warning" type="warning">
          Please select at least one inventory item to delete
        </Notification>
      );
      return;
    }
    setBulkDeleteDialog(true);
  };

  const handleUpdateInventorySubmit = () => {
    if (!selectedInventory) return;

    updateInventory({
      inventoryId: selectedInventory.id,
      updateData: {
        status: selectedInventory.status,
        condition: selectedInventory.condition,
        location: selectedInventory.location,
        notes: selectedInventory.notes,
        serialNumber: selectedInventory.serialNumber,
        reason: 'Manual inventory update'
      }
    });
  };

  const handleDeleteInventorySubmit = () => {
    if (!selectedInventory) return;
    deleteInventory(selectedInventory.id);
  };

  const handleBulkDeleteSubmit = () => {
    if (selectedInventoryIds.length === 0) return;
    bulkDeleteInventory(selectedInventoryIds);
  };

  const handleSelectAllInventoryItems = (checked: boolean) => {
    if (!product?.inventory) return;

    if (checked) {
      // Select all non-assigned items
      const availableIds = product.inventory
        .filter(item => item.status !== 'ASSIGNED')
        .map(item => item.id);
      setSelectedInventoryIds(availableIds);
    } else {
      setSelectedInventoryIds([]);
    }
  };

  const handleSelectInventoryItem = (id: number, checked: boolean) => {
    if (checked) {
      setSelectedInventoryIds(prev => [...prev, id]);
    } else {
      setSelectedInventoryIds(prev => prev.filter(itemId => itemId !== id));
    }
  };

  // Extract product data from response structure
  const product = productResponse?.data?.data || productResponse?.data;

  // Filtered inventory data based on search
  const filteredInventoryData = useMemo(() => {
    if (!product?.inventory || !inventorySearch.trim()) {
      return product?.inventory || [];
    }

    const searchTerm = inventorySearch.toLowerCase().trim();

    return product.inventory.filter((item: InventoryItem) => {
      const serialNumber = item.serialNumber?.toLowerCase() || '';
      const itemId = `item #${item.id}`.toLowerCase();
      const status = item.status.toLowerCase();
      const condition = item.condition.toLowerCase();
      const location = item.location?.toLowerCase() || '';
      const notes = item.notes?.toLowerCase() || '';
      const purchaseDate = item.purchaseDate ? new Date(item.purchaseDate).toLocaleDateString().toLowerCase() : '';

      return (
        serialNumber.includes(searchTerm) ||
        itemId.includes(searchTerm) ||
        status.includes(searchTerm) ||
        condition.includes(searchTerm) ||
        location.includes(searchTerm) ||
        notes.includes(searchTerm) ||
        purchaseDate.includes(searchTerm)
      );
    });
  }, [product?.inventory, inventorySearch]);

  // Get selected items count
  const selectedItemsCount = selectedInventoryIds.length;

  // Table columns for inventory
  const inventoryColumns: ColumnDef<InventoryItem>[] = [
    {
      id: 'select',
      header: () => (
        <div className="flex items-center">
          <Checkbox
            checked={selectedItemsCount > 0 && selectedItemsCount === filteredInventoryData.filter(item => item.status !== 'ASSIGNED').length}
            indeterminate={selectedItemsCount > 0 && selectedItemsCount < filteredInventoryData.filter(item => item.status !== 'ASSIGNED').length}
            onChange={handleSelectAllInventoryItems}
            disabled={filteredInventoryData.filter(item => item.status !== 'ASSIGNED').length === 0}
          />
          {/* <span className="ml-2">Select</span> */}
        </div>
      ),
      cell: (props) => (
        <Checkbox
          checked={selectedInventoryIds.includes(props.row.original.id)}
          onChange={(checked) => handleSelectInventoryItem(props.row.original.id, checked)}
          disabled={props.row.original.status === 'ASSIGNED'}
        />
      ),
      width: 80,
    },
    {
      id: 'serialNumber',
      header: 'Serial Number',
      cell: (props) => props.row.original.serialNumber || `Item #${props.row.original.id}`,
    },
    {
      id: 'status',
      header: 'Status',
      cell: (props) => (
        <div className={statusColorMap[props.row.original.status] || ''}>
          {props.row.original.status}
        </div>
      ),
    },
    {
      id: 'condition',
      header: 'Condition',
      cell: (props) => (
        <div className={conditionColorMap[props.row.original.condition] || ''}>
          {props.row.original.condition}
        </div>
      ),
    },
    {
      id: 'purchaseDate',
      header: 'Purchase Date',
      cell: (props) => (
        props.row.original.purchaseDate
          ? new Date(props.row.original.purchaseDate).toLocaleDateString()
          : '-'
      ),
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: (props) => (
        <div className="flex space-x-1">
          <Button
            size="xs"
            icon={<HiOutlinePencil />}
            onClick={() => handleEditInventory(props.row.original)}
            disabled={props.row.original.status === 'ASSIGNED'}
            title="Edit"
          />
          <Button
            size="xs"
            icon={<HiOutlineTrash />}
            onClick={() => handleDeleteInventory(props.row.original)}
            disabled={props.row.original.status === 'ASSIGNED'}
            variant="solid"
            color="red"
            title="Delete"
          />
        </div>
      ),
    },
  ];

  // Table columns for assignments
  const assignmentColumns: ColumnDef<Assignment>[] = [
    {
      id: 'employee',
      header: 'Employee',
      cell: (props) => (
        <span>
          {props.row.original.employee?.name || 'Unknown'}
          {props.row.original.employee?.empId && ` (${props.row.original.employee.empId})`}
        </span>
      ),
    },
    {
      id: 'inventoryItem',
      header: 'Inventory Item',
      cell: (props) => (
        <span>
          {props.row.original.inventory?.serialNumber || `Item #${props.row.original.inventory?.id || 'N/A'}`}
        </span>
      ),
    },
    {
      id: 'assignedOn',
      header: 'Assigned On',
      cell: (props) => new Date(props.row.original.assignedAt).toLocaleDateString(),
    },
    {
      id: 'expectedReturn',
      header: 'Expected Return',
      cell: (props) => (
        props.row.original.expectedReturnAt
          ? new Date(props.row.original.expectedReturnAt).toLocaleDateString()
          : '-'
      ),
    },
    {
      id: 'returnedOn',
      header: 'Returned On',
      cell: (props) => (
        props.row.original.returnedAt
          ? new Date(props.row.original.returnedAt).toLocaleDateString()
          : '-'
      ),
    },
    {
      id: 'assignmentStatus',
      header: 'Status',
      cell: (props) => (
        <div className={assignmentStatusColorMap[props.row.original.status] || ''}>
          {props.row.original.status}
        </div>
      ),
    },
    {
      id: 'returnCondition',
      header: 'Return Condition',
      cell: (props) => (
        props.row.original.returnCondition ? (
          <div className={conditionColorMap[props.row.original.returnCondition] || ''}>
            {props.row.original.returnCondition}
          </div>
        ) : (
          <span>-</span>
        )
      ),
    },
    {
      id: 'assignedBy',
      header: 'Assigned By',
      cell: (props) => props.row.original.assignedBy?.username || 'Unknown',
    },
    {
      id: 'assignmentActions',
      header: 'Actions',
      cell: (props) => (
        <Button
          size="xs"
          icon={<HiOutlineQrcode />}
          onClick={() => generateAssignmentQr(props.row.original.id)}
          loading={isGeneratingAssignmentQr}
          title="Generate QR Code"
        />
      ),
    },
  ];

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

  if (!product) {
    return <div className="p-4 text-center">Product not found</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-start mb-4">
        <Button
          variant="plain"
          icon={<HiOutlineArrowLeft />}
          onClick={() => navigate(-1)}
        >
          Back to Products
        </Button>

        <div className="flex gap-2">
          <Button
            variant="twoTone"
            icon={<HiOutlinePlus />}
            onClick={() => setAddStockDialog(true)}
          >
            Add Stock
          </Button>

        </div>
      </div>

      {/* Product Basic Information */}
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
              {product.warrantyDuration && (
                <div>
                  <span className="font-semibold">Warranty Duration:</span>
                  <span className="ml-2">{product.warrantyDuration} months</span>
                </div>
              )}
              <div>
                <span className="font-semibold">Minimum Stock Level:</span>
                <span className="ml-2">{product.minStockLevel}</span>
              </div>
              <div>
                <span className="font-semibold">Created:</span>
                <span className="ml-2">{new Date(product.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          <div>
            <div className="flex items-center gap-4 mb-4">
              <div className={product.complianceStatus ? 'font-bold text-green-500' : 'font-bold text-red-500'}>
                {product.complianceStatus ? 'Compliant' : 'Non-compliant'}
              </div>
            </div>

            {/* Stock Statistics */}
            <div className=" p-4 rounded-lg mb-4">
              <h3 className="font-semibold mb-3">Stock Overview</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Total Stock:</span>
                  <span className="ml-2 font-semibold">{product.stockStats?.totalStock || 0}</span>
                </div>
                <div>
                  <span className="text-gray-600">Available:</span>
                  <span className="ml-2 font-semibold text-green-600">{product.stockStats?.availableStock || 0}</span>
                </div>
                <div>
                  <span className="text-gray-600">Assigned:</span>
                  <span className="ml-2 font-semibold text-blue-600">{product.stockStats?.assignedStock || 0}</span>
                </div>
                <div>
                  <span className="text-gray-600">Damaged:</span>
                  <span className="ml-2 font-semibold text-red-600">{product.stockStats?.damagedStock || 0}</span>
                </div>
                <div>
                  <span className="text-gray-600">Maintenance:</span>
                  <span className="ml-2 font-semibold text-yellow-600">{product.stockStats?.maintenanceStock || 0}</span>
                </div>
                <div>
                  <span className="text-gray-600">Retired:</span>
                  <span className="ml-2 font-semibold text-gray-600">{product.stockStats?.retiredStock || 0}</span>
                </div>
              </div>
            </div>

            <div className=" p-4 rounded-lg">
              <h3 className="font-semibold mb-2">Description</h3>
              <p className="text-gray-600 dark:text-gray-300">
                {product.description || 'No description available'}
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* Inventory Items */}
      <Card className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <MdInventory />
            <h3 className="text-xl font-semibold">Inventory Items</h3>
            {selectedItemsCount > 0 && (
              <span className="text-sm text-blue-600 bg-blue-100 px-2 py-1 rounded">
                {selectedItemsCount} item{selectedItemsCount !== 1 ? 's' : ''} selected
              </span>
            )}
          </div>
          <div className="flex gap-">
            {selectedItemsCount > 0 && (
              <Button
                variant="solid"
                color="red"
                icon={<HiOutlineTrash />}
                onClick={handleBulkDeleteInventory}
                disabled={selectedItemsCount === 0}
              >
                Delete Selected ({selectedItemsCount})
              </Button>
            )}
          </div>
        </div>

        {/* Search Input for Inventory */}
        <div className="mb-4 max-w-md">
          <Input
            placeholder="Search inventory items..."
            value={inventorySearch}
            onChange={(e) => setInventorySearch(e.target.value)}
            prefix={<HiOutlineSearch className="text-gray-400" />}
            clearButton
            onClear={() => setInventorySearch('')}
          />
        </div>

        {/* Search Results Info */}
        {inventorySearch.trim() && (
          <div className="mb-3 text-sm text-gray-600">
            Showing {filteredInventoryData.length} of {product.inventory?.length || 0} items
            {filteredInventoryData.length !== (product.inventory?.length || 0) && (
              <Button
                variant="plain"
                size="xs"
                className="ml-2"
                onClick={() => setInventorySearch('')}
              >
                Clear search
              </Button>
            )}
          </div>
        )}

        {!product.inventory || product.inventory.length === 0 ? (
          <div className="text-center py-8">
            <BiBox className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <p className="text-gray-500">No inventory items found for this product</p>
            <Button
              className="mt-4"
              variant="solid"
              icon={<HiOutlinePlus />}
              onClick={() => setAddStockDialog(true)}
            >
              Add First Stock
            </Button>
          </div>
        ) : filteredInventoryData.length === 0 ? (
          <div className="text-center py-8">
            <HiOutlineSearch className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <p className="text-gray-500">No inventory items match your search</p>
            <Button
              className="mt-4"
              variant="plain"
              onClick={() => setInventorySearch('')}
            >
              Clear search
            </Button>
          </div>
        ) : (
          <DataTable
            columns={inventoryColumns}
            data={filteredInventoryData}
            pagingData={{
              total: filteredInventoryData.length,
              pageIndex: 1,
              pageSize: filteredInventoryData.length,
            }}
          />
        )}
      </Card>

      {/* Assignment History */}
      <Card>
        <div className="flex items-center gap-2 mb-4">
          <MdAssignment />
          <h3 className="text-xl font-semibold">Assignment History</h3>
        </div>

        {!product.assignments || product.assignments.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">No assignments found for this product</p>
          </div>
        ) : (
          <DataTable
            columns={assignmentColumns}
            data={product.assignments}
            pagingData={{
              total: product.assignments.length,
              pageIndex: 1,
              pageSize: product.assignments.length,
            }}
          />
        )}
      </Card>

      {/* Add Stock Dialog */}
      <Dialog
        isOpen={addStockDialog}
        onClose={() => {
          setAddStockDialog(false);
          resetStockForm();
        }}
        onRequestClose={() => {
          setAddStockDialog(false);
          resetStockForm();
        }}
        width={500}
      >
        <div className="max-h-[80vh] flex flex-col">
          <h4 className="mb-4 flex-shrink-0">Add Stock</h4>

          {/* Scrollable content area */}
          <div className="flex-1 overflow-y-auto pr-2">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Product</label>
                <p className="font-semibold">{product.name}</p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Quantity</label>
                <Input
                  type="number"
                  min="1"
                  max="100"
                  value={stockForm.quantity}
                  onChange={(e) => {
                    const qty = Number(e.target.value);
                    setStockForm({
                      ...stockForm,
                      quantity: qty,
                      // Adjust serial numbers array to match quantity
                      serialNumbers: Array.from({ length: qty }, (_, i) =>
                        stockForm.serialNumbers[i] || ''
                      )
                    });
                  }}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Serial Numbers (Optional - {stockForm.serialNumbers.filter(sn => sn.trim()).length} of {stockForm.quantity} filled)
                </label>

                {/* Show warning if many items */}
                {stockForm.quantity > 10 && (
                  <div className="border border-yellow-200 rounded p-2 mb-2">
                    <p className="text-sm text-yellow-700">
                      Large quantity detected. Consider using batch serial number format or leave empty for auto-generation.
                    </p>
                  </div>
                )}

                {/* Container for serial inputs with its own scroll */}
                <div
                  className="max-h-60 overflow-y-auto border rounded p-3 "
                  style={{
                    scrollbarWidth: 'thin',
                    scrollbarColor: '#cbd5e1 #f1f5f9'
                  }}
                >
                  <div className="space-y-2">
                    {Array.from({ length: stockForm.quantity }, (_, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <span className="text-xs text-gray-500 w-8 flex-shrink-0">#{index + 1}</span>
                        <Input
                          type="text"
                          placeholder={`Serial number ${index + 1}`}
                          value={stockForm.serialNumbers[index] || ''}
                          onChange={(e) => {
                            const newSerialNumbers = [...stockForm.serialNumbers];
                            newSerialNumbers[index] = e.target.value;
                            setStockForm({ ...stockForm, serialNumbers: newSerialNumbers });
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
              onClick={() => {
                setAddStockDialog(false);
                resetStockForm();
              }}
            >
              Cancel
            </Button>
            <Button
              variant="solid"
              onClick={handleAddStockSubmit}
              loading={isAddingStock}
              icon={<BiBox />}
            >
              Add Stock
            </Button>
          </div>
        </div>
      </Dialog>

      {/* Edit Inventory Dialog */}
      <Dialog
        isOpen={editInventoryDialog}
        onClose={() => setEditInventoryDialog(false)}
        width={400}
      >
        <h4 className="mb-4">Edit Inventory Item</h4>
        {selectedInventory && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Serial Number</label>
              <Input
                type="text"
                value={selectedInventory.serialNumber || ''}
                onChange={(e) => setSelectedInventory({
                  ...selectedInventory,
                  serialNumber: e.target.value || null
                })}
                placeholder="Enter serial number"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Status</label>
              <Select
                value={{ value: selectedInventory.status, label: selectedInventory.status }}
                options={[
                  { value: 'AVAILABLE', label: 'Available' },
                  { value: 'MAINTENANCE', label: 'Maintenance' },
                  { value: 'DAMAGED', label: 'Damaged' },
                  { value: 'RETIRED', label: 'Retired' }
                ]}
                onChange={(option: any) => setSelectedInventory({
                  ...selectedInventory,
                  status: option.value
                })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Condition</label>
              <Select
                value={{ value: selectedInventory.condition, label: selectedInventory.condition }}
                options={[
                  { value: 'NEW', label: 'New' },
                  { value: 'GOOD', label: 'Good' },
                  { value: 'FAIR', label: 'Fair' },
                  { value: 'POOR', label: 'Poor' },
                  { value: 'DAMAGED', label: 'Damaged' }
                ]}
                onChange={(option: any) => setSelectedInventory({
                  ...selectedInventory,
                  condition: option.value
                })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Notes</label>
              <Input
                as="textarea"
                value={selectedInventory.notes || ''}
                onChange={(e) => setSelectedInventory({
                  ...selectedInventory,
                  notes: e.target.value
                })}
                placeholder="Additional notes"
                rows={3}
              />
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <Button
                variant="plain"
                onClick={() => setEditInventoryDialog(false)}
              >
                Cancel
              </Button>
              <Button
                variant="solid"
                onClick={handleUpdateInventorySubmit}
                loading={isUpdatingInventory}
              >
                Update
              </Button>
            </div>
          </div>
        )}
      </Dialog>

      {/* Delete Inventory Dialog */}
      <Dialog
        isOpen={deleteInventoryDialog}
        onClose={() => setDeleteInventoryDialog(false)}
        width={400}
      >
        <h4 className="mb-4">Delete Inventory Item</h4>
        {selectedInventory && (
          <div className="space-y-4">
            <p className="text-gray-600">
              Are you sure you want to delete this inventory item?
            </p>
            <div className="bg-gray-50 p-3 rounded">
              <p className="font-medium">
                {selectedInventory.serialNumber || `Item #${selectedInventory.id}`}
              </p>
              <p className="text-sm text-gray-500">
                Status: {selectedInventory.status} | Condition: {selectedInventory.condition}
              </p>
            </div>
            <p className="text-sm text-red-500">
              Warning: This action cannot be undone. Any assignment history associated with this item will be preserved.
            </p>

            <div className="flex justify-end gap-2 mt-6">
              <Button
                variant="plain"
                onClick={() => setDeleteInventoryDialog(false)}
              >
                Cancel
              </Button>
              <Button
                variant="solid"
                color="red"
                onClick={handleDeleteInventorySubmit}
                loading={isDeletingInventory}
                icon={<HiOutlineTrash />}
              >
                Delete
              </Button>
            </div>
          </div>
        )}
      </Dialog>

      {/* Bulk Delete Inventory Dialog */}
      <Dialog
        isOpen={bulkDeleteDialog}
        onClose={() => setBulkDeleteDialog(false)}
        width={500}
      >
        <h4 className="mb-4">Delete Selected Inventory Items</h4>
        <div className="space-y-4">
          <p className="text-gray-600">
            Are you sure you want to delete {selectedItemsCount} selected inventory item{selectedItemsCount !== 1 ? 's' : ''}?
          </p>

          {selectedItemsCount > 0 && (
            <div className="bg-gray-50 p-3 rounded max-h-40 overflow-y-auto">
              <p className="font-medium mb-2">Selected Items:</p>
              <ul className="text-sm text-gray-500 list-disc list-inside">
                {filteredInventoryData
                  .filter(item => selectedInventoryIds.includes(item.id))
                  .slice(0, 10) // Show only first 10 to avoid overflow
                  .map(item => (
                    <li key={item.id}>
                      {item.serialNumber || `Item #${item.id}`} ({item.status})
                    </li>
                  ))
                }
                {selectedItemsCount > 10 && (
                  <li>...and {selectedItemsCount - 10} more</li>
                )}
              </ul>
            </div>
          )}

          <p className="text-sm text-red-500">
            Warning: This action cannot be undone. Any assignment history associated with these items will be preserved.
          </p>

          <div className="flex justify-end gap-2 mt-6">
            <Button
              variant="plain"
              onClick={() => setBulkDeleteDialog(false)}
            >
              Cancel
            </Button>
            <Button
              variant="solid"
              color="red"
              onClick={handleBulkDeleteSubmit}
              loading={isBulkDeletingInventory}
              icon={<HiOutlineTrash />}
            >
              Delete {selectedItemsCount} Item{selectedItemsCount !== 1 ? 's' : ''}
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
};

export default ProductDetailsPage;