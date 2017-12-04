// Copyright (c) Microsoft. All rights reserved.

import { connect } from 'react-redux';
import {
  getSimulationWithDeviceModels,
  getDeviceModels,
  getSimulationIsRunning,
  getConnectStringConfig,
  getSimulationError
} from 'store/selectors';
import { Simulation } from './simulation';
import { epics as simulationEpics } from 'store/reducers/simulationReducer';

// Pass the simulation status
const mapStateToProps = state => ({
  simulation: getSimulationWithDeviceModels(state),
  isRunning: getSimulationIsRunning(state),
  connectionStringConfigured: getConnectStringConfig(state),
  deviceModels: getDeviceModels(state),
  error: getSimulationError(state)
});

// Wrap the dispatch method
const mapDispatchToProps = dispatch => ({
  toggleSimulation: enabled => dispatch(simulationEpics.actions.toggleSimulation(enabled)),
  updateSimulation: modelUpdates => dispatch(simulationEpics.actions.updateSimulation(modelUpdates))
});

export const SimulationContainer = connect(mapStateToProps, mapDispatchToProps)(Simulation);
