// Copyright (c) Microsoft. All rights reserved.

import React, { Component } from 'react';
import { Subject } from 'rxjs';
import moment from 'moment';
import { Route, NavLink, Redirect, withRouter, Link } from "react-router-dom";
import { debounce } from 'lodash';

import Svgs from 'svgs';
import Config from 'app.config';
import { humanizeDuration, isDef } from 'utilities';
import { Btn, ContextMenu, ErrorMsg, Indicator } from 'components/shared';
import { SimulationService, MetricsService, retryHandler } from 'services';
import { TelemetryChart, chartColorObjects } from './metrics';
import { NewSimulation } from '../flyouts';

import './simulationDetails.scss';

const maxDate = '9999-12-31T23:59:59+00:00';

const {
  simulationStatusPollingInterval,
  maxRetryAttempts,
  retryWaitTime,
  dateTimeFormat
} = Config;

const newSimulationFlyout = 'new-simulation';

class SimulationDetails extends Component {

  constructor() {
    super();

    this.state = {
      simulation: {},
      telemetry: {},
      metrics:[],
      isRunning : false,
      preprovisionedIoTHubInUse: undefined,
      hubUrl: '',
      simulationPollingError: '',
      hubMetricsPollingError: ''
    };

    this.emitter = new Subject();
    this.simulationRefresh$ = new Subject();
    this.telemetryRefresh$ = new Subject();
    this.newSimulationEmitter = new Subject();
    this.subscriptions = [];
    this.startButtonClicked = debounce(this.startSimulation, 500);
  }

  componentDidMount() {
    // Simulation stream - START
    const getSimulationStream = simulationId => SimulationService.getSimulation(simulationId)
      .merge(
        this.simulationRefresh$
          .delay(simulationStatusPollingInterval)
          .flatMap(_ => SimulationService.getSimulation(simulationId))
      )
      .retryWhen(retryHandler(maxRetryAttempts, retryWaitTime));
    // Simulation stream - END

    this.subscriptions.push(
      this.emitter
      .switchMap(getSimulationStream)
      .subscribe(
        response => {
          const devicesDeletionInProgress = !response.enabled
            && (response.devicesDeletionRequired || response.deleteDevicesOnce)
            && !response.devicesDeletionCompleted;

          this.setState({
            simulation: response,
            enabled: response.enabled,
            isActive: response.isActive,
            isRunning: response.isRunning,
            totalMessagesSent: response.statistics.totalMessagesSent,
            failedMessagesCount: response.statistics.failedMessagesCount,
            activeDevicesCount: response.statistics.activeDevicesCount,
            averageMessagesPerSecond: response.statistics.averageMessagesPerSecond,
            failedDeviceConnectionsCount: response.statistics.failedDeviceConnectionsCount,
            failedDeviceTwinUpdatesCount: response.statistics.failedDeviceTwinUpdatesCount,
            hubUrl: ((response.iotHubs || [])[0] || {}).preprovisionedIoTHubMetricsUrl || '',
            preprovisionedIoTHubInUse: ((response.iotHubs || [])[0] || {}).preprovisionedIoTHubInUse,
            simulationPollingError: '',
            devicesDeletionInProgress,
            devicesDeletionRequired: response.devicesDeletionRequired,
            deleteDevicesWhenSimulationEnds: response.deleteDevicesWhenSimulationEnds,
            devicesDeletionCompleted: response.devicesDeletionCompleted
          },
          () => {
            if (response.isActive || this.state.devicesDeletionInProgress) {
              this.simulationRefresh$.next(`r`);
            }
          });
        },
        simulationPollingError => this.setState({ simulationPollingError })
      )
    );

    // Telemetry stream - START
    const getTelemetryStream = simulationId => MetricsService.fetchIothubMetrics(simulationId)
      .merge(
        this.telemetryRefresh$ // Previous request complete
          .delay(Config.telemetryRefreshInterval) // Wait to refresh
          .flatMap(_ => MetricsService.fetchIothubMetrics(simulationId))
      )
      .retryWhen(retryHandler(maxRetryAttempts, retryWaitTime));
    // Telemetry stream - END

    this.subscriptions.push(
      this.emitter
        .switchMap(getTelemetryStream)
        .subscribe(
          (metrics) => {
            this.setState(
              {
                metrics,
                hubMetricsPollingError: ''
              },
              () => {
                const { isActive } = this.state;
                if (isActive) {
                  this.telemetryRefresh$.next('r');
                }
              }
            );
          },
          hubMetricsPollingError => this.setState({ hubMetricsPollingError })
        )
    );

    // Start polling
    this.emitter.next(this.props.match.params.id);
  }

