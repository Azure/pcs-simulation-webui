// Copyright (c) Microsoft. All rights reserved.

import { combineEpics } from 'redux-observable';

// Epics
import {
  initializeApp,
  detectRouteChange,
  loadDeviceModels
} from "./appEpics";
import {
  loadSimulationStatus,
  loadSimulation,
  toggleSimulation,
  updateSimulation
} from "./simulationEpics";

const rootEpic = combineEpics(
  detectRouteChange,
  initializeApp,
  // Simulation epics
  loadSimulationStatus,
  loadSimulation,
  loadDeviceModels,
  toggleSimulation,
  updateSimulation
);

export default rootEpic;
