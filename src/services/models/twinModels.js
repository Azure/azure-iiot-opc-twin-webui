// Copyright (c) Microsoft. All rights reserved.

export const toReadValueModel = (response = {}) => ({
    value: response.value,
    errorInfo: response.errorInfo,
});

export const toWriteValueModel = (params = {}, value) => ({
    nodeId: params.nodeId,
    value: value,
    dataType: params.dataType
});

export const toCallNodeMethodMetadataModel = (params = {}) => ({
    methodId: params.nodeId
});

export const toCallNodeMethodModel = (params = {}, nodeId, values) => {
    const argument = [];
    (values || []).forEach ((val, i) => {
        argument.push({
            dataType: params.inputArguments[i].type.id,
            value: val.value
        })
    });
    const request = {
        methodId: nodeId,
        objectId: params.objectId,
        arguments: argument
    }
    return request;
};

export const toScanSupervisorModel = (params = {}) => ({
    discovery: params.discovery
});

export const toPublishValueModel = (params = {}) => ({
    item:{
        nodeId: params.nodeId
    }
});

export const toUnPublishValueModel = (params = {}) => ({
    nodeId: params.nodeId
});

export const toGetPublishedNodesModel = () => ({
    
});