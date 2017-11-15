// Copyright (c) Microsoft. All rights reserved.

import React, { Component } from 'react';

import SimulationDetails from './views/simulationDetails';
import SimulationForm from './views/simulationForm';
import { FormActions, Indicator } from 'components/shared';

import './simulation.css';

const Header = (props) => (
  <div className="page-header">{props.children}</div>
);

const options = [
  { value: 'Chiller', label: 'Chiller', className: 'custom-option' },
  { value: 'Custom', label: 'Custom', className: 'custom-option' },
  { value: 'Elevator', label: 'Elevator', className: 'custom-option' },
  { value: 'JSON', label: 'JSON', className: 'custom-option' },
  { value: 'Truck', label: 'Truck', className: 'custom-option' }
]

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
    const { enabled, error, status } = this.props.simulation;
    if (status && status !== 'off') {
      if (error) {
        return (<FormActions>{error}</FormActions>);
      } else if (enabled === true) {
        return <SimulationDetails {...this.props} />
      } else if (enabled === false) {
        return <SimulationForm {...this.props} />
      }
    } else if (status && status === 'off') {
      return (<FormActions>No simulation running</FormActions>);
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
