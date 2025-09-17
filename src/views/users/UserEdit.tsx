import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { FormContainer, FormItem } from '@/components/ui/Form'
import Button from '@/components/ui/Button'
import { Field, Form, Formik } from 'formik'
import * as Yup from 'yup'
import { Input } from '@/components/ui'
import { AdaptableCard } from '@/components/shared'
import Select from '@/components/ui/Select'
import { useAppSelector } from '@/store'
import { apiGetUser, apiUpdateUser } from '@/services/UserService'
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
        .min(8, 'Minimum 8 characters'),
    role: Yup.string().required('Role Required')
})

const UserEdit = () => {
    const { id } = useParams()
    const navigate = useNavigate()
    const { user: currentUser } = useAppSelector((state) => state.auth)
    const { authenticated } = useAuth()

    const [initialValues, setInitialValues] = useState({
        username: '',
        password: '',
        role: 'user'
    })
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const response = await apiGetUser(id!)
                console.log(response);
                
                setInitialValues({
                    username: response.data.data.username,
                    password: '',
                    role: response.data.data.role
                })
                setLoading(false)
            } catch (error: any) {
                toast.push(
                    <Notification title="Error" type="danger">
                        {error.message || 'Failed to fetch user'}
                    </Notification>
                )
                navigate('/users')
            }
        }

        if (id) {
            fetchUser()
        }
    }, [id, navigate])

    const handleSubmit = async (values: any, { setSubmitting }: any) => {
        try {
            const payload: any = {
                username: values.username,
                role: values.role
            }

            if (values.password) {
                payload.password = values.password
            }

            const resp = await apiUpdateUser(id!, payload)
            console.log(resp);
            if (resp.status===200) {
                toast.push(
                    <Notification title="Success" type="success">
                        User updated successfully
                    </Notification>
                )
                navigate('/users')
            } else {
                toast.push(
                    <Notification title="Error" type="danger">
                        {resp.message || 'Update failed'}
                    </Notification>
                )
            }
        } catch (error: any) {
            toast.push(
                <Notification title="Error" type="danger">
                    {error.message || 'Failed to update user'}
                </Notification>
            )
        } finally {
            setSubmitting(false)
        }
    }

    if (loading) {
        return (
            <div className="flex h-full items-center justify-center">
                <h3 className="text-gray-500">Loading user details...</h3>
            </div>
        )
    }

    return (
        <AdaptableCard className="h-full" bodyClass="h-full">
            <div className="lg:flex items-center justify-between mb-4">
                <h3>Edit User</h3>
            </div>

            <Formik
                initialValues={initialValues}
                validationSchema={validationSchema}
                onSubmit={handleSubmit}
                enableReinitialize
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
                                    label="Password (leave blank to keep current)"
                                    invalid={!!errors.password && touched.password}
                                    errorMessage={errors.password as string}
                                >
                                    <Field
                                        type="password"
                                        autoComplete="new-password"
                                        name="password"
                                        placeholder="New Password"
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
                                                disabled={currentUser.role !== 'super_admin'}
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
                                    Update User
                                </Button>
                            </div>
                        </FormContainer>
                    </Form>
                )}
            </Formik>
        </AdaptableCard>
    )
}

export default UserEdit
