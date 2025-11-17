import { InputType, Field, registerEnumType } from '@nestjs/graphql';
import { IsNotEmpty, IsOptional, IsEnum } from 'class-validator';
import { NewsStatus } from '../schemas/news.schema';

registerEnumType(NewsStatus, {
  name: 'NewsStatus',
  description: 'News status enum',
});

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

  @Field(() => NewsStatus, { nullable: true })
  @IsOptional()
  @IsEnum(NewsStatus)
  status?: NewsStatus;
}
