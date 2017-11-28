// Copyright (c) Microsoft. All rights reserved.

// Contains methods for converting service response
// object to UI friendly objects
// TODO: Map to backend models and add links to github

export const toSimulationStatusModel = (response = {}) => ({
  simulationStatus: ((response.Properties || {}).Simulation || '').toLowerCase()
});

export const toSimulationModel = (response = {}) => ({
  eTag: response.ETag,
  enabled: response.Enabled,
  startTime: response.StartTime,
  endTime: response.EndTime,
  id: response.Id,
  deviceModels: (response.DeviceModels || []).map(({ Id, Count }) => ({
    id: Id,
    count: Count
  }))
});

export const toDeviceModel = (response = {}) => {
  return {
    id: response.Id,
    name: response.Name,
    description: response.Description,
    simulation: response.Simulation,
    telemetry: response.Telemetry
  };
};
