// Copyright (c) Microsoft. All rights reserved.

import { connect } from 'react-redux';
import { translate } from 'react-i18next';
import { epics, getDeviceModels } from 'store/reducers/deviceModelsReducer';
import { DeviceModels } from './deviceModels';

// Pass the device models
const mapStateToProps = state => ({
  deviceModels: getDeviceModels(state),
});

// Wrap the dispatch method
const mapDispatchToProps = dispatch => ({
  // TODO: add device model related methods
  createDeviceModel: (payload) => dispatch(epics.actions.createDeviceModel(payload)),
  deleteDeviceModel: (id) => dispatch(epics.actions.deleteDeviceModel(id))
});

export const DeviceModelsContainer = translate()(connect(mapStateToProps, mapDispatchToProps)(DeviceModels));
