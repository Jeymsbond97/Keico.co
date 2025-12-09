/* eslint-disable @typescript-eslint/unbound-method */
import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { ProductService } from './product.service';
import { CreateProductInput } from './dto/create-product.input';
import { UpdateProductInput } from './dto/update-product.input';
import { ProductType, ProductListType } from './product.type';
import { ProductFilterInput } from './dto/product-filter.input';
import { GraphQLUpload, FileUpload } from 'graphql-upload-ts';

@Resolver(() => ProductType)
export class ProductResolver {
  constructor(private readonly productService: ProductService) {}

  @Mutation(() => ProductType)
  async createProduct(
    @Args('input') input: CreateProductInput,
    @Args({ name: 'file', type: () => GraphQLUpload, nullable: true })
    file?: FileUpload,
  ) {
    console.log('Mutation: createProduct');
    return this.productService.create(input, file);
  }

  @Query(() => ProductListType)
  async findAllProducts(
    @Args('input', { nullable: true }) input?: ProductFilterInput,
  ) {
    console.log('Query: FindAllProducts');
    return this.productService.findAll(input || {});
  }

  @Query(() => ProductType)
  findOneProduct(@Args('id', { type: () => String }) id: string) {
    console.log('Query: findOneProduct');
    return this.productService.findOne(id);
  }

  @Mutation(() => ProductType)
  async updateProduct(
    @Args('input') input: UpdateProductInput,
    @Args({ name: 'file', type: () => GraphQLUpload, nullable: true })
    file?: FileUpload,
  ) {
    const { id } = input;
    console.log('Mutation: updateProduct');
    return this.productService.update(id, input, file);
  }

  @Mutation(() => String)
  async removeProduct(@Args('id', { type: () => String }) id: string) {
    const result = await this.productService.remove(id);
    console.log('Mutation: removeProduct');
    return result.message || 'Product successfully removed from database';
  }
}

