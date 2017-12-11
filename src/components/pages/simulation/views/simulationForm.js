// Copyright (c) Microsoft. All rights reserved.

import React from 'react';
import moment from 'moment';

import Config from 'app.config';
import { svgs, LinkedComponent, Validator } from 'utilities';
import {
  Btn,
  BtnToolbar,
  ErrorMsg,
  FormActions,
  FormControl,
  FormGroup,
  FormLabel,
  FormReplicator,
  FormSection,
  Radio,
  SectionDesc,
  SectionHeader
} from 'components/shared';
import {
  SensorHeader,
  behaviorOptions,
  toSensorInput,
  toSensorSelect
} from './sensors.utils';

import './sensors.css';

// Sensor validators
const sensorNameValidator = (new Validator())
  .check(Validator.notEmpty, 'Name is required');

const sensorBehaviorValidator = (new Validator())
  .check(Validator.notEmpty, 'Behavior is required');

const sensorMinValueValidator = (new Validator())
  .check(Validator.notEmpty, 'Min value is required');

const sensorMaxValueValidator = (new Validator())
  .check(Validator.notEmpty, 'Max value is required');

const sensorUnitValueValidator = (new Validator())
  .check(Validator.notEmpty, 'Unit is required');

class SimulationForm extends LinkedComponent {

  constructor(props) {
    super(props);

    this.state = {
      connectionStrFocused: false,
      preProvisionedRadio: 'preProvisioned',
      iotHubString: '',
      duration: {},
      durationRadio: '',
      frequency: {},
      deviceModelOptions: [{value: 'Custom', label: 'Custom' }],
      deviceModel: '',
      numDevices: '',
      sensors: []
    };

    // State to input links
    this.iotHubString = this.linkTo('iotHubString')
      .check(Validator.notEmpty, 'IoT Hub connection string is required');

    this.deviceModel = this.linkTo('deviceModel')
      .check(Validator.notEmpty, 'A device model must be selected')

    this.numDevices = this.linkTo('numDevices')
      .check(Validator.notEmpty, 'Number of devices is required')
      .check(num => num > 0, 'Number of devices must be greater than zero')
      .check(num => num <= Config.maxSimulatedDevices, `Number of devices must be no greater than ${Config.maxSimulatedDevices}`);

    this.duration = this.linkTo('duration')
      .check(({ ms }) => ms > 0, 'Duration must be greater than zero');

    this.frequency = this.linkTo('frequency')
      .check(({ ms }) => ms > 0, 'Telemetry frequency must be greater than zero');

    // Validators
    this.hubValidator = (new Validator())
      .check(Validator.notEmpty)
      .check(value => (value === 'customString' && !this.iotHubString.error) || value === 'preProvisioned');

    this.durationRadioValidator = (new Validator())
      .check(Validator.notEmpty)
      .check(value => (value === 'endIn' && !this.duration.error) || value === 'indefinite');
  }

  formIsValid() {
    const { preProvisionedRadio, durationRadio } = this.state;
    const hubCorrect = !this.hubValidator.hasErrors(preProvisionedRadio);
    const deviceModelCorrect = !this.deviceModel.error;
    const numDevicesCorrect = !this.numDevices.error;
    const frequencyCorrect = !this.frequency.error;
    const durationCorrect = !this.durationRadioValidator.hasErrors(durationRadio);
    return hubCorrect
      && deviceModelCorrect
      && numDevicesCorrect
      && frequencyCorrect
      && durationCorrect;
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
    const interval = simulation.deviceModels.length
      ? simulation.deviceModels[0].interval
      : '00:00:00';
    const [hours, minutes, seconds] = interval.split(':');
    const iotHubString = (simulation || {}).connectionString || '';
    const preProvisionedRadio = connectionStringConfigured
      ? 'preProvisioned' : 'customString';
    const sensors = simulation.deviceModels.length
      ? (simulation.deviceModels[0].sensors || []).map(this.toSensorReplicable)
      : [];
    const { startTime, endTime } = simulation || {};
    const duration = (startTime && endTime)
      ? moment.duration(moment(endTime).diff(moment(startTime)))
      : {};

    this.setState({
      iotHubString,
      deviceModelOptions,
      deviceModel,
      numDevices,
      preProvisionedRadio,
      sensors,
      durationRadio: (startTime && endTime) ? 'endIn' : 'indefinite',
      duration: {
        ms: duration.asMilliseconds(),
        hours: duration.hours(),
        minutes: duration.minutes(),
        seconds: duration.seconds()
      },
      frequency: {
        ms: moment.duration(interval).asMilliseconds(),
        hours,
        minutes,
        seconds
      }
    });
  }

