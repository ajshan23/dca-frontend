import { useState } from 'react'
import { Checkbox } from '@/components/ui'
import { Table } from '@/components/ui'
import type { Product } from '@/services/ProductService'

interface ProductSelectTableProps {
    products: Product[]
    selectedIds: number[]
    onSelectionChange: (ids: number[]) => void
}

const ProductSelectTable = ({ 
    products, 
    selectedIds, 
    onSelectionChange 
}: ProductSelectTableProps) => {
    const toggleProductSelection = (productId: number) => {
        const newSelectedIds = selectedIds.includes(productId)
            ? selectedIds.filter(id => id !== productId)
            : [...selectedIds, productId]
        onSelectionChange(newSelectedIds)
    }

    const toggleAllSelection = () => {
        if (selectedIds.length === products.length) {
            onSelectionChange([])
        } else {
            onSelectionChange(products.map(p => p.id))
        }
    }

    return (
        <div className="border rounded-lg overflow-hidden">
            <Table>
                <thead>
                    <tr>
                        <th style={{ width: 50 }}>
                            <Checkbox
                                checked={selectedIds.length === products.length && products.length > 0}
                                indeterminate={selectedIds.length > 0 && selectedIds.length < products.length}
                                onChange={toggleAllSelection}
                            />
                        </th>
                        <th>Product</th>
                        <th>Model</th>
                        <th>Serial Number</th>
                        <th>Available Stock</th>
                    </tr>
                </thead>
                <tbody>
                    {products.map(product => (
                        <tr key={product.id}>
                            <td>
                                <Checkbox
                                    checked={selectedIds.includes(product.id)}
                                    onChange={() => toggleProductSelection(product.id)}
                                    disabled={product.availableStock <= 0}
                                />
                            </td>
                            <td>{product.name}</td>
                            <td>{product.model}</td>
                            <td>{product.serialNumber}</td>
                            <td>
                                <span className={product.availableStock > 0 ? 'text-emerald-500' : 'text-red-500'}>
                                    {product.availableStock}
                                </span>
                            </td>
                        </tr>
                    ))}
                    {products.length === 0 && (
                        <tr>
                            <td colSpan={5} className="text-center py-4 text-gray-500">
                                No available products found
                            </td>
                        </tr>
                    )}
                </tbody>
            </Table>
        </div>
    )
}

export default ProductSelectTable