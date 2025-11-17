import { ObjectType, Field } from '@nestjs/graphql';
import { NewsStatus } from './schemas/news.schema';

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
