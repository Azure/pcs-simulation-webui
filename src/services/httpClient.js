// Copyright (c) Microsoft. All rights reserved.

import { Observable } from 'rxjs';
import { AuthService } from './authService';
import Config from 'app.config';
import { AjaxError, RetryableAjaxError } from './models';

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
   * Constructs a POST with form file ajax request
   *
   * @param {string} url The url path to the make the request to
   * @param {file} file The file which be append to the body
   */
  static upload(url, file, options = {}, withAuth = true) {
    const body = new FormData();
    body.append('file', file);

    return HttpClient.ajax(url, { ...options, body, method: 'POST' }, withAuth, false);
  }

  /**
   * Constructs an Ajax request
   *
   * @param {string} url The url path to the make the request to
   * @param {AjaxRequest} [options={}] See https://github.com/ReactiveX/rxjs/blob/master/src/observable/dom/AjaxObservable.ts
   * @param {boolean} withAuth Allows a backdoor to not avoid wrapping auth headers
   * @param {boolean} withContentType Allows a backdoor to not avoid wrapping content type headers
   * @return an Observable of the AjaxReponse
   */
  static ajax(url, options = {}, withAuth = true, withContentType = true) {
    const { retryWaitTime, maxRetryAttempts } = Config;
    const request = HttpClient.createAjaxRequest({ ...options, url }, withAuth, withContentType);

    return Observable.ajax(request)
      // If success, extract the response object
      .map(({ response }) => response)
      // Classify errors as retryable or not
      .catch(ajaxError => Observable.throw(classifyError(ajaxError)))
      // Retry any retryable errors
      .retryWhen(retryHandler(maxRetryAttempts, retryWaitTime));
  }

  /**
   * A helper method that adds "application/json" headers
   */
  static withHeaders(request, withAuth, withContentType) {
    const headers = request.headers || {};
    // Add JSON headers
    headers['Accept'] = 'application/json';
    if (withContentType) {
        headers['Content-Type'] = 'application/json';
    }
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

  /**
   * A helper method for constructing ajax request objects
   */
  static createAjaxRequest(options, withAuth, withContentType = true) {
    return {
      ...HttpClient.withHeaders(options, withAuth, withContentType),
      timeout: options.timeout || Config.defaultAjaxTimeout
    };
  }

}

// HttpClient helper methods

/** A helper function containing the logic for retrying ajax requests */
export const retryHandler = (retryAttempts, retryDelay) =>
  error$ =>
    error$.zip(Observable.range(0, retryAttempts + 1)) // Plus 1 to not count initial call
      .flatMap(([ error, attempt ]) =>
        (!isRetryable(error) || attempt === retryAttempts)
          ? Observable.throw(error)
          : Observable.of(error)
      )
      .delay(retryDelay);

/** A helper function for checking if a value is a retryable error */
const isRetryable = error => error instanceof RetryableAjaxError;

/** A helper function for classifying errors as retryable or not */
function classifyError(error) {
  if (Config.retryableStatusCodes.has(error.status)) {
    return RetryableAjaxError.from(error);
  }
  return AjaxError.from(error);
}
