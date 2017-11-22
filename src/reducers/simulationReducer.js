import initialState from './initialState';

const LOAD_DEVICE_MODELS_SUCCESS = 'LOAD_DEVICE_MODELS_SUCCESS';

export const simulation = (state = initialState.deviceModels, action) => {
  switch (action.type) {
    case LOAD_DEVICE_MODELS_SUCCESS:
      return {
        ...state,
        deviceModels: action.payload
      };

    default:
      return state;
  }
};
