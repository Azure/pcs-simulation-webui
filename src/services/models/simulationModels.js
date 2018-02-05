// Copyright (c) Microsoft. All rights reserved.

import { stringToBoolean } from 'utilities';

// Contains methods for converting service response
// object to UI friendly objects
// TODO: Map to backend models and add links to github

export const toSimulationStatusModel = (response = {}) => ({
  simulationRunning: stringToBoolean((response.Properties || {}).SimulationRunning),
  preprovisionedIoTHub: stringToBoolean((response.Properties || {}).PreprovisionedIoTHub),
  preprovisionedIoTHubInUse: stringToBoolean((response.Properties || {}).PreprovisionedIoTHubInUse),
  preprovisionedIoTHubMetricsUrl: (response.Properties || {}).PreprovisionedIoTHubMetricsUrl
});


export const toSimulationModel = (response = {}) => ({
  eTag: response.ETag,
  enabled: response.Enabled,
  startTime: response.StartTime,
  endTime: response.EndTime,
  id: response.Id,
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
          type: Type,
        }
      }))
      .reduce((acc, obj) => [...acc, ...obj], [])
  })),
  connectionString: (response.IoTHub || {}).ConnectionString === 'default'
    ? '' : (response.IoTHub || {}).ConnectionString
});

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

// Map to deviceModel in simulation form view
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
  DeviceModels: toDeviceModels(request.deviceModels),
  IoTHub: {
    ConnectionString: request.connectionString
  }
});

// Map to deviceModels in simulation request model
const toDeviceModels = (deviceModels = []) =>
  deviceModels.map(({ id, count, interval, sensors, isCustomDevice, defaultDeviceModel = {} }) => {
    const { simulation = {}, telemetry = [] } = defaultDeviceModel;
    if (isCustomDevice) {
      const { script, messageTemplate, messageSchema } = toCustomSensorModel(sensors);
      return {
        Id: id,
        Count: count,
        Override: {
          Simulation: {
              Interval: interval,
              Scripts: script
            },
          Telemetry: [{
            Interval: interval,
            MessageTemplate: messageTemplate,
            MessageSchema: messageSchema
          }]
        }
      };
    }
    return {
      Id: id,
      Count: count,
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

const toCustomSensorModel = (sensors = []) => {
  const behaviorMap = {};
  let Fields = {};
  let messages = [];

  sensors
    .forEach(({ name, behavior, minValue, maxValue, unit }) => {
      const _name = name.toLowerCase();
      const _unit = unit.toLowerCase();
      const nameString = `"${_name}":$\{${_name}}`;
      const unitString = `"${_name}_unit":"${_unit}"`;
      const path = behavior.value;
      messages = [...messages, nameString, unitString];
      Fields = { ...Fields, [_name]: 'double', [`${_name}_unit`]: 'text' };
      if(!behaviorMap[path]) behaviorMap[path] = {};
      behaviorMap[path] = {
        ...behaviorMap[path],
        [_name]: {
          Min: minValue,
          Max: maxValue,
          Step: 1,
          Unit: unit
        }
      }
    });

    const script = Object.keys(behaviorMap).map(Path => ({
      Type: "internal",
      Path,
      Params: behaviorMap[Path]
    }));
    const messageTemplate = `{${messages.join(',')}}`;
    const messageSchema = {
      Name: 'custom-sensors;v1',
      Format: 'JSON',
      Fields
    }

    return {
      script,
      messageTemplate,
      messageSchema
    };
}
