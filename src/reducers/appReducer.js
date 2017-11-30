// Copyright (c) Microsoft. All rights reserved.

import 'rxjs';
import { Observable } from 'rxjs';
import { SimulationService } from 'services';
import { createAction } from 'utilities';
import * as actions from 'actions';
import { createReducerScenario, createEpicScenario } from 'store/utilities';

// ========================= Reducers
const deviceModelReducer = (state, action) => ({ ...state, deviceModels: action.payload });
const deviceModelErrorReducer = (state, action) => ({ ...state, error: action.payload });

export const redux = createReducerScenario({
  updateDeviceModels: { type: 'DEVICE_MODELS_UPDATE', reducer: deviceModelReducer },
  deviceModelsError: { type: 'DEVICE_MODELS_ERROR', reducer: deviceModelErrorReducer }
});

export const reducer = { app: redux.getReducer() };

// ========================= Selectors

// ========================= Epics
export const epics = {
  /** Kicks off all the events that need to happen on app initialization */
  initializeApp: createEpicScenario({
    type: 'APP_INITIALIZE',
    epic: () => [
      // Actions to take when the app loads
      actions.loadSimulationStatusEvent(),
      actions.loadSimulationEvent(),
      epics.loadDeviceModels.action()
    ]
  }),

  /** Loads the available device models */
  loadDeviceModels: createEpicScenario({
    type: 'APP_DEVICE_MODELS_LOAD',
    epic: () =>
      SimulationService.getDeviceModels()
        .map(redux.updateDeviceModels.action)
        .catch(({ message }) => Observable.of(redux.deviceModelsError.action(message)))
  }),

  /** Listen to route events and emit a route change event when the url changes */
  detectRouteChange: createEpicScenario({
    type: 'APP_ROUTE_EVENT',
    rawEpic: (action$, store, actionType) =>
      action$.ofType(actionType)
        .map(({ payload }) => payload)
        .distinctUntilChanged()
        .map(createAction('EPIC_APP_ROUTE_CHANGE'))
  }),
};
