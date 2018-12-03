// Copyright (c) Microsoft. All rights reserved.
import uuid from 'uuid/v4';
import { float } from 'utilities';

export const toJobStatusModel = (response = {}) => ({
  id: response.Id,
  enabled: response.Enabled,
  connected: response.Connected,
});

export const toSubmitTagsJobRequestModel = (devices, { jobName, updatedTags, deletedTags }) => {
  const jobId = jobName ? jobName + '-' + uuid() : uuid();
  const deviceIds = devices.map(({ id }) => `'${id}'`).join(',');
  const Tags = {};
  // Ensure type passed to server is correct as specified: number or text.
  // The toString call is necessary when a number should be saved as text.
  updatedTags.forEach(({ name, value, type }) =>
    (Tags[name] = type === 'Number' ? float(value) : value.toString()));
  deletedTags.forEach((name) => (Tags[name] = null));
  const request = {
    JobId: jobId,
    QueryCondition: `deviceId in [${deviceIds}]`,
    MaxExecutionTimeInSeconds: 0,
    UpdateTwin: {
      Tags
    }
  };
  return request;
};

export const toSubmitMethodJobRequestModel = (devices, { jobName, methodName, firmwareVersion, firmwareUri }) => {
  const jobId = jobName ? jobName + '-' + uuid() : uuid();
  const deviceIds = devices.map(({ id }) => `'${id}'`).join(',');

  const request = {
    JobId: jobId,
    QueryCondition: `deviceId in [${deviceIds}]`,
    MaxExecutionTimeInSeconds: 0,
    MethodParameter: {
      Name: methodName
    }
  };
  return request;
};

export const toSubmitPropertiesJobRequestModel = (devices, { jobName, updatedProperties, deletedProperties }) => {
  const jobId = jobName ? jobName + '-' + uuid() : uuid();
  const deviceIds = devices.map(({ id }) => `'${id}'`).join(',');
  const Desired = {};
  // Ensure type passed to server is correct as specified: number or text.
  // The toString call is necessary when a number should be saved as text.
  updatedProperties.forEach(({ name, value, type }) =>
    (Desired[name] = type === 'Number' ? float(value) : value.toString()));
  deletedProperties.forEach((name) => (Desired[name] = null));
  const request = {
    JobId: jobId,
    QueryCondition: `deviceId in [${deviceIds}]`,
    MaxExecutionTimeInSeconds: 0,
    UpdateTwin: {
      Properties: {
        Desired
      }
    }
  };
  return request;
};
