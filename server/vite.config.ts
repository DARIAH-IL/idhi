import { cloudflare } from '@cloudflare/vite-plugin'
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { defineConfig, loadEnv } from 'vite'

function syncEnvToDevVars() {
  return {
    name: 'sync-env-to-dev-vars',
    configureServer() {
      const content = ['.env', '.env.local']
        .filter(existsSync)
        .map((f) => readFileSync(f, 'utf-8').trim())
        .filter(Boolean)
        .join('\n')
      if (content) writeFileSync('.dev.vars', content + '\n')
    },
  }
}

export default defineConfig(({ command, mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  return {
    server: { port: env.PORT ? Number(env.PORT) : undefined },
    plugins: [command === 'serve' && syncEnvToDevVars(), cloudflare()],
  }
})
