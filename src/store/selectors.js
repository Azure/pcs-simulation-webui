// Copyright (c) Microsoft. All rights reserved.

import { createSelector } from 'reselect';
import Config from 'app.config';
import { getDeviceModels } from 'store/reducers/deviceModelsReducer';

// Selectors
export const getSimulationListReduer = state => state.simulations;
export const getEntities = state => getSimulationListReduer(state).entities;
export const getItems = state => getSimulationListReduer(state).items;
export const getSimulations = createSelector(
  getEntities, getItems,
    (entities, items = []) => items.map(id => entities[id])
);
export const getSimulation = state => state.simulation.model;
export const getSimulationStatus = state => state.simulation.status;
export const getSimulationError = state => state.simulation.error;

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
    const name = modelId === Config.customSensorValue
      ? 'Custom'
      : (deviceModelsMap[modelId] || {}).name;
    const deviceModels = (simulationModel.deviceModels || [])
      .map(model => ({ ...model, name }));
    return { ...simulationModel, deviceModels };
  }
);

export const getSimulationListWithDeviceModels = createSelector(
  [getSimulations, getDeviceModelsAsMap],
  (simulations = [], deviceModelsMap) => simulations.map(simulationModel => {
    const modelId = ((simulationModel.deviceModels || [])[0] || {}).id;
    const name = modelId === Config.customSensorValue
      ? 'Custom'
      : (deviceModelsMap[modelId] || {}).name;
    const deviceModels = (simulationModel.deviceModels || [])
      .map(model => ({ ...model, name }));
    return { ...simulationModel, deviceModels };
  })
);
