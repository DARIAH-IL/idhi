export const CONTACT_EMAIL = 'help@idh-index.org'

export const LEGAL_LAST_UPDATED = 'October 4, 2026'

export type LegalSection = {
  heading: string
  paragraphs: string[]
  items?: string[]
}

export const privacyPolicySections: LegalSection[] = [
  {
    heading: 'About this policy',
    paragraphs: [
      'This privacy policy explains how the Israeli Digital Humanities Index (IDHI), developed as part of DARIAH-IL, handles information when you browse the index at idh-index.org, use its API or MCP server, or contribute to it as a registered editor.',
    ],
  },
  {
    heading: 'Public information curated by the community',
    paragraphs: [
      'IDHI is a directory of digital humanities activity in Israel. It contains records about people, organizations, projects, publications, datasets, tools, services, events and training materials. These records are compiled and curated by members of the community from information that is already publicly available, such as institutional web pages, published works, project websites and public registries like ORCID, ROR and Crossref.',
      'Records about people are limited to professional, publicly available information, such as names, affiliations, research interests, public identifiers and links to public profiles. IDHI does not intend to publish private or sensitive personal information.',
    ],
  },
  {
    heading: 'No cookies and no tracking',
    paragraphs: [
      'IDHI does not use cookies. It does not use analytics, advertising, tracking pixels, fingerprinting or any other tracking technology, and it does not build profiles of visitors.',
      'The site uses your browser’s local storage and session storage only to remember choices made in the interface, such as your language preference and your most recent search, and to keep registered editors signed in. This information stays in your browser and can be removed at any time by clearing your browser’s site data.',
    ],
  },
  {
    heading: 'Information we process',
    paragraphs: [
      'Depending on how you use IDHI, we process the following information:',
    ],
    items: [
      'Public records: the community-curated information published in the index, as described above.',
      'Editor accounts: if you are invited to contribute, we store your email address, your account permissions and, if you choose to use them, passkey credentials, so that you can sign in and edit the index.',
      'Edit history: changes to records are stored together with the account that made them and the time they were made, to maintain the quality and accountability of the index.',
      'Technical data: like any website, our hosting infrastructure receives technical information such as IP addresses and request details when pages are loaded. This information is used only to deliver the service and protect it against abuse, and is not used to identify or track visitors.',
    ],
  },
  {
    heading: 'How information is used and shared',
    paragraphs: [
      'Information in the index is used to make digital humanities work in Israel discoverable and to connect people, institutions and resources. Public records are openly available through the website and the API, and may be shared with partner research infrastructures, such as the SSH Open Marketplace.',
      'Editor account information is used only to operate the service. We do not sell, rent or share personal information for marketing purposes.',
    ],
  },
  {
    heading: 'Removal, correction and redaction requests',
    paragraphs: [
      `If a record in IDHI mentions you and you would like it corrected, redacted or removed, write to us at ${CONTACT_EMAIL}. Please include a link to the relevant record and describe the change you are requesting. We will review every request and respond within a reasonable time.`,
      'You may also contact us at the same address to ask what information the index holds about you, or about your editor account.',
    ],
  },
  {
    heading: 'Retention and security',
    paragraphs: [
      'Public records are kept for as long as they remain relevant to the index, or until a removal request is accepted. Editor account information is kept for as long as the account is active. We use reasonable technical and organizational measures to protect the information we hold.',
    ],
  },
  {
    heading: 'Changes to this policy',
    paragraphs: [
      'We may update this policy from time to time. The latest version will always be available on this page, together with the date of its last update.',
    ],
  },
  {
    heading: 'Contact',
    paragraphs: [
      `For any questions or concerns about privacy, please write to ${CONTACT_EMAIL}.`,
    ],
  },
]

export const termsOfUseSections: LegalSection[] = [
  {
    heading: 'Acceptance of these terms',
    paragraphs: [
      'These terms of use apply to the Israeli Digital Humanities Index (IDHI), developed as part of DARIAH-IL, including the website at idh-index.org, its API and its MCP server. By accessing or using IDHI, you agree to these terms. If you do not agree, please do not use the service.',
    ],
  },
  {
    heading: 'About the content',
    paragraphs: [
      'IDHI publishes information about digital humanities people, organizations, projects and resources in Israel. This information is collected from publicly available sources and is contributed and curated by members of the community. It is provided for information and research purposes only.',
      'While we aim to keep the index accurate and up to date, we cannot guarantee that every record is complete, current or free of errors. Records do not necessarily reflect the views of IDHI or DARIAH-IL, and inclusion in the index does not imply endorsement.',
    ],
  },
  {
    heading: 'Using the index',
    paragraphs: [
      'You may browse, search and reuse the information published in IDHI, including through the API and MCP server, provided that you do so lawfully and responsibly. When using IDHI, you agree not to:',
    ],
    items: [
      'use the service in a way that disrupts, overloads or impairs it, or attempt to gain unauthorized access to it;',
      'use information about people in the index for unsolicited marketing, harassment or any purpose unrelated to research, collaboration or public interest;',
      'misrepresent the source of information obtained from the index.',
    ],
  },
  {
    heading: 'Contributions',
    paragraphs: [
      'Editing the index is available to invited contributors. By contributing, you confirm that the information you add is accurate to the best of your knowledge, is based on publicly available sources, and does not infringe the rights of others. Contributions should include only professional, publicly available information about people, and never private or sensitive personal information.',
      'Contributions are reviewed and may be edited, merged or removed to maintain the quality of the index. Contributed information becomes part of the public index and may be shared with partner research infrastructures.',
    ],
  },
  {
    heading: 'External links and sources',
    paragraphs: [
      'IDHI links to external websites and resources that are not under our control. We are not responsible for their content, availability or privacy practices.',
    ],
  },
  {
    heading: 'Disclaimer and limitation of liability',
    paragraphs: [
      'IDHI is provided “as is” and “as available”, without warranties of any kind. To the extent permitted by law, IDHI, DARIAH-IL and their partners are not liable for any damage arising from the use of, or inability to use, the service or the information it contains.',
    ],
  },
  {
    heading: 'Reporting concerns',
    paragraphs: [
      `If you believe that information in the index is inaccurate, infringes your rights, or mentions you and should be corrected, redacted or removed, please write to ${CONTACT_EMAIL}. We will review every request and respond within a reasonable time.`,
    ],
  },
  {
    heading: 'Privacy',
    paragraphs: [
      'IDHI uses no cookies and no tracking of any kind. For more details, please see our privacy policy.',
    ],
  },
  {
    heading: 'Changes to these terms',
    paragraphs: [
      'We may update these terms from time to time. The latest version will always be available on this page, together with the date of its last update. Continued use of IDHI after a change means you accept the updated terms.',
    ],
  },
  {
    heading: 'Contact',
    paragraphs: [
      `For any questions or concerns about these terms, please write to ${CONTACT_EMAIL}.`,
    ],
  },
]
