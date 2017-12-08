// Copyright (c) Microsoft. All rights reserved.

import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { Duration } from './duration';
import { Select } from './select';
import { ErrorMsg } from './errorMsg';
import { joinClasses, isFunc, Link } from 'utilities';

import './styles//formControl.css';

export class FormControl extends Component {
  constructor(props) {
    super(props);

    this.state = { edited: false };
  }

  onChange = (evt) => {
    const { onChange, link } = this.props;
    if (isFunc(onChange)) onChange(evt);
    if (link && isFunc(link.onChange)) link.onChange(evt);
    !this.state.edited && this.setState({ edited: true });
  }

  onBlur = (evt) => {
    if (this.props.onBlur) this.props.onBlur(evt);
    !this.state.edited && this.setState({ edited: true });
  }

  selectControl(type, controlProps) {
    switch(type) {
      case 'text':
        return <input type="text" {...controlProps} />;
      case 'password':
        return <input type="password" {...controlProps} />;
      case 'number':
        return <input type="number" {...controlProps} />;
      case 'textarea':
        return <textarea type="text" {...controlProps} />;
      case 'duration':
        return <Duration {...controlProps} />;
      case 'select':
        return <Select {...controlProps} />;
      default:
        return null; // Unknown form control
    }
  }

  getErrorMsg(disabled, link, error = '') {
    if (!disabled) {
      if (link) return link.error;
      return error;
    }
    return '';
  }

  render() {
    const { type, formGroupId, className, link, error, errorState, ...rest } = this.props;
    const valueOverrides = link ? { value: link.value }: {};
    const errorMsg = this.state.edited ? this.getErrorMsg(rest.disabled, link, error) : false;
    const controlProps = {
      ...rest,
      id: rest.id || formGroupId,
      className: joinClasses('form-control', className, errorState || errorMsg ? 'error' : ''),
      onChange: this.onChange,
      onBlur: this.onBlur,
      ...valueOverrides
    };
    return (
      <div className="form-control-container">
        { this.selectControl(type, controlProps) }
        { errorMsg && <ErrorMsg>{ errorMsg }</ErrorMsg> }
      </div>
    );
  }
}

FormControl.propTypes = {
  type: PropTypes.oneOf([
    'text',
    'password',
    'number',
    'textarea',
    'duration',
    'select'
  ]).isRequired,
  formGroupId: PropTypes.string,
  link: PropTypes.instanceOf(Link),
  error: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.bool
  ]),
  className: PropTypes.string
};
