// Copyright (c) Microsoft. All rights reserved.

import React from 'react';
import { Btn } from 'components/shared';
import Svgs from 'svgs';

export const FlyoutCloseBtn = (props) => (
  <Btn {...props} svg={Svgs.CancelX} className="flyout-close-btn" />
);
