// Copyright (c) Microsoft. All rights reserved.

import React from 'react';

import { joinClasses } from 'utilities';

import './styles/formActions.css';

export const FormActions = (props) => (
  <div className={joinClasses('form-actions-container', props.className)}>{props.children}</div>
);
