import { Kafka } from "kafkajs";

const kafka = new Kafka({
    clientId:'chat-service',
    brokers:['localhost:9092']
});

export const producer = kafka.producer();
