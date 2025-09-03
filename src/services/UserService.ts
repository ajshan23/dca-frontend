import ApiService from './ApiService'

interface CreateUserPayload {
    username: string
    password: string
    role: string
}

interface CreateUserResponse {
    success: boolean
    message?: string
    data?: {
        id: string
        username: string
        role: string
        createdAt: string
        updatedAt: string
    }
}

export const apiCreateUser = async (data: CreateUserPayload): Promise<CreateUserResponse> => {
    try {
        const response = await ApiService.fetchData<CreateUserResponse>({
            url: '/auth/register',
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
            message: response.data.message || 'Failed to create user'
        }
    } catch (error: any) {
        if (error.response) {
            // The request was made and the server responded with a status code
            // that falls out of the range of 2xx
            return {
                success: false,
                message: error.response.data?.message || 
                         getDefaultErrorMessage(error.response.status)
            }
        } else if (error.request) {
            // The request was made but no response was received
            return {
                success: false,
                message: 'No response received from server'
            }
        } else {
            // Something happened in setting up the request that triggered an Error
            return {
                success: false,
                message: error.message || 'Error creating user'
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
            return 'Username already exists'
        case 500:
            return 'Internal server error'
        default:
            return 'Failed to create user'
    }
}

interface GetUsersParams {
    page?: number
    limit?: number
    search?: string
}

export const apiGetUsers = async (params: GetUsersParams) => {
    return ApiService.fetchData({
        url: '/users',
        method: 'get',
        params: {
            page: params.page,
            limit: params.limit,
            search: params.search
        }
    })
}

export const apiGetUser = async (id: string) => {
    return ApiService.fetchData({
        url: `/users/${id}`,
        method: 'get'
    });
};

export const apiGetMe = async (id: string) => {
    return ApiService.fetchData({
        url: `/users/me`,
        method: 'get'
    });
};

export const apiUpdateUser = async (id: string, data: any) => {
    return ApiService.fetchData({
        url: `/auth/${id}`,
        method: 'put',
        data
    });
};