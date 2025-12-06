import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { db, schema } from '../../config/database';
import { eq, or, ilike, sql, desc } from 'drizzle-orm';
import { CreateServiceTypeDto } from './dto/create-service-type.dto';
import { UpdateServiceTypeDto } from './dto/update-service-type.dto';
import { QueryServiceTypesDto } from './dto/query-service-types.dto';

@Injectable()
export class ServiceTypesService {
  /**
   * Create a new service type
   */
  async create(createServiceTypeDto: CreateServiceTypeDto) {
    // Check if service type with same name already exists
    const existingService = await db.query.serviceTypes.findFirst({
      where: eq(schema.serviceTypes.name, createServiceTypeDto.name),
    });

    if (existingService) {
      throw new BadRequestException(
        `Service type with name "${createServiceTypeDto.name}" already exists`,
      );
    }

    // Insert service type
    const [newServiceType] = await db
      .insert(schema.serviceTypes)
      .values({
        name: createServiceTypeDto.name,
        description: createServiceTypeDto.description,
        serviceFee: createServiceTypeDto.serviceFee.toString(),
        duration: createServiceTypeDto.duration,
      })
      .returning();

    return newServiceType;
  }

  /**
   * Find all service types with pagination and search
   */
  async findAll(query: QueryServiceTypesDto) {
    const { page = 1, limit = 10, search } = query;
    const offset = (page - 1) * limit;

    // Build where condition for search
    const whereCondition = search
      ? or(
          ilike(schema.serviceTypes.name, `%${search}%`),
          ilike(schema.serviceTypes.description, `%${search}%`),
        )
      : undefined;

    // Get total count
    const [{ count }] = await db
      .select({ count: sql<number>`cast(count(*) as int)` })
      .from(schema.serviceTypes)
      .where(whereCondition);

    // Get service types
    const serviceTypes = await db.query.serviceTypes.findMany({
      where: whereCondition,
      limit,
      offset,
      orderBy: [desc(schema.serviceTypes.createdAt)],
    });

    return {
      data: serviceTypes,
      pagination: {
        page,
        limit,
        total: count,
        totalPages: Math.ceil(count / limit),
      },
    };
  }

  /**
   * Find a single service type by ID
   */
  async findOne(id: number) {
    const serviceType = await db.query.serviceTypes.findFirst({
      where: eq(schema.serviceTypes.id, id),
    });

    if (!serviceType) {
      throw new NotFoundException(`Service type with ID ${id} not found`);
    }

    return serviceType;
  }

  /**
   * Update a service type
   */
  async update(id: number, updateServiceTypeDto: UpdateServiceTypeDto) {
    // Check if service type exists
    await this.findOne(id);

    // Check if name is being changed and if it's unique
    if (updateServiceTypeDto.name) {
      const duplicateService = await db.query.serviceTypes.findFirst({
        where: eq(schema.serviceTypes.name, updateServiceTypeDto.name),
      });

      if (duplicateService && duplicateService.id !== id) {
        throw new BadRequestException(
          `Service type with name "${updateServiceTypeDto.name}" already exists`,
        );
      }
    }

    // Update service type
    const [updatedServiceType] = await db
      .update(schema.serviceTypes)
      .set({
        ...updateServiceTypeDto,
        serviceFee: updateServiceTypeDto.serviceFee?.toString(),
        updatedAt: new Date(),
      })
      .where(eq(schema.serviceTypes.id, id))
      .returning();

    return updatedServiceType;
  }

  /**
   * Delete a service type
   */
  async remove(id: number) {
    // Check if service type exists
    await this.findOne(id);

    // Delete service type (cascade will handle technician_services and booking_services)
    await db.delete(schema.serviceTypes).where(eq(schema.serviceTypes.id, id));

    return { message: 'Service type deleted successfully' };
  }
}



