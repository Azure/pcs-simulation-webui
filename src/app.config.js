// Copyright (c) Microsoft. All rights reserved.

const Config = {
  // APIs
  simulationApiUrl: 'http://localhost:9003/v1/',
  diagnosticsApiUrl: 'http://localhost:9007/v1/',

  // Constants
  retryWaitTime: 2000, // On retryable error, retry after 2s
  maxRetryAttempts: 2,
  retryableStatusCodes: new Set([ 0, 502, 503 ]),
  maxSimulatedDevices: 1000,
  simulationStatusPollingInterval: 10000, // 10s
  customSensorValue: 'custom',
  defaultAjaxTimeout: 10000, // 10s
};

export default Config;
