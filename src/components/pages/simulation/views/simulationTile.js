// Copyright (c) Microsoft. All rights reserved.

import React, { Component } from 'react';
import { Subject } from 'rxjs';
import moment from 'moment';

import Config from 'app.config';
import { SectionHeader } from 'components/shared';
import { SimulationService, retryHandler } from 'services';

import './simulationTile.css';


const {
  simulationStatusPollingInterval,
  maxRetryAttempts,
  retryWaitTime,
  dateTimeFormat
} = Config;

class SimulationTile extends Component {

  constructor() {
    super();

    this.state = {
      isRunning: true,
      pollingError: ''
    };

    this.emitter = new Subject();
    this.simulationRefresh$ = new Subject();
    this.subscriptions = [];
  }

  componentDidMount() {
    // Initialize state from the most recent status
    this.setState({
      isRunning: this.props.isRunning
    });

    const simulationId = this.props.simulation.id;

    const getSimulationStream = _ => SimulationService.getSimulation(simulationId)
      .merge(
        this.simulationRefresh$
          .delay(simulationStatusPollingInterval)
          .flatMap(_ => SimulationService.getSimulation(simulationId))
      )
      .retryWhen(retryHandler(maxRetryAttempts, retryWaitTime));

    this.subscriptions.push(this.emitter
      .switchMap(getSimulationStream)
      .subscribe(
         response => {
          this.setState({
            simulation: response,
            isRunning: response.isRunning,
            totalMessagesSent: response.statistics.totalMessagesSent,
            failedMessagesCount: response.statistics.failedMessagesCount,
            activeDevicesCount: response.statistics.activeDevicesCount,
            averageMessagesPerSecond: response.statistics.averageMessagesPerSecond,
            failedDeviceConnectionsCount: response.statistics.failedDeviceConnectionsCount,
            failedDeviceTwinUpdatesCount: response.statistics.failedDeviceTwinUpdatesCount
          },
          () => {
            if (response.isRunning) {
              this.simulationRefresh$.next({ simulationId: response.id });
            }
          });
        },
        pollingError => this.setState({ pollingError: pollingError.message })
      )
    );

    // Start polling
    this.emitter.next(SimulationService.getSimulation(simulationId));
  }

  componentWillUnmount() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  getActiveDevices() {
    const { t } = this.props;

    if (this.state.isRunning) {
      return (
        <div className="active-devices">
          <div className="active-devices-count"> {this.state.activeDevicesCount} </div>
          <div className="active-devices-label"> {t('simulation.status.activeDevicesCount')}</div>
        </div>
      );
    }
  }

  render() {
    const {
      t,
      deviceModelEntities = {},
      simulation: {
        deviceModels,
        id,
        name,
        startTime,
        endTime,
        stopTime,
        statistics
      }
    } = this.props;

    const className = this.state.isRunning ? 'simulation-tile-container active' : 'simulation-tile-container';
    const startDateTime = moment(startTime).format(dateTimeFormat);
    const endDateTime = stopTime ? moment(stopTime).format(dateTimeFormat) : moment(endTime).format(dateTimeFormat);
    return (
      <div className= { className } >
        <div className="tile-header">
          <SectionHeader>{name || id}</SectionHeader>
        </div>
        <div className="time-containers">
          <div className="left time-container"> {t('simulation.status.created', { startDateTime })} </div>
          <div className="right time-container"> {
            this.state.isRunning
              ? t('simulation.status.running')
              : t('simulation.status.ended', { endDateTime })}
          </div>
        </div>
        <div className="tile-body">
          {this.getActiveDevices()}
          {
            this.state.isRunning &&
            <div className="chart-div"></div>
          }
          <div className="simulation-summary">
            <div className="device-model-rows">
              {
                deviceModels.map(deviceModelItem =>
                  <div className="device-model-row" key={ `${id}-${deviceModelItem.id}` }>
                    {deviceModelItem.count} {deviceModelEntities && deviceModelEntities[deviceModelItem.id] ? (deviceModelEntities[deviceModelItem.id]).name : '-'}
                  </div>
                )
              }
            </div>
            <div className="telemetry-container">
              <div className="simulation-status-section right">
                <div className="messages-per-second">{this.state.isRunning ? this.state.averageMessagesPerSecond : statistics.averageMessagesPerSecond}</div>
                <div className="messages-per-second-desc">{t('simulation.status.averageMessagesPerSec')}</div>
                <div className="total -messages">{t('simulation.status.totalMessagesSentLabel')} {this.state.isRunning ? this.state.totalMessagesSent : statistics.totalMessagesSent}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default SimulationTile;
