// PublicAssignmentView.tsx
import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { apiGetPublicAssignmentInfo } from '@/services/PublicProductService'

// TypeScript interfaces
interface PublicAssignmentInfo {
  assignment: {
    id: number;
    assignedAt: string;
    returnedAt?: string;
    expectedReturnAt?: string;
    status: string;
    returnCondition?: string;
    notes?: string;
    isOverdue: boolean;
    daysOverdue: number;
  };
  employee: {
    id: number;
    empId: string;
    name: string;
    email?: string;
    department?: string;
    position?: string;
    branch: string;
  };
  assignedBy: {
    id: number;
    username: string;
  };
  inventory: {
    id: number;
    serialNumber?: string;
    status: string;
    condition: string;
    purchaseDate?: string;
    warrantyExpiry?: string;
    location?: string;
    notes?: string;
  };
  product: {
    id: number;
    name: string;
    model: string;
    category: string;
    branch: string;
    department: string;
    warrantyDuration?: number;
    minStockLevel: number;
    createdAt: string;
  };
}

const PublicAssignmentView: React.FC = () => {
    const { assignmentId } = useParams<{ assignmentId: string }>()
    const [assignmentInfo, setAssignmentInfo] = useState<PublicAssignmentInfo | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const fetchAssignment = async () => {
            if (!assignmentId || isNaN(parseInt(assignmentId))) {
                setError('Invalid assignment ID')
                setIsLoading(false)
                console.log('====================================');
                console.log("invalid");
                console.log('====================================');
                return
            }

            try {
                setIsLoading(true)
                setError(null)
                const response = await apiGetPublicAssignmentInfo(parseInt(assignmentId))
                console.log('Assignment response:', response)
                if (response.success) {
                    setAssignmentInfo(response.data)
                } else {
                    setError('Assignment information unavailable')
                }
            } catch (err: any) {
                console.error('Error fetching assignment:', err)
                setError('Unable to retrieve assignment information')
            } finally {
                setIsLoading(false)
            }
        }

        fetchAssignment()
    }, [assignmentId])

    const formatDate = (dateString: string): string => {
        if (!dateString) return 'Not specified'
        return new Date(dateString).toLocaleDateString('en-GB', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        })
    }

    if (isLoading) {
        return (
            <div className=" bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
                <div className="bg-white rounded-xl shadow-md p-8 w-full max-w-md transition-all duration-300 hover:shadow-lg">
                    <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
                        <span className="ml-4 text-gray-600 font-medium">Loading assignment details...</span>
                    </div>
                </div>
            </div>
        )
    }

    if (error || !assignmentInfo) {
        return (
            <div className=" bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
                <div className="bg-white rounded-xl shadow-md p-8 w-full max-w-md transition-all duration-300 hover:shadow-lg">
                    <div className="flex items-center justify-between mb-6">
                        <h1 className="text-2xl font-semibold text-gray-900">Assignment Not Found</h1>
                    </div>
                    <div className="text-center py-8">
                        <div className="text-gray-400 mb-6">
                            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                            </svg>
                        </div>
                        <p className="text-gray-600 mb-4 text-lg">{error || "The requested assignment could not be found."}</p>
                        <p className="text-sm text-gray-500">Assignment ID: {assignmentId}</p>
                        <button 
                            onClick={() => window.history.back()}
                            className="mt-6 px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-300"
                        >
                            Go Back
                        </button>
                    </div>
                </div>
            </div>
        )
    }

    const { assignment, employee, assignedBy, inventory, product } = assignmentInfo

    return (
        <div className="bg-gradient-to-br from-gray-50 to-gray-100 py-10 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl overflow-hidden transition-all duration-300 hover:shadow-2xl">
            
                {/* Content */}
                <div className="p-6 space-y-6">
                    {/* Assignment Header */}
                    <div className="flex items-center p-5 bg-gray-50 rounded-xl border border-gray-200 transition-all duration-300 hover:bg-blue-50">
                        <div className="w-14 h-14 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-xl flex items-center justify-center mr-5 shadow-sm">
                            <svg className="w-7 h-7 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z"/>
                            </svg>
                        </div>
                        <div className="flex-1">
                            <h2 className="text-xl font-bold text-gray-900">Assignment #{assignment.id}</h2>
                            <p className="text-sm text-gray-600 mt-1">Status: {assignment.status}</p>
                        </div>
                    </div>

                    {/* Product Information */}
                    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm transition-all duration-300 hover:shadow-md">
                        <div className="flex items-center mb-5 pb-3 border-b border-gray-100">
                            <div className="w-9 h-9 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 6h16M4 10h16M4 14h16M4 18h16"/>
                                </svg>
                            </div>
                            <h3 className="text-lg font-semibold text-gray-800">Product Information</h3>
                        </div>
                        
                        <div className="space-y-4">
                            <div className="flex justify-between items-center py-3 px-4 rounded-lg hover:bg-gray-50 transition-colors duration-200">
                                <span className="font-medium text-gray-600">Product Name</span>
                                <span className="font-semibold text-gray-900">{product.name}</span>
                            </div>
                            <div className="flex justify-between items-center py-3 px-4 rounded-lg hover:bg-gray-50 transition-colors duration-200">
                                <span className="font-medium text-gray-600">Model</span>
                                <span className="font-semibold text-gray-900">{product.model}</span>
                            </div>
                            <div className="flex justify-between items-center py-3 px-4 rounded-lg hover:bg-gray-50 transition-colors duration-200">
                                <span className="font-medium text-gray-600">Category</span>
                                <span className="font-semibold text-gray-900">{product.category}</span>
                            </div>
                            <div className="flex justify-between items-center py-3 px-4 rounded-lg hover:bg-gray-50 transition-colors duration-200">
                                <span className="font-medium text-gray-600">Serial Number</span>
                                <span className="font-semibold text-gray-900">{inventory.serialNumber || 'Not specified'}</span>
                            </div>
                        </div>
                    </div>

                    {/* Assignment Details */}
                    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm transition-all duration-300 hover:shadow-md">
                        <div className="flex items-center mb-5 pb-3 border-b border-gray-100">
                            <div className="w-9 h-9 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
                                </svg>
                            </div>
                            <h3 className="text-lg font-semibold text-gray-800">Assignment Details</h3>
                        </div>
                        
                        <div className="space-y-4">
                            <div className="flex justify-between items-center py-3 px-4 rounded-lg hover:bg-gray-50 transition-colors duration-200">
                                <span className="font-medium text-gray-600">Assigned To</span>
                                <span className="font-semibold text-gray-900">{employee.name} ({employee.empId})</span>
                            </div>
                            <div className="flex justify-between items-center py-3 px-4 rounded-lg hover:bg-gray-50 transition-colors duration-200">
                                <span className="font-medium text-gray-600">Assigned On</span>
                                <span className="font-semibold text-gray-900">{formatDate(assignment.assignedAt)}</span>
                            </div>
                            <div className="flex justify-between items-center py-3 px-4 rounded-lg hover:bg-gray-50 transition-colors duration-200">
                                <span className="font-medium text-gray-600">Expected Return</span>
                                <span className="font-semibold text-gray-900">{assignment.expectedReturnAt ? formatDate(assignment.expectedReturnAt) : 'Not specified'}</span>
                            </div>
                            <div className="flex justify-between items-center py-3 px-4 rounded-lg hover:bg-gray-50 transition-colors duration-200">
                                <span className="font-medium text-gray-600">Status</span>
                                <span className={`font-semibold ${
                                    assignment.status === 'ASSIGNED' ? 'text-blue-600' :
                                    assignment.status === 'RETURNED' ? 'text-green-600' :
                                    'text-red-600'
                                }`}>
                                    {assignment.status}
                                </span>
                            </div>
                            {assignment.returnedAt && (
                                <div className="flex justify-between items-center py-3 px-4 rounded-lg hover:bg-gray-50 transition-colors duration-200">
                                    <span className="font-medium text-gray-600">Returned On</span>
                                    <span className="font-semibold text-gray-900">{formatDate(assignment.returnedAt)}</span>
                                </div>
                            )}
                            {assignment.isOverdue && (
                                <div className="flex justify-between items-center py-3 px-4 rounded-lg bg-red-50 border border-red-200">
                                    <span className="font-medium text-red-600">Days Overdue</span>
                                    <span className="font-semibold text-red-600">{assignment.daysOverdue} days</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Additional Information */}
                    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm transition-all duration-300 hover:shadow-md">
                        <div className="flex items-center mb-5 pb-3 border-b border-gray-100">
                            <div className="w-9 h-9 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
                                <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                                </svg>
                            </div>
                            <h3 className="text-lg font-semibold text-gray-800">Additional Information</h3>
                        </div>
                        
                        <div className="space-y-4">
                            <div className="flex justify-between items-center py-3 px-4 rounded-lg hover:bg-gray-50 transition-colors duration-200">
                                <span className="font-medium text-gray-600">Assigned By</span>
                                <span className="font-semibold text-gray-900">{assignedBy.username}</span>
                            </div>
                            <div className="flex justify-between items-center py-3 px-4 rounded-lg hover:bg-gray-50 transition-colors duration-200">
                                <span className="font-medium text-gray-600">Inventory Condition</span>
                                <span className="font-semibold text-gray-900">{inventory.condition}</span>
                            </div>
                          
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default PublicAssignmentView