// Copyright (c) Microsoft. All rights reserved.

import { connect } from 'react-redux';
import {
  getSimulationWithDeviceModels,
  getDeviceModels,
  getSimulationIsRunning
} from 'reducers/selectors';
import { Simulation } from './simulation';
import { toggleSimulationEvent, updateSimulationEvent } from 'actions';

// Pass the simulation status
const mapStateToProps = state => ({
  simulation: getSimulationWithDeviceModels(state),
  isRunning: getSimulationIsRunning(state),
  deviceModels: getDeviceModels(state)
});

// Wrap the dispatch method
const mapDispatchToProps = dispatch => ({
  toggleSimulation: enabled => dispatch(toggleSimulationEvent(enabled)),
  updateSimulation: modelUpdates => dispatch(updateSimulationEvent(modelUpdates))
});

export const SimulationContainer = connect(mapStateToProps, mapDispatchToProps)(Simulation);
