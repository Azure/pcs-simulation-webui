// Copyright (c) Microsoft. All rights reserved.

import React, { Component } from 'react';

import { Sensors } from './sensors';
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
      connectionStrFocused: false,
      preProvisionedRadio: 'preProvisioned',
      iotHubString: '',
      duration: {},
      durationRadio: '',
      frequency: {},
      deviceModelOptions: [{value: 'Custom', label: 'Custom', name: 'Custom'}],
      deviceModel: '',
      numDevices: '',
      sensors: {}
    };
  }

  componentDidMount() {
    this.getFormState(this.props);
  }

  componentWillReceiveProps(nextProps) {
    this.getFormState(nextProps);
  }

  getFormState = (props) => {
    const { deviceModels, simulation, connectionStringConfigured } = props;
    const deviceModelOptions = [
      ...this.state.deviceModelOptions,
      ...(deviceModels || []).map(this.toSelectOption)
    ];
    const deviceModel = simulation.deviceModels.length
      ? this.toSelectOption(simulation.deviceModels[0])
      : '';
    const numDevices = simulation.deviceModels.length
      ? simulation.deviceModels[0].count
      : 0;
    const iotHubString = (simulation || {}).connectionString || '';
    const preProvisionedRadio = connectionStringConfigured
      ? 'preProvisioned' : 'customString';
    this.setState({
      iotHubString,
      deviceModelOptions,
      deviceModel,
      numDevices,
      preProvisionedRadio
    });
  }

  inputOnBlur = () => this.setState({ connectionStrFocused: true })

  inputOnFocus = () => this.setState({ connectionStrFocused: false })

  toSelectOption = ({ id, name }) => ({ value: id, label: name ? name : id });

  convertDurationToISO = ({ hours, minutes, seconds }) => `NOW+PT${hours}H${minutes}M${seconds}S`;

  apply = (event) => {
    event.preventDefault();
    const {
      durationRadio,
      duration,
      deviceModel,
      iotHubString,
      numDevices,
      frequency,
      preProvisionedRadio,
      sensors
    } = this.state;
    const simulationDuration = (durationRadio === 'endIn') ? {
      startTime: 'NOW',
      endTime: this.convertDurationToISO(duration)
    } : {};
    const telemetryFrequency = frequency.ms > 0 ? { interval: `${frequency.hours}:${frequency.minutes}:${frequency.seconds}` } : {};
    const customSensors = Object.keys(sensors).length > 0 ? {sensors} : {};
    const deviceModels = [{
      id: deviceModel.value,
      count: numDevices,
      ...telemetryFrequency,
      ...customSensors
    }];
    const modelUpdates = {
      enabled: true,
      connectionString: preProvisionedRadio === 'preProvisioned' ? '' : iotHubString,
      deviceModels,
      ...simulationDuration
    };
    this.props.updateSimulation(modelUpdates);
  };

  onChange = ({ target }) => {
    const name = target.name;
    const value = target.type === 'checkbox' ? target.checked : target.value;
    this.setState({ [name]: value });
  }

  onDeviceModelChange = deviceModel => this.setState({ deviceModel });

  numDevicesIsValid = () => {
    const number = int(this.state.numDevices);
    return !isNaN(number) && number >= 0 && number <= 1000;
  }

  toRadioProps = (name, value) => {
    return {
      name,
      value,
      checked: this.state[name] === value,
      onChange: this.onChange
    };
  };

  onSensorSelectionChange = behavior => {
    const { sensorId, ...option } = behavior;
    this.setState({
      sensors: {
        ...this.state.sensors,
        [sensorId]: {
          ...this.state.sensors[sensorId],
          behavior: option
        }
      }
    });
  };

  onSensorInputChange = ({ target }) => {
    const { name, value, id } = target;
    this.setState({
      sensors: {
        ...this.state.sensors,
        [id]: {
          ...this.state.sensors[id],
          [name]: value
        }
      }
    });
  }

  addSensor = () => this.setState({
    sensors: {
      ...this.state.sensors,
      [`sensor-${Object.keys(this.state.sensors).length}`]: {
        name: '',
        behavior: '',
        minValue: '',
        maxValue: '',
        unit: ''
      }
    }
  })

  render () {
    return (
      <form onSubmit={this.apply}>
        <FormSection>
          <SectionHeader>Target Iot Hub</SectionHeader>
          <SectionDesc>Add the connection string for your IoT Hub</SectionDesc>
            <Radio { ...this.toRadioProps('preProvisionedRadio', 'preProvisioned') }>
              Use pre-provisioned IoT Hub
            </Radio>
            <Radio { ...this.toRadioProps('preProvisionedRadio', 'customString') }>
              <FormControl
                className="long"
                type={this.state.connectionStrFocused ? 'password' : 'text'}
                onBlur={this.inputOnBlur}
                onFocus={this.inputOnFocus}
                onChange={this.onChange}
                value={this.state.iotHubString}
                name="iotHubString"
                placeholder="Enter IoT Hub connection string" />
            </Radio>
        </FormSection>
        <FormSection>
          <SectionHeader>Device model</SectionHeader>
          <SectionDesc>Choose type of device to simulate.</SectionDesc>
          <FormGroup>
            <FormLabel>Select</FormLabel>
            <FormControl
              className="long"
              type="select"
              options={this.state.deviceModelOptions}
              value={this.state.deviceModel}
              onChange={this.onDeviceModelChange}
              clearable={false}
              searchable={true}
              placeholder="Select model" />
          </FormGroup>
        </FormSection>
        { (this.state.deviceModel || {}).label === 'Custom' &&
          <FormSection>
            <SectionHeader>Sensors</SectionHeader>
            <SectionDesc>Set parameters for telemetry sent for the sensor.</SectionDesc>
            <FormGroup>
              <Sensors
                sensors={this.state.sensors}
                onChange={this.onSensorInputChange}
                onSelectionChange={this.onSensorSelectionChange}
                addSensor={this.addSensor} />
            </FormGroup>
          </FormSection>
        }
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
        <FormSection>
          <SectionHeader>Telemetry frequency</SectionHeader>
          <SectionDesc>Set how often to send telemetry from each device</SectionDesc>
          <FormGroup>
            <FormControl type="duration" name="frequency" value={this.state.frequency.ms} onChange={this.onChange} />
          </FormGroup>
        </FormSection>
        <FormSection>
          <SectionHeader>Simulation duration</SectionHeader>
          <SectionDesc>Set how long the simulation will run.</SectionDesc>
          <Radio { ...this.toRadioProps('durationRadio', 'endIn') }>
            <FormLabel>End in:</FormLabel>
            <FormControl type="duration" name="duration" value={this.state.duration.ms} onChange={this.onChange} />
          </Radio>
          <Radio { ...this.toRadioProps('durationRadio', 'indefinite') }>
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
