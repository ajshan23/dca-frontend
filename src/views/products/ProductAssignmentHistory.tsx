import { useState, useMemo, useRef } from 'react'
import DataTable from '@/components/shared/DataTable'
import { HiOutlineEye, HiOutlineSearch } from 'react-icons/hi'
import useThemeClass from '@/utils/hooks/useThemeClass'
import { useQuery } from '@tanstack/react-query'
import { apiGetProductAssignmentHistory } from '@/services/ProductAssignmentService'
import type { DataTableResetHandle, ColumnDef } from '@/components/shared/DataTable'
import Badge from '@/components/ui/Badge'
import dayjs from 'dayjs'
import { Input, Select } from '@/components/ui'
import { useParams } from 'react-router-dom'

interface Assignment {
    id: number
    product: {
        id: number
        name: string
        serialNumber: string
    }
    employee: {
        id: number
        name: string
        empId: string
    }
    assignedDate: string
    returnedDate?: string
    assignedBy: {
        id: number
        username: string
    }
    notes?: string
    status: string
    condition?: string
}

const ProductAssignmentHistory = () => {
    const tableRef = useRef<DataTableResetHandle>(null)
    const { textTheme } = useThemeClass()
    const { productId } = useParams()
    const [statusFilter, setStatusFilter] = useState<string>('')
    const [dateRange, setDateRange] = useState<{ start?: string, end?: string }>({})

    const { data, isLoading, error } = useQuery<ApiResponse<Assignment[]>>({
        queryKey: ['product-assignment-history', productId, statusFilter, dateRange],
        queryFn: () => apiGetProductAssignmentHistory({
            productId: productId,
            status: statusFilter,
            fromDate: dateRange.start,
            toDate: dateRange.end
        })
    })

    const columns: ColumnDef<Assignment>[] = useMemo(() => [
        {
            header: 'Product',
            accessorKey: 'product',
            cell: (props) => (
                <div>
                    <span className="font-semibold">{props.row.original.product.name}</span>
                    <div className="text-xs text-gray-500">
                        SN: {props.row.original.product.serialNumber}
                    </div>
                </div>
            ),
        },
        {
            header: 'Employee',
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
            header: 'Dates',
            cell: (props) => (
                <div>
                    <div>Assigned: {dayjs(props.row.original.assignedDate).format('DD/MM/YYYY')}</div>
                    {props.row.original.returnedDate && (
                        <div>Returned: {dayjs(props.row.original.returnedDate).format('DD/MM/YYYY')}</div>
                    )}
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
            header: 'Condition',
            accessorKey: 'condition',
            cell: (props) => props.row.original.condition || '-',
        },
        {
            header: 'Actions',
            id: 'action',
            cell: (props) => (
                <span
                    className={`cursor-pointer p-2 hover:${textTheme}`}
                    onClick={() => {/* View details */}}
                >
                    <HiOutlineEye className="text-xl" />
                </span>
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
        <div className="space-y-4">
            <div className="flex flex-col md:flex-row md:items-center gap-4">
                <h3>{productId ? 'Product Assignment History' : 'All Assignments History'}</h3>
                
                <div className="flex-1 flex flex-col md:flex-row gap-2">
                    <Input
                        placeholder="Search..."
                        prefix={<HiOutlineSearch className="text-lg" />}
                        className="max-w-md"
                    />
                    
                    <Select
                        placeholder="Filter by Status"
                        options={[
                            { value: '', label: 'All Statuses' },
                            { value: 'assigned', label: 'Assigned' },
                            { value: 'returned', label: 'Returned' },
                            { value: 'lost', label: 'Lost' },
                            { value: 'damaged', label: 'Damaged' }
                        ]}
                        value={statusFilter}
                        onChange={(val) => setStatusFilter(val as string)}
                        className="min-w-[150px]"
                    />
                    
                    <div className="flex gap-2">
                        <Input
                            type="date"
                            placeholder="From Date"
                            value={dateRange.start}
                            onChange={(e) => setDateRange({...dateRange, start: e.target.value})}
                        />
                        <Input
                            type="date"
                            placeholder="To Date"
                            value={dateRange.end}
                            onChange={(e) => setDateRange({...dateRange, end: e.target.value})}
                        />
                    </div>
                </div>
            </div>

            <DataTable
                ref={tableRef}
                columns={columns}
                data={data?.data || []}
                loading={isLoading}
            />
        </div>
    )
}

export default ProductAssignmentHistory