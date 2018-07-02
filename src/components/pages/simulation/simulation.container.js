// Copyright (c) Microsoft. All rights reserved.

import { connect } from 'react-redux';
import { translate } from 'react-i18next';
import {
  getSimulationListWithDeviceModels,
  getSimulationWithDeviceModels,
  getSimulationIsRunning,
  getPreprovisionedIoTHub,
  getPreprovisionedIoTHubInUse,
  getPreprovisionedIoTHubMetricsUrl,
  getSimulationError
} from 'store/selectors';
import { Simulation } from './simulation';
import { epics as appEpics } from 'store/reducers/appReducer';
import { epics as simulationEpics } from 'store/reducers/simulationReducer';
import { getDeviceModels, getEntities } from 'store/reducers/deviceModelsReducer';

// Pass the simulation status
const mapStateToProps = state => ({
  simulationList: getSimulationListWithDeviceModels(state),
  simulation: getSimulationWithDeviceModels(state),
  isRunning: getSimulationIsRunning(state),
  preprovisionedIoTHub: getPreprovisionedIoTHub(state),
  preprovisionedIoTHubInUse: getPreprovisionedIoTHubInUse(state),
  preprovisionedIoTHubMetricsUrl: getPreprovisionedIoTHubMetricsUrl(state),
  deviceModels: getDeviceModels(state),
  deviceModelEntities: getEntities(state),
  error: getSimulationError(state)
});

// Wrap the dispatch method
const mapDispatchToProps = dispatch => ({
  toggleSimulation: enabled => dispatch(simulationEpics.actions.toggleSimulation(enabled)),
  updateSimulation: modelUpdates => dispatch(simulationEpics.actions.updateSimulation(modelUpdates)),
  refresh: () => dispatch(appEpics.actions.initializeApp())
});

export const SimulationContainer = translate()(connect(mapStateToProps, mapDispatchToProps)(Simulation));
