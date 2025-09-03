import { useNavigate } from 'react-router-dom'
import Button from '@/components/ui/Button'
import { HiPlus } from 'react-icons/hi'
import { useAppSelector } from '@/store'

const UserTableTools = () => {
    const navigate = useNavigate()
    const { user } = useAppSelector((state) => state.auth)

    const canCreateUser = user?.role === 'super_admin' || user?.role === 'admin'

    // if (!canCreateUser) return null

    return (
        <Button
            size="sm"
            variant="solid"
            icon={<HiPlus />}
            onClick={() => navigate('/users/create')}
        >
            Add User
        </Button>
    )
}

export default UserTableTools