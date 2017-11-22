// Copyright (c) Microsoft. All rights reserved.

import 'rxjs';
import * as actions from 'actions';
import { SimulationService } from 'services';

/** Kicks off all the events that need to happen on app initialization */
export const initializeApp = action$ => {
  return action$
    .ofType(actions.INITIALIZE_APP)
    .flatMap(_ => [
      // Actions to take when the app loads
      actions.loadSimulationStatus(),
      actions.loadSimulation(),
      actions.loadDeviceModels()
    ]);
};

/** Loads device models */
export const loadDeviceModels = action$ => {
  return action$
    .ofType(actions.LOAD_DEVICE_MODELS)
    .flatMap(_ => SimulationService.getDeviceModels())
    .map(({ Items }) => actions.updateDeviceModels(Items));
};

/** Listen to route events and emit a route change event when the url changes */
export const detectRouteChange = action$ => {
  return action$
    .ofType(actions.ROUTE_EVENT)
    .distinctUntilChanged((a, b) => a.pathname === b.pathname)
    .map(({ pathname }) => actions.routeChange(pathname));
};
