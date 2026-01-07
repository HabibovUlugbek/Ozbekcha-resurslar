import amqp from "amqplib";

const EXCHANGE = "jobs";

let channel;

export async function initPublisher() {
  const conn = await amqp.connect("amqp://localhost");
  channel = await conn.createChannel();
  await channel.assertExchange(EXCHANGE, "fanout", { durable: false });
}

export function publish(event, payload) {
  channel.publish(
    EXCHANGE,
    "",
    Buffer.from(
      JSON.stringify({
        event,
        payload: {
          ...payload,
          timestamp: new Date().toISOString(),
        },
      })
    )
  );
}
