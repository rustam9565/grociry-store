import { createSlice } from '@reduxjs/toolkit'

const wishlistItemsFromStorage = localStorage.getItem('wishlistItems')
  ? JSON.parse(localStorage.getItem('wishlistItems'))
  : []

const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState: {
    items: wishlistItemsFromStorage,
  },
  reducers: {
    addToWishlist: (state, action) => {
      const item = action.payload
      const existItem = state.items.find((x) => x.product === item.product)

      if (!existItem) {
        state.items.push(item)
        localStorage.setItem('wishlistItems', JSON.stringify(state.items))
      }
    },
    
    removeFromWishlist: (state, action) => {
      state.items = state.items.filter(
        (x) => x.product !== action.payload
      )
      localStorage.setItem('wishlistItems', JSON.stringify(state.items))
    },
    
    clearWishlist: (state) => {
      state.items = []
      localStorage.removeItem('wishlistItems')
    },
    
    // Initialize wishlist from API response
    setWishlist: (state, action) => {
      state.items = action.payload || []
      localStorage.setItem('wishlistItems', JSON.stringify(state.items))
    },
  },
})

export const {
  addToWishlist,
  removeFromWishlist,
  clearWishlist,
  setWishlist,
} = wishlistSlice.actions

export default wishlistSlice.reducer