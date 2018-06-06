// Copyright (c) Microsoft. All rights reserved.

import React from 'react';
import moment from 'moment';

import Config from 'app.config';
import { svgs, LinkedComponent, Validator, int } from 'utilities';
import {
  Btn,
  BtnToolbar,
  FormActions,
  FormControl,
  FormGroup,
  FormLabel,
  FormSection,
  Radio,
  SectionDesc,
  SectionHeader
} from 'components/shared';

const newDeviceModel = () => ({
  name: '',
  count: 0,
  messageThroughput: '',
  interval: ''
});

const isIntRegex = /^-?\d*$/;
const nonInteger = x => !x.match(isIntRegex);
const stringToInt = x => x === '' || x === '-' ? x : int(x);

class SimulationForm extends LinkedComponent {

  constructor(props) {
    super(props);

    this.state = {
      connectionStrFocused: false,
      preprovisionedIoTHub: false,
      preProvisionedRadio: '',
      iotHubString: '',
      duration: {},
      durationRadio: '',
      frequency: {},
      deviceModelOptions: [],
      deviceModel: '',
      deviceModels: []
    };

    // State to input links
    this.iotHubString = this.linkTo('iotHubString')
      .check(Validator.notEmpty, props.t('simulation.form.errorMsg.hubNameCantBeEmpty'));

    this.deviceModel = this.linkTo('deviceModel')
      .check(Validator.notEmpty, props.t('simulation.form.errorMsg.deviceModelIsRequired'))

    this.duration = this.linkTo('duration')
      .check(({ ms }) => ms > 0, props.t('simulation.form.errorMsg.durationMustBeGTZero'));

    this.targetHub = this.linkTo('preProvisionedRadio')
      .check(Validator.notEmpty)
      .check(value => (value === 'customString' && !this.iotHubString.error) || value === 'preProvisioned');

    this.durationRadio = this.linkTo('durationRadio')
      .check(Validator.notEmpty)
      .check(value => (value === 'endIn' && !this.duration.error) || value === 'indefinite');

    this.sensorLink = this.linkTo('sensors');
    this.deviceModelsLink = this.linkTo('deviceModels');
  }

  formIsValid() {
    return [
      this.targetHub,
      this.durationRadio
    ].every(link => !link.error);
  }

  componentDidMount() {
    this.getFormState(this.props);
  }

  componentWillReceiveProps(nextProps) {
    this.getFormState(nextProps);
  }

  componentDidUpdate(prevProps, prevState) {
    const { deviceModels: prevModels } = prevState;
    const { deviceModels } = this.state;

    // Populate telemetry interval for each device model
    for (let index = 0; index < deviceModels.length; index++) {
      const modelName = deviceModels[index].name;

      if (modelName !== ((prevModels || [])[index] || {}).name) {
        this.setTelemetryFrequncy(modelName, index);
      }
    }
  }

  getFormState = (props) => {
    const {
      deviceModels,
      simulation,
      preprovisionedIoTHub,
      preprovisionedIoTHubInUse,
      preprovisionedIoTHubMetricsUrl
    } = props;
    const deviceModelOptions = (deviceModels || []).map(this.toSelectOption);
    const iotHubString = (simulation || {}).connectionString || '';
    const preProvisionedRadio = preprovisionedIoTHub && iotHubString === '' ? 'preProvisioned' : 'customString';
    const { startTime, endTime } = simulation || {};
    const duration = (startTime && endTime)
      ? moment.duration(moment(endTime).diff(moment(startTime)))
      : moment.duration('00:00:00');

    this.setState({
      iotHubString,
      deviceModelOptions,
      preProvisionedRadio,
      preprovisionedIoTHub,
      preprovisionedIoTHubInUse,
      preprovisionedIoTHubMetricsUrl,
      durationRadio: (startTime && endTime) ? 'endIn' : 'indefinite',
      duration: {
        ms: duration.asMilliseconds(),
        hours: duration.hours(),
        minutes: duration.minutes(),
        seconds: duration.seconds()
      },
      deviceModels: (simulation.deviceModels || []).map(this.toDeviceModelReplicable)
    });
  }

