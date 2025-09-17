import { useState, useMemo, useRef, useEffect } from 'react'
import Avatar from '@/components/ui/Avatar'
import Badge from '@/components/ui/Badge'
import DataTable from '@/components/shared/DataTable'
import { HiOutlineEye, HiOutlinePencil } from 'react-icons/hi'
import { FiUser } from 'react-icons/fi'
import useThemeClass from '@/utils/hooks/useThemeClass'
import { useNavigate } from 'react-router-dom'
import type { DataTableResetHandle, ColumnDef } from '@/components/shared/DataTable'
import { useQuery } from '@tanstack/react-query'
import debounce from 'lodash/debounce'
import Input from '@/components/ui/Input'
import { apiGetUsers } from '@/services/UserService'
import type { ApiResponse } from '@/@types'

interface User {
    id: number
    username: string
    role: string
    createdAt: string
    updatedAt: string
}

interface CurrentUser {
    role: string
    name: string
    email: string
}

interface ApiResponseData {
    success: boolean
    data: User[]
    pagination: {
        total: number
        page: number
        limit: number
        totalPages: number
    }
}

const userRoleColor = {
    super_admin: {
        label: 'Super Admin',
        dotClass: 'bg-purple-500',
        textClass: 'text-purple-500',
    },
    admin: {
        label: 'Admin',
        dotClass: 'bg-blue-500',
        textClass: 'text-blue-500',
    },
    user: {
        label: 'User',
        dotClass: 'bg-gray-500',
        textClass: 'text-gray-500',
    }
}

const UserTable = () => {
    const tableRef = useRef<DataTableResetHandle>(null)
    const navigate = useNavigate()
    const [searchTerm, setSearchTerm] = useState('')
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 10,
    })
    const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null)

    // Get current user from localStorage on component mount
    useEffect(() => {
        const userData = localStorage.getItem('user')
        if (userData) {
            try {
                setCurrentUser(JSON.parse(userData))
            } catch (error) {
                console.error('Error parsing user data:', error)
            }
        }
    }, [])

    const { data, isLoading, error } = useQuery<ApiResponse<ApiResponseData>>({
        queryKey: ['users', pagination, searchTerm],
        queryFn: () => apiGetUsers({
            page: pagination.page,
            limit: pagination.limit,
            search: searchTerm
        }),
    })

    // Debug: log the data to see the API response structure
    useEffect(() => {
        console.log('Full API response:', data)
        console.log('Users data:', data?.data?.data)
        console.log('Pagination info:', data?.data?.pagination)
    }, [data])

    const debouncedSearch = useMemo(
        () => debounce((value: string) => {
            setSearchTerm(value)
            setPagination(prev => ({ ...prev, page: 1 }))
        }, 500),
        []
    )

    const columns: ColumnDef<User>[] = useMemo(() => [
        {
            header: 'Username',
            accessorKey: 'username',
            cell: (props) => (
                <div className="flex items-center">
                    <Avatar icon={<FiUser />} alt={props.row.original.username} />
                    <span className="ml-2 font-semibold">{props.row.original.username}</span>
                </div>
            ),
        },
        {
            header: 'Role',
            accessorKey: 'role',
            cell: (props) => {
                const role = props.row.original.role as keyof typeof userRoleColor
                const roleInfo = userRoleColor[role] || userRoleColor.user
                return (
                    <div className="flex items-center gap-2">
                        <Badge className={roleInfo.dotClass} />
                        <span className={`font-semibold ${roleInfo.textClass}`}>
                            {roleInfo.label}
                        </span>
                    </div>
                )
            },
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
                const user = props.row.original
                const isSuperAdmin = user.role === 'super_admin'
                const canEditSuperAdmin = currentUser?.role === 'super_admin'

                return (
                    <div className="flex justify-end text-lg">
                        <span
                            className={`cursor-pointer p-2 hover:${textTheme}`}
                            onClick={() => navigate(`/users/view/${user.id}`)}
                        >
                            <HiOutlineEye />
                        </span>
                        {/* Only show edit button if:
                            1. The user is not a super admin OR
                            2. The current user is a super admin */}
                        {(!isSuperAdmin || canEditSuperAdmin) && (
                            <span
                                className={`cursor-pointer p-2 hover:${textTheme}`}
                                onClick={() => navigate(`/users/edit/${user.id}`)}
                            >
                                <HiOutlinePencil />
                            </span>
                        )}
                    </div>
                )
            },
        },
    ], [navigate, currentUser])

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
    const usersData = data?.data?.data || []
    const totalCount = data?.data?.pagination?.total || 0

    return (
        <>
            <div className="mb-4">
                <Input
                    placeholder="Search users..."
                    onChange={(e) => debouncedSearch(e.target.value)}
                    className="max-w-md"
                />
            </div>
            
            <DataTable
                ref={tableRef}
                columns={columns}
                data={usersData}
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

export default UserTable