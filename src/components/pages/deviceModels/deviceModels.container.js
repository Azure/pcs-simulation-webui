// Copyright (c) Microsoft. All rights reserved.

import { connect } from 'react-redux';
import { translate } from 'react-i18next';
import { getDeviceModels } from 'store/selectors';
import { DeviceModels } from './deviceModels';

// Pass the device models
const mapStateToProps = state => ({
  deviceModels: getDeviceModels(state),
});

// Wrap the dispatch method
const mapDispatchToProps = dispatch => ({
  // TODO: add device model related methods
});

export const DeviceModelsContainer = translate()(connect(mapStateToProps, mapDispatchToProps)(DeviceModels));