  toDeviceModelReplicable = ({ id, count, interval }) => ({
    name: id,
    count,
    interval: this.toTelemetryInterval(interval)
  })

  setTelemetryFrequncy = (name, idx) => {
    const { deviceModelEntities } = this.props;
    const { deviceModels } = this.state;

    if (!name || !deviceModelEntities) return;

    const timespan = this.props.deviceModelEntities[name].simulation.Interval || '00:00:00';
    const interval = this.toTelemetryInterval(timespan);

    this.setState({
      deviceModels: deviceModels.map((model, index) =>
        (index === idx) ? { ...model, interval } : model)
    });
  }

  toTelemetryInterval = timespan => {
    const duration = moment.duration(timespan);
    return {
      ms: duration.asMilliseconds(),
      hours: duration.hours(),
      minutes: duration.minutes(),
      seconds: duration.seconds()
    };
  }

  inputOnBlur = () => this.setState({ connectionStrFocused: false })

  inputOnFocus = () => this.setState({ connectionStrFocused: true })

  toSelectOption = ({ id, name, simulation: { Interval = {} } = {}  }) => ({ value: id, label: name || id, interval: Interval });

  convertDurationToISO = ({ hours, minutes, seconds }) => `NOW+PT${hours}H${minutes}M${seconds}S`;

  apply = (event) => {
    event.preventDefault();
    const {
      durationRadio,
      duration,
      deviceModels,
      iotHubString,
      preProvisionedRadio,
    } = this.state;
    const simulationDuration = (durationRadio === 'endIn') ? {
      startTime: 'NOW',
      endTime: this.convertDurationToISO(duration)
    } : {};

    const modelUpdates = {
      enabled: true,
      connectionString: preProvisionedRadio === 'preProvisioned' ? '' : iotHubString,
      deviceModels,
      ...simulationDuration
    };
    console.log('devicemodels', deviceModels)
    this.props.updateSimulation(modelUpdates);
  };

  addDeviceModel = () => this.deviceModelsLink.set([ ...this.deviceModelsLink.value, newDeviceModel() ]);

  deleteDeviceModel = (index) =>
    (evt) => this.deviceModelsLink.set(this.deviceModelsLink.value.filter((_, idx) => index !== idx));

