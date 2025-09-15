import { FormContainer, FormItem } from '@/components/ui/Form'
import Button from '@/components/ui/Button'
import { Field, Form, Formik } from 'formik'
import * as Yup from 'yup'
import { Input } from '@/components/ui'
import { AdaptableCard } from '@/components/shared'
import { apiChangePassword, apiUpdateUsername, apiGetMe } from '@/services/AuthService'
import toast from '@/components/ui/toast'
import Notification from '@/components/ui/Notification'
import { useState } from 'react'
import { HiEye, HiEyeOff, HiUser, HiLockClosed, HiInformationCircle } from 'react-icons/hi'
import { useQuery } from '@tanstack/react-query'

// Validation schemas
const usernameValidationSchema = Yup.object().shape({
    username: Yup.string()
        .required('Username is required')
        .min(3, 'Username must be at least 3 characters')
        .max(50, 'Username must be less than 50 characters')
        .matches(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores')
})

const passwordValidationSchema = Yup.object().shape({
    currentPassword: Yup.string()
        .required('Current password is required'),
    newPassword: Yup.string()
        .required('New password is required')
        .min(8, 'Password must be at least 8 characters long'),
    confirmPassword: Yup.string()
        .required('Please confirm your new password')
        .oneOf([Yup.ref('newPassword')], 'Passwords do not match')
})

interface User {
    id: number
    username: string
    role: string
    createdAt: string
}

const UserProfileSettings = () => {
    const [showCurrentPassword, setShowCurrentPassword] = useState(false)
    const [showNewPassword, setShowNewPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    
    // Fetch current user data
    const { data: userData, isLoading, refetch } = useQuery({
        queryKey: ['currentUser'],
        queryFn: () => apiGetMe(),
    })

    const currentUser = userData?.data?.data as User

    // Handle Username Update
    const handleUsernameUpdate = async (values: any, { setSubmitting }: any) => {
        if (!currentUser) return
        
        setSubmitting(true)
        try {
            const response = await apiUpdateUsername(currentUser.id.toString(), {
                username: values.username
            })
            
            if (response.data.success) {
                toast.push(
                    <Notification title="Success" type="success">
                        Username updated successfully
                    </Notification>
                )
                window.location.reload();   
            }
        } catch (error: any) {
            toast.push(
                <Notification title="Error" type="danger">
                    {error.response?.data?.message || 'Failed to update username'}
                </Notification>
            )
        } finally {
            setSubmitting(false)
        }
    }

    // Handle Password Change
    const handlePasswordChange = async (values: any, { setSubmitting, resetForm }: any) => {
        setSubmitting(true)
        try {
            const response = await apiChangePassword(values)
            
            if (response.data.success) {
                toast.push(
                    <Notification title="Success" type="success">
                        Password changed successfully
                    </Notification>
                )
                resetForm()
            }
        } catch (error: any) {
            toast.push(
                <Notification title="Error" type="danger">
                    {error.response?.data?.message || 'Failed to change password'}
                </Notification>
            )
        } finally {
            setSubmitting(false)
        }
    }

    if (isLoading) {
        return <div className="flex justify-center items-center h-40 text-sm">Loading...</div>
    }

    if (!currentUser) {
        return <div className="p-4 text-center text-red-500 text-sm">Failed to load user data</div>
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* USERNAME SECTION - LEFT SIDE */}
            <AdaptableCard className="p-4">
                <div className="flex items-center gap-2 mb-4 pb-3 border-b">
                    <div className="p-1.5 rounded-md bg-blue-50 text-blue-500">
                        <HiUser className="text-base" />
                    </div>
                    <div>
                        <h3 className="text-base font-semibold">Username</h3>
                        <p className="text-xs text-gray-500">Update your username</p>
                    </div>
                </div>
                
                <Formik
                    initialValues={{ username: currentUser?.username || '' }}
                    enableReinitialize
                    validationSchema={usernameValidationSchema}
                    onSubmit={handleUsernameUpdate}
                >
                    {({ touched, errors, isSubmitting, values }) => (
                        <Form>
                            <FormContainer>
                                <FormItem
                                    label="Username"
                                    invalid={!!errors.username && touched.username}
                                    errorMessage={errors.username as string}
                                    className="mb-3"
                                >
                                    <Field
                                        type="text"
                                        name="username"
                                        placeholder="Enter username"
                                        component={Input}
                                        size="sm"
                                    />
                                </FormItem>

                                <div className="flex items-center justify-between mb-4 text-xs">
                                    <div className="text-gray-600">
                                        Role: <span className="font-medium">{currentUser?.role}</span>
                                    </div>
                                    <div className="text-gray-500">
                                        Joined: {new Date(currentUser?.createdAt).toLocaleDateString()}
                                    </div>
                                </div>

                                <Button
                                    variant="solid"
                                    type="submit"
                                    loading={isSubmitting}
                                    disabled={values.username === currentUser?.username || isSubmitting}
                                    className="w-full py-1.5 text-sm"
                                    size="sm"
                                >
                                    {isSubmitting ? 'Updating...' : 'Update Username'}
                                </Button>
                            </FormContainer>
                        </Form>
                    )}
                </Formik>
            </AdaptableCard>

            {/* PASSWORD SECTION - RIGHT SIDE */}
            <AdaptableCard className="p-4">
                <div className="flex items-center gap-2 mb-4 pb-3 border-b">
                    <div className="p-1.5 rounded-md bg-amber-50 text-amber-500">
                        <HiLockClosed className="text-base" />
                    </div>
                    <div>
                        <h3 className="text-base font-semibold">Password</h3>
                        <p className="text-xs text-gray-500">Change your password</p>
                    </div>
                </div>
                
                <div className="flex flex-col gap-4">
                    <Formik
                        initialValues={{
                            currentPassword: '',
                            newPassword: '',
                            confirmPassword: ''
                        }}
                        validationSchema={passwordValidationSchema}
                        onSubmit={handlePasswordChange}
                    >
                        {({ touched, errors, isSubmitting }) => (
                            <Form>
                                <FormContainer>
                                    <FormItem
                                        label="Current Password"
                                        invalid={!!errors.currentPassword && touched.currentPassword}
                                        errorMessage={errors.currentPassword as string}
                                        className="mb-3"
                                    >
                                        <div className="relative">
                                            <Field
                                                type={showCurrentPassword ? "text" : "password"}
                                                name="currentPassword"
                                                placeholder="Current password"
                                                component={Input}
                                                className="pr-8"
                                                size="sm"
                                            />
                                            <button
                                                type="button"
                                                className="absolute inset-y-0 right-0 pr-2 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                                                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                                tabIndex={-1}
                                            >
                                                {showCurrentPassword ? 
                                                    <HiEyeOff className="h-4 w-4" /> : 
                                                    <HiEye className="h-4 w-4" />
                                                }
                                            </button>
                                        </div>
                                    </FormItem>

                                    <FormItem
                                        label="New Password"
                                        invalid={!!errors.newPassword && touched.newPassword}
                                        errorMessage={errors.newPassword as string}
                                        className="mb-3"
                                    >
                                        <div className="relative">
                                            <Field
                                                type={showNewPassword ? "text" : "password"}
                                                name="newPassword"
                                                placeholder="New password"
                                                component={Input}
                                                className="pr-8"
                                                size="sm"
                                            />
                                            <button
                                                type="button"
                                                className="absolute inset-y-0 right-0 pr-2 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                                                onClick={() => setShowNewPassword(!showNewPassword)}
                                                tabIndex={-1}
                                            >
                                                {showNewPassword ? 
                                                    <HiEyeOff className="h-4 w-4" /> : 
                                                    <HiEye className="h-4 w-4" />
                                                }
                                            </button>
                                        </div>
                                    </FormItem>

                                    <FormItem
                                        label="Confirm Password"
                                        invalid={!!errors.confirmPassword && touched.confirmPassword}
                                        errorMessage={errors.confirmPassword as string}
                                        className="mb-4"
                                    >
                                        <div className="relative">
                                            <Field
                                                type={showConfirmPassword ? "text" : "password"}
                                                name="confirmPassword"
                                                placeholder="Confirm password"
                                                component={Input}
                                                className="pr-8"
                                                size="sm"
                                            />
                                            <button
                                                type="button"
                                                className="absolute inset-y-0 right-0 pr-2 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                tabIndex={-1}
                                            >
                                                {showConfirmPassword ? 
                                                    <HiEyeOff className="h-4 w-4" /> : 
                                                    <HiEye className="h-4 w-4" />
                                                }
                                            </button>
                                        </div>
                                    </FormItem>

                                    <Button
                                        variant="solid"
                                        type="submit"
                                        loading={isSubmitting}
                                        className="w-full py-1.5 text-sm"
                                        size="sm"
                                    >
                                        {isSubmitting ? 'Changing...' : 'Change Password'}
                                    </Button>
                                </FormContainer>
                            </Form>
                        )}
                    </Formik>
                    
                    <div className="bg-blue-50 p-3 rounded-md border border-blue-200">
                        <h4 className="font-medium text-blue-700 mb-2 flex items-center gap-1.5 text-sm">
                            <HiInformationCircle className="h-4 w-4" />
                            Password Requirements
                        </h4>
                        <ul className="space-y-1 text-xs text-blue-600">
                            <li className="flex items-start gap-1.5">
                                <span className="text-blue-500 mt-0.5">•</span>
                                At least 8 characters
                            </li>
                            <li className="flex items-start gap-1.5">
                                <span className="text-blue-500 mt-0.5">•</span>
                                Different from current
                            </li>
                            <li className="flex items-start gap-1.5">
                                <span className="text-blue-500 mt-0.5">•</span>
                                Letters, numbers, symbols
                            </li>
                            <li className="flex items-start gap-1.5">
                                <span className="text-blue-500 mt-0.5">•</span>
                                Avoid common words
                            </li>
                        </ul>
                    </div>
                </div>
            </AdaptableCard>
        </div>
    )
}

export default UserProfileSettings