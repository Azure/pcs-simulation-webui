// Copyright (c) Microsoft. All rights reserved.

import { combineEpics } from 'redux-observable';

// Epics
import { detectRouteChange } from "./routeEpics";
import { loadDeviceModelsEpic } from "./simulationEpics";

const rootEpic = combineEpics(
  detectRouteChange,
  loadDeviceModelsEpic
);

export default rootEpic;
