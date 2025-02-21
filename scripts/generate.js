import { writeFile, mkdir } from 'fs/promises'
import { resolve, dirname } from 'path'

const getHtml = (url) => `<!DOCTYPE HTML>
<html lang="en-US">
    <head>
        <meta charset="UTF-8">
        <meta http-equiv="refresh" content="0; url=${url}">
        <script type="text/javascript">
            window.location.href = "${url}"
        </script>
        <title>Page Redirection</title>
    </head>
    <body>
        <!-- Note: don't tell people to \`click\` the link, just tell them that it is a link. -->
        If you are not redirected automatically, follow this <a href='${url}'>link to example</a>.
    </body>
</html>`

const targetDomain = 'https://locize.com'

const urlMap = {
  '/index.html': '/docs',
  '/whats-inside.html': '/docs/whats-inside',
  '/whats-inside/cdn-content-delivery-network': '/docs/cdn-content-delivery-network',
  '/whats-inside/tags': '/docs/tags',
  '/whats-inside/translation-memory': '/docs/translation-memory',
  '/whats-inside/glossary': '/docs/glossary',
  '/whats-inside/review-workflow': '/docs/review-workflow',
  '/whats-inside/history': '/docs/history',
  '/whats-inside/auto-machine-translation': '/docs/automatic-translation',
  '/whats-inside/user-management': '/docs/user-management',
  '/whats-inside/context': '/docs/context',
  '/the-different-views': '/docs/the-different-views',
  '/different-views/control-center': '/docs/control-center',
  '/different-views/global': '/docs/global',
  '/different-views/incontext': '/docs/incontext',
  '/different-views/focus': '/docs/focus',
  '/issues': '/docs/checks-issues',
  '/using-locize-as-translator': '/docs/using-locize-as-a-translator',
  '/integration/getting-started.html': '/docs/getting-started',
  '/integration/getting-started/create-a-user-account': '/docs/create-a-user-account',
  '/integration/getting-started/add-a-new-project': '/docs/add-a-new-project',
  '/integration/getting-started/add-content': '/docs/add-content',
  '/integration/api': '/docs/api',
  '/integration/webhook': '/docs/webhook',
  '/integration/slack': '/docs/slack',
  '/integration/microsoft-teams': '/docs/microsoft-teams',
  '/integration/github-repository-dispatch-event': '/docs/github-repository-dispatch-event',
  '/integration/cli': '/docs/cli',
  '/integration/github-action': '/docs/github-action',
  '/integration/supported-i18n-formats': '/docs/i18n-formats',
  '/integration/supported-formats': '/docs/file-formats',
  '/guides-tips-and-tricks/unused-translations': '/docs/find-unused-translations',
  '/guides-tips-and-tricks/how-to-search': '/docs/how-to-search',
  '/guides-tips-and-tricks/keeping-track-of-new-translations': '/docs/keeping-track-of-new-translations',
  '/guides-tips-and-tricks/working-with-translators': '/docs/working-with-translators',
  '/guides-tips-and-tricks/migrating-an-i18next-project': '/docs/migrating-an-i18next-project',
  '/guides-tips-and-tricks/migrating-from.html': '/docs/migrating-from',
  '/guides-tips-and-tricks/migrating-from/migrating-from-phrase-to-locize': '/docs/migrating-from-phrase-to-locize',
  '/guides-tips-and-tricks/migrating-from/migrating-from-transifex-to-locize': '/docs/migrating-from-transifex-to-locize',
  '/guides-tips-and-tricks/going-production': '/docs/going-to-production',
  '/more/incontext-editor.html': '/docs/incontext-editor',
  '/more/incontext-editor/migrating-from-the-old-incontext-editor': '/docs/migrating-from-the-old-incontext-editor',
  '/more/figma-plugin': '/docs/figma-plugin',
  '/more/versioning': '/docs/versioning',
  '/more/namespaces': '/docs/namespaces',
  '/more/multi-tenant': '/docs/multi-tenant',
  '/more/caching.html': '/docs/caching',
  '/more/caching/alternative-caching': '/docs/alternative-caching-with-i18next',
  '/more/backend-fallback': '/docs/backend-fallback',
  '/more/latency-optimization-tips-for-optimal-performance': '/docs/latency-optimization-tips-for-optimal-performance',
  '/more/2-factor-authentication.html': '/docs/2-factor-authentication',
  '/more/2-factor-authentication/2-factor-authentication-with-totp': '/docs/2-factor-authentication-with-totp',
  '/more/2-factor-authentication/2-factor-authentication-with-webauthn': '/docs/2-factor-authentication-with-webauthn',
  '/more/2-factor-authentication/2-factor-authentication-with-yubikey': '/docs/2-factor-authentication-with-yubikey',
  '/more/convince-your-boss-letter': '/docs/convince-your-boss-letter',
  '/more/general-questions.html': '/docs/general-questions',
  '/more/general-questions/which-integration-option-should-i-use': '/docs/which-integration-option-should-i-use',
  '/more/general-questions/do-i-have-to-use-the-locize-cdn-or-can-i-host-bundle-the-translations-directly': '/docs/do-i-have-to-use-the-locize-cdn-or-can-i-host-bundle-the-translations-directly',
  '/more/general-questions/how-is-locize-different-from-the-alternatives': '/docs/how-is-locize-different-from-the-alternatives',
  '/more/general-questions/why-do-i-get-the-passed-json-is-nested-too-deeply.-when-consuming-the-api': '/docs/why-do-i-get-the-passed-json-is-nested-too-deeply-when-consuming-the-api',
  '/more/general-questions/is-locize-only-for-developers-and-translators-or-is-project-management-within-the-process-too': '/docs/is-locize-only-for-developers-and-translators-or-is-project-management-within-the-process-too',
  '/more/general-questions/what-is-the-regular-way-to-update-the-translation-memory': '/docs/what-is-the-regular-way-to-update-the-translation-memory',
  '/more/general-questions/is-there-any-visibility-on-projects-level-of-completion-that-shows-how-translators-are-progressing': '/docs/is-there-any-visibility-on-projects-level-of-completion-that-shows-how-translators-are-progressing',
  '/more/general-questions/why-is-my-namespace-suddenly-a-flat-json': '/docs/why-is-my-namespace-suddenly-a-flat-json',
  '/more/general-questions/how-to-change-the-publish-format': '/docs/how-to-change-the-publish-format',
  '/more/general-questions/why-does-my-namespace-contain-an-array-with-a-lot-of-null-items': '/docs/why-does-my-namespace-contain-an-array-with-a-lot-of-null-items',
  '/more/general-questions/why-is-the-pricing-so-complicated': '/docs/why-is-the-pricing-so-complicated',
  '/more/general-questions/how-to-change-credit-card-or-billing-information': '/docs/how-to-change-credit-card-or-billing-information-or-download-the-invoices',
  '/more/general-questions/how-to-import-translations-from-a-file': '/docs/how-to-import-translations-from-a-file',
  '/more/general-questions/how-to-manually-publish-a-specific-version': '/docs/how-to-manually-publish-a-specific-version',
  '/more/general-questions/how-to-delete-or-rename-a-namespace': '/docs/how-to-delete-or-rename-a-namespace',
  '/more/general-questions/why-is-there-such-a-high-download-amount': '/docs/why-is-there-such-a-high-download-amount',
  '/more/general-questions/where-do-i-find-the-namespace-backups': '/docs/where-do-i-find-the-namespace-backups',
  '/more/general-questions/how-can-a-segment-key-be-copied-moved-or-renamed': '/docs/how-can-a-segment-key-be-copied-moved-or-renamed',
  '/more/general-questions/why-a-new-namespace-is-created-when-i-upload-a-translation-file': '/docs/why-a-new-namespace-is-created-when-i-upload-a-translation-file',
  '/more/general-questions/i-want-to-use-our-cdn-but-would-like-to-have-a-fallback-that-uses-local-bundled-translations': '/docs/i-want-to-use-the-locize-cdn-but-would-like-to-have-a-fallback-that-uses-local-bundled-translations',
  '/more/general-questions/is-it-possible-to-integrate-multiple-projects-in-the-same-app-website': '/docs/is-it-possible-to-integrate-multiple-projects-in-the-same-app-website',
  '/more/general-questions/why-do-i-see-strange-new-keys-marked-as-one-few-many-others': '/docs/why-do-i-see-strange-new-keys-marked-as-one-few-many-others',
  '/more/general-questions/how-do-i-open-and-edit-json-files': '/docs/how-do-i-open-and-edit-json-files',
  '/more/general-questions/i18n-vs.-i18next': '/docs/i18n-vs-i18next',
  '/more/general-questions/i18next-vs.-locize': '/docs/i18next-vs-locize',
  '/more/general-questions/word-counter': '/docs/word-counter',
  '/more/general-questions/how-to-style-text-within-locize': '/docs/how-to-style-text-within-locize',
  '/more/general-questions/what-do-i-have-to-consider-if-my-translation-texts-may-contain-confidential-information': '/docs/how-to-style-text-within-locize',
  '/more/general-questions/how-to-translate-a-file-and-download-the-results': '/docs/how-to-translate-a-file-and-download-the-results'
}

Object.keys(urlMap).forEach(async (oldUl) => {
  const oldPath = `${oldUl}${oldUl.endsWith('.html') ? '' : '.html'}`
  const passedPath = dirname(resolve(`.${oldPath}`))
  await mkdir(passedPath, { recursive: true })
  await writeFile(`.${oldPath}`, getHtml(`${targetDomain}${urlMap[oldUl]}`))
})
