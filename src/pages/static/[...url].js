const targetWhitelist = [
  't.me',
  'telegram.org',
  'telegram.me',
  'telegram.dog',
  'cdn-telegram.org',
  'telesco.pe',
  'yandex.ru',
]

export async function GET({ request, params, url, locals }) {
  const workerBinding = locals?.runtime?.env?.WORKER_BINDING

  try {
    const rawTarget = params.url + url.search
    const normalizedTarget = rawTarget.startsWith('//') ? `https:${rawTarget}` : rawTarget
    const target = new URL(normalizedTarget)
    if (!targetWhitelist.some(domain => target.hostname.endsWith(domain))) {
      return Response.redirect(target.toString(), 302)
    }
    const response = await fetch(target.toString(), request)
    return new Response(response.body, response)
  }
  catch (error) {
    if (workerBinding) {
      try {
        const workerUrl = new URL(`/static/${params.url}${url.search}`, request.url).toString()
        const workerReq = new Request(workerUrl, request)
        const bindingRes = await workerBinding.fetch(workerReq)
        
        // Proxy the response directly, including 404s, to provide accurate asset responses
        return new Response(bindingRes.body, bindingRes)
      } catch (err) {
        return new Response(`WorkerBinding Error: ${err.message}`, { status: 500 })
      }
    }
    return new Response(error.message, { status: 500 })
  }
}
