// Copyright (c) Microsoft. All rights reserved.

import React, { Component } from 'react';
import { Subject, Observable } from 'rxjs';
import moment from 'moment';

import Config from 'app.config';
import { SectionHeader } from 'components/shared';
import { SimulationService } from 'services';

import './simulationTile.css';

const pollingInterval = Config.simulationStatusPollingInterval;
const dateTimeFormat = Config.dateFormat;

class SimulationTile extends Component {

  constructor() {
    super();

    this.state = {
      isRunning: true,
      pollingError: ''
    };

    this.emitter = new Subject();
  }

  componentDidMount() {
    // Initialize state from the most recent status
    this.setState({
      isRunning: this.props.isRunning
    });

    const simulationId = this.props.simulation.id;

    this.pollingSubscriber = SimulationService.getSimulation(simulationId)
      .subscribe(
        simulation => {
          if (simulation.isRunning) {
            this.emitter.next(
              Observable.of('poll')
                .delay(pollingInterval)
                .flatMap(() => SimulationService.getSimulation(simulationId))
            );
          }
          this.setState({
            isRunning: simulation.isRunning,
            totalMessagesCount: simulation.statistics.totalMessagesCount,
            activeDevicesCount: simulation.statistics.activeDevicesCount,
            averageMessagesPerSecond: simulation.statistics.averageMessagesPerSecond
          });
        },
        pollingError => this.setState({ pollingError })
      );

    // Start polling
    this.emitter.next(SimulationService.getSimulation(simulationId));
  }

  componentWillUnmount() {
    this.pollingSubscriber.unsubscribe();
  }

  getActiveDevices() {
    const { t } = this.props;

    if (this.state.isRunning) {
      return (
        <div className='active-devices'>
          <div className='active-devices-count'> {this.state.activeDevicesCount} </div>
          <div className='active-devices-label'> {t('simulation.status.activeDevicesCount')}</div>
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
        <div className='tile-header'>
          <SectionHeader>{name || id}</SectionHeader>
        </div>
        <div className='time-containers'>
          <div className='left time-container'> {t('simulation.status.created', { startDateTime })} </div>
          <div className='right time-container'> {
            this.state.isRunning
              ? t('simulation.status.running')
              : t('simulation.status.ended', { endDateTime })}
          </div>
        </div>
        <div className='tile-body'>
          {this.getActiveDevices()}
          {
            this.state.isRunning &&
            <div className='chart-div'></div>
          }
          <div className='simulation-summary'>
            <div className='device-model-rows'>
              {
                deviceModels.map(deviceModelItem =>
                  <div className='device-model-row' key={ deviceModelItem.id }>
                    {deviceModelItem.count} {deviceModelEntities && deviceModelEntities[deviceModelItem.id] ? (deviceModelEntities[deviceModelItem.id]).name : '-'}
                  </div>
                )
              }
            </div>
            <div className='telemetry-container'>
              <div className='simulation-status-section right'>
                <div className='messages-per-second'>{this.state.isRunning ? this.state.averageMessagesPerSecond : statistics.averageMessagesPerSecond}</div>
                <div className='messages-per-second-desc'>{t('simulation.status.averageMessagesPerSec')}</div>
                <div className='total -messages'>{t('simulation.status.totalMessagesSentLabel')} {this.state.isRunning ? this.state.totalMessagesCount : statistics.totalMessagesSent}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default SimulationTile;
