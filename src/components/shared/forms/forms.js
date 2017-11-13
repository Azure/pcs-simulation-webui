// Copyright (c) Microsoft. All rights reserved.

import React, { Component } from 'react';

import { Svg } from '../svg/svg';

import './forms.css';

let idCounter = 0;

const mergeClasses = (...classNames) => classNames.join(' ').trim();

export const SectionHeader = (props) => (
  <div className={mergeClasses('section-header', props.className)}>{props.children}</div>
);

export const SectionDesc = (props) => (
  <div className={mergeClasses('section-desc', props.className)}>{props.children}</div>
);

export const FormSection = (props) => (
  <div className={mergeClasses('form-section', props.className)}>{props.children}</div>
);

export const FormGroup = (props) => {
  const formGroupId = `formGroupId${idCounter++}`;
  // Attach the formGroupId to allow automatic focus when a label is clicked
  const childrenWithProps = React.Children.map(props.children,
    (child) => React.cloneElement(child, { formGroupId })
  );
  return <div className={mergeClasses('form-group', props.className)}>{childrenWithProps}</div>;
};

export const FormLabel = (props) => {
  const { formGroupId, className, children, htmlFor, ...rest } = props;
  const labelProps = {
    ...rest,
    className: mergeClasses('form-group-label', className),
    htmlFor: htmlFor || formGroupId
  };
  return <label {...labelProps}>{children}</label>;
};

export const FormControl = (props) => {
  const { type, formGroupId, ...rest } = props;
  const controlProps = {...rest, id: rest.id || formGroupId };
  switch(type) {
    case 'text':
      return <input type="text" {...controlProps} />
    case 'number':
      return <input type="number" {...controlProps} />
    case 'textarea':
      return <textarea type="text" {...controlProps} />
    case 'duration':
      return <DurationControl {...controlProps} />
    default:
      return null; // Unknown form control
  }
};

export const FormActions = (props) => (
  <div className="form-actions-container">{props.children}</div>
);

export const Btn = (props) => {
  const {svg, children, className, ...btnProps } = props;
  return (
    <button {...btnProps} className={mergeClasses('btn', className)}>
      { props.svg && <Svg path={props.svg} className="btn-icon" /> }
      { props.children && <div className="btn-text">{props.children}</div> }
    </button>
  );
};

export const BtnToolbar = (props) => (
  <div className={mergeClasses('btn-toolbar', props.className)}>{props.children}</div>
);

export class DurationControl extends Component {

  static defaultProps = {
    size: 2,
    type: 'text'
  };

  convertMsToUnits(ms = 0) {
    let valueInSeconds = Math.floor(ms / 1000);
    const hours = valueInSeconds / 3600; //Hours in seconds
    valueInSeconds = valueInSeconds % 3600;
    const minutes = valueInSeconds / 60; //Hours in seconds
    const seconds = valueInSeconds % 60;
    return { hours, minutes, seconds };
  }

  render() {
    const { disabled, value } = this.props;
    const genericProps = {
      ...DurationControl.defaultProps,
      disabled
    };
    const { hours, minutes, seconds } = this.convertMsToUnits(value);
    return (
      <div className="duration-control-container">
        <FormGroup>
          <FormLabel>HH</FormLabel>
          <FormControl {...genericProps} value={hours} />
        </FormGroup>
        <FormGroup>
          <FormLabel>MM</FormLabel>
          <FormControl {...genericProps} value={minutes} />
        </FormGroup>
        <FormGroup>
          <FormLabel>SS</FormLabel>
          <FormControl {...genericProps} value={seconds} />
        </FormGroup>
      </div>
    );
  }
};
