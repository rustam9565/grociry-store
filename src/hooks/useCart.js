import { useSelector } from 'react-redux'

export const useCart = () => {
  const { cartItems } = useSelector((state) => state.cart)
  
  const productCount = cartItems.length

  // Calculate total items count
  const itemsCount = cartItems.reduce((acc, item) => acc + item.quantity, 0)

  // Calculate total price
  const totalPrice = cartItems.reduce(
    (acc, item) => acc + (item.price * item.quantity),
    0
  )

  // Calculate total savings (if items have discounts)
  const totalSavings = cartItems.reduce((acc, item) => {
    if (item.originalPrice) {
      return acc + ((item.originalPrice - item.price) * item.quantity)
    }
    return acc
  }, 0)
  
  // Check if cart is empty
  const isEmpty = cartItems.length === 0
  
  // Get item by product ID
  const getItem = (productId) => 
    cartItems.find(item => item.product === productId)
  
  // Check if product is in cart
  const isInCart = (productId) => 
    cartItems.some(item => item.product === productId)
 
  return {
    // Cart items
    items: cartItems,
    
    // Summary
    count: itemsCount,
    productCount,
    total: totalPrice.toFixed(2),
    savings: totalSavings.toFixed(2),
    isEmpty,
    
    // Utility functions
    getItem,
    isInCart,
    
    // Individual calculations
    itemsCount,
    totalPrice: totalPrice.toFixed(2),
    totalSavings: totalSavings.toFixed(2),
  }
}
