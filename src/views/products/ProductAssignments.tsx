import { useState } from 'react'
import { AdaptableCard } from '@/components/shared'
import ProductAssignmentTable from './ProductAssignmentTable'
import AssignProductForm from './AssignProductForm'
import BulkAssignmentForm from './BulkAssignmentForm'
import { Button } from '@/components/ui'
import { HiPlus, HiUserGroup } from 'react-icons/hi'
import { useNavigate } from 'react-router-dom'

const ProductAssignments = () => {
    const navigate = useNavigate()
    const [view, setView] = useState<'list' | 'assign' | 'bulk'>('list')

    return (
        <AdaptableCard className="h-full" bodyClass="h-full">
            <div className="lg:flex items-center justify-between mb-4">
                <h3 className="mb-4 lg:mb-0">Product Assignments</h3>
                {view === 'list' && (
                    <div className="flex gap-2">
                        <Button
                            variant="solid"
                            size="sm"
                            icon={<HiPlus />}
                            onClick={() => setView('assign')}
                        >
                            Assign Product
                        </Button>
                        <Button
                            variant="solid"
                            size="sm"
                            icon={<HiUserGroup />}
                            onClick={() => setView('bulk')}
                        >
                            Bulk Assign
                        </Button>
                    </div>
                )}
            </div>

            {view === 'list' && <ProductAssignmentTable />}
            {view === 'assign' && (
                <AssignProductForm
                    onSubmit={() => {
                        setView('list')
                        navigate('/product-assignments')
                    }}
                    onCancel={() => setView('list')}
                />
            )}
            {view === 'bulk' && (
                <BulkAssignmentForm
                    onSubmit={() => setView('list')}
                    onCancel={() => setView('list')}
                />
            )}
        </AdaptableCard>
    )
}

export default ProductAssignments