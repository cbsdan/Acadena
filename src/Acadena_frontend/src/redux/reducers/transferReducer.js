import { createSlice } from "@reduxjs/toolkit";
import { fetchTransferRequests } from "../actions/transferAction";

const initialState = {
  requests: [],
  loading: false,
  error: null,
};

const transferSlice = createSlice({
  name: "transfer",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchTransferRequests.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTransferRequests.fulfilled, (state, action) => {
        state.requests = action.payload;
        state.loading = false;
      })
      .addCase(fetchTransferRequests.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  },
});

export default transferSlice.reducer;
