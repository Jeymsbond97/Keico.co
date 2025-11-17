import { Resolver, Mutation, Args, Query } from '@nestjs/graphql';
import { InqueryService } from './inquery.service';
import { CreateInqueryInput } from './dto/create-inquery.input';
import { InqueryType } from './inquery.type';

@Resolver(() => InqueryType)
export class InqueryResolver {
  constructor(private readonly inqueryService: InqueryService) {}

  @Mutation(() => InqueryType)
  async createInquery(@Args('input') input: CreateInqueryInput) {
    return this.inqueryService.create(input);
  }

  @Query(() => [InqueryType])
  async findAllInqueries() {
    return this.inqueryService.findAll();
  }

  @Query(() => InqueryType)
  async findOneInquery(@Args('id') id: string) {
    return this.inqueryService.findOne(id);
  }
}
