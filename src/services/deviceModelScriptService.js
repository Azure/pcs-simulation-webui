// Copyright (c) Microsoft. All rights reserved.

import Config from 'app.config';
import { HttpClient } from './httpClient';
import {
  toFiles,
  toFile,
  toFileRequestModel,
  toValidationModel
} from './models';

const ENDPOINT = `${Config.simulationApiUrl}devicemodelscripts`;

const uploadOptions = {
  headers: {
    'Accept': undefined,
    'Content-Type': undefined
  }
};

/** Contains methods for calling the device model service */
export class DeviceModelScriptsService {

  /** Returns a list of device model scripts */
  static getDeviceModelScripts() {
    return HttpClient.get(ENDPOINT)
      .map(toFiles);
  }

  /** Returns a device model script by id */
  static getDeviceModelScriptById(id) {
    return HttpClient.get(`${ENDPOINT}/${id}`)
      .map(toFile);
  }

  /** Creates a device model script */
  static uploadsDeviceModelScript(script) {
    return HttpClient.post(ENDPOINT, toFileRequestModel(script), uploadOptions)
      .map(toFile);
  }

  /** Updates a device model script */
  static updateSingleDeviceModelScript(script) {
    return HttpClient.put(`${ENDPOINT}/${script.id}`, toFileRequestModel(script), uploadOptions)
      .map(toFile);
  }

  /** Deletes a device model script by id */
  static deleteDeviceModelScriptById(id) {
    return HttpClient.delete(`${ENDPOINT}/${id}`);
  }

  /** Validate a device model script */
  static validateDeviceModelScript(script) {
    return HttpClient.post(`${ENDPOINT}!validate`, toFileRequestModel(script), uploadOptions)
      .map(toValidationModel);
  }
}
