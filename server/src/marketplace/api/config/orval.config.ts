import { defineConfig } from 'orval'

export default defineConfig({
  marketplace: {
    input: {
      target: 'https://marketplace-api.sshopencloud.eu/v3/api-docs',
      override: {
        transformer: './orval.transformer.ts',
      },
      filters: {
        tags: [
          'actor-controller',
          'concept-controller',
          'dataset-controller',
          'fake-auth-controller',
          'publication-controller',
          'search-controller',
          'source-controller',
          'tool-controller',
          'training-material-controller',
        ],
      },
    },
    output: {
      mode: 'tags-split',
      client: 'fetch',
      formatter: 'prettier',
      target: '../generated/marketplace.ts',
      urlEncodeParameters: true,
      schemas: {
        path: '../generated/models',
        type: 'zod',
      },
      clean: true,
      override: {
        fetch: {
          includeHttpResponseReturnType: false,
        },
        mutator: {
          path: '../../fetcher.ts',
          name: 'marketplaceFetch',
        },
      },
    },
  },
})
