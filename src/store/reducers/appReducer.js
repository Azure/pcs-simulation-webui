// Copyright (c) Microsoft. All rights reserved.

import 'rxjs';
import { Observable } from 'rxjs';
import { SimulationService, DiagnosticsService } from 'services';
import { createAction, createReducerScenario, createEpicScenario } from 'store/utilities';
import {
  epics as simulationEpics,
  redux as simulationRedux
} from './simulationReducer';

// ========================= Reducers - START
const deviceModelReducer = (state, action) => ({ ...state, deviceModels: action.payload });
const deviceModelErrorReducer = (state, action) => ({ ...state, error: action.payload });

export const redux = createReducerScenario({
  updateDeviceModels: { type: 'DEVICE_MODELS_UPDATE', reducer: deviceModelReducer },
  deviceModelsError: { type: 'DEVICE_MODELS_ERROR', reducer: deviceModelErrorReducer }
});

export const reducer = { app: redux.getReducer() };
// ========================= Reducers - END

// ========================= Selectors - START
// TODO: Migrate from selectors
// ========================= Selectors - END

// ========================= Epics - START
export const epics = createEpicScenario({
  /** Kicks off all the events that need to happen on app initialization */
  initializeApp: {
    type: 'APP_INITIALIZE',
    epic: () => [
      simulationRedux.actions.revertToInitial(),
      simulationEpics.actions.fetchSimulationStatus(),
      simulationEpics.actions.fetchSimulation(),
      epics.actions.fetchDeviceModels()
    ]
  },

  /** Log diagnostics data */
  logEvent: {
        type: 'APP_LOG_EVENT',
        epic: ({ payload }) =>
        DiagnosticsService.logEvent(payload)
            .flatMap(_ => Observable.empty())
            .catch(_ => Observable.empty())
  },

  /** Loads the available device models */
  fetchDeviceModels: {
    type: 'APP_DEVICE_MODELS_FETCH',
    epic: () =>
      SimulationService.getDeviceModels()
        .map(redux.actions.updateDeviceModels)
        .catch(({ message }) => Observable.of(redux.actions.deviceModelsError(message)))
  },

  /** Listen to route events and emit a route change event when the url changes */
  detectRouteChange: {
    type: 'APP_ROUTE_EVENT',
    rawEpic: (action$, store, actionType) =>
      action$.ofType(actionType)
        .map(({ payload }) => payload) // Pathname
        .distinctUntilChanged()
        .map(createAction('EPIC_APP_ROUTE_CHANGE'))
  },
});
// ========================= Epics - END
