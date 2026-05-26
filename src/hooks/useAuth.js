import { useSelector } from 'react-redux'
import { useGetUserProfileQuery } from '../store/api/authApi'

export const useAuth = () => {
  const { userInfo } = useSelector((state) => state.auth)
  const token = userInfo?.token
  const { data: profile, isLoading: isProfileLoading, isFetching: isProfileFetching } = useGetUserProfileQuery(undefined, {
    skip: !token,
    refetchOnMountOrArgChange: true,
    refetchOnFocus: true,
  })
  const user = profile
    ? { ...userInfo, ...profile }
    : userInfo
  
  return {
    // Check if user is authenticated
    isAuthenticated: !!token,
    
    // User information
    user,
    isProfileLoading,
    isProfileFetching,
    
    // Check if user is admin
    isAdmin: user?.role === 'admin',
    
    // User ID
    userId: user?._id,
    
    // User name
    userName: user?.name,
    
    // User email
    userEmail: user?.email,
    
    // User token
    token,
    
    // Check if user has specific role
    hasRole: (role) => user?.role === role,
    
    // Check if user has any of the given roles
    hasAnyRole: (roles) => roles.includes(user?.role),
  }
}
