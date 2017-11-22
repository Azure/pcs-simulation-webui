// Copyright (c) Microsoft. All rights reserved.

import 'rxjs';
import * as actions from 'actions';
import { SimulationService } from 'services';

/** Kicks off all the events that need to happen on app initialization */
export const initializeApp = action$ => {
  return action$
    .ofType(actions.EPIC_APP_INITIALIZE)
    .flatMap(_ => [
      // Actions to take when the app loads
      actions.loadSimulationStatusEvent(),
      actions.loadSimulationEvent(),
      actions.loadDeviceModelsEvent()
    ]);
};

/** Loads device models */
export const loadDeviceModels = action$ => {
  return action$
    .ofType(actions.EPIC_APP_DEVICE_MODELS_LOAD)
    .flatMap(_ => SimulationService.getDeviceModels())
    .map(({ Items }) => actions.updateReduxDeviceModels({ deviceModels: Items }));
};

/** Listen to route events and emit a route change event when the url changes */
export const detectRouteChange = action$ => {
  return action$
    .ofType(actions.EPIC_APP_ROUTE_EVENT)
    .distinctUntilChanged((a, b) => a.payload === b.payload)
    .map(({ payload }) => actions.routeChangeEvent(payload));
};
