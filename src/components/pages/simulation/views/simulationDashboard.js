// Copyright (c) Microsoft. All rights reserved.

import React, { Component } from 'react';
import { NavLink } from "react-router-dom";
import moment from 'moment';

import { Btn, PageContent, ContextMenu, SectionHeader } from 'components/shared';
import { NewSimulation } from '../flyouts';
import { svgs } from 'utilities';
import SimulationTile from './simulationTile';

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

  isRunning = (simulation) => {
    const now = moment();
    const startTime = moment(simulation.startTime);
    const endTime = moment(simulation.endTime);

    const isRunning = simulation.enabled
      && (!startTime.isValid() || startTime.isBefore(now))
      && (!endTime.isValid() || endTime.isAfter(now));

    return isRunning;
  }

  render() {
    const { t, simulationList = [], deviceModelEntities } = this.props;
    const newSimulationFlyoutOpen = this.state.flyoutOpen === newDeviceModelFlyout;

    return [
      <ContextMenu key="context-menu">
        <Btn svg={svgs.plus} onClick={this.openNewDeviceModelFlyout}>
          { t('simulation.newSim') }
        </Btn>
      </ContextMenu>,
      <PageContent className="simulation-dashboard-container" key="page-content">
        <SectionHeader className="dashboard-header">{t('header.simulationsDashboard')}</SectionHeader>
        <div className="simulation-containers">
          <div className="active">
            {
              simulationList
                .filter(sim => { return this.isRunning(sim) === true })
                .map(sim =>
                <NavLink to={`/simulation/${sim.id}`} key={`${sim.id}`}>
                  <SimulationTile simulation={sim} deviceModelEntities={deviceModelEntities} t={t} />
                </NavLink>
              )
            }
          </div>
          <div className="past">
            {
              simulationList
                .filter(sim => { return sim.enabled !== true })
                .map(sim =>
                <NavLink to={`/simulation/${sim.id}`} key={`${sim.id}`}>
                  <SimulationTile simulation={sim} deviceModelEntities={deviceModelEntities} t={t} />
                </NavLink>
              )
            }
          </div>
        </div>
        {
          newSimulationFlyoutOpen &&
          <NewSimulation onClose={this.closeFlyout} {...this.props} />
        }
      </PageContent>
    ];
  }
}
