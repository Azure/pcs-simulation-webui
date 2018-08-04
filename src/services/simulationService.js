// Copyright (c) Microsoft. All rights reserved.

import Config from 'app.config';
import { HttpClient } from './httpClient';
import { toSimulationStatusModel, toSimulationModel, toSimulationListModel, toDeviceModel, toSimulationRequestModel, toCloneSimulationRequestModel } from './models';
import { Observable } from 'rxjs/Observable';

const ENDPOINT = Config.simulationApiUrl;

/** Contains methods for calling the simulation service */
export class SimulationService {

  /** Returns the device status */
  static getStatus(id) {
    return HttpClient.get(`${ENDPOINT}status/${id}`)
      .map(toSimulationStatusModel);
  }

  /** Returns a list of device models */
  static getDeviceModels() {
    return HttpClient.get(`${ENDPOINT}devicemodels`)
      .map(({ Items }) => Items)
      .map(models => models.map(toDeviceModel));
  }

  /** Returns list of simulations */
  static getSimulationList() {
    return HttpClient.get(`${ENDPOINT}simulations`)
      .map(toSimulationListModel)
      .catch(error => {
        // A 404 from the GET request means that no simulation is configured, not an actual 404 error
        if (error.status === 404) return Observable.of(toSimulationListModel({ Enabled: null }))
        return Observable.throw(error);
      });
  }

  /** Returns any currently running simulation */
  static getSimulation(id) {
    id = id || '';
    return HttpClient.get(`${ENDPOINT}simulations/${id}`)
      .map(toSimulationModel)
      .catch(error => {
        // A 404 from the GET request means that no simulation is configured, not an actual 404 error
        if (error.status === 404) return Observable.of(toSimulationModel({ Enabled: null }))
        return Observable.throw(error);
      });
  }

  /** Enables or disables a simulation */
  static createSimulation(model) {
    console.log("Model", toSimulationRequestModel(model));

    return HttpClient.post(
        `${ENDPOINT}simulations`,
        toSimulationRequestModel(model)
      )
      .map(toSimulationModel)
      .catch(resolveConflict);
  }

  /** Disable a simulation */
  static stopSimulation(simulation) {
    return HttpClient.patch(`${ENDPOINT}simulations/${simulation.id}`, { eTag:simulation.eTag, enabled:false })
      .map(toSimulationModel)
      .catch(resolveConflict);
  }

  /** Enables or disables a simulation */
  // TODO: Create a mapping from UI Model to request object
  static cloneSimulation(model) {
    console.log("Model", toCloneSimulationRequestModel(model));
    return HttpClient.post(
        `${ENDPOINT}simulations`,
        toCloneSimulationRequestModel(model)
      )
      .map(toSimulationModel)
      .catch(resolveConflict);
  }
}

/** If the UI resource is out of sync with the service, update the UI resource */
function resolveConflict(error) {
  console.log("error ", error);
  return Observable.throw(error);
}
