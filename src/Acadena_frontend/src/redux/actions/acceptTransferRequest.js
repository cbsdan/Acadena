import { createAsyncThunk } from '@reduxjs/toolkit';
import { createActor } from '../../../../declarations/Acadena_backend';
import { AuthClient } from '@dfinity/auth-client';

export const acceptTransferRequest = createAsyncThunk(
  'transfer/acceptTransferRequest',
  async (transferId, thunkAPI) => {
    try {
      const authClient = await AuthClient.create();
      const identity = authClient.getIdentity();
      const backendActor = createActor(process.env.CANISTER_ID_ACADENA_BACKEND, {
        agentOptions: { identity },
      });
      const result = await backendActor.acceptTransferRequest(transferId);
      if (result && result.ok) {
        return { transferId, message: result.ok };
      } else {
        return thunkAPI.rejectWithValue(result.err || 'Accept failed');
      }
    } catch (error) {
      return thunkAPI.rejectWithValue(error.message || 'Unknown error');
    }
  }
);
