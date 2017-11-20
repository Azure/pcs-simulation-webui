// Copyright (c) Microsoft. All rights reserved.

import AuthenticationContext from 'adal-angular/dist/adal.min.js'
// import HttpClient from './httpClient';

export class AuthService {

  static authContext; // Create on AuthService.initialize()
  static authEnabled = true;
  static aadInstance = '';
  static appId = '00000000-0000-0000-0000-000000000000';
  static tenantId = '00000000-0000-0000-0000-000000000000';
  static clientId = '00000000-0000-0000-0000-000000000000';

  static initialize() {
    if (typeof global.DeploymentConfig === 'undefined') {
      alert('The dashboard configuration is missing.\n\nVerify the content of webui-config.js.');
      throw new Error('The global configuration is missing. Verify the content of webui-config.js.');
    }

    if (typeof global.DeploymentConfig.authEnabled !== 'undefined') {
      AuthService.authEnabled = global.DeploymentConfig.authEnabled;
      if (!AuthService.authEnabled) {
        console.warn('Auth is disabled! (see webui-config.js)');
      }
    }

    // Add "endsWith" function, not supported by IE (without touching String.prototype)
    // TODO: clean up IoT Suite and remove this "workaround"
    //       https://github.com/Azure/pcs-remote-monitoring-webui/issues/700
    const stringEndsWith = (haystack, needle) => {
      return haystack.substr(haystack.length - needle.length, needle.length) === needle;
    };

    AuthService.tenantId = global.DeploymentConfig.aad.tenant;
    AuthService.clientId = global.DeploymentConfig.aad.appId;
    AuthService.appId = global.DeploymentConfig.aad.appId;
    AuthService.aadInstance = global.DeploymentConfig.aad.instance;

    // TODO: remove this code - https://github.com/Azure/pcs-remote-monitoring-webui/issues/700
    if (AuthService.aadInstance && stringEndsWith(AuthService.aadInstance, '{0}')) {
      AuthService.aadInstance = AuthService.aadInstance.substr(0, AuthService.aadInstance.length - 3);
    }

    // TODO: support multiple types/providers
    if (AuthService.isEnabled() && global.DeploymentConfig.authType !== 'aad') {
      throw new Error(`Unknown auth type: ${global.DeploymentConfig.authType}`);
    }

    AuthService.authContext = new AuthenticationContext({
      instance: AuthService.aadInstance,
      tenant: AuthService.tenantId,
      clientId: AuthService.clientId,
      redirectUri: window.location.origin,
      postLogoutRedirectUri: window.location.origin
    });
  }

  static isDisabled() {
    return AuthService.authEnabled === false;
  }

  static isEnabled() {
    return !AuthService.isDisabled();
  }

  static onLoad() {
    AuthService.initialize();
    if (AuthService.isDisabled()) {
      console.debug('Skipping Auth onLoad because Auth is disabled');
      return
    };

    // Note: "window.location.hash" is the anchor part attached by
    //       the Identity Provider when redirecting the user after
    //       a successful authentication.
    if (AuthService.authContext.isCallback(window.location.hash)) {
      console.debug('Handling Auth Window callback');
      // Handle redirect after authentication
      AuthService.authContext.handleWindowCallback();
      var error = AuthService.authContext.getLoginError();
      if (error) {
        throw new Error(`Authentication Error: ${error}`);
      }
    } else {
      AuthService.getUserName(user => {
        if (user) {
          console.log(`Signed in as ${user.Name} with ${user.Email}`);
        } else {
          console.log('The user is not signed in');
          AuthService.authContext.login();
        }
      });
    }
  }

  static getUserName(callback) {
    if (AuthService.isDisabled()) return;

    if (AuthService.authContext.getCachedUser()) {
      // TODO: Implement call to get user
      /*
      HttpClient.get(`${Config.authApiUrl}users/current`)
        .map(data => data ? { Name: '', Email: '' } : null)
        .subscribe(params => callback(params));
      */
    } else {
      console.log('The user is not signed in');
      AuthService.authContext.login();
    }
  }

  static logout() {
    if (AuthService.isDisabled()) return;

    AuthService.authContext.logOut();
    AuthService.authContext.clearCache();
  }

  /**
   * Acquires token from the cache if it is not expired.
   * Otherwise sends request to AAD to obtain a new token.
   */
  static getAccessToken(callback) {
    if (AuthService.isDisabled()) {
      if (callback) callback('client-auth-disabled');
      return;
    }

    AuthService.authContext.acquireToken(
      AuthService.appId,
      function (error, accessToken) {
        if (error || !accessToken) {
          console.log(`Authentication Error: ${error}`);
          AuthService.authContext.login();
          return;
        }
        if (callback) callback(accessToken);
      }
    );
  }
}
