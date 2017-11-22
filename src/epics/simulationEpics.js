import { SimulationService } from 'services';
import { Observable } from 'rxjs';
import { loadDeviceModelsSuccess } from '../actions/reduxActions';
// Epic actions trigger redux-observable epics

// Action types
export const LOAD_DEVICE_MODELS = 'LOAD_DEVICE_MODELS';
export const LOAD_DEVICE_MODELS_FAILED = 'LOAD_DEVICE_MODELS_FAILED';

// Actions
export function loadDeviceModelsEpic(action$) { console.log('action$', action$)
  return action$.ofType(LOAD_DEVICE_MODELS)
    .mergeMap(action =>
      SimulationService.getDeviceModels()
        .map(({response}) => response) //TODO: move to response models
        .map(({Items}) => loadDeviceModelsSuccess(Items))
        .catch(error => Observable.of({
          type: LOAD_DEVICE_MODELS_FAILED,
          payload: error.xhr.response,
          error: true
        }))
    );}
