'use strict';

const { v4: uuidv4 } = require('uuid');

const { SQSClient, SendMessageCommand } = require("@aws-sdk/client-sqs");
const { saveCompletedOrder, deliverOrder } = require('./orderManager');


const hacerPedido = async (event) => {

  const sqs = new SQSClient({ region: process.env.REGION }); // llama al modulo
  const queueUrl = process.env.PENDING_ORDERS_QUEUE; // la url de la cola

  try {

    console.log('fn hacerPedido fue llamada');

    const orderId = uuidv4();
    let response;

    const body = JSON.parse(event.body);
    const name = body?.name;
    const address = body?.address;
    const phone = body?.phone;
    const email = body?.email;
    const order = body?.order ?? [];

    if (!name || !address || !phone || !email || order.length === 0) {
      return {
        statusCode: 400,
        body: JSON.stringify('Bad Request'),
        headers: {
          'Content-Type': 'application/json'
        }
      };
    }

    const ordersUniques = [];
    order.forEach(element => {
      if (!ordersUniques.includes(element)) {
        ordersUniques.push(element);
      }
    });

    const params = {
      MessageBody: JSON.stringify({
        orderId,
        name,
        address,
        phone,
        email,
        order: ordersUniques,
        timeStamp: new Date().getTime(),
      }),
      QueueUrl: queueUrl,
    }

    const data = await sqs.send(new SendMessageCommand(params));
    console.log(JSON.stringify(data));

    if (data) {

      response = {
        statusCode: 200,
        body: JSON.stringify(
          {
            message: `El pedido fue registrado con el número de orden: ${orderId}`,
            //messageIdQueue: data.MessageId,
          }
        ),
        headers: {
          'Content-Type': 'application/json'
        }
      };

    } else {

      response = {
        statusCode: 500,
        body: JSON.stringify('Some error occured !!'),
        headers: {
          'Content-Type': 'application/json'
        }
      };

    }

    return response;

  } catch (error) {

    console.log(error);

    return {
      statusCode: 500,
      body: JSON.stringify('Internal Server Error'),
      headers: {
        'Content-Type': 'application/json'
      }
    };

  };

}

const prepararPedido = async (event) => {

  console.log('fn prepararPedido fue llamada');

  try {

    const order = JSON.parse(event.Records[0].body);
    const data = await saveCompletedOrder(order);
    console.log(JSON.stringify(data));

    return data;

  } catch (error) {

    console.log(error);

    return error;
  }

}

const enviarPedido = async (event) => {

  console.log('fn enviarPedido fue llamada');

  try {

    const record = event.Records[0];

    if (record.eventName === 'INSERT') {

      const orderId = record.dynamodb.Keys.orderId.S;
      const data = await deliverOrder(orderId);
      console.log(JSON.stringify(data));

      return true;

    }

    return false;

  } catch (error) {

    console.log(error);

    return error;

  }

}

module.exports = { hacerPedido, prepararPedido, enviarPedido };
