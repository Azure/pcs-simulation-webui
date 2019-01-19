// Copyright (c) Microsoft. All rights reserved.

import Config from 'app.config';
import { HttpClient } from './httpClient';
import {
  toFile,
  toFileRequestModel,
  toValidationModel
} from './models';

const ENDPOINT = `${Config.simulationApiUrl}replayfile`;

const uploadOptions = {
  headers: {
    'Accept': undefined,
    'Content-Type': undefined
  }
};

/** Contains methods for calling the replay file service */
export class ReplayFileService {

  /** Returns a replay script by id */
  static getReplayFileById(id) {
    return HttpClient.get(`${ENDPOINT}/${id}`)
      .map(toFile);
  }

  /** Creates a replay file */
  static uploadReplayFile(script) {
    return HttpClient.post(ENDPOINT, toFileRequestModel(script), uploadOptions)
      .map(toFile);
  }

  /** Deletes a replay file by id */
  static deleteReplayFileById(id) {
    return HttpClient.delete(`${ENDPOINT}/${id}`);
  }

  /** Validate a replay file */
  static validateReplayFile(script) {
    return HttpClient.post(`${ENDPOINT}!validate`, toFileRequestModel(script), uploadOptions)
      .map(toValidationModel);
  }
}
