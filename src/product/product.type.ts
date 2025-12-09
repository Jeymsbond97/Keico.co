import { ObjectType, Field, Int } from '@nestjs/graphql';

@ObjectType()
export class ProductType {
  @Field()
  id: string;

  @Field()
  title: string;

  @Field()
  description: string;

  @Field({ nullable: true })
  image?: string;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}

@ObjectType()
export class ProductTotalCounter {
  @Field(() => Int)
  total: number;
}

@ObjectType()
export class ProductListType {
  @Field(() => [ProductType])
  list: ProductType[];

  @Field(() => [ProductTotalCounter], { nullable: true })
  metaCounter: ProductTotalCounter[];
}

