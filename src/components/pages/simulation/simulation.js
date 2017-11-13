// Copyright (c) Microsoft. All rights reserved.

import React, { Component } from 'react';

import svgs from 'utilities/svgs';
import { 
  FormSection,
  SectionHeader,
  SectionDesc,
  FormGroup, 
  FormLabel, 
  FormControl,
  FormActions,
  Btn,
  BtnToolbar
} from 'components/shared';

import './simulation.css';

const Header = (props) => (
  <div className="page-header">{props.children}</div>
);

export class Simulation extends Component {

  apply = (event) => {
    alert("Attempting to submit the form");
    event.preventDefault();
  };

  render () {
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
            <SectionHeader>More test inputs</SectionHeader>
            <FormGroup>
              <FormLabel>Textarea</FormLabel>
              <FormControl type="textarea" placeholder="Placeholder" />
            </FormGroup>
          </FormSection>
          <FormSection>
            <SectionHeader>Number inputs</SectionHeader>
            <FormGroup>
              <FormLabel>Duration</FormLabel>
              <FormControl type="duration" value="98765" />
            </FormGroup>
          </FormSection>
          <FormActions>
            <BtnToolbar>
              <Btn type="reset">Reset</Btn>
              <Btn svg={svgs.hamburger} type="submit">Apply</Btn>
            </BtnToolbar>
          </FormActions>
        </form>
      </div>
    );
  }
}
