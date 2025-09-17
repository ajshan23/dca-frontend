import { useState, useEffect } from 'react'
import Card from '@/components/ui/Card'
import Progress from '@/components/ui/Progress'
import Chart from '@/components/shared/Chart'
import { COLORS } from '@/constants/chart.constant'
import Button from '@/components/ui/Button'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { apiGetStockSummary, apiGetAssignmentAnalytics } from '@/services/ProductService'
import { apiGetActiveAssignments } from '@/services/ProductService'
import { ClipLoader } from 'react-spinners'
import { HiOutlineExclamation, HiOutlineCheckCircle, HiOutlineClock } from 'react-icons/hi'
import { BiBox, BiCategory } from 'react-icons/bi'
import { MdInventory, MdAssignment } from 'react-icons/md'

interface StockSummary {
  totalProducts: number;
  totalInventory: number;
  stockByStatus: {
    AVAILABLE?: number;
    ASSIGNED?: number;
    MAINTENANCE?: number;
    DAMAGED?: number;
    RETIRED?: number;
  };
  stockByCategory: Array<{
    categoryId: number;
    categoryName: string;
    productCount: number;
    availableStock: number;
  }>;
  lowStockCount: number;
  lowStockProducts: Array<{
    id: number;
    name: string;
    model: string;
    category: string;
    currentStock: number;
    minStock: number;
  }>;
  recentTransactions: Array<{
    id: number;
    type: string;
    reason: string;
    createdAt: string;
    performedBy: string;
    inventory: {
      product: {
        name: string;
        model: string;
        category: string;
      };
    };
  }>;
}

interface Assignment {
  id: number;
  assignedAt: string;
  isOverdue: boolean;
  daysOverdue: number;
  product: {
    id: number;
    name: string;
    model: string;
    category: {
      name: string;
    };
  };
  employee: {
    id: number;
    name: string;
    empId: string;
  };
  inventory: {
    id: number;
    serialNumber?: string;
  };
}

interface CurrentUser {
  username: string;
  role: string;
  name: string;
  email: string;
}

