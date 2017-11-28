// Copyright (c) Microsoft. All rights reserved.

// Error response abstractions

export class AjaxError {

  static from = ajaxError => new AjaxError(ajaxError);

  constructor(ajaxError) {
    this.ajaxError = ajaxError;
    const { ExceptionMessage, Message } = ajaxError.response || {};
    this.errorMessage = ExceptionMessage || Message || ajaxError.message || `An unknown error occurred`;
    this.status = ajaxError.status;
    // Log all errors in the console
    console.error(ajaxError);
  }

  /**
   * Wrap the message in a getter method to allow customizing for certain status codes
   */
  get message() {
    if (this.status === 404) {
      return "Oops, we were not able to find the service.";
    } else if (this.status >= 300 && this.status < 400) {
      return "Oops, we got a redirection error.";
    } else {
      return this.errorMessage;
    }
  }
}

export class RetryableAjaxError extends AjaxError {
  static from = ajaxError => new RetryableAjaxError(ajaxError);
}
