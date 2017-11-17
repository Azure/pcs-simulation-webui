// Copyright (c) Microsoft. All rights reserved.

import React, { Component } from 'react';

import { Svg } from 'components/shared/svg/svg';
import { FormLabel } from './formLabel';
import { FormGroup } from './formGroup';
import { FormControl } from './formControl';
import { svgs, joinClasses, isFunc, int } from 'utilities';

import './styles/duration.css';

export class Duration extends Component {

    static defaultProps = { type: 'text' };

    constructor(props) {
      super(props);

      this.state = {
        hours: 0,
        minutes: 0,
        seconds: 0
      };
    }

    componentDidMount() {
      this.setState(this.convertMsToUnits(this.props.value));
    }

    // TODO: Update the props to accept h, m, seconds, or value
    componentWillReceiveProps(nextProps) {
      this.setState(this.convertMsToUnits(nextProps.value));
    }

    convertMsToUnits(ms) {
      // Max duration of 99h, 59m, 59s
      const clippedMs = Math.min(ms || 0, 359999000);
      let acc = clippedMs / 1000;
      const seconds = Math.floor(acc % 60);
      acc /= 60;
      const minutes = Math.floor(acc % 60);
      const hours = Math.floor(acc / 60);
      return { hours, minutes, seconds };
    }

    convertUnitsToMs({ hours, minutes, seconds }) {
      return 1000*(60*(60*hours + minutes) + seconds);
    }

    createValueObject(units) {
      const ms = this.convertUnitsToMs(units);
      return { ...units, ms };
    }

    liftChange(value) {
      const { onChange, name } = this.props
      if (isFunc(onChange)) onChange({ target: { name, value } });
    }

    onChange = ({ target }) => {
      const { name, value } = target;
      const newValue = this.createValueObject({ ...this.state, [name]: int(value) });
      this.liftChange(newValue);
    }

    format(value) {
      return `${value}`.padStart(2, '0');
    }

    render() {
      const { disabled, className } = this.props;
      const genericProps = {
        ...Duration.defaultProps,
        onChange: this.onChange,
        onFocus: ({ target }) => target.select(), // Select contents on focus
        disabled
      };
      const { hours, minutes, seconds } = this.state;
      return (
        <div className={joinClasses('duration-control-container', className)}>
          <FormGroup>
            <FormLabel>HH</FormLabel>
            <FormControl
              {...genericProps}
              name="hours"
              value={this.format(hours)} />
          </FormGroup>
          <Svg path={svgs.colon} className="duration-colon-icon" />
          <FormGroup>
            <FormLabel>MM</FormLabel>
            <FormControl
              {...genericProps}
              name="minutes"
              value={this.format(minutes)} />
          </FormGroup>
          <Svg path={svgs.colon} className="duration-colon-icon" />
          <FormGroup>
            <FormLabel>SS</FormLabel>
            <FormControl
              {...genericProps}
              name="seconds"
              value={this.format(seconds)} />
          </FormGroup>
        </div>
      );
    }
  }
