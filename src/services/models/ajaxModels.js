// Copyright (c) Microsoft. All rights reserved.

// Error response abstractions

export class AjaxError {

  static from = ajaxError => new AjaxError(ajaxError);

  constructor(ajaxError) {
    this.ajaxError = ajaxError;
    const { ExceptionMessage, Message } = ajaxError.response || {};
    this.errorMessage = ExceptionMessage || Message || ajaxError.message || `An unknown error occurred`;
    this.status = ajaxError.status;
  }

  /**
   * Wrap the message in a getter method to allow customizing for certain status codes
   */
  get message() {
    switch (this.status) {
      case 404:
        return "Oops, we were not able to find the service";
      default:
        return this.errorMessage;
    }
  }
}

export class RetryableAjaxError extends AjaxError {
  static from = ajaxError => new RetryableAjaxError(ajaxError);
}
