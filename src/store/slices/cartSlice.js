import { createSlice } from "@reduxjs/toolkit";

// Get cart items from localStorage
const cartItemsFromStorage = localStorage.getItem("cartItems")
  ? JSON.parse(localStorage.getItem("cartItems"))
  : [];

// Get shipping address from localStorage
const shippingAddressFromStorage = localStorage.getItem("shippingAddress")
  ? JSON.parse(localStorage.getItem("shippingAddress"))
  : {};

// Get payment method from localStorage
const paymentMethodFromStorage = localStorage.getItem("paymentMethod")
  ? JSON.parse(localStorage.getItem("paymentMethod"))
  : "card";

const cartSlice = createSlice({
  name: "cart",
  initialState: {
    cartItems: cartItemsFromStorage,
    shippingAddress: shippingAddressFromStorage,
    paymentMethod: paymentMethodFromStorage,
  },
  reducers: {
    addToCart: (state, action) => {
      const item = action.payload;
      const existItem = state.cartItems.find((x) => x.product === item.product);

      if (existItem) {
        // Update quantity if item exists
        state.cartItems = state.cartItems.map((x) =>
          x.product === existItem.product
            ? { ...x, quantity: x.quantity + item.quantity }
            : x,
        );
      } else {
        // Add new item
        state.cartItems.push(item);
      }
      // Save to localStorage
      localStorage.setItem("cartItems", JSON.stringify(state.cartItems));
    },

    removeFromCart: (state, action) => {
      state.cartItems = state.cartItems.filter(
        (x) => x.product !== action.payload,
      );
      localStorage.setItem("cartItems", JSON.stringify(state.cartItems));
    },

    updateCartItem: (state, action) => {
      const { productId, quantity } = action.payload;
      const item = state.cartItems.find((x) => x.product === productId);

      if (item) {
        item.quantity = quantity;
        localStorage.setItem("cartItems", JSON.stringify(state.cartItems));
      }
    },

    saveShippingAddress: (state, action) => {
      state.shippingAddress = action.payload;
      localStorage.setItem("shippingAddress", JSON.stringify(action.payload));
    },

    savePaymentMethod: (state, action) => {
      state.paymentMethod = action.payload;
      localStorage.setItem("paymentMethod", JSON.stringify(action.payload));
    },

    clearCart: (state) => {
      state.cartItems = [];
      localStorage.removeItem("cartItems");
    },

    // Initialize cart from API response (for authenticated users)
    setCart: (state, action) => {
      state.cartItems = action.payload.items || [];
      state.shippingAddress = action.payload.shippingAddress || {};
      state.paymentMethod = action.payload.paymentMethod || "card";

      // Also update localStorage for consistency
      localStorage.setItem("cartItems", JSON.stringify(state.cartItems));
      if (action.payload.shippingAddress) {
        localStorage.setItem(
          "shippingAddress",
          JSON.stringify(action.payload.shippingAddress),
        );
      }
      if (action.payload.paymentMethod) {
        localStorage.setItem(
          "paymentMethod",
          JSON.stringify(action.payload.paymentMethod),
        );
      }
    },
  },
});

export const {
  addToCart,
  removeFromCart,
  updateCartItem,
  saveShippingAddress,
  savePaymentMethod,
  clearCart,
  setCart,
} = cartSlice.actions;

export default cartSlice.reducer;
