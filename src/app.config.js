// Copyright (c) Microsoft. All rights reserved.

const Config = {
  // APIs
  simulationApiUrl: '/devicesimulation-svc/v1/',

  // Constants
  retryWaitTime: 2000, // On retryable error, retry after 2s
  maxRetryAttempts: 2,
  retryableStatusCodes: new Set([ 502, 503 ]),
  maxSimulatedDevices: 1000,
  customSensorModel: { value: 'custom', label: 'Custom' }
};

export default Config;
