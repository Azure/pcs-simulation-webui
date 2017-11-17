// Copyright (c) Microsoft. All rights reserved.

import React, { Component } from 'react';

import { Svg } from 'components/shared/svg/svg';
import { FormLabel } from './formLabel';
import { svgs, joinClasses } from 'utilities';

import './styles/radio.css';

let radioInputCnt = 0;

export class Radio extends Component {
  // Needs to be a stateful component in order to access refs
  render() {
    const { className, children, id, checked, disabled, ...radioProps } = this.props;
    const formGroupId = `radioInputId${radioInputCnt++}`;
    let contentChildren = children;
    if (typeof contentChildren === 'string') {
      contentChildren = <FormLabel>{contentChildren}</FormLabel>;
    }
    const childrenWithProps = React.Children.map(contentChildren,
      (child) => React.cloneElement(child, {
        formGroupId,
        disabled: disabled || (checked === undefined ? false : !checked)
      })
    );
    return (
      <div className={joinClasses('radio-container', className)}>
        <div className="radio-input-container">
          <input
            {...radioProps}
            type="radio"
            disabled={disabled}
            checked={checked}
            id={id || formGroupId}
            ref="radioInputElement" />
          <Svg
            path={svgs.radioSelected}
            className={joinClasses('radio-icon', disabled ? 'disabled' : '')}
            onClick={() => this.refs.radioInputElement.click()} />
        </div>
        <div className="input-contents">{childrenWithProps}</div>
      </div>
    );
  }
}
