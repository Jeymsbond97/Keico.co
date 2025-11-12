import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { News } from './schemas/news.schema';
import { CreateNewsInput } from './dto/create-news.input';
import { UpdateNewsInput } from './dto/update-news.input';
import { validateImageFile } from '../common/utils/file-validator';
import { createWriteStream } from 'fs';
import { join } from 'path';
import { FileUpload } from 'graphql-upload-ts';

@Injectable()
export class NewsService {
  constructor(@InjectModel(News.name) private newsModel: Model<News>) {}

  async create(
    data: CreateNewsInput,
    file?: FileUpload,
    videoFile?: FileUpload,
  ) {
    let imagePath: string | null = data.image ?? null;
    let videoPath: string | null = data.video ?? null;
    if (file) {
      // eslint-disable-next-line @typescript-eslint/unbound-method
      const { createReadStream, filename } = file;
      validateImageFile(filename);

      const uniqueFilename = `${Date.now()}-${filename}`;
      const uploadDir = join(process.cwd(), 'src', 'uploads', 'news');
      const uploadPath = join(uploadDir, uniqueFilename);

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

      const uniqueFilename = `${Date.now()}-${filename}`;
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
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
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
    });
  }

  async findAll() {
    return this.newsModel.find().sort({ createdAt: -1 });
  }

  async findOne(id: string) {
    return this.newsModel.findById(id);
  }

  async update(
    id: string,
    data: UpdateNewsInput,
    file?: FileUpload,
    videoFile?: FileUpload,
  ) {
    // Extract id and create update data without it
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id: _id, ...updateData } = data;

    if (file) {
      // eslint-disable-next-line @typescript-eslint/unbound-method
      const { createReadStream, filename } = file;
      validateImageFile(filename);

      const uniqueFilename = `${Date.now()}-${filename}`;
      const uploadDir = join(process.cwd(), 'src', 'uploads', 'news');
      const uploadPath = join(uploadDir, uniqueFilename);

      await new Promise<void>((resolve, reject) => {
        createReadStream()
          .pipe(createWriteStream(uploadPath))
          .on('finish', () => resolve())
          .on('error', (error) =>
            reject(new BadRequestException(error.message)),
          );
      });
      updateData.image = `/uploads/news/${uniqueFilename}`;
    } else if (data.image) {
      updateData.image = data.image;
    }

    if (videoFile) {
      // eslint-disable-next-line @typescript-eslint/unbound-method
      const { createReadStream, filename, mimetype } = videoFile;
      const allowed = ['video/mp4', 'video/webm', 'video/ogg'];
      if (!allowed.includes(mimetype))
        throw new BadRequestException('Only mp4, webm, ogg allowed for videos');

      const uniqueFilename = `${Date.now()}-${filename}`;
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
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            size += chunk.length;
            if (size > MAX_SIZE)
              reject(new BadRequestException('Video exceeds 25MB limit'));
          })
          .pipe(createWriteStream(uploadPath))
          .on('finish', () => resolve())
          .on('error', (err) => reject(new BadRequestException(err.message)));
      });

      updateData.video = `/uploads/videos/${uniqueFilename}`;
    } else if (data.video) {
      updateData.video = data.video;
    }

    return this.newsModel.findByIdAndUpdate(
      id,
      updateData as Partial<CreateNewsInput>,
      { new: true },
    );
  }

  async remove(id: string) {
    return this.newsModel.findByIdAndDelete(id);
  }
}
