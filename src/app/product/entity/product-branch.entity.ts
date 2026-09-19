
export class ProductBranchDetails {
    id: number;
    branchId: number;
    productId: number;
    price: number;
    stock: number;
    isAvailable: boolean;
    createdAt: Date;
    updatedAt: Date;

    constructor(data: Partial<ProductBranchDetails>){
        this.id = data.id!;
        this.branchId = data.branchId!;
        this.productId = data.productId!;
        this.price = data.price!;
        this.stock = data.stock!;
        this.isAvailable = data.isAvailable!;
        this.createdAt = data.createdAt ?? new Date();
        this.updatedAt = data.updatedAt ?? new Date();
    }
}