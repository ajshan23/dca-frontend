import { AdaptableCard } from '@/components/shared'
import BranchTable from './Compo/BranchTable'
import BranchTableTools from './Compo/BranchTableTools'

const BranchList = () => {
    return (
        <AdaptableCard className="h-full" bodyClass="h-full">
            <div className="lg:flex items-center justify-between mb-4">
                <h3 className="mb-4 lg:mb-0">Branches</h3>
                <BranchTableTools />
            </div>
            <BranchTable />
        </AdaptableCard>
    )
}

export default BranchList