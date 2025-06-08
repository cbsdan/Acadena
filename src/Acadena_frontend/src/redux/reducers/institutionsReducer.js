import { createSlice } from "@reduxjs/toolkit";

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
});

export const { setInstitutions, clearInstitutions } = institutionsSlice.actions;
export default institutionsSlice.reducer;
