import { useState } from 'react'
import { Link } from 'react-router-dom'
import { 
  useGetAllOrdersQuery,
  useUpdateOrderStatusMutation 
} from '../../store/api/orderApi'
import Loader from '../../components/Loader'
import Message from '../../components/Message'
import toast from 'react-hot-toast'

const OrdersPage = () => {
  const [statusFilter, setStatusFilter] = useState('all')
  const [search, setSearch] = useState('')
  
  const { data: orders, isLoading, error, refetch } = useGetAllOrdersQuery()
  const [updateStatus] = useUpdateOrderStatusMutation()
  
  const filteredOrders = orders?.filter(order => {
    if (statusFilter !== 'all' && order.status !== statusFilter) return false
    if (search && !order._id.includes(search) && !order.user?.name?.toLowerCase().includes(search.toLowerCase())) {
      return false
    }
    return true
  })
  
  const statusOptions = [
    { value: 'all', label: 'All Orders', color: 'gray' },
    { value: 'pending', label: 'Pending', color: 'yellow' },
    { value: 'processing', label: 'Processing', color: 'blue' },
    { value: 'shipped', label: 'Shipped', color: 'purple' },
    { value: 'delivered', label: 'Delivered', color: 'green' },
    { value: 'cancelled', label: 'Cancelled', color: 'red' }
  ]
  
  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      await updateStatus({ id: orderId, status: newStatus }).unwrap()
      toast.success('Order status updated')
      refetch()
    } catch (err) {
      toast.error('Failed to update status')
    }
  }
  
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }
  
  if (isLoading) return <Loader />
  
  return (
    <div className="container-padding py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Order Management</h1>
          <p className="text-gray-600 mt-1">Manage customer orders</p>
        </div>
        <div className="flex items-center space-x-4">
          <button className="btn btn-primary">
            <i className="ri-download-line mr-2"></i>
            Export Orders
          </button>
        </div>
      </div>
      
      {/* Filters */}
      <div className="card p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
            <input
              type="text"
              className="input"
              placeholder="Search by order ID or customer name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              className="input"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              {statusOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date Range</label>
            <select className="input">
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="year">This Year</option>
              <option value="all">All Time</option>
            </select>
          </div>
        </div>
      </div>
      
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {statusOptions.slice(1).map((status) => (
          <div key={status.value} className="card p-4">
            <div className="text-sm text-gray-600">{status.label}</div>
            <div className="text-2xl font-bold mt-1">
              {orders?.filter(o => o.status === status.value).length || 0}
            </div>
          </div>
        ))}
      </div>
      
      {error ? (
        <Message type="error">
          Failed to load orders. Please try again later.
        </Message>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Order ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Items
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredOrders?.map((order) => (
                  <tr key={order._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        #{order._id.slice(-8)}
                      </div>
                      <div className="text-sm text-gray-500">
                        {order.paymentMethod}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {order.user?.name || 'Guest'}
                      </div>
                      <div className="text-sm text-gray-500">
                        {order.user?.email}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(order.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {order.orderItems.length} items
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        ${order.totalPrice.toFixed(2)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <select
                        value={order.status}
                        onChange={(e) => handleStatusUpdate(order._id, e.target.value)}
                        className="text-sm border-gray-300 rounded focus:ring-primary-500 focus:border-primary-500"
                      >
                        <option value="pending">Pending</option>
                        <option value="processing">Processing</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-3">
                        <Link
                          to={`/order/${order._id}`}
                          className="text-primary-600 hover:text-primary-900"
                          title="View Details"
                        >
                          <i className="ri-eye-line"></i>
                        </Link>
                        <Link
                          to={`/admin/orders/${order._id}`}
                          className="text-gray-600 hover:text-gray-900"
                          title="Edit"
                        >
                          <i className="ri-edit-line"></i>
                        </Link>
                        <button
                          className="text-red-600 hover:text-red-900"
                          title="Delete"
                          onClick={() => {
                            if (window.confirm('Delete this order?')) {
                              // Handle delete
                            }
                          }}
                        >
                          <i className="ri-delete-bin-line"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      
      {/* Summary */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card p-4">
          <div className="text-sm text-gray-600">Total Orders</div>
          <div className="text-2xl font-bold mt-1">{orders?.length || 0}</div>
        </div>
        <div className="card p-4">
          <div className="text-sm text-gray-600">Total Revenue</div>
          <div className="text-2xl font-bold mt-1">
            ${orders?.reduce((sum, order) => sum + order.totalPrice, 0).toFixed(2) || '0.00'}
          </div>
        </div>
        <div className="card p-4">
          <div className="text-sm text-gray-600">Avg. Order Value</div>
          <div className="text-2xl font-bold mt-1">
            ${orders && orders.length > 0 
              ? (orders.reduce((sum, order) => sum + order.totalPrice, 0) / orders.length).toFixed(2)
              : '0.00'
            }
          </div>
        </div>
      </div>
    </div>
  )
}

export default OrdersPage