import { createAsyncThunk } from "@reduxjs/toolkit";
import { createActor } from "../../../../declarations/Acadena_backend";
import { AuthClient } from "@dfinity/auth-client";

// Fetch all institutions
export const fetchAllInstitutions = createAsyncThunk(
  "institutions/fetchAllInstitutions",
  async (_, thunkAPI) => {
    try {
      const authClient = await AuthClient.create();
      const identity = authClient.getIdentity();
      const backendActor = createActor(process.env.CANISTER_ID_ACADENA_BACKEND, {
        agentOptions: { identity }
      });
      const institutions = await backendActor.getAllInstitutions();
      return institutions;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.message || "Unknown error");
    }
  }
);
