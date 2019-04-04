// Copyright (c) Microsoft. All rights reserved.

import { connect } from 'react-redux';
import { translate } from 'react-i18next';
import {
  getDeviceModels,
  getDeviceModelsNameSet,
  getDeviceModelEntities
} from 'store/reducers/deviceModelsReducer';
import { getSimulationListWithDeviceModels } from 'store/reducers/simulationReducer';

import { Devices } from './devices';

// Pass the device models
const mapStateToProps = state => ({
  deviceModels: getDeviceModels(state),
  deviceModelsNameSet: getDeviceModelsNameSet(state),
  simulationList: getSimulationListWithDeviceModels(state),
  deviceModelEntities: getDeviceModelEntities(state),
});

export const DevicesContainer = translate()(connect(mapStateToProps, null)(Devices));
