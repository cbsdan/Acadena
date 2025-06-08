import documentReducer from './reducers/documentReducer';
import studentReducer from './reducers/studentReducer';
import institutionsReducer from './reducers/institutionsReducer';

import {configureStore} from '@reduxjs/toolkit';
const store = configureStore({
  reducer: {
    document: documentReducer,
    student: studentReducer,
    institutions: institutionsReducer,
  },
});

export default store;