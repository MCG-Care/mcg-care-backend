export declare class PromotionCodesService {
    findOne(id: number, userId: number, userRole: string): Promise<{
        id: number;
        createdAt: Date;
        updatedAt: Date;
        customerProductId: number;
        serviceTypeId: number;
        code: string;
        discountPercentage: number;
        expiresAt: string;
        isUsed: boolean;
    }>;
}
