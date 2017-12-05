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
import { SensorsDetails } from './sensors/sensors';

class SimulationDetails extends Component {

  stopSimulation = () => this.props.toggleSimulation(false);

  render () {
    const { deviceModels, startTime, endTime, connectionString } = this.props.simulation;
    const iotHubString = (connectionString || 'Pre-provisioned').split(';')[0];
    const [deviceModel = {}] = deviceModels;
    const { count = 0, name = 'N/A', sensors = [] } = deviceModel;
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
        <FormSection>
          <SectionHeader>Sensors</SectionHeader>
          <SectionHeader>
            <SensorsDetails sensors={sensors} />
          </SectionHeader>
        </FormSection>
        <FormSection>
          <SectionHeader>Number of devices</SectionHeader>
          <SectionHeader>{count}</SectionHeader>
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
