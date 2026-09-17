import { useEffect, useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { Copy01Icon, Tick02Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { TextWithValues } from '@/components/CopyableValue'
import { cn } from '@/lib/utils'

export const Route = createFileRoute('/_app/about/ai')({
  component: AboutAiPage,
})

const SERVER_URL: string =
  import.meta.env['VITE_SERVER_URL'] ?? 'http://localhost:8787'
const MCP_URL = `${SERVER_URL}/mcp`

const PUBLIC_TOOLS = ['search_entities', 'get_entity'] as const
const AUTHENTICATED_TOOLS = [
  'create_entity',
  'update_entity',
  'delete_entity',
] as const

const CLAUDE_CODE_SNIPPET = `claude mcp add --transport http idhi ${MCP_URL}`

const CURSOR_SNIPPET = `{
  "mcpServers": {
    "idhi": {
      "url": "${MCP_URL}"
    }
  }
}`

const CODEX_SNIPPET = `[mcp_servers.idhi]
url = "${MCP_URL}"`

const GEMINI_SNIPPET = `{
  "mcpServers": {
    "idhi": {
      "httpUrl": "${MCP_URL}"
    }
  }
}`

const VSCODE_SNIPPET = `{
  "servers": {
    "idhi": {
      "type": "http",
      "url": "${MCP_URL}"
    }
  }
}`

const INSPECTOR_SNIPPET = 'npx @modelcontextprotocol/inspector'

type ClientKey =
  | 'claude_code'
  | 'claude'
  | 'cursor'
  | 'chatgpt'
  | 'codex'
  | 'gemini'
  | 'vscode'
  | 'other'

const CLIENTS: {
  key: ClientKey
  snippet?: string
  values?: Record<string, string>
}[] = [
  { key: 'claude_code', snippet: CLAUDE_CODE_SNIPPET },
  { key: 'claude', snippet: MCP_URL, values: { name: 'IDHI' } },
  {
    key: 'cursor',
    snippet: CURSOR_SNIPPET,
    values: {
      projectPath: '.cursor/mcp.json',
      globalPath: '~/.cursor/mcp.json',
      globalPathWindows: '%USERPROFILE%\\.cursor\\mcp.json',
    },
  },
  { key: 'chatgpt', snippet: MCP_URL },
  {
    key: 'codex',
    snippet: CODEX_SNIPPET,
    values: {
      path: '~/.codex/config.toml',
      pathWindows: '%USERPROFILE%\\.codex\\config.toml',
    },
  },
  {
    key: 'gemini',
    snippet: GEMINI_SNIPPET,
    values: {
      path: '~/.gemini/settings.json',
      pathWindows: '%USERPROFILE%\\.gemini\\settings.json',
    },
  },
  {
    key: 'vscode',
    snippet: VSCODE_SNIPPET,
    values: { path: '.vscode/mcp.json' },
  },
  { key: 'other', snippet: INSPECTOR_SNIPPET },
]

const SECTION_IDS = [
  'endpoint',
  'capabilities',
  ...CLIENTS.map(({ key }) => `client-${key}`),
]

function useActiveSection(): string {
  const [active, setActive] = useState(SECTION_IDS[0] ?? '')

  useEffect(() => {
    const visible = new Set<string>()
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            visible.add(entry.target.id)
          } else {
            visible.delete(entry.target.id)
          }
        }
        const first = SECTION_IDS.find((id) => visible.has(id))
        if (first) {
          setActive(first)
        }
      },
      { rootMargin: '0px 0px -55% 0px' },
    )
    for (const id of SECTION_IDS) {
      const element = document.getElementById(id)
      if (element) {
        observer.observe(element)
      }
    }
    return () => observer.disconnect()
  }, [])

  return active
}

function scrollToSection(id: string) {
  const reduceMotion = window.matchMedia(
    '(prefers-reduced-motion: reduce)',
  ).matches
  document
    .getElementById(id)
    ?.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth' })
}

function NavLink({
  id,
  label,
  active,
  nested,
}: {
  id: string
  label: string
  active: boolean
  nested?: boolean
}) {
  return (
    <li>
      <button
        type="button"
        aria-current={active || undefined}
        onClick={() => scrollToSection(id)}
        className={cn(
          'block w-full cursor-pointer border-s-2 py-1 ps-3 text-start text-xs transition-colors',
          nested && 'ps-6',
          active
            ? 'border-primary font-medium text-foreground'
            : 'border-border text-muted-foreground hover:text-foreground',
        )}
      >
        {label}
      </button>
    </li>
  )
}

