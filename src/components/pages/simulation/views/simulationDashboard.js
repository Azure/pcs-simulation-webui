// Copyright (c) Microso;ft. All rights reserved.

import React, { Component } from 'react';
import { NavLink } from "react-router-dom";
import moment from 'moment';

import { Btn, PageContent, ContextMenu, SectionHeader } from 'components/shared';
import { NewSimulation } from '../flyouts';
import { svgs } from 'utilities';
import SimulationTile from './simulationTile';
import { SimulationsGrid } from './simulationsGrid';

const closedFlyoutState = {
  flyoutOpen: false,
  selectedDeviceModelId: undefined
};

const newDeviceModelFlyout = 'new-device-model';
const dateTimeFormat = "DD/MM/YY hh:mm:ss A";

export class SimulationDashboard extends Component {

  constructor(props) {
    super(props);
    this.state = {
      ...closedFlyoutState,
      showAll: false,
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

  toggleDashboardView = contextBtns => this.setState({
    contextBtns,
    showAll: !this.state.showAll
  });

  getSoftSelectId = ({ id }) => id;

  toSimulationGridModel = (input = {}) => (input || []).map(
    (simulation = {}) => {
      const { deviceModelEntities } = this.props;
      return ({
        status : this.isRunning (simulation) ? "running" : "stopped",
        startTime : moment (simulation.startTime).format (dateTimeFormat),
        endTime : moment (simulation.endTime).format (dateTimeFormat),
        duration : moment.duration ((moment (simulation.endTime)).diff (moment (simulation.startTime))),
        id : simulation.id,
        name : simulation.name,
        totalMessages : simulation.totalMessages,
        averageMessages : simulation.averageMessages,
        deviceModels : (simulation.deviceModels || [])
          .map (dm => (dm.count +
            " " +
            (deviceModelEntities && deviceModelEntities[dm.id] ? (deviceModelEntities[dm.id]).name : '-')))
          .join ('; '),
        totalDevices : (simulation.deviceModels || []).reduce ((total, obj) => { return total + obj['count']; }, 0)
      });
    }
  );

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
    const gridProps = {
      rowData: this.toSimulationGridModel(simulationList || []),
      t
    };
    const newSimulationFlyoutOpen = this.state.flyoutOpen === newDeviceModelFlyout;

    return [
      <ContextMenu key="context-menu">
        <Btn svg={svgs.plus} onClick={this.openNewDeviceModelFlyout}>
          { t('simulation.newSim') }
        </Btn>
      </ContextMenu>,
      <PageContent className="simulation-dashboard-container" key="page-content">
        <SectionHeader className="dashboard-header">{t('header.simulationsDashboard')}</SectionHeader>
        {!this.state.showAll ?
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
                  .filter(sim => { return this.isRunning(sim) === false })
                  .map(sim =>
                  <NavLink to={`/simulation/${sim.id}`} key={`${sim.id}`}>
                    <SimulationTile simulation={sim} deviceModelEntities={deviceModelEntities} t={t} />
                  </NavLink>
                )
              }
            </div>
          </div>
          :
          <SimulationsGrid {...gridProps} />
        }
        <Btn onClick={this.toggleDashboardView}>
          { !this.state.showAll ? t('simulation.showAll') : t('simulation.showDashboard') }
        </Btn>
        {
          newSimulationFlyoutOpen &&
          <NewSimulation onClose={this.closeFlyout} {...this.props} />
        }
      </PageContent>
    ];
  }
}
