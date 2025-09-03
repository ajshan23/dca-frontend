import { useState, useMemo } from 'react';
import DataTable from '@/components/shared/DataTable';
import { HiOutlineEye, HiOutlineRefresh } from 'react-icons/hi';
import { useQuery } from '@tanstack/react-query';
import { apiGetActiveAssignments, apiGetAssignmentHistory } from '@/services/ProductService';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Select from '@/components/ui/Select';
import { DatePicker } from '@/components/ui';
import { AdaptableCard } from '@/components/shared';

const AssignmentList = () => {
  const [viewMode, setViewMode] = useState<'active' | 'history'>('active');
  const [dateRange, setDateRange] = useState<{
    startDate?: Date;
    endDate?: Date;
  }>({});

  const { data: activeAssignments, isLoading: activeLoading, refetch: refetchActive } = useQuery({
    queryKey: ['active-assignments'],
    queryFn: apiGetActiveAssignments,
    enabled: viewMode === 'active'
  });

  const { data: assignmentHistory, isLoading: historyLoading, refetch: refetchHistory } = useQuery({
    queryKey: ['assignment-history', dateRange],
    queryFn: () => apiGetAssignmentHistory({
      fromDate: dateRange.startDate?.toISOString(),
      toDate: dateRange.endDate?.toISOString()
    }),
    enabled: viewMode === 'history'
  });

  const columns = useMemo(() => [
    {
      header: 'Product',
      cell: (props: any) => (
        <div>
          <p className="font-semibold">{props.row.original.product.name}</p>
          <p className="text-sm text-gray-500">{props.row.original.product.serialNumber}</p>
        </div>
      ),
    },
    {
      header: 'Employee',
      cell: (props: any) => (
        <div>
          <p className="font-medium">{props.row.original.employee.name}</p>
          <p className="text-sm text-gray-500">{props.row.original.employee.empId}</p>
        </div>
      ),
    },
    {
      header: 'Details',
      cell: (props: any) => (
        <div>
          <p>Assigned: {new Date(props.row.original.assignedAt).toLocaleDateString()}</p>
          {props.row.original.expectedReturnAt && (
            <p>Expected Return: {new Date(props.row.original.expectedReturnAt).toLocaleDateString()}</p>
          )}
          {props.row.original.returnedAt && (
            <p>Returned: {new Date(props.row.original.returnedAt).toLocaleDateString()}</p>
          )}
        </div>
      ),
    },
    {
      header: 'Status',
      cell: (props: any) => (
        <Badge className={
          props.row.original.status === 'assigned' ? 'bg-blue-500' :
          props.row.original.status === 'returned' ? 'bg-green-500' :
          props.row.original.status === 'lost' ? 'bg-red-500' : 'bg-amber-500'
        }>
          {props.row.original.status}
        </Badge>
      ),
    },
    {
      header: 'Actions',
      cell: (props: any) => (
        <Button
          size="xs"
          icon={<HiOutlineEye />}
          onClick={() => {/* Navigate to assignment detail */}}
        />
      ),
    },
  ], []);

  return (
    <AdaptableCard className="h-full" bodyClass="h-full">
      <div className="lg:flex items-center justify-between mb-4">
        <h3 className="mb-4 lg:mb-0">Product Assignments</h3>
        <div className="flex flex-col lg:flex-row lg:items-center gap-2">
          <Select
            className="lg:w-40"
            value={{ value: viewMode, label: viewMode === 'active' ? 'Active' : 'History' }}
            options={[
              { value: 'active', label: 'Active' },
              { value: 'history', label: 'History' }
            ]}
            onChange={(option: any) => setViewMode(option.value)}
          />
          {viewMode === 'history' && (
            <DatePicker.RangePicker
              value={[dateRange.startDate, dateRange.endDate]}
              onChange={(dates) => setDateRange({
                startDate: dates?.[0] || undefined,
                endDate: dates?.[1] || undefined
              })}
            />
          )}
          <Button
            icon={<HiOutlineRefresh />}
            onClick={viewMode === 'active' ? refetchActive : refetchHistory}
          />
        </div>
      </div>

      <DataTable
        columns={columns}
        data={viewMode === 'active' ? activeAssignments?.data || [] : assignmentHistory?.data || []}
        loading={viewMode === 'active' ? activeLoading : historyLoading}
      />
    </AdaptableCard>
  );
};

export default AssignmentList;