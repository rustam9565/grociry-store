import { useEffect, useRef, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { useCart } from '../../hooks/useCart'
import { useGetCartQuery } from '../../store/api/cartApi'
import { useSelector } from 'react-redux'
import { logout } from '../../store/slices/authSlice'
import { useDispatch } from 'react-redux'
import { Outlet } from 'react-router-dom' // Add this import
import SearchModal from '../Search/SearchModal' // Add this import
import Footer from './Footer'

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false) // Add search modal state
  const [searchQuery, setSearchQuery] = useState('')
  const { isAuthenticated, user, isAdmin } = useAuth()
  const { productCount: localCartProductCount } = useCart()
  const { data: cartData } = useGetCartQuery(undefined, {
    skip: !isAuthenticated
  })
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const location = useLocation()
  const menuRef = useRef(null)
  const wishlistItems = useSelector((state) => state.wishlist?.items || [])
  const queryFromUrl = new URLSearchParams(location.search).get('q') || ''
  const cartCount = isAuthenticated ? cartData?.items?.length || 0 : localCartProductCount

  useEffect(() => {
    if (location.pathname === '/search') {
      setSearchQuery(queryFromUrl)
      return
    }

    setSearchQuery('')
  }, [location.pathname, queryFromUrl])

  useEffect(() => {
    const trimmedQuery = searchQuery.trim()
    const currentUrl = `${location.pathname}${location.search}`

    if (!trimmedQuery) {
      if (location.pathname === '/search' && location.search) {
        const timer = setTimeout(() => {
          if (currentUrl === `${location.pathname}${location.search}`) {
            navigate('/search')
          }
        }, 300)

        return () => clearTimeout(timer)
      }

      return
    }

    const timer = setTimeout(() => {
      const nextUrl = `/search?q=${encodeURIComponent(trimmedQuery)}`

      if (currentUrl !== nextUrl) {
        navigate(nextUrl)
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [searchQuery, navigate, location.pathname, location.search])

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)

    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLogout = () => {
    dispatch(logout())
    navigate('/login')
  }

  const handleSearch = (e) => {
    e.preventDefault()
    const trimmedQuery = searchQuery.trim()

    if (trimmedQuery) {
      navigate(`/search?q=${encodeURIComponent(trimmedQuery)}`)
    }
  }

  const categories = [
    { name: 'Fruits', icon: 'ri-apple-fill', slug: 'fruits', color: 'bg-red-50 text-red-600' },
    { name: 'Vegetables', icon: 'ri-leaf-fill', slug: 'vegetables', color: 'bg-green-50 text-green-600' },
    { name: 'Dairy', icon: 'ri-bread-fill', slug: 'dairy', color: 'bg-blue-50 text-blue-600' },
    { name: 'Meat', icon: 'ri-dashboard-fill', slug: 'meat', color: 'bg-rose-50 text-rose-600' },
    { name: 'Bakery', icon: 'ri-cake-2-fill', slug: 'bakery', color: 'bg-amber-50 text-amber-600' },
    { name: 'Beverages', icon: 'ri-drinks-fill', slug: 'beverages', color: 'bg-cyan-50 text-cyan-600' },
    { name: 'Snacks', icon: 'ri-goblet-2-fill', slug: 'snacks', color: 'bg-orange-50 text-orange-600' },
   
  ]
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Main Header */}
      <header className="sticky top-0 z-40 border-b border-gray-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
<Link
  to="/"
  className="group flex items-center gap-3 transition-all duration-300 hover:scale-105"
>
  {/* Icon */}
  <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 shadow-lg shadow-green-200 group-hover:shadow-green-300 transition-all duration-300">
    <i className="ri-shopping-basket-2-fill text-2xl text-white"></i>
  </div>

  {/* Text */}
  <div className="flex flex-col leading-none">
    <span className="text-2xl font-extrabold bg-gradient-to-r from-green-600 via-emerald-500 to-lime-500 bg-clip-text text-transparent tracking-wide">
      GroceryStore
    </span>

    <span className="text-[11px] uppercase tracking-[3px] text-gray-400 font-semibold mt-1">
      Fresh & Healthy
    </span>
  </div>
</Link>

            {/* Search Bar */}
            <div className="hidden md:flex flex-1 max-w-2xl mx-8">
              <form onSubmit={handleSearch} className="w-full">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search for products..."
                    className="w-full px-4 py-2 pl-10 pr-12 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <i className="ri-search-line absolute left-3 top-2.5 text-gray-400"></i>
                  <button
                    type="submit"
                    className="absolute right-2 top-1.5 bg-primary-600 p-1.5 text-white rounded-full hover:bg-primary-700 transition"
                  >
                    <i className="ri-arrow-right-line"></i>
                  </button>
                </div>
              </form>
            </div>

            {/* Actions */}
            <div className="flex items-center space-x-6">
              {/* Mobile Search */}
              <button 
                className="md:hidden"
                onClick={() => setIsSearchOpen(true)}
              >
                <i className="ri-search-line text-2xl text-gray-700"></i>
              </button>

              {/* Wishlist */}
              <Link to="/wishlist" className="relative">
                <i className="ri-heart-line text-2xl text-gray-700 hover:text-red-600 transition"></i>
                {wishlistItems.length > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {wishlistItems.length}
                  </span>
                )}
              </Link>

              {/* Cart */}
              <Link to="/cart" className="relative">
                <i className="ri-shopping-cart-2-line text-2xl text-gray-700 hover:text-primary-600 transition"></i>
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </Link>

              {/* User Menu */}
              <div ref={menuRef} className="relative">
                <button
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="flex items-center space-x-2 focus:outline-none"
                >
                  <i className="ri-user-line text-2xl text-gray-700"></i>
                  <i className="ri-arrow-down-s-line text-gray-600"></i>
                </button>
                
                {isMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border py-2 z-50">
                    {isAuthenticated ? (
                      <>
                        <Link
                          to="/profile"
                          className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          <i className="ri-user-line mr-2"></i>
                          My Profile
                        </Link>
                        <Link
                          to="/orders"
                          className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          <i className="ri-list-check-2 mr-2"></i>
                          My Orders
                        </Link>
                        <Link
                          to="/wishlist"
                          className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          <i className="ri-heart-line mr-2"></i>
                          My Wishlist
                        </Link>
                        {isAdmin && (
                          <>
                            <div className="border-t my-2"></div>
                            <Link
                              to="/admin"
                              className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100"
                              onClick={() => setIsMenuOpen(false)}
                            >
                              <i className="ri-dashboard-line mr-2"></i>
                              Admin Dashboard
                            </Link>
                          </>
                        )}
                        <div className="border-t my-2"></div>
                        <button
                          onClick={() => {
                            setIsMenuOpen(false)
                            handleLogout()
                          }}
                          className="flex items-center w-full text-left px-4 py-2 text-red-600 hover:bg-gray-100"
                        >
                          <i className="ri-logout-box-r-line mr-2"></i>
                          Logout
                        </button>
                      </>
                    ) : (
                      <>
                        <Link
                          to="/login"
                          className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          <i className="ri-login-box-line mr-2"></i>
                          Sign In
                        </Link>
                        <Link
                          to="/register"
                          className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          <i className="ri-user-add-line mr-2"></i>
                          Register
                        </Link>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Categories Bar */}
          <div className="hidden md:flex items-center justify-between py-3 border-t">
            <div className="flex space-x-6 overflow-x-auto">
              {categories.map((category) => (
                <Link
                  key={category.slug}
                  to={`/category/${category.slug}`}
                  className={`${category.color} flex items-center space-x-1 px-3 py-1 rounded-full text-sm hover:bg-opacity-80 transition`}
                >
                  <i className={category.icon}></i>
                  <span>{category.name}</span>
                </Link>
              ))}
            </div>
            <div className="flex items-center space-x-4 text-sm">
              <Link to="/products" className="text-red-600 hover:text-red-700">
                <i className="ri-flashlight-fill mr-1"></i>
                Today's Deals
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Search Modal */}
      <SearchModal 
        isOpen={isSearchOpen} 
        onClose={() => setIsSearchOpen(false)} 
      />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}

export default Header