  componentWillReceiveProps({ match: { params: { id } } }) {
    if (id !== '') {
      this.emitter.next(id);
    }
  }

  componentWillUnmount() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  convertDurationToISO = ({ hours, minutes, seconds }) => `NOW+PT${hours}H${minutes}M${seconds}S`;

  stopSimulation = () => this.setState(
    { isActive: false },
    () => this.props.stopSimulation(this.state.simulation)
  );

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
      startTime: 'Now',
      enabled: true
    }

    this.subscriptions.push(SimulationService.toggleSimulation(requestModel)
      .subscribe(
        ({ id }) => {
          this.props.history.push(`/simulations/${id}`);
        },
        simulationPollingError => this.setState({ simulationPollingError })
      )
    );
  }

  getHubLink = () => {
    return this.state.preprovisionedIoTHubInUse && (
      <>
        <Svgs.LinkTo className="link-svg" />
        <a href={this.state.hubUrl} target="_blank" rel="noopener noreferrer">{ this.props.t('simulation.vieIotHubMetrics') }</a>
      </>
    )
  }

  refreshPage = () => window.location.reload(true);

  getBtnFromSimulationStatus(disabled) {
    const { t } = this.props;

    const stopBtnProps = {
      type: 'button',
      onClick: this.stopSimulation,
      disabled: !this.state.isActive
    };

    const startBtnProps = {
      type: 'button',
      onClick: this.startButtonClicked,
      disabled: disabled || this.state.devicesDeletionInProgress || this.state.disableStart
    };

    return this.state.enabled
      ? <Btn {...stopBtnProps } svg={Svgs.StopSimulation}>{ t('simulation.stop') }</Btn>
      : <Btn {...startBtnProps}>{ t('simulation.start') }</Btn>;
  }

  getSimulationStats () {
    const { t } = this.props;
    const {
      simulation: {
        deviceModels = []
      },
      totalMessagesSent = 0,
      failedMessagesCount = 0,
      activeDevicesCount = 0,
      averageMessagesPerSecond = 0,
      failedDeviceConnectionsCount = 0,
      failedDeviceTwinUpdatesCount = 0
    } = this.state;

    const totalDevices = deviceModels.reduce((total, { count }) => total + count, 0);

    const simulationStatuses = [
      {
        description: t('simulation.status.totalDevicesCount'),
        value: totalDevices,
        className: 'status-value'
      },
      {
        description: t('simulation.status.totalMessagesCount'),
        value: totalMessagesSent,
        className: 'status-value'
      },
      {
        description: t('simulation.status.messagesPerSec'),
        value: averageMessagesPerSecond,
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

    return (
      <>
        <div className="stats-header">Statistics</div>
        <div className="stats-container">
          <div className="active-devices-container">
            <div className="active-devices">{activeDevicesCount}</div>
            <div className="active-devices-label">{ t('simulation.status.activeDevicesCount') }</div>
          </div>
          <div className="other-stats-container">
          {
            simulationStatuses.map(({description, value, className}, index) => (
              <div className="status-item" key={`${index}-simulation-stats`}>
                <span className={className}>{value}</span>
                <span className="status-description">{description}</span>
              </div>
            ))
          }
          </div>
        </div>
      </>
    );
  }

  closeFlyout = () => this.setState({ flyoutOpen: false });

  openNewSimulationFlyout = () => this.setState({ flyoutOpen: newSimulationFlyout })

  deleteDevicesInThisSimulation = () => {
    SimulationService.patchSimulation(this.state.simulation)
      .subscribe(
        response => {
          const devicesDeletionInProgress = !response.enabled
            && (response.devicesDeletionRequired || response.deleteDevicesOnce)
            && !response.devicesDeletionCompleted;
          this.setState({ devicesDeletionInProgress, devicesDeletionCompleted: response.devicesDeletionCompleted },
            () => {
              if (devicesDeletionInProgress) {
                this.simulationRefresh$.next(`r`);
              }
            }
          );
        }
      );
  }

  getSimulationState = (endDateTime, t) => {
    const { simulationPollingError, enabled, isRunning, isActive, devicesDeletionInProgress } = this.state;
    return simulationPollingError
      ? <div className="simulation-error-container">
          <div>{ t('simulation.status.error') }</div>
          <ErrorMsg>{ simulationPollingError.message }</ErrorMsg>
        </div>
      : enabled
          ? isRunning
              ? <>
                  <Svgs.Running className="running-icon" />
                  { t('simulation.status.running') }
                </>
              : isActive
                  ? <>
                      <Indicator size='small' className="setting-up-icon" />
                      { t('simulation.status.settingUp') }
                    </>
                  : t('simulation.status.ended', { endDateTime })
          : devicesDeletionInProgress
              ? <>
                  <Indicator size='small' className="setting-up-icon" />
                  { t('simulation.status.cleaningUp') }
                </>
              : t('simulation.status.ended', { endDateTime })
  }

  getMetricsPlaceHolder = (message) => (
    <div className="missing-chart-container">
        <div className="missing-chart-content">
          <Svgs.MissingChart className="missing-chart-svg" />
          <div className="metrics-unavaiable-container">
            { message }
            <Link
              className="learn-more"
              target="_blank"
              to='https://github.com/Azure/device-simulation-dotnet/wiki/How-to-Enable-Hub-Metrics-Charts-for-Simulations'>
              { this.props.t('simulation.details.learnMore') }
            </Link>
          </div>
        </div>
      </div>
  )

  render() {
    const {
      t,
      deviceModelEntities = {},
      match,
      simulationList
    } = this.props;

    const { simulation, metrics, hubMetricsPollingError, simulationPollingError, preprovisionedIoTHubInUse, enabled, devicesDeletionInProgress, devicesDeletionCompleted } = this.state;
    const pollingError = hubMetricsPollingError || simulationPollingError;

    const {
      id,
      deviceModels = [],
      startTime,
      endTime,
      stopTime,
      isActive,
      iotHubs = []
    } = simulation;

    const startDateTime = moment(startTime).format(dateTimeFormat);
    const endDateTime = stopTime
      ? moment(stopTime).format(dateTimeFormat)
      : endTime
          ? moment(endTime).format(dateTimeFormat)
          :  '-';

    const iotHub = iotHubs[0] || {};
    const iotHubString = (iotHub.connectionString || t('simulation.form.targetHub.preProvisionedLbl'));

    const [ deviceModel = {} ] = deviceModels;
    const defaultModelRoute = deviceModel.id || '';

    const duration = (!startTime || !endTime || endTime === maxDate)
      ? t('simulation.form.duration.runIndefinitelyBtn')
      : humanizeDuration(moment(endTime).diff(moment(startTime)));
    const pathname = `/simulations/${match.params.id}`;

    const newSimulationFlyoutOpen = this.state.flyoutOpen === newSimulationFlyout;

    // Remove isThereARunningSimulation when simulation service support running multiple simulations
    const isThereARunningSimulation = simulationList.some(({ isActive }) => isActive);

    // Remove insufficientPermissionsError when service expose service princeple stats
    const insufficientPermissionsError = ((hubMetricsPollingError || {}).errorMessage || '')
      .includes('does not have authorization to perform action');

    return (
      <>
        <Route exact path={`${pathname}`} render={() => <Redirect to={`${pathname}/${defaultModelRoute}`} push={true} />} />
        <ContextMenu>
          { pollingError && <Btn svg={Svgs.Refresh} onClick={this.refreshPage}>{ t('simulation.refresh') }</Btn> }
          {
            id &&
              <Btn disabled={!this.state.enabled || !this.state.isActive} type="button" onClick={this.stopSimulation} svg={Svgs.StopSimulation}>{t('simulation.stop')}</Btn>
          }
          {
            id &&
              <Btn disabled={isThereARunningSimulation || this.state.devicesDeletionInProgress || this.state.enabled} type="button" onClick={this.startButtonClicked}>{t('simulation.start')}</Btn>
          }
          <Btn className="new-simulation-btn" svg={Svgs.Plus} onClick={this.openNewSimulationFlyout} disabled={isActive || isThereARunningSimulation}>
            { t('simulation.newSim') }
          </Btn>
        </ContextMenu>

        <div className="simulation-details-header">
          {
            id
            ? <>
                <div className="simulation-name">{ simulation.name }</div>
                <div className="iothub-metrics-link">{ this.getHubLink() }</div>
              </>
            : <Indicator pattern="bar" />
          }
        </div>

        <div className="simulation-details-container">
          <div className="simulation-stats-container">
            <div className="stack-container">
              {
                id && <div className="info-container">
                  <div className="info-section">
                    <div className="info-label">{ t('simulation.description') }</div>
                    <div className="info-content">{ simulation.description }</div>
                  </div>
                  <div className="info-section">
                    <div className="info-label">{ t('simulation.form.targetHub.header') }</div>
                    <div className="info-content">{ iotHubString }</div>
                  </div>
                  <div className="info-section">
                    <div className="info-label">{ t('simulation.form.duration.header') }</div>
                    <div className="info-content">{ duration }</div>
                  </div>
                  <div className="time-container">
                    <div className="left-time-container">{ t('simulation.status.created', { startDateTime }) }</div>
                    <div className="right-time-container">{ this.getSimulationState(endDateTime, t) }</div>
                  </div>
                  {
                    !devicesDeletionCompleted && !enabled && stopTime != null &&
                    <div className="info-section">
                      <Btn className="delete-devices-section" disabled={devicesDeletionInProgress} onClick={this.deleteDevicesInThisSimulation}>{t('simulation.form.deleteAllDevices')}</Btn>
                    </div>
                  }
                </div>
              }
              <div className="simulation-statistics">{ id && this.getSimulationStats() }</div>
            </div>
            {
              id && isDef(preprovisionedIoTHubInUse) && (preprovisionedIoTHubInUse
                ? hubMetricsPollingError
                    ? insufficientPermissionsError
                      ? this.getMetricsPlaceHolder(t('simulation.details.insufficientPermissions'))
                      : <ErrorMsg>{ hubMetricsPollingError.message }</ErrorMsg>
                    : <TelemetryChart colors={chartColorObjects} metrics={metrics} />
                : this.getMetricsPlaceHolder(t('simulation.details.missingChart')))
            }
          </div>
          {
            id &&
            <div className="simulation-details">
              <div className="details-section-header">{ t('simulation.details.header') }</div>
              <div className="device-models-details-container">
                <div className="device-model-links">
                {
                  (deviceModels).map(({
                    id, count, interval
                  }, index) => (
                    <NavLink to={`${pathname}/${id}`} className="nav-item" activeClassName="active" key={index}>
                      <div key={`${id}-${index}-count`} className="nav-item-count">{count}</div>
                      <div key={`${id}-${index}-link`} className="nav-item-text">
                      {
                        deviceModelEntities && deviceModelEntities[id]
                          ? (deviceModelEntities[id]).name
                          : '-'
                      }
                      </div>
                    </NavLink>
                  ))
                }
                </div>

                <div className="device-model-details">
                {
                  match.params.modelId in deviceModelEntities
                    ? <pre>{ JSON.stringify(deviceModelEntities[match.params.modelId], null, 2) }</pre>
                    : null
                }
                </div>
              </div>
            </div>
          }
        </div>
        {
          newSimulationFlyoutOpen &&
          <NewSimulation onClose={this.closeFlyout} {...this.props} />
        }
      </>
    );
  }
}

export default withRouter(SimulationDetails);
