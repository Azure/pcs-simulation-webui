// Copyright (c) Microsoft. All rights reserved.

import React, { Component } from 'react';

import { svgs, int } from 'utilities';
import { SensorHeader, behaviorOptions, toSensorInput, toSensorSelect } from './sensors.utils';
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
  Radio,
  FormReplicator
} from 'components/shared';

import './simulation.sensors.css';

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
      sensors: []
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
    const deviceModels = [{
      id: deviceModel.value,
      count: numDevices,
      sensors,
      ...telemetryFrequency
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

  onSensorInputChange = ({ target: { name, value } }) => ({ name, value });

  onBehaviorChange = (value) => this.onSensorInputChange({target: { name: 'behavior', value }});

  addSensor = () => this.setState({
    sensors: [
      ...this.state.sensors,
      {
        name: '',
        behavior: '',
        minValue: '',
        maxValue: '',
        unit: ''
      }
    ]
  })

  updateSensors = (sensors) => this.setState({ sensors });

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
            <div className="sensors-container">
              { this.state.sensors.length > 0 && SensorHeader }
              <FormReplicator value={this.state.sensors} onChange={this.updateSensors}>
                {(sensor, index) => {
                    const { name, behavior, minValue, maxValue, unit } = sensor;
                    return (
                      <div key={index} className="sensor-container">
                        {toSensorInput("name", "text", "Enter sensor name", name, this.onSensorInputChange)}
                        {toSensorSelect("behavior", "select", "Select behavior", behavior, this.onBehaviorChange, behaviorOptions)}
                        {toSensorInput("minValue", "number", "Enter min value", minValue, this.onSensorInputChange)}
                        {toSensorInput("maxValue", "number", "Enter max value", maxValue, this.onSensorInputChange)}
                        {toSensorInput("unit", "text", "Enter unit value", unit, this.onSensorInputChange)}
                      </div>
                    );
                  }
                }
              </FormReplicator>
              <Btn svg={svgs.plus} type="button" onClick={this.addSensor}>
                Add sensor
              </Btn>
            </div>
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
