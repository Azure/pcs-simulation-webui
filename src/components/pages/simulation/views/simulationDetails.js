// Copyright (c) Microsoft. All rights reserved.

import React, { Component } from 'react';
import moment from 'moment'

import { svgs } from 'utilities';
import {
  FormSection,
  SectionHeader,
  FormActions,
  Btn,
  BtnToolbar
} from 'components/shared';
import { SensorHeader } from './sensors.utils';

class SimulationDetails extends Component {

  stopSimulation = () => this.props.toggleSimulation(false);

  render () {
    const { deviceModels, startTime, endTime, connectionString } = this.props.simulation;
    const iotHubString = (connectionString || 'Pre-provisioned').split(';')[0];
    const [deviceModel = {}] = deviceModels;
    const { count = 0, name = 'N/A', sensors = [], interval = '' } = deviceModel;
    const [hour = '00', minutes = '00', seconds = '00'] = interval.split(':');
    const duration = (!startTime || !endTime)
      ? 'Run indefinitely'
      : moment.duration(moment(endTime).diff(moment(startTime))).humanize();

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
                  <div className="sensor-container" key={index}>
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
        <FormActions>
          <BtnToolbar>
            <Btn
              svg={svgs.stopSimulation}
              type="submit"
              className="apply-btn"
              onClick={this.stopSimulation}>
                Stop Simulation
            </Btn>
          </BtnToolbar>
        </FormActions>
      </div>
    );
  }
}

export default SimulationDetails;
