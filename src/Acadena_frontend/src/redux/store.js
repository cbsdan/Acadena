import documentReducer from './reducers/documentReducer';
import studentReducer from './reducers/studentReducer';
import institutionsReducer from './reducers/institutionsReducer';
import transferReducer from './reducers/transferReducer';
import chatReducer from './reducers/chatReducer';

import {configureStore} from '@reduxjs/toolkit';
const store = configureStore({
  reducer: {
    document: documentReducer,
    student: studentReducer,
    institutions: institutionsReducer,
    transfer: transferReducer,
    chat: chatReducer,
  },
});

export default store;