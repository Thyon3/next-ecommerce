import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { TComparisonState } from "../types";

const initialState: TComparisonState = {
  items: [],
  maxItems: 4,
};

const comparisonSlice = createSlice({
  name: "comparison",
  initialState,
  reducers: {
    addToComparison: (state, action: PayloadAction<string>) => {
      const exists = state.items.find((item) => item.productId === action.payload);
      if (!exists && state.items.length < state.maxItems) {
        state.items.push({
          productId: action.payload,
          addedAt: Date.now(),
        });
      }
    },
    removeFromComparison: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter((item) => item.productId !== action.payload);
    },
    clearComparison: (state) => {
      state.items = [];
    },
  },
});

export const { addToComparison, removeFromComparison, clearComparison } = comparisonSlice.actions;
export default comparisonSlice.reducer;
