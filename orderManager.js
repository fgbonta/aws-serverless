'use strict';

const {
    DynamoDBClient,
    PutItemCommand,
    UpdateItemCommand,
    GetItemCommand } = require("@aws-sdk/client-dynamodb");

const dynamodb = new DynamoDBClient({ region: process.env.REGION }); // llama al modulo
const table = process.env.COMPLETED_ORDERS_TABLE_NAME; // la url de la tabla


const saveCompletedOrder = async (element) => {

    console.log('fn saveCompletedOrder fue llamada');

    const params = {
        TableName: table,
        Item: {
            'orderId': { "S": `${element.orderId}` },
            'name': { "S": `${element.name}` },
            'address': { "S": `${element.address}` },
            'phone': { "S": `${element.phone}` },
            'email': { "S": `${element.email}` },
            'order': { "SS": element.order.map(e => `${e}`) },
            'timeStamp': { "S": `${element.timeStamp}` },
            'delivery_status': { "S": 'READY' },
        }
    };

    const data = await dynamodb.send(new PutItemCommand(params));

    return data;

}

const deliverOrder = async (orderId) => {

    console.log('fn deliverOrder fue llamada');

    const params = {
        TableName: table,
        Key: {
            'orderId': { "S": `${orderId}` },
        },
        ConditionExpression: "attribute_exists(orderId)",
        UpdateExpression: "set delivery_status = :s",
        ExpressionAttributeValues: {
            ":s": { "S": "DELIVERED" },
        },
        ReturnValues: "ALL_NEW",
    };

    const data = await dynamodb.send(new UpdateItemCommand(params));

    return data;

}

const getOrder = async (orderId) => {

    console.log('fn getOrder fue llamada');

    const params = {
        TableName: table,
        Key: {
            'orderId': { "S": `${orderId}` },
        },
    };

    const data = await dynamodb.send(new GetItemCommand(params));

    return data;

}

module.exports = { saveCompletedOrder, deliverOrder, getOrder };