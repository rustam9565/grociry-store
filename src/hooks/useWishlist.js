import { useSelector } from 'react-redux'

export const useWishlist = () => {
  const { items } = useSelector((state) => state.wishlist)
  
  return {
    items,
    count: items.length,
    isEmpty: items.length === 0,
    
    // Check if product is in wishlist
    isInWishlist: (productId) => 
      items.some(item => item.product === productId),
    
    // Get wishlist item
    getItem: (productId) => 
      items.find(item => item.product === productId),
  }
}