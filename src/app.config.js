// Copyright (c) Microsoft. All rights reserved.

// TODO: Add real API urls
const Config = {
  // APIs
  simulationApiUrl: '',

  // Constants
  retryWaitTime: 2000, // On retryable error, retry after 2s
  maxRetryAttempts: 2,
  retryableStatusCodes: new Set([ 502, 503 ])
};

export default Config;
