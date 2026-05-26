import { useMemo } from 'react'
import { useGetProductsQuery } from '../../store/api/productApi'
import Loader from '../../components/Loader'
import Message from '../../components/Message'

const ReviewsPage = () => {
  const { data, isLoading, error } = useGetProductsQuery({ limit: 100 })
  const products = data?.products || []

  const reviewSummary = useMemo(() => {
    return products
      .map((product) => ({
        id: product._id,
        name: product.name,
        rating: product.ratings?.average ?? 0,
        reviewCount: product.reviews?.length ?? product.ratings?.count ?? 0,
      }))
      .sort((a, b) => b.rating - a.rating || b.reviewCount - a.reviewCount)
      .slice(0, 12)
  }, [products])

  if (isLoading) return <Loader />

  return (
    <div className="container-padding py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Review Insights</h1>
          <p className="text-gray-600 mt-1">Track product sentiment and top-rated items.</p>
        </div>
        <div className="space-y-1 text-right text-sm text-gray-500">
          <div>Reviewed products: {reviewSummary.length}</div>
          <div>Top rating: {reviewSummary[0]?.rating?.toFixed(1) || '0.0'}</div>
        </div>
      </div>

      {error ? (
        <Message type="error">Unable to load review analytics.</Message>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {reviewSummary.length ? (
            reviewSummary.map((product) => (
              <div key={product.id} className="card p-6 border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">{product.name}</h2>
                  <span className="rounded-full bg-yellow-100 px-3 py-1 text-xs font-semibold text-yellow-800">
                    {product.rating.toFixed(1)} ⭐
                  </span>
                </div>
                <div className="text-sm text-gray-600">
                  {product.reviewCount} review{product.reviewCount === 1 ? '' : 's'} received
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full card p-6 text-center text-gray-500">
              No review data available. Add reviews from product pages to get started.
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default ReviewsPage
