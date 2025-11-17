import { InputType, Field } from '@nestjs/graphql';
import { IsNotEmpty, IsOptional, IsEnum } from 'class-validator';
import { NewsStatus } from '../schemas/news.schema';

@InputType()
export class UpdateNewsInput {
  @Field()
  @IsNotEmpty()
  id: string;

  @Field({ nullable: true })
  @IsOptional()
  title?: string;

  @Field({ nullable: true })
  @IsOptional()
  content?: string;

  @Field({ nullable: true })
  @IsOptional()
  image?: string;

  @Field({ nullable: true })
  @IsOptional()
  video?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsEnum(NewsStatus)
  status?: NewsStatus;
}
