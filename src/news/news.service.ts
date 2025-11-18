/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { News, NewsStatus, NewsDocument } from './schemas/news.schema';
import { CreateNewsInput } from './dto/create-news.input';
import { UpdateNewsInput } from './dto/update-news.input';
import { NewsFilterInput } from './dto/news-filter.input';
import { validateImageFile } from '../common/utils/file-validator';
import { createWriteStream } from 'fs';
import { join } from 'path';
import { FileUpload } from 'graphql-upload-ts';

@Injectable()
export class NewsService {
  constructor(@InjectModel(News.name) private newsModel: Model<NewsDocument>) {}

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

  async create(
    data: CreateNewsInput,
    file?: FileUpload,
    videoFile?: FileUpload,
  ) {
    // Check if title already exists
    const existingNews = await this.newsModel.findOne({
      title: data.title.trim(),
      status: { $ne: NewsStatus.DELETE },
    });
    if (existingNews) {
      throw new BadRequestException('News with this title already exists');
    }

    let imagePath: string | null = data.image ?? null;
    let videoPath: string | null = data.video ?? null;
    if (file) {
      // eslint-disable-next-line @typescript-eslint/unbound-method
      const { createReadStream, filename } = file;
      validateImageFile(filename);

      const sanitizedFilename = this.sanitizeFilename(filename);
      const uniqueFilename = `${Date.now()}-${sanitizedFilename}`;
      const uploadDir = join(process.cwd(), 'src', 'uploads', 'news');
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
      imagePath = `/uploads/news/${uniqueFilename}`;
    }

    if (videoFile) {
      // eslint-disable-next-line @typescript-eslint/unbound-method
      const { createReadStream, filename, mimetype } = videoFile;
      const allowed = ['video/mp4', 'video/webm', 'video/ogg'];
      if (!allowed.includes(mimetype))
        throw new BadRequestException('Only mp4, webm, ogg allowed for videos');

      const sanitizedFilename = this.sanitizeFilename(filename);
      const uniqueFilename = `${Date.now()}-${sanitizedFilename}`;
      const uploadDir = join(process.cwd(), 'src', 'uploads', 'videos');
      const uploadPath = join(uploadDir, uniqueFilename);

      // Ensure directory exists
      await import('fs').then((fs) => {
        if (!fs.existsSync(uploadDir)) {
          fs.mkdirSync(uploadDir, { recursive: true });
        }
      });

      const stream = createReadStream();
      let size = 0;
      const MAX_SIZE = 25 * 1024 * 1024; // 25 MB

      await new Promise<void>((resolve, reject) => {
        stream
          .on('data', (chunk) => {
            size += chunk.length;
            if (size > MAX_SIZE)
              reject(new BadRequestException('Video exceeds 25MB limit'));
          })
          .pipe(createWriteStream(uploadPath))
          .on('finish', () => resolve())
          .on('error', (err) => reject(new BadRequestException(err.message)));
      });

      videoPath = `/uploads/videos/${uniqueFilename}`;
    }

    return this.newsModel.create({
      ...data,
      image: imagePath,
      video: videoPath,
      status: data.status ?? NewsStatus.PAUSE,
    });
  }

  async findAll(
    input: NewsFilterInput,
  ): Promise<{ list: NewsDocument[]; metaCounter: Array<{ total: number }> }> {
    const {
      page = 1,
      limit = 5,
      sort = 'createdAt',
      direction = 'DESC',
      search,
    } = input;
    const { status } = search || {};

    const match: Record<string, unknown> = status
      ? { status }
      : {
          $or: [
            { status: { $ne: NewsStatus.DELETE } },
            { status: { $exists: false } },
          ],
        };

    // eslint-disable-next-line @typescript-eslint/no-unsafe-enum-comparison
    const sortDirection = direction === 'ASC' ? 1 : -1;
    const sortField: Record<string, number> = { [sort]: sortDirection };

    const pipeline: any[] = [
      { $match: match },
      {
        $addFields: {
          status: {
            $ifNull: ['$status', NewsStatus.ACTIVE],
          },
        },
      },
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

    const result = await this.newsModel.aggregate(pipeline).exec();

    if (!result.length) {
      return { list: [], metaCounter: [] };
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return result[0];
  }

  async findOne(id: string) {
    const result = await this.newsModel.findById(id);
    if (!result) {
      throw new BadRequestException('News not found');
    }
    return result;
  }

  async update(
    id: string,
    data: UpdateNewsInput,
    file?: FileUpload,
    videoFile?: FileUpload,
  ) {
    const existingNews = await this.newsModel.findById(id);
    if (!existingNews) {
      throw new BadRequestException('News not found');
    }

    // Check if title is being changed and if new title already exists
    if (data.title && data.title.trim() !== existingNews.title) {
      const titleExists = await this.newsModel.findOne({
        title: data.title.trim(),
        _id: { $ne: id },
        status: { $ne: NewsStatus.DELETE },
      });
      if (titleExists) {
        throw new BadRequestException('News with this title already exists');
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
      const uploadDir = join(process.cwd(), 'src', 'uploads', 'news');
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
      updateData.image = `/uploads/news/${uniqueFilename}`;
    } else if (data.image !== undefined) {
      // Agar image string sifatida yuborilsa
      updateData.image = data.image;
    }

    if (videoFile) {
      // eslint-disable-next-line @typescript-eslint/unbound-method
      const { createReadStream, filename, mimetype } = videoFile;
      const allowed = ['video/mp4', 'video/webm', 'video/ogg'];
      if (!allowed.includes(mimetype))
        throw new BadRequestException('Only mp4, webm, ogg allowed for videos');

      const sanitizedFilename = this.sanitizeFilename(filename);
      const uniqueFilename = `${Date.now()}-${sanitizedFilename}`;
      const uploadDir = join(process.cwd(), 'src', 'uploads', 'videos');
      const uploadPath = join(uploadDir, uniqueFilename);

      await import('fs').then((fs) => {
        if (!fs.existsSync(uploadDir))
          fs.mkdirSync(uploadDir, { recursive: true });
      });

      const stream = createReadStream();
      let size = 0;
      const MAX_SIZE = 25 * 1024 * 1024; // 25 MB

      await new Promise<void>((resolve, reject) => {
        stream
          .on('data', (chunk) => {
            size += chunk.length;
            if (size > MAX_SIZE)
              reject(new BadRequestException('Video exceeds 25MB limit'));
          })
          .pipe(createWriteStream(uploadPath))
          .on('finish', () => resolve())
          .on('error', (err) => reject(new BadRequestException(err.message)));
      });

      updateData.video = `/uploads/videos/${uniqueFilename}`;
    } else if (data.video !== undefined) {
      // Agar video string sifatida yuborilsa
      updateData.video = data.video;
    }

    // Status DELETE qo'yish mumkin (lekin remove faqat DELETE status'li news'larni o'chiradi)

    const updatedNews = await this.newsModel.findByIdAndUpdate(id, updateData, {
      new: true,
    });

    if (!updatedNews) {
      throw new BadRequestException('News not found');
    }

    return updatedNews;
  }

  async remove(id: string) {
    const news = await this.newsModel.findById(id);
    if (!news) {
      throw new BadRequestException('News not found');
    }

    // Faqat DELETE status'li news'larni o'chirish mumkin
    if (news.status !== NewsStatus.DELETE) {
      throw new BadRequestException(
        'Only news with DELETE status can be removed. Please change status to DELETE first.',
      );
    }

    await this.newsModel.findByIdAndDelete(id);

    return { message: 'News successfully removed from database', id };
  }
}
