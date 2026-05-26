import { Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux' // Add useSelector
import { addToWishlist, removeFromWishlist } from '../store/slices/wishlistSlice' // Add this import
import { addToCart } from '../store/slices/cartSlice'
import { useAuth } from '../hooks/useAuth'
import { useAddToCartMutation } from '../store/api/cartApi'
import Rating from './Rating'
import toast from 'react-hot-toast'

const ProductCard = ({ product }) => {
  const dispatch = useDispatch()
  const { isAuthenticated } = useAuth()
  const [addToCartApi] = useAddToCartMutation()
  const discountedPrice = product.discountedPrice || product.price
  const hasDiscount = product.discountedPrice && product.discountedPrice < product.price
  const discountPercentage = hasDiscount 
    ? Math.round(((product.price - discountedPrice) / product.price) * 100)
    : 0

  // Check if product is in wishlist
  const wishlistItems = useSelector((state) => state.wishlist?.items || [])
  const isInWishlist = wishlistItems.some(item => item.product === product._id)

  const handleAddToCart = async (e) => {
    e.preventDefault()
    e.stopPropagation()

    try {
      if (isAuthenticated) {
        await addToCartApi({
          productId: product._id,
          quantity: 1
        }).unwrap()
      } else {
        dispatch(addToCart({
          product: product._id,
          name: product.name,
          price: discountedPrice,
          image: product.images[0]?.url,
          quantity: 1,
          stock: product.stock
        }))
      }

      toast.success(`${product.name} added to cart!`)
    } catch (err) {
      toast.error('Failed to add item to cart')
    }
  }

  const handleWishlistToggle = (e) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (isInWishlist) {
      dispatch(removeFromWishlist(product._id))
      toast.success(`${product.name} removed from wishlist`)
    } else {
      dispatch(addToWishlist({
        product: product._id,
        name: product.name,
        price: discountedPrice,
        image: product.images[0]?.url,
        stock: product.stock
      }))
      toast.success(`${product.name} added to wishlist!`)
    }
  }

  return (
    <Link to={`/product/${product._id}`} className="card group block hover:shadow-lg transition-all duration-300">
      <div className="relative overflow-hidden rounded-t-xl">
        <img 
          src={product.images[0]?.url || 'https://via.placeholder.com/300x200?text=No+Image'} 
          alt={product.name}
          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
        />
        
        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-2 ">
          {hasDiscount && (
            <span className="badge bg-red-500 text-white py-1 px-2 rounded-2xl">
              {discountPercentage}% OFF
            </span>
          )}
          {product.isOrganic && (
            <span className="badge bg-green-500 text-white py-1 px-2 rounded-2xl">
              Organic
            </span>
          )}
        </div>
        
        {/* Action Buttons */}
        <div className="absolute top-2 right-2 flex flex-col gap-2">
          <button
            onClick={handleWishlistToggle}
            className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-lg hover:bg-gray-50 transition"
            title={isInWishlist ? "Remove from wishlist" : "Add to wishlist"}
          >
            <i className={`${isInWishlist ? 'ri-heart-fill text-red-500' : 'ri-heart-line text-gray-600'}`}></i>
          </button>
          
          <button
            onClick={handleAddToCart}
            className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-lg hover:bg-primary-600 hover:text-white transition"
            title="Add to cart"
          >
            <i className="ri-shopping-cart-2-line"></i>
          </button>
        </div>
      </div>
      
      <div className="p-4">
        <div className="mb-2">
          <span className="text-sm text-gray-500 uppercase">{product.category}</span>
        </div>
        
        <h3 className="font-medium text-gray-900 mb-2 line-clamp-1">{product.name}</h3>
        
        <div className="mb-3">
          <Rating value={product.ratings?.average || 0} />
          <span className="text-sm text-gray-500 ml-2">({product.ratings?.count || 0})</span>
        </div>
        
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-bold text-gray-900">₹{discountedPrice.toFixed(2)}</span>
              {hasDiscount && (
                <span className="text-sm text-gray-500 line-through">₹{product.price.toFixed(2)}</span>
              )}
              <span className="text-sm text-gray-500">/{product.unit}</span>
            </div>
          </div>
          
          <div className="text-sm">
            {product.stock > 0 ? (
              <span className="text-green-600">In stock</span>
            ) : (
              <span className="text-red-600">Out of stock</span>
            )}
          </div>
        </div>
      </div>
    </Link>
  )
}

export default ProductCard
