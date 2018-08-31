// Copyright (c) Microsoft. All rights reserved.

const Config = {
  // APIs
  simulationApiUrl: '/devicesimulation-svc/v1/',
  diagnosticsApiUrl: '/diagnostics-svc/v1/',
  configApiUrl: '/config-svc/v1/',

  // Constants
  simulationId: 1,
  retryWaitTime: 2000, // On retryable error, retry after 2s
  maxRetryAttempts: 2,
  retryableStatusCodes: new Set([ 0, 502, 503 ]),
  sessionTimeout: 1200000,
  maxSimulatedDevices: 20000,
  simulationStatusPollingInterval: 10000, // 10s
  customSensorValue: 'custom',
  defaultAjaxTimeout: 10000, // 10s
  paginationPageSize: 15,
  deviceModelTypes: {
    customModel: 'Custom',
    stockModel: 'Stock'
  }
};

export default Config;
