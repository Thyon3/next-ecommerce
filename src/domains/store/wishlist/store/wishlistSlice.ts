import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { TWishlistState } from "../types";

const initialState: TWishlistState = {
  items: [],
};

const wishlistSlice = createSlice({
  name: "wishlist",
  initialState,
  reducers: {
    addToWishlist: (state, action: PayloadAction<string>) => {
      const exists = state.items.find((item) => item.productId === action.payload);
      if (!exists) {
        state.items.push({
          productId: action.payload,
          addedAt: Date.now(),
        });
      }
    },
    removeFromWishlist: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter((item) => item.productId !== action.payload);
    },
    clearWishlist: (state) => {
      state.items = [];
    },
  },
});

export const { addToWishlist, removeFromWishlist, clearWishlist } = wishlistSlice.actions;
export default wishlistSlice.reducer;
