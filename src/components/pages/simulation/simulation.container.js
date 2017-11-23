// Copyright (c) Microsoft. All rights reserved.

import { connect } from 'react-redux';
import { getSimulation, getDeviceModels, getDuration } from 'reducers';
import { Simulation } from './simulation';
import { toggleSimulationEvent, updateSimulationEvent } from 'actions';

// Pass the simulation status
const mapStateToProps = state => ({
  simulation: getSimulation(state),
  deviceModels: getDeviceModels(state),
  duration: getDuration(state)
});

// Wrap the dispatch method
const mapDispatchToProps = dispatch => ({
  toggleSimulation: enabled => dispatch(toggleSimulationEvent(enabled)),
  updateSimulation: modelUpdates => dispatch(updateSimulationEvent(modelUpdates))
});

export const SimulationContainer = connect(mapStateToProps, mapDispatchToProps)(Simulation);
