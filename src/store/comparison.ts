import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { TCartListItemDB } from "@/shared/types/product";

interface ComparisonState {
    items: TCartListItemDB[];
}

const initialState: ComparisonState = {
    items: [],
};

const comparisonSlice = createSlice({
    name: "comparison",
    initialState,
    reducers: {
        addToComparison: (state, action: PayloadAction<TCartListItemDB>) => {
            if (state.items.length < 4 && !state.items.find((item) => item.id === action.payload.id)) {
                state.items.push(action.payload);
            }
        },
        removeFromComparison: (state, action: PayloadAction<string>) => {
            state.items = state.items.filter((item) => item.id !== action.payload);
        },
        clearComparison: (state) => {
            state.items = [];
        },
    },
});

export const { addToComparison, removeFromComparison, clearComparison } = comparisonSlice.actions;
export default comparisonSlice.reducer;
