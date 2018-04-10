// Copyright (c) Microsoft. All rights reserved.

import React, { Component } from 'react';

import './settings.css';

/** The settings component */
class Settings extends Component {

  constructor(props) {
    super(props);
    
    this.state = { 
      diagnosticsOptOutCheckboxChecked: !((this.props || {}).settings || {}).diagnosticsOptOut
    };
  }

  componentWillReceiveProps(nextProps) {
        const { settings: {diagnosticsOptOut} } = nextProps;
        this.setState({ diagnosticsOptOutCheckboxChecked: !diagnosticsOptOut });
  }

  toggleCheckbox = () => {
    this.setState({ diagnosticsOptOutCheckboxChecked: !this.state.diagnosticsOptOutCheckboxChecked }, 
        () => this.props.updateSolutionSettings({
            ...this.props.settings,
            diagnosticsOptOut: !this.state.diagnosticsOptOutCheckboxChecked
        })
      ); 
    };

  render() {
    return (
        <div className="consent">
            <h2 className="dropdown-item">{ this.props.t('header.sendDiagnosticsHeader') }</h2>
            <label className="dropdown-item">{ this.props.t('header.sendDiagnosticsText') }</label><br/><br/>
            <input type="checkbox" className="dropdown-item" checked={this.state.diagnosticsOptOutCheckboxChecked} onChange={this.toggleCheckbox}/>
            <label className="dropdown-item">{ this.props.t('header.sendDiagnosticsCheckbox') }</label>
        </div>
    );
  }
};

export default Settings;
