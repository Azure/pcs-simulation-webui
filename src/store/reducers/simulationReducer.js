// Copyright (c) Microsoft. All rights reserved.

import 'rxjs';
import { Observable } from 'rxjs';
import { SimulationService } from 'services';
import { toSimulationModel, toSimulationStatusModel } from 'services/models';
import { getSimulation, getSimulationIsRunning } from 'store/selectors';
import { createReducerScenario, createEpicScenario } from 'store/utilities';

// Simulation reducer constants
const EMPTY_SIMULATION = toSimulationModel();
const EMPTY_STATUS = toSimulationStatusModel();
const initialState = { model: undefined, status: undefined };

// ========================= Reducers - START
const simulationModelReducer = (state, action) => ({ ...state, model: action.payload });
const simulationStatusReducer = (state, action) => ({ ...state, status: action.payload });
const simulationErrorReducer = (state, action) => ({ error: action.payload });

const updateModel = { type: 'SIMULATION_UPDATE', reducer: simulationModelReducer };
const updateStatus = { type: 'SIMULATION_STATUS_UPDATE', reducer: simulationStatusReducer };

export const redux = createReducerScenario({
  updateModel,
  updateStatus,
  clearModel: { ...updateModel, type: 'SIMULATION_CLEAR', staticPayload: EMPTY_SIMULATION },
  clearStatus: { ...updateStatus, type: 'SIMULATION_STATUS_CLEAR', staticPayload: EMPTY_STATUS },
  registerError: { type: 'SIMULATION_ERROR', reducer: simulationErrorReducer }
});

export const reducer = { simulation: redux.getReducer(initialState) };
// ========================= Reducers - END

// ========================= Selectors - START
// TODO: Migrate from selectors
// ========================= Selectors - END

// ========================= Epics - START
const simulationError = error => Observable.of(redux.registerError.action(error.message));

export const epics = {
  /** Loads the simulation */
  fetchSimulation: createEpicScenario({
    type: 'SIMULATION_FETCH',
    epic: () =>
      SimulationService.getSimulation()
        .map(redux.updateModel.action)
        .startWith(redux.clearModel.action())
        .catch(simulationError)
  }),

  /** Used to enable or disable the simulation */
  toggleSimulation: createEpicScenario({
    type: 'SIMULATION_TOGGLE',
    epic: ({ payload }, store) => {
      const { eTag } = getSimulation(store.getState());
      return SimulationService.toggleSimulation(eTag, payload)
        .map(redux.updateModel.action)
        .startWith(redux.clearModel.action())
        .catch(simulationError);
    }
  }),

  /** Loads the simulation status */
  fetchSimulationStatus: createEpicScenario({
    type: 'SIMULATION_STATUS_FETCH',
    epic: () =>
      SimulationService.getStatus()
        .map(redux.updateStatus.action)
        .startWith(redux.clearStatus.action())
        .catch(simulationError)
  }),

  /** Updates the simulation */
  updateSimulation: createEpicScenario({
    type: 'SIMULATION_UPDATE',
    epic: ({ payload }, store) => {
      const state = store.getState();
      const { eTag } = getSimulation(state);
      const isRunning = getSimulationIsRunning(state);
      const newModel = { ...payload, eTag };
      const refreshStatus = !isRunning && newModel.enabled;
      // Force the simulation status to update if turned off
      if (refreshStatus) store.dispatch(redux.clearStatus.action());
      return SimulationService.updateSimulation(newModel)
        .flatMap(model => {
          const extraEvents = refreshStatus ? [epics.fetchSimulationStatus.action()] : [];
          return [ ...extraEvents, redux.updateModel.action(model) ];
        })
        .startWith(redux.clearModel.action())
        .catch(simulationError);
    }
  })
};
// ========================= Epics - END
