// Copyright (c) Microsoft. All rights reserved.

import React, { Component } from 'react';
import { NavLink } from "react-router-dom";
import { Btn, PageContent, ContextMenu } from 'components/shared';
import { NewSimulation } from '../flyouts';
import { svgs } from 'utilities';

const closedFlyoutState = {
  flyoutOpen: false,
  selectedDeviceModelId: undefined
};

const newDeviceModelFlyout = 'new-device-model';

export class SimulationDashboard extends Component {

  constructor(props) {
    super(props);
    this.state = {
      ...closedFlyoutState,
      contextBtns: null
    };
  }

  openFlyout = (flyoutName) => () => this.setState({ openFlyoutName: flyoutName });

  closeFlyout = () => this.setState(closedFlyoutState);

  openNewDeviceModelFlyout = () => this.setState({ flyoutOpen: newDeviceModelFlyout });

  onSoftSelectChange = ({ id }) => this.setState({
    flyoutOpen: true,
    selectedDeviceModelId: id
  });

  onContextMenuChange = contextBtns => this.setState({
    contextBtns,
    flyoutOpen: false
  });

  getSoftSelectId = ({ id }) => id;

  render() {
    const { t, simulation } = this.props;

    const newSimulationFlyoutOpen = this.state.flyoutOpen === newDeviceModelFlyout;

    return [
      <ContextMenu key="context-menu">
        <Btn svg={svgs.plus} onClick={this.openNewDeviceModelFlyout}>
          { t('simulation.newSim') }
        </Btn>
      </ContextMenu>,
      <PageContent className="devicemodels-container" key="page-content">
        {
          [simulation].map(sim =>
            <NavLink to={`/simulation/${sim.id}`} key={`${sim.id}`}>
              <pre>
                {JSON.stringify(this.props.simulation, null, 2)}
              </pre>
            </NavLink>
          )
        }
        {
          newSimulationFlyoutOpen &&
          <NewSimulation onClose={this.closeFlyout} {...this.props} />
        }
      </PageContent>
    ];
  }
}
