// Copyright (c) Microsoft. All rights reserved.

import React, { Component } from 'react';
import Rx from 'rxjs';
import moment from 'moment';

import Config from 'app.config';
import { svgs } from 'utilities';
import { Svg } from 'components/shared/svg/svg';
import {
  ErrorMsg,
  SectionHeader
} from 'components/shared';
import { SimulationService } from 'services';


const pollingInterval = Config.simulationStatusPollingInterval;

class SimulationTile extends Component {

  constructor() {
    super();

    this.state = {
      isRunning: true,
      pollingError: ''
    };

    this.emitter = new Rx.Subject();
    this.pollingStream = this.emitter.switch();
  }

  componentDidMount() {
    // Initialize state from the most recent status
    this.setState({
      isRunning: this.props.isRunning
    });

    // Poll until the simulation status is false
    this.pollingSubscriber = this.pollingStream
      .do(({ simulationRunning }) => {
        if (simulationRunning) {
          this.emitter.next(
            Rx.Observable.of('poll')
              .delay(pollingInterval)
              .flatMap(SimulationService.getStatus(this.props.simulation.id))
          );
        }
      })
      .subscribe(
        response => {
          this.setState({
            isRunning: response.simulationRunning,
            totalMessagesCount: response.totalMessagesCount,
            activeDevicesCount: response.activeDevicesCount,
            totalDevicesCount: response.totalDevicesCount,
            messagesPerSecond: response.messagesPerSecond
          });
        },
        ({ errorMessage }) => this.setState({ pollingError: errorMessage })
      );

    console.log("ID  ", this.props.simulation.id);
    // Start polling
    this.emitter.next(SimulationService.getStatus(this.props.simulation.id));
  }

  componentWillUnmount() {
    this.pollingSubscriber.unsubscribe();
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
    console.log(this.props);
    const {
      t,
      deviceModelEntities = {},
      simulation: {
        deviceModels,
        id,
        name,
        enabled,
        startTime,
        endTime
      }
    } = this.props;

    return (
        <div className = "simulation-tile-container" >
        <div className="tile-header">
          <SectionHeader> {name || id}</SectionHeader>
        </div>
        <div className="tile-body">
          <div>
            <div className="left time-container"> Created { startTime } </div>
            <div className="right time-container"> {this.state.isRunning ? 'Running': endTime } </div>
          </div>
          { this.getActiveDevices() } 
          <div className="simulation-summary">
            <div className='device-model-rows'>
              {deviceModels.map(deviceModelItem =>
                <div className='device-model-row' key={ deviceModelItem.id }>
                  {deviceModelItem.count} {deviceModelEntities && deviceModelEntities[deviceModelItem.id] ? (deviceModelEntities[deviceModelItem.id]).name : '-'}
                </div>
              )}
            </div>
            <div className='telemetry-container'>
              <div className="simulation-status-section right">
                <div className="messages-per-second">{this.state.messagesPerSecond}</div>
                <div className="messages-per-second-desc">{t('simulation.status.averageMessagesPerSec')}</div>
                <div className="total -messages">{t('simulation.status.totalMessagesSentLabel')} {this.state.totalMessagesCount}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default SimulationTile;
