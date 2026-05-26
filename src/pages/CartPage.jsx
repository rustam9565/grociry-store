import { Link, useNavigate } from 'react-router-dom'
import { useCart } from '../hooks/useCart'
import { useAuth } from '../hooks/useAuth'
import { useGetCartQuery, useUpdateCartItemMutation, useRemoveFromCartMutation, useClearCartMutation } from '../store/api/cartApi'
import { removeFromCart, updateCartItem, clearCart } from '../store/slices/cartSlice'
import { useDispatch } from 'react-redux'
import Loader from '../components/Loader'
import Message from '../components/Message'
import toast from 'react-hot-toast'

const CartPage = () => {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { isAuthenticated } = useAuth()
  
  // For authenticated users
  const { data: cartData, isLoading } = useGetCartQuery(undefined, {
    skip: !isAuthenticated
  })

  // Mutations
  const [updateCartItemApi] = useUpdateCartItemMutation()
  const [removeFromCartApi] = useRemoveFromCartMutation()
  const [clearCartApi] = useClearCartMutation()
  
  // For non-authenticated users
  const localCart = useCart()
  
  const cartItems = isAuthenticated ? cartData?.items || [] : localCart.items
  const totalPrice = isAuthenticated ? cartData?.totalPrice || 0 : localCart.total
  const itemsCount = isAuthenticated ? cartData?.totalItems || 0 : localCart.count
  const handleQuantityChange = async (itemId, productId, newQuantity) => {
    if (newQuantity < 1) return
    
    try {
      if (isAuthenticated) {
        await updateCartItemApi({ itemId, quantity: newQuantity }).unwrap()
      } else {
        dispatch(updateCartItem({ productId, quantity: newQuantity }))
      }
    } catch (err) {
      toast.error('Failed to update quantity')
    }
  }
  
  const handleRemoveItem = async (itemId, productId) => {
    try {
      if (isAuthenticated) {
        await removeFromCartApi(itemId).unwrap()
      } else {
        dispatch(removeFromCart(productId))
      }
      toast.success('Item removed from cart')
    } catch (err) {
      toast.error('Failed to remove item')
    }
  }
  
  const handleClearCart = async () => {
    if (window.confirm('Are you sure you want to clear your cart?')) {
      try {
        if (isAuthenticated) {
          await clearCartApi().unwrap()
        } else {
          dispatch(clearCart())
        }
        toast.success('Cart cleared')
      } catch (err) {
        toast.error('Failed to clear cart')
      }
    }
  }
  
  if (isLoading) return <Loader />
 
  
  if (cartItems.length === 0) {
    return (
      <div className="container-padding py-12 text-center">
        <div className="max-w-md mx-auto">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <i className="ri-shopping-cart-2-line text-3xl text-gray-400"></i>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Your cart is empty</h1>
          <p className="text-gray-600 mb-8">Looks like you haven't added any items to your cart yet.</p>
          <Link to="/products" className="btn btn-primary px-8">
            Start Shopping
          </Link>
        </div>
      </div>
    )
  }
  
  return (
    <div className="container-padding py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Shopping Cart ({itemsCount} items)</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2">
          <div className="card">
            <div className="p-6 border-b">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold">Cart Items</h2>
                <button
                  onClick={handleClearCart}
                  className="text-red-600 hover:text-red-700 text-sm font-medium"
                >
                  Clear Cart
                </button>
              </div>
            </div>
            
            <div className="divide-y">
              {cartItems.map((item) => (
                <div key={item._id || item.product} className="p-6">
                  <div className="flex flex-col sm:flex-row">
                    {/* Product Image */}
                    <div className="sm:w-24 sm:h-24 w-full h-48 mb-4 sm:mb-0 sm:mr-6">
                      <img
                        src={item.product?.images?.[0]?.url || item.image || 'https://via.placeholder.com/150'}
                        alt={item.product?.name || item.name}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    </div>
                    
                    {/* Product Details */}
                    <div className="flex-1">
                      <div className="flex justify-between">
                        <div>
                          <Link 
                            to={`/product/${item.product?._id || item.product}`}
                            className="font-medium text-gray-900 hover:text-primary-600"
                          >
                            {item.product?.name || item.name}
                          </Link>
                          <p className="text-sm text-gray-600 mt-1">
                            {item.product?.brand || 'Generic'} • {item.product?.unit || 'unit'}
                          </p>
                          <div className="flex items-center mt-2">
                            <span className="text-lg font-bold text-gray-900">
                            ₹{(item.product?.discountedPrice || item.price || item.product?.price).toFixed(2)}
                            </span>
                            {item.product?.discountedPrice && item.product?.discountedPrice < item.product?.price && (
                              <span className="text-sm text-gray-500 line-through ml-2">
                                ₹{item.product?.price.toFixed(2)}
                              </span>
                            )}
                          </div>
                        </div>
                        
                        <button
                          onClick={() => handleRemoveItem(item._id, item.product?._id || item.product)}
                          className="text-gray-400 hover:text-red-500"
                        >
                          <i className="ri-close-line text-xl"></i>
                        </button>
                      </div>
                      
                      {/* Quantity Controls */}
                      <div className="flex justify-between items-center mt-4">
                        <div className="flex items-center">
                          <button
                            onClick={() => handleQuantityChange(
                              item._id, 
                              item.product?._id || item.product, 
                              item.quantity - 1
                            )}
                            disabled={item.quantity <= 1}
                            className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded-l hover:bg-gray-50 disabled:opacity-50"
                          >
                            <i className="ri-subtract-line"></i>
                          </button>
                          <span className="w-12 h-8 flex items-center justify-center border-y border-gray-300 text-center">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => handleQuantityChange(
                              item._id, 
                              item.product?._id || item.product, 
                              item.quantity + 1
                            )}
                            disabled={item.quantity >= (item.product?.stock || 99)}
                            className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded-r hover:bg-gray-50 disabled:opacity-50"
                          >
                            <i className="ri-add-line"></i>
                          </button>
                        </div>
                        
                        <div className="text-right">
                          <div className="text-sm text-gray-600">Total</div>
                          <div className="text-xl font-bold">
                            ₹{((item.product?.discountedPrice || item.price || item.product?.price) * item.quantity).toFixed(2)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Continue Shopping */}
          <div className="mt-6">
            <Link to="/products" className="flex items-center text-primary-600 hover:text-primary-700">
              <i className="ri-arrow-left-line mr-2"></i>
              Continue Shopping
            </Link>
          </div>
        </div>
        
        {/* Order Summary */}
        <div>
          <div className="card sticky top-24">
            <div className="p-6 border-b">
              <h2 className="text-lg font-semibold">Order Summary</h2>
            </div>
            
            <div className="p-6">
              <div className="space-y-4 mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">₹{parseFloat(totalPrice).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping</span>
                  <span className="font-medium">
                    {parseFloat(totalPrice) > 50 ? 'FREE' : '$5.99'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tax</span>
                  <span className="font-medium">
                    ₹{(parseFloat(totalPrice) * 0.1).toFixed(2)}
                  </span>
                </div>
                <div className="border-t pt-4">
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span>
                      ₹{(
                        parseFloat(totalPrice) + 
                        (parseFloat(totalPrice) > 50 ? 0 : 5.99) + 
                        (parseFloat(totalPrice) * 0.1)
                      ).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
              
              <button
                onClick={() => navigate('/checkout')}
                className="btn btn-primary w-full py-3 mb-4"
              >
                Proceed to Checkout
              </button>
              
              <div className="text-center text-sm text-gray-600">
                <p className="mb-2">
                  <i className="ri-shield-check-line text-green-500 mr-1"></i>
                  Secure checkout
                </p>
                <p>
                  <i className="ri-lock-line text-primary-600 mr-1"></i>
                  Your payment information is encrypted
                </p>
              </div>
            </div>
          </div>
          
          {/* Promo Code */}
          <div className="card mt-6">
            <div className="p-6">
              <h3 className="font-semibold mb-3">Have a Promo Code?</h3>
              <div className="flex">
                <input
                  type="text"
                  placeholder="Enter code"
                  className="input rounded-r-none"
                />
                <button className="btn bg-gray-900 text-white rounded-l-none hover:bg-gray-800">
                  Apply
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CartPage
