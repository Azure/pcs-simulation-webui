// Copyright (c) Microsoft. All rights reserved.

// Map to simulation scripts
export const toSimulationScripts = ({ Items = []}) => Items.map(toSimulationScript);

// Map to simulation script in device model
export const toSimulationScript = (response = {}) => ({
  id: response.Id,
  name: response.Name,
  eTag: response.ETag,
  type: response.Type,
  path: response.Path,
  content: response.Content,
});

//  Map to simulation script request model
export const toSimulationScriptRequestModel = (request = {}) => {
  // TODO: add mapping
}

// Map to validation models
export const toValidationModel = (response = {}) => ({
  success: response.Success,
  messages: response.Messages
})
