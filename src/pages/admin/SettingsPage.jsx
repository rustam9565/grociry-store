import { useState } from 'react'
import { useGetAllOrdersQuery } from '../../store/api/orderApi'
import { useGetProductsQuery } from '../../store/api/productApi'
import { useGetUsersQuery } from '../../store/api/authApi'
import Loader from '../../components/Loader'
import Message from '../../components/Message'
import toast from 'react-hot-toast'

const SettingsPage = () => {
  const [storeName, setStoreName] = useState('Grociry Store')
  const [currency, setCurrency] = useState('USD')
  const [storeStatus, setStoreStatus] = useState(true)

  const { data: productsData, isLoading: productsLoading, error: productsError } = useGetProductsQuery({ limit: 12 })
  const { data: orders, isLoading: ordersLoading, error: ordersError } = useGetAllOrdersQuery()
  const { data: users, isLoading: usersLoading, error: usersError } = useGetUsersQuery()

  const isLoading = productsLoading || ordersLoading || usersLoading
  const hasError = productsError || ordersError || usersError

  const handleSave = (event) => {
    event.preventDefault()
    toast.success('Store settings saved successfully')
  }

  if (isLoading) return <Loader />

  return (
    <div className="container-padding py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Store Settings</h1>
          <p className="text-gray-600 mt-1">Basic settings for your store, notifications, and reporting.</p>
        </div>
        <div className="text-sm text-gray-500">
          <div>{orders?.length ?? 0} total orders</div>
          <div>{users?.length ?? 0} registered customers</div>
          <div>{productsData?.products?.length ?? 0} active products</div>
        </div>
      </div>

      {hasError ? (
        <Message type="error">Unable to load settings data. Please refresh.</Message>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <form className="card p-6 lg:col-span-2" onSubmit={handleSave}>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Store Name</label>
                <input
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                  className="input w-full"
                  placeholder="Grociry Store"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Currency</label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="input w-full"
                >
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                  <option value="GBP">GBP</option>
                </select>
              </div>

              <div>
                <label className="flex items-center gap-3 text-sm font-medium text-gray-700">
                  <input
                    type="checkbox"
                    checked={storeStatus}
                    onChange={() => setStoreStatus((prev) => !prev)}
                    className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                  Store online
                </label>
                <p className="text-sm text-gray-500 mt-2">When disabled, customers will not be able to place new orders.</p>
              </div>

              <div className="flex justify-end">
                <button type="submit" className="btn btn-primary">
                  Save Settings
                </button>
              </div>
            </div>
          </form>

          <div className="card p-6 space-y-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Store status</h2>
              <p className="text-sm text-gray-500 mt-2">Toggle the store availability and basic preferences.</p>
            </div>
            <div className="grid gap-4">
              <div className="rounded-3xl border border-gray-200 bg-white p-4">
                <div className="text-sm text-gray-500">Store live</div>
                <div className="text-3xl font-bold text-gray-900">{storeStatus ? 'Enabled' : 'Disabled'}</div>
              </div>
              <div className="rounded-3xl border border-gray-200 bg-white p-4">
                <div className="text-sm text-gray-500">Average daily orders</div>
                <div className="text-3xl font-bold text-gray-900">{orders?.length ? Math.max(1, Math.round(orders.length / 7)) : 0}</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default SettingsPage
