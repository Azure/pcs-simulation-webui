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
  interval: {},
  frequency: {},
  sensors: [],
}

class DeviceModelForm extends LinkedComponent {

  constructor(props) {
    super(props);

    this.state = {
      ...initialFormState
    };

    const { t } = props;
    // State to input links
    this.nameLink = this.linkTo('name')
      .check(Validator.notEmpty, () => t('deviceModels.flyouts.errorMsg.nameCantBeEmpty'));
    this.descriptionLink = this.linkTo('description');
    this.intervalLink = this.linkTo('interval')
      .check(({ ms }) => ms >= 1000, () => t('deviceModels.flyouts.errorMsg.intervalCantLessThanOneSecond'));
    this.frequencyLink = this.linkTo('frequency')
      .check(({ ms }) => ms >= 10000, () => t('deviceModels.flyouts.errorMsg.frequencyCantLessThanTenSeconds'));
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

  apply = (event) => {
    event.preventDefault();
    // TODO: calling new device group API
  };

  addSensor = () => this.sensorsLink.set([ ...this.sensorsLink.value, newSensor() ]);

  deleteSensor = (index) =>
    (evt) => this.sensorsLink.set(this.sensorsLink.value.filter((_, idx) => index !== idx));

  clearAll = () => this.setState(initialFormState);

  render () {
    const { onClose, t } = this.props;

    // Create the state link for the dynamic form elements
    const sensorLinks = this.sensorsLink.getLinkedChildren(sensorLink => {
      const name = sensorLink.forkTo('name')
        .check(Validator.notEmpty, 'Name is required');
      const behavior = sensorLink.forkTo('behavior')
        .check(Validator.notEmpty, 'Behavior is required');
      const minValue = sensorLink.forkTo('minValue')
        .reject(nonReal)
        .check(x => Validator.notEmpty(x === '-' ||  x === '.' ? '' : x), 'Min value is required')
        .check(x => stringToFloat(x) < stringToFloat(maxValue.value), `Min value must be less than the max value`);
      const maxValue = sensorLink.forkTo('maxValue')
        .reject(nonReal)
        .check(x => Validator.notEmpty(x === '-' ||  x === '.' ? '' : x), 'Max value is required')
        .check(x => stringToFloat(x) > stringToFloat(minValue.value), 'Max value must be greater than the min value');
      const unit = sensorLink.forkTo('unit')
        .check(Validator.notEmpty, 'Unit is required');
      const edited = !(!name.value && !behavior.value && !minValue.value && !maxValue.value && !unit.value);
      const error = (edited && (name.error || behavior.error || minValue.error || maxValue.error || unit.error)) || '';
      return { name, behavior, minValue, maxValue, unit, edited, error };
    });

    const editedSensors = sensorLinks.filter(({ edited }) => edited);
    const hasErrors = editedSensors.some(({ error }) => !!error);
    const sensorsHaveErrors = (editedSensors.length === 0 || hasErrors);
    const sensorHeaders = [
      t('deviceModels.flyouts.new.dataPoint'),
      t('deviceModels.flyouts.new.behavior'),
      t('deviceModels.flyouts.new.min'),
      t('deviceModels.flyouts.new.max'),
      t('deviceModels.flyouts.new.unit')
    ];

    return (
      <form onSubmit={this.apply} className='device-model-form-container'>
        <Section.Container>
          <Section.Content>
            <FormSection>
              <FormGroup>
                <FormLabel isRequired="true">
                  {t('deviceModels.flyouts.new.name')}
                </FormLabel>
                <FormControl
                  type="text"
                  className="long"
                  placeholder={t('deviceModels.flyouts.new.name')}
                  link={this.nameLink} />
              </FormGroup>
              <FormGroup>
                <FormLabel>
                  {t('deviceModels.flyouts.new.description')}
                </FormLabel>
                <FormControl
                  type="textarea"
                  placeholder="Description"
                  link={this.descriptionLink} />
              </FormGroup>
            </FormSection>
            <FormSection>
              <SectionHeader>Telemetry data</SectionHeader>
              <SectionDesc>Set parameters for telemetry sent for the sensor.</SectionDesc>
              { this.state.sensors.length < 10 &&
                <Btn svg={svgs.plus} onClick={this.addSensor}>Add a data point</Btn>
              }
              <div className="sensors-container">
                { this.state.sensors.length > 0 &&
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
                        { toSensorInput(name, 'Enter sensor name', edited && !!name.error) }
                        { toSensorSelect(behavior, 'select', 'Select behavior', behaviorOptions, edited && !!behavior.error) }
                        { toSensorInput(minValue, 'Enter min value', edited && !!minValue.error) }
                        { toSensorInput(maxValue, 'Enter max value', edited && !!maxValue.error) }
                        { toSensorInput(unit, 'Enter unit value', edited && !!unit.error) }
                        <Btn className="delete-sensor-btn" svg={svgs.trash} onClick={this.deleteSensor(idx)} />
                      </div>
                      { error && <ErrorMsg>{ error }</ErrorMsg>}
                    </div>
                  ))
                }
              </div>
            </FormSection>
            <FormSection>
              <SectionDesc>Min/Max changes occur every:</SectionDesc>
              <FormGroup>
                <FormControl type="duration" name="frequency" link={this.intervalLink} />
              </FormGroup>
            </FormSection>
            <FormSection>
              <SectionDesc>Report Min/Max changes every:</SectionDesc>
              <FormGroup>
                <FormControl type="duration" name="frequency" link={this.frequencyLink} />
              </FormGroup>
            </FormSection>
            <FormActions>
              <BtnToolbar>
                <Btn
                  primary
                  disabled={!this.formIsValid() || sensorsHaveErrors}
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
