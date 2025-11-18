import { InputType, Field, Int, registerEnumType } from '@nestjs/graphql';
import { IsNotEmpty, IsOptional, IsEnum, Min } from 'class-validator';
import { NewsStatus } from '../schemas/news.schema';

export enum SortDirection {
  ASC = 'ASC',
  DESC = 'DESC',
}

registerEnumType(SortDirection, {
  name: 'SortDirection',
  description: 'Sort direction enum',
});

@InputType()
export class NewsSearchInput {
  @IsOptional()
  @Field(() => NewsStatus, { nullable: true })
  status?: NewsStatus;
}

@InputType()
export class NewsFilterInput {
  @IsOptional()
  @Min(1)
  @Field(() => Int, { nullable: true, defaultValue: 1 })
  page?: number;

  @IsOptional()
  @Min(1)
  @Field(() => Int, { nullable: true, defaultValue: 5 })
  limit?: number;

  @IsOptional()
  @Field(() => String, { nullable: true, defaultValue: 'createdAt' })
  sort?: string;

  @IsOptional()
  @IsEnum(SortDirection)
  @Field(() => SortDirection, {
    nullable: true,
    defaultValue: SortDirection.DESC,
  })
  direction?: SortDirection;

  @IsOptional()
  @Field(() => NewsSearchInput, { nullable: true })
  search?: NewsSearchInput;
}
