// producer side only: core publishes domain events, it never consumes any.
// (order-service has the consumer half of this interface)
export interface IMessageBroker {
    connect(): Promise<void>;
    close(): Promise<void>;
    // create the exchange if it is missing (safe to call many times)
    declareExchange(exchange: string): Promise<void>;
    // resolves only after the broker ACKs the message (publisher confirms).
    // rejects on nack / timeout / lost connection -> the caller can retry later
    publish(exchange: string, routingKey: string, body: Buffer): Promise<void>;
}
