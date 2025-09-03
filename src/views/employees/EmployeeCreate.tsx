import { FormContainer, FormItem } from '@/components/ui/Form'
import Button from '@/components/ui/Button'
import { Field, Form, Formik } from 'formik'
import * as Yup from 'yup'
import { Input } from '@/components/ui'
import { AdaptableCard } from '@/components/shared'
import { useNavigate } from 'react-router-dom'
import { apiCreateEmployee } from '@/services/EmployeeService.ts'
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

const EmployeeCreate = () => {
    const navigate = useNavigate()

    const handleSubmit = async (values: any, { setSubmitting }: any) => {
        setSubmitting(true)
        try {
            const resp = await apiCreateEmployee(values)
            if (resp.success) {
                toast.push(
                    <Notification title="Success" type="success">
                        Employee created successfully
                    </Notification>
                )
                navigate('/employees')
            }
        } catch (error: any) {
            toast.push(
                <Notification title="Error" type="danger">
                    {error.message || 'Failed to create employee'}
                </Notification>
            )
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <AdaptableCard className="h-full" bodyClass="h-full">
            <div className="lg:flex items-center justify-between mb-4">
                <h3>Create New Employee</h3>
            </div>
            
            <Formik
                initialValues={{
                    empId: '',
                    name: '',
                    email: '',
                    department: '',
                    position: ''
                }}
                validationSchema={validationSchema}
                onSubmit={handleSubmit}
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
                                        placeholder="Email (optional)"
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
                                        placeholder="Department (optional)"
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
                                        placeholder="Position (optional)"
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
                                    Create Employee
                                </Button>
                            </div>
                        </FormContainer>
                    </Form>
                )}
            </Formik>
        </AdaptableCard>
    )
}

export default EmployeeCreate