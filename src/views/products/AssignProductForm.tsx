import { FormContainer, FormItem } from '@/components/ui/Form';
import { Field, Form, Formik } from 'formik';
import * as Yup from 'yup';
import { Input, Select } from '@/components/ui';
import Button from '@/components/ui/Button';
import { useQuery } from '@tanstack/react-query';
import { apiGetProducts } from '@/services/ProductService';
import { apiGetEmployees } from '@/services/EmployeeService.ts';
import { HiOutlineArrowLeft } from 'react-icons/hi';

const validationSchema = Yup.object().shape({
  productId: Yup.string().required('Product is required'),
  employeeId: Yup.string().required('Employee is required'),
  quantity: Yup.number().required().min(1),
  notes: Yup.string().max(500, 'Notes too long'),
  status: Yup.string().required('Status is required'),
  condition: Yup.string().when('status', {
    is: 'returned',
    then: Yup.string().required('Condition is required for returns')
  })
});

const AssignProductForm = ({ 
  onSubmit, 
  onCancel,
  initialValues = {
    productId: '',
    employeeId: '',
    quantity: 1,
    notes: '',
    status: 'assigned',
    condition: ''
  }
}) => {
  const { data: products } = useQuery(['products-select'], () => 
    apiGetProducts({ limit: 1000 }).then(res => res.data)
  );

  const { data: employees } = useQuery(['employees-select'], () => 
    apiGetEmployees({ limit: 1000 }).then(res => res.data)
  );

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={validationSchema}
      onSubmit={onSubmit}
    >
      {({ touched, errors, isSubmitting, values, setFieldValue }) => (
        <Form>
          <FormContainer>
            <div className="grid grid-cols-1 gap-4">
              <FormItem
                label="Product"
                invalid={!!errors.productId && touched.productId}
                errorMessage={errors.productId as string}
              >
                <Field name="productId">
                  {({ field, form }: any) => (
                    <Select
                      placeholder="Select Product"
                      options={products?.map(p => ({
                        value: p.id,
                        label: `${p.name} (${p.serialNumber}) - Stock: ${p.availableStock}/${p.totalStock}`
                      })) || []}
                      value={products?.find(p => p.id === field.value)}
                      onChange={(option: any) => 
                        form.setFieldValue(field.name, option?.value)
                      }
                      isDisabled={initialValues.productId !== ''}
                    />
                  )}
                </Field>
              </FormItem>

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
                label="Quantity"
                invalid={!!errors.quantity && touched.quantity}
                errorMessage={errors.quantity as string}
              >
                <Field
                  type="number"
                  name="quantity"
                  component={Input}
                  min={1}
                />
              </FormItem>

              <FormItem
                label="Status"
                invalid={!!errors.status && touched.status}
                errorMessage={errors.status as string}
              >
                <Field name="status">
                  {({ field, form }: any) => (
                    <Select
                      placeholder="Select Status"
                      options={[
                        { value: 'assigned', label: 'Assigned' },
                        { value: 'returned', label: 'Returned' },
                        { value: 'lost', label: 'Lost' },
                        { value: 'damaged', label: 'Damaged' }
                      ]}
                      value={field.value}
                      onChange={(option: any) => 
                        form.setFieldValue(field.name, option?.value)
                      }
                    />
                  )}
                </Field>
              </FormItem>

              {values.status === 'returned' && (
                <FormItem
                  label="Condition"
                  invalid={!!errors.condition && touched.condition}
                  errorMessage={errors.condition as string}
                >
                  <Field name="condition">
                    {({ field, form }: any) => (
                      <Select
                        placeholder="Select Condition"
                        options={[
                          { value: 'excellent', label: 'Excellent' },
                          { value: 'good', label: 'Good' },
                          { value: 'fair', label: 'Fair' },
                          { value: 'poor', label: 'Poor' }
                        ]}
                        value={field.value}
                        onChange={(option: any) => 
                          form.setFieldValue(field.name, option?.value)
                        }
                      />
                    )}
                  </Field>
                </FormItem>
              )}

              <FormItem
                label="Notes"
                invalid={!!errors.notes && touched.notes}
                errorMessage={errors.notes as string}
              >
                <Field
                  as="textarea"
                  name="notes"
                  placeholder="Assignment notes"
                  component={Input}
                  textArea
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
                {initialValues.id ? 'Update Assignment' : 'Assign Product'}
              </Button>
            </div>
          </FormContainer>
        </Form>
      )}
    </Formik>
  );
};

export default AssignProductForm;