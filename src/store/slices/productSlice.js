import { createSlice } from '@reduxjs/toolkit'

const productSlice = createSlice({
  name: 'products',
  initialState: {
    products: [],
    product: null,
    loading: false,
    error: null,
    page: 1,
    pages: 1,
    total: 0,
  },
  reducers: {
    productListRequest: (state) => {
      state.loading = true
      state.error = null
    },
    
    productListSuccess: (state, action) => {
      state.loading = false
      state.products = action.payload.products
      state.page = action.payload.page
      state.pages = action.payload.pages
      state.total = action.payload.total
    },
    
    productListFail: (state, action) => {
      state.loading = false
      state.error = action.payload
    },
    
    productDetailsRequest: (state) => {
      state.loading = true
      state.error = null
    },
    
    productDetailsSuccess: (state, action) => {
      state.loading = false
      state.product = action.payload
    },
    
    productDetailsFail: (state, action) => {
      state.loading = false
      state.error = action.payload
    },
    
    productCreateRequest: (state) => {
      state.loading = true
      state.error = null
    },
    
    productCreateSuccess: (state, action) => {
      state.loading = false
      state.products.push(action.payload)
    },
    
    productCreateFail: (state, action) => {
      state.loading = false
      state.error = action.payload
    },
    
    clearProductDetails: (state) => {
      state.product = null
      state.error = null
    },
  },
})

export const {
  productListRequest,
  productListSuccess,
  productListFail,
  productDetailsRequest,
  productDetailsSuccess,
  productDetailsFail,
  productCreateRequest,
  productCreateSuccess,
  productCreateFail,
  clearProductDetails,
} = productSlice.actions

export default productSlice.reducer