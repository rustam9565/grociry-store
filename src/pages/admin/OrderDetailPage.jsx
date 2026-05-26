import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useGetOrderByIdQuery, useUpdateOrderStatusMutation } from '../../store/api/orderApi'
import Loader from '../../components/Loader'
import Message from '../../components/Message'
import toast from 'react-hot-toast'

const OrderDetailPage = () => {
  const { id } = useParams()
  const { data: order, isLoading, error, refetch } = useGetOrderByIdQuery(id)
  const [updateOrderStatus] = useUpdateOrderStatusMutation()
  const [status, setStatus] = useState('')

  useEffect(() => {
    if (order) setStatus(order.status)
  }, [order])

  const handleStatusUpdate = async (newStatus) => {
    if (!order) return
    try {
      await updateOrderStatus({ id: order._id, status: newStatus }).unwrap()
      toast.success('Order status updated')
      setStatus(newStatus)
      refetch()
    } catch (err) {
      toast.error('Unable to update order status')
    }
  }

  if (isLoading) return <Loader />

  if (error) {
    return <Message type="error">Unable to load order details.</Message>
  }

  if (!order) {
    return <Message type="info">Order not found.</Message>
  }

  return (
    <div className="container-padding py-8">
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Order #{order._id.slice(-8)}</h1>
          <p className="text-gray-600 mt-1">Customer: {order.user?.name || 'Guest'} • {order.user?.email}</p>
        </div>
        <Link to="/admin/orders" className="btn btn-secondary">
          Back to Orders
        </Link>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="card p-6 xl:col-span-2">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Shipping Information</h2>
            <div className="mt-3 text-sm text-gray-600 space-y-2">
              <div>{order.shippingAddress.address}</div>
              <div>{order.shippingAddress.city}, {order.shippingAddress.postalCode}</div>
              <div>{order.shippingAddress.country}</div>
            </div>
          </div>

          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Payment</h2>
            <p className="mt-3 text-sm text-gray-600">Method: {order.paymentMethod}</p>
            <p className={`mt-2 text-sm font-semibold ${order.isPaid ? 'text-green-700' : 'text-yellow-700'}`}>
              {order.isPaid ? `Paid on ${new Date(order.paidAt).toLocaleDateString()}` : 'Not paid yet'}
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-gray-900">Items</h2>
            <div className="mt-4 space-y-4">
              {order.orderItems.map((item) => (
                <div key={item.product} className="flex items-center gap-4 rounded-3xl border border-gray-200 p-4">
                  <img src={item.image} alt={item.name} className="w-20 h-20 object-cover rounded-lg" />
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{item.name}</p>
                    <p className="text-sm text-gray-500">Qty: {item.qty}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">${(item.price * item.qty).toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="card p-6 space-y-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Order Summary</h2>
            <div className="mt-4 space-y-3 text-sm text-gray-600">
              <div className="flex justify-between">
                <span>Items total</span>
                <span>${order.itemsPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span>${order.shippingPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Tax</span>
                <span>${order.taxPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-semibold text-gray-900">
                <span>Total</span>
                <span>${order.totalPrice.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-gray-900">Status</h2>
            <select
              value={status}
              onChange={(e) => {
                setStatus(e.target.value)
                handleStatusUpdate(e.target.value)
              }}
              className="mt-4 w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900"
            >
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  )
}

export default OrderDetailPage
