import type { ReservationStatus } from "../enums.js";

// how much stock one order took from one product of one branch
export class StockReservation {
    id: number;
    orderPublicId: string;
    branchId: number;
    productId: number;
    quantity: number;
    status: ReservationStatus;
    createdAt: Date;
    releasedAt: Date | null;

    constructor(data: Partial<StockReservation>){
        this.id = data.id!;
        this.orderPublicId = data.orderPublicId!;
        this.branchId = data.branchId!;
        this.productId = data.productId!;
        this.quantity = data.quantity!;
        this.status = data.status!;
        this.createdAt = data.createdAt ?? new Date();
        this.releasedAt = data.releasedAt ?? null;
    }
}
