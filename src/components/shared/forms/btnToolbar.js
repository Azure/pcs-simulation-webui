// Copyright (c) Microsoft. All rights reserved.

import React from 'react';

import { joinClasses } from 'utilities';

import './styles/btnToolbar.css';

export const BtnToolbar = (props) => (
  <div className={joinClasses('btn-toolbar', props.className)}>{props.children}</div>
);
