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
      client: 'hono',
      formatter: 'prettier',
      target: 'src/handlers/api.ts',
      schemas: 'src/models',
      override: {
        hono: {
          compositeRoute: 'src/routes.ts',
        },
      },
      clean: ['!**/*.handlers.ts'],
    },
  },
})
