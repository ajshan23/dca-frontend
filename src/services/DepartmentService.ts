import ApiService from './ApiService'

interface CreateDepartmentPayload {
    name: string
    description?: string
}

interface CreateDepartmentResponse {
    success: boolean
    message?: string
    data?: {
        id: string
        name: string
        description?: string
        createdAt: string
        updatedAt: string
    }
}

export const apiCreateDepartment = async (data: CreateDepartmentPayload): Promise<CreateDepartmentResponse> => {
    try {
        const response = await ApiService.fetchData<CreateDepartmentResponse>({
            url: '/departments',
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
            message: response.data.message || 'Failed to create department'
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
                message: error.message || 'Error creating department'
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
            return 'Department name already exists'
        case 500:
            return 'Internal server error'
        default:
            return 'Failed to create department'
    }
}

interface GetDepartmentsParams {
    page?: number
    limit?: number
    search?: string
}

export const apiGetDepartments = async (params: GetDepartmentsParams) => {
    return ApiService.fetchData({
        url: '/departments',
        method: 'get',
        params: {
            page: params.page,
            limit: params.limit,
            search: params.search
        }
    })
}

export const apiGetDepartment = async (id: string) => {
    return ApiService.fetchData({
        url: `/departments/${id}`,
        method: 'get'
    })
}

export const apiUpdateDepartment = async (id: string, data: any) => {
    return ApiService.fetchData({
        url: `/departments/${id}`,
        method: 'put',
        data
    })
}