  toSensorReplicable = ({max, min, name, path, unit}) => ({
    name,
    behavior: (path => {
      switch (path) {
        case 'Increment':
          return { value: 'Math.Increasing', label: 'Increment' };
        case 'Random':
          return { value: 'Math.Random.WithinRange', label: 'Random' };
        case 'Decrement':
          return { value: 'Math.Decreasing', label: 'Decrement' };
        default:
          return '';
      }
    })(path),
    minValue: min,
    maxValue: max,
    unit
  })

  inputOnBlur = () => this.setState({ connectionStrFocused: true })

  inputOnFocus = () => this.setState({ connectionStrFocused: false })

  toSelectOption = ({ id, name }) => ({ value: id, label: name || id });

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

  toRadioProps = (name, value) => {
    return {
      name,
      value,
      checked: this.state[name] === value,
      onChange: this.onChange
    };
  };

  onSensorInputChange = ({ target: { name, value } }) => ({ name, value });

  addSensor = () => this.setState({
    sensors: [ ...this.state.sensors, this.toNewSensor() ]
  })

  toNewSensor = () => ({
    name: '',
    behavior: '',
    minValue: '',
    maxValue: '',
    unit: ''
  })

  updateSensors = (sensors) => this.setState({ sensors });

  render () {
    const sensors = this.state.deviceModel.value === 'Custom' ? this.state.sensors : [];
    const sensorErrors = sensors.map(
      sensor => {
        const name = sensorNameValidator.hasErrors(sensor.name);
        const behavior = sensorBehaviorValidator.hasErrors(sensor.behavior);
        const minValue = sensorMinValueValidator.hasErrors(sensor.minValue);
        const maxValue = sensorMaxValueValidator.hasErrors(sensor.maxValue);
        const unit = sensorUnitValueValidator.hasErrors(sensor.unit);
        const edited = !(!sensor.name && !sensor.behavior && !sensor.minValue && !sensor.maxValue && !sensor.unit);
        const error = (edited && (name || behavior || minValue || maxValue || unit)) || '';
        return { name, behavior, minValue, maxValue, unit, edited, error };
      }
    );
    const sensorsHaveErrors = sensorErrors.some(({ error }) => !!error);
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
                link={this.iotHubString}
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
              link={this.deviceModel}
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
                {
                  (_, idx) => {
                    const { name, behavior, minValue, maxValue, unit, edited, error } = sensorErrors[idx];
                    return (
                      <div className="sensor-container">
                        <div className="sensor-row">
                          { toSensorInput("name", "text", "Enter sensor name", this.onSensorInputChange, edited && !!name) }
                          { toSensorSelect("behavior", "select", "Select behavior", this.onSensorInputChange, behaviorOptions, edited && !!behavior) }
                          { toSensorInput("minValue", "number", "Enter min value", this.onSensorInputChange, edited && !!minValue) }
                          { toSensorInput("maxValue", "number", "Enter max value", this.onSensorInputChange, edited && !!maxValue) }
                          { toSensorInput("unit", "text", "Enter unit value", this.onSensorInputChange, edited && !!unit) }
                          <Btn className="deleteSensorBtn" svg={svgs.trash} type="button" deletebtn="deletebtn" />
                        </div>
                        { error && <ErrorMsg>{ error }</ErrorMsg>}
                      </div>
                    );
                  }
                }
              </FormReplicator>
              {
                this.state.sensors.length < 10 &&
                <Btn svg={svgs.plus} type="button" onClick={this.addSensor}>Add sensor</Btn>
              }
            </div>
          </FormSection>
        }
        <FormSection>
          <SectionHeader>Number of devices</SectionHeader>
          <SectionDesc>Number of devices to simulate (maximum { Config.maxSimulatedDevices } devices).</SectionDesc>
          <FormGroup>
            <FormLabel>Amount</FormLabel>
            <FormControl
              type="number"
              placeholder="# devices"
              className="small"
              max={Config.maxSimulatedDevices}
              link={this.numDevices} />
          </FormGroup>
        </FormSection>
        <FormSection>
          <SectionHeader>Telemetry frequency</SectionHeader>
          <SectionDesc>Set how often to send telemetry from each device</SectionDesc>
          <FormGroup>
            <FormControl type="duration" name="frequency" link={this.frequency} />
          </FormGroup>
        </FormSection>
        <FormSection>
          <SectionHeader>Simulation duration</SectionHeader>
          <SectionDesc>Set how long the simulation will run.</SectionDesc>
          <Radio { ...this.toRadioProps('durationRadio', 'endIn') }>
            <FormLabel>End in:</FormLabel>
            <FormControl type="duration" link={this.duration} />
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
              disabled={!this.formIsValid() || sensorsHaveErrors}>
                Start Simulation
            </Btn>
          </BtnToolbar>
        </FormActions>
      </form>
    );
  }
}

export default SimulationForm;
