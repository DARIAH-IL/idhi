import { defineConfig } from 'i18next-cli'

export default defineConfig({
  locales: ['en', 'he', 'ar'],
  extract: {
    input: 'src/**/*.{js,jsx,ts,tsx}',
    output: 'public/locales/{{language}}/{{namespace}}.json',
  },
  lint: {
    ignore: ['src/lib/legal.ts', 'src/components/LegalDocument.tsx'],
  },
})
