// Copyright (c) Microsoft. All rights reserved.

import React from 'react';

import { svgs, LinkedComponent, Validator } from 'utilities';
import {
  Btn,
  BtnToolbar,
  ErrorMsg,
  FormActions,
  FormControl,
  FormGroup,
  FormLabel,
  FormSection,
  SectionHeader,
  SectionDesc,
} from 'components/shared';
import {
  behaviorOptions,
  toSensorInput,
  toSensorSelect
} from '../../../simulation/views/sensors.utils';
import Flyout from 'components/shared/flyout';
import './deviceModelForm.css'

const Section = Flyout.Section;

// Creates a state object for a sensor
const newSensor = () => ({
  name: '',
  behavior: '',
  minValue: '',
  maxValue: '',
  unit: ''
});

const isRealRegex = /^-?(([1-9][0-9]*)*|0?)\.?\d*$/;
const nonReal = x => !x.match(isRealRegex);
const stringToFloat = x => x === '' || x === '-' ? x : parseFloat(x);

const initialFormState = {
  name: '',
  description: '',
  version: '',
  interval: {},
  frequency: {},
  sensors: [],
  changesApplied: false,
}

class DeviceModelForm extends LinkedComponent {

  constructor(props) {
    super(props);

    this.state = {
      ...initialFormState,
      formVersion: 0
    };

    const { t } = props;
    // State to input links
    this.nameLink = this.linkTo('name')
      .check(Validator.notEmpty, () => t('deviceModels.flyouts.errorMsg.nameCantBeEmpty'));
    this.descriptionLink = this.linkTo('description');
    this.versionLink = this.linkTo('version');
    this.intervalLink = this.linkTo('interval')
      .check(({ ms }) => ms >= 1000, () => t('deviceModels.flyouts.errorMsg.intervalCantBeLessThanOneSecond'));
    this.frequencyLink = this.linkTo('frequency')
      .check(({ ms }) => ms >= 10000, () => t('deviceModels.flyouts.errorMsg.frequencyCantBeLessThanTenSeconds'));
    this.sensorsLink = this.linkTo('sensors');
  }

  formIsValid() {
    return [
      this.nameLink,
      this.sensorsLink,
      this.intervalLink,
      this.frequencyLink
    ].every(link => !link.error);
  }

  toSelectOption = ({ id, name }) => ({ value: id, label: name });

  addSensor = () => this.sensorsLink.set([ ...this.sensorsLink.value, newSensor() ]);

  deleteSensor = (index) =>
    (evt) => this.sensorsLink.set(this.sensorsLink.value.filter((_, idx) => index !== idx));

  clearAll = () => this.setState({ ...initialFormState, formVersion: ++this.state.formVersion });

  setFormChangesFlag = () => this.setState({ changesApplied: false });

  apply = (event) => {
    event.preventDefault();
    const {
      frequency,
      interval,
      description,
      name,
      version,
      sensors
    } = this.state;
    const simulationFrequency = frequency.ms > 0 ? { frequency: `${frequency.hours}:${frequency.minutes}:${frequency.seconds}` } : {};
    const telemetryInterval = interval.ms > 0 ? { interval: `${interval.hours}:${interval.minutes}:${interval.seconds}` } : {};
    const model = {
      name,
      description,
      version,
      sensors,
      ...simulationFrequency,
      ...telemetryInterval
    };
    this.props.createDeviceModel(model);
    this.setState({ changesApplied: true });
  };

