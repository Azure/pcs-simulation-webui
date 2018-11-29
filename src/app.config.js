// Copyright (c) Microsoft. All rights reserved.

const Config = {
  // APIs
  simulationApiUrl: '/devicesimulation-svc/v1/',
  diagnosticsApiUrl: '/diagnostics-svc/v1/',
  configApiUrl: '/config-svc/v1/',

  // Constants
  formFieldMaxLength: 25,
  formDescMaxLength: 100,
  retryWaitTime: 15000, // On retryable error, retry after 15s
  maxRetryAttempts: 2,
  maxDevicesPerVM: 20000,
  retryableStatusCodes: new Set([ 0, 502, 503 ]),
  sessionTimeout: 1200000,  // Session will expire in 20 mins
  simulationStatusPollingInterval: 10000, // 10s
  telemetryRefreshInterval: 60000, // 60s
  customSensorValue: 'custom',
  defaultAjaxTimeout: 10000, // 10s
  paginationPageSize: 15,
  deviceModelTypes: {
    customModel: 'Custom',
    stockModel: 'Stock'
  },
  dateTimeFormat: 'DD/MM/YY hh:mm:ss A',
  iotHubRateLimits: {
    s1: {
      RegistryOperationsPerMinute: 100,
      TwinReadsPerSecond: 10,
      TwinWritesPerSecond: 10,
      ConnectionsPerSecond: 100,
      DeviceMessagesPerSecond: 100
    },
    s2: {
      RegistryOperationsPerMinute: 100,
      TwinReadsPerSecond: 10,
      TwinWritesPerSecond: 10,
      ConnectionsPerSecond: 120,
      DeviceMessagesPerSecond: 120
    },
    s3: {
      RegistryOperationsPerMinute: 5000,
      TwinReadsPerSecond: 50,
      TwinWritesPerSecond: 50,
      ConnectionsPerSecond: 6000,
      DeviceMessagesPerSecond: 6000
    }
  }
};

export default Config;
