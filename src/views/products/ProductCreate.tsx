import { FormContainer, FormItem } from '@/components/ui/Form';
import Button from '@/components/ui/Button';
import { Field, Form, Formik, FieldArray } from 'formik';
import * as Yup from 'yup';
import { Input, Select, Checkbox, Card } from '@/components/ui';
import { AdaptableCard } from '@/components/shared';
import { useNavigate } from 'react-router-dom';
import { apiCreateProduct } from '@/services/ProductService';
import toast from '@/components/ui/toast';
import Notification from '@/components/ui/Notification';
import { useQuery } from '@tanstack/react-query';
import { apiGetCategories } from '@/services/CategoryService';
import { apiGetBranches } from '@/services/BranchService';
import { apiGetDepartments } from '@/services/DepartmentService';
import { HiOutlinePlus, HiOutlineMinus } from 'react-icons/hi';
import { useState } from 'react';

const validationSchema = Yup.object().shape({
  name: Yup.string()
    .required('Product name is required')
    .min(2, 'Too Short!')
    .max(100, 'Too Long!'),
  model: Yup.string()
    .required('Model is required'),
  categoryId: Yup.number()
    .required('Category is required'),
  branchId: Yup.number()
    .required('Branch is required'),
  warrantyDuration: Yup.number()
    .nullable()
    .min(0, 'Warranty duration cannot be negative')
    .max(120, 'Warranty duration cannot exceed 120 months'),
  minStockLevel: Yup.number()
    .min(0, 'Minimum stock level cannot be negative'),
  initialStock: Yup.number()
    .min(0, 'Initial stock cannot be negative')
    .max(1000, 'Initial stock cannot exceed 1000'),
  purchasePrice: Yup.number()
    .nullable()
    .min(0, 'Purchase price cannot be negative'),
  serialNumbers: Yup.array().of(
    Yup.string().trim()
  )
});

