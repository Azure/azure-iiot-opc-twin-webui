// Copyright (c) Microsoft. All rights reserved.

import AuthenticationContext from 'adal-angular/dist/adal.min'
import Config from 'app.config';

export class AuthService {

  static initialize() {
    const {
      aadTenant,
      aadAppId,
      aadAudience,
      aadInstance
    } = Config;

    AuthService.authEnabled = (aadTenant && aadAppId && aadAudience && true) || false;

    if (!AuthService.authEnabled) {
      return;
    }

    AuthService.tenantId = aadTenant;
    AuthService.clientId = aadAppId;
    AuthService.appId = aadAudience;
    AuthService.aadInstance = aadInstance;

    if (AuthService.aadInstance && AuthService.aadInstance.endsWith('{0}')) {
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

  static onLoad(successCallback) {
    AuthService.initialize();
    if (AuthService.isDisabled()) {
      console.debug('Skipping Auth onLoad because Auth is disabled');
      if (successCallback) successCallback();
      return;
    };

    // Note: "window.location.hash" is the anchor part attached by
    //       the Identity Provider when redirecting the user after
    //       a successful authentication.
    if (AuthService.authContext.isCallback(window.location.hash)) {
      console.debug('Handling Auth Window callback');
      // Handle redirect after authentication
      AuthService.authContext.handleWindowCallback();
      const error = AuthService.authContext.getLoginError();
      if (error) {
        throw new Error(`Authentication Error: ${error}`);
      }
    } else {
      AuthService.getUserName(user => {
        if (user) {
          console.log(`Signed in as ${user.Name} with ${user.Email}`);
          if (successCallback) successCallback();
        } else {
          console.log('The user is not signed in');
          AuthService.authContext.login();
        }
      });
    }
  }

  static getUserName(callback) {
    if (AuthService.isDisabled()) return;

    const user = AuthService.authContext.getCachedUser();
    if (user) {
      callback({
        Name: user.profile.name,
        Email: user.profile.upn
      });
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
