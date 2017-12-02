// Copyright (c) Microsoft. All rights reserved.

import React, { Component } from 'react';
import update from 'immutability-helper';
import PropTypes from 'prop-types';

/**
 * The FormReplicator component is used to replicate subsections of forms.
 * In data terms, the FormReplicator takes an input value of an array of
 * objects and binds it with some declarative markup passed as its children.
 *
 * TODO: Move to README.md file
 *
 * Usage:
 * ==== Example 1: Single FormReplicator
 * const newTag = () => ({ tag: '' });
 * class TagForm extends Component {
 *
 *   constructor(props) {
 *     super(props);
 *     this.state = { tags: [] };
 *   }
 *
 *   addRow = () => this.setState({ tags: [ ...this.state.tags, newTag() ] });
 *   onChange = ({ target: { name, value } }) => ({ name, value });
 *   updateState = (tags) => this.setState({ tags });
 *
 *   render() {
 *     // NOTE: For an input functionality to replicate, the "replicable" attribute must be set
 *     //       Otherwise the input will behave the same as if it was outside the replicator
 *     const inputProps = { type: 'text', replicable: true, onChange: this.onChange };
 *     return (
 *       <div>
 *         <FormReplicator value={this.state.tags} onChange={this.updateState}>
 *           <div className="tag-form-container">
 *             <input { ...inputProps } name="tag" />
 *             <button deletebtn>Remove</button>
 *           </div>
 *         </FormReplicator>
 *         <button onClick={this.addSensor}>+ Tag</button>
 *       </div>
 *     );
 *   }
 * }
 *
 * ==== Example 2: Nested FormReplicator
 * const newTag = () => ({ tag: '', metadata: [] });
 * const newMetadata = () => ({ meta: '' });
 * ...
 * // In the render function
 * <FormReplicator value={this.state.tags} onChange={this.updateState}>
 *   <div className="tag-form-container">
 *     <input { ...inputProps } name="tag" />
 *     <FormReplicator name="metadata">
 *       <div>
 *         <input { ...inputProps } name="meta" />
 *         <button deletebtn>Delete Metadata</button>
 *       </div>
 *     </FormReplicator>
 *     <button addBtnFor="tags" addBtnAction={this.addTag}>+ Metadata</button>
 *     <button deletebtn>Delete Tag</button>
 *   </div>
 * </FormReplicator>
 * ...
 */

class FormReplicator extends Component {

  /** Performs an immutable state update for the props.value array */
  updateState = (idx, name, value) => {
    const newData = update(this.props.value, { [idx]: { [name]: { $set: value } } });
    this.props.onChange(newData);
  }

  /** Used if a user adds a FormReplicator inside another FormReplicator and needs an add btn */
  addItem = (idx, name, getNewState) =>
    () => this.updateState(idx, name, getNewState(this.props.value[idx][name]));

  /** Deletes am item from the props.value array */
  deleteItem = idxToRemove =>
    () => this.props.onChange(this.props.value.filter((_, idx) => idxToRemove !== idx));

  /** Used to update an element with the 'replicable' attribute */
  onChange = (idx, valueExtractor) => (event) => {
    const { name, value } = valueExtractor(event);
    this.updateState(idx, name, value);
  }
  cloneChildren = (children, idx) => {
    if (typeof children !== 'object') return children;
    return React.Children.map(children,
      child => React.cloneElement(child, this.overrideProps(child, idx))
    );
  }

  /**
   * Contains the cases for which elements needs to have special props added to
   * them during cloning
   */
  overrideProps = (child, idx) => {
    const {
      addBtnAction,
      addBtnFor,
      children,
      deletebtn,
      name,
      onChange,
      onClick,
      replicable,
      value
    } = child.props || {};

    const isReplicatorComp = child.type && child.type.name === 'FormReplicator';

    if (isReplicatorComp) {
      return {
        onChange: this.onChange(idx, value => ({ name, value })),
        value: this.props.value[idx][name]
      };
    } else if (!!addBtnFor && addBtnAction) {
      return {
        onClick: this.addItem(idx, addBtnFor, addBtnAction)
      };
    } else if (!!deletebtn) {
      return {
        onClick: this.deleteItem(idx)
      };
    } else if (!!replicable && onChange) {
      return {
        onChange: this.onChange(idx, onChange),
        value: this.props.value[idx][name],
        children: this.cloneChildren(children, idx)
      };
    } else {
      return { children: this.cloneChildren(children, idx) };
    }
  }

  render() {
    return this.props.value.map((_, idx) => this.cloneChildren(this.props.children, idx));
  }

}

FormReplicator.propTypes = {
  name: PropTypes.string,
  onChange: PropTypes.func,
  value: PropTypes.array
};

export default FormReplicator;
