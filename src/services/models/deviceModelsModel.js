// Copyright (c) Microsoft. All rights reserved.

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

// Request model
export const toDeviceModelRequestModel = (request = {}) => {
  const { id = "new", name, description, interval, sensors, frequency } = request;
  const { script, messageTemplate, messageSchema } = toCustomSensorModel(sensors);
  return {
    Id: id,
    Name: name,
    Description: description,
    Protocol: "MQTT",
    Simulation: {
      Interval: frequency,
      Scripts: script
    },
    Telemetry: [{
      Interval: interval,
      MessageTemplate: messageTemplate,
      MessageSchema: messageSchema
    }]
  };
};

// Map to deviceModels in simulation request model
const toDeviceModels = (deviceModels = []) =>
  deviceModels.map(({ id, count, interval, sensors, isCustomDevice, defaultDeviceModel = {} }) => {
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
