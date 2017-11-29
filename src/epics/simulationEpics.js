// Copyright (c) Microsoft. All rights reserved.

import 'rxjs';
import { Observable } from 'rxjs';
import * as actions from 'actions';
import { SimulationService } from 'services';
import { getSimulation } from 'reducers/selectors';

const dispatchError = error => Observable.of(actions.updateReduxSimulationError(error.message));

/** Loads the simulation status */
export const loadSimulationStatus = action$ =>
  action$.ofType(actions.EPIC_APP_SIMULATION_STATUS_LOAD)
    .flatMap(_ => SimulationService.getStatus())
    .map(actions.updateReduxSimulationStatus)
    .catch(dispatchError);

/** Loads the simulation */
export const loadSimulation = action$ =>
  action$.ofType(actions.EPIC_SIMULATION_LOAD)
    .flatMap(_ =>
      SimulationService.getSimulation()
        .map(actions.updateReduxSimulation)
        .startWith(actions.clearReduxSimulation())
    )
    .catch(dispatchError);

/** Used to enable or disable the simulation */
export const toggleSimulation = (action$, store) =>
  action$.ofType(actions.EPIC_SIMULATION_TOGGLE)
    .flatMap(({ payload }) => {
      const simulation = getSimulation(store.getState());
      return SimulationService.toggleSimulation(simulation.eTag, payload)
        .map(actions.updateReduxSimulation)
        .startWith(actions.clearReduxSimulation());
    })
    .catch(dispatchError);

/** Updates the simulation */
export const updateSimulation = (action$, store) =>
  action$.ofType(actions.EPIC_SIMULATION_UPDATE)
    .flatMap(({ payload }) => {
      const simulation = getSimulation(store.getState());
      const newModel = { ...payload, eTag: simulation.eTag };
      return SimulationService.updateSimulation(newModel)
        .map(actions.updateReduxSimulation)
        .startWith(actions.clearReduxSimulation());
    })
    .catch(dispatchError);
