/* eslint-disable @typescript-eslint/unbound-method */
import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { NewsService } from './news.service';
import { CreateNewsInput } from './dto/create-news.input';
import { UpdateNewsInput } from './dto/update-news.input';
import { NewsType, NewsListType } from './news.type';
import { NewsFilterInput } from './dto/news-filter.input';
import { GraphQLUpload, FileUpload } from 'graphql-upload-ts';
import { join } from 'path';
import { createWriteStream } from 'fs';

@Resolver(() => NewsType)
export class NewsResolver {
  constructor(private readonly newsService: NewsService) {}

  @Mutation(() => NewsType)
  async createNews(
    @Args('input') input: CreateNewsInput,
    @Args({ name: 'file', type: () => GraphQLUpload, nullable: true })
    file?: FileUpload,
    @Args({ name: 'videoFile', type: () => GraphQLUpload, nullable: true })
    videoFile?: FileUpload,
  ) {
    console.log('Mutation: createNews');
    return this.newsService.create(input, file, videoFile);
  }

  @Query(() => NewsListType)
  async findAllNews(
    @Args('input', { nullable: true }) input?: NewsFilterInput,
  ) {
    console.log('Query: FindAllNews');
    return this.newsService.findAll(input || {});
  }

  @Query(() => NewsType)
  findOneNews(@Args('id', { type: () => String }) id: string) {
    console.log('Query: findOneNews');
    return this.newsService.findOne(id);
  }

  @Mutation(() => NewsType)
  async updateNews(
    @Args('input') input: UpdateNewsInput,
    @Args({ name: 'file', type: () => GraphQLUpload, nullable: true })
    file?: FileUpload,
    @Args({ name: 'videoFile', type: () => GraphQLUpload, nullable: true })
    videoFile?: FileUpload,
  ) {
    const { id } = input;
    console.log('Mutation: updateNews');
    return this.newsService.update(id, input, file, videoFile);
  }

  @Mutation(() => String)
  async removeNews(@Args('id', { type: () => String }) id: string) {
    const result = await this.newsService.remove(id);
    console.log('Mutation: removeNews');
    return result.message || 'News successfully removed from database';
  }

  @Mutation(() => [String])
  async imagesUploader(
    @Args({ name: 'files', type: () => [GraphQLUpload] })
    files: Promise<FileUpload>[],
    @Args('target') target: string,
  ): Promise<string[]> {
    const uploadedImages: string[] = [];

    await Promise.all(
      files.map(async (filePromise: Promise<FileUpload>, index: number) => {
        try {
          const { filename, mimetype, createReadStream } = await filePromise;

          const allowed = ['image/jpeg', 'image/jpg', 'image/png'];
          if (!allowed.includes(mimetype))
            throw new Error('Only jpg, jpeg, png allowed');

          const uniqueFilename = `${Date.now()}-${filename}`;
          const folderPath = join(
            process.cwd(),
            'src',
            'uploads',
            'images',
            target,
          );
          const fullPath = join(folderPath, uniqueFilename);

          await import('fs').then((fs) => {
            if (!fs.existsSync(folderPath))
              fs.mkdirSync(folderPath, { recursive: true });
          });

          const stream = createReadStream();
          await new Promise<void>((resolve, reject) => {
            stream
              .pipe(createWriteStream(fullPath))
              .on('finish', () => resolve())
              .on('error', (error) => reject(error));
          });

          uploadedImages[index] = `/uploads/images/${target}/${uniqueFilename}`;
        } catch (err) {
          console.log('File upload failed:', (err as Error).message);
        }
      }),
    );

    console.log('Images uploaded successfully');
    return uploadedImages;
  }

  @Mutation(() => [String])
  async videosUploader(
    @Args({ name: 'files', type: () => [GraphQLUpload] })
    files: Promise<FileUpload>[],
    @Args('target') target: string,
  ): Promise<string[]> {
    const uploadedVideos: string[] = [];

    await Promise.all(
      files.map(async (filePromise: Promise<FileUpload>, index: number) => {
        try {
          const { filename, mimetype, createReadStream } = await filePromise;

          const allowed = ['video/mp4', 'video/webm', 'video/ogg'];
          if (!allowed.includes(mimetype))
            throw new Error('Only mp4, webm, ogg allowed');

          const uniqueFilename = `${Date.now()}-${filename}`;
          const folderPath = join(
            process.cwd(),
            'src',
            'uploads',
            'videos',
            target,
          );
          const fullPath = join(folderPath, uniqueFilename);

          await import('fs').then((fs) => {
            if (!fs.existsSync(folderPath))
              fs.mkdirSync(folderPath, { recursive: true });
          });

          const stream = createReadStream();
          await new Promise<void>((resolve, reject) => {
            stream
              .pipe(createWriteStream(fullPath))
              .on('finish', () => resolve())
              .on('error', (error) => reject(error));
          });

          uploadedVideos[index] = `/uploads/videos/${target}/${uniqueFilename}`;
        } catch (err) {
          console.log('Video upload failed:', (err as Error).message);
        }
      }),
    );

    console.log('Videos uploaded successfully');
    return uploadedVideos;
  }
}
