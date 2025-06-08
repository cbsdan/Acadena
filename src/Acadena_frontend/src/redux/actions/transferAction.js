import { createAsyncThunk } from '@reduxjs/toolkit';
import { createActor } from '../../../../declarations/Acadena_backend';
import { AuthClient } from '@dfinity/auth-client';

export const TRANSFER_STUDENT_REQUEST = 'TRANSFER_STUDENT_REQUEST';
export const TRANSFER_STUDENT_SUCCESS = 'TRANSFER_STUDENT_SUCCESS';
export const TRANSFER_STUDENT_FAILURE = 'TRANSFER_STUDENT_FAILURE';

// Async thunk for transferring a student to another institution
export const transferStudentToInstitution = createAsyncThunk(
  'transfer/transferStudentToInstitution',
  async ({ studentId, toInstitutionId }, thunkAPI) => {
    try {
      const authClient = await AuthClient.create();
      const identity = authClient.getIdentity();
      const backendActor = createActor(process.env.CANISTER_ID_ACADENA_BACKEND, {
        agentOptions: { identity },
      });
      const result = await backendActor.transferStudentToInstitution(studentId, toInstitutionId);
      if (result && result.ok) {
        return result.ok;
      } else {
        return thunkAPI.rejectWithValue(result.err || 'Transfer failed');
      }
    } catch (error) {
      return thunkAPI.rejectWithValue(error.message || 'Unknown error');
    }
  }
);
