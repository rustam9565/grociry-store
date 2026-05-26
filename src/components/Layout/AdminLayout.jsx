import { useState } from 'react'
import { Link, Outlet, NavLink } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { logout } from '../../store/slices/authSlice'
import { useDispatch } from 'react-redux'

const AdminLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const { user } = useAuth()
  const dispatch = useDispatch()

  const menuItems = [
    { path: '/admin', label: 'Dashboard', icon: 'ri-dashboard-line' },
    { path: '/admin/products', label: 'Products', icon: 'ri-store-2-line' },
    { path: '/admin/orders', label: 'Orders', icon: 'ri-shopping-bag-line' },
    { path: '/admin/users', label: 'Users', icon: 'ri-user-line' },
    { path: '/admin/categories', label: 'Categories', icon: 'ri-list-check-2' },
    { path: '/admin/reviews', label: 'Reviews', icon: 'ri-star-line' },
    { path: '/admin/settings', label: 'Settings', icon: 'ri-settings-3-line' },
  ]

  const stats = [
    { label: 'Total Sales', value: '$12,456', change: '+12%', icon: 'ri-money-dollar-circle-line', color: 'green' },
    { label: 'Total Orders', value: '1,234', change: '+8%', icon: 'ri-shopping-bag-line', color: 'blue' },
    { label: 'Total Products', value: '456', change: '+5%', icon: 'ri-store-2-line', color: 'purple' },
    { label: 'Total Customers', value: '3,456', change: '+15%', icon: 'ri-user-line', color: 'orange' },
  ]

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-gray-900 transform transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:static lg:inset-auto`}>
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-800">
          <Link to="/admin" className="flex items-center space-x-2">
            <i className="ri-shopping-basket-2-fill text-2xl text-primary-400"></i>
            <span className="text-xl font-bold text-white">Admin Panel</span>
          </Link>
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="lg:hidden text-gray-400 hover:text-white"
          >
            <i className="ri-close-line text-xl"></i>
          </button>
        </div>
        
        <div className="p-4">
          {/* User Info */}
          <div className="flex items-center p-3 bg-gray-800 rounded-lg mb-6">
            <div className="w-10 h-10 bg-primary-500 rounded-full flex items-center justify-center mr-3">
              <i className="ri-user-line text-white"></i>
            </div>
            <div>
              <div className="font-medium text-white">{user?.name}</div>
              <div className="text-sm text-gray-400">Administrator</div>
            </div>
          </div>
          
          {/* Navigation */}
          <nav className="space-y-1">
            {menuItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/admin'}
                className={({ isActive }) =>
                  `flex items-center px-3 py-2 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-primary-600 text-white'
                      : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                  }`
                }
              >
                <i className={`${item.icon} mr-3`}></i>
                {item.label}
              </NavLink>
            ))}
          </nav>
          
          <div className="mt-6 pt-6 border-t border-gray-800">
            <Link
              to="/"
              className="flex items-center px-3 py-2 text-gray-300 hover:bg-gray-800 hover:text-white rounded-lg transition-colors"
            >
              <i className="ri-store-2-line mr-3"></i>
              View Store
            </Link>
            <button
              onClick={() => dispatch(logout())}
              className="flex items-center w-full px-3 py-2 text-red-400 hover:bg-gray-800 hover:text-red-300 rounded-lg transition-colors mt-2"
            >
              <i className="ri-logout-box-r-line mr-3"></i>
              Logout
            </button>
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="lg:pl-64">
        {/* Top Bar */}
        <header className="bg-white shadow-sm border-b">
          <div className="flex items-center justify-between h-16 px-4">
            <div className="flex items-center">
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="lg:hidden text-gray-500 hover:text-gray-700 mr-4"
              >
                <i className="ri-menu-line text-xl"></i>
              </button>
              <h1 className="text-lg font-semibold text-gray-900">Admin Dashboard</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <button className="relative p-2 text-gray-500 hover:text-gray-700">
                <i className="ri-notification-3-line text-xl"></i>
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
              
              <div className="relative">
                <div className="flex items-center space-x-3 cursor-pointer">
                  <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                    <i className="ri-user-line text-primary-600"></i>
                  </div>
                  <div className="hidden md:block">
                    <div className="text-sm font-medium">{user?.name}</div>
                    <div className="text-xs text-gray-500">Admin</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>
        
        {/* Content */}
        <main className="p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default AdminLayout