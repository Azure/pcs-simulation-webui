// Copyright (c) Microsoft. All rights reserved.

import { Component } from 'react';

export class Validator {

  static notEmpty = x => !!x;

  constructor(validator = {}) {
    this.validators = validator.validators || [];
  }

  check(checker, msg = true) {
    this.validators = [
      ...this.validators,
      value => checker(value) ? '' : msg
    ];
    return this;
  }

  hasErrors(value) {
    let error = '';
    for (let i = 0; i < this.validators.length; i++) {
      error = this.validators[i](value);
      if (error) return error;
    }
    return error;
  }
}

export class Link extends Validator {

  constructor(component, name) {
    super();

    this.name = name;
    this.component = component;
    this.onChange = ({ target: { value, type, checked } }) =>
      component.setState({ [name]: type === 'checkbox' ? checked : value });
  }

  get value() {
    return this.component.state[this.name];
  }

  get error() {
    return this.hasErrors(this.value);
  }

  withValidator(validator) {
    this.validators = validator.validators;
    return this;
  }

}

export class LinkedComponent extends Component {
  linkTo(name) {
    return new Link(this, name);
  }
}
