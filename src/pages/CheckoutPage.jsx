import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useCart } from '../hooks/useCart'
import { useCreateOrderMutation } from '../store/api/orderApi'
import { useGetCartQuery } from '../store/api/cartApi'
import { clearCart } from '../store/slices/cartSlice'
import { useDispatch } from 'react-redux'
import Loader from '../components/Loader'
import Message from '../components/Message'
import toast from 'react-hot-toast'

const CheckoutPage = () => {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { isAuthenticated, user } = useAuth()
  
  // Local cart for non-authenticated users
  const localCart = useCart()
  
  // API cart for authenticated users
  const { data: cartData, isLoading: isLoadingCart } = useGetCartQuery(undefined, {
    skip: !isAuthenticated
  })
  
  // Order mutation
  const [createOrder, { isLoading: isCreatingOrder }] = useCreateOrderMutation()
  
  // Form states
  const [step, setStep] = useState(1) // 1: Shipping, 2: Payment, 3: Review
  const [shippingAddress, setShippingAddress] = useState({
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'United States',
    phone: ''
  })
  
  const [paymentMethod, setPaymentMethod] = useState('card')
  const [deliveryDate, setDeliveryDate] = useState('')
  const [deliverySlot, setDeliverySlot] = useState('afternoon')
  const [errors, setErrors] = useState({})
  
  // Get cart items based on authentication
  const cartItems = isAuthenticated ? cartData?.items || [] : localCart.items
  const totalPrice = isAuthenticated ? cartData?.totalPrice || 0 : localCart.total
  
  // Calculate totals
  const shippingPrice = parseFloat(totalPrice) > 50 ? 0 : 5.99
  const taxPrice = parseFloat(totalPrice) * 0.1
  const finalTotal = parseFloat(totalPrice) + shippingPrice + taxPrice
  
  // Set default delivery date (tomorrow)
  useEffect(() => {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    setDeliveryDate(tomorrow.toISOString().split('T')[0])
    
    // Pre-fill shipping address if user exists
    if (user?.address) {
      setShippingAddress(prev => ({
        ...prev,
        ...user.address,
        phone: user.phone || ''
      }))
    }
  }, [user])
  
  const validateShipping = () => {
    const newErrors = {}
    
    if (!shippingAddress.street.trim()) newErrors.street = 'Street address is required'
    if (!shippingAddress.city.trim()) newErrors.city = 'City is required'
    if (!shippingAddress.state.trim()) newErrors.state = 'State is required'
    if (!shippingAddress.zipCode.trim()) newErrors.zipCode = 'ZIP code is required'
    if (!shippingAddress.phone.trim()) newErrors.phone = 'Phone number is required'
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }
  
  const handleNextStep = () => {
    if (step === 1 && !validateShipping()) {
      toast.error('Please fill in all required shipping information')
      return
    }
    setStep(step + 1)
  }
  
  const handlePreviousStep = () => {
    setStep(step - 1)
  }
  
  const handlePlaceOrder = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to place an order')
      navigate('/login?redirect=/checkout')
      return
    }
    
    if (cartItems.length === 0) {
      toast.error('Your cart is empty')
      navigate('/cart')
      return
    }
    
    try {
      const orderData = {
        shippingAddress,
        paymentMethod,
        deliveryDate,
        deliverySlot,
        orderItems: cartItems.map(item => ({
          product: item.product?._id || item.product,
          name: item.product?.name || item.name,
          image: item.product?.images?.[0]?.url || item.image,
          price: item.product?.discountedPrice || item.price || item.product?.price,
          quantity: item.quantity,
          unit: item.product?.unit || 'piece'
        }))
      }
      
      const result = await createOrder(orderData).unwrap()
      
      // Clear cart after successful order
      dispatch(clearCart())
      
      toast.success('Order placed successfully!')
      navigate(`/order/${result._id}`)
      
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to place order')
    }
  }
  
  const deliverySlots = [
    { value: 'morning', label: 'Morning (8 AM - 12 PM)', icon: 'ri-sun-line' },
    { value: 'afternoon', label: 'Afternoon (12 PM - 4 PM)', icon: 'ri-sun-cloudy-line' },
    { value: 'evening', label: 'Evening (4 PM - 8 PM)', icon: 'ri-moon-line' },
  ]
  
  const paymentMethods = [
    { value: 'card', label: 'Credit/Debit Card', icon: 'ri-bank-card-line' },
    { value: 'paypal', label: 'PayPal', icon: 'ri-paypal-line' },
    { value: 'cash', label: 'Cash on Delivery', icon: 'ri-money-dollar-circle-line' },
  ]
  
  if (isLoadingCart) return <Loader />
  
  if (cartItems.length === 0) {
    return (
      <div className="container-padding py-12 text-center">
        <Message type="info">
          Your cart is empty. <a href="/products" className="text-primary-600 hover:underline">Continue shopping</a>
        </Message>
      </div>
    )
  }
  
  return (
    <div className="container-padding py-8">
      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex justify-between items-center max-w-3xl mx-auto">
          {['Shipping', 'Payment', 'Review'].map((stepName, index) => (
            <div key={stepName} className="flex items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${step > index + 1 ? 'bg-primary-600 text-white' : step === index + 1 ? 'bg-primary-100 text-primary-600 border-2 border-primary-600' : 'bg-gray-100 text-gray-400'}`}>
                {step > index + 1 ? (
                  <i className="ri-check-line"></i>
                ) : (
                  <span className="font-semibold">{index + 1}</span>
                )}
              </div>
              <span className={`ml-2 font-medium ${step >= index + 1 ? 'text-primary-600' : 'text-gray-400'}`}>
                {stepName}
              </span>
              {index < 2 && (
                <div className={`w-16 h-0.5 mx-4 ${step > index + 1 ? 'bg-primary-600' : 'bg-gray-200'}`}></div>
              )}
            </div>
          ))}
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Checkout Form */}
        <div className="lg:col-span-2">
          {/* Step 1: Shipping Address */}
          {step === 1 && (
            <div className="card">
              <div className="p-6 border-b">
                <h2 className="text-xl font-bold text-gray-900">Shipping Address</h2>
                <p className="text-gray-600 mt-1">Where should we deliver your order?</p>
              </div>
              
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Street Address *
                    </label>
                    <input
                      type="text"
                      className={`input ${errors.street ? 'border-red-300' : ''}`}
                      value={shippingAddress.street}
                      onChange={(e) => setShippingAddress(prev => ({ ...prev, street: e.target.value }))}
                      placeholder="123 Main St"
                    />
                    {errors.street && <p className="mt-1 text-sm text-red-600">{errors.street}</p>}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      City *
                    </label>
                    <input
                      type="text"
                      className={`input ${errors.city ? 'border-red-300' : ''}`}
                      value={shippingAddress.city}
                      onChange={(e) => setShippingAddress(prev => ({ ...prev, city: e.target.value }))}
                      placeholder="New York"
                    />
                    {errors.city && <p className="mt-1 text-sm text-red-600">{errors.city}</p>}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      State *
                    </label>
                    <input
                      type="text"
                      className={`input ${errors.state ? 'border-red-300' : ''}`}
                      value={shippingAddress.state}
                      onChange={(e) => setShippingAddress(prev => ({ ...prev, state: e.target.value }))}
                      placeholder="NY"
                    />
                    {errors.state && <p className="mt-1 text-sm text-red-600">{errors.state}</p>}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      ZIP Code *
                    </label>
                    <input
                      type="text"
                      className={`input ${errors.zipCode ? 'border-red-300' : ''}`}
                      value={shippingAddress.zipCode}
                      onChange={(e) => setShippingAddress(prev => ({ ...prev, zipCode: e.target.value }))}
                      placeholder="10001"
                    />
                    {errors.zipCode && <p className="mt-1 text-sm text-red-600">{errors.zipCode}</p>}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Country
                    </label>
                    <select
                      className="input"
                      value={shippingAddress.country}
                      onChange={(e) => setShippingAddress(prev => ({ ...prev, country: e.target.value }))}
                    >
                      <option value="United States">United States</option>
                      <option value="Canada">Canada</option>
                      <option value="United Kingdom">United Kingdom</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      className={`input ${errors.phone ? 'border-red-300' : ''}`}
                      value={shippingAddress.phone}
                      onChange={(e) => setShippingAddress(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder="(555) 123-4567"
                    />
                    {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone}</p>}
                  </div>
                </div>
                
                {/* Delivery Date & Time */}
                <div className="mt-8">
                  <h3 className="text-lg font-semibold mb-4">Delivery Schedule</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Delivery Date *
                      </label>
                      <input
                        type="date"
                        className="input"
                        value={deliveryDate}
                        onChange={(e) => setDeliveryDate(e.target.value)}
                        min={new Date().toISOString().split('T')[0]}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Delivery Time Slot *
                      </label>
                      <div className="space-y-2">
                        {deliverySlots.map((slot) => (
                          <label
                            key={slot.value}
                            className={`flex items-center p-3 border rounded-lg cursor-pointer ${deliverySlot === slot.value ? 'border-primary-500 bg-primary-50' : 'border-gray-200 hover:border-gray-300'}`}
                          >
                            <input
                              type="radio"
                              name="deliverySlot"
                              value={slot.value}
                              checked={deliverySlot === slot.value}
                              onChange={(e) => setDeliverySlot(e.target.value)}
                              className="h-4 w-4 text-primary-600"
                            />
                            <i className={`${slot.icon} ml-3 mr-2`}></i>
                            <span>{slot.label}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Step 2: Payment Method */}
          {step === 2 && (
            <div className="card">
              <div className="p-6 border-b">
                <h2 className="text-xl font-bold text-gray-900">Payment Method</h2>
                <p className="text-gray-600 mt-1">How would you like to pay?</p>
              </div>
              
              <div className="p-6">
                <div className="space-y-4">
                  {paymentMethods.map((method) => (
                    <label
                      key={method.value}
                      className={`flex items-center p-4 border rounded-lg cursor-pointer ${paymentMethod === method.value ? 'border-primary-500 bg-primary-50' : 'border-gray-200 hover:border-gray-300'}`}
                    >
                      <input
                        type="radio"
                        name="paymentMethod"
                        value={method.value}
                        checked={paymentMethod === method.value}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="h-4 w-4 text-primary-600"
                      />
                      <i className={`${method.icon} ml-4 mr-3 text-xl`}></i>
                      <div>
                        <div className="font-medium">{method.label}</div>
                        {method.value === 'cash' && (
                          <div className="text-sm text-gray-600">Pay when you receive your order</div>
                        )}
                      </div>
                    </label>
                  ))}
                </div>
                
                {/* Card Details (if card selected) */}
                {paymentMethod === 'card' && (
                  <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-medium mb-4">Card Details</h4>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Card Number
                        </label>
                        <input
                          type="text"
                          className="input"
                          placeholder="1234 5678 9012 3456"
                        />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Expiry Date
                          </label>
                          <input
                            type="text"
                            className="input"
                            placeholder="MM/YY"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            CVV
                          </label>
                          <input
                            type="text"
                            className="input"
                            placeholder="123"
                          />
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Name on Card
                        </label>
                        <input
                          type="text"
                          className="input"
                          placeholder="John Doe"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
          
          {/* Step 3: Review Order */}
          {step === 3 && (
            <div className="card">
              <div className="p-6 border-b">
                <h2 className="text-xl font-bold text-gray-900">Review Your Order</h2>
                <p className="text-gray-600 mt-1">Please review your order before placing it</p>
              </div>
              
              <div className="p-6">
                {/* Shipping Address Review */}
                <div className="mb-6">
                  <h3 className="font-semibold mb-2">Shipping Address</h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="font-medium">{user?.name || 'Guest'}</p>
                    <p>{shippingAddress.street}</p>
                    <p>{shippingAddress.city}, {shippingAddress.state} {shippingAddress.zipCode}</p>
                    <p>{shippingAddress.country}</p>
                    <p className="mt-2">Phone: {shippingAddress.phone}</p>
                    <button
                      onClick={() => setStep(1)}
                      className="text-primary-600 hover:text-primary-700 text-sm mt-2"
                    >
                      Edit
                    </button>
                  </div>
                </div>
                
                {/* Payment Method Review */}
                <div className="mb-6">
                  <h3 className="font-semibold mb-2">Payment Method</h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center">
                      <i className={`${paymentMethods.find(m => m.value === paymentMethod)?.icon} mr-3 text-xl`}></i>
                      <div>
                        <p className="font-medium">
                          {paymentMethods.find(m => m.value === paymentMethod)?.label}
                        </p>
                        {paymentMethod === 'card' && (
                          <p className="text-sm text-gray-600">Card ending in **** 3456</p>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => setStep(2)}
                      className="text-primary-600 hover:text-primary-700 text-sm mt-2"
                    >
                      Edit
                    </button>
                  </div>
                </div>
                
                {/* Delivery Schedule Review */}
                <div className="mb-6">
                  <h3 className="font-semibold mb-2">Delivery Schedule</h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="font-medium">
                      {new Date(deliveryDate).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                    <p>
                      {deliverySlots.find(s => s.value === deliverySlot)?.label}
                    </p>
                    <button
                      onClick={() => setStep(1)}
                      className="text-primary-600 hover:text-primary-700 text-sm mt-2"
                    >
                      Edit
                    </button>
                  </div>
                </div>
                
                {/* Order Items Review */}
                <div>
                  <h3 className="font-semibold mb-2">Order Items</h3>
                  <div className="space-y-3">
                    {cartItems.slice(0, 3).map((item) => (
                      <div key={item._id || item.product} className="flex items-center justify-between">
                        <div className="flex items-center">
                          <img
                            src={item.product?.images?.[0]?.url || item.image}
                            alt={item.product?.name || item.name}
                            className="w-12 h-12 object-cover rounded mr-3"
                          />
                          <div>
                            <p className="font-medium text-sm">{item.product?.name || item.name}</p>
                            <p className="text-sm text-gray-600">
                              Qty: {item.quantity} × ${(item.product?.discountedPrice || item.price || item.product?.price).toFixed(2)}
                            </p>
                          </div>
                        </div>
                        <div className="font-medium">
                          ₹{((item.product?.discountedPrice || item.price || item.product?.price) * item.quantity).toFixed(2)}
                        </div>
                      </div>
                    ))}
                    
                    {cartItems.length > 3 && (
                      <p className="text-center text-gray-600">
                        + {cartItems.length - 3} more items
                      </p>
                    )}
                    
                    <button
                      onClick={() => navigate('/cart')}
                      className="text-primary-600 hover:text-primary-700 text-sm w-full text-center"
                    >
                      View all items in cart
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Navigation Buttons */}
          <div className="flex justify-between mt-6">
            {step > 1 ? (
              <button
                onClick={handlePreviousStep}
                className="btn btn-outline"
              >
                <i className="ri-arrow-left-line mr-2"></i>
                Back
              </button>
            ) : (
              <button
                onClick={() => navigate('/cart')}
                className="btn btn-outline"
              >
                <i className="ri-arrow-left-line mr-2"></i>
                Back to Cart
              </button>
            )}
            
            {step < 3 ? (
              <button
                onClick={handleNextStep}
                className="btn btn-primary"
              >
                Continue to {step === 1 ? 'Payment' : 'Review'}
                <i className="ri-arrow-right-line ml-2"></i>
              </button>
            ) : (
              <button
                onClick={handlePlaceOrder}
                disabled={isCreatingOrder || !isAuthenticated}
                className="btn bg-green-600 hover:bg-green-700 text-white"
              >
                {isCreatingOrder ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Processing...
                  </>
                ) : (
                  <>
                    <i className="ri-check-line mr-2"></i>
                    Place Order
                  </>
                )}
              </button>
            )}
          </div>
        </div>
        
        {/* Order Summary Sidebar */}
        <div>
          <div className="card sticky top-24">
            <div className="p-6 border-b">
              <h2 className="text-lg font-semibold">Order Summary</h2>
            </div>
            
            <div className="p-6">
              {/* Order Items Preview */}
              <div className="mb-6">
                <h3 className="font-medium mb-3">Items ({cartItems.length})</h3>
                <div className="space-y-3 max-h-60 overflow-y-auto">
                  {cartItems.map((item) => (
                    <div key={item._id || item.product} className="flex items-center">
                      <img
                        src={item.product?.images?.[0]?.url || item.image}
                        alt={item.product?.name || item.name}
                        className="w-12 h-12 object-cover rounded mr-3"
                      />
                      <div className="flex-1">
                        <p className="text-sm font-medium">{item.product?.name || item.name}</p>
                        <p className="text-sm text-gray-600">
                          Qty: {item.quantity} × ₹{(item.product?.discountedPrice || item.price || item.product?.price).toFixed(2)}
                        </p>
                      </div>
                      <div className="text-sm font-medium">
                        ₹{((item.product?.discountedPrice || item.price || item.product?.price) * item.quantity).toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Price Breakdown */}
              <div className="space-y-3 border-t pt-6">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">${parseFloat(totalPrice).toFixed(2)}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping</span>
                  <span className="font-medium">
                    {shippingPrice === 0 ? 'FREE' : `$${shippingPrice.toFixed(2)}`}
                    {parseFloat(totalPrice) < 50 && parseFloat(totalPrice) > 0 && (
                      <span className="text-sm text-gray-500 ml-1">
                        (Free over $50)
                      </span>
                    )}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Tax</span>
                  <span className="font-medium">${taxPrice.toFixed(2)}</span>
                </div>
                
                <div className="border-t pt-3">
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span>₹{finalTotal.toFixed(2)}</span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">Including all taxes</p>
                </div>
              </div>
              
              {/* Delivery Info */}
              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center mb-2">
                  <i className="ri-truck-line text-blue-600 mr-2"></i>
                  <span className="font-medium">Delivery</span>
                </div>
                <p className="text-sm text-gray-700">
                  {new Date(deliveryDate).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric'
                  })} • {deliverySlots.find(s => s.value === deliverySlot)?.label.split(' (')[0]}
                </p>
              </div>
              
              {/* Security Info */}
              <div className="mt-6 text-center text-sm text-gray-600">
                <p className="mb-2">
                  <i className="ri-shield-check-line text-green-500 mr-1"></i>
                  256-bit SSL secured checkout
                </p>
                <p>
                  <i className="ri-lock-line text-primary-600 mr-1"></i>
                  Your payment information is encrypted
                </p>
              </div>
            </div>
          </div>
          
          {/* Need Help Section */}
          <div className="card mt-6">
            <div className="p-6">
              <div className="flex items-center mb-3">
                <i className="ri-customer-service-2-line text-primary-600 mr-2"></i>
                <h3 className="font-semibold">Need Help?</h3>
              </div>
              <p className="text-sm text-gray-600 mb-3">
                Have questions about your order? Our customer support team is here to help.
              </p>
              <div className="space-y-2 text-sm">
                <div className="flex items-center">
                  <i className="ri-phone-line text-gray-400 mr-2"></i>
                  <span>+1 (555) 123-4567</span>
                </div>
                <div className="flex items-center">
                  <i className="ri-mail-line text-gray-400 mr-2"></i>
                  <span>support@grocerystore.com</span>
                </div>
                <div className="flex items-center">
                  <i className="ri-time-line text-gray-400 mr-2"></i>
                  <span>24/7 Support</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CheckoutPage