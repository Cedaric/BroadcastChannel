import rss from '@astrojs/rss'
import sanitizeHtml from 'sanitize-html'
import { getEnv } from '../lib/env'
import { getChannelInfo } from '../lib/telegram'

export async function GET(Astro) {
  const staticApiUrl = getEnv(import.meta.env, Astro, 'STATIC_API_URL')
  const workerBinding = Astro.locals?.runtime?.env?.WORKER_BINDING

  if ((staticApiUrl || workerBinding) && !Astro.url.searchParams.get('tag')) { // We don't have static tagged RSS
    const staticFetch = workerBinding && typeof workerBinding.fetch === 'function' ? workerBinding.fetch.bind(workerBinding) : fetch
    const staticBaseUrl = workerBinding ? 'http://worker' : staticApiUrl
    const res = await staticFetch(`${staticBaseUrl}/rss.xml`)
    if (res.ok) {
      return new Response(await res.text(), {
        headers: { 'Content-Type': 'application/xml', 'Cache-Control': 'public, max-age=3600' },
      })
    }
  }

  const { SITE_URL } = Astro.locals
  const tag = Astro.url.searchParams.get('tag')
  const channel = await getChannelInfo(Astro, {
    q: tag ? `#${tag}` : '',
  })
  const posts = channel.posts || []

  const request = Astro.request
  const url = new URL(request.url)
  url.pathname = SITE_URL
  url.search = ''

  const response = await rss({
    title: `${tag ? `${tag} | ` : ''}${channel.title}`,
    description: channel.description,
    site: url.origin,
    trailingSlash: false,
    stylesheet: getEnv(import.meta.env, Astro, 'RSS_BEAUTIFY') ? '/rss.xsl' : undefined,
    items: posts.map(item => ({
      link: `posts/${item.id}`,
      title: item.title,
      description: item.description,
      pubDate: new Date(item.datetime),
      content: sanitizeHtml(item.content, {
        allowedTags: sanitizeHtml.defaults.allowedTags.concat(['img', 'video', 'audio']),
        allowedAttributes: {
          ...sanitizeHtml.defaults.allowedAttributes,
          video: ['src', 'width', 'height', 'poster'],
          audio: ['src', 'controls'],
          img: ['src', 'srcset', 'alt', 'title', 'width', 'height', 'loading', 'class'],
        },
        exclusiveFilter(frame) {
          return frame.tag === 'img' && frame.attribs?.class?.includes('modal-img')
        },
      }),
    })),
  })

  response.headers.set('Content-Type', 'text/xml')
  response.headers.set('Cache-Control', 'public, max-age=3600')

  return response
}
