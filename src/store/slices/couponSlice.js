import { createSlice } from '@reduxjs/toolkit'

const couponSlice = createSlice({
  name: 'coupon',
  initialState: {
    appliedCoupon: null,
    discount: 0,
  },
  reducers: {
    applyCoupon: (state, action) => {
      const { code, discount, discountType } = action.payload
      state.appliedCoupon = { code, discount, discountType }
      state.discount = discount
    },
    removeCoupon: (state) => {
      state.appliedCoupon = null
      state.discount = 0
    },
  },
})

export const { applyCoupon, removeCoupon } = couponSlice.actions
export default couponSlice.reducer