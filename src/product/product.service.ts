/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Product, ProductDocument } from './schemas/product.schema';
import { CreateProductInput } from './dto/create-product.input';
import { UpdateProductInput } from './dto/update-product.input';
import { ProductFilterInput } from './dto/product-filter.input';
import { validateImageFile } from '../common/utils/file-validator';
import { createWriteStream } from 'fs';
import { join } from 'path';
import { FileUpload } from 'graphql-upload-ts';

@Injectable()
export class ProductService {
  constructor(@InjectModel(Product.name) private productModel: Model<ProductDocument>) {}

  private sanitizeFilename(filename: string): string {
    // Extract extension and name separately
    const lastDotIndex = filename.lastIndexOf('.');
    const name =
      lastDotIndex > 0 ? filename.substring(0, lastDotIndex) : filename;
    const extension = lastDotIndex > 0 ? filename.substring(lastDotIndex) : '';

    // Sanitize name part
    const sanitizedName = name
      .replace(/\s+/g, '_') // Replace spaces with underscore
      .replace(/[^a-zA-Z0-9_-]/g, '') // Remove special characters except _ -
      .replace(/_{2,}/g, '_') // Replace multiple underscores with single
      .toLowerCase();

    return sanitizedName + extension.toLowerCase();
  }

  async create(data: CreateProductInput, file?: FileUpload) {
    // Check if title already exists
    const existingProduct = await this.productModel.findOne({
      title: data.title.trim(),
    });
    if (existingProduct) {
      throw new BadRequestException('Product with this title already exists');
    }

    let imagePath: string | null = data.image ?? null;
    if (file) {
      // eslint-disable-next-line @typescript-eslint/unbound-method
      const { createReadStream, filename } = file;
      validateImageFile(filename);

      const sanitizedFilename = this.sanitizeFilename(filename);
      const uniqueFilename = `${Date.now()}-${sanitizedFilename}`;
      const uploadDir = join(process.cwd(), 'src', 'uploads', 'products');
      const uploadPath = join(uploadDir, uniqueFilename);

      // Ensure directory exists
      await import('fs').then((fs) => {
        if (!fs.existsSync(uploadDir)) {
          fs.mkdirSync(uploadDir, { recursive: true });
        }
      });

      await new Promise<void>((resolve, reject) => {
        createReadStream()
          .pipe(createWriteStream(uploadPath))
          .on('finish', () => resolve())
          .on('error', (error) =>
            reject(new BadRequestException(error.message)),
          );
      });
      imagePath = `/uploads/products/${uniqueFilename}`;
    }

    return this.productModel.create({
      ...data,
      image: imagePath,
    });
  }

  async findAll(
    input: ProductFilterInput,
  ): Promise<{ list: ProductDocument[]; metaCounter: Array<{ total: number }> }> {
    const {
      page = 1,
      limit = 5,
      sort = 'createdAt',
      direction = 'DESC',
    } = input;

    // eslint-disable-next-line @typescript-eslint/no-unsafe-enum-comparison
    const sortDirection = direction === 'ASC' ? 1 : -1;
    const sortField: Record<string, number> = { [sort]: sortDirection };

    const pipeline: any[] = [
      { $sort: sortField },
      {
        $facet: {
          list: [
            { $skip: (page - 1) * limit },
            { $limit: limit },
            {
              $addFields: {
                id: { $toString: '$_id' },
              },
            },
          ],
          metaCounter: [{ $count: 'total' }],
        },
      },
    ];

    const result = await this.productModel.aggregate(pipeline).exec();

    if (!result.length) {
      return { list: [], metaCounter: [] };
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return result[0];
  }

  async findOne(id: string) {
    const result = await this.productModel.findById(id);
    if (!result) {
      throw new BadRequestException('Product not found');
    }
    return result;
  }

  async update(id: string, data: UpdateProductInput, file?: FileUpload) {
    const existingProduct = await this.productModel.findById(id);
    if (!existingProduct) {
      throw new BadRequestException('Product not found');
    }

    // Check if title is being changed and if new title already exists
    if (data.title && data.title.trim() !== existingProduct.title) {
      const titleExists = await this.productModel.findOne({
        title: data.title.trim(),
        _id: { $ne: id },
      });
      if (titleExists) {
        throw new BadRequestException('Product with this title already exists');
      }
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id: _id, ...updateData } = data;

    if (file) {
      // eslint-disable-next-line @typescript-eslint/unbound-method
      const { createReadStream, filename } = file;
      validateImageFile(filename);

      const sanitizedFilename = this.sanitizeFilename(filename);
      const uniqueFilename = `${Date.now()}-${sanitizedFilename}`;
      const uploadDir = join(process.cwd(), 'src', 'uploads', 'products');
      const uploadPath = join(uploadDir, uniqueFilename);

      await import('fs').then((fs) => {
        if (!fs.existsSync(uploadDir)) {
          fs.mkdirSync(uploadDir, { recursive: true });
        }
      });

      await new Promise<void>((resolve, reject) => {
        createReadStream()
          .pipe(createWriteStream(uploadPath))
          .on('finish', () => resolve())
          .on('error', (error) =>
            reject(new BadRequestException(error.message)),
          );
      });
      updateData.image = `/uploads/products/${uniqueFilename}`;
    } else if (data.image !== undefined) {
      // Agar image string sifatida yuborilsa
      updateData.image = data.image;
    }

    const updatedProduct = await this.productModel.findByIdAndUpdate(id, updateData, {
      new: true,
    });

    if (!updatedProduct) {
      throw new BadRequestException('Product not found');
    }

    return updatedProduct;
  }

  async remove(id: string) {
    const product = await this.productModel.findById(id);
    if (!product) {
      throw new BadRequestException('Product not found');
    }

    await this.productModel.findByIdAndDelete(id);

    return { message: 'Product successfully removed from database', id };
  }
}

