// Copyright (c) Microsoft. All rights reserved.

import 'rxjs';
import Config from 'app.config';
import { Observable } from 'rxjs';
import { SimulationService } from 'services';
import { toSimulationModel, toSimulationStatusModel, toSimulationRequestModel } from 'services/models';
import { getSimulation, getSimulationIsRunning } from 'store/selectors';
import { createReducerScenario, createEpicScenario } from 'store/utilities';
import { epics as appEpics } from './appReducer';
import diagnosticsEvent from '../logEventUtil';
import moment from 'moment';

// Simulation reducer constants
const SIMULATION_ID = Config.simulationId;
const EMPTY_SIMULATION = toSimulationModel();
const EMPTY_STATUS = toSimulationStatusModel();
const initialState = { model: undefined, status: undefined };

// ========================= Reducers - START
const simulationModelReducer = (state, action) => ({ ...state, model: action.payload });
const simulationStatusReducer = (state, action) => ({ ...state, status: action.payload });
const simulationErrorReducer = (state, action) => ({ error: action.payload });
const initialStateReducer = (state, action) => initialState;

const updateModel = { type: 'SIMULATION_UPDATE', reducer: simulationModelReducer };
const updateStatus = { type: 'SIMULATION_STATUS_UPDATE', reducer: simulationStatusReducer };

export const redux = createReducerScenario({
  updateModel,
  updateStatus,
  clearModel: { ...updateModel, type: 'SIMULATION_CLEAR', staticPayload: EMPTY_SIMULATION },
  clearStatus: { ...updateStatus, type: 'SIMULATION_STATUS_CLEAR', staticPayload: EMPTY_STATUS },
  registerError: { type: 'SIMULATION_ERROR', reducer: simulationErrorReducer },
  revertToInitial: { type: 'SIMULATION_REVERT_TO_INITIAL', reducer: initialStateReducer }
});

export const reducer = { simulation: redux.getReducer(initialState) };
// ========================= Reducers - END

// ========================= Selectors - START
// TODO: Migrate from selectors
// ========================= Selectors - END

// ========================= Epics - START
const simulationError = error => {
  const errorEvent = diagnosticsEvent('SimulationUXError');
  return Observable.of(redux.actions.registerError(error.message))
            .startWith(appEpics.actions.logEvent(errorEvent))};

export const epics = createEpicScenario({
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
      const startTime = state.simulation.model.startTime;
      const endTime = new Date();
      const duration = moment.duration(moment(endTime).diff(moment(startTime)));
      const eventProps = {
          Id: SIMULATION_ID,
          ActualDuration: duration,
          TotalMessages: state.simulation.status.totalMessagesCount,
          TotalFailedMessages: state.simulation.status.failedMessagesCount,
          TotalFailedDeviceConnections: state.simulation.status.failedDeviceConnectionsCount,
          TotalFailedTwinUpdates: state.simulation.status.failedDeviceTwinUpdatesCount
        };

      const event = diagnosticsEvent('StopSimulation', eventProps);
      return SimulationService.toggleSimulation(eTag, payload)
        .map(redux.actions.updateModel)
        .startWith(redux.actions.clearModel(), appEpics.actions.logEvent(event))
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
      const newModelSimulationRequest = toSimulationRequestModel(newModel);
      const startTime = state.simulation.model.startTime;
      const endTime = state.simulation.model.endTime;
      const duration = moment.duration(moment(endTime).diff(moment(startTime)));
      const eventProps = {
        DeviceModels: [{
          Id: hasDeviceModels ? deviceModels.id : '',
          Name: hasDeviceModels && deviceModels.defaultDeviceModel ? deviceModels.defaultDeviceModel.name : '',
          Count: hasDeviceModels ? deviceModels.count : 0,
          Frequency: hasDeviceModels ? deviceModels.interval : '',
          IsCustomDevice: hasDeviceModels ? deviceModels.isCustomDevice : null,
          Sensors: hasDeviceModels ? deviceModels.sensors : {}
        }],

        SimulationDetails: [{
          Id: SIMULATION_ID,
          StartTime: startTime,
          EndTime: newModelSimulationRequest.EndTime,
          IoTHubType: newModelSimulationRequest.IoTHub.ConnectionString===''? 'Preprovisioned': 'Custom',
          duration: duration
        }]
      };

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
        .startWith(redux.actions.clearModel(), appEpics.actions.logEvent(event))
        .catch(simulationError);
    }
  }
});
// ========================= Epics - END
