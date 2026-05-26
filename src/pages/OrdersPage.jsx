import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useGetMyOrdersQuery } from '../store/api/orderApi'
import Loader from '../components/Loader'
import Message from '../components/Message'

const OrdersPage = () => {
  const [filter, setFilter] = useState('all')
  const { data: orders, isLoading, error } = useGetMyOrdersQuery()
  
  const filteredOrders = orders?.filter(order => {
    if (filter === 'all') return true
    return order.status === filter
  })
  
  const getStatusColor = (status) => {
    switch (status) {
      case 'delivered': return 'bg-green-100 text-green-800'
      case 'shipped': return 'bg-blue-100 text-blue-800'
      case 'processing': return 'bg-yellow-100 text-yellow-800'
      case 'pending': return 'bg-gray-100 text-gray-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }
  
  const getStatusIcon = (status) => {
    switch (status) {
      case 'delivered': return 'ri-checkbox-circle-line'
      case 'shipped': return 'ri-truck-line'
      case 'processing': return 'ri-refresh-line'
      case 'pending': return 'ri-time-line'
      case 'cancelled': return 'ri-close-circle-line'
      default: return 'ri-information-line'
    }
  }
  
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }
  
  if (isLoading) return <Loader />
  
  return (
    <div className="container-padding py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Orders</h1>
          <p className="text-gray-600 mt-1">Track and manage your orders</p>
        </div>
        <Link to="/products" className="btn btn-primary">
          <i className="ri-shopping-bag-line mr-2"></i>
          Continue Shopping
        </Link>
      </div>
      
      {/* Filters */}
      <div className="flex gap-3 mb-8 overflow-x-auto pb-2 scrollbar-hide">
  {['all', 'pending', 'processing', 'shipped', 'delivered', 'cancelled'].map((status) => (
    <button
      key={status}
      onClick={() => setFilter(status)}
      className={`
        flex items-center gap-2
        px-5 py-3
        rounded-2xl
        whitespace-nowrap
        font-medium
        text-sm
        transition-all
        duration-300
        border
        ${
          filter === status
            ? 'bg-slate-900 text-white border-slate-900 shadow-lg scale-105'
            : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50 hover:-translate-y-0.5'
        }
      `}
    >
      <span>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>

      {status !== 'all' && (
        <span
          className={`
            px-2 py-0.5
            rounded-full
            text-xs
            ${
              filter === status
                ? 'bg-white/20 text-white'
                : 'bg-slate-100 text-slate-600'
            }
          `}
        >
          {orders?.filter(o => o.status === status).length || 0}
        </span>
      )}
    </button>
  ))}
</div>
      {error ? (
        <Message type="error">
          Failed to load orders. Please try again later.
        </Message>
      ) : filteredOrders?.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <i className="ri-shopping-bag-line text-3xl text-gray-400"></i>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No orders found</h3>
          <p className="text-gray-600 mb-6">
            {filter === 'all' 
              ? "You haven't placed any orders yet."
              : `You don't have any ${filter} orders.`
            }
          </p>
          <Link to="/products" className="btn btn-primary">
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders?.map((order) => (
            <div key={order._id} className="card">
              <div className="p-6">
                {/* Order Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
                  <div>
                    <div className="flex items-center space-x-4">
                      <h3 className="text-lg font-semibold">Order #{order._id.slice(-8)}</h3>
                      <span className={`badge ${getStatusColor(order.status)} px-3 py-1`}>
                        <i className={`${getStatusIcon(order.status)} mr-2`}></i>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </span>
                    </div>
                    <p className="text-gray-600 mt-1">
                      Placed on {formatDate(order.createdAt)} • {order.orderItems.length} items
                    </p>
                  </div>
                  
                  <div className="mt-4 md:mt-0">
                    <div className="text-right">
                      <div className="text-2xl font-bold">${order.totalPrice.toFixed(2)}</div>
                      <p className="text-sm text-gray-600">Total amount</p>
                    </div>
                  </div>
                </div>
                
                {/* Order Items Preview */}
                <div className="border-t pt-4">
                  <div className="flex overflow-x-auto space-x-4 pb-2">
                    {order.orderItems.slice(0, 4).map((item, index) => (
                      <div key={index} className="flex-shrink-0 w-20">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-20 h-20 object-cover rounded"
                        />
                      </div>
                    ))}
                    {order.orderItems.length > 4 && (
                      <div className="flex-shrink-0 w-20 h-20 bg-gray-100 rounded flex items-center justify-center">
                        <span className="text-gray-600 font-medium">
                          +{order.orderItems.length - 4}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  {/* Actions */}
                  <div className="flex flex-wrap gap-3 mt-6">
                    <Link
                      to={`/order/${order._id}`}
                      className="btn btn-outline"
                    >
                      <i className="ri-eye-line mr-2"></i>
                      View Details
                    </Link>
                    
                    {order.status === 'delivered' && (
                      <button className="btn btn-outline">
                        <i className="ri-refresh-line mr-2"></i>
                        Buy Again
                      </button>
                    )}
                    
                    {order.status === 'pending' && (
                      <button className="btn btn-outline text-red-600 border-red-300 hover:bg-red-50">
                        <i className="ri-close-line mr-2"></i>
                        Cancel Order
                      </button>
                    )}
                    
                    {order.isDelivered && (
                      <button className="btn btn-outline">
                        <i className="ri-star-line mr-2"></i>
                        Rate Products
                      </button>
                    )}
                    
                    <button className="btn btn-outline">
                      <i className="ri-printer-line mr-2"></i>
                      Print Invoice
                    </button>
                  </div>
                </div>
                
                {/* Delivery Info */}
                {order.deliveryDate && (
                  <div className="mt-4 pt-4 border-t">
                    <div className="flex items-center text-gray-600">
                      <i className="ri-truck-line mr-2"></i>
                      <span>
                        Scheduled for {new Date(order.deliveryDate).toLocaleDateString()} • 
                        Delivery {order.deliverySlot}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* Order Statistics */}
      {orders && orders.length > 0 && (
        <div className="mt-8">
          <h3 className="text-lg font-semibold mb-4">Order Statistics</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="card p-4 text-center">
              <div className="text-3xl font-bold text-primary-600 mb-1">{orders.length}</div>
              <div className="text-sm text-gray-600">Total Orders</div>
            </div>
            <div className="card p-4 text-center">
              <div className="text-3xl font-bold text-green-600 mb-1">
                {orders.filter(o => o.status === 'delivered').length}
              </div>
              <div className="text-sm text-gray-600">Delivered</div>
            </div>
            <div className="card p-4 text-center">
              <div className="text-3xl font-bold text-blue-600 mb-1">
                {orders.filter(o => o.status === 'processing').length}
              </div>
              <div className="text-sm text-gray-600">Processing</div>
            </div>
            <div className="card p-4 text-center">
              <div className="text-3xl font-bold text-yellow-600 mb-1">
                {orders.filter(o => o.status === 'pending').length}
              </div>
              <div className="text-sm text-gray-600">Pending</div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default OrdersPage