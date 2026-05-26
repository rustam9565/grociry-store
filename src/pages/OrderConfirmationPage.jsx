import { useParams, Link } from 'react-router-dom'
import { useGetOrderByIdQuery } from '../store/api/orderApi'
import Loader from '../components/Loader'
import Message from '../components/Message'

const OrderConfirmationPage = () => {
  const { id } = useParams()
  const { data: order, isLoading, error } = useGetOrderByIdQuery(id)
  
  if (isLoading) return <Loader />
  if (error) return <Message type="error">Order not found</Message>
  if (!order) return null
  
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
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }
  
  return (
    <div className="container-padding py-12">
      <div className="max-w-4xl mx-auto">
        {/* Success Message */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <i className="ri-checkbox-circle-line text-4xl text-green-600"></i>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Order Confirmed!</h1>
          <p className="text-gray-600">
            Thank you for your order. We've sent a confirmation email with your order details.
          </p>
          <p className="text-gray-600">
            Order ID: <span className="font-mono font-medium">{order._id}</span>
          </p>
        </div>
        
        {/* Order Status */}
        <div className="card mb-6">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Order Status</h2>
                <p className="text-gray-600">Placed on {formatDate(order.createdAt)}</p>
              </div>
              <span className={`badge ${getStatusColor(order.status)} px-3 py-1`}>
                <i className={`${getStatusIcon(order.status)} mr-2`}></i>
                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
              </span>
            </div>
            
            {/* Status Timeline */}
            <div className="relative">
              <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200"></div>
              
              {[
                { status: 'pending', label: 'Order Placed', date: order.createdAt },
                { status: 'processing', label: 'Processing', date: order.createdAt },
                { status: 'shipped', label: 'Shipped', date: order.deliveredAt },
                { status: 'delivered', label: 'Delivered', date: order.deliveredAt }
              ].map((step, index) => {
                const isCompleted = 
                  (step.status === 'pending') ||
                  (step.status === 'processing' && ['processing', 'shipped', 'delivered'].includes(order.status)) ||
                  (step.status === 'shipped' && ['shipped', 'delivered'].includes(order.status)) ||
                  (step.status === 'delivered' && order.status === 'delivered')
                
                return (
                  <div key={step.status} className="relative flex items-start mb-8 last:mb-0">
                    <div className={`z-10 flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${isCompleted ? 'bg-primary-600' : 'bg-gray-200'}`}>
                      {isCompleted ? (
                        <i className="ri-check-line text-white text-sm"></i>
                      ) : (
                        <span className="text-gray-400 text-sm">{index + 1}</span>
                      )}
                    </div>
                    <div className="ml-4">
                      <h3 className={`font-medium ${isCompleted ? 'text-gray-900' : 'text-gray-500'}`}>
                        {step.label}
                      </h3>
                      {step.date && (
                        <p className="text-sm text-gray-500">
                          {formatDate(step.date)}
                        </p>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Shipping Address */}
          <div className="card">
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4">Shipping Address</h3>
              <div className="space-y-1">
                <p className="font-medium">{order.user?.name || 'Guest'}</p>
                <p>{order.shippingAddress.street}</p>
                <p>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}</p>
                <p>{order.shippingAddress.country}</p>
                <p className="pt-2">Phone: {order.shippingAddress.phone}</p>
              </div>
            </div>
          </div>
          
          {/* Order Details */}
          <div className="card">
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4">Order Details</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Order ID</span>
                  <span className="font-medium">{order._id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Order Date</span>
                  <span className="font-medium">{formatDate(order.createdAt)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Payment Method</span>
                  <span className="font-medium capitalize">{order.paymentMethod}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Delivery Date</span>
                  <span className="font-medium">
                    {new Date(order.deliveryDate).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Delivery Slot</span>
                  <span className="font-medium capitalize">{order.deliverySlot}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Order Items */}
        <div className="card mb-8">
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-4">Order Items ({order.orderItems.length})</h3>
            <div className="space-y-4">
              {order.orderItems.map((item) => (
                <div key={item._id} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-16 h-16 object-cover rounded mr-4"
                    />
                    <div>
                      <h4 className="font-medium">{item.name}</h4>
                      <p className="text-sm text-gray-600">Qty: {item.quantity} × ${item.price.toFixed(2)}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">${(item.price * item.quantity).toFixed(2)}</div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Price Summary */}
            <div className="border-t mt-6 pt-6">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">${order.itemsPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping</span>
                  <span className="font-medium">
                    {order.shippingPrice === 0 ? 'FREE' : `$${order.shippingPrice.toFixed(2)}`}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tax</span>
                  <span className="font-medium">${order.taxPrice.toFixed(2)}</span>
                </div>
                <div className="border-t pt-2">
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span>${order.totalPrice.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/products" className="btn btn-primary">
            <i className="ri-shopping-bag-line mr-2"></i>
            Continue Shopping
          </Link>
          <Link to="/orders" className="btn btn-outline">
            <i className="ri-list-check-2 mr-2"></i>
            View All Orders
          </Link>
          <button className="btn btn-outline">
            <i className="ri-printer-line mr-2"></i>
            Print Receipt
          </button>
        </div>
        
        {/* Support */}
        <div className="mt-12 text-center">
          <div className="inline-flex items-center justify-center p-4 bg-gray-50 rounded-lg">
            <i className="ri-customer-service-2-line text-2xl text-primary-600 mr-3"></i>
            <div className="text-left">
              <p className="font-medium">Need help with your order?</p>
              <p className="text-sm text-gray-600">
                Contact our support team at support@grocerystore.com
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default OrderConfirmationPage