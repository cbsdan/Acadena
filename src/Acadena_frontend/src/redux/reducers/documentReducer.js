import { createSlice } from "@reduxjs/toolkit";
import { fetchDocuments, fetchAllDocuUsingAccessToken } from "../actions/documentAction";

const initialState = {
    documents: [],
    loading: false,
    error: null,
};

const documentSlice = createSlice({
    name: "documents",
    initialState,
    reducers: {
        clearDocuments: (state) => {
            state.documents = [];
            state.loading = false;
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchDocuments.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchDocuments.fulfilled, (state, action) => {
                state.documents = action.payload;
                state.loading = false;
            })
            .addCase(fetchDocuments.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message;
            })
            .addCase(fetchAllDocuUsingAccessToken.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchAllDocuUsingAccessToken.fulfilled, (state, action) => {
                state.documents = action.payload;
                state.loading = false;
            })  
            .addCase(fetchAllDocuUsingAccessToken.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message;
            });

    },
});



export const { clearDocuments } = documentSlice.actions;
export default documentSlice.reducer;