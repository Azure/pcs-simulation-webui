import { combineReducers } from 'redux';

// Reducers
import timer from './timer';

const rootReducer = combineReducers({
  timer
});

export default rootReducer;
