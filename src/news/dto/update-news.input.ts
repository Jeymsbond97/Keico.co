import { InputType, Field, registerEnumType } from '@nestjs/graphql';
import { IsNotEmpty, IsOptional, IsEnum } from 'class-validator';
import { NewsStatus } from '../schemas/news.schema';

registerEnumType(NewsStatus, {
  name: 'NewsStatus',
  description: 'News status enum',
});

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

  @Field(() => NewsStatus, { nullable: true })
  @IsOptional()
  @IsEnum(NewsStatus)
  status?: NewsStatus;
}
