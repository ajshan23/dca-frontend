import { useParams } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { 
  apiGetProductById,
  apiGenerateProductQrCode,
  apiAddStock,
  apiUpdateInventoryItem,
  apiGenerateAssignmentQrCode
} from '@/services/ProductService';
import { 
  Button, 
  Card, 
  Notification, 
  toast,
  Dialog,
  Input,
  Select
} from '@/components/ui';
import DataTable from '@/components/shared/DataTable';
import type { ColumnDef } from '@/components/shared/DataTable';
import { HiOutlineArrowLeft, HiOutlinePrinter, HiOutlinePlus, HiOutlinePencil, HiOutlineSearch, HiOutlineQrcode } from 'react-icons/hi';
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
  const [selectedInventory, setSelectedInventory] = useState<InventoryItem | null>(null);
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
            <h2>${product.name} QR Code</h2>
            <div class="product-info">
              <p><strong>Model:</strong> ${product.model}</p>
              <p><strong>ID:</strong> ${product.id}</p>
            </div>
            <div class="qr-container">
              <img src="${qrCodeData}" alt="QR Code" />
            </div>
            <script>
              setTimeout(() => { window.print(); window.close(); }, 300);
            </script>
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
            <h2>Assignment QR Code</h2>
            <div class="assignment-info">
              <div class="info-row"><strong>Product:</strong> ${assignmentInfo.productName}</div>
              <div class="info-row"><strong>Assigned To:</strong> ${assignmentInfo.employeeName}</div>
              <div class="info-row"><strong>Assigned On:</strong> ${new Date(assignmentInfo.assignedAt).toLocaleDateString()}</div>
              <div class="info-row"><strong>Status:</strong> ${assignmentInfo.status}</div>
              ${assignmentInfo.expectedReturnAt ? 
                `<div class="info-row"><strong>Expected Return:</strong> ${new Date(assignmentInfo.expectedReturnAt).toLocaleDateString()}</div>` : ''}
            </div>
            <div class="qr-container">
              <img src="${qrCodeData}" alt="Assignment QR Code" />
            </div>
            <script>
              setTimeout(() => { window.print(); window.close(); }, 300);
            </script>
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

  // Table columns for inventory
  const inventoryColumns: ColumnDef<InventoryItem>[] = [
    {
      header: 'Serial Number',
      cell: (props) => props.row.original.serialNumber || `Item #${props.row.original.id}`,
    },
    {
      header: 'Status',
      cell: (props) => (
        <div className={statusColorMap[props.row.original.status] || 'bg-gray-500'}>
          {props.row.original.status}
        </div>
      ),
    },
    {
      header: 'Condition',
      cell: (props) => (
        <div className={conditionColorMap[props.row.original.condition] || 'bg-gray-500 text-white'}>
          {props.row.original.condition}
        </div>
      ),
    },
    {
      header: 'Purchase Date',
      cell: (props) => (
        props.row.original.purchaseDate 
          ? new Date(props.row.original.purchaseDate).toLocaleDateString()
          : '-'
      ),
    },
    {
      header: 'Actions',
      cell: (props) => (
        <Button
          size="xs"
          icon={<HiOutlinePencil />}
          onClick={() => handleEditInventory(props.row.original)}
          disabled={props.row.original.status === 'ASSIGNED'}
        />
      ),
    },
  ];

  // Table columns for assignments
  const assignmentColumns: ColumnDef<Assignment>[] = [
    {
      header: 'Employee',
      cell: (props) => (
        <span>
          {props.row.original.employee?.name || 'Unknown'} 
          {props.row.original.employee?.empId && ` (${props.row.original.employee.empId})`}
        </span>
      ),
    },
    {
      header: 'Inventory Item',
      cell: (props) => (
        <span>
          {props.row.original.inventory?.serialNumber || `Item #${props.row.original.inventory?.id || 'N/A'}`}
        </span>
      ),
    },
    {
      header: 'Assigned On',
      cell: (props) => new Date(props.row.original.assignedAt).toLocaleDateString(),
    },
    {
      header: 'Expected Return',
      cell: (props) => (
        props.row.original.expectedReturnAt 
          ? new Date(props.row.original.expectedReturnAt).toLocaleDateString()
          : '-'
      ),
    },
    {
      header: 'Returned On',
      cell: (props) => (
        props.row.original.returnedAt 
          ? new Date(props.row.original.returnedAt).toLocaleDateString() 
          : '-'
      ),
    },
    {
      header: 'Status',
      cell: (props) => (
        <div className={assignmentStatusColorMap[props.row.original.status] || 'bg-gray-500'}>
          {props.row.original.status}
        </div>
      ),
    },
    {
      header: 'Return Condition',
      cell: (props) => (
        props.row.original.returnCondition ? (
          <div className={conditionColorMap[props.row.original.returnCondition] || 'bg-gray-500 text-white'}>
            {props.row.original.returnCondition}
          </div>
        ) : (
          <span>-</span>
        )
      ),
    },
    {
      header: 'Assigned By',
      cell: (props) => props.row.original.assignedBy?.username || 'Unknown',
    },
    {
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
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg mb-4">
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

            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
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
          />
        )}
      </Card>

      {/* Add Stock Dialog */}
      <Dialog
        isOpen={addStockDialog}
        onClose={() => setAddStockDialog(false)}
        width={500}
      >
        <h4 className="mb-4">Add Stock to {product.name}</h4>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Quantity</label>
            <Input
              type="number"
              min="1"
              max="100"
              value={stockForm.quantity}
              onChange={(e) => setStockForm({...stockForm, quantity: Number(e.target.value)})}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Purchase Price per Item (Optional)</label>
            <Input
              type="number"
              min="0"
              step="0.01"
              value={stockForm.purchasePrice}
              onChange={(e) => setStockForm({...stockForm, purchasePrice: e.target.value})}
              placeholder="0.00"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Serial Numbers (Optional - {stockForm.serialNumbers.length} of {stockForm.quantity})
            </label>
            {Array.from({ length: stockForm.quantity }, (_, index) => (
              <Input
                key={index}
                type="text"
                placeholder={`Serial number ${index + 1}`}
                value={stockForm.serialNumbers[index] || ''}
                onChange={(e) => {
                  const newSerialNumbers = [...stockForm.serialNumbers];
                  newSerialNumbers[index] = e.target.value;
                  setStockForm({...stockForm, serialNumbers: newSerialNumbers});
                }}
                className="mb-2"
              />
            ))}
          </div>

          <div className="flex justify-end gap-2 mt-6">
            <Button
              variant="plain"
              onClick={() => setAddStockDialog(false)}
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

      {/* Edit Inventory Dialog - Updated with Serial Number field */}
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
    </div>
  );
};

export default ProductDetailsPage;