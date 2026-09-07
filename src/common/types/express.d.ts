declare namespace Express {
    // ba extend request object to include correlationId and user properties
    interface Request {
        correlationId: string;
        user?: {
            id: number;
            email: string;
            role: string;
        };
    }
}