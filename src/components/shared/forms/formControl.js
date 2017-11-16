// Copyright (c) Microsoft. All rights reserved.

import React from 'react';

import { joinClasses } from 'utilities';

import { Duration } from './duration';

import './styles//formControl.css';

export const FormControl = (props) => {
  const { type, formGroupId, className, ...rest } = props;
  const controlProps = {
    ...rest,
    id: rest.id || formGroupId,
    className: joinClasses('form-control', className)
  };
  switch(type) {
    case 'text':
      return <input type="text" {...controlProps} />;
    case 'number':
      return <input type="number" {...controlProps} />;
    case 'textarea':
      return <textarea type="text" {...controlProps} />;
    case 'duration':
      return <Duration {...controlProps} />;
    default:
      return null; // Unknown form control
  }
};