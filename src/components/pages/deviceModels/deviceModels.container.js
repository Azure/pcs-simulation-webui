// Copyright (c) Microsoft. All rights reserved.

import { connect } from 'react-redux';
import { translate } from 'react-i18next';
import { epics, getDeviceModels, getDeleteDeviceModelError } from 'store/reducers/deviceModelsReducer';
import { DeviceModels } from './deviceModels';

// Pass the device models
const mapStateToProps = state => ({
  deviceModels: getDeviceModels(state),
  deleteDeviceModelError: getDeleteDeviceModelError(state)
});

// Wrap the dispatch method
const mapDispatchToProps = dispatch => ({
  createDeviceModel: (payload) => dispatch(epics.actions.createDeviceModel(payload)),
  deleteDeviceModel: (id) => dispatch(epics.actions.deleteDeviceModel(id)),
  editDeviceModel: (payload) => dispatch(epics.actions.editDeviceModel(payload))
});

export const DeviceModelsContainer = translate()(connect(mapStateToProps, mapDispatchToProps)(DeviceModels));
