import { useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { apiGetAssignmentDetail } from '@/services/ProductService'
import { Button, Loading } from '@/components/ui'
import { HiOutlineArrowLeft } from 'react-icons/hi'
import { useNavigate } from 'react-router-dom'
import { AdaptableCard } from '@/components/shared'
import Badge from '@/components/ui/Badge'

const ProductAssignmentDetail = () => {
    const { id } = useParams()
    const navigate = useNavigate()

    const { data: assignment, isLoading } = useQuery({
        queryKey: ['assignment', id],
        queryFn: () => apiGetAssignmentDetail(Number(id))
    })

    if (isLoading) {
        return <Loading />
    }

    if (!assignment) {
        return (
            <div className="flex items-center justify-center h-full">
                <span className="text-red-500">Assignment not found</span>
            </div>
        )
    }

    return (
        <AdaptableCard className="h-full" bodyClass="h-full">
            <div className="mb-4">
                <Button
                    icon={<HiOutlineArrowLeft />}
                    onClick={() => navigate(-1)}
                >
                    Back
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                    <h4>Assignment Details</h4>
                    <div className="space-y-2">
                        <p><strong>Status:</strong> 
                            <Badge className={
                                assignment.status === 'assigned' ? 'bg-blue-500' :
                                assignment.status === 'returned' ? 'bg-green-500' :
                                assignment.status === 'lost' ? 'bg-red-500' : 'bg-amber-500'
                            }>
                                {assignment.status}
                            </Badge>
                        </p>
                        <p><strong>Assigned On:</strong> {new Date(assignment.assignedAt).toLocaleString()}</p>
                        {assignment.returnedAt && (
                            <p><strong>Returned On:</strong> {new Date(assignment.returnedAt).toLocaleString()}</p>
                        )}
                        {assignment.expectedReturnAt && (
                            <p><strong>Expected Return:</strong> {new Date(assignment.expectedReturnAt).toLocaleString()}</p>
                        )}
                        {assignment.condition && (
                            <p><strong>Condition:</strong> 
                                <Badge className={
                                    assignment.condition === 'excellent' ? 'bg-green-500' :
                                    assignment.condition === 'good' ? 'bg-blue-500' :
                                    assignment.condition === 'fair' ? 'bg-yellow-500' : 'bg-red-500'
                                }>
                                    {assignment.condition}
                                </Badge>
                            </p>
                        )}
                        <p><strong>Quantity:</strong> {assignment.quantity}</p>
                        {assignment.notes && (
                            <p><strong>Notes:</strong> {assignment.notes}</p>
                        )}
                    </div>
                </div>

                <div className="space-y-4">
                    <h4>Product Information</h4>
                    <div className="space-y-2">
                        <p><strong>Name:</strong> {assignment.product.name}</p>
                        <p><strong>Model:</strong> {assignment.product.model}</p>
                        <p><strong>Serial Number:</strong> {assignment.product.serialNumber || 'N/A'}</p>
                        <p><strong>Category:</strong> {assignment.product.category.name}</p>
                        <p><strong>Current Stock:</strong> {assignment.product.availableStock}/{assignment.product.totalStock}</p>
                    </div>
                </div>

                <div className="space-y-4">
                    <h4>Employee Information</h4>
                    <div className="space-y-2">
                        <p><strong>Name:</strong> {assignment.employee.name}</p>
                        <p><strong>Employee ID:</strong> {assignment.employee.empId}</p>
                        <p><strong>Department:</strong> {assignment.employee.department || 'N/A'}</p>
                        <p><strong>Position:</strong> {assignment.employee.position || 'N/A'}</p>
                    </div>
                </div>

                <div className="space-y-4">
                    <h4>Assigned By</h4>
                    <div className="space-y-2">
                        <p><strong>Username:</strong> {assignment.assigner.username}</p>
                        <p><strong>Role:</strong> {assignment.assigner.role}</p>
                    </div>
                </div>
            </div>
        </AdaptableCard>
    )
}

export default ProductAssignmentDetail