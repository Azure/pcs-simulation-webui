// Copyright (c) Microsoft. All rights reserved.

const Config = {
  // APIs
  simulationApiUrl: '/devicesimulation-svc/v1/',
  diagnosticsApiUrl: '/diagnostics-svc/v1/',
  configApiUrl: '/config/v1/',


  // Constants
  retryWaitTime: 2000, // On retryable error, retry after 2s
  maxRetryAttempts: 2,
  retryableStatusCodes: new Set([ 0, 502, 503 ]),
  maxSimulatedDevices: 20000,
  simulationStatusPollingInterval: 10000, // 10s
  customSensorValue: 'custom',
  defaultAjaxTimeout: 10000, // 10s
};

export default Config;
