import { defineConfig } from 'orval'
export default defineConfig({
  idhi: {
    input: {
      target: '../openapi.yaml',
      override: {
        transformer: './orval.transformer.ts',
      },
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
        zod: {
          coerce: {
            query: true,
          },
        },
      },
      clean: ['!**/*.handlers.ts'],
    },
  },
})
