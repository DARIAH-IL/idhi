import { createFileRoute } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'

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
    </div>
  )
}
