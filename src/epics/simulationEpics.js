// Copyright (c) Microsoft. All rights reserved.

import 'rxjs';
import * as actions from 'actions';
import { SimulationService } from 'services';

/** Loads the simulation status */
export const loadSimulationStatus = action$ => {
  return action$
    .ofType(actions.LOAD_SIMULATION_STATUS)
    .flatMap(_ => SimulationService.getStatus())
    .map(_ => ({ type: 'UPDATE_SIMULATION_STATUS'}));
};

/** Loads the simulation */
export const loadSimulation = action$ => {
  return action$
    .ofType(actions.LOAD_SIMULATION)
    .flatMap(_ => {
      return SimulationService.getSimulation()
        .map(actions.updateSimulationStore)
        .startWith(actions.clearSimulationStore());
    })
};

/** Used to enable or disable the simulation */
export const toggleSimulation = (action$, store) => {
  return action$
    .ofType(actions.TOGGLE_SIMULATION)
    .flatMap(({ enabled }) => {
      const { simulation } = store.getState();
      return SimulationService.toggleSimulation(simulation.eTag, enabled)
        .map(actions.updateSimulationStore)
        .startWith(actions.clearSimulationStore());
    });
};

/** Updates the simulation */
export const updateSimulation = (action$, store) => {
  return action$
    .ofType(actions.UPDATE_SIMULATION)
    .flatMap(({ modelUpdates }) => {
      const { simulation } = store.getState();
      const newModel = { ...simulation, ...modelUpdates };
      return SimulationService.updateSimulation(newModel)
        .map(actions.updateSimulationStore)
        .startWith(actions.clearSimulationStore());
    });
};
