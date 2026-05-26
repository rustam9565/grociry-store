import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useGetProductsQuery } from '../../store/api/productApi'
import Loader from '../Loader'

const SearchModal = ({ isOpen, onClose }) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [debouncedTerm, setDebouncedTerm] = useState('')
  const modalRef = useRef(null)
  const inputRef = useRef(null)
  const navigate = useNavigate()

  const { data: products, isLoading } = useGetProductsQuery(
    { keyword: debouncedTerm, limit: 5 },
    { skip: !debouncedTerm }
  )

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedTerm(searchTerm)
    }, 300)

    return () => clearTimeout(timer)
  }, [searchTerm])

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose()
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      inputRef.current?.focus()
    }

    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen, onClose])

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (modalRef.current && !modalRef.current.contains(e.target)) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen, onClose])

  const handleSearch = (e) => {
    e.preventDefault()
    const trimmedQuery = searchTerm.trim()

    if (trimmedQuery) {
      navigate(`/search?q=${encodeURIComponent(trimmedQuery)}`)
      onClose()
      setSearchTerm('')
    }
  }

  const handleProductClick = (productId) => {
    navigate(`/product/${productId}`)
    onClose()
    setSearchTerm('')
  }

  const handleCategoryClick = (category) => {
    navigate(`/category/${category}`)
    onClose()
    setSearchTerm('')
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-gray-500/75 transition-opacity"></div>

        <div
          ref={modalRef}
          className="inline-block w-full max-w-2xl my-8 overflow-hidden rounded-lg bg-white text-left align-middle shadow-xl transition-all"
        >
          <div className="border-b p-4">
            <form onSubmit={handleSearch}>
              <div className="relative">
                <input
                  ref={inputRef}
                  type="text"
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 pl-12 pr-10 text-lg focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Search for products, categories, or brands..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  autoComplete="off"
                />
                <i className="ri-search-line absolute left-4 top-3.5 text-xl text-gray-400"></i>
                <button
                  type="button"
                  onClick={onClose}
                  className="absolute right-4 top-3.5 text-gray-400 hover:text-gray-600"
                >
                  <i className="ri-close-line text-2xl"></i>
                </button>
              </div>
            </form>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {isLoading ? (
              <div className="p-8">
                <Loader />
              </div>
            ) : debouncedTerm && products?.products?.length > 0 ? (
              <div className="p-2">
                <div className="px-4 py-2 text-sm text-gray-500">
                  {products.total} results for "{debouncedTerm}"
                </div>
                {products.products.map((product) => (
                  <button
                    key={product._id}
                    onClick={() => handleProductClick(product._id)}
                    className="flex w-full items-center p-4 text-left hover:bg-gray-50"
                  >
                    <img
                      src={product.images[0]?.url || 'https://via.placeholder.com/100x100?text=No+Image'}
                      alt={product.name}
                      className="mr-4 h-16 w-16 rounded object-cover"
                    />
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">{product.name}</div>
                      <div className="text-sm text-gray-600">
                        ${(product.discountedPrice || product.price).toFixed(2)} | {product.category}
                      </div>
                      {product.brand && (
                        <div className="mt-1 text-xs text-gray-500">Brand: {product.brand}</div>
                      )}
                    </div>
                    <i className="ri-arrow-right-s-line text-gray-400"></i>
                  </button>
                ))}

                {products.total > 5 && (
                  <button
                    onClick={handleSearch}
                    className="w-full p-4 text-center font-medium text-primary-600 hover:bg-gray-50"
                  >
                    View all {products.total} results
                  </button>
                )}
              </div>
            ) : debouncedTerm ? (
              <div className="p-8 text-center">
                <i className="ri-search-line mb-4 text-4xl text-gray-300"></i>
                <p className="text-gray-600">No products found for "{debouncedTerm}"</p>
                <p className="mt-1 text-sm text-gray-500">Try different keywords</p>
              </div>
            ) : (
              <div className="p-8 text-center">
                <i className="ri-search-line mb-4 text-4xl text-gray-300"></i>
                <p className="text-gray-600">Start typing to search products</p>
                <p className="mt-1 text-sm text-gray-500">Search by name, category, or brand</p>
              </div>
            )}
          </div>

          <div className="border-t bg-gray-50 p-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <div className="mb-2 text-sm text-gray-600">Popular Searches:</div>
                <div className="flex flex-wrap gap-2">
                  {['Apples', 'Milk', 'Bread', 'Eggs', 'Chicken', 'Rice', 'Coffee', 'Bananas'].map((term) => (
                    <button
                      key={term}
                      onClick={() => setSearchTerm(term)}
                      className="rounded-full border border-gray-300 bg-white px-3 py-1.5 text-sm hover:bg-gray-50"
                    >
                      {term}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="mb-2 text-sm text-gray-600">Browse Categories:</div>
                <div className="flex flex-wrap gap-2">
                  {['fruits', 'vegetables', 'dairy', 'meat', 'bakery'].map((category) => (
                    <button
                      key={category}
                      onClick={() => handleCategoryClick(category)}
                      className="capitalize rounded-full border border-gray-300 bg-white px-3 py-1.5 text-sm hover:bg-gray-50"
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SearchModal
