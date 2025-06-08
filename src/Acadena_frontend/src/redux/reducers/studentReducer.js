import { createSlice } from "@reduxjs/toolkit";
import { fetchStudentByUserId, fetchAllStudents } from "../actions/studentAction";

const initialState = {
  student: null,
  students: [], // Add students array for all students
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
    clearStudents: (state) => {
      state.students = [];
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
      })
      // Add support for fetchAllStudents
      .addCase(fetchAllStudents.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllStudents.fulfilled, (state, action) => {
        state.students = action.payload;
        state.loading = false;
      })
      .addCase(fetchAllStudents.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      });
  },
});

export const { clearStudent, clearStudents } = studentSlice.actions;
export default studentSlice.reducer;