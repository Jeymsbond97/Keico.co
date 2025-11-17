import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type NewsDocument = News & Document;

export enum NewsStatus {
  PAUSE = 'PAUSE',
  ACTIVE = 'ACTIVE',
  DELETE = 'DELETE',
}

@Schema({ timestamps: true })
export class News extends Document {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  content: string;

  @Prop()
  image?: string;

  @Prop()
  video?: string;

  @Prop({ default: NewsStatus.PAUSE, enum: NewsStatus })
  status: NewsStatus;
}

export const NewsSchema = SchemaFactory.createForClass(News);
