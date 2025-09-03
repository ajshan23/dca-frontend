import { AdaptableCard } from '@/components/shared'
import ProductAssignedTable from './ProductAssignedTable'


const ProductList = () => {
    return (
        <AdaptableCard className="h-full" bodyClass="h-full">
            <div className="lg:flex items-center justify-between mb-4">
                <h3 className="mb-4 lg:mb-0">Product Assignments</h3>
            </div>
            <ProductAssignedTable />
        </AdaptableCard>
    )
}

export default ProductList