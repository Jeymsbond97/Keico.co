import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type InqueryDocument = Inquery & Document;

@Schema({ timestamps: true })
export class Inquery {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  email: string;

  @Prop({ required: true })
  phone: string;

  @Prop()
  detail?: string;

  @Prop({ required: true })
  agreed: boolean;
}

export const InquerySchema = SchemaFactory.createForClass(Inquery);