const ProductDashboard = () => {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        setCurrentUser(JSON.parse(userData));
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }
  }, []);

  const {
    data: stockSummaryResponse,
    isLoading: isLoadingStock,
    error: stockError
  } = useQuery({
    queryKey: ['stock-summary'],
    queryFn: apiGetStockSummary
  });

  const {
    data: assignmentsResponse,
    isLoading: isLoadingAssignments
  } = useQuery({
    queryKey: ['recent-assignments'],
    queryFn: () => apiGetActiveAssignments({ page: 1, limit: 5 })
  });

  const {
    data: analyticsResponse,
    isLoading: isLoadingAnalytics
  } = useQuery({
    queryKey: ['assignment-analytics'],
    queryFn: () => apiGetAssignmentAnalytics()
  });

  const stockSummary: StockSummary | null = stockSummaryResponse?.data?.data || stockSummaryResponse?.data;
  const recentAssignments: Assignment[] = assignmentsResponse?.data?.data?.data || assignmentsResponse?.data?.data || [];
  const analytics = analyticsResponse?.data?.data || analyticsResponse?.data;

  const isLoading = isLoadingStock || isLoadingAssignments || isLoadingAnalytics;

  const stockStatusData = {
    data: Object.values(stockSummary?.stockByStatus || {}),
    labels: Object.keys(stockSummary?.stockByStatus || {})
  };

  const categoryChartData = {
    data: stockSummary?.stockByCategory?.map(item => item.availableStock) || [],
    labels: stockSummary?.stockByCategory?.map(item => item.categoryName) || []
  };

  const overdueAssignments = recentAssignments.filter(a => a.isOverdue);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <ClipLoader 
          color="#3b82f6"
          size={50}
          speedMultiplier={0.8}
        />
      </div>
    );
  }

  if (stockError) {
    return (
      <div className="flex justify-center items-center h-full">
        <p className="text-red-500">Failed to load dashboard data: {stockError.message}</p>
      </div>
    );
  }

  if (!stockSummary) {
    return (
      <div className="flex justify-center items-center h-full">
        <p className="text-gray-500">No dashboard data available</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 h-full p-6">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg p-6 shadow-sm">
        <h2 className="text-2xl font-bold mb-2">
          Welcome back, {currentUser?.name || currentUser?.username || 'User'}!
        </h2>
        <p className="text-gray-600 dark:text-gray-300">
          You're managing {stockSummary.totalProducts || 0} products across {stockSummary.stockByCategory?.length || 0} categories
        </p>
      </div>

      {/* Quick Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Products</p>
              <p className="text-2xl font-bold">{stockSummary.totalProducts || 0}</p>
            </div>
            <BiBox className="h-8 w-8 text-blue-500" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Available Stock</p>
              <p className="text-2xl font-bold text-green-600">{stockSummary.stockByStatus?.AVAILABLE || 0}</p>
            </div>
            <MdInventory className="h-8 w-8 text-green-500" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Categories</p>
              <p className="text-2xl font-bold text-purple-600">{stockSummary.stockByCategory?.length || 0}</p>
            </div>
            <BiCategory className="h-8 w-8 text-purple-500" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Active Assignments</p>
              <p className="text-2xl font-bold text-blue-600">{analytics?.activeAssignments || 0}</p>
            </div>
            <MdAssignment className="h-8 w-8 text-blue-500" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Low Stock Alerts</p>
              <p className="text-2xl font-bold text-orange-600">{stockSummary.lowStockCount || 0}</p>
            </div>
            <HiOutlineExclamation className="h-8 w-8 text-orange-500" />
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Category Distribution Chart */}
        <Card>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Stock by Category</h3>
            <Button size="xs" onClick={() => navigate('/categories')}>
              View Categories
            </Button>
          </div>
          {categoryChartData.data.length > 0 ? (
            <Chart
              series={categoryChartData.data}
              xAxis={categoryChartData.labels}
              height={300}
              type="donut"
              customOptions={{
                colors: COLORS,
                legend: { show: true, position: 'bottom' },
                dataLabels: { enabled: true },
                plotOptions: {
                  pie: {
                    donut: {
                      labels: {
                        show: true,
                        total: {
                          show: true,
                          label: 'Total Stock',
                          formatter: () => `${stockSummary.totalInventory} items`
                        }
                      }
                    }
                  }
                }
              }}
            />
          ) : (
            <div className="flex items-center justify-center h-64 text-gray-500">
              No category data available
            </div>
          )}
        </Card>

        {/* Stock Status Chart */}
        <Card>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Inventory Status</h3>
          </div>
          {stockStatusData.data.length > 0 ? (
            <Chart
              series={stockStatusData.data}
              xAxis={stockStatusData.labels}
              height={300}
              type="bar"
              customOptions={{
                colors: [COLORS[0], COLORS[1], COLORS[2], COLORS[3], COLORS[4]],
                legend: { show: false },
                plotOptions: {
                  bar: {
                    distributed: true,
                    borderRadius: 4,
                    columnWidth: '60%'
                  }
                }
              }}
            />
          ) : (
            <div className="flex items-center justify-center h-64 text-gray-500">
              No inventory data available
            </div>
          )}
        </Card>

        {/* Alerts and Notifications */}
        <Card>
          <h3 className="text-lg font-semibold mb-4">Alerts & Status</h3>
          <div className="space-y-4">
            {(stockSummary.lowStockCount || 0) > 0 && (
              <div className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
                <div className="flex items-center gap-2 mb-2">
                  <HiOutlineExclamation className="h-4 w-4 text-orange-500" />
                  <span className="text-sm font-medium text-orange-800 dark:text-orange-300">
                    Low Stock Warning
                  </span>
                </div>
                <p className="text-xs text-orange-700 dark:text-orange-400">
                  {stockSummary.lowStockCount} products are below minimum stock level
                </p>
                <Button 
                  size="xs" 
                  className="mt-2"
                  onClick={() => navigate('/products?stockStatus=low')}
                >
                  View Products
                </Button>
              </div>
            )}

            {overdueAssignments.length > 0 && (
              <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                <div className="flex items-center gap-2 mb-2">
                  <HiOutlineClock className="h-4 w-4 text-red-500" />
                  <span className="text-sm font-medium text-red-800 dark:text-red-300">
                    Overdue Returns
                  </span>
                </div>
                <p className="text-xs text-red-700 dark:text-red-400">
                  {overdueAssignments.length} assignments are overdue
                </p>
                <Button 
                  size="xs" 
                  className="mt-2"
                  onClick={() => navigate('/assignments?overdue=true')}
                >
                  View Assignments
                </Button>
              </div>
            )}

            {(stockSummary.lowStockCount || 0) === 0 && overdueAssignments.length === 0 && (
              <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                <div className="flex items-center gap-2 mb-2">
                  <HiOutlineCheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm font-medium text-green-800 dark:text-green-300">
                    All Systems Normal
                  </span>
                </div>
                <p className="text-xs text-green-700 dark:text-green-400">
                  No immediate attention required
                </p>
              </div>
            )}

            <div className="space-y-2 pt-2 border-t border-gray-200 dark:border-gray-700">
              <div className="flex justify-between text-sm">
                <span>Total Categories:</span>
                <span className="font-medium">{stockSummary.stockByCategory?.length || 0}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Return Rate:</span>
                <span className="font-medium">{analytics?.returnRate || '0'}%</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Damaged Items:</span>
                <span className="font-medium">{stockSummary.stockByStatus?.DAMAGED || 0}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>In Maintenance:</span>
                <span className="font-medium">{stockSummary.stockByStatus?.MAINTENANCE || 0}</span>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Category-wise Stock Table */}
      {stockSummary?.stockByCategory && stockSummary.stockByCategory.length > 0 && (
        <Card>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Category-wise Stock Summary</h3>
            <Button size="xs" onClick={() => navigate('/categories')}>
              Manage Categories
            </Button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-2">Category</th>
                  <th className="text-center py-2">Products</th>
                  <th className="text-center py-2">Available Stock</th>
                  <th className="text-center py-2">Stock Percentage</th>
                  <th className="text-center py-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {stockSummary.stockByCategory.map((category, index) => {
                  const percentage = stockSummary.totalInventory > 0 
                    ? Math.round((category.availableStock / stockSummary.totalInventory) * 100)
                    : 0;
                  
                  const lowStockProductsInCategory = stockSummary.lowStockProducts?.filter(
                    p => p.category === category.categoryName
                  ).length || 0;
                  
                  return (
                    <tr key={category.categoryId} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="py-3 font-medium">{category.categoryName}</td>
                      <td className="py-3 text-center">{category.productCount}</td>
                      <td className="py-3 text-center">{category.availableStock}</td>
                      <td className="py-3 text-center">
                        <div className="flex items-center justify-center">
                          <Progress 
                            percent={percentage} 
                            className="w-20 mr-2" 
                            color={percentage > 20 ? COLORS[index % COLORS.length] : COLORS[COLORS.length - 1]}
                          />
                          <span>{percentage}%</span>
                        </div>
                      </td>
                      <td className="py-3 text-center">
                        {lowStockProductsInCategory > 0 ? (
                          <span className="px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded-full">
                            {lowStockProductsInCategory} low stock
                          </span>
                        ) : (
                          <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                            Healthy
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Recent Activity Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Assignments */}
        <Card>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Recent Assignments</h3>
            <Button size="xs" onClick={() => navigate('/assignments')}>
              View All
            </Button>
          </div>
          <div className="space-y-3">
            {recentAssignments.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No recent assignments</p>
            ) : (
              recentAssignments.map((assignment) => (
                <div key={assignment.id} className="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-medium">{assignment.product.name}</h4>
                    <div className="text-sm text-gray-500 space-y-1">
                      <p>To: {assignment.employee.name} ({assignment.employee.empId})</p>
                      <p>Category: {assignment.product.category.name}</p>
                      <p>Item: {assignment.inventory.serialNumber || `#${assignment.inventory.id}`}</p>
                      <p>{new Date(assignment.assignedAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className={`px-2 py-1 rounded text-xs font-medium ${assignment.isOverdue ? "bg-red-100 text-red-800" : "bg-blue-100 text-blue-800"}`}>
                    {assignment.isOverdue ? `Overdue (${assignment.daysOverdue}d)` : 'Active'}
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>

        {/* Recent Stock Transactions */}
        <Card>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Recent Stock Activity</h3>
            <Button size="xs" onClick={() => navigate('/products/transactions/history')}>
              View All
            </Button>
          </div>
          <div className="space-y-3">
            {!stockSummary.recentTransactions || stockSummary.recentTransactions.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No recent transactions</p>
            ) : (
              stockSummary.recentTransactions.map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-medium">{transaction.inventory.product.name}</h4>
                    <div className="text-sm text-gray-500 space-y-1">
                      <p>Category: {transaction.inventory.product.category}</p>
                      <p>{transaction.reason}</p>
                      <p>By: {transaction.performedBy || 'System'}</p>
                      <p>{new Date(transaction.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className={`px-2 py-1 rounded text-xs font-medium ${
                    transaction.type === 'IN' ? 'bg-green-100 text-green-800' :
                    transaction.type === 'OUT' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {transaction.type}
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>

      {/* Low Stock Products */}
      {stockSummary.lowStockProducts && stockSummary.lowStockProducts.length > 0 && (
        <Card>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Products Requiring Attention</h3>
            <Button size="xs" onClick={() => navigate('/products?stockStatus=low')}>
              Manage Stock
            </Button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-2">Product</th>
                  <th className="text-left py-2">Model</th>
                  <th className="text-left py-2">Category</th>
                  <th className="text-center py-2">Current Stock</th>
                  <th className="text-center py-2">Min Required</th>
                  <th className="text-center py-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {stockSummary.lowStockProducts.map((product) => (
                  <tr key={product.id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="py-3 font-medium">{product.name}</td>
                    <td className="py-3">{product.model}</td>
                    <td className="py-3">{product.category}</td>
                    <td className="py-3 text-center">{product.currentStock}</td>
                    <td className="py-3 text-center">{product.minStock}</td>
                    <td className="py-3 text-center">
                      <div className={`px-2 py-1 rounded text-xs font-medium ${
                        product.currentStock === 0 ? 'bg-red-100 text-red-800' : 'bg-orange-100 text-orange-800'
                      }`}>
                        {product.currentStock === 0 ? 'Out of Stock' : 'Low Stock'}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
};

export default ProductDashboard;