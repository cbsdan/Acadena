import { createSlice } from "@reduxjs/toolkit";
import { fetchStudentByUserId } from "../actions/studentAction";

const initialState = {
  student: null,
  loading: false,
  error: null,
};

const studentSlice = createSlice({
  name: "student",
  initialState,
  reducers: {
    clearStudent: (state) => {
      state.student = null;
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchStudentByUserId.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchStudentByUserId.fulfilled, (state, action) => {
        state.student = action.payload;
        state.loading = false;
      })
      .addCase(fetchStudentByUserId.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      });
  },
});

export const { clearStudent } = studentSlice.actions;
export default studentSlice.reducer;