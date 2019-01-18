// Copyright (c) Microsoft. All rights reserved.

// Map to file
export const toFiles = ({ Items = [] }) => Items.map(toFile);

// Map to file in model
export const toFile = (response = {}) => ({
  id: response.Id,
  name: response.Name,
  eTag: response.ETag,
  type: response.Type,
  path: response.Path,
  content: response.Content,
});

//  Map to file request model
export const toFileRequestModel = (file) => {
  const data = new FormData();
  data.append('file', file);

  return data;
}

// Map to validation models
export const toValidationModel = (response = {}) => ({
  isValid: response.IsValid,
  messages: response.Messages
})
