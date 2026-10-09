declare module 'node-mailjet' {
    interface MailjetOptions {
        apiKey: string;
        apiSecret: string;
    }

    interface MailjetRequest {
        request(body: unknown): Promise<unknown>;
    }

    class Mailjet {
        constructor(options: MailjetOptions);
        post(resource: string, options?: { version?: string }): MailjetRequest;
    }

    export = Mailjet;
}