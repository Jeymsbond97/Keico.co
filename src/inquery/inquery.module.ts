import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { InqueryService } from './inquery.service';
import { InqueryResolver } from './inquery.resolver';
import { Inquery, InquerySchema } from './schemes/inquery.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Inquery.name, schema: InquerySchema }]),
  ],
  providers: [InqueryService, InqueryResolver],
  exports: [InqueryService],
})
export class InqueryModule {}
