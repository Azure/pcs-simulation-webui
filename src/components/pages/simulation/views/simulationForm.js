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
  BtnToolbar,
  Radio
} from 'components/shared';

class SimulationForm extends Component {

  constructor(props) {
    super(props);

    this.state = {
      onBlur: false,
      duration: {},
      durationRadio: '',
      frequency: {},
      deviceModelOptions: [],
      deviceModel: '',
      numDevices: ''
    };
  }

  componentDidMount() {
    this.getFormState(this.props);
  }

  getFormState = (props) => {
    const { deviceModels, simulation } = props;
    const deviceModelOptions = deviceModels
      ? deviceModels.map(this.getSelectOption)
      : [];
    const deviceModel = simulation.deviceModels.length
      ? simulation.deviceModels.map(this.getSelectOption)[0]
      : '';
    const numDevices = simulation.deviceModels.length
      ? simulation.deviceModels[0].count
      : '';
    this.setState({
      deviceModelOptions,
      deviceModel,
      numDevices
    });
  }

  inputOnBlur = () => this.setState({ onBlur: true })

  inputOnFocus = () => this.setState({ onBlur: false })

  getSelectOption = ({ id, name }) => ({ value: id, label: name });

  getISOTimeString = ({ hours, minutes, seconds }) => `NOW+PT${hours}H${minutes}M${seconds}S`;

  apply = (event) => {
    event.preventDefault();
    const { simulation } = this.props;
    let modelUpdates = {
      enabled: true,
      deviceModels: simulation.deviceModels
    };
    modelUpdates.deviceModels[0] = {
      Id: this.state.deviceModel.value,
      Count: this.state.numDevices
    };
    if (this.state.durationRadio === "endIn") {
      Object.assign(modelUpdates, {
        startTime: "NOW",
        endTime: this.getISOTimeString(this.state.duration),
      });
    } else {
      delete modelUpdates.startTime;
      delete modelUpdates.endTime;
    }
    this.props.updateSimulation(modelUpdates);
  };

  onChange = ({ target }) => {
    const name = target.name;
    const value = target.type === 'checkbox' ? target.checked : target.value;
    this.setState({ [name]: value });
  }

  numDevicesIsValid = () => {
    const number = int(this.state.numDevices);
    return !isNaN(number) && number >= 0 && number <= 1000;
  }

  render () {
    const radioProps = (name, value) => {//TODO: remove from render
      return {
        name,
        value,
        checked: this.state[name] === value,
        onChange: this.onChange
      };
    };
    return (
      <form onSubmit={this.apply}>
        <FormSection>
          <SectionHeader>Target Iot Hub</SectionHeader>
          <SectionDesc>Add the connection string for your IoT Hub</SectionDesc>
          <FormGroup>
            <FormControl
              className="long"
              type={this.state.onBlur ? 'password' : 'text'}
              onBlur={this.inputOnBlur}
              onFocus={this.inputOnFocus}
              onChange={this.onChange}
              placeholder="Enter IoT Hub connection string" />
          </FormGroup>
        </FormSection>
        <FormSection>
          <SectionHeader>Device model</SectionHeader>
          <SectionDesc>Choose type of device to simulate.</SectionDesc>
          <FormGroup>
            <FormLabel>Select</FormLabel>
            <FormControl
              className="select-long"
              type="select"
              options={this.state.deviceModelOptions}
              value={this.state.deviceModel}
              onChange={value => this.onChange({ target: { name: 'deviceModel', value } })}
              clearable={false}
              searchable={true}
              placeholder="Select model" />
          </FormGroup>
        </FormSection>
        <FormSection>
          <SectionHeader>Number of devices</SectionHeader>
          <SectionDesc>Number of devices to simulate (maximum 1000 devices).</SectionDesc>
          <FormGroup>
            <FormLabel>Amount</FormLabel>
            <FormControl
              name="numDevices"
              type="number"
              placeholder="# devices"
              className="small"
              max="1000"
              onChange={this.onChange}
              value={this.state.numDevices} />
          </FormGroup>
        </FormSection>
        { this.state.deviceModel === 'custom' &&
          <FormSection>
            <SectionHeader>Telemetry frequency</SectionHeader>
            <SectionDesc>Set how often to send telemetry from each device</SectionDesc>
            <FormGroup>
              <FormControl type="duration" name="frequency" value={this.state.frequency.ms} onChange={this.onChange} />
            </FormGroup>
          </FormSection>
        }
        <FormSection>
          <SectionHeader>Simulation duration</SectionHeader>
          <SectionDesc>Set how long the simulation will run.</SectionDesc>
          <Radio {...radioProps('durationRadio', 'endIn')}>
            <FormLabel>End in:</FormLabel>
            <FormControl type="duration" name="duration" value={this.state.duration.ms} onChange={this.onChange} />
          </Radio>
          <Radio {...radioProps('durationRadio', 'indefinite')}>
            Run indefinitely
          </Radio>
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
