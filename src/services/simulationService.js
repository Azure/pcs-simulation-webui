// Copyright (c) Microsoft. All rights reserved.

import Config from 'app.config';
import { HttpClient } from './httpClient';
import { toSimulationModel, toDeviceModel } from './models';

const ENDPOINT = Config.simulationApiUrl;

/** Contains methods for calling the simulation service */
export class SimulationService {

  /** Returns the device status */
  static getStatus() {
    return HttpClient.get(`${ENDPOINT}status`)
      .map(cleanResponse);
  }

  /** Returns a list of device models */
  static getDeviceModels() {
    return HttpClient.get(`${ENDPOINT}devicemodels`)
      .map(cleanResponse)
      .map(toDeviceModel);
  }

  /** Returns any currently running simulations */
  static getSimulation() {
    return HttpClient.get(`${ENDPOINT}simulations/1`)
      .map(cleanResponse)
      .map(toSimulationModel);
  }

  /** Enables or disables a simulation */
  static toggleSimulation(ETag, Enabled) {
    return HttpClient.patch(`${ENDPOINT}simulations/1`, { ETag, Enabled })
      .map(cleanResponse)
      .map(toSimulationModel);
  }

  /** Enables or disables a simulation */
  // TODO: Create a mapping from UI Model to request object
  static updateSimulation(model) {
    return HttpClient.put(
        `${ENDPOINT}simulations/1`,
        {
          ETag: model.eTag,
          Enabled: model.enabled,
          StartTime: model.startTime,
          endTime: model.endTime,
          Id: model.id,
          DeviceModels: model.deviceModels
        }
      )
      .map(cleanResponse)
      .map(toSimulationModel);
  }
}

/**
 * A utility method for handling ajax response codes
 * @param {AjaxResponse} ajaxResponse See https://github.com/Reactive-Extensions/RxJS-DOM/blob/master/doc/operators/ajax.md#returns
 */
function cleanResponse(ajaxResponse) {
  if (isSuccess(ajaxResponse.status)) {
    return handleSuccess(ajaxResponse);
  } else if (isUserError(ajaxResponse.status)) {
    throw new Error(`${ajaxResponse.status}: User error`); // TEMP: Needs more granular handling
  } else if (isServerError(ajaxResponse.status)) {
    throw new Error(`${ajaxResponse.status}: Server error`); // TEMP: Needs more granular handling
  } else {
    throw new Error(`An unknown error occurred`);
  }
}

// Status Code Checkers
const isSuccess = code => code >= 200 && code < 300;
const isUserError = code => code >= 400 && code < 500;
const isServerError = code => code >= 500 && code < 600;

// Status Code Handlers
const handleSuccess = ({ response }) => response;
