import { cloudflare } from '@cloudflare/vite-plugin'
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { defineConfig, loadEnv } from 'vite'

function syncEnvToDevVars(env: Record<string, string>) {
  return {
    name: 'sync-env-to-dev-vars',
    configureServer() {
      const keys = ['.env', '.env.local'].filter(existsSync).flatMap((file) =>
        readFileSync(file, 'utf-8')
          .split(/\r?\n/)
          .map((line) => line.match(/^\s*(?:export\s+)?([\w.-]+)\s*=/)?.[1])
          .filter((key): key is string => Boolean(key)),
      )
      const content = [...new Set(keys)]
        .filter((key) => key in env)
        .map((key) => `${key}=${JSON.stringify(env[key])}`)
        .join('\n')
      if (content) writeFileSync('.dev.vars', content + '\n')
    },
  }
}

export default defineConfig(({ command, mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  return {
    server: { port: env.PORT ? Number(env.PORT) : undefined },
    plugins: [command === 'serve' && syncEnvToDevVars(env), cloudflare()],
  }
})
