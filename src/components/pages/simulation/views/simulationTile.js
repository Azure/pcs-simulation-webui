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
      showLink: false,
      hubUrl: '',
      pollingError: ''
    };

    this.emitter = new Rx.Subject();
    this.pollingStream = this.emitter.switch();
  }

  componentDidMount() {
    // Initialize state from the most recent status
    this.setState({
      isRunning: this.props.isRunning,
      hubUrl: this.props.preprovisionedIoTHubMetricsUrl,
      showLink: this.props.preprovisionedIoTHubInUse
    });

    // Poll until the simulation status is false
    this.pollingSubscriber = this.pollingStream
      .do(({ simulationRunning }) => {
        if (simulationRunning) {
          this.emitter.next(
            Rx.Observable.of('poll')
              .delay(pollingInterval)
              .flatMap(SimulationService.getStatus)
          );
        }
      })
      .subscribe(
        response => {
          this.setState({
            isRunning: response.simulationRunning,
            hubUrl: response.preprovisionedIoTHubMetricsUrl,
            showLink: response.preprovisionedIoTHubInUse,
            totalMessagesCount: response.totalMessagesCount,
            failedMessagesCount: response.failedMessagesCount,
            activeDevicesCount: response.activeDevicesCount,
            totalDevicesCount: response.totalDevicesCount,
            messagesPerSecond: response.messagesPerSecond,
            failedDeviceConnectionsCount: response.failedDeviceConnectionsCount,
            failedDeviceTwinUpdatesCount: response.failedDeviceTwinUpdatesCount
          });
        },
        ({ errorMessage }) => this.setState({ pollingError: errorMessage })
      );

    // Start polling
    this.emitter.next(SimulationService.getStatus());
  }

  componentWillUnmount() {
    this.pollingSubscriber.unsubscribe();
  }

  stopSimulation = () => this.props.toggleSimulation(false);

  getHubLink = (shouldPad = true) => {
    return this.state.showLink && (
      <div className={`portal-link ${shouldPad && 'padded'}`}>
        <Svg path={svgs.linkTo} className="link-svg" />
        <a href={this.state.hubUrl} target="_blank">View IoT Hub metrics in the Azure portal</a>
      </div>
    )
  }

  /*
  * Return human readable time format.
  * Examples:
  * 1 day and 30 seconds
  * 2 days and 2 hours
  * 1 day, 2 hours, 10 minutes and 50 seconds
  * @param {number} - time in milliseconds
  */
  humanizeDuration = (time) => {
    const duration = moment.duration(time);

    return [
      [duration.days(), 'day', 'days'],
      [duration.hours(), 'hour', 'hours'],
      [duration.minutes(), 'minute', 'minutes'],
      [duration.seconds(), 'second', 'seconds']
    ]
      .filter(([value]) => value)
      .map(([value, singular, plurals]) => `${value} ${value === 1 ? singular : plurals}`)
      .join(', ')
      .replace(/,(?=[^,]*$)/, ' and')
      .trim();
  }

  getSimulationSummary(totalDevicesCount) {
    const { t } = this.props;

    if (this.state.pollingError) {
      return (
        <div className="details-form-actions">
          <ErrorMsg>{ t('simulation.form.errorMsg.simulationStatusError') }</ErrorMsg>
        </div>
      );
    } else {
      return (
        this.getSimulationStatus(totalDevicesCount)
      );
    }
  }

  getSimulationStatus(totalDevicesCount = 0) {
    const { t } = this.props;

    const {
      totalMessagesCount = 0,
      messagesPerSecond = 0,
    } = this.state;

    return (<div className="simulation-status-section right">
      <div className="messages-per-second">{messagesPerSecond}</div>
      <div className="messages-per-second-desc">{t('simulation.status.averageMessagesPerSec')}</div>
      <div className="total -messages">{ t('simulation.status.totalMessagesSentLabel', { totalMessagesCount }) }</div>
    </div>);
  }

  render() {
    console.log(this.props);

    const {
      t,
      deviceModelEntities = {},
      simulation: {
        deviceModels,
        id,
        startTime,
        endTime
      }
    } = this.props;
    const totalDevices = deviceModels.reduce((total, obj) => {
      return total + obj['count'];
    }, 0);

    return (
      <div className="simulation-tile-container">
        <div className="tile-header">
          <SectionHeader>Simulation {id}</SectionHeader>
        </div>
        <div className="tile-body">
          <div>
            <div className="left time-container"> { this.state.StartTime } Created 1/12/18 10:13:09 AM </div>
            <div className="right time-container"> { this.state.isRunning ? 'Running' : 'Ended 1/12/18 12:13:09 AM'} </div>
          </div>
          <div className="active-devices">
            <div className="active-devices-count"> { this.state.activeDevicesCount } </div>
            <div className="active-devices-label"> { t('simulation.status.activeDevicesCount') }</div>
          </div>
          <div className="simulation-summary">
            <div className='device-model-rows'>
              {deviceModels.map(deviceModelItem =>
                <div className='device-model-row' key={ deviceModelItem.id }>
                  {deviceModelItem.count} {deviceModelEntities && deviceModelEntities[deviceModelItem.id] ? (deviceModelEntities[deviceModelItem.id]).name : '-'}
                </div>
              )}
            </div>
            <div className='telemetry-container'>
              {this.getSimulationSummary(totalDevices)}
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default SimulationTile;
