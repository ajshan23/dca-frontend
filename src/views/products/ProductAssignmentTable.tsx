import { useState, useMemo, useRef } from 'react'
import DataTable from '@/components/shared/DataTable'
import { HiOutlineArrowLeft, HiOutlineEye } from 'react-icons/hi'
import useThemeClass from '@/utils/hooks/useThemeClass'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiGetActiveAssignments, apiReturnProduct } from '@/services/ProductAssignmentService'
import type { DataTableResetHandle, ColumnDef } from '@/components/shared/DataTable'
import Badge from '@/components/ui/Badge'
import dayjs from 'dayjs'
import Button from '@/components/ui/Button'
import toast from '@/components/ui/toast'
import Notification from '@/components/ui/Notification'
import AssignProductForm from './AssignProductForm'

interface Assignment {
    id: number
    product: {
        id: number
        name: string
        serialNumber: string
        availableStock: number
        totalStock: number
    }
    employee: {
        id: number
        name: string
        empId: string
    }
    assignedDate: string
    assignedBy: {
        id: number
        username: string
    }
    notes?: string
    status: string
}

const ProductAssignmentTable = () => {
    const tableRef = useRef<DataTableResetHandle>(null)
    const { textTheme } = useThemeClass()
    const queryClient = useQueryClient()
    const [showAssignForm, setShowAssignForm] = useState(false)
    const [editingAssignment, setEditingAssignment] = useState<Assignment | null>(null)
    const [returningAssignment, setReturningAssignment] = useState<number | null>(null)

    const { data, isLoading, error, refetch } = useQuery<ApiResponse<Assignment[]>>({
        queryKey: ['product-assignments'],
        queryFn: apiGetActiveAssignments
    })

    const returnMutation = useMutation({
        mutationFn: (assignmentId: number) => apiReturnProduct(assignmentId.toString()),
        onSuccess: () => {
            toast.push(
                <Notification title="Success" type="success">
                    Product returned successfully
                </Notification>
            )
            queryClient.invalidateQueries(['product-assignments'])
            setReturningAssignment(null)
        },
        onError: (error: any) => {
            toast.push(
                <Notification title="Error" type="danger">
                    {error.response?.data?.message || 'Failed to return product'}
                </Notification>
            )
        }
    })

    const handleReturn = async (assignmentId: number) => {
        await returnMutation.mutateAsync(assignmentId)
    }

    const columns: ColumnDef<Assignment>[] = useMemo(() => [
        {
            header: 'Product',
            accessorKey: 'product',
            cell: (props) => (
                <div>
                    <span className="font-semibold">{props.row.original.product.name}</span>
                    <div className="text-xs text-gray-500">
                        SN: {props.row.original.product.serialNumber} | 
                        Stock: {props.row.original.product.availableStock}/{props.row.original.product.totalStock}
                    </div>
                </div>
            ),
        },
        {
            header: 'Assigned To',
            accessorKey: 'employee',
            cell: (props) => (
                <div>
                    <span className="font-semibold">{props.row.original.employee.name}</span>
                    <div className="text-xs text-gray-500">
                        ID: {props.row.original.employee.empId}
                    </div>
                </div>
            ),
        },
        {
            header: 'Assigned On',
            accessorKey: 'assignedDate',
            cell: (props) => (
                <div>
                    <span>{dayjs(props.row.original.assignedDate).format('DD/MM/YYYY')}</span>
                    <div className="text-xs text-gray-500">
                        by {props.row.original.assignedBy.username}
                    </div>
                </div>
            ),
        },
        {
            header: 'Status',
            accessorKey: 'status',
            cell: (props) => {
                const status = props.row.original.status
                const colorMap: Record<string, string> = {
                    assigned: 'bg-blue-500',
                    returned: 'bg-emerald-500',
                    lost: 'bg-red-500',
                    damaged: 'bg-amber-500'
                }
                return <Badge className={colorMap[status]}>{status}</Badge>
            },
        },
        {
            header: 'Actions',
            id: 'action',
            cell: (props) => (
                <div className="flex justify-end gap-2">
                    <span
                        className={`cursor-pointer p-2 hover:${textTheme}`}
                        onClick={() => setEditingAssignment(props.row.original)}
                    >
                        <HiOutlineEye className="text-xl" />
                    </span>
                    {props.row.original.status === 'assigned' && (
                        <span
                            className={`cursor-pointer p-2 hover:text-red-500`}
                            onClick={() => setReturningAssignment(props.row.original.id)}
                        >
                            <HiOutlineArrowLeft className="text-xl" />
                        </span>
                    )}
                </div>
            ),
        },
    ], [textTheme])

    if (error) {
        return (
            <div className="flex items-center justify-center h-full">
                <span className="text-red-500">
                    Error: {error.message}
                </span>
            </div>
        )
    }

    return (
        <>
            {showAssignForm ? (
                <AssignProductForm
                    onSubmit={async (values) => {
                        // Handle form submission
                        setShowAssignForm(false)
                    }}
                    onCancel={() => setShowAssignForm(false)}
                />
            ) : editingAssignment ? (
                <AssignProductForm
                    initialValues={{
                        ...editingAssignment,
                        productId: editingAssignment.product.id,
                        employeeId: editingAssignment.employee.id
                    }}
                    onSubmit={async (values) => {
                        // Handle update
                        setEditingAssignment(null)
                    }}
                    onCancel={() => setEditingAssignment(null)}
                />
            ) : returningAssignment ? (
                <div className="p-4 border rounded-lg bg-white shadow-sm">
                    <h4 className="mb-4">Confirm Return</h4>
                    <p className="mb-4">Are you sure you want to return this product?</p>
                    <div className="flex justify-end gap-2">
                        <Button
                            variant="plain"
                            onClick={() => setReturningAssignment(null)}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="solid"
                            color="red"
                            loading={returnMutation.isLoading}
                            onClick={() => handleReturn(returningAssignment)}
                        >
                            Confirm Return
                        </Button>
                    </div>
                </div>
            ) : (
                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <h3>Active Assignments</h3>
                        <Button
                            variant="solid"
                            size="sm"
                            onClick={() => setShowAssignForm(true)}
                        >
                            New Assignment
                        </Button>
                    </div>
                    <DataTable
                        ref={tableRef}
                        columns={columns}
                        data={data?.data || []}
                        loading={isLoading}
                    />
                </div>
            )}
        </>
    )
}

export default ProductAssignmentTable