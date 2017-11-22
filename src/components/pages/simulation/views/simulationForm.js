// Copyright (c) Microsoft. All rights reserved.

import React, { Component } from 'react';

import { svgs, int } from 'utilities';
import {
  FormSection,
  SectionHeader,
  SectionDesc,
  FormGroup,
  FormLabel,
  FormControl,
  FormActions,
  Btn,
  BtnToolbar
} from 'components/shared';

class SimulationForm extends Component {

  constructor(props) {
    super(props);

    this.state = { numDevices: this.getNumDevices() };
  }

  apply = (event) => {
    event.preventDefault();
    const { simulation } = this.props;
    const modelUpdates = {
      enabled: true,
      deviceModels: simulation.deviceModels
    };
    modelUpdates.deviceModels[0] = {
      ...modelUpdates.deviceModels[0],
      Count: this.state.numDevices
    };
    this.props.updateSimulation(modelUpdates);
  };

  onChange = ({ target }) => {
    const name = target.name;
    const value = target.type === 'checkbox' ? target.checked : target.value;
    this.setState({ [name]: value });
  }

  getNumDevices() {
    return this.props.simulation.deviceModels[0].Count;
  }

  numDevicesIsValid = () => {
    const number = int(this.state.numDevices);
    return !isNaN(number) && number >= 0 && number <= 1000;
  }

  render () {
    return (
      <form onSubmit={this.apply}>
        <FormSection>
          <SectionHeader>Number of devices</SectionHeader>
          <SectionDesc>Number of devices to simulate (maximum 1000 devices).</SectionDesc>
          <FormGroup>
            <FormLabel>Amount</FormLabel>
            <FormControl
              name="numDevices"
              type="text"
              placeholder="# devices"
              className="small"
              onChange={this.onChange}
              value={this.state.numDevices} />
          </FormGroup>
        </FormSection>
        <FormActions>
          <BtnToolbar>
            <Btn
              svg={svgs.startSimulation}
              type="submit"
              className="apply-btn"
              disabled={!this.numDevicesIsValid()}>
                Start Simulation
            </Btn>
          </BtnToolbar>
        </FormActions>
      </form>
    );
  }
}

export default SimulationForm;
