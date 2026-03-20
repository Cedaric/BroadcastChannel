import * as cheerio from 'cheerio'
import flourite from 'flourite'
import { $fetch } from 'ofetch'
import prism from './prism-node.js'

// Normalize emoji variants (e.g., heart variants)
function normalizeEmoji(emoji) {
  const emojiMap = {
    '\u2764': '\u2764\uFE0F',
    '\u263A': '\u263A\uFE0F',
    '\u2639': '\u2639\uFE0F',
    '\u2665': '\u2764\uFE0F',
  }
  return emojiMap[emoji] || emoji
}

function getCustomEmojiImage(emojiId, staticProxy = '') {
  if (!emojiId)
    return null
  const imageUrl = `https://t.me/i/emoji/${emojiId}.webp`
  return `${staticProxy}${imageUrl}`
}

async function hydrateTgEmoji($, content, { staticProxy } = {}) {
  const emojiNodes = $(content).find('tg-emoji')?.toArray() ?? []
  if (!emojiNodes.length)
    return

  await Promise.all(emojiNodes.map((emojiEl) => {
    const emojiId = $(emojiEl).attr('emoji-id')
    if (!emojiId)
      return

    const imageUrl = getCustomEmojiImage(emojiId, staticProxy)
    if (imageUrl) {
      const imageMarkup = `<img class="tg-emoji" src="${imageUrl}" alt="" loading="lazy" />`
      $(emojiEl).replaceWith(imageMarkup)
    }
  }))
}

function getVideoStickers($, item, { staticProxy, index }) {
  return $(item).find('.js-videosticker_video')?.map((_index, video) => {
    const url = $(video)?.attr('src')
    const imgurl = $(video).find('img')?.attr('src')
    return `
    <div style="background-image: none; width: 256px;">
      <video src="${staticProxy + url}" width="100%" height="100%" alt="Video Sticker" preload muted autoplay loop playsinline disablepictureinpicture >
        <img class="sticker" src="${staticProxy + imgurl}" alt="Video Sticker" loading="${index > 15 ? 'eager' : 'lazy'}" />
      </video>
    </div>
    `
  })?.get()?.join('')
}

function getImageStickers($, item, { staticProxy, index }) {
  return $(item).find('.tgme_widget_message_sticker')?.map((_index, image) => {
    const url = $(image)?.attr('data-webp')
    return `<img class="sticker" src="${staticProxy + url}" style="width: 256px;" alt="Sticker" loading="${index > 15 ? 'eager' : 'lazy'}" />`
  })?.get()?.join('')
}