function QuickNav() {
  const { t } = useTranslation()
  const active = useActiveSection()

  return (
    <nav
      aria-label={t('about.ai.nav')}
      className="sticky top-2 hidden w-52 shrink-0 self-start lg:block"
    >
      <p className="mb-2 text-xs font-semibold text-muted-foreground uppercase">
        {t('about.ai.nav')}
      </p>
      <ul>
        <NavLink
          id="endpoint"
          label={t('about.ai.endpoint')}
          active={active === 'endpoint'}
        />
        <NavLink
          id="capabilities"
          label={t('about.ai.capabilities.title')}
          active={active === 'capabilities'}
        />
        <li className="border-s-2 border-border py-1 ps-3 text-xs text-muted-foreground">
          {t('about.ai.clients.title')}
        </li>
        {CLIENTS.map(({ key }) => (
          <NavLink
            key={key}
            id={`client-${key}`}
            label={t(`about.ai.clients.${key}.title`)}
            active={active === `client-${key}`}
            nested
          />
        ))}
      </ul>
    </nav>
  )
}

function CodeBlock({ code }: { code: string }) {
  const { t } = useTranslation()
  const [copied, setCopied] = useState(false)

  return (
    <div className="relative mt-2 rounded-md border bg-muted/50" dir="ltr">
      <pre className="overflow-x-auto p-3 pe-12 font-mono text-xs leading-relaxed">
        {code}
      </pre>
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-1.5 inset-e-1.5"
        aria-label={copied ? t('common.copied') : t('common.copy')}
        onPress={() => {
          void navigator.clipboard.writeText(code)
          setCopied(true)
          setTimeout(() => setCopied(false), 1500)
        }}
      >
        <HugeiconsIcon
          icon={copied ? Tick02Icon : Copy01Icon}
          strokeWidth={1.8}
        />
      </Button>
      <span role="status" className="sr-only">
        {copied ? t('common.copied') : ''}
      </span>
    </div>
  )
}

function ClientSection({
  clientKey,
  snippet,
  values,
}: {
  clientKey: ClientKey
  snippet?: string
  values?: Record<string, string>
}) {
  const { t } = useTranslation()

  return (
    <section id={`client-${clientKey}`} className="mt-6 scroll-mt-4">
      <h3 className="text-sm font-semibold">
        {t(`about.ai.clients.${clientKey}.title`)}
      </h3>
      <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
        <TextWithValues
          text={t(`about.ai.clients.${clientKey}.instructions`)}
          values={values}
        />
      </p>
      {snippet ? <CodeBlock code={snippet} /> : null}
    </section>
  )
}

function AboutAiPage() {
  const { t } = useTranslation()

  return (
    <div className="mx-auto flex max-w-5xl gap-10">
      <div className="min-w-0 max-w-3xl flex-1 pb-8">
        <h1 className="text-lg font-semibold">{t('about.ai.title')}</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          {t('about.ai.intro')}
        </p>

        <section id="endpoint" className="scroll-mt-4">
          <h2 className="mt-6 text-base font-semibold">
            {t('about.ai.endpoint')}
          </h2>
          <CodeBlock code={MCP_URL} />
        </section>

        <section id="capabilities" className="scroll-mt-4">
          <h2 className="mt-8 text-base font-semibold">
            {t('about.ai.capabilities.title')}
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {t('about.ai.capabilities.public')}
          </p>
          <ul className="mt-1 list-disc space-y-1 ps-6 text-sm">
            {PUBLIC_TOOLS.map((tool) => (
              <li key={tool}>
                <code className="font-mono text-xs">{tool}</code>
                {' - '}
                {t(`about.ai.capabilities.tools.${tool}`)}
              </li>
            ))}
          </ul>
          <p className="mt-3 text-sm text-muted-foreground">
            {t('about.ai.capabilities.authenticated')}
          </p>
          <ul className="mt-1 list-disc space-y-1 ps-6 text-sm">
            {AUTHENTICATED_TOOLS.map((tool) => (
              <li key={tool}>
                <code className="font-mono text-xs">{tool}</code>
                {' - '}
                {t(`about.ai.capabilities.tools.${tool}`)}
              </li>
            ))}
          </ul>
          <p className="mt-3 text-sm text-muted-foreground">
            {t('about.ai.capabilities.auth_note')}
          </p>
        </section>

        <h2 className="mt-8 text-base font-semibold">
          {t('about.ai.clients.title')}
        </h2>
        {CLIENTS.map(({ key, snippet, values }) => (
          <ClientSection
            key={key}
            clientKey={key}
            snippet={snippet}
            values={values}
          />
        ))}
      </div>
      <QuickNav />
    </div>
  )
}
