import { useState, useMemo, useRef, useEffect } from 'react'
import DataTable from '@/components/shared/DataTable'
import { HiOutlineEye, HiOutlinePencil } from 'react-icons/hi'
import useThemeClass from '@/utils/hooks/useThemeClass'
import { useNavigate } from 'react-router-dom'
import type { DataTableResetHandle, ColumnDef } from '@/components/shared/DataTable'
import { useQuery } from '@tanstack/react-query'
import debounce from 'lodash/debounce'
import Input from '@/components/ui/Input'
import { apiGetBranches } from '@/services/BranchService'
import type { ApiResponse } from '@/@types'

interface Branch {
    id: number
    name: string
    createdAt: string
    updatedAt: string
}

interface ApiResponseData {
    success: boolean
    data: Branch[]
    pagination: {
        total: number
        page: number
        limit: number
        totalPages: number
    }
}

const BranchTable = () => {
    const tableRef = useRef<DataTableResetHandle>(null)
    const navigate = useNavigate()
    const [searchTerm, setSearchTerm] = useState('')
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 10,
    })

    const { data, isLoading, error } = useQuery<ApiResponse<ApiResponseData>>({
        queryKey: ['branches', pagination, searchTerm],
        queryFn: () => apiGetBranches({
            page: pagination.page,
            limit: pagination.limit,
            search: searchTerm
        }),
        keepPreviousData: true
    })

    // Debug: log the data to see the API response structure
    useEffect(() => {
        console.log('Full API response:', data)
        console.log('Branches data:', data?.data?.data)
        console.log('Pagination info:', data?.data?.pagination)
    }, [data])

    const debouncedSearch = useMemo(
        () => debounce((value: string) => {
            setSearchTerm(value)
            setPagination(prev => ({ ...prev, page: 1 }))
        }, 500),
        []
    )

    const columns: ColumnDef<Branch>[] = useMemo(() => [
        {
            header: 'Branch Name',
            accessorKey: 'name',
            cell: (props) => (
                <span className="font-semibold">{props.row.original.name}</span>
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
                            onClick={() => navigate(`/branches/view/${props.row.original.id}`)}
                        >
                            <HiOutlineEye />
                        </span>
                        <span
                            className={`cursor-pointer p-2 hover:${textTheme}`}
                            onClick={() => navigate(`/branches/edit/${props.row.original.id}`)}
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

    // Extract data based on the backend response structure
    const branchesData = data?.data?.data || []
    const totalCount = data?.data?.pagination?.total || 0

    return (
        <>
            <div className="mb-4">
                <Input
                    placeholder="Search branches..."
                    onChange={(e) => debouncedSearch(e.target.value)}
                    className="max-w-md"
                />
            </div>
            
            <DataTable
                ref={tableRef}
                columns={columns}
                data={branchesData}
                loading={isLoading}
                pagingData={{
                    total: totalCount,
                    pageIndex: pagination.page,
                    pageSize: pagination.limit,
                }}
                onPaginationChange={(page) => setPagination(prev => ({ ...prev, page }))}
                onSelectChange={(limit) => setPagination({ page: 1, limit })}
            />
            
          
        </>
    )
}

export default BranchTable