// Copyright (c) Microsoft. All rights reserved.

import React, { Component } from 'react';

import { Svg } from '../svg/svg';
import { svgs, isFunc } from 'utilities';
import PcsSelect from '../pcsSelect/pcsSelect';

import './forms.css';

// TODO: Move each component to its own file

let idCounter = 0;

const joinClasses = (...classNames) => classNames.join(' ').trim();

export const SectionHeader = (props) => (
  <div className={joinClasses('section-header', props.className)}>{props.children}</div>
);

export const SectionDesc = (props) => (
  <div className={joinClasses('section-desc', props.className)}>{props.children}</div>
);

export const FormSection = (props) => (
  <div className={joinClasses('form-section', props.className)}>{props.children}</div>
);

export const FormGroup = (props) => {
  const formGroupId = `formGroupId${idCounter++}`;
  // Attach the formGroupId to allow automatic focus when a label is clicked
  const childrenWithProps = React.Children.map(props.children,
    (child) => React.cloneElement(child, { formGroupId })
  );
  return <div className={joinClasses('form-group', props.className)}>{childrenWithProps}</div>;
};

export const FormLabel = (props) => {
  const { formGroupId, className, children, htmlFor, ...rest } = props;
  const labelProps = {
    ...rest,
    className: joinClasses('form-group-label', className),
    htmlFor: htmlFor || formGroupId
  };
  return <label {...labelProps}>{children}</label>;
};

export const FormControl = (props) => {
  const { type, formGroupId, ...rest } = props;
  const controlProps = {...rest, id: rest.id || formGroupId };
  switch(type) {
    case 'text':
      return <input type="text" {...controlProps} />;
    case 'number':
      return <input type="number" {...controlProps} />;
    case 'textarea':
      return <textarea type="text" {...controlProps} />;
    case 'duration':
      return <DurationControl {...controlProps} />;
    case 'select':
      return <PcsSelect {...controlProps} />;
    default:
      return null; // Unknown form control
  }
};

export const FormActions = (props) => (
  <div className={joinClasses('form-actions-container', props.className)}>{props.children}</div>
);

export const Btn = (props) => {
  const {svg, children, className, ...btnProps } = props;
  return (
    <button {...btnProps} className={joinClasses('btn', className)}>
      { props.svg && <Svg path={props.svg} className="btn-icon" /> }
      { props.children && <div className="btn-text">{props.children}</div> }
    </button>
  );
};

export const BtnToolbar = (props) => (
  <div className={joinClasses('btn-toolbar', props.className)}>{props.children}</div>
);

const int = (num) => parseInt(num, 10);

export class DurationControl extends Component {

  static defaultProps = { type: 'text' };

  constructor(props) {
    super(props);

    this.state = {
      hours: 0,
      minutes: 0,
      seconds: 0
    };
  }

  componentDidMount() {
    this.setState(this.convertMsToUnits(this.props.value));
  }

  // TODO: Update the props to accept h, m, seconds, or value
  componentWillReceiveProps(nextProps) {
    this.setState(this.convertMsToUnits(nextProps.value));
  }

  convertMsToUnits(ms) {
    // Max duration of 99h, 59m, 59 seconds
    const clippedMs = Math.min(ms || 0, 359999000);
    let acc = clippedMs / 1000;
    const seconds = Math.floor(acc % 60);
    acc /= 60;
    const minutes = Math.floor(acc % 60);
    const hours = Math.floor(acc / 60);
    return { hours, minutes, seconds };
  }

  convertUnitsToMs({ hours, minutes, seconds }) {
    return 1000*(60*(60*hours + minutes) + seconds);
  }

  createValueObject(units) {
    const ms = this.convertUnitsToMs(units);
    return { ...units, ms };
  }

  liftChange(value) {
    const { onChange, name } = this.props
    if (isFunc(onChange)) onChange({ target: { name, value } });
  }

  onChangeHours = ({ target }) => {
    const { value } = target;
    const newValue = this.createValueObject({ ...this.state, hours: int(value) });
    this.liftChange(newValue);
  }

  onChangeMinutes = ({ target }) => {
    const { value } = target;
    const newValue = this.createValueObject({ ...this.state, minutes: int(value) });
    this.liftChange(newValue);
  }

  onChangeSeconds = ({ target }) => {
    const { value } = target;
    const newValue = this.createValueObject({ ...this.state, seconds: int(value) });
    this.liftChange(newValue);
  }

  format(value) {
    return `${value}`.padStart(2, '0');
  }

  render() {
    const { disabled, className } = this.props;
    const genericProps = {
      ...DurationControl.defaultProps,
      disabled
    };
    const { hours, minutes, seconds } = this.state;

    return (
      <div className={joinClasses('duration-control-container', className)}>
        <FormGroup>
          <FormLabel>HH</FormLabel>
          <FormControl
            {...genericProps}
            value={this.format(hours)}
            onChange={this.onChangeHours} />
        </FormGroup>
        <Svg path={svgs.colon} className="duration-colon-icon" />
        <FormGroup>
          <FormLabel>MM</FormLabel>
          <FormControl
            {...genericProps}
            value={this.format(minutes)}
            onChange={this.onChangeMinutes} />
        </FormGroup>
        <Svg path={svgs.colon} className="duration-colon-icon" />
        <FormGroup>
          <FormLabel>SS</FormLabel>
          <FormControl
            {...genericProps}
            value={this.format(seconds)}
            onChange={this.onChangeSeconds} />
        </FormGroup>
      </div>
    );
  }
}

export const Radio = (props) => {
  const { className, children, id, checked, ...radioProps } = props;
  const formGroupId = `formGroupId${idCounter++}`;
  let contentChildren = children;
  if (typeof contentChildren === 'string') {
    contentChildren = <FormLabel>{contentChildren}</FormLabel>;
  }
  const childrenWithProps = React.Children.map(contentChildren,
    (child) => React.cloneElement(child, {
      formGroupId,
      disabled: checked === undefined ? false : !checked
    })
  );
  return (
    <div className={joinClasses('radio-container', className)}>
      <div className="input-container">
        <input {...radioProps} type="radio" checked={checked} id={id || formGroupId} />
      </div>
      <div className="input-contents">{childrenWithProps}</div>
    </div>
  );
};
