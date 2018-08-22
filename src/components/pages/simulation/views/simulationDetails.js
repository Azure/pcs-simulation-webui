// Copyright (c) Microsoft. All rights reserved.

import React, { Component } from 'react';
import { Subject, Observable } from 'rxjs';
import moment from 'moment';

import Config from 'app.config';
import { svgs, humanizeDuration } from 'utilities';
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

import { SimulationService } from 'services';

const pollingInterval = Config.simulationStatusPollingInterval;
const maxDate = '12/31/9999 11:59:59 PM +00:00';

class SimulationDetails extends Component {

  constructor() {
    super();

    this.state = {
      simulation: {},
      isRunning : true,
      showLink : false,
      hubUrl : '',
      pollingError: '',
      startError: ''
    };

    this.emitter = new Subject();
    this.pollingStream = this.emitter.switch();
    this.subscriptions = [];
  }

  componentDidMount() {
    const simulationId = this.props.location.pathname.split('/').pop();
    this.subscriptions.push(SimulationService.getSimulation(simulationId)
      .subscribe(
        simulation => this.setState({ simulation }),
        error => this.setState({ pollingError: error })
      )
    );

    // Initialize state from the most recent status
    this.setState({
      isRunning: this.props.isRunning,
      hubUrl: this.props.preprovisionedIoTHubMetricsUrl,
      showLink: this.props.preprovisionedIoTHubInUse
      });

    // Poll until the simulation status is false
    this.subscriptions.push(this.pollingStream
      .do(({ simulationRunning }) => {
        if (simulationRunning) {
          this.emitter.next(
            Observable.of('poll')
              .delay(pollingInterval)
              .flatMap(() => SimulationService.getStatus(simulationId))
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
      )
    );

    // Start polling
    this.emitter.next(SimulationService.getStatus(simulationId));
  }

  componentWillUnmount() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  convertDurationToISO = ({ hours, minutes, seconds }) => `NOW+PT${hours}H${minutes}M${seconds}S`;

  stopSimulation = () => {
    this.props.stopSimulation({
      ...this.state.simulation,
      totalMessages: this.state.totalMessagesCount,
      averageMessages: this.state.messagesPerSecond
    });
  };

  startSimulation = (event) => {
    event.preventDefault();
    const { simulation } = this.state;
    const timespan = moment.duration(moment(simulation.endTime).diff(moment(simulation.startTime)));
    const duration = {
      ms: timespan.asMilliseconds(),
      hours: timespan.hours(),
      minutes: timespan.minutes(),
      seconds: timespan.seconds()
    };

    const requestModel = {
      ...this.state.simulation,
      endTime: this.convertDurationToISO(duration),
      startTime: 'Now'
    }

    this.subscriptions.push(SimulationService.cloneSimulation(requestModel)
      .subscribe(
        response => {
          const newId = response.id;
          var path = this.props.location.pathname;
          const newSimulationPath = path.replace(this.state.simulation.id, newId);
          window.location.replace(newSimulationPath);
        }),
      errorMessage => this.setState({ startError: errorMessage })
    );
  }

  getHubLink = (shouldPad = true) => {
    return this.state.showLink && (
      <div className={`portal-link ${shouldPad && 'padded'}`}>
        <Svg path={svgs.linkTo} className="link-svg" />
        <a href={this.state.hubUrl} target="_blank">View IoT Hub metrics in the Azure portal</a>
      </div>
    )
  }

  getSimulationStatusBar( totalDevicesCount) {
    const { t } = this.props;

    const btnProps = {
      type: 'button',
      className: 'apply-btn'
    };

    const stopBtnProps = {
      type: 'button',
      className: 'apply-btn',
      onClick: this.stopSimulation
    };
    const startBtnProps = {
      type: 'button',
      className: 'apply-btn',
      onClick: this.startSimulation
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
            { t('simulation.status.simulationRunning') }
            { this.getSimulationStatus(totalDevicesCount) }
            { this.getHubLink() }
          <BtnToolbar>
            <Btn {...stopBtnProps } svg={svgs.stopSimulation}>Stop Simulation</Btn>
          </BtnToolbar>
        </FormActions>
      );
    } else {
      return (
        <FormActions>
        { t('simulation.status.simulationStopped') }
        <BtnToolbar>
          <Btn {...startBtnProps}>Start Simulation</Btn>
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
      <SectionHeader>{ t('simulation.status.header') }</SectionHeader>
      {statuses}
    </FormSection>);
  }

  render() {
    const {
      t,
      deviceModelEntities = {}
    } = this.props;

    const { simulation } = this.state;

    const {
      deviceModels = [],
      startTime,
      endTime,
      connectionString
    } = simulation;

    const iotHubString = (connectionString || t('simulation.form.targetHub.preProvisionedLbl')).split(';')[0];

    const [ deviceModel = {} ] = deviceModels;
    const { interval = '' } = deviceModel;
    const [hour = '00', minutes = '00', seconds = '00'] = interval.split(':');

    const duration = (!startTime || !endTime || endTime === maxDate)
      ? t('simulation.form.duration.runIndefinitelyBtn')
      : humanizeDuration(moment(endTime).diff(moment(startTime)));
    const totalDevices = deviceModels.reduce((total, { count }) => total + count, 0);

    return (
      <div className="simulation-details-container">
        <FormSection>
          <SectionHeader>{t('simulation.name')}</SectionHeader>
          <div className="target-hub-content">{simulation.name}</div>
        </FormSection>
        <FormSection>
          <SectionHeader>{t('simulation.description')}</SectionHeader>
          <div className="target-hub-content">{simulation.description}</div>
        </FormSection>
        <FormSection>
          <SectionHeader>{ t('simulation.form.targetHub.header') }</SectionHeader>
          <div className="target-hub-content">{iotHubString}</div>
        </FormSection>
        <FormSection>
          <SectionHeader>{ t('simulation.form.deviceModels.header') }</SectionHeader>
          <div className='device-models-container'>
            <div className='device-model-headers'>
              <div className='device-model-header'>{ t('simulation.form.deviceModels.name') }</div>
              <div className='device-model-header'>{ t('simulation.form.deviceModels.count') }</div>
            </div>
            <div className='device-models-rows'>
              { (deviceModels).map(deviceModelItem =>
                <div className='device-model-row' key={ deviceModelItem.id }>
                  <div className='device-model-box'>{deviceModelEntities && deviceModelEntities[deviceModelItem.id] ? (deviceModelEntities[deviceModelItem.id]).name : '-'}</div>
                  <div className='device-model-box'>{deviceModelItem.count}</div>
                </div>
              )}
            </div>
          </div>
        </FormSection>
        <FormSection>
          <SectionHeader>{ t('simulation.form.telemetry.header') }</SectionHeader>
          <div className="duration-header">{`HH  MM  SS`}</div>
          <div className="duration-content">{`${hour} : ${minutes} : ${seconds}`}</div>
        </FormSection>
        <FormSection>
          <SectionHeader>{ t('simulation.form.duration.header') }</SectionHeader>
          <div className="duration-content">{duration}</div>
        </FormSection>
        {this.getSimulationStatusBar(totalDevices) }
      </div>
      );
    }
}

export default SimulationDetails;