  render () {
    const { t } = this.props;
    const { deviceModels } = this.state;
    const connectStringInput = (
      <FormControl
        className="long"
        type={this.state.connectionStrFocused ? 'text' : 'password'}
        onBlur={this.inputOnBlur}
        onFocus={this.inputOnFocus}
        link={this.iotHubString}
        placeholder="Enter IoT Hub connection string" />
    );

    const deviceModelLinks = this.deviceModelsLink.getLinkedChildren(deviceModelLink => {
      const name = deviceModelLink.forkTo('name')
          .check(Validator.notEmpty, t('simulation.form.errorMsg.deviceModelNameCantBeEmpty'));
      const maxSimulatedDevices = Config.maxSimulatedDevices;
      const count = deviceModelLink.forkTo('count')
        .reject(nonInteger)
        .map(stringToInt)
        .check(x => Validator.notEmpty(x === '-' ? '' : x), t('simulation.form.errorMsg.countCantBeEmpty'))
        .check(num => num > 0, t('simulation.form.errorMsg.countShouldBeGTZero'))
        .check(num => num <= Config.maxSimulatedDevices, t('simulation.form.errorMsg.countShouldBeLTMax', { maxSimulatedDevices}));

      const interval = deviceModelLink.forkTo('interval')
          .check(({ ms }) => ms >= 10000, t('frequencyCantBeLessThanTenSeconds'));

      const edited = !(!name.value && !count.value);
      const error = (edited && (name.error || count.error));

      return { name, count, interval, edited, error };
    });

    const editedDeviceModel = deviceModelLinks.filter(({ edited }) => edited);
    const someDeviceModelLinksHasErrors = editedDeviceModel.some(({ error }) => !!error);
    const deviceModelsHaveError = (deviceModelLinks.length === 0 || someDeviceModelLinksHasErrors);
    const deviceModelHeaders = [
      t('simulation.form.deviceModels.name'),
      t('simulation.form.deviceModels.count'),
      t('simulation.form.deviceModels.throughput'),
      t('simulation.form.deviceModels.duration')
    ];

    return (
      <form onSubmit={this.apply}>
        <FormSection>
          <SectionHeader>{t('simulation.form.targetHub.header')}</SectionHeader>
          <SectionDesc>{t('simulation.form.targetHub.description')}</SectionDesc>
          { this.state.preprovisionedIoTHub
            ? <div>
                <Radio link={this.targetHub} value="preProvisioned">
                    {t('simulation.form.targetHub.usePreProvisionedBtn')}
                </Radio>
                <Radio link={this.targetHub} value="customString">
                  {connectStringInput}
                </Radio>
              </div>
            : connectStringInput
          }
        </FormSection>
        <FormSection>
          <SectionHeader>{t('simulation.form.deviceModels.header')}</SectionHeader>
          <SectionDesc>{t('simulation.form.deviceModels.description')}</SectionDesc>
          <div className="device-models-container">
          {
            deviceModels.length > 0 &&
              <div className="device-model-headers">
                { deviceModelHeaders.map((header, idx) => (
                    <div className="device-model-header" key={idx}>{header}</div>
                  ))
                }
              </div>
          }
          {
            deviceModelLinks.map(({ name, count, interval, edited, error }, idx) => {
              let throughput = 0;
              if (count.value && interval.value.ms) {
                throughput = (count.value * 1000) / interval.value.ms
              }

              return (
                <div className="device-model-row" key={idx}>
                  <FormGroup className="device-model-box">
                    <FormControl
                      className="long"
                      type="select"
                      options={this.state.deviceModelOptions}
                      link={name}
                      clearable={false}
                      searchable={true}
                      simpleValue={true}
                      placeholder="Select model" />
                  </FormGroup>
                  <FormGroup className="device-model-box">
                    <FormControl
                      className="short"
                      type="text"
                      link={count}
                      max={Config.maxSimulatedDevices} />
                  </FormGroup>
                  <FormGroup className="device-model-box">
                    <FormControl
                      className="short"
                      type="text"
                      readOnly
                      value={throughput} />
                  </FormGroup>
                  <FormGroup className="duration-box">
                    <FormControl
                      type="duration"
                      name="frequency"
                      link={interval}
                      showHeaders={false} />
                  </FormGroup>
                  <Btn
                    className="delete-device-model-btn"
                    svg={svgs.trash}
                    onClick={this.deleteDeviceModel(idx)} />
                </div>
              );
            })
          }
          </div>
          {
            deviceModels.length < 10 &&
              <Btn
                svg={svgs.plus}
                onClick={this.addDeviceModel}>
                {t('simulation.form.deviceModels.addDeviceModelBtn')}
              </Btn>
          }
        </FormSection>



        <FormSection>
          <SectionHeader>{t('simulation.form.duration.header')}</SectionHeader>
          <SectionDesc>{t('simulation.form.duration.description')}</SectionDesc>
          <Radio link={this.durationRadio} value="endIn">
            <FormLabel>{t('simulation.form.duration.endsInBtn')}</FormLabel>
            <FormControl type="duration" link={this.duration} />
          </Radio>
          <Radio link={this.durationRadio} value="indefinite">
              {t('simulation.form.duration.runIndefinitelyBtn')}
          </Radio>
        </FormSection>
        <FormActions>
          <BtnToolbar>
            <Btn
              svg={svgs.startSimulation}
              type="submit"
              className="apply-btn"
              disabled={!this.formIsValid() || deviceModelsHaveError}>
                { t('simulation.start') }
            </Btn>
          </BtnToolbar>
        </FormActions>
      </form>
    );
  }
}

export default SimulationForm;
