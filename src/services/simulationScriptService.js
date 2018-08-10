// Copyright (c) Microsoft. All rights reserved.

import Config from 'app.config';
import { HttpClient } from './httpClient';
import {
  toSimulationScripts,
  toSimulationScript,
  toSimulationScriptRequestModel,
  toValidationModel
} from './models';

const ENDPOINT = `${Config.simulationApiUrl}simulationscripts`;

/** Contains methods for calling the simulation service */
export class SimulationScriptsService {

  /** Returns a list of simulation scripts */
  static getSimulationScripts() {
    return HttpClient.get(ENDPOINT)
      .map(toSimulationScripts);
  }

  /** Returns a simulation script by id */
  static getSimulationScriptById(id) {
    return HttpClient.get(`${ENDPOINT}/${id}`)
      .map(toSimulationScript);
  }

  /** Creates a simulation script */
  static uploadsSimulationScript(script) {
    return HttpClient.upload(ENDPOINT, script)
      .map(toSimulationScript);
  }

  /** Updates a simulation script */
  static updateSingleSimulationScript(script) {
    return HttpClient.put(`${ENDPOINT}/${script.id}`, toSimulationScriptRequestModel(script))
      .map(toSimulationScript);
  }

  /** Deletes a simulation script by id */
  static deleteSimulationScriptById(id) {
    return HttpClient.delete(`${ENDPOINT}/${id}`);
  }

  /** Validate a simulation script */
  static validateSimulationScript(script) {
    return HttpClient.upload(`${ENDPOINT}!validate`, script)
      .map(toValidationModel);
  }
}
