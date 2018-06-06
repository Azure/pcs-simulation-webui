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
    const { t } = this.props;
    const btnProps = {
      type: 'button',
      className: 'apply-btn',
      onClick: this.stopSimulation
    };

    if (this.state.pollingError) {
      const refreshPage = () => window.location.reload(true);

      return (
        <FormActions className="details-form-actions">
          <ErrorMsg>{ t('simulation.form.errorMsg.simulationStatusError') }</ErrorMsg>
          <BtnToolbar>
            <Btn { ...btnProps } onClick={refreshPage}>Refresh</Btn>
          </BtnToolbar>
        </FormActions>
      );
    } else if (this.state.isRunning) {
      return (
        <FormActions className="details-form-actions">
              <Indicator pattern="bar" />
              {t('simulation.status.simulationRunning') }
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
          {t('simulation.status.simulationStopped')}
          <BtnToolbar>
              <Btn {...btnProps}>{t('common.ok')}</Btn>
          </BtnToolbar>
          { this.getHubLink() }
        </FormActions>
      );
    }
  }

    getSimulationStatus(totalDevicesCount = 0) {
    const { t } = this.props;

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
        description: t('simulation.status.activeDevicesCount'),
        value: activeDevicesCount,
        className: 'active-devices-status'
      },
      {
        description: t('simulation.status.totalDevicesCount'),
        value: totalDevicesCount,
        className: 'total-devices-status'
      },
      {
        description: t('simulation.status.totalMessagesCount'),
        value: totalMessagesCount,
        className: 'status-value'
      },
      {
        description: t('simulation.status.messagesPerSec'),
        value: messagesPerSecond,
        className: 'status-value'
      },
      {
        description: t('simulation.status.failedMessagesCount'),
        value: failedMessagesCount,
        className: 'status-value'
      },
      {
        description: t('simulation.status.failedDeviceConnectionsCount'),
        value: failedDeviceConnectionsCount,
        className: 'status-value'
      },
      {
        description: t('simulation.status.failedDeviceTwinUpdatesCount'),
        value: failedDeviceTwinUpdatesCount,
        className: 'status-value'
      }
    ];

    const statuses = simulationStatuses.map(({description, value, className}, index) => (
      <SectionHeader key={index}>
        <span className={className}>{value}</span>
        <span className="status-description">{description}</span>
      </SectionHeader>
    ));

    return (<FormSection className="simulation-status-section">
      <SectionHeader>{t('simulation.status.header')}</SectionHeader>
      {statuses}
    </FormSection>);
  }

  render () {
      const {
      t,
      deviceModelEntities = {},
      simulation: {
        deviceModels,
        startTime,
        endTime,
        connectionString
      }
      } = this.props;
    const iotHubString = (connectionString || 'Pre-provisioned').split(';')[0];
    const [deviceModel = {}] = deviceModels;
    const { count = 0, name = 'N/A', sensors = [], interval = '' } = deviceModel;
    const [hour = '00', minutes = '00', seconds = '00'] = interval.split(':');
    const duration = (!startTime || !endTime)
      ? 'Run indefinitely'
      : this.humanizeDuration(moment(endTime).diff(moment(startTime)));
    const totalDevices = deviceModels.reduce((total, obj) => {
          return total + obj['count'];
      }, 0); 

    return (
      <div className="simulation-details-container">
        <FormSection>
          <SectionHeader>{t('simulation.form.targetHub.header')}</SectionHeader>
          <div className="targetHub-content">{iotHubString}</div>
        </FormSection>
        <FormSection>
            <SectionHeader>{t('simulation.form.deviceModels.header')}</SectionHeader>
            <div className='device-models-container'>
                <div className='device-model-headers'>
                    <div className='device-model-header'>{t('simulation.form.deviceModels.name')}</div>
                    <div className='device-model-header'>{t('simulation.form.deviceModels.count')}</div>
                </div>
                <div className='device-models-rows'>
                        {deviceModels.map(deviceModelItem =>
                            <div className='device-model-row'>
                                <div className='device-model-box'>{deviceModelEntities && deviceModelEntities[deviceModelItem.id] ? (deviceModelEntities[deviceModelItem.id]).name : '-'}</div>
                                <div className='device-model-box'>{deviceModelItem.count}</div>
                            </div>
                         )}
                </div>
            </div>
        </FormSection>
        <FormSection>
          <SectionHeader>{t('simulation.form.telemetry.header')}</SectionHeader>
          <div className="duration-header">{`HH  MM  SS`}</div>
          <div className="duration-content">{`${hour} : ${minutes} : ${seconds}`}</div>
        </FormSection>
        <FormSection>
          <SectionHeader>{t('simulation.form.duration.header')}</SectionHeader>
          <div className="duration-content">{duration}</div>
        </FormSection>
        {this.getSimulationStatusBar(totalDevices) }
      </div>
    );
  }
}

export default SimulationDetails;
