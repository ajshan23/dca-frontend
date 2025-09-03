import { FormContainer, FormItem } from '@/components/ui/Form'
import { Field, Form, Formik } from 'formik'
import * as Yup from 'yup'
import { Select } from '@/components/ui'
import Button from '@/components/ui/Button'
import { useQuery } from '@tanstack/react-query'
import { apiGetEmployees } from '@/services/EmployeeService.ts'
import ProductSelectTable from './ProductSelectTable'
import { HiOutlineArrowLeft } from 'react-icons/hi'
import { apiBulkAssignProducts } from '@/services/ProductAssignmentService'
import toast from '@/components/ui/toast'
import Notification from '@/components/ui/Notification'
import { useNavigate } from 'react-router-dom'
import { apiGetAvailableProducts } from '@/services/ProductService'

const validationSchema = Yup.object().shape({
    employeeId: Yup.number().required('Employee is required'),
    productIds: Yup.array()
        .of(Yup.number())
        .min(1, 'Select at least one product')
})

const BulkAssignmentForm = ({ 
    onSubmit, 
    onCancel 
}: {
    onSubmit?: () => void
    onCancel: () => void
}) => {
    const navigate = useNavigate()
    const { data: employees } = useQuery(['employees-select'], () => 
        apiGetEmployees({ limit: 1000 }).then(res => res.data.data)
    )

    const { data: availableProducts } = useQuery(['available-products'], () =>
        apiGetAvailableProducts().then(res => res.data.data)
    )

    const handleSubmit = async (values: any, { setSubmitting }: any) => {
        try {
            const response = await apiBulkAssignProducts(values)
            if (response.data.success) {
                toast.push(
                    <Notification title="Success" type="success">
                        {values.productIds.length} products assigned successfully
                    </Notification>
                )
                if (onSubmit) onSubmit()
                navigate('/product-assignments')
            }
        } catch (error: any) {
            toast.push(
                <Notification title="Error" type="danger">
                    {error.response?.data?.message || 'Failed to assign products'}
                </Notification>
            )
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <Formik
            initialValues={{
                employeeId: '',
                productIds: []
            }}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
        >
            {({ values, touched, errors, isSubmitting, setFieldValue }) => (
                <Form>
                    <FormContainer>
                        <div className="grid grid-cols-1 gap-4">
                            <FormItem
                                label="Employee"
                                invalid={!!errors.employeeId && touched.employeeId}
                                errorMessage={errors.employeeId as string}
                            >
                                <Field name="employeeId">
                                    {({ field, form }: any) => (
                                        <Select
                                            placeholder="Select Employee"
                                            options={employees?.map(e => ({
                                                value: e.id,
                                                label: `${e.name} (${e.empId})`
                                            })) || []}
                                            value={employees?.find(e => e.id === field.value)}
                                            onChange={(option: any) => 
                                                form.setFieldValue(field.name, option?.value)
                                            }
                                        />
                                    )}
                                </Field>
                            </FormItem>

                            <FormItem
                                label="Products to Assign"
                                invalid={!!errors.productIds && touched.productIds}
                                errorMessage={errors.productIds as string}
                            >
                                <ProductSelectTable 
                                    products={availableProducts || []}
                                    selectedIds={values.productIds}
                                    onSelectionChange={(ids) => setFieldValue('productIds', ids)}
                                />
                            </FormItem>
                        </div>

                        <div className="flex justify-end gap-2 mt-4">
                            <Button
                                type="button"
                                onClick={onCancel}
                                icon={<HiOutlineArrowLeft />}
                            >
                                Cancel
                            </Button>
                            <Button
                                variant="solid"
                                type="submit"
                                loading={isSubmitting}
                            >
                                Assign {values.productIds.length} Products
                            </Button>
                        </div>
                    </FormContainer>
                </Form>
            )}
        </Formik>
    )
}

export default BulkAssignmentForm