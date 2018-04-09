// Copyright (c) Microsoft. All rights reserved.

import React, { Component } from 'react';

import './settings.css';

/** The settings component */
class Settings extends Component {

  constructor(props) {
    super(props);

    this.state = { 
      consentCheckboxChecked: this.props.dataInsightsConsent === "true",
    };
  }

  toggleCheckbox = () => {
    this.setState({ consentCheckboxChecked: !this.state.consentCheckboxChecked }, 
        () => this.props.updateSolutionSettings({
            ...this.props.settings,
            dataInsightsConsent: this.state.consentCheckboxChecked
    }));
  };

  render() {
    const {dataInsightsConsent} = this.props;
    return (
        <div className="consent">
            <h2 className="dropdown-item">{ this.props.t('header.dataInsightsConsentHeader') }</h2>
            <label className="dropdown-item">{ this.props.t('header.dataInsightsConsentText') }</label><br />
            <input type="checkbox" className="dropdown-item" checked={this.state.consentCheckboxChecked} onChange={this.toggleCheckbox}/>
            <label className="dropdown-item">{ this.props.t('header.dataInsightsConsentCheckbox') }</label>
        </div>
    );
  }
};

export default Settings;
