export class PasswordReset {
    id: number;
    userId: number;
    otpHash: string;
    expiredAt: Date;
    createdAt: Date;
    consumedAt: Date;

    constructor(id: number, userId: number, otpHash: string, expiredAt: Date, createdAt: Date, consumedAt: Date) {
        this.id = id;
        this.userId = userId;
        this.otpHash = otpHash;
        this.expiredAt = expiredAt;
        this.createdAt = createdAt;
        this.consumedAt = consumedAt;
    }

    isExpired(): boolean {
        // new date ya3ni delwa2ty
        return this.expiredAt < new Date();
    }

}