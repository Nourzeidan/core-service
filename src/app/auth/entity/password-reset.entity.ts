export class PasswordReset {
    id: number;
    userId: number;
    otpHash: string;
    expiredAt: Date;
    createdAt: Date;
    consumedAt: Date | null;

    constructor(data: Partial <PasswordReset>) {
        this.id = data.id!
        this.userId = data.userId!
        this.otpHash = data.otpHash!
        this.expiredAt =data. expiredAt!
        this.createdAt = data.createdAt!
        this.consumedAt = data.consumedAt ?? null;
    }

    isExpired(): boolean {
        // new date ya3ni delwa2ty
        return this.expiredAt < new Date();
    }

}