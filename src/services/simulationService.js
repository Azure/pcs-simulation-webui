// Copyright (c) Microsoft. All rights reserved.

import Config from 'app.config';
import { HttpClient } from './httpClient';

const ENDPOINT = Config.simulationApiUrl;

/** Contains methods for calling the simulation service */
export class SimulationService {

  /** Returns any currently running simulations */
  static getSimulation() {
    return HttpClient.get(`${ENDPOINT}simulations/1`);
  }

  /** Enables or disables a simulation */
  static toggleSimulation(ETag, Enabled) {
    return HttpClient.patch(`${ENDPOINT}simulations/1`, { ETag, Enabled });
  }

}
