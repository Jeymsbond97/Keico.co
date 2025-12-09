import { InputType, Field, Int } from '@nestjs/graphql';
import { IsOptional, IsEnum, Min } from 'class-validator';
import { SortDirection } from '../../news/dto/news-filter.input';

@InputType()
export class ProductFilterInput {
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
}

