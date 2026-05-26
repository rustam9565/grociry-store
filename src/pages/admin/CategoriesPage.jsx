import { useMemo } from 'react'
import { useGetProductsQuery } from '../../store/api/productApi'
import Loader from '../../components/Loader'
import Message from '../../components/Message'

const CategoriesPage = () => {
  const { data, isLoading, error } = useGetProductsQuery({ limit: 100 })
  const products = data?.products || []

  const categories = useMemo(() => {
    const map = {}
    products.forEach((product) => {
      const category = product.category || 'Uncategorized'
      map[category] = (map[category] || 0) + 1
    })
    return Object.entries(map)
      .map(([category, count]) => ({ category, count }))
      .sort((a, b) => b.count - a.count)
  }, [products])

  if (isLoading) return <Loader />

  return (
    <div className="container-padding py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Category Overview</h1>
          <p className="text-gray-600 mt-1">Monitor category performance and product distribution.</p>
        </div>
        <div className="space-y-1 text-right text-sm text-gray-500">
          <div>Total Categories: {categories.length}</div>
          <div>Total Products: {products.length}</div>
        </div>
      </div>

      {error ? (
        <Message type="error">Unable to load categories.</Message>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {categories.map((item) => (
            <div key={item.category} className="card p-6 border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900 capitalize">{item.category}</h2>
                <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
                  {item.count} products
                </span>
              </div>
              <div className="text-sm text-gray-500">
                {item.category === 'Uncategorized'
                  ? 'Products that need category assignment.'
                  : `Manage ${item.category} collection and pricing.`}
              </div>
            </div>
          ))}

          {categories.length === 0 && (
            <div className="col-span-full card p-6 text-center text-gray-500">
              No category data available.
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default CategoriesPage
