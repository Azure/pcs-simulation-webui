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
  static post(url, options = {}, withAuth = true) {
    return HttpClient.ajax(url, { ...options, method: 'POST' }, withAuth);
  }

  /**
   * Constructs a PUT ajax request
   *
   * @param {string} url The url path to the make the request to
   */
  static put(url, options = {}, withAuth = true) {
    return HttpClient.ajax(url, { ...options, method: 'PUT' }, withAuth);
  }

  /**
   * Constructs a PATCH ajax request
   *
   * @param {string} url The url path to the make the request to
   */
  static patch(url, options = {}, withAuth = true) {
    return HttpClient.ajax(url, { ...options, method: 'PATCH' }, withAuth);
  }

  /**
   * Constructs a DELETE ajax request
   *
   * @param {string} url The url path to the make the request to
   */
  static delete(url, options = {}, withAuth = true) {
    return HttpClient.ajax(url, { ...options, method: 'DELETE' }, withAuth);
  }

  /**
   * Constructs an Ajax request
   *
   * @param {string} url The url path to the make the request to
   * @param {AjaxRequest} [options={}] See https://github.com/ReactiveX/rxjs/blob/master/src/observable/dom/AjaxObservable.ts
   * @return an Observable of the AjaxReponse
   */
  static ajax(url, options = {}, withAuth = true) {
    return Observable.of({ ...options, url })
      .map(request => withAuth ? HttpClient.withAuth(request) : request)
      .flatMap(Observable.ajax);
  }

  /**
   * A helper method that adds auth headers to an ajaxRequest object
   */
  static withAuth(request = {}) {
    const headers = request.headers || {};
    // Required by the backend web services when the Authorization header is
    // not valid, to tell the CSRF protection to allow this request through
    // (assuming that Auth is not mandatory, e.g. during development).
    headers['Csrf-Token'] = 'nocheck';
    AuthService.getAccessToken(accessToken => {
      if (accessToken) headers['Authorization'] = `Bearer ${accessToken}`;
    });
    return { ...request, headers };
  }

}
