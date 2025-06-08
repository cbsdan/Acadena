import { createSlice } from "@reduxjs/toolkit";
import { fetchAllInstitutions } from "../actions/institutionsAction";

const initialState = {
  institutions: [],
  loading: false,
  error: null,
};

const institutionsSlice = createSlice({
  name: "institutions",
  initialState,
  reducers: {
    setInstitutions: (state, action) => {
      state.institutions = action.payload;
      state.loading = false;
      state.error = null;
    },
    clearInstitutions: (state) => {
      state.institutions = [];
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllInstitutions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllInstitutions.fulfilled, (state, action) => {
        state.institutions = action.payload;
        state.loading = false;
      })
      .addCase(fetchAllInstitutions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      });
  },
});

export const { setInstitutions, clearInstitutions } = institutionsSlice.actions;
export default institutionsSlice.reducer;
