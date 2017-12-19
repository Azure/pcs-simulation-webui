// Copyright (c) Microsoft. All rights reserved.

import { createSelector } from 'reselect';
import Config from 'app.config';

// Selectors
export const getSimulation = state => state.simulation.model;
export const getSimulationStatus = state => state.simulation.status;
export const getSimulationError = state => state.simulation.error;
export const getDeviceModels = state => state.app.deviceModels;

export const getSimulationIsRunning = createSelector(
  getSimulationStatus,
  status => !status ? undefined : status.simulationRunning
);

export const getPreprovisionedIoTHubInUse = createSelector(
  getSimulationStatus,
  status => !status ? undefined : status.preprovisionedIoTHubInUse
);

export const getPreprovisionedIoTHubMetricsUrl = createSelector(
  getSimulationStatus,
  status => !status ? undefined : status.preprovisionedIoTHubMetricsUrl
);

export const getPreprovisionedIoTHub = createSelector(
  getSimulationStatus,
  status => !status ? undefined : status.preprovisionedIoTHub
);

export const getDeviceModelsAsMap = createSelector(
  getDeviceModels,
  (deviceModels = []) =>
    deviceModels.reduce((map, model) => ({ ...map, [model.id]: model }), {})
);

export const getSimulationWithDeviceModels = createSelector(
  [getSimulation, getDeviceModelsAsMap],
  (simulationModel = {}, deviceModelsMap) => {
    const modelId = ((simulationModel.deviceModels || [])[0] || {}).id;
    const name = modelId === Config.customSensorModel.value
      ? Config.customSensorModel.label
      : (deviceModelsMap[modelId] || {}).name;
    const deviceModels = (simulationModel.deviceModels || [])
      .map(model => ({ ...model, name }));
    return { ...simulationModel, deviceModels };
  }
);
