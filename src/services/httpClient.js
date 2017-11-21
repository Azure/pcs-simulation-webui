// Copyright (c) Microsoft. All rights reserved.

import { Observable } from 'rxjs';
import { AuthService } from './authService';

/**
 * A class of static methods for creating ajax requests
 */
export class HttpClient {

  /**
   * Constructs a GET ajax request
   *
   * @param {string} url The url path to the make the request to
   */
  static get(url, options = {}, withAuth = true) {
    return HttpClient.ajax(url, { ...options, method: 'GET' }, withAuth);
  }

  /**
   * Constructs a POST ajax request
   *
   * @param {string} url The url path to the make the request to
   */
  static post(url, body = {}, options = {}, withAuth = true) {
    return HttpClient.ajax(url, { ...options, body, method: 'POST' }, withAuth);
  }

  /**
   * Constructs a PUT ajax request
   *
   * @param {string} url The url path to the make the request to
   */
  static put(url, body = {}, options = {}, withAuth = true) {
    return HttpClient.ajax(url, { ...options, body, method: 'PUT' }, withAuth);
  }

  /**
   * Constructs a PATCH ajax request
   *
   * @param {string} url The url path to the make the request to
   */
  static patch(url, body = {}, options = {}, withAuth = true) {
    return HttpClient.ajax(url, { ...options, body, method: 'PATCH' }, withAuth);
  }

  /**
   * Constructs a DELETE ajax request
   *
   * @param {string} url The url path to the make the request to
   */
  static delete(url, body = {}, options = {}, withAuth = true) {
    return HttpClient.ajax(url, { ...options, body, method: 'DELETE' }, withAuth);
  }

  /**
   * Constructs an Ajax request
   *
   * @param {string} url The url path to the make the request to
   * @param {AjaxRequest} [options={}] See https://github.com/ReactiveX/rxjs/blob/master/src/observable/dom/AjaxObservable.ts
   * @param {boolean} withAuth Allows a backdoor to not avoid wrapping auth headers
   * @return an Observable of the AjaxReponse
   */
  static ajax(url, options = {}, withAuth = true) {
    let request = HttpClient.withHeaders({ ...options, url }, withAuth);
    return Observable.ajax(request);
  }

  /**
   * A helper method that adds "application/json" headers
   */
  static withHeaders(request, withAuth) {
    const headers = request.headers || {};
    // Add JSON headers
    headers['Accept'] = 'application/json';
    headers['Content-Type'] = 'application/json';
    // Add auth headers if needed
    if (withAuth) {
      // Required by the backend web services when the Authorization header is
      // not valid, to tell the CSRF protection to allow this request through
      // (assuming that Auth is not mandatory, e.g. during development).
      headers['Csrf-Token'] = 'nocheck';
      AuthService.getAccessToken(accessToken => {
        if (accessToken) headers['Authorization'] = `Bearer ${accessToken}`;
      });
    }
    return { ...request, headers };
  }

}
