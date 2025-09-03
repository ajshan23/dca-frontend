import ApiService from './ApiService'
import { formatDistanceToNow } from 'date-fns'

export interface DashboardData {
  summary: {
    products: number
    assigned: number
    categories: number
    branches: number
    employees: number
  }
  weeklyTrend: Array<{
    day: string
    assignments: number
  }>
  recentActivities: Array<{
    id: number
    product: {
      name: string
    }
    employee: {
      name: string
    }
    assignedAt: string
  }>
  categoryDistribution: Array<{
    name: string
    _count: {
      products: number
    }
  }>
}

export const apiGetDashboardData = async (): Promise<DashboardData> => {
  try {
    console.log('Fetching dashboard data...')
    const response = await ApiService.fetchData<{ 
      success: boolean
      data?: DashboardData
      message?: string
    }>({
      url: '/dashboard',
      method: 'get'
    })

    console.log('Dashboard response:', response)

    if (!response.data?.success || !response.data.data) {
      console.error('Invalid dashboard response:', response)
      throw new Error(response.data?.message || 'Invalid dashboard data format')
    }

    const { data } = response.data

    return {
      summary: data.summary || {
        products: 0,
        assigned: 0,
        categories: 0,
        branches: 0,
        employees: 0
      },
      weeklyTrend: data.weeklyTrend || [],
      recentActivities: (data.recentActivities || []).map(activity => ({
        ...activity,
        assignedAt: formatDistanceToNow(new Date(activity.assignedAt)) + ' ago'
      })),
      categoryDistribution: data.categoryDistribution || []
    }
  } catch (error: any) {
    console.error('Detailed dashboard error:', {
      message: error.message,
      response: error.response?.data,
      stack: error.stack
    })
    throw new Error(
      error.response?.data?.message ||
      error.message ||
      'Failed to fetch dashboard data'
    )
  }
}