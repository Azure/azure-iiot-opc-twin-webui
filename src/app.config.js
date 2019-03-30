// Copyright (c) Microsoft. All rights reserved.


const Config = {
  serviceUrls: {
    /* registry: process.env.REACT_APP_PCS_TWIN_REGISTRY_URL || "http://localhost:9042",
    twins: process.env.REACT_APP_PCS_TWIN_SERVICE_URL || "http://localhost:9041" */
    registry: "https://iiotserviceszytsv.azurewebsites.net/registry/",
    twins: "https://iiotserviceszytsv.azurewebsites.net/twins/"
  },
  // Constants
  retryWaitTime: 2000, // On retryable error, retry after 2s
  maxRetryAttempts: 2,
  retryableStatusCodes: new Set([ 0, 502, 503 ]),
  defaultAjaxTimeout: 60000, // 10s
  nodeProperty: {
    read: 'Read',
    write: 'Write',
    method: 'Method',
    variable: 'Variable'
  },

  /* aadTenant: process.env.REACT_APP_PCS_WEBUI_AUTH_AAD_TENANT,
  aadAppId: process.env.REACT_APP_PCS_WEBUI_AUTH_AAD_APPID,
  aadAudience: process.env.REACT_APP_PCS_AUTH_AUDIENCE,
  aadInstance: process.env.REACT_APP_PCS_WEBUI_AUTH_AAD_AUTHORITY,
  authEnabled: process.env.REACT_APP_PCS_AUTH_REQUIRED */

  aadTenant: "6e660ce4-d51a-4585-80c6-58035e212354",
  aadAppId: "0bb73e83-8ac8-4b33-a215-52dd98a47ed1",
  aadAudience: "https://opcwalls.onmicrosoft.com/hmi2019twincfv2-services",
  aadInstance: "https://login.microsoftonline.com/{0}",
  authEnabled: 'true'
};

export default Config;
