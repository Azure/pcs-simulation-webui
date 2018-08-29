// Copyright (c) Microsoft. All rights reserved.

import { connect } from 'react-redux';
import { translate } from 'react-i18next';
import { Simulation } from './simulation';
import { epics as appEpics } from 'store/reducers/appReducer';
import {
  epics as simulationEpics,
  getSimulationListWithDeviceModels,
  getPreprovisionedIoTHub,
  getSimulationError
} from 'store/reducers/simulationReducer';
import { getDeviceModels, getDeviceModelEntities } from 'store/reducers/deviceModelsReducer';

// Pass the simulation status
const mapStateToProps = state => ({
  simulationList: getSimulationListWithDeviceModels(state),
  deviceModels: getDeviceModels(state),
  deviceModelEntities: getDeviceModelEntities(state),
  preprovisionedIoTHub: getPreprovisionedIoTHub(state),
  error: getSimulationError(state)
});

// Wrap the dispatch method
const mapDispatchToProps = dispatch => ({
  stopSimulation: simulation => dispatch(simulationEpics.actions.stopSimulation(simulation)),
  createSimulation: modelUpdates => dispatch(simulationEpics.actions.createSimulation(modelUpdates)),
  fetchSimulationList: () => dispatch(simulationEpics.actions.fetchSimulationList()),
  refresh: () => dispatch(appEpics.actions.initializeApp())
});

export const SimulationContainer = translate()(connect(mapStateToProps, mapDispatchToProps)(Simulation));
