// Copyright (c) Microsoft. All rights reserved.

import React, { Component } from 'react';
import Select from 'react-select';

import './pcsSelect.css';

class PcsSelect extends Component {
  render() {
    return (
      <div className={`${this.props.className ? this.props.className : ''}`}>
        <Select {...this.props} />
      </div>
    );
  }
}

export default PcsSelect;
