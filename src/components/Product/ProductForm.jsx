import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCreateProductMutation } from '../../store/api/productApi'
import Loader from '../../components/Loader'
import Message from '../../components/Message'
import toast from 'react-hot-toast'

const ProductForm = () => {
  const navigate = useNavigate()
  const [createProduct, { isLoading }] = useCreateProductMutation()
  
  // Initialize form state based on Product model
  const [formData, setFormData] = useState({
    // Basic Information
    name: '',
    description: '',
    price: '',
    discountedPrice: '',
    category: 'fruits',
    subCategory: '',
    brand: '',
    stock: '',
    unit: 'kg',
    
    // Images
    images: [{ url: '', altText: '' }],
    
    // Ratings (initial values)
    ratings: {
      average: 0,
      count: 0
    },
    
    // Features
    features: [''],
    
    // Nutritional Information
    nutritionalInfo: {
      calories: '',
      protein: '',
      carbs: '',
      fat: ''
    },
    
    // Product Attributes
    isOrganic: false,
    isVegetarian: true,
    expiryDate: '',
    
    // Tags
    tags: [''],
    
    // Status
    isActive: true
  })
  
  const [errors, setErrors] = useState({})
  
  // Categories based on Product model enum
  const categories = [
    'fruits',
    'vegetables', 
    'dairy',
    'meat',
    'bakery',
    'beverages',
    'snacks',
    'frozen',
    'pantry',
    'personal-care',
    'household',
    'other'
  ]
  
  // Units based on Product model enum
  const units = ['kg', 'g', 'lb', 'oz', 'piece', 'liter', 'ml', 'pack', 'dozen']
  
  // Validate form
  const validateForm = () => {
    const newErrors = {}
    
    // Required fields
    if (!formData.name.trim()) newErrors.name = 'Product name is required'
    if (!formData.description.trim()) newErrors.description = 'Description is required'
    if (!formData.price || formData.price <= 0) newErrors.price = 'Valid price is required'
    if (!formData.stock || formData.stock < 0) newErrors.stock = 'Valid stock quantity is required'
    if (!formData.category) newErrors.category = 'Category is required'
    if (!formData.unit) newErrors.unit = 'Unit is required'
    
    // Validate rating average
    if (formData.ratings.average < 0 || formData.ratings.average > 5) {
      newErrors.ratingAverage = 'Rating must be between 0 and 5'
    }
    
    // Validate rating count
    if (formData.ratings.count < 0) {
      newErrors.ratingCount = 'Rating count cannot be negative'
    }
    
    // Validate images
    formData.images.forEach((image, index) => {
      if (image.url && !isValidUrl(image.url)) {
        newErrors[`imageUrl${index}`] = 'Please enter a valid URL'
      }
    })
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }
  
  const isValidUrl = (url) => {
    try {
      new URL(url)
      return true
    } catch {
      return false
    }
  }
  
  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      toast.error('Please fix the errors in the form')
      return
    }
    
    try {
      // Prepare data for API
      const productData = {
        ...formData,
        price: parseFloat(formData.price),
        discountedPrice: formData.discountedPrice ? parseFloat(formData.discountedPrice) : undefined,
        stock: parseInt(formData.stock),
        ratings: {
          average: parseFloat(formData.ratings.average),
          count: parseInt(formData.ratings.count) || 0
        },
        nutritionalInfo: {
          calories: formData.nutritionalInfo.calories ? parseFloat(formData.nutritionalInfo.calories) : undefined,
          protein: formData.nutritionalInfo.protein ? parseFloat(formData.nutritionalInfo.protein) : undefined,
          carbs: formData.nutritionalInfo.carbs ? parseFloat(formData.nutritionalInfo.carbs) : undefined,
          fat: formData.nutritionalInfo.fat ? parseFloat(formData.nutritionalInfo.fat) : undefined
        },
        features: formData.features.filter(f => f.trim()),
        tags: formData.tags.filter(t => t.trim()),
        images: formData.images.filter(img => img.url.trim()),
        expiryDate: formData.expiryDate || undefined
      }
      console.log(
        'Submitting Product:', productData
      )
      await createProduct(productData).unwrap()``
      toast.success('Product created successfully!')
      navigate('/admin/products')
      
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to create product')
    }
  }
  
  // Image handlers
  const handleImageChange = (index, field, value) => {
    const newImages = [...formData.images]
    newImages[index] = { ...newImages[index], [field]: value }
    setFormData({ ...formData, images: newImages })
  }
  
  const addImageField = () => {
    setFormData({
      ...formData,
      images: [...formData.images, { url: '', altText: '' }]
    })
  }
  
  const removeImageField = (index) => {
    if (formData.images.length > 1) {
      const newImages = formData.images.filter((_, i) => i !== index)
      setFormData({ ...formData, images: newImages })
    }
  }
  
  // Feature handlers
  const addFeature = () => {
    setFormData({
      ...formData,
      features: [...formData.features, '']
    })
  }
  
  const removeFeature = (index) => {
    if (formData.features.length > 1) {
      const newFeatures = formData.features.filter((_, i) => i !== index)
      setFormData({ ...formData, features: newFeatures })
    }
  }
  
  const handleFeatureChange = (index, value) => {
    const newFeatures = [...formData.features]
    newFeatures[index] = value
    setFormData({ ...formData, features: newFeatures })
  }
  
  // Tag handlers
  const addTag = () => {
    setFormData({
      ...formData,
      tags: [...formData.tags, '']
    })
  }
  
  const removeTag = (index) => {
    if (formData.tags.length > 1) {
      const newTags = formData.tags.filter((_, i) => i !== index)
      setFormData({ ...formData, tags: newTags })
    }
  }
  
  const handleTagChange = (index, value) => {
    const newTags = [...formData.tags]
    newTags[index] = value
    setFormData({ ...formData, tags: newTags })
  }
  
  // Rating handlers
  const handleStarClick = (rating) => {
    setFormData({
      ...formData,
      ratings: { ...formData.ratings, average: rating }
    })
  }
  
  const handleRatingAverageChange = (value) => {
    const rating = Math.max(0, Math.min(5, parseFloat(value) || 0))
    setFormData({
      ...formData,
      ratings: { ...formData.ratings, average: rating }
    })
  }
  
  const handleRatingCountChange = (value) => {
    const count = Math.max(0, parseInt(value) || 0)
    setFormData({
      ...formData,
      ratings: { ...formData.ratings, count }
    })
  }
  
  if (isLoading) return <Loader />
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Add New Product</h1>
            <p className="text-gray-600 mt-2">Add a new product to your grocery store</p>
          </div>
          <button
            onClick={() => navigate('/admin/products')}
            className="btn btn-outline"
          >
            <i className="ri-arrow-left-line mr-2"></i>
            Back to Products
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Basic Info */}
        <div className="lg:col-span-2">
          <div className="card">
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-6">Product Information</h2>
              
              <form onSubmit={handleSubmit}>
                {/* Product Name */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Product Name *
                  </label>
                  <input
                    type="text"
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                      errors.name ? 'border-red-500' : 'border-gray-300'
                    }`}
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Enter product name"
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                  )}
                </div>
                
                {/* Description */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description *
                  </label>
                  <textarea
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 h-32 ${
                      errors.description ? 'border-red-500' : 'border-gray-300'
                    }`}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Enter product description"
                  />
                  {errors.description && (
                    <p className="mt-1 text-sm text-red-600">{errors.description}</p>
                  )}
                </div>
                
                {/* Price and Stock */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Price ($) *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                        errors.price ? 'border-red-500' : 'border-gray-300'
                      }`}
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      placeholder="0.00"
                    />
                    {errors.price && (
                      <p className="mt-1 text-sm text-red-600">{errors.price}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Discounted Price ($)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      value={formData.discountedPrice}
                      onChange={(e) => setFormData({ ...formData, discountedPrice: e.target.value })}
                      placeholder="0.00"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Stock Quantity *
                    </label>
                    <input
                      type="number"
                      min="0"
                      className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                        errors.stock ? 'border-red-500' : 'border-gray-300'
                      }`}
                      value={formData.stock}
                      onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                      placeholder="0"
                    />
                    {errors.stock && (
                      <p className="mt-1 text-sm text-red-600">{errors.stock}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Unit *
                    </label>
                    <select
                      className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                        errors.unit ? 'border-red-500' : 'border-gray-300'
                      }`}
                      value={formData.unit}
                      onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    >
                      {units.map(unit => (
                        <option key={unit} value={unit}>{unit}</option>
                      ))}
                    </select>
                    {errors.unit && (
                      <p className="mt-1 text-sm text-red-600">{errors.unit}</p>
                    )}
                  </div>
                </div>
                
                {/* Category and Brand */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Category *
                    </label>
                    <select
                      className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                        errors.category ? 'border-red-500' : 'border-gray-300'
                      }`}
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    >
                      {categories.map(cat => (
                        <option key={cat} value={cat}>
                          {cat.charAt(0).toUpperCase() + cat.slice(1)}
                        </option>
                      ))}
                    </select>
                    {errors.category && (
                      <p className="mt-1 text-sm text-red-600">{errors.category}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Sub Category
                    </label>
                    <input
                      type="text"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      value={formData.subCategory}
                      onChange={(e) => setFormData({ ...formData, subCategory: e.target.value })}
                      placeholder="e.g., apples, tropical, etc."
                    />
                  </div>
                </div>
                
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Brand
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    value={formData.brand}
                    onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                    placeholder="Enter brand name"
                  />
                </div>
                
                {/* Rating Section - Added here */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-4">Initial Rating</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Average Rating */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Average Rating *
                      </label>
                      <div className="flex items-center space-x-4">
                        <div className="flex">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              type="button"
                              onClick={() => handleStarClick(star)}
                              className="text-2xl mx-1 focus:outline-none transition-transform hover:scale-110"
                            >
                              {star <= formData.ratings.average ? (
                                <i className="ri-star-fill text-yellow-500"></i>
                              ) : (
                                <i className="ri-star-line text-gray-300"></i>
                              )}
                            </button>
                          ))}
                        </div>
                        <div className="flex items-center">
                          <input
                            type="number"
                            min="0"
                            max="5"
                            step="0.1"
                            className={`w-20 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                              errors.ratingAverage ? 'border-red-500' : 'border-gray-300'
                            }`}
                            value={formData.ratings.average}
                            onChange={(e) => handleRatingAverageChange(e.target.value)}
                          />
                          <span className="ml-2 text-gray-600">/ 5</span>
                        </div>
                      </div>
                      {errors.ratingAverage && (
                        <p className="mt-1 text-sm text-red-600">{errors.ratingAverage}</p>
                      )}
                    </div>
                    
                    {/* Rating Count */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Rating Count
                      </label>
                      <input
                        type="number"
                        min="0"
                        className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                          errors.ratingCount ? 'border-red-500' : 'border-gray-300'
                        }`}
                        value={formData.ratings.count}
                        onChange={(e) => handleRatingCountChange(e.target.value)}
                        placeholder="Number of ratings"
                      />
                      {errors.ratingCount && (
                        <p className="mt-1 text-sm text-red-600">{errors.ratingCount}</p>
                      )}
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Set initial rating for new products. Usually starts at 0 with 0 reviews.
                  </p>
                </div>
                
                {/* Features */}
                <div className="mb-6">
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Features
                    </label>
                    <button
                      type="button"
                      onClick={addFeature}
                      className="text-sm text-primary-600 hover:text-primary-700"
                    >
                      <i className="ri-add-line mr-1"></i>
                      Add Feature
                    </button>
                  </div>
                  <div className="space-y-2">
                    {formData.features.map((feature, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <input
                          type="text"
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                          value={feature}
                          onChange={(e) => handleFeatureChange(index, e.target.value)}
                          placeholder="e.g., Organic, Gluten-free, etc."
                        />
                        {formData.features.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeFeature(index)}
                            className="text-red-600 hover:text-red-700 p-2"
                          >
                            <i className="ri-close-line"></i>
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Submit Button */}
                <div className="pt-6 border-t">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="btn btn-primary px-8 py-3"
                  >
                    {isLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Creating...
                      </>
                    ) : (
                      <>
                        <i className="ri-add-line mr-2"></i>
                        Create Product
                      </>
                    )}
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => navigate('/admin/products')}
                    className="btn btn-outline ml-4"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
        
        {/* Right Column - Additional Info */}
        <div className="space-y-6">
          {/* Images */}
          <div className="card">
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4">Product Images</h3>
              <div className="space-y-4">
                {formData.images.map((image, index) => (
                  <div key={index} className="space-y-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Image URL {index + 1}
                      </label>
                      <input
                        type="url"
                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                          errors[`imageUrl${index}`] ? 'border-red-500' : 'border-gray-300'
                        }`}
                        value={image.url}
                        onChange={(e) => handleImageChange(index, 'url', e.target.value)}
                        placeholder="https://example.com/image.jpg"
                      />
                      {errors[`imageUrl${index}`] && (
                        <p className="mt-1 text-sm text-red-600">{errors[`imageUrl${index}`]}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Alt Text
                      </label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                        value={image.altText}
                        onChange={(e) => handleImageChange(index, 'altText', e.target.value)}
                        placeholder="Description of image"
                      />
                    </div>
                    {formData.images.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeImageField(index)}
                        className="text-sm text-red-600 hover:text-red-700"
                      >
                        <i className="ri-delete-bin-line mr-1"></i>
                        Remove Image
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addImageField}
                  className="btn btn-outline w-full"
                >
                  <i className="ri-add-line mr-2"></i>
                  Add Another Image
                </button>
              </div>
            </div>
          </div>
          
          {/* Nutritional Information */}
          <div className="card">
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4">Nutritional Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Calories (kcal)
                  </label>
                  <input
                    type="number"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    value={formData.nutritionalInfo.calories}
                    onChange={(e) => setFormData({
                      ...formData,
                      nutritionalInfo: { ...formData.nutritionalInfo, calories: e.target.value }
                    })}
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Protein (g)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    value={formData.nutritionalInfo.protein}
                    onChange={(e) => setFormData({
                      ...formData,
                      nutritionalInfo: { ...formData.nutritionalInfo, protein: e.target.value }
                    })}
                    placeholder="0.0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Carbs (g)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    value={formData.nutritionalInfo.carbs}
                    onChange={(e) => setFormData({
                      ...formData,
                      nutritionalInfo: { ...formData.nutritionalInfo, carbs: e.target.value }
                    })}
                    placeholder="0.0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fat (g)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    value={formData.nutritionalInfo.fat}
                    onChange={(e) => setFormData({
                      ...formData,
                      nutritionalInfo: { ...formData.nutritionalInfo, fat: e.target.value }
                    })}
                    placeholder="0.0"
                  />
                </div>
              </div>
            </div>
          </div>
          
          {/* Product Attributes */}
          <div className="card">
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4">Product Attributes</h3>
              <div className="space-y-3">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    className="h-4 w-4 text-primary-600 rounded"
                    checked={formData.isOrganic}
                    onChange={(e) => setFormData({ ...formData, isOrganic: e.target.checked })}
                  />
                  <span className="ml-2">Organic Product</span>
                </label>
                
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    className="h-4 w-4 text-primary-600 rounded"
                    checked={formData.isVegetarian}
                    onChange={(e) => setFormData({ ...formData, isVegetarian: e.target.checked })}
                  />
                  <span className="ml-2">Vegetarian</span>
                </label>
                
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    className="h-4 w-4 text-primary-600 rounded"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  />
                  <span className="ml-2">Active (Visible in store)</span>
                </label>
              </div>
              
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Expiry Date
                </label>
                <input
                  type="date"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  value={formData.expiryDate}
                  onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                />
              </div>
            </div>
          </div>
          
          {/* Tags */}
          <div className="card">
            <div className="p-6">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-lg font-semibold">Tags</h3>
                <button
                  type="button"
                  onClick={addTag}
                  className="text-sm text-primary-600 hover:text-primary-700"
                >
                  <i className="ri-add-line mr-1"></i>
                  Add Tag
                </button>
              </div>
              <div className="space-y-2">
                {formData.tags.map((tag, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <input
                      type="text"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      value={tag}
                      onChange={(e) => handleTagChange(index, e.target.value)}
                      placeholder="e.g., fresh, healthy, etc."
                    />
                    {formData.tags.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeTag(index)}
                        className="text-red-600 hover:text-red-700 p-2"
                      >
                        <i className="ri-close-line"></i>
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProductForm