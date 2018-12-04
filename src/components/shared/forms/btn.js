// Copyright (c) Microsoft. All rights reserved.

import React from 'react';
import PropTypes from 'prop-types';

import { joinClasses } from 'utilities';

import './styles/btn.scss';

export const Btn = (props) => {
  const { svg: Svg , children, className, ...btnProps } = props;
  return (
    <button type="button" {...btnProps} className={joinClasses('btn', className)}>
      { props.svg && <Svg className="btn-icon" /> }
      { props.children && <div className="btn-text">{props.children}</div> }
    </button>
  );
};

Btn.propTypes = {
  children: PropTypes.node,
  className: PropTypes.string
};
