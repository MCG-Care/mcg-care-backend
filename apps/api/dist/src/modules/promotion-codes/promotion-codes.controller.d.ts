import { PromotionCodesService } from './promotion-codes.service';
export declare class PromotionCodesController {
    private readonly promotionCodesService;
    constructor(promotionCodesService: PromotionCodesService);
    findOne(id: number, user: any): Promise<{
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
