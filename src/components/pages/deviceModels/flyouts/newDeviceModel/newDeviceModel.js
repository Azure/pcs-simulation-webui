// Copyright (c) Microsoft. All rights reserved.

import React from 'react';
import {
  Btn,
  BtnToolbar,
  FormActions,
  FormControl,
  FormGroup,
  FormLabel,
  Radio,
  ErrorMsg,
  SectionHeader,
  FormSection,
} from 'components/shared';
import { svgs, LinkedComponent, Validator, int } from 'utilities';
import Flyout from 'components/shared/flyout';
import {
  SectionDesc
} from 'components/shared';

import {
  SensorHeader,
  behaviorOptions,
  toSensorInput,
  toSensorSelect
} from '../../../simulation/views/sensors.utils';

import './newDeviceModel.css';

const Section = Flyout.Section;

// A counter for creating unique keys per new condition
let conditionKey = 0;

// Creates a state object for a condition
const newCondition = () => ({
  value: '',
  key: conditionKey++ // Used by react to track the rendered elements
});

// Sensor validators
const sensorNameValidator = (new Validator())
  .check(Validator.notEmpty, 'Name is required');

const sensorBehaviorValidator = (new Validator())
  .check(Validator.notEmpty, 'Behavior is required');

const sensorUnitValueValidator = (new Validator())
  .check(Validator.notEmpty, 'Unit is required');

const newSensor = () => ({
  name: '',
  behavior: '',
  minValue: '',
  maxValue: '',
  unit: ''
});

const isIntRegex = /^-?\d*$/;
const isRealRegex = /^-?(([1-9][0-9]*)*|0?)\.?\d*$/;
const nonInteger = x => !x.match(isIntRegex);
const nonReal = x => !x.match(isRealRegex);
const stringToInt = x => x === '' || x === '-' ? x : int(x);
const stringToFloat = x => x === '' || x === '-' ? x : parseFloat(x);

// TODO: Translate all the hard coded strings
export class NewDeviceModel extends LinkedComponent {

  constructor(props) {
    super(props);

    this.state = {
      name: '',
      description: '',
      conditions: [ newCondition() ], // Start with one condition
      sensors: []
    };

    // State links
    this.ruleName = this.linkTo('name')
      .check(Validator.notEmpty, 'Device model name is required');

    this.description = this.linkTo('description')
      .check(Validator.notEmpty, 'Device model description is required');

    this.conditions = this.linkTo('conditions');
    this.sensorLink = this.linkTo('sensors');
  }

  addCondition = () => this.conditions.set([ ...this.conditions.value, newCondition() ]);

  addSensor = () => this.sensorLink.set([ ...this.sensorLink.value, newSensor() ]);

  deleteSensor = (index) =>
    (evt) => this.sensorLink.set(this.sensorLink.value.filter((_, idx) => index !== idx));

  deleteCondition = (index) =>
    () => this.conditions.set(this.conditions.value.filter((_, idx) => index !== idx));

  createRule = (event) => {
    event.preventDefault();
    console.log('TODO: Handle the form submission');
  }

  formIsValid() {
    return [
      this.ruleName,
      this.description,
    ].every(link => !link.error);
  }

  render() {
    const { onClose, t } = this.props;

    // Create the state link for the dynamic form elements
    const conditionLinks = this.conditions.getLinkedChildren(conditionLink => {
      const value = conditionLink.forkTo('value');
      return { value };
    });

    const sensorLinks = this.sensorLink.getLinkedChildren(sensorLink => {
      const name = sensorLink.forkTo('name')
        .withValidator(sensorNameValidator);
      const behavior = sensorLink.forkTo('behavior')
        .withValidator(sensorBehaviorValidator);
      const minValue = sensorLink.forkTo('minValue')
        .reject(nonReal)
        .check(x => Validator.notEmpty(x === '-' ||  x === '.' ? '' : x), 'Min value is required')
        .check(x => stringToFloat(x) < stringToFloat(maxValue.value), `Min value must be less than the max value`);
      const maxValue = sensorLink.forkTo('maxValue')
        .reject(nonReal)
        .check(x => Validator.notEmpty(x === '-' ||  x === '.' ? '' : x), 'Max value is required')
        .check(x => stringToFloat(x) > stringToFloat(minValue.value), 'Max value must be greater than the min value');
      const unit = sensorLink.forkTo('unit')
        .withValidator(sensorUnitValueValidator);
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
      <Flyout.Container className="new-rule-flyout-container">
        <Flyout.Header>
          <Flyout.Title>{t('deviceModels.flyouts.new.title')}</Flyout.Title>
          <Flyout.CloseBtn onClick={onClose} />
        </Flyout.Header>
        <Flyout.Content >
          <form onSubmit={this.createRule}>
            <Section.Container className="rule-property-container">
              <FormSection>
                <SectionHeader>{t('deviceModels.flyouts.new.name')}</SectionHeader>
                <FormGroup>
                <FormControl
                  type="text"
                  placeholder={t('deviceModels.flyouts.new.name')}
                  link={this.ruleName} />
                </FormGroup>
              </FormSection>
              <FormSection>
                <SectionHeader>{t('deviceModels.flyouts.new.description')}</SectionHeader>
                <FormGroup>
                <FormControl
                  type="textarea"
                  placeholder="Description"
                  link={this.description} />
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
            </Section.Container>

            <FormSection>
              <SectionDesc>Min/Max changes occur every:</SectionDesc>
              <FormGroup>
                <FormControl type="duration" name="frequency" link={this.frequency} />
              </FormGroup>
            </FormSection>
            <FormSection>
              <SectionDesc>Report Min/Max changes every:</SectionDesc>
              <FormGroup>
                <FormControl type="duration" name="frequency" link={this.frequency} />
              </FormGroup>
            </FormSection>
          {/*  <Section.Container className="rule-severity-container">
              <Section.Content>
              <FormGroup>
                <FormLabel>Rule Severity</FormLabel>
                <FormControl
                  type="radio"
                  placeholder="Rule name"
                  link={this.radios} />
              </FormGroup>
              <FormGroup>
                <FormLabel>Description</FormLabel>
                <FormControl
                  type="textarea"
                  placeholder="Description"
                  link={this.description} />
              </FormGroup>
              </Section.Content>
            </Section.Container>*/}
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
        </Flyout.Content>
      </Flyout.Container>
    );
  }
}
