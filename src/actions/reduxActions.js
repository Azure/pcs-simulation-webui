// Copyright (c) Microsoft. All rights reserved.

import { createAction } from 'utilities';
import { toSimulationModel, toSimulationStatusModel } from 'services/models';

// Redux actions trigger updates to the redux store

// Action names - START
export const REDUX_DEVICE_MODELS_UPDATE = 'REDUX_DEVICE_MODELS_UPDATE';
export const REDUX_SIMULATION_STATUS_UPDATE = 'REDUX_SIMULATION_STATUS_UPDATE';
export const REDUX_SIMULATION_STATUS_CLEAR = 'REDUX_SIMULATION_STATUS_CLEAR';
export const REDUX_SIMULATION_UPDATE = 'REDUX_SIMULATION_UPDATE';
export const REDUX_SIMULATION_CLEAR = 'REDUX_SIMULATION_CLEAR';
export const REDUX_SIMULATION_ERROR = 'REDUX_SIMULATION_ERROR';
// Action names - End

// Action creators - START
export const updateReduxSimulationStatus = createAction(REDUX_SIMULATION_STATUS_UPDATE);
export const clearReduxSimulationStatus = createAction(REDUX_SIMULATION_STATUS_CLEAR, toSimulationStatusModel());
export const updateReduxSimulation = createAction(REDUX_SIMULATION_UPDATE);
export const clearReduxSimulation = createAction(REDUX_SIMULATION_CLEAR, toSimulationModel());
export const updateReduxSimulationError = createAction(REDUX_SIMULATION_ERROR);
export const updateReduxDeviceModels = createAction(REDUX_DEVICE_MODELS_UPDATE);
// Action creators - End
