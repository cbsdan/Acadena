import documentReducer from './reducers/documentReducer';
import studentReducer from './reducers/studentReducer';

import {configureStore} from '@reduxjs/toolkit';
const store = configureStore({
  reducer: {
    document: documentReducer,
    student: studentReducer,
  },
});

export default store;