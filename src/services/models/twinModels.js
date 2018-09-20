// Copyright (c) Microsoft. All rights reserved.

import { camelCaseReshape, reshape, getItems, stringToBoolean } from 'utilities';

export const toReadValueModel = (response = {}) => ({
    value: response.value
});

export const toWriteValueModel = (params = {}, value) => ({
    nodeId: params.id,
    value: value,
    dataType: params.dataType
});

