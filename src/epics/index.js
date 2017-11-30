// Copyright (c) Microsoft. All rights reserved.

import { combineEpics } from 'redux-observable';

// Epics
import { epics as appEpics } from 'reducers/appReducer';
import {
  loadSimulationStatus,
  loadSimulation,
  toggleSimulation,
  updateSimulation
} from "./simulationEpics";

const rootEpic = combineEpics(
  appEpics.detectRouteChange.epic,
  appEpics.initializeApp.epic,
  // Simulation epics
  loadSimulationStatus,
  loadSimulation,
  appEpics.loadDeviceModels.epic,
  toggleSimulation,
  updateSimulation
);

export default rootEpic;
