import { defineConfig } from 'orval'
export default defineConfig({
  idhi: {
    input: {
      target: '../openapi.yaml',
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
          strict: {
            response: true,
          },
        },
      },
      clean: true,
    },
  },
})
