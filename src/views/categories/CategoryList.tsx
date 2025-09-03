import { AdaptableCard } from '@/components/shared'
import CategoryTable from './CategoryTable'
import CategoryTableTools from './CategoryTableTools'

const CategoryList = () => {
    return (
        <AdaptableCard className="h-full" bodyClass="h-full">
            <div className="lg:flex items-center justify-between mb-4">
                <h3 className="mb-4 lg:mb-0">Categories</h3>
                <CategoryTableTools />
            </div>
            <CategoryTable />
        </AdaptableCard>
    )
}

export default CategoryList