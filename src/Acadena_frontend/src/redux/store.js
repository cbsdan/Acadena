import documentReducer from './reducers/documentReducer';
import studentReducer from './reducers/studentReducer';
import institutionsReducer from './reducers/institutionsReducer';
import transferReducer from './reducers/transferReducer';

import {configureStore} from '@reduxjs/toolkit';
const store = configureStore({
  reducer: {
    document: documentReducer,
    student: studentReducer,
    institutions: institutionsReducer,
    transfer: transferReducer,
  },
});

export default store;