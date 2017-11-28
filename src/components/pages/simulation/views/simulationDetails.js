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

class SimulationDetails extends Component {

  stopSimulation = () => this.props.toggleSimulation(false);

  render () {
    const { deviceModels, startTime, endTime, iotHub } = this.props.simulation;
    const iotHubStringMap = iotHub.connectionString.split(';');
    const iotHubString = iotHubStringMap.length
      ? iotHubStringMap[0]
      : 'default';
    const modelName = deviceModels.length ? deviceModels[0].name : 'N/A';
    const numDevices = deviceModels.length ? deviceModels[0].count : 0;
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
          <SectionHeader>{modelName}</SectionHeader>
        </FormSection>
        <FormSection>
          <SectionHeader>Number of devices</SectionHeader>
          <SectionHeader>{numDevices}</SectionHeader>
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
