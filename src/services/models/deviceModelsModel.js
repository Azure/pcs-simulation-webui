// Copyright (c) Microsoft. All rights reserved.

// Map to deviceModel in simulation form view
export const toDeviceModel = (response = {}) => ({
  id: response.Id,
  name: response.Name,
  description: response.Description,
  eTag: response.Etag,
  version: response.Version,
  type: response.Type,
  simulation: response.Simulation,
  telemetry: response.Telemetry,
  cloudToDeviceMethods: response.CloudToDeviceMethods,
  properties: response.Properties,
});

// Request model
export const toDeviceModelRequestModel = (request = {}) => {
  const { id = 'new', name, description, version, interval, sensors, frequency } = request;
  const { script, messageTemplate, messageSchema } = toCustomSensorModel(sensors);
  return {
    Id: id,
    Name: name,
    Description: description,
    Version: version,
    Protocol: 'MQTT',
    Type: 'CustomModel',
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

const toCustomSensorModel = (sensors = []) => {
  const behaviorMap = {};
  let Fields = {};
  let messages = [];

  sensors
    .forEach(({ name, behavior, minValue, maxValue, unit }) => {
      const _name = name.toLowerCase();
      const _unit = unit.toLowerCase();
      const nameString = `'${_name}':$\{${_name}}`;
      const unitString = `'${_name}_unit':'${_unit}'`;
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
      Type: 'internal',
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
