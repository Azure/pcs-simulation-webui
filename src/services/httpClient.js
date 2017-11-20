// Copyright (c) Microsoft. All rights reserved.

import { Observable } from 'rxjs';

/**
 * A class of static methods for creating ajax requests
 */
export class HttpClient {

  /**
   * Constructs a GET ajax request
   *
   * @param {string} url The url path to the make the request to
   */
  static get(url, options = {}) {
    return HttpClient.ajax(url, { ...options, method: 'GET' });
  }

  /**
   * Constructs a POST ajax request
   *
   * @param {string} url The url path to the make the request to
   */
  static post(url, options = {}) {
    return HttpClient.ajax(url, { ...options, method: 'POST' });
  }

  /**
   * Constructs a PUT ajax request
   *
   * @param {string} url The url path to the make the request to
   */
  static put(url, options = {}) {
    return HttpClient.ajax(url, { ...options, method: 'PUT' });
  }

  /**
   * Constructs a PATCH ajax request
   *
   * @param {string} url The url path to the make the request to
   */
  static patch(url, options = {}) {
    return HttpClient.ajax(url, { ...options, method: 'PATCH' });
  }

  /**
   * Constructs a DELETE ajax request
   *
   * @param {string} url The url path to the make the request to
   */
  static delete(url, options = {}) {
    return HttpClient.ajax(url, { ...options, method: 'DELETE' });
  }

  /**
   * Constructs an Ajax request
   *
   * @param {string} url The url path to the make the request to
   * @param {AjaxRequest} [options={}] See https://github.com/ReactiveX/rxjs/blob/master/src/observable/dom/AjaxObservable.ts
   * @return an Observable of the AjaxReponse
   */
  static ajax(url, options = {}) {
    const ajaxRequest = { ...options, url };
    return Observable.ajax(ajaxRequest);
  }

}
