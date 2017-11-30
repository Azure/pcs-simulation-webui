// Copyright (c) Microsoft. All rights reserved.

import 'rxjs';
import { Observable } from 'rxjs';
import { SimulationService } from 'services';
import { getSimulation, getSimulationIsRunning } from 'reducers/selectors';
import { createReducerScenario, createEpicScenario } from 'store/utilities';
import { toSimulationModel, toSimulationStatusModel } from 'services/models';

const initialState = { model: undefined, status: undefined };

// ========================= Reducers - START
const simulationModelReducer = (state, action) => ({ ...state, model: action.payload });
const simulationStatusReducer = (state, action) => ({ ...state, status: action.payload });
const simulationErrorReducer = (state, action) => ({ error: action.payload });

// Extract these scenarios to make them easier to reuse for the clear updates
const updateSimulationModel = { type: 'SIMULATION_UPDATE', reducer: simulationModelReducer };
const updateSimulationStatus = { type: 'SIMULATION_STATUS_UPDATE', reducer: simulationStatusReducer };

export const redux = createReducerScenario({
  // Simulation model reducers
  updateSimulationModel,
  clearSimulationModel: { ...updateSimulationModel, type: 'SIMULATION_CLEAR', payload: toSimulationModel() },
  // Simulation status reducers
  updateSimulationStatus,
  clearSimulationStatus: { ...updateSimulationStatus, type: 'SIMULATION_STATUS_CLEAR', payload: toSimulationStatusModel() },
  // Simulation error reducer
  simulationErrorReducer: { type: 'SIMULATION_ERROR', reducer: simulationErrorReducer }
});

export const reducer = { simulation: redux.getReducer(initialState) };
// ========================= Reducers - END

// ========================= Selectors - START
// TODO: Migrate from selectors
// ========================= Selectors - END

// ========================= Epics - START
const simulationError = error => Observable.of(redux.simulationErrorReducer.action(error.message));

export const epics = {
  /** Loads the simulation */
  fetchSimulation: createEpicScenario({
    type: 'SIMULATION_LOAD',
    epic: () =>
      SimulationService.getSimulation()
        .map(redux.updateSimulationModel.action)
        .startWith(redux.clearSimulationModel.action())
        .catch(simulationError)
  }),

  /** Used to enable or disable the simulation */
  toggleSimulation: createEpicScenario({
    type: 'SIMULATION_TOGGLE',
    epic: ({ payload }, store) => {
      const { eTag } = getSimulation(store.getState());
      return SimulationService.toggleSimulation(eTag, payload)
        .map(redux.updateSimulationModel.action)
        .startWith(redux.clearSimulationModel.action())
        .catch(simulationError);
    }
  }),

  /** Loads the simulation status */
  fetchSimulationStatus: createEpicScenario({
    type: 'APP_SIMULATION_STATUS_LOAD',
    epic: () =>
      SimulationService.getStatus()
        .map(redux.updateSimulationStatus.action)
        .startWith(redux.clearSimulationStatus.action())
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
      if (refreshStatus) store.dispatch(redux.clearSimulationStatus.action());
      return SimulationService.updateSimulation(newModel)
        .flatMap(model => {
          const extraEvents = refreshStatus ? [epics.fetchSimulationStatus.action()] : [];
          return [ ...extraEvents, redux.updateSimulationModel.action(model) ];
        })
        .startWith(redux.clearSimulationModel.action())
        .catch(simulationError);
    }
  })
};
// ========================= Epics - END