  render () {
    const { t } = this.props;
    const { sensors, changesApplied, formVersion } = this.state;

    // Create the state link for the dynamic form elements
    const sensorLinks = this.sensorsLink.getLinkedChildren(sensorLink => {
      const name = sensorLink.forkTo('name')
        .check(Validator.notEmpty, t('deviceModels.flyouts.errorMsg.dataPointNameCantBeEmpty'));
      const behavior = sensorLink.forkTo('behavior')
        .check(Validator.notEmpty, t('deviceModels.flyouts.errorMsg.behaviorCantBeEmpty'));
      const minValue = sensorLink.forkTo('minValue')
        .reject(nonReal)
        .check(x => Validator.notEmpty(x === '-' ||  x === '.' ? '' : x), t('deviceModels.flyouts.errorMsg.minValueCantBeEmpty'))
        .check(x => stringToFloat(x) < stringToFloat(maxValue.value), t('deviceModels.flyouts.errorMsg.minValueMustBeLessThanMax'));
      const maxValue = sensorLink.forkTo('maxValue')
        .reject(nonReal)
        .check(x => Validator.notEmpty(x === '-' ||  x === '.' ? '' : x), t('deviceModels.flyouts.errorMsg.maxValueCantBeEmpty'))
        .check(x => stringToFloat(x) > stringToFloat(minValue.value),  t('deviceModels.flyouts.errorMsg.maxValueMustBeGreaterThanMin'));
      const unit = sensorLink.forkTo('unit')
        .check(Validator.notEmpty, t('deviceModels.flyouts.errorMsg.unitValueCantBeEmpty'));
      const edited = !(!name.value && !behavior.value && !minValue.value && !maxValue.value && !unit.value);
      const error = (edited && (name.error || behavior.error || minValue.error || maxValue.error || unit.error)) || '';
      return { name, behavior, minValue, maxValue, unit, edited, error };
    });

    const editedSensors = sensorLinks.filter(({ edited }) => edited);
    const hasErrors = editedSensors.some(({ error }) => !!error);
    const sensorsHaveErrors = (editedSensors.length === 0 || hasErrors);
    const sensorHeaders = [
      t('deviceModels.flyouts.sensors.dataPoint'),
      t('deviceModels.flyouts.sensors.behavior'),
      t('deviceModels.flyouts.sensors.min'),
      t('deviceModels.flyouts.sensors.max'),
      t('deviceModels.flyouts.sensors.unit')
    ];

    return (
      <form key={`device-model-form-${formVersion}`} onSubmit={this.apply} className='device-model-form-container'>
        <Section.Container>
          <Section.Content>
            <FormSection>
              <FormGroup>
                <FormLabel>
                  {t('deviceModels.flyouts.new.name')}
                </FormLabel>
                <FormControl
                  type="text"
                  className="long"
                  placeholder={t('deviceModels.flyouts.new.name')}
                  onChange={this.setFormChangesFlag}
                  link={this.nameLink} />
              </FormGroup>
              <FormGroup>
                <FormLabel>
                  {t('deviceModels.flyouts.new.description')}
                </FormLabel>
                <FormControl
                  type="textarea"
                  placeholder="Description"
                  onChange={this.setFormChangesFlag}
                  link={this.descriptionLink} />
              </FormGroup>
              <FormGroup>
                <FormLabel>
                  {t('deviceModels.flyouts.new.version')}
                </FormLabel>
                <FormControl
                  type="text"
                  className="short"
                  placeholder={t('deviceModels.flyouts.new.version')}
                  onChange={this.setFormChangesFlag}
                  link={this.versionLink} />
              </FormGroup>
            </FormSection>
            <FormSection>
              <SectionHeader>{t('deviceModels.flyouts.new.telemetry')}</SectionHeader>
              <SectionDesc>{t('deviceModels.flyouts.new.telemetryDescription')}</SectionDesc>
              {
                sensors.length < 10 &&
                  <Btn svg={svgs.plus} onClick={this.addSensor}>{t('deviceModels.flyouts.new.addDataPoint')}</Btn>
              }
              <div className="sensors-container">
              {
                sensors.length > 0 &&
                  <div className="sensor-headers">
                    { sensorHeaders.map((header, idx) => (
                      <div className="sensor-header" key={idx}>{header}</div>
                    )) }
                  </div>
              }
              {
                sensorLinks.map(({ name, behavior, minValue, maxValue, unit, edited, error }, idx) => (
                  <div className="sensor-container" key={idx}>
                    <div className="sensor-row">
                      { toSensorInput(name, t('deviceModels.flyouts.sensors.dataPointPlaceHolder'), edited && !!name.error, this.setFormChangesFlag) }
                      { toSensorSelect(behavior, 'select', t('deviceModels.flyouts.sensors.behaviorPlaceHolder'), behaviorOptions, edited && !!behavior.error, this.setFormChangesFlag) }
                      { toSensorInput(minValue, t('deviceModels.flyouts.sensors.minPlaceHolder'), edited && !!minValue.error, this.setFormChangesFlag) }
                      { toSensorInput(maxValue, t('deviceModels.flyouts.sensors.maxPlaceHolder'), edited && !!maxValue.error, this.setFormChangesFlag) }
                      { toSensorInput(unit, t('deviceModels.flyouts.sensors.unitPlaceHolder'), edited && !!unit.error, this.setFormChangesFlag) }
                      <Btn className="delete-sensor-btn" svg={svgs.trash} onClick={this.deleteSensor(idx)} />
                    </div>
                    { error && <ErrorMsg>{ error }</ErrorMsg>}
                  </div>
                ))
              }
              </div>
            </FormSection>
            <FormSection>
              <SectionDesc>{t('deviceModels.flyouts.new.interval')}</SectionDesc>
              <FormGroup>
                <FormControl type="duration" name="interval" link={this.intervalLink} onChange={this.setFormChangesFlag} />
              </FormGroup>
            </FormSection>
            <FormSection>
              <SectionDesc>{t('deviceModels.flyouts.new.frequency')}</SectionDesc>
              <FormGroup>
                <FormControl type="duration" name="frequency" link={this.frequencyLink} onChange={this.setFormChangesFlag} />
              </FormGroup>
            </FormSection>
            <FormActions>
              <BtnToolbar>
                <Btn
                  disabled={!this.formIsValid() || sensorsHaveErrors || changesApplied}
                  type="submit">
                  {t('deviceModels.flyouts.save')}
                </Btn>
                <Btn svg={svgs.cancelX} onClick={this.clearAll}>{t('deviceModels.flyouts.clearAll')}</Btn>
              </BtnToolbar>
            </FormActions>
          </Section.Content>
        </Section.Container>
      </form>
    );
  }
}

export default DeviceModelForm;
