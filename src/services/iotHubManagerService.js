// Copyright (c) Microsoft. All rights reserved.

import Config from 'app.config';
import { HttpClient } from './httpClient';
import { toJobStatusModel } from './models';

const ENDPOINT = Config.iotHubManagerApiUrl;

/** Contains methods for calling the Device service */
export class IoTHubManagerService {
  /** Submits a job */
  static submitJob(body) {
    console.log('submitJob', body)
    return HttpClient.post(`${ENDPOINT}jobs`, body)
      .map(toJobStatusModel);
  }

  /** Get returns the status details for a particular job */
  static getJobStatus(jobId) {
    return HttpClient.get(`${ENDPOINT}jobs/${jobId}?includeDeviceDetails=true`)
      .map(toJobStatusModel);
  }
}
