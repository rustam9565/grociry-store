import { createSlice } from '@reduxjs/toolkit'

const getStoredSession = () => {
  const storedUserInfo = localStorage.getItem('userInfo')

  if (!storedUserInfo) {
    return null
  }

  try {
    const parsedUserInfo = JSON.parse(storedUserInfo)
    const sanitizedSession = parsedUserInfo?.token
      ? {
          _id: parsedUserInfo._id,
          token: parsedUserInfo.token,
        }
      : null

    if (sanitizedSession) {
      localStorage.setItem('userInfo', JSON.stringify(sanitizedSession))
    } else {
      localStorage.removeItem('userInfo')
    }

    return sanitizedSession
  } catch {
    localStorage.removeItem('userInfo')
    return null
  }
}

const userInfoFromStorage = getStoredSession()

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    userInfo: userInfoFromStorage,
  },
  reducers: {
    setCredentials: (state, action) => {
      const sessionData = {
        _id: action.payload._id,
        token: action.payload.token,
      }

      state.userInfo = sessionData
      localStorage.setItem('userInfo', JSON.stringify(sessionData))
    },
    
    logout: (state) => {
      state.userInfo = null
      // Clear all user-related data from localStorage
      localStorage.removeItem('userInfo')
      localStorage.removeItem('cartItems')
      localStorage.removeItem('shippingAddress')
      localStorage.removeItem('paymentMethod')
    },
    
    updateUserInfo: (state, action) => {
      if (state.userInfo) {
        state.userInfo = {
          ...state.userInfo,
          _id: action.payload._id || state.userInfo._id,
          token: action.payload.token || state.userInfo.token,
        }
        localStorage.setItem('userInfo', JSON.stringify(state.userInfo))
      }
    },
  },
})

export const { setCredentials, logout, updateUserInfo } = authSlice.actions

export default authSlice.reducer
