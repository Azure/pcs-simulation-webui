// Copyright (c) Microsoft. All rights reserved.

import React, { Component } from 'react';
import update from 'immutability-helper';
import PropTypes from 'prop-types';

class FormReplicator extends Component {

  onChange = (idx, valueExtractor) => (event) => {
    const { name, value } = valueExtractor(event);
    const newData = update(this.props.data, { [idx]: { [name]: { $set: value } } });
    this.props.onChange(newData);
  }

  overrideProps = (child, idx) => {
    const { onChange, onClick, children, deleterow, name, value } = child.props || {};
    return {
      onChange: onChange ? this.onChange(idx, onChange) : undefined,
      children: this.cloneChildren(children, idx),
      onClick: deleterow ? this.deleteItem(idx) : onClick,
      value: onChange ? this.props.data[idx][name] : value
    }
  }

  cloneChildren = (children, idx) => {
    if (typeof children !== 'object') return children;
    return React.Children.map(children,
      child => React.cloneElement(child, this.overrideProps(child, idx))
    )
  }

  deleteItem = index => () => {
    this.props.onChange(this.props.data.filter((_, idx) => index !== idx));
  };

  render() {
    return this.props.data.map((_, idx) => this.cloneChildren(this.props.children, idx));
  }

}

FormReplicator.propTypes = {
  data: PropTypes.array.isRequired,
  onChange: PropTypes.func.isRequired
};
