import { FormContainer, FormItem } from '@/components/ui/Form'
import Button from '@/components/ui/Button'
import { Field, Form, Formik } from 'formik'
import * as Yup from 'yup'
import { Input } from '@/components/ui'
import { AdaptableCard } from '@/components/shared'
import Select from '@/components/ui/Select'
import { useNavigate } from 'react-router-dom'
import { useAppSelector } from '@/store'
import { apiCreateUser } from '@/services/UserService'
import useAuth from '@/utils/hooks/useAuth'
import toast from '@/components/ui/toast'
import Notification from '@/components/ui/Notification'

const roleOptions = [
    { label: 'Admin', value: 'admin' },
    { label: 'User', value: 'user' }
]

const validationSchema = Yup.object().shape({
    username: Yup.string()
        .required('Username Required')
        .min(3, 'Too Short!')
        .max(50, 'Too Long!'),
    password: Yup.string()
        .required('Password Required')
        .min(8, 'Minimum 8 characters'),
    role: Yup.string().required('Role Required')
})

const UserCreate = () => {
    const navigate = useNavigate()
    const { user } = useAppSelector((state) => state.auth)
    const { authenticated } = useAuth()

    const getErrorMessage = (error: any) => {
        if (error?.response?.data?.message) {
            return error.response.data.message
        }
        if (error.message) {
            return error.message
        }
        return 'Failed to create user'
    }

    const handleSubmit = async (values: any, { setSubmitting }: any) => {
        setSubmitting(true)
        try {
            const resp = await apiCreateUser(values)
            if (resp.success) {
                toast.push(
                    <Notification title="Success" type="success">
                        User created successfully
                    </Notification>
                )
                navigate('/users')
            } else if (resp.message) {
                toast.push(
                    <Notification title="Error" type="danger">
                        {resp.message}
                    </Notification>
                )
            }
        } catch (error: any) {
            const errorMessage = getErrorMessage(error)
            
            // Handle specific error cases
            if (error?.response?.status === 401) {
                // Unauthorized - redirect to login
                navigate('/auth/login')
                return
            }
            
            if (error?.response?.status === 403) {
                // Forbidden - show permission error
                toast.push(
                    <Notification title="Permission Denied" type="danger">
                        You don't have permission to perform this action
                    </Notification>
                )
                return
            }

            // General error
            toast.push(
                <Notification title="Error" type="danger">
                    {errorMessage}
                </Notification>
            )
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <AdaptableCard className="h-full" bodyClass="h-full">
            <div className="lg:flex items-center justify-between mb-4">
                <h3>Create New User</h3>
            </div>
            
            <Formik
                initialValues={{
                    username: '',
                    password: '',
                    role: 'user' // Default role
                }}
                validationSchema={validationSchema}
                onSubmit={handleSubmit}
            >
                {({ touched, errors, isSubmitting }) => (
                    <Form>
                        <FormContainer>
                            <div className="grid grid-cols-1 gap-4">
                                <FormItem
                                    label="Username"
                                    invalid={!!errors.username && touched.username}
                                    errorMessage={errors.username as string}
                                >
                                    <Field
                                        type="text"
                                        autoComplete="off"
                                        name="username"
                                        placeholder="Username"
                                        component={Input}
                                    />
                                </FormItem>

                                <FormItem
                                    label="Password"
                                    invalid={!!errors.password && touched.password}
                                    errorMessage={errors.password as string}
                                >
                                    <Field
                                        type="password"
                                        autoComplete="new-password"
                                        name="password"
                                        placeholder="Password"
                                        component={Input}
                                    />
                                </FormItem>

                                <FormItem
                                    label="Role"
                                    invalid={!!errors.role && touched.role}
                                    errorMessage={errors.role as string}
                                >
                                    <Field name="role">
                                        {({ field, form }: any) => (
                                            <Select
                                                placeholder="Select Role"
                                                options={roleOptions}
                                                value={roleOptions.find(opt => opt.value === field.value)}
                                                onChange={(option: any) => 
                                                    form.setFieldValue(field.name, option.value)
                                                }
                                            />
                                        )}
                                    </Field>
                                </FormItem>
                            </div>

                            <div className="flex justify-end gap-2 mt-4">
                                <Button
                                    type="button"
                                    onClick={() => navigate(-1)}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    variant="solid"
                                    type="submit"
                                    loading={isSubmitting}
                                >
                                    Create User
                                </Button>
                            </div>
                        </FormContainer>
                    </Form>
                )}
            </Formik>
        </AdaptableCard>
    )
}

export default UserCreate