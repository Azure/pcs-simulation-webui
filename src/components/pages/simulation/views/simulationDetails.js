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
      hubUrl: ''
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
            Rx.Observable.of('poll').delay(pollingInterval).flatMap(SimulationService.getStatus)
          );
        }
      })
      .subscribe(response => {
        this.setState({
          isRunning: response.simulationRunning,
          hubUrl: response.preprovisionedIoTHubMetricsUrl,
          showLink: response.preprovisionedIoTHubInUse
        });
      });

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
  * 2 day2 and 2 hours
  * 1 day, 2 hours, 10 minutes and 50 seconds
  * @param {number} - time in milliseconds
  */
  humanizeDuration = (time) => {
    const duration = moment.duration(time);

    return [
      [ duration.days(), 'day,', 'days,' ],
      [ duration.hours(), 'hour,', 'hours,' ],
      [ duration.minutes(), 'minute,', 'minutes,' ],
      [ duration.seconds(), 'second', 'seconds' ]
    ]
    .reduce((acc, [ value, singular, plurals ]) => value ? `${acc} ${value} ${value === 1 ? singular : plurals}` : acc, '')
    .replace(/,(?=[^,]*$)/, ' and')
    .trim();
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

    const btnProps = {
      type: 'button',
      className: 'apply-btn',
      onClick: this.stopSimulation
    };

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
        {
          this.state.isRunning ? (
            <FormActions className="details-form-actions">
              <Indicator pattern="bar" />
              Your simulation is running. Please allow a few minutes before you see data flowing to your IoT Hub.
              { this.getHubLink() }
              <BtnToolbar>
                <Btn { ...btnProps } svg={svgs.stopSimulation}>Stop Simulation</Btn>
              </BtnToolbar>
            </FormActions>
          ) : (
            <FormActions>
              Your simulation has stopped running.
              <BtnToolbar>
                <Btn { ...btnProps }>Ok</Btn>
              </BtnToolbar>
              { this.getHubLink() }
            </FormActions>
          )
        }
      </div>
    );
  }
}

export default SimulationDetails;
