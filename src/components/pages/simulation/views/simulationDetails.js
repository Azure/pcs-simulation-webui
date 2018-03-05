// Copyright (c) Microsoft. All rights reserved.

import React, { Component } from 'react';
import Rx from 'rxjs';
import moment from 'moment';

import Config from 'app.config';
import { svgs } from 'utilities';
import { Svg } from 'components/shared/svg/svg';
import {
  Btn,
  BtnToolbar,
  ErrorMsg,
  FormActions,
  FormSection,
  Indicator,
  SectionHeader
} from 'components/shared';
import { SensorHeader } from './sensors.utils';
import { SimulationService } from 'services';

const pollingInterval = Config.simulationStatusPollingInterval;

class SimulationDetails extends Component {

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
      [ duration.days(), 'day', 'days' ],
      [ duration.hours(), 'hour', 'hours' ],
      [ duration.minutes(), 'minute', 'minutes' ],
      [ duration.seconds(), 'second', 'seconds' ]
    ]
    .filter(([ value ]) => value)
    .map(([ value, singular, plurals ]) => `${value} ${value === 1 ? singular : plurals}`)
    .join(', ')
    .replace(/,(?=[^,]*$)/, ' and')
    .trim();
  }

  getSimulationStatusBar(totalDevicesCount) {
    const btnProps = {
      type: 'button',
      className: 'apply-btn',
      onClick: this.stopSimulation
    };

    if (this.state.pollingError) {
      const refreshPage = () => window.location.reload(true);

      return (
        <FormActions className="details-form-actions">
          <ErrorMsg>Something went wrong and we weren't able to get the simulation status.</ErrorMsg>
          <BtnToolbar>
            <Btn { ...btnProps } onClick={refreshPage}>Refresh</Btn>
          </BtnToolbar>
        </FormActions>
      );
    } else if (this.state.isRunning) {
      return (
        <FormActions className="details-form-actions">
          <Indicator pattern="bar" />
          Your simulation is running. Please allow a few minutes before you see data flowing to your IoT Hub.
          { this.getSimulationStatus(totalDevicesCount) }
          { this.getHubLink() }
          <BtnToolbar>
            <Btn { ...btnProps } svg={svgs.stopSimulation}>Stop Simulation</Btn>
          </BtnToolbar>
        </FormActions>
      );
    } else {
      return (
        <FormActions>
          Your simulation has stopped running.
          <BtnToolbar>
            <Btn { ...btnProps }>Ok</Btn>
          </BtnToolbar>
          { this.getHubLink() }
        </FormActions>
      );
    }
  }

  getSimulationStatus(totalDevicesCount = 0) {
    const {
      totalMessagesCount = 0,
      failedMessagesCount = 0,
      activeDevicesCount = 0,
      messagesPerSecond = 0,
      failedDeviceConnectionsCount = 0,
      failedDeviceTwinUpdatesCount = 0
    } = this.state;

    const simulationStatuses = [
      {
        discription: 'Active devices',
        value: activeDevicesCount,
        className: 'active-devices-status'
      },
      {
        discription: 'Total devices',
        value: totalDevicesCount,
        className: 'total-devices-status'
      },
      {
        discription: 'Total messages',
        value: totalMessagesCount,
        className: 'status-value'
      },
      {
        discription: 'Messages per second',
        value: messagesPerSecond,
        className: 'status-value'
      },
      {
        discription: 'Failed messages',
        value: failedMessagesCount,
        className: 'status-value'
      },
      {
        discription: 'Failed device connections',
        value: failedDeviceConnectionsCount,
        className: 'status-value'
      },
      {
        discription: 'Failed twin updates',
        value: failedDeviceTwinUpdatesCount,
        className: 'status-value'
      }
    ];

    const statuses = simulationStatuses.map(({discription, value, className}, index) => (
      <SectionHeader key={index}>
        <span className={className}>{value}</span>
        <span className="status-description">{discription}</span>
      </SectionHeader>
    ));

    return <FormSection className="simulation-status-section">
      <SectionHeader>Simulation Status</SectionHeader>
      {statuses}
    </FormSection>;
  }

  render () {
    const {
      simulation: {
        deviceModels,
        startTime,
        endTime,
        connectionString
      }
    } = this.props;
    const iotHubString = (connectionString || 'Pre-provisioned').split(';')[0];
    const [ deviceModel = {} ] = deviceModels;
    const { count = 0, name = 'N/A', sensors = [], interval = '' } = deviceModel;
    const [ hour = '00', minutes = '00', seconds = '00' ] = interval.split(':');
    const duration = (!startTime || !endTime)
      ? 'Run indefinitely'
      : this.humanizeDuration(moment(endTime).diff(moment(startTime)));

    return (
      <div className="simulation-details-container">
        <FormSection>
          <SectionHeader>Target IoT Hub</SectionHeader>
          <SectionHeader>{iotHubString}</SectionHeader>
        </FormSection>
        <FormSection>
          <SectionHeader>Device Model</SectionHeader>
          <SectionHeader>{name}</SectionHeader>
        </FormSection>
        { sensors.length > 0 &&
          <FormSection>
            <SectionHeader>Sensors</SectionHeader>
            <SectionHeader className="sensors-container">
              { sensors.length > 0 && SensorHeader }
              {
                sensors.map((sensor, index) =>
                  <div className="sensor-row" key={index}>
                    <div className="sensor-box">{sensor.name}</div>
                    <div className="sensor-box">{sensor.path}</div>
                    <div className="sensor-box">{sensor.min}</div>
                    <div className="sensor-box">{sensor.max}</div>
                    <div className="sensor-box">{sensor.unit}</div>
                  </div>
                )
              }
            </SectionHeader>
          </FormSection>
        }
        <FormSection>
          <SectionHeader>Number of devices</SectionHeader>
          <SectionHeader>{count}</SectionHeader>
        </FormSection>
        <FormSection>
          <SectionHeader>Telemetry frequency</SectionHeader>
          <div className="duration-header">{`HH  MM  SS`}</div>
          <div className="duration-content">{`${hour} : ${minutes} : ${seconds}`}</div>
        </FormSection>
        <FormSection>
          <SectionHeader>Simulation duration</SectionHeader>
          <SectionHeader>{duration}</SectionHeader>
        </FormSection>
        { this.getSimulationStatusBar(count) }
      </div>
    );
  }
}

export default SimulationDetails;
