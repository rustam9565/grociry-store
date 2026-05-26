import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useGetProductByIdQuery, useCreateReviewMutation } from '../store/api/productApi'
import { useGetCartQuery, useAddToCartMutation } from '../store/api/cartApi'
import { useAuth } from '../hooks/useAuth'
import { useDispatch } from 'react-redux'
import { addToCart } from '../store/slices/cartSlice'
import Loader from '../components/Loader'
import Message from '../components/Message'
import Rating from '../components/Rating'
import toast from 'react-hot-toast'

const ProductDetailPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { isAuthenticated, user } = useAuth()
  
  const [quantity, setQuantity] = useState(1)
  const [selectedImage, setSelectedImage] = useState(0)
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [reviewData, setReviewData] = useState({
    rating: 5,
    comment: ''
  })
  
  // Fetch product data
  const { 
    data: product, 
    isLoading, 
    error, 
    refetch 
  } = useGetProductByIdQuery(id)
  
  // Fetch cart data
  const { data: cartData } = useGetCartQuery()
  
  // Mutations
  const [addToCartApi] = useAddToCartMutation()
  const [createReview, { isLoading: isReviewLoading }] = useCreateReviewMutation()
  
  // Check if product is in cart
  const isInCart = cartData?.items?.some(item => item.product?._id === id)
  
  useEffect(() => {
    if (product?.images?.length > 0) {
      setSelectedImage(0)
    }
  }, [product])
  
  const handleQuantityChange = (value) => {
    const newQuantity = parseInt(value)
    if (newQuantity >= 1 && newQuantity <= product?.stock) {
      setQuantity(newQuantity)
    }
  }
  
  const incrementQuantity = () => {
    if (quantity < product?.stock) {
      setQuantity(prev => prev + 1)
    }
  }
  
  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(prev => prev - 1)
    }
  }
  
  const handleAddToCart = async () => {
    if (!product) return
    
    try {
      // First try API call if authenticated
      if (isAuthenticated) {
        await addToCartApi({
          productId: product._id,
          quantity
        }).unwrap()
      } else {
        // Fallback to local storage
        dispatch(addToCart({
          product: product._id,
          name: product.name,
          price: product.discountedPrice || product.price,
          image: product.images[0]?.url,
          quantity,
          stock: product.stock
        }))
      }
      
      toast.success(`${product.name} added to cart!`)
    } catch (err) {
      toast.error('Failed to add to cart')
    }
  }
  
  const handleBuyNow = async () => {
    await handleAddToCart()
    navigate('/cart')
  }
  
  const handleReviewSubmit = async (e) => {
    e.preventDefault()
    
    if (!isAuthenticated) {
      toast.error('Please login to submit a review')
      navigate('/login')
      return
    }
    
    try {
      await createReview({
        productId: id,
        reviewData
      }).unwrap()
      
      toast.success('Review submitted successfully!')
      setShowReviewForm(false)
      setReviewData({ rating: 5, comment: '' })
      refetch() // Refresh product data to show new review
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to submit review')
    }
  }
  
  const nutritionalInfo = [
    { label: 'Calories', value: product?.nutritionalInfo?.calories, unit: 'kcal' },
    { label: 'Protein', value: product?.nutritionalInfo?.protein, unit: 'g' },
    { label: 'Carbs', value: product?.nutritionalInfo?.carbs, unit: 'g' },
    { label: 'Fat', value: product?.nutritionalInfo?.fat, unit: 'g' },
  ].filter(info => info.value !== undefined)
  
  if (isLoading) return <Loader />
  if (error) return <Message type="error">Product not found</Message>
  if (!product) return null
  
  const discountedPrice = product.discountedPrice || product.price
  const hasDiscount = product.discountedPrice && product.discountedPrice < product.price
  const discountPercentage = hasDiscount 
    ? Math.round(((product.price - discountedPrice) / product.price) * 100)
    : 0

