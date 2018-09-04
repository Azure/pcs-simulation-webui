// Copyright (c) Microsoft. All rights reserved.

import 'rxjs';
import { Observable } from 'rxjs';
import { schema, normalize } from 'normalizr';
import update from 'immutability-helper';
import { createSelector } from 'reselect';
import Config from 'app.config';
import { getDeviceModelEntities } from 'store/reducers/deviceModelsReducer';
import { SimulationService } from 'services';
import { toSimulationListModel, toSimulationModel, toSimulationStatusModel } from 'services/models';
import { createReducerScenario, createEpicScenario } from 'store/utilities';
import { epics as appEpics } from './appReducer';
import diagnosticsEvent from '../logEventUtil';

// Simulation reducer constants
const EMPTY_SIMULATION_LIST = toSimulationListModel();
const EMPTY_SIMULATION = toSimulationModel();
const EMPTY_STATUS = toSimulationStatusModel();
const initialState = {
  entities: {},
  items: [],
  status: undefined,
  errors: {}
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

const updateSimulationModelReducer = (state, { payload }) => {
  return update(state, {
    entities: {[payload.id]: {$set: payload}}
  });
};

const simulationStatusReducer = (state, action) => ({ ...state, status: action.payload });
const simulationErrorReducer = (state, action) => ({ error: action.payload });
const initialStateReducer = (state, action) => initialState;

const updateListModel = { type: 'SIMULATION_LIST_UPDATE', reducer: simulationListModelReducer };
const updateModel = { type: 'SIMULATION_UPDATE', reducer: updateSimulationModelReducer };
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

export const reducer = { simulations: redux.getReducer(initialState) };
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
    epic: (fromAction) =>
      SimulationService.getSimulationList()
        .map(redux.actions.updateListModel)
        .catch(simulationError)
  },

  /** Loads the simulation */
  fetchSimulation: {
    type: 'SIMULATION_FETCH',
    epic: ({ id }) =>
      SimulationService.getSimulation(id)
        .map(redux.actions.updateModel)
        .startWith(redux.actions.clearModel())
        .catch(simulationError)
  },

  /** Used to disable the simulation */
  stopSimulation: {
    type: 'SIMULATION_STOP',
    epic: ({ payload }, store) => {
      const state = store.getState();
      const event = diagnosticsEvent('StopSimulation');
      return SimulationService.stopSimulation(payload, false)
        .map(redux.actions.updateModel)
        .startWith(appEpics.actions.logEvent(event, state))
        .catch(simulationError);
    }
  },

  /** Loads the simulation sevice status */
  fetchSimulationStatus: {
    type: 'SIMULATION_STATUS_FETCH',
    epic: () =>
      SimulationService.getStatus()
        .map(redux.actions.updateStatus)
        .startWith(redux.actions.clearStatus())
        .catch(simulationError)
  },

  /** Updates the simulation */
  createSimulation: {
    type: 'SIMULATION_CREATE',
    epic: ({ payload }, store) => {
      const state = store.getState();
      const hasDeviceModels = payload.deviceModels.length > 0;
      const deviceModels = payload.deviceModels.length > 0 ? payload.deviceModels[0] : {};
      const eventProps = {
        DeviceModels: [{
          Id: hasDeviceModels ? deviceModels.id : '',
          Name: hasDeviceModels && deviceModels.defaultDeviceModel ? deviceModels.defaultDeviceModel.name : '',
          Count: hasDeviceModels ? deviceModels.count : 0,
          IsCustomDevice: hasDeviceModels ? deviceModels.isCustomDevice : null,
        }]
      };
      const event = diagnosticsEvent('StartSimulation', eventProps);
      return SimulationService.createSimulation(payload)
        .startWith(redux.actions.clearModel(), appEpics.actions.logEvent(event, state))
        .catch(simulationError);
    }
  }
});
// ========================= Epics - END

// ========================= Selectors - START
export const getSimulationListReduer = state => state.simulations;
export const getEntities = state => getSimulationListReduer(state).entities;
export const getItems = state => getSimulationListReduer(state).items;
export const getSimulationStatus = state => getSimulationListReduer(state).status;
export const getSimulationError = state => getSimulationListReduer(state).error;
export const getSimulations = createSelector(
  getEntities, getItems,
  (entities, items = []) => items.map(id => entities[id])
);

export const getPreprovisionedIoTHub = createSelector(
  getSimulationStatus,
  status => !status ? undefined : status.preprovisionedIoTHub
);

export const getSimulationListWithDeviceModels = createSelector(
  [getSimulations, getDeviceModelEntities],
  (simulations = [], deviceModelsMap) => simulations.map(simulationModel => {

    const modelId = ((simulationModel.deviceModels || [])[0] || {}).id;
    const name = modelId === Config.customSensorValue
      ? 'Custom'
      : (deviceModelsMap[modelId] || {}).name;
    const deviceModels = (simulationModel.deviceModels || [])
      .map(model => ({ ...model, name }));
    return { ...simulationModel, deviceModels };
  })
);
// ========================= Selectors - END
