import { Fragment } from 'react'
import { useTranslation } from 'react-i18next'
import { UiLanguage } from '@/api/models'
import { CONTACT_EMAIL, LEGAL_LAST_UPDATED } from '@/lib/legal'
import type { LegalSection } from '@/lib/legal'
import { useUIStore } from '@/stores/ui'

function renderWithEmailLink(text: string) {
  const parts = text.split(CONTACT_EMAIL)
  return parts.map((part, index) => (
    <Fragment key={index}>
      {part}
      {index < parts.length - 1 && (
        <a className="app-link" href={`mailto:${CONTACT_EMAIL}`}>
          {CONTACT_EMAIL}
        </a>
      )}
    </Fragment>
  ))
}

export function LegalDocument({
  title,
  sections,
}: {
  title: string
  sections: LegalSection[]
}) {
  const { t } = useTranslation()
  const language = useUIStore((state) => state.language)

  return (
    <div className="mx-auto max-w-3xl pb-8">
      <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
      {language !== UiLanguage.en && (
        <p className="mt-3 text-sm text-muted-foreground">
          {t('legal.english_only')}
        </p>
      )}
      <div lang="en" dir="ltr" className="mt-6 space-y-8 text-start">
        <p className="text-sm text-muted-foreground">
          Last updated: {LEGAL_LAST_UPDATED}
        </p>
        {sections.map((section, sectionIndex) => (
          <section
            key={section.heading}
            aria-labelledby={`legal-section-${sectionIndex}`}
          >
            <h2
              id={`legal-section-${sectionIndex}`}
              className="text-xl font-semibold"
            >
              {section.heading}
            </h2>
            {section.paragraphs.map((paragraph) => (
              <p
                key={paragraph}
                className="mt-3 leading-7 text-muted-foreground"
              >
                {renderWithEmailLink(paragraph)}
              </p>
            ))}
            {section.items && (
              <ul className="mt-3 list-disc space-y-2 ps-6 leading-7 text-muted-foreground">
                {section.items.map((item) => (
                  <li key={item}>{renderWithEmailLink(item)}</li>
                ))}
              </ul>
            )}
          </section>
        ))}
      </div>
    </div>
  )
}
