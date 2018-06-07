// Copyright (c) Microsoft. All rights reserved.

import React, { Component } from 'react';
import SimulationDetails from './views/simulationDetails';
import { SimulationDashboard } from './views/simulationDashboard';
import { FormActions, Indicator, ErrorMsg, Btn } from 'components/shared';

import './simulation.css';

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
    const { t, simulation: { enabled }, isRunning, error, refresh } = this.props;
    const isLoading = typeof enabled === 'undefined' || typeof isRunning === 'undefined';
    if (error) {
      return (
        <FormActions>
          <ErrorMsg>
            {error}
          </ErrorMsg>
          <br />
            <Btn onClick={refresh}>
              { t('common.ok') }
            </Btn>
        </FormActions>
      );
    } else if (isRunning === true && enabled === true) {
      return <SimulationDetails {...this.props} />;
    } else if (isLoading) {
      return <FormActions><Indicator pattern="bar" /></FormActions>;
    } else {
      return <SimulationDashboard {...this.props} />;
    }
  }

  render () {
    return (
      <div className="simulation-container">
        { this.getView() }
      </div>
    );
  }
}
