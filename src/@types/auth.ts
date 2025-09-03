export interface SignInResponse {
    success: boolean;
    data?: {
        token: string;
        user: {
            id: number;
            username: string;
            role: string;
            createdAt: string;
            updatedAt: string;
        };
    };
    message?: string;
}

// Keep other interfaces unchanged
export interface SignInCredential {
    userName: string;
    password: string;
}

export interface SignUpCredential {
    userName: string
    password: string
    email: string
}

export interface ForgotPassword {
    email: string
}

export interface ResetPassword {
    password: string
}



export interface SignUpResponse {
    success: boolean
    message?: string
}


export interface User {
    id: number
    username: string
    email: string
    role: string
    createdAt?: string
    updatedAt?: string
}

export interface CreateUserResponse {
    success: boolean
    data?: User
    message?: string
}