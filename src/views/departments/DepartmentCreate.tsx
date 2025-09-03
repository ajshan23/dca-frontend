import { FormContainer, FormItem } from '@/components/ui/Form'
import Button from '@/components/ui/Button'
import { Field, Form, Formik } from 'formik'
import * as Yup from 'yup'
import { Input } from '@/components/ui'
import { AdaptableCard } from '@/components/shared'
import { useNavigate } from 'react-router-dom'
import { apiCreateDepartment } from '@/services/DepartmentService'
import toast from '@/components/ui/toast'
import Notification from '@/components/ui/Notification'

const validationSchema = Yup.object().shape({
    name: Yup.string()
        .required('Department name is required')
        .min(2, 'Too Short!')
        .max(100, 'Too Long!'),
    description: Yup.string().max(500, 'Too Long!')
})

const DepartmentCreate = () => {
    const navigate = useNavigate()

    const handleSubmit = async (values: any, { setSubmitting }: any) => {
        setSubmitting(true)
        try {
            const resp = await apiCreateDepartment(values)
            if (resp.success) {
                toast.push(
                    <Notification title="Success" type="success">
                        Department created successfully
                    </Notification>
                )
                navigate('/departments')
            }
        } catch (error: any) {
            toast.push(
                <Notification title="Error" type="danger">
                    {error.message || 'Failed to create department'}
                </Notification>
            )
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <AdaptableCard className="h-full" bodyClass="h-full">
            <div className="lg:flex items-center justify-between mb-4">
                <h3>Create New Department</h3>
            </div>
            
            <Formik
                initialValues={{
                    name: '',
                    description: ''
                }}
                validationSchema={validationSchema}
                onSubmit={handleSubmit}
            >
                {({ touched, errors, isSubmitting }) => (
                    <Form>
                        <FormContainer>
                            <div className="grid grid-cols-1 gap-4">
                                <FormItem
                                    label="Department Name"
                                    invalid={!!errors.name && touched.name}
                                    errorMessage={errors.name as string}
                                >
                                    <Field
                                        type="text"
                                        autoComplete="off"
                                        name="name"
                                        placeholder="Department name"
                                        component={Input}
                                    />
                                </FormItem>
                                <FormItem
                                    label="Description"
                                    invalid={!!errors.description && touched.description}
                                    errorMessage={errors.description as string}
                                >
                                    <Field
                                        name="description"
                                        placeholder="Description (optional)"
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
                                    Create Department
                                </Button>
                            </div>
                        </FormContainer>
                    </Form>
                )}
            </Formik>
        </AdaptableCard>
    )
}

export default DepartmentCreate