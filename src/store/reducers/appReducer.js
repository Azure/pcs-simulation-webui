// Copyright (c) Microsoft. All rights reserved.

import 'rxjs';
import { Observable } from 'rxjs';
import { SimulationService } from 'services';
import { createAction, createReducerScenario, createEpicScenario } from 'store/utilities';
import { epics as simulationEpics } from './simulationReducer';

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
export const epics = {
  /** Kicks off all the events that need to happen on app initialization */
  initializeApp: createEpicScenario({
    type: 'APP_INITIALIZE',
    epic: () => [
      simulationEpics.fetchSimulationStatus.action(),
      simulationEpics.fetchSimulation.action(),
      epics.fetchDeviceModels.action()
    ]
  }),

  /** Loads the available device models */
  fetchDeviceModels: createEpicScenario({
    type: 'APP_DEVICE_MODELS_FETCH',
    epic: () =>
      SimulationService.getDeviceModels()
        .map(redux.actions.updateDeviceModels)
        .catch(({ message }) => Observable.of(redux.actions.deviceModelsError(message)))
  }),

  /** Listen to route events and emit a route change event when the url changes */
  detectRouteChange: createEpicScenario({
    type: 'APP_ROUTE_EVENT',
    rawEpic: (action$, store, actionType) =>
      action$.ofType(actionType)
        .map(({ payload }) => payload) // Pathname
        .distinctUntilChanged()
        .map(createAction('EPIC_APP_ROUTE_CHANGE'))
  }),
};
// ========================= Epics - END
