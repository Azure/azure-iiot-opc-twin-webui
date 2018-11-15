// Copyright (c) Microsoft. All rights reserved.

const Config = {
  // Constants
  retryWaitTime: 2000, // On retryable error, retry after 2s
  maxRetryAttempts: 2,
  retryableStatusCodes: new Set([ 0, 502, 503 ]),
  defaultAjaxTimeout: 60000, // 10s

  aadTenant: process.env.REACT_APP_AAD_TENANT,
  aadAppId: process.env.REACT_APP_AAD_APP_ID,
  aadInstance: process.env.REACT_APP_AAD_INSTANCE
};

export default Config;
