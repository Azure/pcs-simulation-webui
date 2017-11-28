// Copyright (c) Microsoft. All rights reserved.

import { createSelector } from 'reselect';
import moment from 'moment'

const mapIntoObject = (arr) =>
  arr.reduce((acc, curr) => {
    acc[curr.Id] = curr;
    return acc;
  }, {});

// Selectors
export const getSimulation = state => state.simulation;
export const getSimulationDeviceModelId = ({ simulation }) => (simulation.deviceModels || []).length ? simulation.deviceModels[0].Id : '';
export const getDeviceModels = state => mapIntoObject((state.app || {}).deviceModels || []);
export const getSimulationDuration = state => {
  const { startTime, endTime } = state.simulation;
  if (!startTime || !endTime) return 'Run indefinitely';
  return moment.duration(moment(endTime).diff(moment(startTime))).humanize();
};

export const getSimulationDetails = createSelector(
  [getSimulation, getSimulationDeviceModelId, getDeviceModels, getSimulationDuration],
  (simulation, deviceModelId, deviceModels, duration) => ({
    ...simulation,
    deviceModels: simulation.deviceModels.map(model => ({
      ...model,
      Name: (deviceModels[deviceModelId] || {}).Name
    })),
    duration
  })
);
