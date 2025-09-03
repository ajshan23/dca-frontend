import { AdaptableCard } from '@/components/shared'
import DepartmentTable from './DepartmentTable'
import DepartmentTableTools from './DepartmentTableTools'

const DepartmentList = () => {
    return (
        <AdaptableCard className="h-full" bodyClass="h-full">
            <div className="lg:flex items-center justify-between mb-4">
                <h3 className="mb-4 lg:mb-0">Departments</h3>
                <DepartmentTableTools />
            </div>
            <DepartmentTable />
        </AdaptableCard>
    )
}

export default DepartmentList