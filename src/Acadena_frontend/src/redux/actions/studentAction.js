// actions/studentActions.js

import { createAsyncThunk } from "@reduxjs/toolkit";
import { createActor } from "../../../../declarations/Acadena_backend";
import { AuthClient } from "@dfinity/auth-client";

// Fetch student info by userId
export const fetchStudentByUserId = createAsyncThunk(
  "student/fetchStudentByUserId",
  async (userId, thunkAPI) => {
    try {
      const authClient = await AuthClient.create();
      const identity = authClient.getIdentity();
      const backendActor = createActor(process.env.CANISTER_ID_ACADENA_BACKEND, {
        agentOptions: { identity }
      });
      const student = await backendActor.getStudentByUserId(userId);
      if (student) {
        return student;
      } else {
        return thunkAPI.rejectWithValue("Student not found");
      }
    } catch (error) {
      return thunkAPI.rejectWithValue(error.message || "Unknown error");
    }
  }
);