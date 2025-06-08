import { createAsyncThunk } from "@reduxjs/toolkit";
import { createActor } from "../../../../declarations/Acadena_backend";
import { AuthClient } from "@dfinity/auth-client";


export const fetchDocuments = createAsyncThunk(
    "documents/fetchDocuments",
    async({type,studentNumber}, thunkAPI)=>
    {
        try {
            const authClient = await AuthClient.create();
            const identity = authClient.getIdentity();

            const backendActor = createActor(process.env.CANISTER_ID_ACADENA_BACKEND, {
                agentOptions: { identity }
            });

            const response = await backendActor.getDocumentsWithType(type, studentNumber); 
            console.log("Fetched documents:", response);
            return response;
        } catch (error) {
            console.error("Error fetching documents:", error.message);

            return thunkAPI.rejectWithValue(error.message);
        }
    
    }
);


export const createAccessTokens = createAsyncThunk(
    "documents/createAccessTokens",
    async ({ documentId, studentNumber }, thunkAPI) => {
        try {
            const authClient = await AuthClient.create();
            const identity = authClient.getIdentity();

            const backendActor = createActor(process.env.CANISTER_ID_ACADENA_BACKEND, {
                agentOptions: { identity }
            });

            const response = await backendActor.createAccessTokens(documentId, studentNumber);
            console.log("Created access tokens:", response);
            return response;
        } catch (error) {
            console.error("Error creating access tokens:", error.message);
            return thunkAPI.rejectWithValue(error.message);
        }
    }
);


export const fetchAllDocuUsingAccessToken = createAsyncThunk(
    "documents/fetchAllDocuUsingAccessToken",
    async ({ studentid }, thunkAPI) => {
        try {
            const authClient = await AuthClient.create();
            const identity = authClient.getIdentity();

            const backendActor = createActor(process.env.CANISTER_ID_ACADENA_BACKEND, {
                agentOptions: { identity }
            });

            const response = await backendActor.getDocumentsByStudentAccessTokens(studentid);
            console.log("Fetched documents using access token:", response);
            return response;
        } catch (error) {
            console.error("Error fetching documents using access token:", error.message);
            return thunkAPI.rejectWithValue(error.message);
        }
    }
);