// Copyright (c) Microsoft. All rights reserved.

import { connect } from 'react-redux';
import { Simulation } from './simulation';
import { toggleSimulation, updateSimulation } from 'actions';

// Pass the simulation status
const mapStateToProps = ({ simulation }) => ({ simulation });

// Wrap the dispatch method
const mapDispatchToProps = dispatch => ({
  toggleSimulation: enabled => dispatch(toggleSimulation(enabled)),
  updateSimulation: modelUpdates => dispatch(updateSimulation(modelUpdates))
});

export const SimulationContainer = connect(mapStateToProps, mapDispatchToProps)(Simulation);
