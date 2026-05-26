import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useGetProductsQuery } from '../../store/api/productApi'
import { useGetAllOrdersQuery } from '../../store/api/orderApi'
import { useGetUsersQuery } from '../../store/api/authApi'
import Loader from '../../components/Loader'

const DashboardPage = () => {
  const [timeRange, setTimeRange] = useState('today')
  
  const { data: productsData, isLoading: productsLoading } = useGetProductsQuery({})
  const { data: ordersData, isLoading: ordersLoading } = useGetAllOrdersQuery()
  const { data: usersData, isLoading: usersLoading } = useGetUsersQuery()
  
  const isLoading = productsLoading || ordersLoading || usersLoading
  
  if (isLoading) return <Loader />
  
  const products = productsData?.products || []
  const orders = ordersData || []
  const users = usersData || []
  
  // Calculate statistics
  const today = new Date()
  const todayOrders = orders.filter(order => 
    new Date(order.createdAt).toDateString() === today.toDateString()
  )
  
  const todayRevenue = todayOrders.reduce((sum, order) => sum + order.totalPrice, 0)
  const totalRevenue = orders.reduce((sum, order) => sum + order.totalPrice, 0)
  
  const lowStockProducts = products.filter(p => p.stock < 10)
  const pendingOrders = orders.filter(o => o.status === 'pending')
  
  const recentOrders = [...orders]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5)
  
  return (
    <div className="container-padding py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-1">Welcome to your store management panel</p>
        </div>
        
        <div className="flex items-center space-x-4">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="input"
          >
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="year">This Year</option>
          </select>
          
          <button className="btn btn-primary">
            <i className="ri-download-line mr-2"></i>
            Export Report
          </button>
        </div>
      </div>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Today's Revenue</p>
              <p className="text-3xl font-bold mt-1">${todayRevenue.toFixed(2)}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <i className="ri-money-dollar-circle-line text-2xl text-green-600"></i>
            </div>
          </div>
          <div className="mt-4">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Total Revenue</span>
              <span className="font-medium">${totalRevenue.toFixed(2)}</span>
            </div>
          </div>
        </div>
        
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Orders</p>
              <p className="text-3xl font-bold mt-1">{orders.length}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <i className="ri-shopping-bag-line text-2xl text-blue-600"></i>
            </div>
          </div>
          <div className="mt-4">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Pending Orders</span>
              <span className="font-medium">{pendingOrders.length}</span>
            </div>
          </div>
        </div>
        
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Products</p>
              <p className="text-3xl font-bold mt-1">{products.length}</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
              <i className="ri-store-2-line text-2xl text-purple-600"></i>
            </div>
          </div>
          <div className="mt-4">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Low Stock</span>
              <span className="font-medium text-red-600">{lowStockProducts.length}</span>
            </div>
          </div>
        </div>
        
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Customers</p>
              <p className="text-3xl font-bold mt-1">{users.length}</p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
              <i className="ri-user-line text-2xl text-orange-600"></i>
            </div>
          </div>
          <div className="mt-4">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Active Today</span>
              <span className="font-medium">{todayOrders.length}</span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Orders */}
        <div className="card">
          <div className="p-6 border-b">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900">Recent Orders</h2>
              <Link to="/admin/orders" className="text-primary-600 hover:text-primary-700 text-sm">
                View All
              </Link>
            </div>
          </div>
          
          <div className="p-6">
            <div className="space-y-4">
              {recentOrders.map((order) => (
                <div key={order._id} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Order #{order._id.slice(-8)}</p>
                    <p className="text-sm text-gray-600">
                      {new Date(order.createdAt).toLocaleDateString()} • {order.orderItems.length} items
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">${order.totalPrice.toFixed(2)}</p>
                    <span className={`text-xs px-2 py-1 rounded-full ${order.status === 'delivered' ? 'bg-green-100 text-green-800' : order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-blue-100 text-blue-800'}`}>
                      {order.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Low Stock Products */}
        <div className="card">
          <div className="p-6 border-b">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900">Low Stock Products</h2>
              <Link to="/admin/products" className="text-primary-600 hover:text-primary-700 text-sm">
                View All
              </Link>
            </div>
          </div>
          
          <div className="p-6">
            <div className="space-y-4">
              {lowStockProducts.slice(0, 5).map((product) => (
                <div key={product._id} className="flex items-center">
                  <img
                    src={product.images[0]?.url}
                    alt={product.name}
                    className="w-12 h-12 object-cover rounded mr-4"
                  />
                  <div className="flex-1">
                    <p className="font-medium">{product.name}</p>
                    <p className="text-sm text-gray-600">Stock: {product.stock}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">${product.price.toFixed(2)}</p>
                    <button className="text-primary-600 hover:text-primary-700 text-sm">
                      Restock
                    </button>
                  </div>
                </div>
              ))}
              
              {lowStockProducts.length === 0 && (
                <p className="text-gray-600 text-center py-4">All products are well stocked</p>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Quick Actions */}
      <div className="mt-8">
        <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link to="/admin/products/new" className="card p-6 text-center hover:shadow-lg transition">
            <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <i className="ri-add-line text-2xl text-primary-600"></i>
            </div>
            <p className="font-medium">Add Product</p>
          </Link>
          
          <Link to="/admin/orders" className="card p-6 text-center hover:shadow-lg transition">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <i className="ri-list-check-2 text-2xl text-green-600"></i>
            </div>
            <p className="font-medium">Manage Orders</p>
          </Link>
          
          <Link to="/admin/products" className="card p-6 text-center hover:shadow-lg transition">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <i className="ri-store-2-line text-2xl text-blue-600"></i>
            </div>
            <p className="font-medium">Manage Products</p>
          </Link>
          
          <Link to="/admin/users" className="card p-6 text-center hover:shadow-lg transition">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <i className="ri-user-settings-line text-2xl text-purple-600"></i>
            </div>
            <p className="font-medium">Manage Users</p>
          </Link>
        </div>
      </div>
    </div>
  )
}

export default DashboardPage