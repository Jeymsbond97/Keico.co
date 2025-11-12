/* eslint-disable @typescript-eslint/unbound-method */
import { Resolver, Query, Mutation, Args, Context } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { NewsService } from './news.service';
import { CreateNewsInput } from './dto/create-news.input';
import { UpdateNewsInput } from './dto/update-news.input';
import { NewsType } from './news.type';
import { GraphQLUpload, FileUpload } from 'graphql-upload-ts';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { AdminGuard } from '../common/guards/admin.guard';
import { join } from 'path';
import { createWriteStream } from 'fs';

@Resolver(() => NewsType)
export class NewsResolver {
  constructor(private readonly newsService: NewsService) {}

  @Query(() => [NewsType])
  findAllNews() {
    return this.newsService.findAll();
  }

  @Query(() => NewsType)
  findOneNews(@Args('id') id: string) {
    return this.newsService.findOne(id);
  }

  @Mutation(() => NewsType)
  @UseGuards(JwtAuthGuard, AdminGuard)
  async createNews(
    @Args('input') input: CreateNewsInput,
    @Args({ name: 'file', type: () => GraphQLUpload, nullable: true })
    file?: FileUpload,
    @Args({ name: 'videoFile', type: () => GraphQLUpload, nullable: true })
    videoFile?: FileUpload,
  ) {
    return this.newsService.create(input, file, videoFile);
  }

  @Mutation(() => NewsType)
  @UseGuards(JwtAuthGuard, AdminGuard)
  async updateNews(
    @Args('input') input: UpdateNewsInput,
    @Args({ name: 'file', type: () => GraphQLUpload, nullable: true })
    file?: FileUpload,
    @Args({ name: 'videoFile', type: () => GraphQLUpload, nullable: true })
    videoFile?: FileUpload,
  ) {
    const { id, ...data } = input;
    return this.newsService.update(id, input, file, videoFile);
  }

  @Mutation(() => Boolean)
  @UseGuards(JwtAuthGuard, AdminGuard)
  async deleteNews(@Args('id') id: string) {
    await this.newsService.remove(id);
    return true;
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

          // create folder if not exist
          await import('fs').then((fs) => {
            if (!fs.existsSync(folderPath))
              fs.mkdirSync(folderPath, { recursive: true });
          });

          const stream = createReadStream();
          await new Promise<void>((resolve, reject) => {
            stream
              .pipe(createWriteStream(fullPath))
              .on('finish', () => resolve())
              // eslint-disable-next-line @typescript-eslint/prefer-promise-reject-errors
              .on('error', () => reject());
          });

          uploadedImages[index] = `/uploads/images/${target}/${uniqueFilename}`;
        } catch (err) {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
          console.log('File upload failed:', err.message);
        }
      }),
    );

    return uploadedImages;
  }
}
