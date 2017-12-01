// Copyright (c) Microsoft. All rights reserved.

import { int, stringToBoolean } from 'utilities';

// Contains methods for converting service response
// object to UI friendly objects
// TODO: Map to backend models and add links to github

export const toSimulationStatusModel = (response = {}) => ({
  simulationRunning: stringToBoolean((response.Properties || {}).SimulationRunning),
  ioTHubConnectionStringConfigured: stringToBoolean((response.Properties || {}).IoTHubConnectionStringConfigured)
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
  DeviceModels: (request.deviceModels || []).map(({ id, count, interval, sensors }) => ({
    Id: id,
    Count: count,
    Override: {
      Simulation: {
        Interval: interval,
        Scripts: (toCustomSensorModel(sensors) || {}).script
      },
      Telemetry: [{
        Interval: interval,
        MessageTemplate: (toCustomSensorModel(sensors) || {}).messageTemplate,
        MessageSchema: (toCustomSensorModel(sensors) || {}).messageSchema
      }]
    }
  })),
  IoTHub: {
    ConnectionString: request.connectionString
  }
});

const toCustomSensorModel = (sensors) => {
  const behaviorMap = {};
  let Fields = {};
  let messages = [];

  Object.values(sensors)
    .forEach(({ name, behavior, minValue, maxValue, unit }) => {
      const _name = name.toLowerCase();
      const _unit = unit.toLowerCase();
      const nameString = `\\"${_name}\\":$\{${_name}}`;
      const unitString = `\\"${_name}_unit\\":\\"$\{${_unit}}\\"`;
      const path = behavior.value;
      messages = [...messages, nameString, unitString];
      Fields = { ...Fields, [_name]: 'double', [`${_name}_unit`]: 'text' };
      if(!behaviorMap[path]) behaviorMap[path] = {};
      behaviorMap[path] = {
        ...behaviorMap[path],
        [_name]: {
          Min: int(minValue),
          Max: int(maxValue),
          Step: 1
        }
      }
    });

    const script = Object.keys(behaviorMap).map(Path => ({
      Type: "internal",
      Path: 'Math.Increasing',
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