return (
  <div className="container-padding py-10">
    
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
      
      {/* Product Images */}
      <div>

        {/* Main Image */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5 mb-5 shadow-sm">
          <img
            src={
              product.images[selectedImage]?.url ||
              'https://via.placeholder.com/600x600?text=No+Image'
            }
            alt={product.name}
            className="w-full h-[450px] object-cover rounded-xl"
          />
        </div>

        {/* Thumbnail Images */}
        {product.images.length > 1 && (
          <div className="flex gap-3 overflow-x-auto pb-2">
            {product.images.map((image, index) => (
              <button
                key={index}
                onClick={() => setSelectedImage(index)}
                className={`flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 transition-all duration-200 ${
                  selectedImage === index
                    ? 'border-green-500 shadow-md'
                    : 'border-gray-200 hover:border-gray-400'
                }`}
              >
                <img
                  src={image.url}
                  alt={`${product.name} ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Product Info */}
      <div>

        {/* Badges */}
        <div className="flex flex-wrap gap-3 mb-5">
          
          {hasDiscount && (
            <span className="bg-red-500 text-white text-sm font-medium px-3 py-1 rounded-full">
              {discountPercentage}% OFF
            </span>
          )}

          {product.isOrganic && (
            <span className="bg-green-500 text-white text-sm font-medium px-3 py-1 rounded-full">
              Organic
            </span>
          )}

          {product.isVegetarian && (
            <span className="bg-blue-500 text-white text-sm font-medium px-3 py-1 rounded-full">
              Vegetarian
            </span>
          )}
        </div>

        {/* Product Name */}
        <h1 className="text-4xl font-bold text-gray-900 mb-5 leading-tight">
          {product.name}
        </h1>

        {/* Rating */}
        <div className="flex items-center flex-wrap gap-3 mb-6">
          <Rating value={product.ratings?.average || 0} />

          <span className="text-gray-600 text-sm">
            ({product.ratings?.count || 0} reviews)
          </span>

          <span className="hidden sm:block text-gray-300">•</span>

          <span className="text-gray-600 text-sm">
            Brand: {product.brand || 'Unknown'}
          </span>
        </div>

        {/* Price */}
        <div className="mb-8">
          <div className="flex flex-wrap items-center gap-3 mb-3">

            <span className="text-4xl font-bold text-gray-900">
              ₹{discountedPrice.toFixed(2)}
            </span>

            {hasDiscount && (
              <>
                <span className="text-2xl text-gray-400 line-through">
                  ₹{product.price.toFixed(2)}
                </span>

                <span className="text-red-500 font-medium">
                  Save ₹{(product.price - discountedPrice).toFixed(2)}
                </span>
              </>
            )}

            <span className="text-gray-500 text-lg">
              / {product.unit}
            </span>
          </div>

          <div className="flex items-center text-green-600 font-medium text-sm">
            <i className="ri-checkbox-circle-fill mr-2"></i>

            {product.stock > 0
              ? `${product.stock} items available`
              : 'Out of stock'}
          </div>
        </div>

        {/* Description */}
        <div className="mb-10">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">
            Description
          </h3>

          <p className="text-gray-600 leading-7">
            {product.description}
          </p>
        </div>

        {/* Nutritional Info */}
        {nutritionalInfo.length > 0 && (
          <div className="mb-10">
            <h3 className="text-xl font-semibold text-gray-900 mb-5">
              Nutritional Information
            </h3>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {nutritionalInfo.map((info, index) => (
                <div
                  key={index}
                  className="bg-gray-50 border border-gray-100 rounded-xl p-4 text-center"
                >
                  <div className="text-sm text-gray-500 mb-2">
                    {info.label}
                  </div>

                  <div className="text-xl font-semibold text-gray-900">
                    {info.value} {info.unit}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Features */}
        {product.features && product.features.length > 0 && (
          <div className="mb-10">
            <h3 className="text-xl font-semibold text-gray-900 mb-5">
              Features
            </h3>

            <ul className="space-y-3">
              {product.features.map((feature, index) => (
                <li
                  key={index}
                  className="flex items-center text-gray-700"
                >
                  <i className="ri-check-line text-green-500 mr-3 text-lg"></i>

                  {feature}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Add To Cart Section */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm mb-10">

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 mb-6">

            {/* Quantity */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Quantity
              </label>

              <div className="flex items-center">

                <button
                  onClick={decrementQuantity}
                  disabled={quantity <= 1}
                  className="w-11 h-11 flex items-center justify-center border border-gray-300 rounded-l-xl hover:bg-gray-50 disabled:opacity-50"
                >
                  <i className="ri-subtract-line"></i>
                </button>

                <input
                  type="number"
                  min="1"
                  max={product.stock}
                  value={quantity}
                  onChange={(e) => handleQuantityChange(e.target.value)}
                  className="w-20 h-11 border-y border-gray-300 text-center font-medium"
                />

                <button
                  onClick={incrementQuantity}
                  disabled={quantity >= product.stock}
                  className="w-11 h-11 flex items-center justify-center border border-gray-300 rounded-r-xl hover:bg-gray-50 disabled:opacity-50"
                >
                  <i className="ri-add-line"></i>
                </button>

              </div>
            </div>

            {/* Total */}
            <div className="text-left sm:text-right">
              <div className="text-sm text-gray-500 mb-1">
                Total
              </div>

              <div className="text-3xl font-bold text-gray-900">
                ₹{(discountedPrice * quantity).toFixed(2)}
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">

            <button
              onClick={handleAddToCart}
              disabled={product.stock === 0}
              className={`flex-1 py-3.5 rounded-xl font-medium text-white transition ${
                isInCart
                  ? 'bg-yellow-500 hover:bg-yellow-600'
                  : 'bg-black hover:bg-gray-800'
              }`}
            >
              <i className="ri-shopping-cart-2-line mr-2"></i>

              {isInCart ? 'Already in Cart' : 'Add to Cart'}
            </button>

            <button
              onClick={handleBuyNow}
              disabled={product.stock === 0}
              className="flex-1 py-3.5 rounded-xl bg-green-600 hover:bg-green-700 text-white font-medium transition"
            >
              <i className="ri-flashlight-line mr-2"></i>

              Buy Now
            </button>
          </div>

          {/* Out Of Stock */}
          {product.stock === 0 && (
            <div className="mt-5 text-center text-red-600 text-sm font-medium">
              <i className="ri-error-warning-line mr-2"></i>

              This product is currently out of stock
            </div>
          )}
        </div>

        {/* Additional Info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">

          <div className="flex items-center gap-3 p-4 border border-gray-100 rounded-xl bg-gray-50">
            <i className="ri-truck-line text-green-600 text-lg"></i>
            <span>Free delivery on orders over $50</span>
          </div>

          <div className="flex items-center gap-3 p-4 border border-gray-100 rounded-xl bg-gray-50">
            <i className="ri-refresh-line text-green-600 text-lg"></i>
            <span>30-day return policy</span>
          </div>

          <div className="flex items-center gap-3 p-4 border border-gray-100 rounded-xl bg-gray-50">
            <i className="ri-shield-check-line text-green-600 text-lg"></i>
            <span>Quality guaranteed</span>
          </div>

          <div className="flex items-center gap-3 p-4 border border-gray-100 rounded-xl bg-gray-50">
            <i className="ri-customer-service-2-line text-green-600 text-lg"></i>
            <span>24/7 customer support</span>
          </div>

        </div>
      </div>
    </div>
      {/* Reviews Section */}
      <div className="mt-16 px-4 md:px-8">
  {/* Header */}
  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-8">
    <div>
      <h2 className="text-3xl font-bold text-gray-900">
        Customer Reviews
      </h2>
      <p className="text-gray-500 mt-1 text-sm">
        See what customers are saying about this product
      </p>
    </div>

    <button
      onClick={() => setShowReviewForm(!showReviewForm)}
      className="px-6 py-3 rounded-xl border border-blue-500 text-blue-600 font-semibold hover:bg-blue-500 hover:text-white transition-all duration-300 shadow-sm hover:shadow-md"
    >
      {showReviewForm ? 'Cancel' : 'Write a Review'}
    </button>
  </div>

  {/* Review Form */}
  {showReviewForm && (
    <div className="bg-white border border-gray-200 rounded-2xl p-6 md:p-8 mb-8 shadow-lg">
      <h3 className="text-2xl font-bold text-gray-800 mb-6">
        Write Your Review
      </h3>

      <form onSubmit={handleReviewSubmit}>
        {/* Rating */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            Rating
          </label>

          <div className="flex items-center gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() =>
                  setReviewData((prev) => ({
                    ...prev,
                    rating: star,
                  }))
                }
                className="text-3xl transition-transform duration-200 hover:scale-125"
              >
                <i
                  className={
                    star <= reviewData.rating
                      ? 'ri-star-fill text-yellow-400 drop-shadow-sm'
                      : 'ri-star-line text-gray-300'
                  }
                ></i>
              </button>
            ))}
          </div>
        </div>

        {/* Comment */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            Comment
          </label>

          <textarea
            className="w-full h-36 rounded-2xl border border-gray-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none px-4 py-3 text-gray-700 resize-none transition-all duration-300"
            placeholder="Share your experience with this product..."
            value={reviewData.comment}
            onChange={(e) =>
              setReviewData((prev) => ({
                ...prev,
                comment: e.target.value,
              }))
            }
            required
          />
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isReviewLoading}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-3 rounded-xl transition-all duration-300 shadow-md hover:shadow-lg disabled:opacity-70"
        >
          {isReviewLoading ? 'Submitting...' : 'Submit Review'}
        </button>
      </form>
    </div>
  )}

  {/* Reviews List */}
  {product.reviews && product.reviews.length > 0 ? (
    <div className="space-y-6">
      {product.reviews.map((review) => (
        <div
          key={review._id}
          className="bg-white border border-gray-200 rounded-2xl p-6 shadow-md hover:shadow-xl transition-all duration-300"
        >
          <div className="flex justify-between items-start mb-5">
            <div className="flex items-center">
              {/* Avatar */}
              <div className="w-14 h-14 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center mr-4 shadow-md">
                <i className="ri-user-line text-white text-xl"></i>
              </div>

              {/* User Info */}
              <div>
                <h4 className="font-bold text-lg text-gray-800">
                  {review.user?.name || 'Anonymous'}
                </h4>

                <div className="flex items-center mt-1">
                  <Rating value={review.rating} />

                  <span className="text-sm text-gray-500 ml-3">
                    {new Date(review.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Comment */}
          <p className="text-gray-700 leading-relaxed text-[15px]">
            {review.comment}
          </p>
        </div>
      ))}
    </div>
  ) : (
    <div className="bg-blue-50 border border-blue-200 text-blue-700 rounded-2xl p-6 text-center font-medium shadow-sm">
      No reviews yet. Be the first to review this product!
    </div>
  )}
</div>
  </div>
)
}

export default ProductDetailPage