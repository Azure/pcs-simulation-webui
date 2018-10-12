// Copyright (c) Microsoft. All rights reserved.

import React, { Component } from 'react';
import { Subject, Observable } from 'rxjs';
import moment from 'moment';
import { Route, NavLink, Redirect, withRouter } from "react-router-dom";

import Config from 'app.config';
import { svgs, humanizeDuration, ComponentArray } from 'utilities';
import { Btn, ContextMenu, Svg, ErrorMsg, Indicator } from 'components/shared';
import { SimulationService, MetricsService, retryHandler } from 'services';
import { TelemetryChart, chartColorObjects } from './metrics';
import { NewSimulation } from '../flyouts';

import './simulationDetails.css';

const maxDate = '12/31/9999 11:59:59 PM +00:00';

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
      showLink : false,
      hubUrl : '',
      simualtionPollingError: '',
      hubMetricsPollingError: ''
    };

    this.emitter = new Subject();
    this.simulationRefresh$ = new Subject();
    this.telemetryRefresh$ = new Subject();
    this.newSimulationEmitter = new Subject();
    this.subscriptions = [];
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
            showLink: ((response.iotHubs || [])[0] || {}).preprovisionedIoTHubInUse,
            simualtionPollingError: ''
          },
            () => {
              if (response.isActive) {
                this.simulationRefresh$.next(`r`);
              }
            }
          );
        },
        simualtionPollingError => this.setState({ simualtionPollingError })
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
                const { isRunning } = this.state;
                if (isRunning) {
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
    { isRunning: false },
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
        error => this.setState({ serviceError: error.message })
      )
    );
  }

  getHubLink = () => {
    return this.state.showLink && (
      <ComponentArray>
        <Svg path={svgs.linkTo} className="link-svg" />
        <a href={this.state.hubUrl} target="_blank">{ this.props.t('simulation.vieIotHubMetrics') }</a>
      </ComponentArray>
    )
  }

  refreshPage = () => window.location.reload(true);

  getBtnFromSimulationStatus(disabled) {
    const { t } = this.props;

    const stopBtnProps = {
      type: 'button',
      onClick: this.stopSimulation
    };

    const startBtnProps = {
      type: 'button',
      onClick: this.startSimulation
    };

    return this.state.enabled
      ? <Btn {...stopBtnProps } svg={svgs.stopSimulation}>{ t('simulation.stop') }</Btn>
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
      <ComponentArray>
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
      </ComponentArray>
    );
  }

  closeFlyout = () => this.setState({ flyoutOpen: false });

  openNewSimulationFlyout = () => this.setState({ flyoutOpen: newSimulationFlyout })

  getSimulationState = (endDateTime, t) => {
    const { simualtionPollingError, enabled, isRunning, isActive } = this.state;
    return simualtionPollingError
      ? <div className="simulation-error-container">
          <div>{ t('simulation.status.error') }</div>
          <ErrorMsg>{ simualtionPollingError.message }</ErrorMsg>
        </div>
      : enabled
          ? isRunning
              ? [ <Svg path={svgs.running} className="running-icon" key="running-icon" />, t('simulation.status.running') ]
              : isActive
                  ? [ <Indicator size='small' className="setting-up-icon" />, t('simulation.status.settingUp') ]
                  : t('simulation.status.ended', { endDateTime })
          : t('simulation.status.ended', { endDateTime })
  }

  render() {
    const {
      t,
      deviceModelEntities = {},
      match,
      simulationList
    } = this.props;

    const { simulation, metrics, hubMetricsPollingError, simulationPollingError } = this.state;
    const pollingError = hubMetricsPollingError || simulationPollingError;

    const {
      id,
      deviceModels = [],
      startTime,
      endTime,
      stopTime,
      isRunning,
      iotHubs = []
    } = simulation;

    const startDateTime = moment(startTime).format(dateTimeFormat);
    const endDateTime = stopTime ? moment(stopTime).format(dateTimeFormat) : moment(endTime).format(dateTimeFormat);

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
    const isThereARunningSimulation = simulationList.some(({ isRunning }) => isRunning);
    return (
      <ComponentArray>
        <Route exact path={`${pathname}`} render={() => <Redirect to={`${pathname}/${defaultModelRoute}`} push={true} />} />
        <ContextMenu>
          { pollingError && <Btn svg={svgs.refresh} onClick={this.refreshPage}>{ t('simulation.refresh') }</Btn> }
          { id && this.getBtnFromSimulationStatus(isThereARunningSimulation) }
          <Btn className="new-simulation-btn" svg={svgs.plus} onClick={this.openNewSimulationFlyout} disabled={isRunning || isThereARunningSimulation}>
            { t('simulation.newSim') }
          </Btn>
        </ContextMenu>

        <div className="simulation-details-header">
          {
            id
            ? <ComponentArray>
                <div className="simulation-name">{ simulation.name }</div>
                <div className="iothub-metrics-link">{ this.getHubLink() }</div>
              </ComponentArray>
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
                </div>
              }
              <div className="simulation-statistics">{ id && this.getSimulationStats() }</div>
            </div>
            {
              hubMetricsPollingError
                ? <ErrorMsg>{ hubMetricsPollingError.message }</ErrorMsg>
                : isRunning && <TelemetryChart colors={chartColorObjects} metrics={metrics} />
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
                    <NavLink to={`${pathname}/${id}`} className="nav-item" activeClassName="active" key={`${id}-${index}-navlink`}>
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
      </ComponentArray>
    );
  }
}

export default withRouter(SimulationDetails);
