// Copyright (c) Microsoft. All rights reserved.

// Error response abstractions
export class AjaxError {

  static fromResponse = ajaxError => new AjaxError(ajaxError);

  constructor(ajaxError) {
    this.ajaxError = ajaxError;
    const { ExceptionMessage, Message } = ajaxError.response || {};
    this.message = ExceptionMessage || Message || ajaxError.message || `An unknown error occurred`;
    this.status = ajaxError.status;
  }
}

export class RetryableAjaxError extends AjaxError {
  static fromResponse = ajaxError => new RetryableAjaxError(ajaxError);
}
