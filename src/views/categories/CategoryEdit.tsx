import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { FormContainer, FormItem } from '@/components/ui/Form'
import Button from '@/components/ui/Button'
import { Field, Form, Formik } from 'formik'
import * as Yup from 'yup'
import { Input } from '@/components/ui'
import { AdaptableCard } from '@/components/shared'
import { apiGetCategory, apiUpdateCategory } from '@/services/CategoryService'
import toast from '@/components/ui/toast'
import Notification from '@/components/ui/Notification'

const validationSchema = Yup.object().shape({
    name: Yup.string()
        .required('Category name is required')
        .min(2, 'Too Short!')
        .max(100, 'Too Long!'),
    description: Yup.string().max(500, 'Too Long!')
})

const CategoryEdit = () => {
    const { id } = useParams()
    const navigate = useNavigate()

    const [initialValues, setInitialValues] = useState({
        name: '',
        description: ''
    })
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchCategory = async () => {
            try {
                const response = await apiGetCategory(id!)
                setInitialValues({
                    name: response.data.data.name,
                    description: response.data.data.description || ''
                })
                setLoading(false)
            } catch (error: any) {
                toast.push(
                    <Notification title="Error" type="danger">
                        {error.message || 'Failed to fetch category'}
                    </Notification>
                )
                navigate('/categories')
            }
        }

        if (id) {
            fetchCategory()
        }
    }, [id, navigate])

    const handleSubmit = async (values: any, { setSubmitting }: any) => {
        try {
            const resp = await apiUpdateCategory(id!, values)
            if (resp.status === 200) {
                toast.push(
                    <Notification title="Success" type="success">
                        Category updated successfully
                    </Notification>
                )
                navigate('/categories')
            }
        } catch (error: any) {
            toast.push(
                <Notification title="Error" type="danger">
                    {error.message || 'Failed to update category'}
                </Notification>
            )
        } finally {
            setSubmitting(false)
        }
    }

    if (loading) {
        return (
            <div className="flex h-full items-center justify-center">
                <h3 className="text-gray-500">Loading category details...</h3>
            </div>
        )
    }

    return (
        <AdaptableCard className="h-full" bodyClass="h-full">
            <div className="lg:flex items-center justify-between mb-4">
                <h3>Edit Category</h3>
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
                                    label="Category Name"
                                    invalid={!!errors.name && touched.name}
                                    errorMessage={errors.name as string}
                                >
                                    <Field
                                        type="text"
                                        autoComplete="off"
                                        name="name"
                                        placeholder="Category name"
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
                                        placeholder="Description"
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
                                    Update Category
                                </Button>
                            </div>
                        </FormContainer>
                    </Form>
                )}
            </Formik>
        </AdaptableCard>
    )
}

export default CategoryEdit