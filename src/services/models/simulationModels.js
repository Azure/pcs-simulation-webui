// Copyright (c) Microsoft. All rights reserved.
import { stringToBoolean } from 'utilities';

// Contains methods for converting service response
// object to UI friendly objects
// TODO: Map to backend models and add links to github

export const toSimulationStatusModel = (response = {}) => ({
  simulationRunning: stringToBoolean((response.Properties || {}).SimulationRunning),
  preprovisionedIoTHub: stringToBoolean((response.Properties || {}).PreprovisionedIoTHub),
});

export const toSimulationModel = (response = {}) => ({
  eTag: response.ETag,
  enabled: response.Enabled,
  isRunning: response.Running,
  startTime: response.StartTime,
  endTime: response.EndTime,
  stopTime: response.StoppedTime,
  id: response.Id,
  name: response.Name,
  description: response.Desc,
  statistics: {
    averageMessagesPerSecond: (response.Statistics || {}).AverageMessagesPerSecond,
    totalMessagesSent: (response.Statistics || {}).TotalMessagesSent,
    failedMessagesCount: (response.Statistics || {}).FailedMessagesCount,
    totalDevicesCount: (response.Statistics || {}).TotalDevicesCount,
    activeDevicesCount: (response.Statistics || {}).ActiveDevicesCount,
    failedDeviceConnectionsCount: (response.Statistics || {}).FailedDeviceConnectionsCount,
    failedDeviceTwinUpdatesCount: (response.Statistics || {}).FailedDeviceTwinUpdatesCount,
    simulationErrorsCount: (response.Statistics || {}).SimulationErrorsCount
  },
  deviceModels: (response.DeviceModels || []).map(({ Id, Count, Override }) => ({
    id: Id,
    count: Count,
    interval: ((Override || {}).Simulation || {}).Interval,
    sensors: (((Override || {}).Simulation || {}).Scripts || [])
      .map(({ Params, Path, Type }) => Object.keys(Params || {}).map(key => {
        const { Max, Min, Step, Unit } = Params[key];
        const [, path] = Path.split('.');
        return {
          name: key,
          min: Min,
          max: Max,
          step: Step,
          unit: Unit,
          path: mapToBehavior(path),
          type: Type
        }
      }))
      .reduce((acc, obj) => [...acc, ...obj], [])
  })),
  iotHubs: (response.IoTHubs || []).map(({ ConnectionString, PreprovisionedIoTHub, PreprovisionedIoTHubInUse, PreprovisionedIoTHubMetricsUrl }) => ({
    connectionString: ConnectionString === 'default' ? '' : ConnectionString,
    preprovisionedIoTHub: PreprovisionedIoTHub,
    preprovisionedIoTHubInUse: PreprovisionedIoTHubInUse,
    preprovisionedIoTHubMetricsUrl: PreprovisionedIoTHubMetricsUrl
  }))
});

export const toSimulationListModel = (response = {}) => (response.Items || []).map(toSimulationModel);

const mapToBehavior = path => {
  switch (path) {
    case 'Increasing':
      return 'Increment';
    case 'Decreasing':
      return 'Decrement';
    default:
      return path;
  }
}

// Request models
export const toSimulationRequestModel = (request = {}) => ({
  ETag: request.eTag,
  Enabled: request.enabled,
  StartTime: request.startTime,
  EndTime: request.endTime,
  Id: request.id,
  Name: request.name,
  Desc: request.description,
  DeviceModels: toDeviceModels(request.deviceModels),
  IoTHubs: toIoTHubs(request.iotHubs)
});

// Request models
export const toSimulationCloneModel = (request = {}) => ({
  Enabled: true,
  StartTime: request.startTime,
  EndTime: request.endTime,
  Name: request.name,
  Desc: request.description,
  DeviceModels: toCloneDeviceModels(request.deviceModels),
  IoTHubs: toIoTHubs(request.iotHubs)
});

// Request models
export const toSimulationPatchModel = (request = {}, enabled) => ({
  ETag: request.eTag,
  Id: request.id,
  Enabled: enabled
});

// Map to deviceModels in simulation request model
const toDeviceModels = (deviceModels = []) =>
  deviceModels.map(({ name: Id, count: Count, interval }) => {
    const Interval = `${interval.hours}:${interval.minutes}:${interval.seconds}`;
    return {
      Id,
      Count,
      Override: {
        Simulation: {
          Interval
        },
        Telemetry: [{
          Interval
        }]
      }
    };
  });

// Map to deviceModels in simulation request model
const toCloneDeviceModels = (deviceModels = []) =>
  deviceModels.map(({ id, count: Count, interval }) => {
    return {
      Id: id,
      Count,
      Override: {
        Simulation: {
          Interval: interval
        },
        Telemetry: [{
          Interval: interval
        }]
      }
    };
  });

// Map to deviceModels in simulation request model
const toIoTHubs = (iotHubs = []) =>
  iotHubs.map(({ connectionString }) => {
    return { ConnectionString: connectionString };
  });
