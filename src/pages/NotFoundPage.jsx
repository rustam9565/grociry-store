import { Link } from 'react-router-dom'

const NotFoundPage = () => {
  return (
    <div className="container-padding py-16 text-center">
      <div className="max-w-md mx-auto">
        <div className="text-9xl font-bold text-gray-200 mb-4">404</div>
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Page Not Found</h1>
        <p className="text-gray-600 mb-8">
          The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/" className="btn btn-primary">
            <i className="ri-home-line mr-2"></i>
            Go to Homepage
          </Link>
          <Link to="/products" className="btn btn-outline">
            <i className="ri-shopping-bag-line mr-2"></i>
            Browse Products
          </Link>
        </div>
      </div>
    </div>
  )
}

export default NotFoundPage