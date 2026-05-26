import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useLoginMutation } from '../store/api/authApi'
import { useAuth } from '../hooks/useAuth'
import { setCredentials } from '../store/slices/authSlice'
import { useDispatch } from 'react-redux'
import Message from '../components/Message'
import { SmallLoader } from '../components/Loader'

const LoginPage = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  
  const navigate = useNavigate()
  const location = useLocation()
  const dispatch = useDispatch()
  const { isAuthenticated } = useAuth()
  
  const [login, { isLoading }] = useLoginMutation()
  
  const redirect = location.search ? location.search.split('=')[1] : '/'
  
  useEffect(() => {
    if (isAuthenticated) {
      navigate(redirect)
    }
  }, [isAuthenticated, navigate, redirect])
  
  const submitHandler = async (e) => {
    e.preventDefault()
    
    try {
      const result = await login({ email, password }).unwrap()
      dispatch(setCredentials(result))
      navigate(redirect)
    } catch (err) {
      setError(err?.data?.message || 'Invalid email or password')
    }
  }
  
  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12">
      <div className="card max-w-md w-full p-8">
        <div className="text-center mb-8">
          <i className="ri-shopping-basket-2-fill text-4xl text-primary-600 mb-4"></i>
          <h1 className="text-3xl font-bold text-gray-900">Sign In</h1>
          <p className="text-gray-600 mt-2">Welcome back to GroceryStore</p>
        </div>
        
        {error && <Message type="error">{error}</Message>}
        
        <form onSubmit={submitHandler} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              className="input"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          
          <div>
            <div className="flex justify-between items-center mb-1">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <Link to="/forgot-password" className="text-sm text-primary-600 hover:text-primary-500">
                Forgot password?
              </Link>
            </div>
            <input
              type="password"
              id="password"
              className="input"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          
          <button
            type="submit"
            disabled={isLoading}
            className="btn btn-primary w-full py-3"
          >
            {isLoading ? <SmallLoader /> : 'Sign In'}
          </button>
        </form>
        
        <div className="mt-6 text-center">
          <p className="text-gray-600">
            Don't have an account?{' '}
            <Link 
              to={redirect !== '/' ? `/register?redirect=${redirect}` : '/register'}
              className="text-primary-600 hover:text-primary-500 font-medium"
            >
              Register
            </Link>
          </p>
        </div>
        
        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-center text-sm text-gray-500">
            By signing in, you agree to our{' '}
            <Link to="/terms" className="text-primary-600 hover:text-primary-500">Terms of Service</Link>
            {' '}and{' '}
            <Link to="/privacy" className="text-primary-600 hover:text-primary-500">Privacy Policy</Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default LoginPage