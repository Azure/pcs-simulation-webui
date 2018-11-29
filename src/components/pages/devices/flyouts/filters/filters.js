// Copyright (c) Microsoft. All rights reserved.

import React, { Component } from 'react';

import Flyout from 'components/shared/flyout';
import { svgs, isFunc } from 'utilities';
import {
  Btn,
  BtnToolbar,
  FormControl,
  FormGroup,
  FormLabel
} from 'components/shared';

import './filters.css';

const initialState = {
  simulation: null,
  deviceModel: null
};

export class Filter extends Component {

  constructor(props) {
    super(props);
    this.state = initialState;
  }

  componentDidMount() {
    if (this.props.filters) {
      this.populateState(this.props.filters);
    }
  }

  populateState(filters) {
    this.setState({ ...filters })
  }

  clearAll = () => this.setState(initialState);

  onChangeSelection = ({ target: { name, value } }) => {
    this.setState({[name]: (value || {}).value});
  }

  apply = (event) => {
    event.preventDefault();
    const { setFilters, onClose } = this.props;
    if (isFunc(setFilters)) {
      setFilters(this.state);
    }
    onClose();
  }

  render() {
    const { t, onClose, simulationList } = this.props;
    const activeSimulations = simulationList.filter(({ isActive }) => isActive);
    const simulationNameSelectOptions = activeSimulations
      .map(({ name, id }) => ({ value: name, label: name }));
    const deviceModelsSelectOptions = activeSimulations
      .map(({ deviceModels }) => deviceModels.map(({ id }) => id))
      .reduce((acc, arr) => [...new Set([...acc, ...arr])], [])
      .map(value => ({ value, label: value }));

    return (
      <Flyout.Container className="filter-flyout-container">
        <Flyout.Header>
          <Flyout.Title>
            { t('devices.flyouts.filter.title') }
          </Flyout.Title>
          <Flyout.CloseBtn onClick={onClose} />
        </Flyout.Header>
        <Flyout.Content>
          <form onSubmit={this.apply} className="filter-form-container">
            <FormGroup>
              <FormLabel>{t('devices.flyouts.filter.simulationName')}</FormLabel>
              <FormControl
                type="select"
                className="long"
                name="simulation"
                options={simulationNameSelectOptions}
                value={this.state.simulation}
                clearable
                onChange={this.onChangeSelection} />
            </FormGroup>
            <FormGroup>
              <FormLabel>{t('devices.flyouts.filter.deviceModel')}</FormLabel>
              <FormControl
                type="select"
                className="long"
                name="deviceModel"
                options={deviceModelsSelectOptions}
                value={this.state.deviceModel}
                clearable
                onChange={this.onChangeSelection} />
            </FormGroup>
            <FormGroup>
              <div className="clear-btn" onClick={this.clearAll}>{t('devices.flyouts.filter.clear')}</div>
            </FormGroup>
            <BtnToolbar>
              <Btn
                svg={svgs.reconfigure}
                primary="true"
                type="submit">
                {t('devices.flyouts.jobs.apply')}
              </Btn>
              <Btn svg={svgs.cancelX} onClick={onClose}>{t('devices.flyouts.jobs.cancel')}</Btn>

            </BtnToolbar>
          </form>
        </Flyout.Content>
      </Flyout.Container>
    );
  }
}
