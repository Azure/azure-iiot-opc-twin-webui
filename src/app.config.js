// Copyright (c) Microsoft. All rights reserved.


const Config = {
  serviceUrls: {
    registry: process.env.REACT_APP_PCS_TWIN_REGISTRY_URL || "http://localhost:9042",
    twins: process.env.REACT_APP_PCS_TWIN_SERVICE_URL || "http://localhost:9041"
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

  aadTenant: process.env.REACT_APP_PCS_WEBUI_AUTH_AAD_TENANT,
  aadAppId: process.env.REACT_APP_PCS_WEBUI_AUTH_AAD_APPID,
  aadAudience: process.env.REACT_APP_PCS_AUTH_AUDIENCE,
  aadInstance: process.env.REACT_APP_PCS_WEBUI_AUTH_AAD_AUTHORITY,
  authEnabled: process.env.REACT_APP_PCS_AUTH_REQUIRED
};

export default Config;
