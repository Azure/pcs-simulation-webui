// Copyright (c) Microsoft. All rights reserved.

import Config from 'app.config';
import { HttpClient } from './httpClient';
import { toSimulationStatus, toSimulationModel, toDeviceModel } from './models';
import { Observable } from 'rxjs/Observable';

const ENDPOINT = Config.simulationApiUrl;

/** Contains methods for calling the simulation service */
export class SimulationService {

  /** Returns the device status */
  static getStatus() {
    return HttpClient.get(`${ENDPOINT}status`)
      .map(toSimulationStatus);
  }

  /** Returns a list of device models */
  static getDeviceModels() {
    return HttpClient.get(`${ENDPOINT}devicemodels`)
      .map(toDeviceModel);
  }

  /** Returns any currently running simulation */
  static getSimulation() {
    return HttpClient.get(`${ENDPOINT}simulations/1`)
      .map(toSimulationModel);
  }

  /** Enables or disables a simulation */
  static toggleSimulation(ETag, Enabled) {
    return HttpClient.patch(`${ENDPOINT}simulations/1`, { ETag, Enabled })
      .map(toSimulationModel)
      .catch(resolveConflict);
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
          EndTime: model.endTime,
          Id: model.id,
          DeviceModels: model.deviceModels
        }
      )
      .map(toSimulationModel)
      .catch(resolveConflict);
  }
}

/** If the UI resource is out of sync with the service, update the UI resource */
function resolveConflict(error) {
  if (error.status === 409) {
    return SimulationService.getSimulation();
  }
  return Observable.throw(error);
}
