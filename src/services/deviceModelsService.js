// Copyright (c) Microsoft. All rights reserved.

import Config from 'app.config';
import { HttpClient } from './httpClient';
import { toDeviceModels, toDeviceModel, toDeviceModelRequestModel } from './models';

const ENDPOINT = Config.simulationApiUrl + 'deviceModels';

/** Contains methods for calling the simulation service */
export class DeviceModelsService {

  /** Returns a list of device models */
  static getDeviceModels() {
    return HttpClient.get(`${ENDPOINT}`)
      .map(toDeviceModels);
  }

  /** Returns a device model by id */
  static getDeviceModelById(id) {
    return HttpClient.get(`${ENDPOINT}/${id}`)
      .map(toDeviceModel);
  }

  /** Creates a device model */
  static createDeviceModel(model) {
    return HttpClient.post(`${ENDPOINT}`, toDeviceModelRequestModel(model))
      .map(toDeviceModel);
  }

  /** Updates a device model */
  static updateDeviceModel(id, model) {
    return HttpClient.put(`${ENDPOINT}/${id}`, toDeviceModelRequestModel(model))
      .map(toDeviceModel);
  }

  /** Deletes a device model by id */
  static deleteDeviceModelById(id) {
    return HttpClient.delete(`${ENDPOINT}/${id}`);
  }
}
