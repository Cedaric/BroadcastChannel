import { getEnv } from '../lib/env'

export async function GET(Astro) {
  const noIndex = getEnv(import.meta.env, Astro, 'NO_INDEX') === 'true' || getEnv(import.meta.env, Astro, 'NOINDEX') === 'true'
  const siteUrl = Astro.url.origin

  const content = noIndex
    ? `User-agent: *
Disallow: /
`
    : `User-agent: *
Allow: /

Sitemap: ${siteUrl}/sitemap-index.xml
`

  return new Response(content, {
    headers: {
      'Content-Type': 'text/plain',
    },
  })
}
