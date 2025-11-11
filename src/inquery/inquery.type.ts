// inquery/dto/inquery.type.ts
import { ObjectType, Field } from '@nestjs/graphql';

@ObjectType()
export class InqueryType {
  @Field()
  id: string;

  @Field()
  name: string;

  @Field()
  email: string;

  @Field()
  phone: string;

  @Field({ nullable: true })
  detail?: string;

  @Field()
  agreed: boolean;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}
