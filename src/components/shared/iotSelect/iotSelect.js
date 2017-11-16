// Copyright (c) Microsoft. All rights reserved.

import React from 'react';
import Select from 'react-select';
import { joinClasses } from 'utilities';

import './iotSelect.css';

export const IotSelect = ({className, ...props}) => <Select className={joinClasses('iot-select', className)} {...props} />;
