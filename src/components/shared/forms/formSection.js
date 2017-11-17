// Copyright (c) Microsoft. All rights reserved.

import React from 'react';

import { joinClasses } from 'utilities';

import './styles/formSection.css';

export const FormSection = (props) => (
  <div className={joinClasses('form-section', props.className)}>{props.children}</div>
);