function getImages($, item, { staticProxy, id, index, title }) {
  const images = $(item).find('.tgme_widget_message_photo_wrap')?.map((_index, photo) => {
    const url = $(photo).attr('style').match(/url\(["'](.*?)["']/)?.[1]
    const popoverId = `modal-${id}-${_index}`
    return `
      <button class="image-preview-button image-preview-wrap" popovertarget="${popoverId}" popovertargetaction="show">
        <img src="${staticProxy + url}" alt="${title}" loading="${index > 15 ? 'eager' : 'lazy'}" />
      </button>
      <button class="image-preview-button modal" id="${popoverId}" popovertarget="${popoverId}" popovertargetaction="hide" popover>
        <img class="modal-img" src="${staticProxy + url}" alt="${title}" loading="lazy" />
      </button>
    `
  })?.get()
  return images.length ? `<div class="image-list-container ${images.length % 2 === 0 ? 'image-list-even' : 'image-list-odd'}">${images?.join('')}</div>` : ''
}

function getVideo($, item, { staticProxy, index }) {
  const video = $(item).find('.tgme_widget_message_video_wrap video')
  video?.attr('src', staticProxy + video?.attr('src'))
    ?.attr('controls', true)
    ?.attr('preload', index > 15 ? 'auto' : 'metadata')
    ?.attr('playsinline', true)
    .attr('webkit-playsinline', true)

  const roundVideo = $(item).find('.tgme_widget_message_roundvideo_wrap video')
  roundVideo?.attr('src', staticProxy + roundVideo?.attr('src'))
    ?.attr('controls', true)
    ?.attr('preload', index > 15 ? 'auto' : 'metadata')
    ?.attr('playsinline', true)
    .attr('webkit-playsinline', true)
  return $.html(video) + $.html(roundVideo)
}

function getAudio($, item, { staticProxy }) {
  const audio = $(item).find('.tgme_widget_message_voice')
  audio?.attr('src', staticProxy + audio?.attr('src'))
    ?.attr('controls', true)
  return $.html(audio)
}

function getLinkPreview($, item, { staticProxy, index }) {
  const link = $(item).find('.tgme_widget_message_link_preview')
  const title = $(item).find('.link_preview_title')?.text() || $(item).find('.link_preview_site_name')?.text()
  const description = $(item).find('.link_preview_description')?.text()

  link?.attr('target', '_blank').attr('rel', 'noopener').attr('title', description)

  const image = $(item).find('.link_preview_image')
  const src = image?.attr('style')?.match(/url\(["'](.*?)["']/i)?.[1]
  const imageSrc = src ? staticProxy + src : ''
  image?.replaceWith(`<img class="link_preview_image" alt="${title}" src="${imageSrc}" loading="${index > 15 ? 'eager' : 'lazy'}" />`)
  return $.html(link)
}

function getReply($, item, { channel }) {
  const reply = $(item).find('.tgme_widget_message_reply')
  reply?.wrapInner('<small></small>')?.wrapInner('<blockquote></blockquote>')

  const href = reply?.attr('href')
  if (href) {
    const url = new URL(href)
    reply?.attr('href', `${url.pathname}`.replace(new RegExp(`/${channel}/`, 'i'), '/posts/'))
  }

  return $.html(reply)
}

async function modifyHTMLContent($, content, { index, staticProxy } = {}) {
  await hydrateTgEmoji($, content, { staticProxy })
  $(content).find('.emoji')?.removeAttr('style')
  $(content).find('a')?.each((_index, a) => {
    $(a)?.attr('title', $(a)?.text())?.removeAttr('onclick')
  })
  // Transform Telegram expandable quotes
  $(content).find('blockquote[expandable]')?.each((_index, bq) => {
    const innerHTML = $(bq).html()
    const id = `expand-${index}-${_index}`
    const expandable = `<div class="tg-expandable">
      <input type="checkbox" id="${id}" class="tg-expandable__checkbox">
      <div class="tg-expandable__content">${innerHTML}</div>
      <label for="${id}" class="tg-expandable__toggle" aria-label="Expand/Collapse"></label>
    </div>`
    $(bq).replaceWith(expandable)
  })
  $(content).find('tg-spoiler')?.each((_index, spoiler) => {
    const id = `spoiler-${index}-${_index}`
    $(spoiler)?.attr('id', id)?.wrap('<label class="spoiler-button"></label>')?.before(`<input type="checkbox" />`)
  })
  $(content).find('pre').each((_index, pre) => {
    try {
      $(pre).find('br')?.replaceWith('\n')

      const code = $(pre).text()
      const language = flourite(code, { shiki: true, noUnknown: true })?.language || 'text'
      const highlightedCode = prism.highlight(code, prism.languages[language], language)
      $(pre).html(`<code class="language-${language}">${highlightedCode}</code>`)
    }
    catch (error) {
      console.error(error)
    }
  })
  return content
}

function getReactions($, item, staticProxy) {
  const reactions = []
  const reactionNodes = $(item).find('.tgme_widget_message_reactions .tgme_reaction').toArray()

  for (const reaction of reactionNodes) {
    const isPaid = $(reaction).hasClass('tgme_reaction_paid')
    let emoji = ''
    let emojiId
    let emojiImage

    const standardEmoji = $(reaction).find('.emoji b')
    if (standardEmoji.length) {
      emoji = normalizeEmoji(standardEmoji.text().trim())
    }

    const tgEmoji = $(reaction).find('tg-emoji')
    if (tgEmoji.length && !emoji) {
      emojiId = tgEmoji.attr('emoji-id')
      if (emojiId) {
        const imageUrl = getCustomEmojiImage(emojiId, staticProxy)
        if (imageUrl) {
          emojiImage = imageUrl
        }
      }
    }

    if (isPaid && !emoji && !emojiImage) {
      emoji = '\u2B50'
    }

    const clone = $(reaction).clone()
    clone.find('.emoji, tg-emoji, i').remove()
    const count = clone.text().trim()

    if (count) {
      reactions.push({
        emoji,
        emojiId,
        emojiImage,
        count,
        isPaid,
      })
    }
  }

  return reactions
}

async function getPost($, item, { channel, staticProxy, index = 0, reactionsEnabled } = {}) {
  item = item ? $(item).find('.tgme_widget_message') : $('.tgme_widget_message')
  const content = $(item).find('.js-message_reply_text')?.length > 0
    ? await modifyHTMLContent($, $(item).find('.tgme_widget_message_text.js-message_text'), { index, staticProxy })
    : await modifyHTMLContent($, $(item).find('.tgme_widget_message_text'), { index, staticProxy })
  const title = content?.text()?.match(/^.*?(?=[。\n]|http\S)/g)?.[0] ?? content?.text() ?? ''
  const id = $(item).attr('data-post')?.replace(new RegExp(`${channel}/`, 'i'), '')

  const tags = $(content).find('a[href^="?q="]')?.each((_index, a) => {
    $(a)?.attr('href', `/search/${encodeURIComponent($(a)?.text())}`)
  })?.map((_index, a) => $(a)?.text()?.replace('#', ''))?.get()

  return {
    id,
    title,
    type: $(item).attr('class')?.includes('service_message') ? 'service' : 'text',
    datetime: $(item).find('.tgme_widget_message_date time')?.attr('datetime'),
    tags,
    text: content?.text(),
    content: [
      getReply($, item, { channel }),
      getImages($, item, { staticProxy, id, index, title }),
      getVideo($, item, { staticProxy, id, index, title }),
      getAudio($, item, { staticProxy, id, index, title }),
      content?.html(),
      getImageStickers($, item, { staticProxy, index }),
      getVideoStickers($, item, { staticProxy, index }),
      // $(item).find('.tgme_widget_message_sticker_wrap')?.html(),
      $(item).find('.tgme_widget_message_poll')?.html(),
      $.html($(item).find('.tgme_widget_message_document_wrap')),
      $.html($(item).find('.tgme_widget_message_video_player.not_supported')),
      $.html($(item).find('.tgme_widget_message_location_wrap')),
      getLinkPreview($, item, { staticProxy, index }),
    ].filter(Boolean).join('').replace(/(url\(["'])((https?:)?\/\/)/g, (match, p1, p2, _p3) => {
      if (p2 === '//') {
        p2 = 'https://'
      }
      if (p2?.startsWith('t.me')) {
        return false
      }
      return `${p1}${staticProxy}${p2}`
    }),
    reactions: reactionsEnabled ? getReactions($, item, staticProxy) : [],
  }
}

export async function fetchTelegramPosts({ host = 't.me', channel, staticProxy = '', reactionsEnabled = false, before = '' } = {}) {
  const url = `https://${host}/s/${channel}`
  console.info(`[Parser] Fetching ${url} ?before=${before || 'latest'}`)

  const html = await $fetch(url, {
    query: {
      before: before || undefined,
    },
    retry: 3,
    retryDelay: 500,
  })

  const $ = cheerio.load(html, {}, false)
  const posts = (await Promise.all(
    $('.tgme_channel_history  .tgme_widget_message_wrap')?.map((index, item) => {
      // index is passed to get Images/Video lazyloading offsets, we can just use 0
      return getPost($, item, { channel, staticProxy, index: 0, reactionsEnabled })
    })?.get() ?? [],
  ))?.filter(post => ['text'].includes(post.type) && post.id && post.content)

  // Telegram returns posts in chronological order (oldest at top of HTML to newest at bottom)
  // We reverse it to process Newest -> Oldest
  return posts.reverse()
}

export async function fetchChannelMeta({ host = 't.me', channel, staticProxy = '' } = {}) {
  const url = `https://${host}/s/${channel}`
  const html = await $fetch(url, { retry: 3 })
  const $ = cheerio.load(html, {}, false)

  return {
    title: $('.tgme_channel_info_header_title')?.text() || channel,
    description: $('.tgme_channel_info_description')?.text() || '',
    avatar: $('.tgme_page_photo_image img')?.attr('src') ? staticProxy + $('.tgme_page_photo_image img')?.attr('src') : '',
  }
}
