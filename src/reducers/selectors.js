// Copyright (c) Microsoft. All rights reserved.

import { createSelector } from 'reselect';

// Selectors
export const getSimulation = state => state.simulation;
export const getDeviceModels = state => state.app.deviceModels || [];

export const getDeviceModelsAsMap = createSelector(
	getDeviceModels,
	deviceModels =>
		deviceModels.reduce((map, model) => ({ ...map, [model.id]: model}), {})
);

export const getSimulationWithDeviceModels = createSelector(
	[ getSimulation, getDeviceModelsAsMap ],
	(simulationModel, deviceModelsMap) => {
		const modelId = ((simulationModel.deviceModels || [])[0] || {}).id;
		const name = (deviceModelsMap[modelId] || {}).name;
		const deviceModels = (simulationModel.deviceModels || []).map(model => ({ ...model, name }));
		return { ...simulationModel, deviceModels };
	}
);
