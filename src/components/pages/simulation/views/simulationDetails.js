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
    const deviceModelsMap = this.props.deviceModels || [];
    const deviceModels = this.props.simulation.deviceModels || [];
    const numDevices = deviceModels.length ? deviceModels[0].Count : 0;
    const modelDetail = deviceModelsMap.filter(model => model.Id === deviceModels[0].Id)
    const modelName = modelDetail.length ? modelDetail[0].Name : '';
    const { duration } = this.props;
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
