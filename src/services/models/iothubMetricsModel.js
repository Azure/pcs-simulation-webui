// Copyright (c) Microsoft. All rights reserved.

export const toIothubMetricsModel = (
  {
    responses: [
      {
        content: { value }
      }
    ]
  } = { responses: [{ content: {} }] }
) =>
  value.map(({ data, name: { localizedValue } }) => ({
    [localizedValue]: {
      '': data
        .map(({ timeStamp, ...rest }) => ({
          [timeStamp]: rest
        }))
        .reduce((acc, obj) => ({ ...acc, ...obj }), {})
    }
  }));
