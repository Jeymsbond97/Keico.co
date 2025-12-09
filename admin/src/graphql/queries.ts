import { gql } from '@apollo/client';

export const FIND_ALL_NEWS = gql`
  query FindAllNews($input: NewsFilterInput) {
    findAllNews(input: $input) {
      list {
        id
        title
        content
        status
        image
        video
        createdAt
        updatedAt
      }
      metaCounter {
        total
      }
    }
  }
`;

export const FIND_ONE_NEWS = gql`
  query FindOneNews($id: String!) {
    findOneNews(id: $id) {
      id
      title
      content
      status
      image
      video
      createdAt
      updatedAt
    }
  }
`;

export const CREATE_NEWS = gql`
  mutation CreateNews(
    $input: CreateNewsInput!
    $file: Upload
    $videoFile: Upload
  ) {
    createNews(input: $input, file: $file, videoFile: $videoFile) {
      id
      title
      content
      status
      image
      video
      createdAt
      updatedAt
    }
  }
`;

export const UPDATE_NEWS = gql`
  mutation UpdateNews(
    $input: UpdateNewsInput!
    $file: Upload
    $videoFile: Upload
  ) {
    updateNews(input: $input, file: $file, videoFile: $videoFile) {
      id
      title
      content
      status
      image
      video
      createdAt
      updatedAt
    }
  }
`;

export const REMOVE_NEWS = gql`
  mutation RemoveNews($id: String!) {
    removeNews(id: $id)
  }
`;

export const FIND_ALL_PRODUCTS = gql`
  query FindAllProducts($input: ProductFilterInput) {
    findAllProducts(input: $input) {
      list {
        id
        title
        description
        image
        createdAt
        updatedAt
      }
      metaCounter {
        total
      }
    }
  }
`;

export const FIND_ONE_PRODUCT = gql`
  query FindOneProduct($id: String!) {
    findOneProduct(id: $id) {
      id
      title
      description
      image
      createdAt
      updatedAt
    }
  }
`;

export const CREATE_PRODUCT = gql`
  mutation CreateProduct($input: CreateProductInput!, $file: Upload) {
    createProduct(input: $input, file: $file) {
      id
      title
      description
      image
      createdAt
      updatedAt
    }
  }
`;

export const UPDATE_PRODUCT = gql`
  mutation UpdateProduct($input: UpdateProductInput!, $file: Upload) {
    updateProduct(input: $input, file: $file) {
      id
      title
      description
      image
      createdAt
      updatedAt
    }
  }
`;

export const REMOVE_PRODUCT = gql`
  mutation RemoveProduct($id: String!) {
    removeProduct(id: $id)
  }
`;
