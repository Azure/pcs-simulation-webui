// Copyright (c) Microsoft. All rights reserved.

import { connect } from 'react-redux';
import {
  getSimulationWithDeviceModels,
  getDeviceModels,
  getSimulationIsRunning,
  getSimulationError
} from 'reducers/selectors';
import { Simulation } from './simulation';
import { epics as simulationEpics } from 'reducers/simulationReducer';

// Pass the simulation status
const mapStateToProps = state => ({
  simulation: getSimulationWithDeviceModels(state),
  isRunning: getSimulationIsRunning(state),
  deviceModels: getDeviceModels(state),
  error: getSimulationError(state)
});

// Wrap the dispatch method
const mapDispatchToProps = dispatch => ({
  toggleSimulation: enabled => dispatch(simulationEpics.toggleSimulation.action(enabled)),
  updateSimulation: modelUpdates => dispatch(simulationEpics.updateSimulation.action(modelUpdates))
});

export const SimulationContainer = connect(mapStateToProps, mapDispatchToProps)(Simulation);
