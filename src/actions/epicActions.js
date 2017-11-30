// Copyright (c) Microsoft. All rights reserved.

import { createAction } from 'utilities';

// Epic actions trigger redux-observable epics

// Action names - START
// App Epics
export const EPIC_APP_ROUTE_CHANGE = 'EPIC_APP_ROUTE_CHANGE';
// Simulation Epics
export const EPIC_APP_SIMULATION_STATUS_LOAD = 'EPIC_APP_SIMULATION_STATUS_LOAD';
export const EPIC_SIMULATION_LOAD = 'EPIC_SIMULATION_LOAD';
export const EPIC_SIMULATION_TOGGLE = 'EPIC_SIMULATION_TOGGLE';
export const EPIC_SIMULATION_UPDATE = 'EPIC_SIMULATION_UPDATE';
// Action names - END

// Actions creators - START
// App actions creators
export const routeChangeEvent = createAction(EPIC_APP_ROUTE_CHANGE);
// Simulation actions creators
export const loadSimulationStatusEvent = createAction(EPIC_APP_SIMULATION_STATUS_LOAD);
export const loadSimulationEvent = createAction(EPIC_SIMULATION_LOAD);
export const toggleSimulationEvent = createAction(EPIC_SIMULATION_TOGGLE);
export const updateSimulationEvent = createAction(EPIC_SIMULATION_UPDATE);
// Actions creators - END
