import {env} from "../config/env.js";
import {RabbitMQClient} from "../../pkg/messaging/rabbitmq.js";

// only imported by the worker. creating the client does not connect yet (connect() is lazy),
// so importing this file never opens a RabbitMQ connection by itself
export const messageBroker = new RabbitMQClient({url: env.rabbit.url});
