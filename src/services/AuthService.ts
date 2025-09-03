import ApiService from './ApiService'
import type {
    SignInCredential,
    SignUpCredential,
    ForgotPassword,
    ResetPassword,
    SignInResponse,
    SignUpResponse,
} from '@/@types/auth'

export async function apiSignIn(data: SignInCredential): Promise<SignInResponse> {
    try {
        const response = await ApiService.fetchData({
            url: '/auth/login',
            method: 'post',
            data: {
                username: data.userName,
                password: data.password
            },
        });
        
        // Ensure response has the expected structure
        if (response.data && typeof response.data.success === 'boolean') {
            return {
                success: response.data.success,
                data: response.data.data,
                message: response.data.message || ''
            };
        }
        throw new Error('Invalid response structure from server');
    } catch (error) {
        console.error('Login API error:', error);
        throw error;
    }
}

export async function apiSignUp(data: SignUpCredential) {
    return ApiService.fetchData<SignUpResponse>({
        url: '/sign-up',
        method: 'post',
        data,
    })
}

export async function apiSignOut() {
    return ApiService.fetchData({
        url: '/sign-out',
        method: 'post',
    })
}

export async function apiForgotPassword(data: ForgotPassword) {
    return ApiService.fetchData({
        url: '/forgot-password',
        method: 'post',
        data,
    })
}

export async function apiResetPassword(data: ResetPassword) {
    return ApiService.fetchData({
        url: '/reset-password',
        method: 'post',
        data,
    })
}