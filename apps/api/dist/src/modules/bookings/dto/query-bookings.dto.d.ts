export declare class QueryBookingsDto {
    page?: number;
    limit?: number;
    customerId?: number;
    technicianId?: number;
    airconId?: number;
    status?: 'pending' | 'inprogress' | 'done' | 'unsuccessful';
    bookingForDate?: string;
}
