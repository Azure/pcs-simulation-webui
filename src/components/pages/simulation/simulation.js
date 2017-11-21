// Copyright (c) Microsoft. All rights reserved.

import React, { Component } from 'react';

import { svgs } from 'utilities';
import {
  FormActions,
  Btn,
  BtnToolbar
} from 'components/shared';
import { SimulationService as Service } from 'services';

import './simulation.css';

const Header = (props) => (
  <div className="page-header">{props.children}</div>
);

/**
 * TODO: Add the real component. Currently being used as a test bed for the
 * shared controls .
 */
export class Simulation extends Component {

  constructor(props) {
    super(props);

    this.state = {};
  }

  componentDidMount() {
    Service.getSimulation()
      .map(({ response }) => response)
      .subscribe(this.updateState);
  }

  apply = (event) => {
    const { ETag, Enabled } = this.state;
    this.setState({ ETag: undefined, Enabled: undefined });
    Service.toggleSimulation(ETag, !Enabled)
      .map(({ response }) => response)
      .subscribe(this.updateState);
    event.preventDefault();
  };

  updateState = ({ ETag, Enabled }) => {
    this.setState({ ETag, Enabled });
  }

  render () {
    const { ETag, Enabled } = this.state;
    const isLoading = ETag === undefined;
    let label = 'Loading...';
    if (!isLoading) {
      label = `${Enabled ? 'Stop' : 'Start'} Simulation`;
    }
    return (
      <div className="simulation-container">
        <Header>Start/Stop Simulation</Header>
        <form onSubmit={this.apply}>
          <FormActions>
            <BtnToolbar>
              <Btn
                svg={Enabled ? svgs.stopSimulation : svgs.startSimulation}
                type="submit"
                className="apply-btn"
                disabled={isLoading}>
                  {label}
              </Btn>
            </BtnToolbar>
          </FormActions>
        </form>
      </div>
    );
  }
}
