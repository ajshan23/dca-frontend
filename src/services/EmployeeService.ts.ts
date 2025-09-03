import ApiService from './ApiService'

interface CreateEmployeePayload {
    empId: string
    name: string
    email?: string
    department?: string
    position?: string
}

interface CreateEmployeeResponse {
    success: boolean
    message?: string
    data?: {
        id: string
        empId: string
        name: string
        email?: string
        department?: string
        position?: string
        createdAt: string
        updatedAt: string
    }
}

export const apiCreateEmployee = async (data: CreateEmployeePayload): Promise<CreateEmployeeResponse> => {
    try {
        const response = await ApiService.fetchData<CreateEmployeeResponse>({
            url: '/employees',
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
            message: response.data.message || 'Failed to create employee'
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
                message: error.message || 'Error creating employee'
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
            return 'Employee ID already exists'
        case 500:
            return 'Internal server error'
        default:
            return 'Failed to create employee'
    }
}

interface GetEmployeesParams {
    page?: number
    limit?: number
    search?: string
}

export const apiGetEmployees = async (params: GetEmployeesParams) => {
    return ApiService.fetchData({
        url: '/employees',
        method: 'get',
        params: {
            page: params.page,
            limit: params.limit,
            search: params.search
        }
    })
}

export const apiGetEmployee = async (id: string) => {
    return ApiService.fetchData({
        url: `/employees/${id}`,
        method: 'get'
    })
}

export const apiUpdateEmployee = async (id: string, data: any) => {
    return ApiService.fetchData({
        url: `/employees/${id}`,
        method: 'put',
        data
    })
}