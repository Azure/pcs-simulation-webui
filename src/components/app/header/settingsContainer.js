// Copyright (c) Microsoft. All rights reserved.

import { connect } from 'react-redux';
import { translate } from 'react-i18next';
import Settings from './settings';
import { 
    epics,
    getdataInsightsConsent as getdataInsightsConsent,
    getSettings
} from 'store/reducers/appReducer';

const mapStateToProps = state => {
    return { settings: getSettings(state) };
};

// Wrap the dispatch method
const mapDispatchToProps = dispatch => ({
  updateSolutionSettings: settings => dispatch(epics.actions.setSolutionSettings(settings)),
});

export const SettingsContainer = translate()(connect(mapStateToProps, mapDispatchToProps)(Settings));
