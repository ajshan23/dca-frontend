import { useState, useMemo, useRef } from 'react'
import DataTable from '@/components/shared/DataTable'
import { HiOutlineEye, HiOutlinePencil } from 'react-icons/hi'
import useThemeClass from '@/utils/hooks/useThemeClass'
import { useNavigate } from 'react-router-dom'
import type { DataTableResetHandle, ColumnDef } from '@/components/shared/DataTable'
import { useQuery } from '@tanstack/react-query'
import debounce from 'lodash/debounce'
import Input from '@/components/ui/Input'
import { apiGetEmployees } from '@/services/EmployeeService.ts'
import type { ApiResponse } from '@/@types'

interface Employee {
    id: number
    empId: string
    name: string
    email?: string
    department?: string
    position?: string
    createdAt: string
    updatedAt: string
}

const EmployeeTable = () => {
    const tableRef = useRef<DataTableResetHandle>(null)
    const navigate = useNavigate()
    const [searchTerm, setSearchTerm] = useState('')
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 10,
    })

    const { data, isLoading, error } = useQuery<ApiResponse<{ 
        data: Employee[]
        total: number 
    }>>({
        queryKey: ['employees', pagination, searchTerm],
        queryFn: () => apiGetEmployees({
            page: pagination.page,
            limit: pagination.limit,
            search: searchTerm
        }),
    })

    const debouncedSearch = useMemo(
        () => debounce((value: string) => {
            setSearchTerm(value)
            setPagination(prev => ({ ...prev, page: 1 }))
        }, 500),
        []
    )

    const columns: ColumnDef<Employee>[] = useMemo(() => [
        {
            header: 'Employee ID',
            accessorKey: 'empId',
            cell: (props) => (
                <span className="font-semibold">{props.row.original.empId}</span>
            ),
        },
        {
            header: 'Name',
            accessorKey: 'name',
            cell: (props) => (
                <span>{props.row.original.name}</span>
            ),
        },
        {
            header: 'Department',
            accessorKey: 'department',
            cell: (props) => (
                <span>{props.row.original.department || '-'}</span>
            ),
        },
        {
            header: 'Position',
            accessorKey: 'position',
            cell: (props) => (
                <span>{props.row.original.position || '-'}</span>
            ),
        },
        {
            header: 'Created At',
            accessorKey: 'createdAt',
            cell: (props) => (
                <span>{new Date(props.row.original.createdAt).toLocaleDateString()}</span>
            ),
        },
        {
            header: 'Actions',
            id: 'action',
            cell: (props) => {
                const { textTheme } = useThemeClass()
                return (
                    <div className="flex justify-end text-lg">
                        <span
                            className={`cursor-pointer p-2 hover:${textTheme}`}
                            onClick={() => navigate(`/employees/view/${props.row.original.id}`)}
                        >
                            <HiOutlineEye />
                        </span>
                        <span
                            className={`cursor-pointer p-2 hover:${textTheme}`}
                            onClick={() => navigate(`/employees/edit/${props.row.original.id}`)}
                        >
                            <HiOutlinePencil />
                        </span>
                    </div>
                )
            },
        },
    ], [navigate])

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
            <div className="mb-4">
                <Input
                    placeholder="Search employees..."
                    onChange={(e) => debouncedSearch(e.target.value)}
                    className="max-w-md"
                />
            </div>
            
            <DataTable
                ref={tableRef}
                columns={columns}
                data={data?.data?.data || []}
                loading={isLoading}
                pagingData={{
                    total: data?.data?.total || 0,
                    pageIndex: pagination.page,
                    pageSize: pagination.limit,
                }}
                onPaginationChange={(page) => setPagination(prev => ({ ...prev, page }))}
                onSelectChange={(limit) => setPagination({ page: 1, limit })}
            />
        </>
    )
}

export default EmployeeTable