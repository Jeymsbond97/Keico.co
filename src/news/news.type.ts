import { ObjectType, Field, Int, registerEnumType } from '@nestjs/graphql';
import { NewsStatus } from './schemas/news.schema';

registerEnumType(NewsStatus, {
  name: 'NewsStatus',
  description: 'News status enum',
});

@ObjectType()
export class NewsType {
  @Field()
  id: string;

  @Field()
  title: string;

  @Field()
  content: string;

  @Field(() => NewsStatus)
  status: NewsStatus;

  @Field({ nullable: true })
  image?: string;

  @Field({ nullable: true })
  video?: string;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}

@ObjectType()
export class TotalCounter {
  @Field(() => Int)
  total: number;
}

@ObjectType()
export class NewsListType {
  @Field(() => [NewsType])
  list: NewsType[];

  @Field(() => [TotalCounter], { nullable: true })
  metaCounter: TotalCounter[];
}
