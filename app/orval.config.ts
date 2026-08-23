import { defineConfig } from 'orval'

export default defineConfig({
  idhi: {
    input: {
      target: '../openapi.yaml',
      parserOptions: {
        externalRefs: {
          allow: ['*'],
        },
      },
    },
    output: {
      mode: 'tags-split',
      client: 'react-query',
      formatter: 'prettier',
      target: 'src/api/hooks/api.ts',
      schemas: 'src/api/models',
      urlEncodeParameters: true,
      httpClient: 'axios',
      clean: true,
      override: {
        operations: {
          searchEntities: {
            query: {
              useQuery: true,
            },
          },
        },
        mutator: {
          path: 'src/api/client.ts',
          name: 'customInstance',
        },
      },
    },
  },
})
