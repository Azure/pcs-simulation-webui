// Copyright (c) Microsoft. All rights reserved.

import 'rxjs';
import { Observable } from 'rxjs';
import { schema, normalize } from 'normalizr';
import update from 'immutability-helper';
import { createSelector } from 'reselect';
import { DeviceModelsService } from 'services';
import { toSimulationModel, toSimulationStatusModel } from 'services/models';
import { createReducerScenario, createEpicScenario } from 'store/utilities';
import { epics as appEpics } from './appReducer';
import diagnosticsEvent from '../logEventUtil';

// Device models reducer constants
const initialState = { entities: {}, items: [] };

// ========================= Schemas - START
const deviceModelSchema = new schema.Entity('deviceModels');
const deviceModelsSchema = new schema.Array(deviceModelSchema);
// ========================= Schemas - END

// ========================= Reducers - START
const updateDeviceModelsReducer = (state, { payload }) => {
  const { entities: { deviceModels }, result } = normalize(payload, deviceModelsSchema);
  return update(state, {
    entities: { $set: deviceModels },
    items: { $set: result }
  });
};
const createDeviceModelReducer = (state, { payload }) => {
  const { entities: { deviceModels }, result } = normalize([payload], deviceModelsSchema);
  return update(state, {
    entities: { $merge: deviceModels },
    items: { $splice: [[state.items.length, 0, result]] }
  });
};
const deleteDeviceModelReducer = (state, { payload }) => {
  const itemIdx = state.items.indexOf(payload);
  return update(state, {
    entities: { $unset: [payload] },
    items: { $splice: [[itemIdx, 1]] }
  });
};
const deviceModelsErrorReducer = (state, action) => ({ error: action.payload });
const initialStateReducer = (state, action) => initialState;


export const redux = createReducerScenario({
  updateDeviceModels: { type: 'DEVICE_MODELS_UPDATE', reducer: updateDeviceModelsReducer },
  createDeviceModel: { type: 'CREATE_DEVICE_MODEL', reducer: createDeviceModelReducer },
  deleteDeviceModel: { type: 'CREATE_DEVICE_MODEL', reducer: deleteDeviceModelReducer },
  deviceModelsError: { type: 'DEVICE_MODELS_ERROR', reducer: deviceModelsErrorReducer },
});

export const reducer = { deviceModels: redux.getReducer(initialState) };
// ========================= Reducers - END

// ========================= Selectors - START
export const getDeviceModelsReducer = state => state.deviceModels;
export const getEntities = state => getDeviceModelsReducer(state).entities;
export const getItems = state => getDeviceModelsReducer(state).items;
export const getDeviceModels = createSelector(
  getEntities, getItems,
  (entities, items) => items.map(id => entities[id])
);
// ========================= Selectors - END

// ========================= Epics - START

export const epics = createEpicScenario({
  /** Loads the list of device models */
  fetchDeviceModels: {
    type: 'DEVICE_MODELS_FETCH',
    epic: () =>
      DeviceModelsService.getDeviceModels()
        .map(redux.actions.updateDeviceModels)
        .catch(({ message }) => Observable.of(redux.actions.deviceModelsError(message)))
  },

  /** Create a device model */
  createDeviceModel: {
    type: 'DEVICE_MODEL_INSERT',
    epic: ({ payload }) =>
      DeviceModelsService.createDeviceModel(payload)
        .map(redux.actions.createDeviceModel)
        .catch(({ message }) => Observable.of(redux.actions.deviceModelsError(message)))
  },

  /** Delete a device model */
  deleteDeviceModel: {
    type: 'DEVICE_MODEL_DELETE',
    epic: ({ payload }) =>
      DeviceModelsService.deleteDeviceModelById(payload)
        .map(redux.actions.deleteDeviceModel)
        .catch(({ message }) => Observable.of(redux.actions.deviceModelsError(message)))
  }
});
// ========================= Epics - END
