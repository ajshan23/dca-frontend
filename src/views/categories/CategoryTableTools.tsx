import { Button } from '@/components/ui'
import { HiPlusCircle } from 'react-icons/hi'
import { useNavigate } from 'react-router-dom'

const CategoryTableTools = () => {
    const navigate = useNavigate()

    return (
        <div className="flex flex-col lg:flex-row lg:items-center gap-2">
            <Button
                variant="solid"
                size="sm"
                icon={<HiPlusCircle />}
                onClick={() => navigate('/categories/create')}
            >
                Add Category
            </Button>
        </div>
    )
}

export default CategoryTableTools