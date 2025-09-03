import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { FormContainer, FormItem } from '@/components/ui/Form'
import Button from '@/components/ui/Button'
import { Field, Form, Formik } from 'formik'
import * as Yup from 'yup'
import { Input } from '@/components/ui'
import { AdaptableCard } from '@/components/shared'
import { apiGetEmployee, apiUpdateEmployee } from '@/services/EmployeeService.ts'
import toast from '@/components/ui/toast'
import Notification from '@/components/ui/Notification'

const validationSchema = Yup.object().shape({
    empId: Yup.string()
        .required('Employee ID is required'),
    name: Yup.string()
        .required('Employee name is required')
        .min(2, 'Too Short!')
        .max(100, 'Too Long!'),
    email: Yup.string().email('Invalid email'),
    department: Yup.string(),
    position: Yup.string()
})

const EmployeeEdit = () => {
    const { id } = useParams()
    const navigate = useNavigate()

    const [initialValues, setInitialValues] = useState({
        empId: '',
        name: '',
        email: '',
        department: '',
        position: ''
    })
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchEmployee = async () => {
            try {
                const response = await apiGetEmployee(id!)
                setInitialValues({
                    empId: response.data.data.empId,
                    name: response.data.data.name,
                    email: response.data.data.email || '',
                    department: response.data.data.department || '',
                    position: response.data.data.position || ''
                })
                setLoading(false)
            } catch (error: any) {
                toast.push(
                    <Notification title="Error" type="danger">
                        {error.message || 'Failed to fetch employee'}
                    </Notification>
                )
                navigate('/employees')
            }
        }

        if (id) {
            fetchEmployee()
        }
    }, [id, navigate])

    const handleSubmit = async (values: any, { setSubmitting }: any) => {
        try {
            const resp = await apiUpdateEmployee(id!, values)
            if (resp.status === 200) {
                toast.push(
                    <Notification title="Success" type="success">
                        Employee updated successfully
                    </Notification>
                )
                navigate('/employees')
            }
        } catch (error: any) {
            toast.push(
                <Notification title="Error" type="danger">
                    {error.message || 'Failed to update employee'}
                </Notification>
            )
        } finally {
            setSubmitting(false)
        }
    }

    if (loading) {
        return (
            <div className="flex h-full items-center justify-center">
                <h3 className="text-gray-500">Loading employee details...</h3>
            </div>
        )
    }

    return (
        <AdaptableCard className="h-full" bodyClass="h-full">
            <div className="lg:flex items-center justify-between mb-4">
                <h3>Edit Employee</h3>
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
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormItem
                                    label="Employee ID"
                                    invalid={!!errors.empId && touched.empId}
                                    errorMessage={errors.empId as string}
                                >
                                    <Field
                                        type="text"
                                        autoComplete="off"
                                        name="empId"
                                        placeholder="Employee ID"
                                        component={Input}
                                    />
                                </FormItem>
                                <FormItem
                                    label="Full Name"
                                    invalid={!!errors.name && touched.name}
                                    errorMessage={errors.name as string}
                                >
                                    <Field
                                        type="text"
                                        autoComplete="off"
                                        name="name"
                                        placeholder="Full name"
                                        component={Input}
                                    />
                                </FormItem>
                                <FormItem
                                    label="Email"
                                    invalid={!!errors.email && touched.email}
                                    errorMessage={errors.email as string}
                                >
                                    <Field
                                        type="email"
                                        autoComplete="off"
                                        name="email"
                                        placeholder="Email"
                                        component={Input}
                                    />
                                </FormItem>
                                <FormItem
                                    label="Department"
                                    invalid={!!errors.department && touched.department}
                                    errorMessage={errors.department as string}
                                >
                                    <Field
                                        type="text"
                                        autoComplete="off"
                                        name="department"
                                        placeholder="Department"
                                        component={Input}
                                    />
                                </FormItem>
                                <FormItem
                                    label="Position"
                                    invalid={!!errors.position && touched.position}
                                    errorMessage={errors.position as string}
                                >
                                    <Field
                                        type="text"
                                        autoComplete="off"
                                        name="position"
                                        placeholder="Position"
                                        component={Input}
                                    />
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
                                    Update Employee
                                </Button>
                            </div>
                        </FormContainer>
                    </Form>
                )}
            </Formik>
        </AdaptableCard>
    )
}

export default EmployeeEdit