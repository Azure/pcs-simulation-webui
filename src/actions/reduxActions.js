// Copyright (c) Microsoft. All rights reserved.

import { createAction } from 'utilities';
import { toSimulationModel } from 'services/models';

// Redux actions trigger updates to the redux store

// Action names - START
export const REDUX_DEVICE_MODELS_UPDATE = 'REDUX_DEVICE_MODELS_UPDATE';
export const REDUX_SIMULATION_UPDATE = 'REDUX_SIMULATION_UPDATE';
export const REDUX_SIMULATION_CLEAR = 'REDUX_SIMULATION_CLEAR';
// Action names - End

// Action creators - START
export const updateReduxSimulation = createAction(REDUX_SIMULATION_UPDATE);
export const clearReduxSimulation = createAction(REDUX_SIMULATION_CLEAR, toSimulationModel());
export const updateReduxDeviceModels = createAction(REDUX_DEVICE_MODELS_UPDATE);
// Action creators - End
