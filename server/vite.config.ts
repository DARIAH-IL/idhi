import { cloudflare } from '@cloudflare/vite-plugin'
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { defineConfig, loadEnv } from 'vite'

function syncEnvToDevVars(env: Record<string, string>) {
  function sync() {
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
    const devVars = content + '\n'
    if (
      content &&
      (!existsSync('.dev.vars') ||
        readFileSync('.dev.vars', 'utf-8') !== devVars)
    ) {
      writeFileSync('.dev.vars', devVars)
    }
  }

  return {
    name: 'sync-env-to-dev-vars',
    configResolved: sync,
  }
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  return {
    server: { port: env.PORT ? Number(env.PORT) : undefined },
    environments: {
      idhi_server: {
        optimizeDeps: {
          include: [
            'mongoose > mongodb > mongodb-connection-string-url > whatwg-url > tr46 > punycode',
          ],
          rolldownOptions: {
            plugins: [
              {
                name: 'bundle-punycode-for-workers',
                resolveId(source, importer) {
                  if (source === 'punycode/' && importer) {
                    return createRequire(importer).resolve(source)
                  }
                },
              },
            ],
          },
        },
      },
    },
    plugins: [
      syncEnvToDevVars(env),
      cloudflare(),
      {
        name: 'patch-bson-objectid-global-scope-crypto',
        renderChunk(code) {
          const target = 'this.PROCESS_UNIQUE = ByteUtils.randomBytes(5);'
          if (!code.includes(target)) {
            return null
          }
          return {
            code: code.replace(
              target,
              'this.PROCESS_UNIQUE = Uint8Array.from({length:5},()=>(Math.random()*256)|0);',
            ),
            map: null,
          }
        },
      },
    ],
  }
})
