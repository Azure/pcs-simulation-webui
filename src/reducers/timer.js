import { TIMER_TICK } from 'actions';

const initialState = {
  seconds: 0
};

const timer = (state = initialState, action) => {
  switch (action.type) {
    case TIMER_TICK:
      return { seconds: action.seconds };
    default:
      return state;
  }
};

export default timer;
