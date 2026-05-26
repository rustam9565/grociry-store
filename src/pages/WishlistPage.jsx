import { useSelector, useDispatch } from 'react-redux'
import { Link } from 'react-router-dom'
import { removeFromWishlist, clearWishlist } from '../store/slices/wishlistSlice'
import { addToCart } from '../store/slices/cartSlice'
import { useAuth } from '../hooks/useAuth'
import { useAddToCartMutation } from '../store/api/cartApi'
import Message from '../components/Message'
import toast from 'react-hot-toast'

const WishlistPage = () => {
  const dispatch = useDispatch()
  const { items } = useSelector((state) => state.wishlist)
  const { isAuthenticated } = useAuth()
  const [addToCartApi] = useAddToCartMutation()
  
  const handleRemove = (productId, productName) => {
    dispatch(removeFromWishlist(productId))
    toast.success(`Removed ${productName} from wishlist`)
  }
  
  const handleMoveToCart = async (item) => {
    try {
      if (isAuthenticated) {
        await addToCartApi({
          productId: item.product,
          quantity: 1
        }).unwrap()
      } else {
        dispatch(addToCart({
          product: item.product,
          name: item.name,
          price: item.price,
          image: item.image,
          quantity: 1,
          stock: item.stock
        }))
      }

      dispatch(removeFromWishlist(item.product))
      toast.success(`Moved ${item.name} to cart`)
    } catch (err) {
      toast.error('Failed to move item to cart')
    }
  }
  
  const handleClearWishlist = () => {
    if (window.confirm('Are you sure you want to clear your wishlist?')) {
      dispatch(clearWishlist())
      toast.success('Wishlist cleared')
    }
  }
  
  if (items.length === 0) {
    return (
      <div className="container-padding py-12 text-center">
        <div className="max-w-md mx-auto">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <i className="ri-heart-line text-3xl text-gray-400"></i>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Your wishlist is empty</h1>
          <p className="text-gray-600 mb-8">Save items you love for later.</p>
          <Link to="/products" className="btn btn-primary px-8">
            Start Shopping
          </Link>
        </div>
      </div>
    )
  }
  
  return (
    <div className="container-padding py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Wishlist</h1>
          <p className="text-gray-600 mt-1">{items.length} items</p>
        </div>
        <button
          onClick={handleClearWishlist}
          className="text-red-600 hover:text-red-700 text-sm font-medium"
        >
          Clear All
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {items.map((item) => (
          <div key={item.product} className="card group">
            <div className="relative">
              <Link to={`/product/${item.product}`}>
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-full h-48 object-cover rounded-t-lg"
                />
              </Link>
              <button
                onClick={() => handleRemove(item.product, item.name)}
                className="absolute top-2 right-2 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-lg hover:bg-red-50 text-red-600"
              >
                <i className="ri-heart-fill"></i>
              </button>
            </div>
            
            <div className="p-4">
              <Link to={`/product/${item.product}`}>
                <h3 className="font-medium text-gray-900 mb-1 line-clamp-1">{item.name}</h3>
              </Link>
              
              <div className="flex items-center justify-between mt-2">
                <div className="font-bold text-gray-900">${item.price.toFixed(2)}</div>
                <div className="text-sm text-gray-600">
                  {item.stock > 0 ? 'In stock' : 'Out of stock'}
                </div>
              </div>
              
              <div className="mt-4 flex space-x-2">
                <button
                  onClick={() => handleMoveToCart(item)}
                  disabled={item.stock === 0}
                  className="btn btn-primary flex-1 text-sm py-2"
                >
                  <i className="ri-shopping-cart-2-line mr-1"></i>
                  Add to Cart
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default WishlistPage
