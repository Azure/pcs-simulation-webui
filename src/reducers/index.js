import { combineReducers } from 'redux';
import { TIMER_TICK } from 'actions';

const initialState = {
  seconds: 0
};

function timer(state = initialState, action) {
  switch (action.type) {
    case TIMER_TICK:
      return { seconds: action.seconds };
    default:
      return state;
  }
}

const rootReducer = combineReducers({
  timer
});

export default rootReducer;
