import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  UploadedFiles,
  Query,
  ParseIntPipe,
  BadRequestException,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { QueryProductsDto } from './dto/query-products.dto';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @UseInterceptors(FilesInterceptor('images', 10)) // Max 10 images per product
  async create(
    @Body() createProductDto: CreateProductDto,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    // Validate file types
    if (files && files.length > 0) {
      const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
      for (const file of files) {
        if (!allowedMimeTypes.includes(file.mimetype)) {
          throw new BadRequestException(
            `Invalid file type: ${file.mimetype}. Only JPEG, PNG, and WebP images are allowed.`,
          );
        }
      }
    }

    return this.productsService.create(createProductDto, files);
  }

  @Get()
  async findAll(@Query() query: QueryProductsDto) {
    return this.productsService.findAll(query);
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.productsService.findOne(id);
  }

  @Patch(':id')
  @UseInterceptors(FilesInterceptor('images', 10)) // Max 10 images per product
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateProductDto: UpdateProductDto,
    @UploadedFiles() files?: Express.Multer.File[],
  ) {
    // Validate file types
    if (files && files.length > 0) {
      const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
      for (const file of files) {
        if (!allowedMimeTypes.includes(file.mimetype)) {
          throw new BadRequestException(
            `Invalid file type: ${file.mimetype}. Only JPEG, PNG, and WebP images are allowed.`,
          );
        }
      }
    }

    return this.productsService.update(id, updateProductDto, files);
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.productsService.remove(id);
  }

  @Delete(':productId/images/:imageId')
  async removeImage(
    @Param('productId', ParseIntPipe) productId: number,
    @Param('imageId', ParseIntPipe) imageId: number,
  ) {
    return this.productsService.removeImage(productId, imageId);
  }
}

