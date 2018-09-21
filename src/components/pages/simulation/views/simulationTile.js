// Copyright (c) Microsoft. All rights reserved.

import React, { Component } from 'react';
import { Subject } from 'rxjs';
import moment from 'moment';

import Config from 'app.config';
import { SectionHeader, Svg } from 'components/shared';
import { svgs } from 'utilities';
import { SimulationService, MetricsService, retryHandler } from 'services';
import { TelemetryChart, chartColorObjects } from './metrics';

import './simulationTile.css';

const {
  simulationStatusPollingInterval,
  telemetryRefreshInterval,
  maxRetryAttempts,
  retryWaitTime,
  dateTimeFormat
} = Config;

const maxDate = '12/31/9999 11:59:59 PM +00:00';

class SimulationTile extends Component {

  constructor() {
    super();

    this.state = {
      isRunning: false,
      pollingError: '',
      metrics:[],
    };

    this.emitter = new Subject();
    this.simulationRefresh$ = new Subject();
    this.telemetryRefresh$ = new Subject();
    this.subscriptions = [];
  }

  componentDidMount() {
    // Initialize state from the most recent status
    const { simulation: { isRunning, id } } = this.props;
    this.setState({ isRunning });

    const simulationId = id;

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

    const getTelemetryStream = _ => MetricsService.fetchIothubMetrics(simulationId)
      .merge(
        this.telemetryRefresh$ // Previous request complete
          .delay(telemetryRefreshInterval) // Wait to refresh
          .flatMap(_ => MetricsService.fetchIothubMetrics(simulationId))
      )
      .retryWhen(retryHandler(maxRetryAttempts, retryWaitTime));

    this.subscriptions.push(
      this.emitter
        .switchMap(getTelemetryStream)
        .subscribe(
          (metrics) => {

            this.setState(
              { metrics },
              () => {
                if (!(this.state.isRunning === false)) {
                  this.telemetryRefresh$.next('r')
                }
              }
            );
          },
          error => this.setState({ pollingError: error })
        )
    );

    // Start polling
    if (isRunning) this.emitter.next(SimulationService.getSimulation(simulationId));
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

  showDeviceCount = (models) => models.map((deviceModelItem, idx) => {
    const { deviceModelEntities } = this.props;
    return (
      <div className="device-model-row" key={ `${deviceModelItem.id}-${idx}` }>
        {deviceModelItem.count} {deviceModelEntities && deviceModelEntities[deviceModelItem.id] ? (deviceModelEntities[deviceModelItem.id]).name : '-'}
      </div>
    )
  })

  getDevices(models, maxRows = 8) {
    return models.length <= maxRows ?
      this.showDeviceCount(models) :
      [
        this.showDeviceCount(models.slice(0, maxRows - 1)),
        <div className="device-model-row" key="extra-devices-row"><strong>{` + ${models.slice(maxRows - 1).length} more`}</strong></div>
      ];
  }

  render() {
    const {
      t,
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

    const { isRunning, metrics } = this.state;

    const className = this.state.isRunning ? 'simulation-tile-container active' : 'simulation-tile-container';
    const startDateTime = moment(startTime).format(dateTimeFormat);
    const scheduledEndTime = (endTime && endTime === maxDate) ? '-' : moment(endTime).format(dateTimeFormat);
    const endDateTime = stopTime ? moment(stopTime).format(dateTimeFormat) : scheduledEndTime;
    return (
      <div className= { className } >
        <div className="tile-header">
          <SectionHeader>{name || id}</SectionHeader>
        </div>
        <div className="time-containers">
          <div className="left-time-container"> {t('simulation.status.created', { startDateTime })} </div>
          <div className="right-time-container">
          {
            this.state.isRunning
              ? [ <Svg path={svgs.running} className="running-icon" key="running-icon" />, t('simulation.status.running') ]
              : t('simulation.status.ended', { endDateTime })
          }
          </div>
        </div>
        <div className="tile-body">
          {this.getActiveDevices()}
          {
            isRunning &&
            <TelemetryChart colors={chartColorObjects} metrics={metrics} />
          }
          <div className="simulation-summary">
            <div className="device-model-rows">
              { this.getDevices(deviceModels) }
            </div>
            <div className="telemetry-container">
              <div className="simulation-status-section">
                <div className="messages-per-second">{isRunning ? this.state.averageMessagesPerSecond : statistics.averageMessagesPerSecond}</div>
                <div className="messages-per-second-desc">{t('simulation.status.averageMessagesPerSec')}</div>
                <div className="total -messages">{t('simulation.status.totalMessagesSentLabel')} {isRunning ? this.state.totalMessagesSent : statistics.totalMessagesSent}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default SimulationTile;
