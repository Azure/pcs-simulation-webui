// Copyright (c) Microsoft. All rights reserved.

import React, { Component } from 'react';

import { svgs } from 'utilities';
import { 
  FormSection,
  SectionHeader,
  SectionDesc,
  FormGroup, 
  FormLabel, 
  FormControl,
  FormActions,
  Btn,
  BtnToolbar,
  Radio
} from 'components/shared';

import './simulation.css';

const Header = (props) => (
  <div className="page-header">{props.children}</div>
);

/** 
 * TODO: Add the real component. Currently being used as a test bed for the 
 * shared controls .
 */
export class Simulation extends Component {

  constructor(props) {
    super(props);

    this.state = { 
      duration: {},
      radioTest: undefined
    };
  }

  onChange = ({ target }) => {
    const name = target.name;
    const value = target.type === 'checkbox' ? target.checked : target.value;
    this.setState({ [name]: value });
  }

  apply = (event) => {
    alert("Attempting to submit the form");
    event.preventDefault();
  };

  render () {
    const radioProps = (name, value) => {
      return {
        name,
        value,
        checked: this.state[name] === value,
        onChange: this.onChange
      };
    };

    return (
      <div className="simulation-container">
        <Header>Simulation setup</Header>
        <form onSubmit={this.apply}>
          <FormSection>
            <SectionHeader>Test inputs</SectionHeader>
            <SectionDesc>Time to test some random parts of the page to make sure everything looks ok.</SectionDesc>
            <FormGroup>
              <FormLabel>Text input</FormLabel>
              <FormControl type="text" placeholder="Placeholder" />
            </FormGroup>
          </FormSection>
          <FormSection>
            <SectionHeader>Other text inputs</SectionHeader>
            <SectionDesc>Some textarea stuff is in this description</SectionDesc>
            <FormGroup>
              <FormLabel>Textarea</FormLabel>
              <FormControl type="textarea" placeholder="Placeholder" />
            </FormGroup>
          </FormSection>
          <FormSection>
            <SectionHeader>Number inputs</SectionHeader>
            <FormGroup>
              <FormLabel>Duration</FormLabel>
              <FormControl type="duration" name="duration" value={this.state.duration.ms} onChange={this.onChange} />
            </FormGroup>
          </FormSection>
          <FormSection>
            <SectionHeader>Radio inputs</SectionHeader>
            <SectionDesc>Time to test out some radio input elements</SectionDesc>
            <Radio {...radioProps('radioTest', 'radioOne')}>
              <FormLabel>Test label</FormLabel>
              <FormControl type="duration" name="duration" value={this.state.duration.ms} onChange={this.onChange} />
            </Radio>
            <Radio {...radioProps('radioTest', 'radioTwo')}>
              Some value
            </Radio>
            <Radio {...radioProps('radioTest', 'radioThree')}>
              <FormControl type="text" placeholder="Placeholder" />
            </Radio>
          </FormSection>
          <FormActions>
            <BtnToolbar>
              <Btn svg={svgs.x} type="reset">Reset</Btn>
              <Btn svg={svgs.startSimulation} type="submit" className="apply-btn">Apply</Btn>
            </BtnToolbar>
          </FormActions>
        </form>
      </div>
    );
  }
}
