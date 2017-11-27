// Copyright (c) Microsoft. All rights reserved.

import React from 'react';
import ReactSelect from 'react-select';
import { joinClasses } from 'utilities';

import './styles/select.css';

export const Select = ({className, ...props}) => <ReactSelect className={joinClasses('select-container', className)} {...props} />;
