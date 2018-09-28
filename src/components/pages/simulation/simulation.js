// Copyright (c) Microsoft. All rights reserved.

import React, { Component } from 'react';
import { Route, Switch } from 'react-router-dom';
import SimulationDetails from './views/simulationDetails';
import { SimulationDashboard } from './views/simulationDashboard';
import { FormActions, Indicator, ErrorMsg, Btn } from 'components/shared';

import './simulation.css';

/**
 * TODO: Add the real component. Currently being used as a test bed for the
 * shared controls.
 */
export class Simulation extends Component {

  componentDidMount() {
  // Load the simulation list
  if ((this.props.simulationList || []).length === 0) this.props.fetchSimulationList();
  }

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
    } else if (isLoading) {
      return <FormActions><Indicator pattern="bar" /></FormActions>;
    } else {
      return <SimulationDashboard {...this.props} />;
    }
  }

  render () {
    return (
      <div className="simulation-container">
        <Switch>
          <Route exact path={'/simulation'}
            render={ (routeProps) => <SimulationDashboard {...routeProps} {...this.props} /> } />
          <Route path={'/simulation/:id/:modelId?'}
            render={ (routeProps) => <SimulationDetails {...routeProps} {...this.props} /> } />
        </Switch>
      </div>
    );
  }
}
