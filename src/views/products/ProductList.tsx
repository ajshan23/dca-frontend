import { AdaptableCard } from '@/components/shared'
import ProductTable from './ProductTable'
import ProductTableTools from './ProductTableTools'

const ProductList = () => {
    return (
        <AdaptableCard className="h-full" bodyClass="h-full">
            <div className="lg:flex items-center justify-between mb-4">
                <h3 className="mb-4 lg:mb-0">Products</h3>
                <ProductTableTools />
            </div>
            <ProductTable />
        </AdaptableCard>
    )
}

export default ProductList