const ProductCreate = () => {
  const navigate = useNavigate();
  const [showStockFields, setShowStockFields] = useState(false);

  const { 
    data: categoriesData, 
    isLoading: categoriesLoading,
    error: categoriesError 
  } = useQuery({ 
    queryKey: ['categories'],
    queryFn: () => apiGetCategories({ page: 1, limit: 100 })
  });

  const { 
    data: branchesData, 
    isLoading: branchesLoading,
    error: branchesError 
  } = useQuery({ 
    queryKey: ['branches'],
    queryFn: () => apiGetBranches({ page: 1, limit: 100 })
  });

  const { 
    data: departmentsData, 
    isLoading: departmentsLoading,
    error: departmentsError 
  } = useQuery({ 
    queryKey: ['departments'],
    queryFn: () => apiGetDepartments({ page: 1, limit: 100 })
  });

  const handleSubmit = async (values: any, { setSubmitting }: any) => {
    setSubmitting(true);
    try {
      const payload = {
        name: values.name.trim(),
        model: values.model.trim(),
        categoryId: Number(values.categoryId),
        branchId: Number(values.branchId),
        departmentId: values.departmentId ? Number(values.departmentId) : undefined,
        warrantyDuration: values.warrantyDuration ? Number(values.warrantyDuration) : undefined,
        complianceStatus: Boolean(values.complianceStatus),
        description: values.description?.trim() || undefined,
        minStockLevel: Number(values.minStockLevel) || 0,
        // Initial stock fields
        initialStock: Number(values.initialStock) || 0,
        serialNumbers: values.serialNumbers?.filter((sn: string) => sn.trim()) || [],
        purchaseDate: values.purchaseDate || undefined,
        purchasePrice: values.purchasePrice ? Number(values.purchasePrice) : undefined,
        location: values.location?.trim() || undefined
      };

      const response = await apiCreateProduct(payload);
      
      if (response.status === 201) {
        toast.push(
          <Notification title="Success" type="success">
            {response.data?.message || 'Product created successfully'}
          </Notification>
        );
        navigate('/products');
      } else {
        throw new Error(response.message || 'Failed to create product');
      }
    } catch (error: any) {
      console.error('Product creation error:', error);
      
      let errorMessage = 'Failed to create product';
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast.push(
        <Notification title="Error" type="danger">
          {errorMessage}
        </Notification>
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AdaptableCard className="h-full" bodyClass="h-full">
      <div className="lg:flex items-center justify-between mb-4">
        <h3>Create New Product</h3>
      </div>
      
      <Formik
        initialValues={{
          name: '',
          model: '',
          categoryId: '',
          branchId: '',
          departmentId: '',
          warrantyDuration: '',
          complianceStatus: false,
          description: '',
          minStockLevel: 0,
          // Initial stock fields
          initialStock: 0,
          serialNumbers: [''],
          purchaseDate: '',
          purchasePrice: '',
          location: ''
        }}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({ touched, errors, isSubmitting, values, setFieldValue }) => {
          const categories = categoriesData?.data?.data || [];
          const branches = branchesData?.data?.data || [];
          const departments = departmentsData?.data?.data || [];

          return (
            <Form>
              <FormContainer>
                {/* Basic Product Information */}
                <Card className="mb-6">
                  <h4 className="mb-4">Basic Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormItem
                      label="Product Name"
                      invalid={!!errors.name && touched.name}
                      errorMessage={errors.name as string}
                    >
                      <Field
                        type="text"
                        autoComplete="off"
                        name="name"
                        placeholder="Product name"
                        component={Input}
                      />
                    </FormItem>

                    <FormItem
                      label="Model"
                      invalid={!!errors.model && touched.model}
                      errorMessage={errors.model as string}
                    >
                      <Field
                        type="text"
                        autoComplete="off"
                        name="model"
                        placeholder="Model"
                        component={Input}
                      />
                    </FormItem>

                    <FormItem
                      label="Category"
                      invalid={!!errors.categoryId && touched.categoryId}
                      errorMessage={errors.categoryId as string}
                    >
                      <Select
                        placeholder={categoriesLoading ? "Loading..." : "Select Category"}
                        loading={categoriesLoading}
                        options={categories.map((c: any) => ({
                          value: c.id,
                          label: c.name
                        }))}
                        value={values.categoryId ? {
                          value: values.categoryId,
                          label: categories.find((c: any) => c.id === values.categoryId)?.name
                        } : null}
                        onChange={(option: any) => setFieldValue('categoryId', option?.value)}
                      />
                      {categoriesError && (
                        <div className="text-red-500 text-sm mt-1">
                          Failed to load categories: {categoriesError.message}
                        </div>
                      )}
                    </FormItem>

                    <FormItem
                      label="Branch"
                      invalid={!!errors.branchId && touched.branchId}
                      errorMessage={errors.branchId as string}
                    >
                      <Select
                        placeholder={branchesLoading ? "Loading..." : "Select Branch"}
                        loading={branchesLoading}
                        options={branches.map((b: any) => ({
                          value: b.id,
                          label: b.name
                        }))}
                        value={values.branchId ? {
                          value: values.branchId,
                          label: branches.find((b: any) => b.id === values.branchId)?.name
                        } : null}
                        onChange={(option: any) => setFieldValue('branchId', option?.value)}
                      />
                      {branchesError && (
                        <div className="text-red-500 text-sm mt-1">
                          Failed to load branches: {branchesError.message}
                        </div>
                      )}
                    </FormItem>

                    <FormItem label="Department (Optional)">
                      <Select
                        placeholder={departmentsLoading ? "Loading..." : "Select Department"}
                        loading={departmentsLoading}
                        options={departments.map((d: any) => ({
                          value: d.id,
                          label: d.name
                        }))}
                        value={values.departmentId ? {
                          value: values.departmentId,
                          label: departments.find((d: any) => d.id === values.departmentId)?.name
                        } : null}
                        onChange={(option: any) => setFieldValue('departmentId', option?.value)}
                        isClearable
                      />
                    </FormItem>

                    <FormItem
                      label="Warranty Duration (months)"
                      invalid={!!errors.warrantyDuration && touched.warrantyDuration}
                      errorMessage={errors.warrantyDuration as string}
                    >
                      <Field
                        type="number"
                        name="warrantyDuration"
                        placeholder="e.g., 12, 24, 36"
                        component={Input}
                        min="0"
                        max="120"
                      />
                    </FormItem>

                    <FormItem
                      label="Minimum Stock Level"
                      invalid={!!errors.minStockLevel && touched.minStockLevel}
                      errorMessage={errors.minStockLevel as string}
                    >
                      <Field
                        type="number"
                        name="minStockLevel"
                        placeholder="Minimum stock threshold"
                        component={Input}
                        min="0"
                      />
                    </FormItem>

                    <FormItem label="Compliance Status">
                      <Checkbox
                        name="complianceStatus"
                        checked={values.complianceStatus}
                        onChange={(val) => setFieldValue('complianceStatus', val)}
                      >
                        Compliant
                      </Checkbox>
                    </FormItem>

                    <FormItem label="Description">
                      <Field
                        as="textarea"
                        name="description"
                        placeholder="Additional description"
                        className="w-full h-20 p-2 border rounded"
                      />
                    </FormItem>
                  </div>
                </Card>

                {/* Initial Stock Section */}
                <Card className="mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <h4>Initial Stock (Optional)</h4>
                    <Button
                      type="button"
                      variant="plain"
                      onClick={() => setShowStockFields(!showStockFields)}
                    >
                      {showStockFields ? 'Hide' : 'Add'} Initial Stock
                    </Button>
                  </div>

                  {showStockFields && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormItem
                        label="Initial Stock Quantity"
                        invalid={!!errors.initialStock && touched.initialStock}
                        errorMessage={errors.initialStock as string}
                      >
                        <Field
                          type="number"
                          name="initialStock"
                          placeholder="Number of items"
                          component={Input}
                          min="0"
                          max="1000"
                        />
                      </FormItem>

                      <FormItem label="Purchase Date">
                        <Field
                          type="date"
                          name="purchaseDate"
                          component={Input}
                        />
                      </FormItem>

                      <FormItem
                        label="Purchase Price per Item"
                        invalid={!!errors.purchasePrice && touched.purchasePrice}
                        errorMessage={errors.purchasePrice as string}
                      >
                        <Field
                          type="number"
                          name="purchasePrice"
                          placeholder="Price per item"
                          component={Input}
                          min="0"
                          step="0.01"
                        />
                      </FormItem>

                      {/* <FormItem label="Storage Location">
                        <Field
                          type="text"
                          name="location"
                          placeholder="Storage location"
                          component={Input}
                        />
                      </FormItem> */}

                      {/* Serial Numbers */}
                      {Number(values.initialStock) > 0 && (
                        <div className="md:col-span-2">
                          <FormItem label={`Serial Numbers (Optional - ${values.serialNumbers.length} of ${values.initialStock})`}>
                            <FieldArray name="serialNumbers">
                              {({ push, remove }) => (
                                <div className="space-y-2">
                                  {values.serialNumbers.map((serialNumber: string, index: number) => (
                                    <div key={index} className="flex gap-2">
                                      <Field
                                        type="text"
                                        name={`serialNumbers.${index}`}
                                        placeholder={`Serial number ${index + 1}`}
                                        component={Input}
                                        className="flex-1"
                                      />
                                      {values.serialNumbers.length > 1 && (
                                        <Button
                                          type="button"
                                          size="sm"
                                          variant="plain"
                                          icon={<HiOutlineMinus />}
                                          onClick={() => remove(index)}
                                        />
                                      )}
                                    </div>
                                  ))}
                                  
                                  {values.serialNumbers.length < Number(values.initialStock) && (
                                    <Button
                                      type="button"
                                      size="sm"
                                      variant="plain"
                                      icon={<HiOutlinePlus />}
                                      onClick={() => push('')}
                                    >
                                      Add Serial Number
                                    </Button>
                                  )}
                                  
                                  <p className="text-xs text-gray-500">
                                    Add serial numbers for trackable items. Leave empty for non-serialized items.
                                  </p>
                                </div>
                              )}
                            </FieldArray>
                          </FormItem>
                        </div>
                      )}
                    </div>
                  )}
                </Card>

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
                    Create Product
                  </Button>
                </div>
              </FormContainer>
            </Form>
          );
        }}
      </Formik>
    </AdaptableCard>
  );
};

export default ProductCreate;