// Copyright (c) Microso;ft. All rights reserved.

import React, { Component } from 'react';
import { NavLink } from "react-router-dom";
import moment from 'moment';
import Config from 'app.config';

import { Btn, PageContent, ContextMenu, SectionHeader } from 'components/shared';
import { NewSimulation } from '../flyouts';
import { svgs } from 'utilities';
import SimulationTile from './simulationTile';
import { SimulationsGrid } from './simulationsGrid';

import './simulationDashboard.css';

const closedFlyoutState = {
  flyoutOpen: false,
  selectedDeviceModelId: undefined
};

const newSimulationFlyout = 'new-simulation';
const dateTimeFormat = Config.dateTimeFormat;

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

  opennewSimulationFlyout = () => this.setState({ flyoutOpen: newSimulationFlyout });

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
      const { t, deviceModelEntities } = this.props;
      return ({
        status: simulation.isRunning ? t('simulation.status.running') : t('simulation.status.stopped'),
        startTime : moment(simulation.startTime).format(dateTimeFormat),
        endTime : moment(simulation.endTime).format(dateTimeFormat),
        duration : moment.duration((moment(simulation.endTime)).diff(moment(simulation.startTime))),
        id : simulation.id,
        name : simulation.name,
        totalMessages: simulation.statistics.totalMessagesCount,
        averageMessages: simulation.statistics.averageMessagesPerSecond,
        deviceModels : (simulation.deviceModels || [])
          .map(dm =>
              (dm.count + ' ' + (deviceModelEntities && deviceModelEntities[dm.id] ? (deviceModelEntities[dm.id]).name : '-')))
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
    const newSimulationFlyoutOpen = this.state.flyoutOpen === newSimulationFlyout;

    const activeSimulationsList = simulationList.filter(sim => sim.isRunning);
    const maxCount = activeSimulationsList.length > 0 ? 6 : 9;
    const pastSimulationsList = simulationList.filter(sim => !sim.isRunning).slice(0, maxCount);
    return [
      <ContextMenu key="context-menu">
        <Btn svg={svgs.plus} onClick={this.opennewSimulationFlyout}>
          { t('simulation.newSim') }
        </Btn>
      </ContextMenu>,
      <PageContent className="simulation-dashboard-container" key="page-content">
        <SectionHeader className="dashboard-header">
          {t('header.simulationsDashboard')}
          <Btn onClick={this.toggleDashboardView}>
            {!this.state.showAll ? t('simulation.showAll') : t('simulation.showDashboard')}
          </Btn>
        </SectionHeader>

        {!this.state.showAll ?
          <div className="simulation-containers">
            <div className="active-simulations">
            {
              activeSimulationsList.map(sim =>
                <NavLink className="simulation-tile-link" to={`/simulation/${sim.id}`} key={sim.id}>
                  <SimulationTile simulation={sim} deviceModelEntities={deviceModelEntities} t={t} />
                </NavLink>
              )
            }
            </div>
            <div className="past-simulations">
            {
                pastSimulationsList.map(sim =>
                <NavLink className="simulation-tile-link" to={`/simulation/${sim.id}`} key={sim.id}>
                  <SimulationTile simulation={sim} deviceModelEntities={deviceModelEntities} t={t} />
                </NavLink>
              )
            }
            </div>
          </div>
          :
          <SimulationsGrid {...gridProps} />
        }
        {
          newSimulationFlyoutOpen &&
          <NewSimulation onClose={this.closeFlyout} {...this.props} />
        }
      </PageContent>
    ];
  }
}
