// Copyright (c) Microsoft. All rights reserved.

import { createSelector } from 'reselect';

// Selectors
export const getSimulation = state => state.simulation.model;
export const getSimulationStatus = state => state.simulation.status;
export const getSimulationError = state => state.simulation.error;
export const getDeviceModels = state => state.app.deviceModels;

export const getSimulationIsRunning = createSelector(
  getSimulationStatus,
  status => !status ? undefined : status.simulationRunning
);

export const getConnectStringConfig = createSelector(
  getSimulationStatus,
  status => !status ? undefined : status.ioTHubConnectionStringConfigured
);

export const getDeviceModelsAsMap = createSelector(
  getDeviceModels,
  (deviceModels = []) =>
    deviceModels.reduce((map, model) => ({ ...map, [model.id]: model }), {})
);

export const getSimulationWithDeviceModels = createSelector(
  [getSimulation, getDeviceModelsAsMap, getSimulationError],
  (simulationModel = {}, deviceModelsMap, error) => {
    const modelId = ((simulationModel.deviceModels || [])[0] || {}).id;
    const name = (deviceModelsMap[modelId] || {}).name;
    const deviceModels = (simulationModel.deviceModels || [])
      .map(model => ({ ...model, name }));
    return { ...simulationModel, deviceModels, error };
  }
);
