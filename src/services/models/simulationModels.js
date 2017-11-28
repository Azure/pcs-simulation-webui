// Copyright (c) Microsoft. All rights reserved.

// Contains methods for converting service response
// object to UI friendly objects
// TODO: Map to backend models and add links to github

export const toSimulationStatusModel = (response = {}) => ({
  simulationStatus: ((response.Properties || {}).Simulation || '').toLowerCase()
});

export const toSimulationModel = (response = {}) => {
  return {
  eTag: response.ETag,
  enabled: response.Enabled,
  startTime: response.StartTime,
  endTime: response.EndTime,
  id: response.Id,
  deviceModels: (response.DeviceModels || []).map(({ Id, Count }) => ({
    id: Id,
    count: Count
  })),
  iotHub: toIotHubModel(response.IoTHub)
}};

const toIotHubModel = (response = {}) => ({
  connectionString: response.ConnectionString
})

export const toDeviceModel = (response = {}) => {
  return {
    id: response.Id,
    name: response.Name,
    description: response.Description,
    simulation: response.Simulation,
    telemetry: response.Telemetry
  };
};

// Request models
export const toSimulationRequestModel = (request = {}) => {
  return {
    ETag: request.eTag,
    Enabled: request.enabled,
    StartTime: request.startTime,
    EndTime: request.endTime,
    Id: request.id,
    DeviceModels: request.deviceModels,
    IoTHub: toIotHubRequestModel(request.iotHub)
}};

const toIotHubRequestModel = (request = {}) => ({
  ConnectionString: request.connectionString
})
