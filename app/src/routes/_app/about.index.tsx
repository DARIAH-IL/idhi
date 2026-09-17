import { createFileRoute } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import {
  ApiIcon,
  BookOpenTextIcon,
  OpenSourceIcon,
} from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'

const technicalResources = [
  {
    key: 'ontology',
    href: 'https://dariah-il.github.io/idhi-manifests/',
    icon: BookOpenTextIcon,
  },
  {
    key: 'api',
    href: 'https://api.idh-index.org/',
    icon: ApiIcon,
  },
  {
    key: 'code',
    href: 'https://github.com/DARIAH-IL/idhi',
    icon: OpenSourceIcon,
  },
] as const

export const Route = createFileRoute('/_app/about/')({
  component: AboutPage,
})

function AboutPage() {
  const { t } = useTranslation()
  return (
    <div className="mx-auto max-w-4xl space-y-10 pb-8">
      <header className="grid gap-8 rounded-2xl border bg-muted/30 p-6 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center sm:p-8">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            {t('about.title')}
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-muted-foreground">
            {t('about.intro')}
          </p>
        </div>
        <div className="flex items-center justify-center gap-6">
          <img
            src="/logo.png"
            alt={t('about.logos.idhi')}
            className="h-20 w-auto object-contain"
          />
          <div className="h-16 w-px bg-border" aria-hidden="true" />
          <img
            src="/dariah-il.png"
            alt={t('about.logos.dariah_il')}
            className="h-24 w-24 object-contain"
          />
        </div>
      </header>

      <section aria-labelledby="about-why">
        <h2 id="about-why" className="text-xl font-semibold">
          {t('about.why.title')}
        </h2>
        <p className="mt-3 leading-7 text-muted-foreground">
          {t('about.why.body')}
        </p>
      </section>

      <section aria-labelledby="about-directory">
        <h2 id="about-directory" className="text-xl font-semibold">
          {t('about.directory.title')}
        </h2>
        <p className="mt-3 leading-7 text-muted-foreground">
          {t('about.directory.body')}
        </p>
      </section>

      <section aria-labelledby="about-goals">
        <h2 id="about-goals" className="text-xl font-semibold">
          {t('about.goals.title')}
        </h2>
        <ul className="mt-4 grid gap-4 sm:grid-cols-2">
          {(['discover', 'connect', 'preserve', 'represent'] as const).map(
            (goal) => (
              <li key={goal} className="rounded-xl border p-5">
                <h3 className="font-semibold">
                  {t(`about.goals.items.${goal}.title`)}
                </h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  {t(`about.goals.items.${goal}.body`)}
                </p>
              </li>
            ),
          )}
        </ul>
      </section>

      <section
        aria-labelledby="about-dariah"
        className="rounded-2xl border p-6 sm:p-8"
      >
        <h2 id="about-dariah" className="text-xl font-semibold">
          {t('about.dariah.title')}
        </h2>
        <p className="mt-3 leading-7 text-muted-foreground">
          {t('about.dariah.body')}
        </p>
      </section>

      <section
        aria-labelledby="about-technical"
        className="rounded-2xl border p-6 sm:p-8"
      >
        <h2 id="about-technical" className="text-xl font-semibold">
          {t('about.technical.title')}
        </h2>
        <p className="mt-3 leading-7 text-muted-foreground">
          {t('about.technical.intro')}
        </p>
        <ul className="mt-5 grid gap-4 sm:grid-cols-3">
          {technicalResources.map(({ key, href, icon }) => (
            <li key={key} className="rounded-xl border p-5">
              <h3 className="flex items-center gap-2 font-semibold">
                <HugeiconsIcon
                  icon={icon}
                  strokeWidth={1.8}
                  className="size-5 shrink-0 text-muted-foreground"
                  aria-hidden="true"
                />
                <a
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="app-link"
                >
                  {t(`about.technical.resources.${key}.title`)}
                </a>
              </h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                {t(`about.technical.resources.${key}.body`)}
              </p>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
