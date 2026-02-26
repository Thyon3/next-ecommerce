import { createSlice, PayloadAction } from "@reduxjs/toolkit";

type RecentProduct = {
  productId: string;
  viewedAt: number;
};

type RecentlyViewedState = {
  items: RecentProduct[];
  maxItems: number;
};

const initialState: RecentlyViewedState = {
  items: [],
  maxItems: 10,
};

const recentlyViewedSlice = createSlice({
  name: "recentlyViewed",
  initialState,
  reducers: {
    addRecentlyViewed: (state, action: PayloadAction<string>) => {
      const existingIndex = state.items.findIndex((item) => item.productId === action.payload);
      
      if (existingIndex !== -1) {
        state.items.splice(existingIndex, 1);
      }
      
      state.items.unshift({
        productId: action.payload,
        viewedAt: Date.now(),
      });
      
      if (state.items.length > state.maxItems) {
        state.items = state.items.slice(0, state.maxItems);
      }
    },
    clearRecentlyViewed: (state) => {
      state.items = [];
    },
  },
});

export const { addRecentlyViewed, clearRecentlyViewed } = recentlyViewedSlice.actions;
export default recentlyViewedSlice.reducer;
