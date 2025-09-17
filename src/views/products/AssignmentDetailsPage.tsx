import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiGetAssignmentById, apiGenerateAssignmentQrCode } from '@/services/ProductService';
import {
  Button,
  Card,
  Notification,
  toast,
} from '@/components/ui';
import { HiOutlineArrowLeft, HiOutlineCalendar, HiOutlineUser, HiOutlineCube, HiOutlineQrcode } from 'react-icons/hi';
import { ClipLoader } from 'react-spinners';
import { format, differenceInDays, isAfter, isBefore } from 'date-fns';
import { useEffect } from 'react';

interface AssignmentDetails {
  id: number;
  status: string;
  assignedAt: string;
  returnedAt?: string;
  expectedReturnAt?: string;
  returnCondition?: string;
  notes?: string;
  pcName?: string;
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
    empId?: string;
    department?: string;
    position?: string;
  };
  assignedBy: {
    id: number;
    username: string;
  };
}

const statusColorMap: Record<string, string> = {
  ASSIGNED: ' text-blue-800',
  RETURNED: ' text-green-800',
  OVERDUE: 'text-red-800'
};

const conditionColorMap: Record<string, string> = {
  NEW: 'text-green-800',
  GOOD: ' text-blue-800',
  FAIR: ' text-yellow-800',
  POOR: ' text-orange-800',
  DAMAGED: ' text-red-800'
};

const AssignmentDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const {
    data: assignmentResponse,
    isLoading,
    error
  } = useQuery({
    queryKey: ['assignment', id],
    queryFn: () => apiGetAssignmentById(Number(id)),
    enabled: !!id
  });

  useEffect(()=>{
    window.scrollTo(0,0)
  },[])

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

  const handlePrintAssignmentQrCode = (qrCodeData: string, assignmentInfo: any) => {
    const printWindow = window.open('', '_blank', 'width=600,height=700');
    if (printWindow && assignment) {
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

  const assignment = assignmentResponse?.data?.data || assignmentResponse?.data;

  if (error) {
    toast.push(
      <Notification title="Error" type="danger">
        {error.message || 'Failed to load assignment details'}
      </Notification>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <ClipLoader color="#3B82F6" size={40} />
      </div>
    );
  }

  if (!assignment) {
    return (
      <div className="container mx-auto p-4">
        <div className="text-center py-8">
          <p className="text-gray-500">Assignment not found</p>
          <Button
            className="mt-4"
            icon={<HiOutlineArrowLeft />}
            onClick={() => navigate(-1)}
          >
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  const assignedDate = new Date(assignment.assignedAt);
  const returnedDate = assignment.returnedAt ? new Date(assignment.returnedAt) : null;
  const expectedReturnDate = assignment.expectedReturnAt ? new Date(assignment.expectedReturnAt) : null;

  // Calculate duration
  const endDate = returnedDate || new Date();
  const durationDays = differenceInDays(endDate, assignedDate);

  // Check if overdue
  const isOverdue = expectedReturnDate && !returnedDate && isAfter(new Date(), expectedReturnDate);
  const wasOverdue = returnedDate && expectedReturnDate && isAfter(returnedDate, expectedReturnDate);

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-start mb-6">
        <Button
          variant="plain"
          icon={<HiOutlineArrowLeft />}
          onClick={() => navigate(-1)}
        >
          Back
        </Button>

        <div className="flex gap-2">
          <Button
            variant="solid"
            icon={<HiOutlineQrcode />}
            onClick={() => generateAssignmentQr(assignment.id)}
            loading={isGeneratingAssignmentQr}
          >
            Generate QR Code
          </Button>
        </div>
      </div>

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Assignment Details</h1>
        <div className="flex items-center gap-4">
          <div className={statusColorMap[assignment.status] || 'bg-gray-100 text-gray-800'}>
            {assignment.status}
          </div>
          {isOverdue && (
            <div className="bg-red-100 text-red-800">OVERDUE</div>
          )}
          {wasOverdue && (
            <div className="bg-orange-100 text-orange-800">WAS OVERDUE</div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Assignment Information */}
        <Card>
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <HiOutlineCalendar />
            Assignment Information
          </h2>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-900">Assignment ID</label>
                <p className="font-semibold">#{assignment.id}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">Status</label>
                <div className={statusColorMap[assignment.status] || 'bg-gray-100 text-gray-800'}>
                  {assignment.status}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-900">Assigned On</label>
                <p>{format(assignedDate, 'PPP')}</p>
                <p className="text-sm text-gray-500">{format(assignedDate, 'pp')}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900">
                  {returnedDate ? 'Returned On' : 'Duration'}
                </label>
                {returnedDate ? (
                  <>
                    <p>{format(returnedDate, 'PPP')}</p>
                    <p className="text-sm text-gray-500">{format(returnedDate, 'pp')}</p>
                  </>
                ) : (
                  <p>{durationDays} day{durationDays !== 1 ? 's' : ''}</p>
                )}
              </div>
            </div>

            {expectedReturnDate && (
              <div>
                <label className="block text-sm font-medium text-gray-500">Expected Return</label>
                <p>{format(expectedReturnDate, 'PPP')}</p>
                {!returnedDate && expectedReturnDate && (
                  <p className={`text-sm ${isOverdue ? 'text-red-600' : 'text-green-600'}`}>
                    {isOverdue ? `${differenceInDays(new Date(), expectedReturnDate)} days overdue` : 'On time'}
                  </p>
                )}
              </div>
            )}

            {assignment.pcName && (
              <div>
                <label className="block text-sm font-medium text-gray-900">PC Name</label>
                <p className="font-medium">{assignment.pcName}</p>
              </div>
            )}

            {assignment.notes && (
              <div>
                <label className="block text-sm font-medium text-gray-900">Notes</label>
                <p className="text-gray-700">{assignment.notes}</p>
              </div>
            )}

            {assignment.returnCondition && (
              <div>
                <label className="block text-sm font-medium text-gray-500">Return Condition</label>
                <div className={conditionColorMap[assignment.returnCondition] || 'bg-gray-100 text-gray-800'}>
                  {assignment.returnCondition}
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* Product Information */}
        <Card>
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <HiOutlineCube />
            Product Information
          </h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-900">Product Name</label>
              <p className="font-semibold">{assignment.product.name}</p>
              <p className="text-gray-600">{assignment.product.model}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-900">Category</label>
                <p>{assignment.product.category.name}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900">Branch</label>
                <p>{assignment.product.branch.name}</p>
              </div>
            </div>

            {assignment.inventory && (
              <div>
                <label className="block text-sm font-medium text-gray-900">Inventory Item</label>
                <p className="font-medium">
                  {assignment.inventory.serialNumber || `Item #${assignment.inventory.id}`}
                </p>
                <div className={conditionColorMap[assignment.inventory.condition] || 'bg-gray-100 text-gray-800'}>
                  {assignment.inventory.condition}
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* Employee Information */}
        <Card>
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <HiOutlineUser />
            Employee Information
          </h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-900">Employee Name</label>
              <p className="font-semibold">{assignment.employee.name}</p>
              {assignment.employee.empId && (
                <p className="text-gray-600">ID: {assignment.employee.empId}</p>
              )}
            </div>

            {(assignment.employee.department || assignment.employee.position) && (
              <div className="grid grid-cols-2 gap-4">
                {assignment.employee.department && (
                  <div>
                    <label className="block text-sm font-medium text-gray-900">Department</label>
                    <p>{assignment.employee.department}</p>
                  </div>
                )}
                {assignment.employee.position && (
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Position</label>
                    <p>{assignment.employee.position}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </Card>

        {/* Assignment History */}
        <Card>
          <h2 className="text-xl font-semibold mb-4">Assignment History</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-900">Assigned By</label>
              <p>{assignment.assignedBy.username}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-900">Assignment Date</label>
                <p>{format(assignedDate, 'PPP')}</p>
                <p className="text-sm text-gray-500">{format(assignedDate, 'pp')}</p>
              </div>
              {returnedDate && (
                <div>
                  <label className="block text-sm font-medium text-gray-900">Return Date</label>
                  <p>{format(returnedDate, 'PPP')}</p>
                  <p className="text-sm text-gray-500">{format(returnedDate, 'pp')}</p>
                </div>
              )}
            </div>

            {returnedDate && expectedReturnDate && (
              <div>
                <label className="block text-sm font-medium text-gray-900">Return Status</label>
                {wasOverdue ? (
                  <p className="text-orange-600">
                    Returned {differenceInDays(returnedDate, expectedReturnDate)} days late
                  </p>
                ) : (
                  <p className="text-green-600">Returned on time</p>
                )}
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default AssignmentDetailsPage;