import { apiSignIn, apiSignOut, apiSignUp } from '@/services/AuthService'
import {
    setUser,
    signInSuccess,
    signOutSuccess,
    useAppSelector,
    useAppDispatch,
} from '@/store'
import appConfig from '@/configs/app.config'
import { REDIRECT_URL_KEY } from '@/constants/app.constant'
import { useNavigate } from 'react-router-dom'
import useQuery from './useQuery'
import type { SignInCredential, SignUpCredential } from '@/@types/auth'

type Status = 'success' | 'failed'

function useAuth() {
    const dispatch = useAppDispatch()
    const navigate = useNavigate()
    const query = useQuery()
    const { token, signedIn } = useAppSelector((state) => state.auth.session)

    const signIn = async (
        values: SignInCredential,
    ): Promise<{
        status: 'success' | 'failed';
        message: string;
    }> => {
        try {
            const resp = await apiSignIn(values);
            
            console.log('Login response:', {
                success: resp.success,
                hasToken: !!resp.data?.token,
                hasUser: !!resp.data?.user
            });
    
            if (resp.success === true && resp.data?.token) {
                const { token, user } = resp.data;
          
                
                // Dispatch actions
                dispatch(signInSuccess(token));
                dispatch(
                    setUser({
                        avatar: '',
                        userName: user.username,
                        authority: [user.role],
                        email: '',
                    })
                );
                
                // Redirect
                const redirectUrl = query.get(REDIRECT_URL_KEY);
                navigate(redirectUrl || appConfig.authenticatedEntryPath);
                
                return {
                    status: 'success',
                    message: 'Login successful',
                };
            }
            
            return {
                status: 'failed',
                message: resp.message || 'Login failed: Invalid credentials',
            };
        } catch (error: any) {
            console.error('Login error:', error);
            return {
                status: 'failed',
                message: error.response?.data?.message || error.message || 'Login failed',
            };
        }
    };

    const signUp = async (values: SignUpCredential) => {
        try {
            const resp = await apiSignUp(values)
            if (resp?.success) {
                const redirectUrl = query.get(REDIRECT_URL_KEY)
                navigate(
                    redirectUrl ? redirectUrl : appConfig.unAuthenticatedEntryPath
                )
                return {
                    status: 'success',
                    message: resp.message || 'Sign up successful',
                }
            }
            return {
                status: 'failed',
                message: resp?.message || 'Sign up failed',
            }
        } catch (errors: any) {
            return {
                status: 'failed',
                message: errors?.response?.data?.message || errors.toString(),
            }
        }
    }

    const handleSignOut = () => {
        dispatch(signOutSuccess())
        dispatch(
            setUser({
                avatar: '',
                userName: '',
                email: '',
                authority: [],
            }),
        )
        navigate(appConfig.unAuthenticatedEntryPath)
    }

    const signOut = async () => {
        await apiSignOut()
        handleSignOut()
    }

    return {
        authenticated: token && signedIn,
        signIn,
        signUp,
        signOut,
    }
}

export default useAuth