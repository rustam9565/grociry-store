import { useSelector } from 'react-redux'

export const useProducts = () => {
  const { products, loading, error, page, pages, total } = useSelector((state) => state.products)
  
  return {
    products,
    loading,
    error,
    page,
    pages,
    total,
    
    // Check if products are loading
    isLoading: loading,
    
    // Check if there are products
    hasProducts: products.length > 0,
    
    // Get product by ID
    getProduct: (productId) => 
      products.find(product => product._id === productId),
    
    // Get products by category
    getProductsByCategory: (category) => 
      products.filter(product => product.category === category),
    
    // Get featured products (with high ratings)
    getFeaturedProducts: () => 
      products.filter(product => product.ratings?.average >= 4).slice(0, 8),
    
    // Get discounted products
    getDiscountedProducts: () => 
      products.filter(product => product.discountedPrice).slice(0, 6),
  }
}