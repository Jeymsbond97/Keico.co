import { ObjectType, Field } from '@nestjs/graphql';

@ObjectType()
export class NewsType {
  @Field()
  id: string;

  @Field()
  title: string;

  @Field()
  content: string;

  @Field({ nullable: true })
  image?: string;

  @Field({ nullable: true })
  video?: string;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}
