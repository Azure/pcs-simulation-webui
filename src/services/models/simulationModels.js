// Copyright (c) Microsoft. All rights reserved.

// Contains methods for converting service response
// object to UI friendly objects
// TODO: Map to backend models and add links to github

export const toSimulationStatusModel = (response = {}) => ({
    simulationRunning: (response.Properties || {}).SimulationRunning,
    ioTHubConnectionStringConfigured: (response.Properties || {}).IoTHubConnectionStringConfigured
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
  })),
  connectionString: (response.IoTHub || {}).ConnectionString === 'default'
    ? '' : (response.IoTHub || {}).ConnectionString
});

export const toDeviceModel = (response = {}) => ({
  id: response.Id,
  name: response.Name,
  description: response.Description,
  simulation: response.Simulation,
  telemetry: response.Telemetry
});

// Request models
export const toSimulationRequestModel = (request = {}) => ({
  ETag: request.eTag,
  Enabled: request.enabled,
  StartTime: request.startTime,
  EndTime: request.endTime,
  Id: request.id,
  DeviceModels: (request.deviceModels || []).map(({ id, count, interval }) => ({
    Id: id,
    Count: count,
    Override: {
      Simulation: { Scripts: [{ Interval: interval }] },
      Telemetry: [{ Interval: interval }]
    }
  })),
  IoTHub: {
    ConnectionString: request.connectionString
  }
});
