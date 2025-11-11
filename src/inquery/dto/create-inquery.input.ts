import { InputType, Field } from '@nestjs/graphql';
import { IsNotEmpty, IsEmail, IsBoolean } from 'class-validator';

@InputType()
export class CreateInqueryInput {
  @Field()
  @IsNotEmpty()
  name: string;

  @Field()
  @IsEmail()
  email: string;

  @Field()
  @IsNotEmpty()
  phone: string;

  @Field({ nullable: true })
  detail?: string;

  @Field()
  @IsBoolean()
  agreed: boolean;
}
