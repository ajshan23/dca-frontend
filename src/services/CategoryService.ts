import ApiService from './ApiService'

interface CreateCategoryPayload {
    name: string
    description?: string
}

interface CreateCategoryResponse {
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

export const apiCreateCategory = async (data: CreateCategoryPayload): Promise<CreateCategoryResponse> => {
    try {
        const response = await ApiService.fetchData<CreateCategoryResponse>({
            url: '/categories',
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
            message: response.data.message || 'Failed to create category'
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
                message: error.message || 'Error creating category'
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
            return 'Category name already exists'
        case 500:
            return 'Internal server error'
        default:
            return 'Failed to create category'
    }
}

interface GetCategoriesParams {
    page?: number
    limit?: number
    search?: string
}

export const apiGetCategories = async (params: GetCategoriesParams) => {
    return ApiService.fetchData({
        url: '/categories',
        method: 'get',
        params: {
            page: params.page,
            limit: params.limit,
            search: params.search
        }
    })
}

export const apiGetCategory = async (id: string) => {
    return ApiService.fetchData({
        url: `/categories/${id}`,
        method: 'get'
    })
}

export const apiUpdateCategory = async (id: string, data: any) => {
    return ApiService.fetchData({
        url: `/categories/${id}`,
        method: 'put',
        data
    })
}