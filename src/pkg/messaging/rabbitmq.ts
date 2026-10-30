import {connect} from "amqp-connection-manager";
import type {AmqpConnectionManager, ChannelWrapper} from "amqp-connection-manager";
import type {ConfirmChannel} from "amqplib";
import type {IMessageBroker} from "./message-broker.interface.js";

export interface RabbitMQConfig {
    url: string;
    reconnectTimeInSeconds?: number;
    // how long one publish may wait for the broker ACK before it rejects
    publishTimeoutMs?: number;
}

// Mental model:
//   - 1 TCP connection -> many cheap "channels" inside it.
//   - amqp-connection-manager reconnects by itself, and every channel re-runs its
//     setup functions (e.g. assertExchange) after a reconnect.
//   - we only need ONE channel here: a confirm channel used for publishing.
//     "confirm" = the broker answers ack/nack for every message, so publish() only
//     resolves once RabbitMQ has really stored the message.
export class RabbitMQClient implements IMessageBroker {
    private connection: AmqpConnectionManager | null = null;
    private channel: ChannelWrapper | null = null;
    // the first connect() stores its promise here; later callers await the SAME promise,
    // so nobody continues before the channel is really connected (while the broker is down
    // they all wait, and amqp-connection-manager keeps retrying in the background)
    private connecting: Promise<void> | null = null;

    constructor(private readonly config: RabbitMQConfig){}

    async connect(): Promise<void> {
        if(!this.connecting){
            this.connecting = this.open();
        }
        return this.connecting;
    }

    private async open(): Promise<void> {
        this.connection = connect([this.config.url], {
            reconnectTimeInSeconds: this.config.reconnectTimeInSeconds ?? 5
        });
        this.connection.on("disconnect", ({err}) => {console.error("[rabbitmq] disconnected:", err?.message);});

        this.channel = this.connection.createChannel({
            json: false,
            confirm: true,
            // without a timeout a publish would wait forever while the broker is down,
            // and the outbox drain would keep its row locks the whole time
            publishTimeout: this.config.publishTimeoutMs ?? 10_000
        });
        await this.channel.waitForConnect();
    }

    async close(): Promise<void> {
        await this.channel?.close().catch(() => {});
        await this.connection?.close().catch(() => {});
        this.channel = null;
        this.connection = null;
        this.connecting = null;
    }

    // addSetup -> also re-asserted automatically after every reconnect.
    // "topic" exchange = consumers bind with patterns like "product.#"
    async declareExchange(exchange: string): Promise<void> {
        await this.connect();
        await this.channel!.addSetup((ch: ConfirmChannel) =>
            ch.assertExchange(exchange, "topic", {durable: true})
        );
    }

    // persistent: true + durable queue on the consumer side -> survives a broker restart
    async publish(exchange: string, routingKey: string, body: Buffer): Promise<void> {
        await this.connect();
        await this.channel!.publish(exchange, routingKey, body, {
            persistent: true,
            contentType: "application/json"
        });
    }
}
