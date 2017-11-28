// Copyright (c) Microsoft. All rights reserved.

import React from 'react';

import { Svg } from 'components/shared/svg/svg';
import { joinClasses, svgs } from 'utilities';

import './styles/error.css';

export const Error = (props) => {
  const { children, className } = props;
  return (
    <div className={joinClasses('error-container', className)}>
      <Svg path={svgs.error} className="error-icon" />
      { props.children }
    </div>
  );
};
