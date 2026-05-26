
import { useState, useEffect } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import { useGetProductsQuery } from '../store/api/productApi'
import ProductCard from '../components/ProductCard'
import Loader from '../components/Loader'
import Message from '../components/Message'

const ProductsPage = () => {

  const { category } = useParams()
  const [searchParams, setSearchParams] = useSearchParams()
  const queryFromUrl = searchParams.get('q') || ''
  const [search, setSearch] = useState(queryFromUrl)
  const [filters, setFilters] = useState({
    keyword: queryFromUrl,
    category: category || '',
    page: 1,
    sort: 'newest',
    minPrice: '',
    maxPrice: '',
  })

  // Sync category filter with URL param
  useEffect(() => {
    setFilters(prev => ({ ...prev, category: category || '' }))
  }, [category])

  useEffect(() => {
    setSearch(queryFromUrl)
    setFilters(prev => ({ ...prev, keyword: queryFromUrl, page: 1 }))
  }, [queryFromUrl])

  // Update keyword filter as user types
  useEffect(() => {
    setFilters(prev => ({ ...prev, keyword: search, page: 1 }))
  }, [search])

  const { data: productsData, isLoading, error } = useGetProductsQuery(filters)
  
  const categories = [
    'fruits', 'vegetables', 'dairy', 'meat', 'bakery', 
    'beverages', 'snacks', 'frozen', 'pantry'
  ]
  
  
  const sortOptions = [
    { value: 'newest', label: 'Newest' },
    { value: 'price_low', label: 'Price: Low to High' },
    { value: 'price_high', label: 'Price: High to Low' },
    { value: 'rating', label: 'Highest Rated' },
    { value: 'name', label: 'Name: A to Z' },
  ]
  
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      ...(key !== 'page' ? { page: 1 } : {}),
    }))
  }

  const handleSearchChange = (value) => {
    setSearch(value)

    if (value.trim()) {
      setSearchParams({ q: value })
      return
    }

    setSearchParams({})
  }

  const clearFilters = () => {
    setSearch('')
    setSearchParams({})
    setFilters({
      keyword: '',
      category: '',
      page: 1,
      sort: 'newest',
      minPrice: '',
      maxPrice: '',
    })
  }

  return (
    <div className="container-padding py-8">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar Filters */}
  <div className="lg:w-1/4">
  <div className="sticky top-24 bg-white rounded-3xl border border-gray-100 shadow-lg p-6">

    {/* Title */}
    <div className="mb-8">
      <h3 className="text-xl font-bold text-gray-900">
        Filters
      </h3>
      <p className="text-sm text-gray-500 mt-1">
        Find products faster
      </p>
    </div>

    {/* Search */}
    <div className="mb-8">
      <input
        type="text"
        className="w-full rounded-2xl border border-gray-200 px-4 py-3 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition"
        placeholder="🔍 Search products..."
        value={search}
        onChange={(e) => handleSearchChange(e.target.value)}
      />
    </div>

    {/* Categories */}
    <div className="mb-8">
      <h4 className="text-xs font-bold tracking-wider text-gray-400 uppercase mb-4">
        Categories
      </h4>

      <div className="space-y-2">

        <button
          onClick={() => handleFilterChange("category", "")}
          className={`group flex items-center justify-between w-full px-4 py-3 rounded-2xl transition-all duration-300
            ${
              !filters.category
                ? "bg-blue-600 text-white shadow-lg"
                : "hover:bg-gray-50 text-gray-700"
            }`}
        >
          <span>All Categories</span>
          <span>→</span>
        </button>

        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => handleFilterChange("category", cat)}
          className={`group flex items-center justify-between w-full px-4 py-3 rounded-2xl transition-all duration-300
${
  filters.category === cat
    ? "bg-emerald-600 text-white shadow-lg shadow-emerald-100"
    : "text-gray-600 hover:bg-white hover:shadow-sm"
}`}
          >
            <span className="capitalize font-medium">
              {cat}
            </span>

            <span
              className={`transition-all duration-300 ${
                filters.category === cat
                  ? "opacity-100"
                  : "opacity-0 group-hover:opacity-100"
              }`}
            >
              →
            </span>
          </button>
        ))}
      </div>
    </div>

    {/* Price */}
    <div className="mb-8">
      <h4 className="text-xs font-bold tracking-wider text-gray-400 uppercase mb-4">
        Price Range
      </h4>

      <div className="grid grid-cols-2 gap-3">
        <input
          type="number"
          placeholder="Min"
          className="rounded-xl border border-gray-200 px-3 py-2"
        />
        <input
          type="number"
          placeholder="Max"
          className="rounded-xl border border-gray-200 px-3 py-2"
        />
      </div>
    </div>

    {/* Sort */}
    <div className="mb-8">
      <h4 className="text-xs font-bold tracking-wider text-gray-400 uppercase mb-4">
        Sort By
      </h4>

      <select className="w-full rounded-xl border border-gray-200 px-4 py-3">
        {sortOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>

    {/* Clear */}
    <button
      onClick={clearFilters}
      className="w-full py-3 rounded-2xl border border-red-200 text-red-600 hover:bg-red-50 transition"
    >
      Clear Filters
    </button>

  </div>
</div>
        
        {/* Products Grid */}
        <div className="lg:w-3/4">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {category ? `${category.charAt(0).toUpperCase() + category.slice(1)}` : 'All Products'}
            </h1>
            {search && (
              <p className="text-gray-600">Search results for: "{search}"</p>
            )}
            {productsData && (
              <p className="text-gray-600">{productsData.total} products found</p>
            )}
          </div>
          
          {/* Products */}
          {isLoading ? (
            <Loader />
          ) : error ? (
            <Message type="error">{error?.data?.message || 'Failed to load products'}</Message>
          ) : (
            <>
              {productsData?.products?.length === 0 ? (
                <Message type="info">
                  No products found. Try adjusting your filters.
                </Message>
              ) : (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {productsData?.products?.map((product) => (
                      <ProductCard key={product._id} product={product} />
                    ))}
                  </div>
                  
                  {/* Pagination */}
                  {productsData?.pages > 1 && (
                    <div className="flex justify-center mt-8">
                      <div className="flex space-x-2">
                        {Array.from({ length: productsData.pages }, (_, i) => i + 1).map((pageNum) => (
                          <button
                            key={pageNum}
                            onClick={() => handleFilterChange('page', pageNum)}
                            className={`px-4 py-2 rounded-lg ${filters.page === pageNum ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                          >
                            {pageNum}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default ProductsPage
