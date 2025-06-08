import { createSlice } from "@reduxjs/toolkit";
import { fetchTransferRequests } from "../actions/transferAction";
import { acceptTransferRequest } from '../actions/acceptTransferRequest';

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
      })
      .addCase(acceptTransferRequest.fulfilled, (state, action) => {
        // Mark the accepted transfer as accepted in the state
        const idx = state.requests.findIndex(r => r.id === action.payload.transferId);
        if (idx !== -1) {
          state.requests[idx].status = 'accepted';
        }
      });
  },
});

export default transferSlice.reducer;
