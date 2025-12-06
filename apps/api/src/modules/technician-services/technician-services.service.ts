import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { db, schema } from '../../config/database';
import { eq, and } from 'drizzle-orm';
import { AssignServiceDto } from './dto/assign-service.dto';

@Injectable()
export class TechnicianServicesService {
  /**
   * Assign services to a technician
   */
  async assignServices(assignServiceDto: AssignServiceDto) {
    const { technicianId, serviceIds } = assignServiceDto;

    // Check if technician exists and has technician role
    const technician = await db.query.users.findFirst({
      where: eq(schema.users.id, technicianId),
    });

    if (!technician) {
      throw new NotFoundException(`Technician with ID ${technicianId} not found`);
    }

    if (technician.role !== 'technician') {
      throw new BadRequestException(
        `User with ID ${technicianId} is not a technician`,
      );
    }

    // Verify all service IDs exist
    const services = await db.query.serviceTypes.findMany({
      where: (serviceTypes, { inArray }) =>
        inArray(serviceTypes.id, serviceIds),
    });

    if (services.length !== serviceIds.length) {
      throw new NotFoundException('One or more service IDs are invalid');
    }

    // Get existing services for this technician
    const existingServices = await db.query.technicianServices.findMany({
      where: eq(schema.technicianServices.technicianId, technicianId),
    });

    const existingServiceIds = existingServices.map((s) => s.serviceId);

    // Filter out services already assigned
    const newServiceIds = serviceIds.filter(
      (id) => !existingServiceIds.includes(id),
    );

    if (newServiceIds.length === 0) {
      throw new BadRequestException(
        'All specified services are already assigned to this technician',
      );
    }

    // Insert new technician services
    const values = newServiceIds.map((serviceId) => ({
      technicianId,
      serviceId,
    }));

    await db.insert(schema.technicianServices).values(values);

    // Return updated list of technician services
    return this.getTechnicianServices(technicianId);
  }

  /**
   * Get all services for a specific technician
   */
  async getTechnicianServices(technicianId: number) {
    // Check if technician exists
    const technician = await db.query.users.findFirst({
      where: eq(schema.users.id, technicianId),
    });

    if (!technician) {
      throw new NotFoundException(`Technician with ID ${technicianId} not found`);
    }

    if (technician.role !== 'technician') {
      throw new BadRequestException(
        `User with ID ${technicianId} is not a technician`,
      );
    }

    // Get technician services with service details
    const technicianServices = await db.query.technicianServices.findMany({
      where: eq(schema.technicianServices.technicianId, technicianId),
      with: {
        service: true,
      },
    });

    return {
      technicianId,
      technicianName: technician.name,
      services: technicianServices.map((ts) => ts.service),
    };
  }

  /**
   * Get all technicians who can perform a specific service
   */
  async getTechniciansForService(serviceId: number) {
    // Check if service exists
    const service = await db.query.serviceTypes.findFirst({
      where: eq(schema.serviceTypes.id, serviceId),
    });

    if (!service) {
      throw new NotFoundException(`Service with ID ${serviceId} not found`);
    }

    // Get all technicians who can perform this service
    const technicianServices = await db.query.technicianServices.findMany({
      where: eq(schema.technicianServices.serviceId, serviceId),
      with: {
        technician: {
          with: {
            address: true,
          },
        },
      },
    });

    return {
      serviceId,
      serviceName: service.name,
      technicians: technicianServices.map((ts) => ts.technician),
    };
  }

  /**
   * Remove a service from a technician
   */
  async removeService(technicianId: number, serviceId: number) {
    // Check if the assignment exists
    const technicianService = await db.query.technicianServices.findFirst({
      where: and(
        eq(schema.technicianServices.technicianId, technicianId),
        eq(schema.technicianServices.serviceId, serviceId),
      ),
    });

    if (!technicianService) {
      throw new NotFoundException(
        `Service ${serviceId} is not assigned to technician ${technicianId}`,
      );
    }

    // Delete the assignment
    await db
      .delete(schema.technicianServices)
      .where(
        and(
          eq(schema.technicianServices.technicianId, technicianId),
          eq(schema.technicianServices.serviceId, serviceId),
        ),
      );

    return { message: 'Service removed from technician successfully' };
  }

  /**
   * Get all technicians with their services
   */
  async getAllTechniciansWithServices() {
    // Get all users with technician role
    const technicians = await db.query.users.findMany({
      where: eq(schema.users.role, 'technician'),
      with: {
        technicianServices: {
          with: {
            service: true,
          },
        },
        address: true,
      },
    });

    return technicians.map((tech) => ({
      id: tech.id,
      name: tech.name,
      email: tech.email,
      phoneNo: tech.phoneNo,
      address: tech.address,
      services: tech.technicianServices.map((ts) => ts.service),
    }));
  }
}



