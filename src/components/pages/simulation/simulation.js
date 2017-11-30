// Copyright (c) Microsoft. All rights reserved.

import React, { Component } from 'react';

import SimulationDetails from './views/simulationDetails';
import SimulationForm from './views/simulationForm';
import { FormActions, Indicator, ErrorMsg } from 'components/shared';

import './simulation.css';

const Header = (props) => (
  <div className="page-header">{props.children}</div>
);

/**
 * TODO: Add the real component. Currently being used as a test bed for the
 * shared controls.
 */
export class Simulation extends Component {

  apply = (event) => {
    event.preventDefault();
    this.props.toggleSimulation(!this.props.enabled);
  };

  getView() {
    const { simulation, isRunning, error } = this.props;
    const { enabled } = simulation;
    const isLoading = typeof enabled === 'undefined' || typeof isRunning === 'undefined';
    if (error) {
      return (<FormActions><ErrorMsg>{error}</ErrorMsg></FormActions>);
    } else if (isRunning === true && enabled === true) {
      return <SimulationDetails {...this.props} />;
    } else if ((isRunning === false && !isLoading) || (isRunning === true && enabled === false)) {
      return <SimulationForm {...this.props} />;
    } else {
      return <FormActions><Indicator pattern="bar" /></FormActions>
    }
  }

  render () {
    return (
      <div className="simulation-container">
        <Header>Simulation setup</Header>
        { this.getView() }
      </div>
    );
  }
}
