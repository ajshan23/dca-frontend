import { AdaptableCard } from '@/components/shared'
import EmployeeTable from './EmployeeTable'
import EmployeeTableTools from './EmployeeTableTools'

const EmployeeList = () => {
    return (
        <AdaptableCard className="h-full" bodyClass="h-full">
            <div className="lg:flex items-center justify-between mb-4">
                <h3 className="mb-4 lg:mb-0">Employees</h3>
                <EmployeeTableTools />
            </div>
            <EmployeeTable />
        </AdaptableCard>
    )
}

export default EmployeeList