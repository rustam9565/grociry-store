import { useState, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth'
import { useGetUserProfileQuery, useUpdateUserProfileMutation } from '../store/api/authApi'
import { logout } from '../store/slices/authSlice'
import { useDispatch } from 'react-redux'
import Loader from '../components/Loader'
import Message from '../components/Message'
import { SmallLoader } from '../components/Loader'
import toast from 'react-hot-toast'

const ProfilePage = () => {
  const { isAuthenticated } = useAuth()
  const dispatch = useDispatch()
  
  const { data: userData, isLoading, refetch } = useGetUserProfileQuery(undefined, {
    skip: !isAuthenticated
  })
  
  const [updateProfile, { isLoading: isUpdating }] = useUpdateUserProfileMutation()
  
  const [activeTab, setActiveTab] = useState('profile')
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: ''
    }
  })
  
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  
  useEffect(() => {
    if (userData) {
      setFormData({
        name: userData.name || '',
        email: userData.email || '',
        phone: userData.phone || '',
        address: {
          street: userData.address?.street || '',
          city: userData.address?.city || '',
          state: userData.address?.state || '',
          zipCode: userData.address?.zipCode || '',
          country: userData.address?.country || 'United States'
        }
      })
    }
  }, [userData])
  
  const handleProfileUpdate = async (e) => {
    e.preventDefault()
    
    try {
      await updateProfile(formData).unwrap()
      toast.success('Profile updated successfully!')
      refetch()
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to update profile')
    }
  }
  
  const handlePasswordUpdate = async (e) => {
    e.preventDefault()
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match')
      return
    }
    
    if (passwordData.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters')
      return
    }
    
    try {
      await updateProfile({
        password: passwordData.newPassword
      }).unwrap()
      
      toast.success('Password updated successfully!')
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      })
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to update password')
    }
  }
  
  const handleLogout = () => {
    dispatch(logout())
    toast.success('Logged out successfully')
  }
  
  if (isLoading) return <Loader />
  
  return (
    <div className="container-padding py-8">
      <div className="mb-10">
  <p className="text-emerald-600 font-medium">
    Account Dashboard
  </p>

  <h1 className="text-4xl font-bold text-gray-900">
    Welcome back, {userData?.name}
  </h1>

  <p className="text-gray-500 mt-2">
    Manage your profile, orders and addresses.
  </p>
</div>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="card">
            <div className="p-6">
              <div className="flex items-center mb-6">
                <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mr-4">
                  <i className="ri-user-line text-2xl text-primary-600"></i>
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">{userData?.name}</h3>
                  <p className="text-sm text-gray-600">{userData?.email}</p>
                </div>
              </div>
              
              <nav className="space-y-1">
                <button
                  onClick={() => setActiveTab('profile')}
                  className={`w-full text-left px-3 py-3 rounded-2xl ${activeTab === 'profile' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-600 hover:bg-slate-100'}`}
                >
                  <i className="ri-user-line mr-2"></i>
                  Profile Information
                </button>
                <button
                  onClick={() => setActiveTab('password')}
                  className={`w-full text-left px-3 py-3 rounded-2xl ${activeTab === 'password' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-600 hover:bg-slate-100'}`}
                >
                  <i className="ri-lock-line mr-2"></i>
                  Password & Security
                </button>
                <button
                  onClick={() => setActiveTab('orders')}
                  className={`w-full text-left px-3 py-3 rounded-2xl ${activeTab === 'orders' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-600 hover:bg-slate-100'}`}
                >
                  <i className="ri-shopping-bag-line mr-2"></i>
                  My Orders
                </button>
                <button
                  onClick={() => setActiveTab('addresses')}
                  className={`w-full text-left px-3 py-3 rounded-2xl ${activeTab === 'addresses' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-600 hover:bg-slate-100'}`}
                >
                  <i className="ri-map-pin-line mr-2"></i>
                  Address Book
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-3 py-3 rounded-2xl text-red-600 hover:bg-red-50"
                >
                  <i className="ri-logout-box-r-line mr-2"></i>
                  Logout
                </button>
              </nav>
            </div>
          </div>
        </div>
        
        {/* Main Content */}
        <div className="lg:col-span-3">
          {/* Profile Information */}
          {activeTab === 'profile' && (
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-6 border-b">
                <h2 className="text-xl font-bold text-gray-900">Profile Information</h2>
                <p className="text-gray-600 mt-1">Update your personal details</p>
              </div>
              
              <form onSubmit={handleProfileUpdate} className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      className="input"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      className="input"
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      className="input"
                      value={formData.phone}
                      onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    />
                  </div>
                </div>
                
                <div className="mt-6">
                  <button
                    type="submit"
                    disabled={isUpdating}
                    className="btn btn-primary"
                  >
                    {isUpdating ? <SmallLoader /> : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>
          )}
          
          {/* Password & Security */}
          {activeTab === 'password' && (
            <div className="card">
              <div className="p-6 border-b">
                <h2 className="text-xl font-bold text-gray-900">Password & Security</h2>
                <p className="text-gray-600 mt-1">Update your password</p>
              </div>
              
              <form onSubmit={handlePasswordUpdate} className="p-6">
                <div className="space-y-4 max-w-md">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Current Password
                    </label>
                    <input
                      type="password"
                      className="input"
                      value={passwordData.currentPassword}
                      onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      New Password
                    </label>
                    <input
                      type="password"
                      className="input"
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      className="input"
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    />
                  </div>
                </div>
                
                <div className="mt-6">
                  <button
                    type="submit"
                    disabled={isUpdating}
                    className="btn btn-primary"
                  >
                    {isUpdating ? <SmallLoader /> : 'Update Password'}
                  </button>
                </div>
              </form>
            </div>
          )}
          
          {/* Orders */}
          {activeTab === 'orders' && (
            <div className="card">
              <div className="p-6 border-b">
                <h2 className="text-xl font-bold text-gray-900">My Orders</h2>
                <p className="text-gray-600 mt-1">View and track your orders</p>
              </div>
              
              <div className="p-6">
                <Message type="info">
                  Your order history will appear here. <a href="/orders" className="text-primary-600 hover:underline">View all orders</a>
                </Message>
              </div>
            </div>
          )}
          
          {/* Address Book */}
          {activeTab === 'addresses' && (
            <div className="card">
              <div className="p-6 border-b">
                <h2 className="text-xl font-bold text-gray-900">Address Book</h2>
                <p className="text-gray-600 mt-1">Manage your shipping addresses</p>
              </div>
              
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Street Address
                    </label>
                    <input
                      type="text"
                      className="input"
                      value={formData.address.street}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        address: { ...prev.address, street: e.target.value }
                      }))}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      City
                    </label>
                    <input
                      type="text"
                      className="input"
                      value={formData.address.city}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        address: { ...prev.address, city: e.target.value }
                      }))}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      State
                    </label>
                    <input
                      type="text"
                      className="input"
                      value={formData.address.state}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        address: { ...prev.address, state: e.target.value }
                      }))}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      ZIP Code
                    </label>
                    <input
                      type="text"
                      className="input"
                      value={formData.address.zipCode}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        address: { ...prev.address, zipCode: e.target.value }
                      }))}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Country
                    </label>
                    <select
                      className="input"
                      value={formData.address.country}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        address: { ...prev.address, country: e.target.value }
                      }))}
                    >
                      <option value="United States">United States</option>
                      <option value="Canada">India</option>
                      <option value="United Kingdom">United Kingdom</option>
                    </select>
                  </div>
                </div>
                
                <button
                  onClick={handleProfileUpdate}
                  disabled={isUpdating}
                  className="btn btn-primary"
                >
                  {isUpdating ? <SmallLoader /> : 'Save Address'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ProfilePage
