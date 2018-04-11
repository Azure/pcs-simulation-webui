// Copyright (c) Microsoft. All rights reserved.

import { connect } from 'react-redux';
import { translate } from 'react-i18next';
import {
  getSimulationWithDeviceModels,
  getDeviceModels,
  getSimulationIsRunning,
  getPreprovisionedIoTHub,
  getPreprovisionedIoTHubInUse,
  getPreprovisionedIoTHubMetricsUrl,
  getSimulationError
} from 'store/selectors';
import { DeviceModels } from './deviceModels';
import { epics as appEpics } from 'store/reducers/appReducer';
// import { epics as simulationEpics } from 'store/reducers/simulationReducer';

// Pass the simulation status
const mapStateToProps = state => ({
  // simulation: getSimulationWithDeviceModels(state),
  isRunning: getSimulationIsRunning(state),
  // preprovisionedIoTHub: getPreprovisionedIoTHub(state),
  // preprovisionedIoTHubInUse: getPreprovisionedIoTHubInUse(state),
  // preprovisionedIoTHubMetricsUrl: getPreprovisionedIoTHubMetricsUrl(state),
  deviceModels: getDeviceModels(state),
  // error: getSimulationError(state)
});

// Wrap the dispatch method
const mapDispatchToProps = dispatch => ({
  // toggleSimulation: enabled => dispatch(simulationEpics.actions.toggleSimulation(enabled)),
  // updateSimulation: modelUpdates => dispatch(simulationEpics.actions.updateSimulation(modelUpdates)),
  refresh: () => dispatch(appEpics.actions.initializeApp())
});

export const DeviceModelsContainer = translate()(connect(mapStateToProps, mapDispatchToProps)(DeviceModels));
