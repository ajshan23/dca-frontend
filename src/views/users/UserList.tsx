
import { injectReducer } from '@/store'
import AdaptableCard from '@/components/shared/AdaptableCard'
import UserTable from './Compo/UserTable'
import UserTableTools from './Compo/UserTableTools'


const UserList = () => {
    return (
        <AdaptableCard className="h-full" bodyClass="h-full">
            <div className="lg:flex items-center justify-between mb-4">
                <h3 className="mb-4 lg:mb-0">Users</h3>
                <UserTableTools />
            </div>
            <UserTable />
        </AdaptableCard>
    )
}

export default UserList