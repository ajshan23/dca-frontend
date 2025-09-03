import { FormContainer, FormItem } from '@/components/ui/Form'
import Button from '@/components/ui/Button'
import { Field, Form, Formik } from 'formik'
import * as Yup from 'yup'
import { Input } from '@/components/ui'
import { AdaptableCard } from '@/components/shared'
import { useNavigate } from 'react-router-dom'
import { apiCreateBranch } from '@/services/BranchService'
import toast from '@/components/ui/toast'
import Notification from '@/components/ui/Notification'

const validationSchema = Yup.object().shape({
    name: Yup.string()
        .required('Branch name is required')
        .min(2, 'Too Short!')
        .max(100, 'Too Long!')
})

const BranchCreate = () => {
    const navigate = useNavigate()

    const getErrorMessage = (error: any) => {
        if (error?.response?.data?.message) {
            return error.response.data.message
        }
        if (error.message) {
            return error.message
        }
        return 'Failed to create branch'
    }

    const handleSubmit = async (values: any, { setSubmitting }: any) => {
        setSubmitting(true)
        console.log(values)
        
        try {
            const resp = await apiCreateBranch(values)
            if (resp.success) {
                toast.push(
                    <Notification title="Success" type="success">
                        Branch created successfully
                    </Notification>
                )
                navigate('/branches')
            } else if (resp.message) {
                toast.push(
                    <Notification title="Error" type="danger">
                        {resp.message}
                    </Notification>
                )
            }
        } catch (error: any) {
            const errorMessage = getErrorMessage(error)
            
            if (error?.response?.status === 401) {
                navigate('/auth/login')
                return
            }
            
            if (error?.response?.status === 403) {
                toast.push(
                    <Notification title="Permission Denied" type="danger">
                        You don't have permission to perform this action
                    </Notification>
                )
                return
            }

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
                <h3>Create New Branch</h3>
            </div>
            
            <Formik
                initialValues={{
                    name: ''
                }}
                validationSchema={validationSchema}
                onSubmit={handleSubmit}
            >
                {({ touched, errors, isSubmitting }) => (
                    <Form>
                        <FormContainer>
                            <div className="grid grid-cols-1 gap-4">
                                <FormItem
                                    label="Branch Name"
                                    invalid={!!errors.name && touched.name}
                                    errorMessage={errors.name as string}
                                >
                                    <Field
                                        type="text"
                                        autoComplete="off"
                                        name="name"
                                        placeholder="Branch name"
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
                                    Create Branch
                                </Button>
                            </div>
                        </FormContainer>
                    </Form>
                )}
            </Formik>
        </AdaptableCard>
    )
}

export default BranchCreate