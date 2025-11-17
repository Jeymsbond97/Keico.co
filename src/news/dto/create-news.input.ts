import { InputType, Field } from '@nestjs/graphql';
import { IsNotEmpty, IsOptional, IsEnum } from 'class-validator';
import { NewsStatus } from '../schemas/news.schema';

@InputType()
export class CreateNewsInput {
  @Field()
  @IsNotEmpty()
  title: string;

  @Field()
  @IsNotEmpty()
  content: string;

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
