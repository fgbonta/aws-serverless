'use strict';

const { DynamoDBClient, PutItemCommand } = require("@aws-sdk/client-dynamodb");

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
            'order': { "SS": element.order.map( e => `${e}` ) },
            'timeStamp': { "S": `${element.timeStamp}` },
            'delivery_status': { "S": 'READY' },
        }
    };

    const data = await dynamodb.send(new PutItemCommand(params));

    return data;

}

module.exports = { saveCompletedOrder };