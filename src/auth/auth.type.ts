import { ObjectType, Field } from '@nestjs/graphql';

@ObjectType()
export class UserType {
  @Field()
  id: string;

  @Field()
  email: string;

  @Field()
  name: string;

  @Field()
  role: string;
}

@ObjectType()
export class AuthType {
  @Field()
  token: string;

  @Field(() => UserType)
  user: UserType;
}

