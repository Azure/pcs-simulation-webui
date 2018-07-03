// Copyright (c) Microsoft. All rights reserved.

import 'rxjs';
import { Observable } from 'rxjs';
import { schema, normalize } from 'normalizr';
import update from 'immutability-helper';
import { SimulationService } from 'services';
import { toSimulationListModel, toSimulationModel, toSimulationStatusModel } from 'services/models';
import { getSimulation, getSimulationIsRunning } from 'store/selectors';
import { createReducerScenario, createEpicScenario } from 'store/utilities';
import { epics as appEpics } from './appReducer';
import diagnosticsEvent from '../logEventUtil';

// Simulation reducer constants
const EMPTY_SIMULATION_LIST = toSimulationListModel();
const EMPTY_SIMULATION = toSimulationModel();
const EMPTY_STATUS = toSimulationStatusModel();
const initialState = {
  model: undefined,
  status: undefined,
  entities: {},
  items: []
};

// ========================= Schemas - START
const simulationSchema = new schema.Entity('simulations');
const simulationsSchema = new schema.Array(simulationSchema);
// ========================= Schemas - END

// ========================= Reducers - START
const simulationListModelReducer = (state, { payload }) => {
  const { entities: { simulations }, result } = normalize(payload, simulationsSchema);
  return update(state, {
    entities: { $set: simulations },
    items: { $set: result }
  });
};
const simulationModelReducer = (state, action) => ({ ...state, model: action.payload });
const simulationStatusReducer = (state, action) => ({ ...state, status: action.payload });
const simulationErrorReducer = (state, action) => ({ error: action.payload });
const initialStateReducer = (state, action) => initialState;

const updateListModel = { type: 'SIMULATION_LIST_UPDATE', reducer: simulationListModelReducer };
const updateModel = { type: 'SIMULATION_UPDATE', reducer: simulationModelReducer };
const updateStatus = { type: 'SIMULATION_STATUS_UPDATE', reducer: simulationStatusReducer };

export const redux = createReducerScenario({
  updateListModel,
  updateModel,
  updateStatus,
  clearListModel: { ...updateModel, type: 'SIMULATION_LIST_CLEAR', staticPayload: EMPTY_SIMULATION_LIST },
  clearModel: { ...updateModel, type: 'SIMULATION_CLEAR', staticPayload: EMPTY_SIMULATION },
  clearStatus: { ...updateStatus, type: 'SIMULATION_STATUS_CLEAR', staticPayload: EMPTY_STATUS },
  registerError: { type: 'SIMULATION_ERROR', reducer: simulationErrorReducer },
  revertToInitial: { type: 'SIMULATION_REVERT_TO_INITIAL', reducer: initialStateReducer }
});

export const reducer = { simulations: redux.getReducer(initialState) , simulation: redux.getReducer(initialState) };
// ========================= Reducers - END

// ========================= Selectors - START
// TODO: Migrate from selectors
// ========================= Selectors - END

// ========================= Epics - START
const simulationError = error => Observable.of(redux.actions.registerError(error.message));

export const epics = createEpicScenario({
  /** Loads the simulation list*/
  fetchSimulationList: {
    type: 'SIMULATION_LIST_FETCH',
    epic: () =>
      SimulationService.getSimulationList()
        .map(redux.actions.updateListModel)
        .startWith(redux.actions.clearListModel())
        .catch(simulationError)
  },

  /** Loads the simulation */
  fetchSimulation: {
    type: 'SIMULATION_FETCH',
    epic: () =>
      SimulationService.getSimulation()
        .map(redux.actions.updateModel)
        .startWith(redux.actions.clearModel())
        .catch(simulationError)
  },

  /** Used to enable or disable the simulation */
  toggleSimulation: {
    type: 'SIMULATION_TOGGLE',
    epic: ({ payload }, store) => {
      const state = store.getState();
      const { eTag } = getSimulation(state);
      const event = diagnosticsEvent('StopSimulation');
      return SimulationService.toggleSimulation(eTag, payload)
        .map(redux.actions.updateModel)
        .startWith(redux.actions.clearModel(), appEpics.actions.logEvent(event, state))
        .catch(simulationError);
    }
  },

  /** Loads the simulation status */
  fetchSimulationStatus: {
    type: 'SIMULATION_STATUS_FETCH',
    epic: () =>
      SimulationService.getStatus()
        .map(redux.actions.updateStatus)
        .startWith(redux.actions.clearStatus())
        .catch(simulationError)
  },

  /** Updates the simulation */
  updateSimulation: {
    type: 'SIMULATION_UPDATE',
    epic: ({ payload }, store) => {
      const state = store.getState();
      const { eTag } = getSimulation(state);
      const isRunning = getSimulationIsRunning(state);
      const newModel = { ...payload, eTag };
      const statusIsOld = !isRunning && newModel.enabled;
      const hasDeviceModels = payload.deviceModels.length > 0;
      const deviceModels = payload.deviceModels.length > 0 ? payload.deviceModels[0] : {};
      const eventProps = {
        DeviceModels: [{
          Id: hasDeviceModels ? deviceModels.id : '',
          Name: hasDeviceModels && deviceModels.defaultDeviceModel ? deviceModels.defaultDeviceModel.name : '',
          Count: hasDeviceModels ? deviceModels.count : 0,
          IsCustomDevice: hasDeviceModels ? deviceModels.isCustomDevice : null,
      }]};
      const event = diagnosticsEvent('StartSimulation', eventProps);
      // Force the simulation status to update if turned off
      return SimulationService.updateSimulation(newModel)
        .flatMap(model => {
          const extraEvents = statusIsOld ? [
            redux.actions.clearStatus(),
            epics.actions.fetchSimulationStatus()
          ] : [];
          return [ ...extraEvents, redux.actions.updateModel(model) ];
        })
        .startWith(redux.actions.clearModel(), appEpics.actions.logEvent(event, state))
        .catch(simulationError);
    }
  }
});
// ========================= Epics - END
