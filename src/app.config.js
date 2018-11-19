// Copyright (c) Microsoft. All rights reserved.

const Config = {
  serviceUrls: {
    registry: process.env.PCS_TWIN_REGISTRY_URL,
    twins: process.env.PCS_TWIN_SERVICE_URL
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

  aadTenant: process.env.PCS_WEBUI_AUTH_AAD_TENANT,
  aadAppId: process.env.PCS_WEBUI_AUTH_AAD_APPID,
  aadAudience: process.env.PCS_AUTH_AUDIENCE,
  aadInstance: process.env.PCS_WEBUI_AUTH_AAD_AUTHORITY
};

export default Config;
