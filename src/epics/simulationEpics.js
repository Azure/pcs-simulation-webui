// Copyright (c) Microsoft. All rights reserved.

import 'rxjs';
import * as actions from 'actions';
import { SimulationService } from 'services';

/** Loads the simulation status */
export const loadSimulationStatus = action$ => {
  return action$
    .ofType(actions.EPIC_APP_SIMULATION_STATUS_LOAD)
    .flatMap(_ => SimulationService.getStatus())
    .map(_ => ({ type: 'REDUX_SIMULATION_STATUS_UPDATE'})); // TODO: Implement
};

/** Loads the simulation */
export const loadSimulation = action$ => {
  return action$
    .ofType(actions.EPIC_SIMULATION_LOAD)
    .flatMap(_ => {
      return SimulationService.getSimulation()
        .map(actions.updateReduxSimulation)
        .startWith(actions.clearReduxSimulation());
    })
};

/** Used to enable or disable the simulation */
export const toggleSimulation = (action$, store) => {
  return action$
    .ofType(actions.EPIC_SIMULATION_TOGGLE)
    .flatMap(({ payload }) => {
      const { simulation } = store.getState();
      return SimulationService.toggleSimulation(simulation.eTag, payload)
        .map(actions.updateReduxSimulation)
        .startWith(actions.clearReduxSimulation());
    });
};

/** Updates the simulation */
export const updateSimulation = (action$, store) => {
  return action$
    .ofType(actions.EPIC_SIMULATION_UPDATE)
    .flatMap(({ payload }) => {
      const { simulation } = store.getState();
      const newModel = { ...simulation, ...payload };
      return SimulationService.updateSimulation(newModel)
        .map(actions.updateReduxSimulation)
        .startWith(actions.clearReduxSimulation());
    });
};
