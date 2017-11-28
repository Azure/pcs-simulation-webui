// Copyright (c) Microsoft. All rights reserved.

import React, { Component } from 'react';

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
    const { duration, deviceModels } = this.props.simulation;
    const modelName = deviceModels.length ? deviceModels[0].Name : 'N/A';
    const numDevices = deviceModels.length ? deviceModels[0].Count : 0;

    return (
      <div className="simulation-details-container">
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
