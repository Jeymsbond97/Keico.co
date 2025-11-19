/* eslint-disable @typescript-eslint/no-explicit-any */
import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client';
import { print } from 'graphql';

const httpLink = createHttpLink({
  uri: `${window.location.origin}/graphql`,
});

export const apolloClient = new ApolloClient({
  link: httpLink,
  cache: new InMemoryCache(),
  defaultOptions: {
    mutate: {
      fetchPolicy: 'no-cache',
    },
    query: {
      fetchPolicy: 'network-only',
    },
  },
});

export async function uploadWithFiles(
  mutation: string | any,
  variables: Record<string, any>,
  files: { file?: File; videoFile?: File },
) {
  const formData = new FormData();
  
  // Convert GraphQL DocumentNode to string if needed
  let mutationString = mutation;
  if (typeof mutation !== 'string') {
    mutationString = print(mutation);
  }

  // Build variables first
  const inputVariables: any = { ...variables.input };
  const finalVariables: any = { input: inputVariables };

  // Build map for files
  const map: Record<string, string[]> = {};
  let fileIndex = 0;

  if (files.file) {
    finalVariables.file = null;
    map[fileIndex.toString()] = ['variables.file'];
    fileIndex++;
  }

  if (files.videoFile) {
    finalVariables.videoFile = null;
    map[fileIndex.toString()] = ['variables.videoFile'];
    fileIndex++;
  }

  // IMPORTANT: operations and map must come FIRST, then files
  // This follows GraphQL multipart request spec
  formData.append('operations', JSON.stringify({
    query: mutationString,
    variables: finalVariables,
  }));
  formData.append('map', JSON.stringify(map));

  // Append files AFTER operations and map
  if (files.file) {
    formData.append('0', files.file);
  }
  if (files.videoFile) {
    formData.append(files.file ? '1' : '0', files.videoFile);
  }

  const response = await fetch(`${window.location.origin}/graphql`, {
    method: 'POST',
    headers: {
      'apollo-require-preflight': 'true',
    },
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.errors?.[0]?.message || 'Upload failed');
  }

  return response.json();
}

