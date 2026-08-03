import { defineConfig } from 'orval'

export default defineConfig({
  idhi: {
    input: {
      target: '../openapi.yaml',
    },
    output: {
      mode: 'tags-split',
      client: 'react-query',
      formatter: 'prettier',
      target: 'src/api/hooks/api.ts',
      schemas: 'src/api/models',
      clean: true,
    },
  },
})
