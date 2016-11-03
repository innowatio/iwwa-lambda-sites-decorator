function objectToBase64 (object) {
    return new Buffer(JSON.stringify(object)).toString("base64");
}

export function getRecordFromObject (object) {
    return {
        "eventID": "shardId-000000000000:00000000000000000000000000000000000000000000000000000000",
        "eventVersion": "1.0",
        "kinesis": {
            "partitionKey": "partitionKey-0",
            "data": objectToBase64(object),
            "kinesisSchemaVersion": "1.0",
            "sequenceNumber": "00000000000000000000000000000000000000000000000000000000"
        },
        "invokeIdentityArn": "arn:aws:iam::EXAMPLE",
        "eventName": "aws:kinesis:record",
        "eventSourceARN": "arn:aws:kinesis:EXAMPLE",
        "eventSource": "aws:kinesis",
        "awsRegion": "us-east-1"
    };
}

export function getEventFromArray (array) {
    return {
        "Records": array.map(getRecordFromObject)
    };
}

export function getEventFromObject (object) {
    return getEventFromArray([object]);
}
