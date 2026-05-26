
import { useState } from 'react'
import { motion } from "framer-motion";
import { Link } from 'react-router-dom'
import { useGetProductsQuery, useGetTopProductsQuery } from '../store/api/productApi'
import Loader from '../components/Loader'
import Message from '../components/Message'
import ProductCard from '../components/ProductCard'

const HomePage = () => {

  // Search state for filtering products
  const [search, setSearch] = useState('')
  const { data: filteredProducts, isLoading: isSearching, error: searchError } = useGetProductsQuery({ keyword: search, limit: 8 })
  const { data: topProducts, isLoading, error } = useGetTopProductsQuery()

  const heroSlides = [
    {
      title: 'Fresh Groceries Delivered',
      description: 'Get farm-fresh produce delivered to your doorstep',
      image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80',
      link: '/category/fruits',
    },
    {
      title: 'Organic & Healthy',
      description: 'Choose from our wide range of organic products',
      image: 'https://images.unsplash.com/photo-1579113800032-c38bd7635818?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80',
      link: '/category/vegetables',
    },
    {
      title: 'Daily Essentials',
      description: 'Everything you need for your daily kitchen',
      image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80',
      link: '/category/pantry',
    },
  ]

  const categories = [
    { name: 'Fruits', icon: 'ri-apple-fill', slug: 'fruits', color: 'bg-red-50 text-red-600' },
    { name: 'Vegetables', icon: 'ri-leaf-fill', slug: 'vegetables', color: 'bg-green-50 text-green-600' },
    { name: 'Dairy', icon: 'ri-bread-fill', slug: 'dairy', color: 'bg-blue-50 text-blue-600' },
    { name: 'Meat', icon: 'ri-dashboard-fill', slug: 'meat', color: 'bg-rose-50 text-rose-600' },
    { name: 'Bakery', icon: 'ri-cake-2-fill', slug: 'bakery', color: 'bg-amber-50 text-amber-600' },
    { name: 'Beverages', icon: 'ri-drinks-fill', slug: 'beverages', color: 'bg-cyan-50 text-cyan-600' },
    { name: 'Snacks', icon: 'ri-goblet-2-fill', slug: 'snacks', color: 'bg-orange-50 text-orange-600' },
    { name: 'Frozen', icon: 'ri-snowflake-fill', slug: 'frozen', color: 'bg-indigo-50 text-indigo-600' },
  ]

  return (
    <div className="space-y-12 ">
      {/* Hero Section */}
      <section className="relative ">
        <div className="relative h-[650px] overflow-hidden rounded-2xl">
          <div className="absolute inset-0 bg-gradient-to-r from-primary-600/90 to-primary-800/90 z-10"></div>
          <img 
            src={heroSlides[0].image} 
            alt="Fresh Groceries" 
            className="w-full h-full object-cover"
          />
           {/* Top Right Card */}
    <div className="absolute top-10 right-10 z-20 bg-white rounded-2xl shadow-xl px-5 py-4">
      <div className="flex items-center gap-2">
        <span className="text-xl">🚚</span>
        <span className="font-semibold text-gray-900">
          Same Day Delivery
        </span>
      </div>
    </div>

    {/* Bottom Left Stats Card */}
    <div className="absolute bottom-8 left-8 z-20 bg-white/10 backdrop-blur-md rounded-2xl px-6 py-4 text-white border border-white/20">
      <h4 className="text-2xl font-bold">15K+</h4>
      <p className="text-white/80">Happy Customers</p>
    </div>

          <div className="absolute inset-0 z-20 flex items-center">
            <div className=" px-7">
              <div className="max-w-2xl text-white">
                <h1 className="text-5xl font-bold mb-4">Fresh Groceries Delivered to Your Doorstep</h1>
                <p className="text-xl mb-8 text-gray-100">Shop from thousands of products with same-day delivery</p>
                <div className="flex space-x-4">
                  <Link to="/products" className="border-2 border-white text-white hover:bg-white/10 px-8 py-3 text-lg rounded-lg">
                    Shop Now
                  </Link>
                  <Link to="/category/fruits" className="btn border-2 border-white text-white hover:bg-white/10 px-8 py-3 text-lg rounded-lg">
                    Browse Categories
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="px-30  flex flex-col gap-10 py-8">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Shop by Category</h2>
          <p className="text-gray-600">Find everything you need in our organized categories</p>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {categories.map((category) => (
          <Link
  key={category.slug}
  to={`/category/${category.slug}`}
  className="
    group
    relative
    overflow-hidden
    bg-white
    rounded-3xl
    border
    border-gray-100
    shadow-sm
    hover:shadow-xl
    hover:-translate-y-2
    transition-all
    duration-300
    p-6
    text-center
  "
>
  {/* Hover Gradient */}
  <div className="absolute inset-0 bg-gradient-to-br from-green-500/0 to-green-500/5 opacity-0 group-hover:opacity-100 transition-all"></div>

  {/* Content */}
  <div className="relative z-10">
    <div
      className={`
        ${category.color}
        w-20
        h-20
        rounded-2xl
        flex
        items-center
        justify-center
        mx-auto
        mb-4
        transition-all
        duration-300
        group-hover:scale-110
      `}
    >
      <i className={`${category.icon} text-3xl`}></i>
    </div>

    <h3 className="font-semibold text-gray-900">
      {category.name}
    </h3>
  </div>
</Link>
          ))}
        </div>
      </section>


      {/* Search & Featured Products */}
      <section className=" px-45 py-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-10">

 <div>
  <span className="inline-flex items-center px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-sm font-medium mb-3">
    🔥 Trending Now
  </span>

  <h2 className="text-4xl font-bold text-gray-900">
    Featured Products
  </h2>

  <p className="text-gray-500 mt-2 text-lg">
    Discover our best-selling groceries loved by thousands of customers.
  </p>

  {/* Add here */}
<div className="flex flex-wrap gap-6 mt-6">

  <div>
    <p className="text-2xl font-bold text-emerald-600">10K+</p>
    <p className="text-sm text-gray-500">Products</p>
  </div>

  <div>
    <p className="text-2xl font-bold text-emerald-600">15K+</p>
    <p className="text-sm text-gray-500">Customers</p>
  </div>

  <div>
    <p className="text-2xl font-bold text-emerald-600">4.9★</p>
    <p className="text-sm text-gray-500">Rating</p>
  </div>

</div>

</div>

  <div className="relative w-full lg:w-96">
    <i className="ri-search-line absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"></i>

    <input
      type="text"
      placeholder="Search fresh products..."
      value={search}
      onChange={(e) => setSearch(e.target.value)}
      className="w-full pl-12 pr-4 py-4 rounded-2xl border border-gray-200 bg-white shadow-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
    />
  </div>

</div>
<section className="rounded-3xl bg-gradient-to-r from-emerald-600 to-green-500 p-12 text-white mb-7">
  <div className="flex flex-col md:flex-row justify-between items-center">
    
    <div>
      <h2 className="text-4xl font-bold">
        Get 20% Off Your First Order
      </h2>
      <p className="mt-3 text-emerald-100">
        Fresh groceries delivered to your doorstep.
      </p>
    </div>

    <button className="mt-6 md:mt-0 bg-white text-emerald-600 px-8 py-3 rounded-xl font-semibold">
      <Link to="/products" >
                    Shop Now
                  </Link>
    </button>

  </div>
</section>
        {/* Show filtered products if searching, else show top products */}
        {search ? (
          isSearching ? (
            <Loader />
          ) : searchError ? (
            <Message type="error">{searchError?.data?.message || 'Failed to load products'}</Message>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 ">
              {filteredProducts?.products?.length > 0 ? (
                filteredProducts.products.map(product => (
                  <ProductCard key={product._id} product={product} />
                ))
              ) : (
                <Message type="info">No products found.</Message>
              )}
            </div>
          )
        ) : (
          isLoading ? (
            <Loader />
          ) : error ? (
            <Message type="error">{error?.data?.message || 'Failed to load products'}</Message>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 ">
              {topProducts?.slice(0, 8).map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          )
        )}
      </section>

      {/* Features Section */}
   <section className="py-16 bg-gray-50">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div className="text-center mb-12">
  <span className="text-emerald-600 font-semibold uppercase tracking-wider">
    Why Choose Us
  </span>

  <h2 className="text-4xl font-bold text-gray-900 mt-3">
    Fresh Groceries Delivered With Care
  </h2>

  <p className="text-gray-500 mt-4 max-w-2xl mx-auto">
    Quality products, fast delivery, and exceptional customer service for your daily needs.
  </p>
</div>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      

      {/* Card 1 */}
      <div className="group relative overflow-hidden rounded-3xl bg-white p-8 border border-gray-200 transition-all duration-500 hover:-translate-y-3 hover:shadow-2xl">

        <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/0 via-emerald-500/5 to-emerald-500/0 opacity-0 group-hover:opacity-100 transition-all duration-500" />

        <div className="relative z-10">
          <div className="w-20 h-20 rounded-2xl bg-emerald-100 flex items-center justify-center mb-5 transition-all duration-500 group-hover:bg-emerald-500 group-hover:rotate-6">
            <i className="ri-truck-line text-3xl text-emerald-600 group-hover:text-white transition-all duration-500"></i>
          </div>

          <h3 className="text-xl font-bold text-gray-900 mb-2">
            Free Delivery
          </h3>

          <p className="text-gray-500">
            Fast delivery on all orders above $50.
          </p>
          <div className="mt-5 inline-flex items-center rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-600">
  Trusted Service
</div>
        </div>
      </div>

      {/* Card 2 */}
      <div className="group relative overflow-hidden rounded-3xl bg-white p-8 border border-gray-200 transition-all duration-500 hover:-translate-y-3 hover:shadow-2xl">

        <div className="absolute inset-0 bg-gradient-to-r from-green-500/0 via-green-500/5 to-green-500/0 opacity-0 group-hover:opacity-100 transition-all duration-500" />

        <div className="relative z-10">
          <div className="w-20 h-20 rounded-2xl bg-green-100 flex items-center justify-center mb-5 transition-all duration-500 group-hover:bg-green-500 group-hover:rotate-6">
            <i className="ri-shield-check-line text-3xl text-green-600 group-hover:text-white transition-all duration-500"></i>
          </div>

          <h3 className="text-xl font-bold text-gray-900 mb-2">
            Quality Guaranteed
          </h3>

          <p className="text-gray-500">
            Fresh products selected daily.
          </p>
          <div className="mt-5 inline-flex items-center rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-600">
  Trusted Service
</div>
        </div>
      </div>

      {/* Card 3 */}
      <div className="group relative overflow-hidden rounded-3xl bg-white p-8 border border-gray-200 transition-all duration-500 hover:-translate-y-3 hover:shadow-2xl">

        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/0 via-purple-500/5 to-purple-500/0 opacity-0 group-hover:opacity-100 transition-all duration-500" />

        <div className="relative z-10">
          <div className="w-20 h-20 rounded-2xl bg-purple-100 flex items-center justify-center mb-5 transition-all duration-500 group-hover:bg-purple-500 group-hover:rotate-6">
            <i className="ri-customer-service-2-line text-3xl text-purple-600 group-hover:text-white transition-all duration-500"></i>
          </div>

          <h3 className="text-xl font-bold text-gray-900 mb-2">
            24/7 Support
          </h3>

          <p className="text-gray-500">
            Always ready to assist you.
          </p>
          <div className="mt-5 inline-flex items-center rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-600">
  Trusted Service
</div>
        </div>
      </div>

    </div>
  </div>
</section>
    </div>
  )
}

export default HomePage