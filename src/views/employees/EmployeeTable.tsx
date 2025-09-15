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
        keepPreviousData: true
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

    // Google-style pagination UI
    const total = data?.data?.total || 0
    const totalPages = Math.ceil(total / pagination.limit)

    const renderPagination = () => {
        if (totalPages <= 1) return null

        const pages = []
        const maxButtons = 5
        let start = Math.max(1, pagination.page - Math.floor(maxButtons / 2))
        let end = Math.min(totalPages, start + maxButtons - 1)

        if (end - start < maxButtons - 1) {
            start = Math.max(1, end - maxButtons + 1)
        }

        for (let i = start; i <= end; i++) {
            pages.push(
                <button
                    key={i}
                    className={`px-3 py-1 rounded-md border ${
                        i === pagination.page
                            ? 'bg-blue-500 text-white border-blue-500'
                            : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'
                    }`}
                    onClick={() => setPagination(prev => ({ ...prev, page: i }))}
                >
                    {i}
                </button>
            )
        }

        return (
            <div className="flex items-center gap-2 mt-4">
                <button
                    disabled={pagination.page === 1}
                    className="px-3 py-1 rounded-md border border-gray-300 bg-white text-gray-700 disabled:opacity-50"
                    onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                >
                    Prev
                </button>
                {pages}
                <button
                    disabled={pagination.page === totalPages}
                    className="px-3 py-1 rounded-md border border-gray-300 bg-white text-gray-700 disabled:opacity-50"
                    onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                >
                    Next
                </button>
            </div>
        )
    }

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
                onSelectChange={(limit) => setPagination({ page: 1, limit })}
            />

            {/* Google-like pagination */}
            {renderPagination()}
        </>
    )
}

export default EmployeeTable
