// Copyright (c) Microsoft. All rights reserved.
import { stringToBoolean } from 'utilities';

// Contains methods for converting service response
// object to UI friendly objects
// TODO: Map to backend models and add links to github

export const toSimulationStatusModel = (response = {}) => ({
  simulationRunning: stringToBoolean((response.Properties || {}).SimulationRunning),
  preprovisionedIoTHub: stringToBoolean((response.Properties || {}).PreprovisionedIoTHub),
  preprovisionedIoTHubInUse: stringToBoolean((response.Properties || {}).PreprovisionedIoTHubInUse),
  preprovisionedIoTHubMetricsUrl: (response.Properties || {}).PreprovisionedIoTHubMetricsUrl,
  activeDevicesCount: (response.Properties || {}).ActiveDevicesCount,
  totalDevicesCount: (response.Properties || {}).TotalDevicesCount,
  messagesPerSecond: (response.Properties || {}).MessagesPerSecond,
  failedMessagesCount: (response.Properties || {}).FailedMessagesCount,
  totalMessagesCount: (response.Properties || {}).TotalMessagesCount,
  failedDeviceConnectionsCount: (response.Properties || {}).FailedDeviceConnectionsCount,
  failedDeviceTwinUpdatesCount: (response.Properties || {}).FailedDeviceTwinUpdatesCount
});

export const toSimulationModel = (response = {}) => ({
  eTag: response.ETag,
  enabled: response.Enabled,
  startTime: response.StartTime,
  endTime: response.EndTime,
  id: response.Id,
  name: response.Name,
  description: response.Desc,
  totalMessages: response.TotalMsgs,
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
  connectionString: (response.IoTHub || {}).ConnectionString === 'default'
    ? '' : (response.IoTHub || {}).ConnectionString
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
  TotalMsgs: request.totalMessages,
  DeviceModels: toDeviceModels(request.deviceModels),
  IoTHub: {
    ConnectionString: request.connectionString
  }
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
