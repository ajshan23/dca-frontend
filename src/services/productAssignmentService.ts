import ApiService from './ApiService'

interface Assignment {
    id: number
    productId: number
    employeeId: number
    assignedBy: number
    assignedDate: string
    returnedDate?: string
    status: 'assigned' | 'returned' | 'lost' | 'damaged'
    condition?: 'excellent' | 'good' | 'fair' | 'poor'
    notes?: string
}

export const apiGetActiveAssignments = async () => {
    return ApiService.fetchData({
        url: '/product-assignments/list',
        method: 'get',
        params: { status: 'active' }
    })
}

export const apiGetProductAssignmentHistory = async (params?: {
    productId?: string
    status?: string
    fromDate?: string
    toDate?: string
}) => {
    return ApiService.fetchData({
        url: '/product-assignments/list',
        method: 'get',
        params
    })
}

export const apiAssignProduct = async (data: {
    productId: number
    employeeId: number
    notes?: string
}) => {
    return ApiService.fetchData({
        url: '/product-assignments/assign',
        method: 'post',
        data
    })
}

export const apiBulkAssignProducts = async (data: {
    employeeId: number
    productIds: number[]
}) => {
    return ApiService.fetchData({
        url: '/product-assignments/assign/bulk',
        method: 'post',
        data
    })
}

export const apiReturnProduct = async (assignmentId: string, data?: {
    condition?: string
    notes?: string
}) => {
    return ApiService.fetchData({
        url: `/product-assignments/return/${assignmentId}`,
        method: 'post',
        data
    })
}

export const apiUpdateAssignment = async (assignmentId: string, data: Partial<Assignment>) => {
    return ApiService.fetchData({
        url: `/product-assignments/${assignmentId}`,
        method: 'put',
        data
    })
}
