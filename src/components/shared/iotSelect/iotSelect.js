// Copyright (c) Microsoft. All rights reserved.

<<<<<<< HEAD
import React from 'react';
import Select from 'react-select';
import { joinClasses } from 'utilities';

import './iotSelect.css';

export const IotSelect = ({className, ...props}) => <Select className={joinClasses('iot-select', className)} {...props} />;
=======
import React, { Component } from 'react';
import Select from 'react-select';

import './iotSelect.css';

export const IotSelect = (props) => <Select {...props} />;
>>>>>>> add theme to select input
