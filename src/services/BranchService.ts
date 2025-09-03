import ApiService from './ApiService'

interface CreateBranchPayload {
    name: string
}

interface CreateBranchResponse {
    success: boolean
    message?: string
    data?: {
        id: string
        name: string
        createdAt: string
        updatedAt: string
    }
}

export const apiCreateBranch = async (data: CreateBranchPayload): Promise<CreateBranchResponse> => {
    try {
        const response = await ApiService.fetchData<CreateBranchResponse>({
            url: '/branches',
            method: 'post',
            data
        })
        
        if (response.status === 201) {
            return {
                success: true,
                data: response.data.data
            }
        }
        
        return {
            success: false,
            message: response.data.message || 'Failed to create branch'
        }
    } catch (error: any) {
        if (error.response) {
            return {
                success: false,
                message: error.response.data?.message || 
                         getDefaultErrorMessage(error.response.status)
            }
        } else if (error.request) {
            return {
                success: false,
                message: 'No response received from server'
            }
        } else {
            return {
                success: false,
                message: error.message || 'Error creating branch'
            }
        }
    }
}

function getDefaultErrorMessage(statusCode: number): string {
    switch (statusCode) {
        case 400:
            return 'Invalid request data'
        case 401:
            return 'Authentication required'
        case 403:
            return 'Permission denied'
        case 409:
            return 'Branch name already exists'
        case 500:
            return 'Internal server error'
        default:
            return 'Failed to create branch'
    }
}

interface GetBranchesParams {
    page?: number
    limit?: number
    search?: string
}

export const apiGetBranches = async (params: GetBranchesParams) => {
    return ApiService.fetchData({
        url: '/branches',
        method: 'get',
        params: {
            page: params.page,
            limit: params.limit,
            search: params.search
        }
    })
}

export const apiGetBranch = async (id: string) => {
    return ApiService.fetchData({
        url: `/branches/${id}`,
        method: 'get'
    })
}

export const apiUpdateBranch = async (id: string, data: any) => {
    return ApiService.fetchData({
        url: `/branches/${id}`,
        method: 'put',
        data
    })
}