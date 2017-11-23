// Copyright (c) Microsoft. All rights reserved.

import { combineReducers } from 'redux';
import moment from 'moment'

// Reducers
import { appReducer } from './appReducer';
import { simulationReducer } from './simulationReducer';

const rootReducer = combineReducers({
  app: appReducer,
  simulation: simulationReducer
});

export default rootReducer;

// Selectors
export const getSimulation = state => state.simulation;
export const getDeviceModels = state => (state.app || {}).deviceModels;
export const getDuration = state => {
  const { startTime, endTime } = state.simulation;
  if (!startTime || !endTime) return 'Run indefinitely';
  return moment.duration(moment(endTime).diff(moment(startTime))).humanize();
};
